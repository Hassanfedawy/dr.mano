'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import useCartStore from '@/store/cartStore';

export default function Cart() {
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return <CartInner />;
}

function CartInner() {
  const router = useRouter();
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { items, updateItemQuantity, removeItem, getTotal, debugCart } = useCartStore();

  // Ensure the store is hydrated before rendering
  useEffect(() => {
    console.log('[Cart Page] Initializing cart...');

    // Set a timeout to prevent infinite loading if hydration fails
    const timeoutId = setTimeout(() => {
      console.log('[Cart Page] Hydration timeout - forcing ready state');
      setIsStoreReady(true);
      setIsLoading(false);
    }, 3000); // 3 second timeout

    // Function to validate cart items and clean up any invalid ones
    const validateCartItems = () => {
      const currentItems = useCartStore.getState().items;

      // Check for invalid items
      const hasInvalidItems = currentItems.some(
        item => !item || !item.product || !item.product.id
      );

      if (hasInvalidItems) {
        console.warn('[Cart Page] Found invalid items in cart, cleaning up...');

        // Filter out invalid items
        const validItems = currentItems.filter(
          item => item && item.product && item.product.id
        );

        // Update the store with only valid items
        useCartStore.setState({ items: validItems });
        console.log('[Cart Page] Cart cleaned up, valid items:', validItems);
      }
    };

    const checkHydration = () => {
      const store = useCartStore.persist.hasHydrated();
      if (store) {
        console.log('[Cart Page] Store is hydrated');
        setIsStoreReady(true);

        // Validate and debug the cart state
        setTimeout(() => {
          validateCartItems();
          debugCart();
          setIsLoading(false);
        }, 100);

        clearTimeout(timeoutId);
      } else {
        console.log('[Cart Page] Store not yet hydrated, setting up listener');
        const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
          console.log('[Cart Page] Store finished hydration');
          setIsStoreReady(true);

          // Validate and debug the cart state
          setTimeout(() => {
            validateCartItems();
            debugCart();
            setIsLoading(false);
          }, 100);

          clearTimeout(timeoutId);
        });

        // Cleanup subscription
        return () => {
          unsubFinishHydration();
          clearTimeout(timeoutId);
        };
      }
    };

    checkHydration();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [debugCart]);

  const handleQuantityChange = (productId, newQuantity) => {
    updateItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeItem(productId);
  };

  // Show loading spinner while the store is hydrating
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner />
        <p className="mt-4 text-brown">Loading your cart...</p>
        <button
          onClick={() => setIsLoading(false)}
          className="mt-2 px-4 py-2 bg-brown text-white rounded-md hover:bg-brown-dark"
        >
          Continue Anyway
        </button>
      </div>
    );
  }

  if (!isStoreReady) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner />
        <p className="mt-4 text-brown">Preparing cart functionality...</p>
        <button
          onClick={() => setIsStoreReady(true)}
          className="mt-2 px-4 py-2 bg-brown text-white rounded-md hover:bg-brown-dark"
        >
          Continue Anyway
        </button>
      </div>
    );
  }

  console.log('[Cart Page] Rendering with items:', items);

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add some items to your cart to get started"
        actionLink="/products/category/hair-care"
        actionText="Browse Products"
      />
    );
  }

  // Add a try-catch block around the rendering to catch any unexpected errors
  try {
    // Validate items array before rendering
    const validItems = items.filter(item => item && item.product && item.product.id);

    // If items array changed after filtering, update the store
    if (validItems.length !== items.length) {
      console.warn('[Cart Page] Found invalid items during render, updating store...');
      useCartStore.setState({ items: validItems });
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-primary mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {validItems.map((item, index) => {
              try {
                return (
                  <div key={item.product.id} className="flex gap-4 border-b py-4 items-center">
                    <div className="relative w-24 h-24">
                      <Image
                        src={item.product.images || '/Images/placeholder.jpg'}
                        alt={item.product.name || 'Product'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-semibold text-xl">{item.product.name || 'Unknown Product'}</h3>
                      <p className="text-gray-600 text-sm">
                        {typeof item.product.price === 'number'
                          ? `${item.product.price.toFixed(2)} جنيه`
                          : 'Price not available'}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 border rounded-lg hover:bg-gray-200"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 border rounded-lg hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                );
              } catch (itemError) {
                console.error(`[Cart Page] Error rendering item at index ${index}:`, itemError);
                // Remove the problematic item from the cart
                setTimeout(() => handleRemoveItem(item?.product?.id), 0);
                return (
                  <div key={`error-item-${index}`} className="flex gap-4 border-b py-4 items-center text-red-500">
                    Error displaying this item. It has been removed from your cart.
                  </div>
                );
              }
            })}

            {validItems.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your cart?')) {
                      useCartStore.getState().clearCart();
                    }
                  }}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg h-fit shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-brown">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Subtotal</span>
                <span className="text-sm font-semibold">{getTotal().toFixed(2)} جنيه</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Shipping</span>
                <span className="text-sm font-semibold">Free</span>
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between">
                <span>Total</span>
                <span>{getTotal().toFixed(2)} جنيه</span>
              </div>
            </div>

            <button
              onClick={() => {
                // Debug cart before checkout
                console.log('[Cart Page] Proceeding to checkout with items:', validItems);
                router.push('/checkout');
              }}
              className="w-full bg-[#6A4E3C] text-white py-3 rounded-lg hover:bg-[#4E3B2D] transition-all duration-300"
              disabled={validItems.length === 0}
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/products/category/hair-care')}
                className="text-brown hover:text-brown-dark underline"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[Cart Page] Fatal error rendering cart:', error);

    // In case of a fatal error, clear the cart and show an error message
    setTimeout(() => {
      try {
        useCartStore.getState().clearCart();
      } catch (clearError) {
        console.error('[Cart Page] Error clearing cart:', clearError);
      }
    }, 0);

    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-semibold text-primary mb-4">Shopping Cart</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>There was an error loading your cart. Your cart has been reset.</p>
        </div>
        <button
          onClick={() => router.push('/products/category/hair-care')}
          className="px-4 py-2 bg-[#6A4E3C] text-white rounded-lg hover:bg-[#4E3B2D] transition-all duration-300"
        >
          Browse Products
        </button>
      </div>
    );
  }
}
