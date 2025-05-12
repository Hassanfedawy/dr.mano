'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import useCartStore from '@/store/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      console.log(`Fetching product with ID: ${id}`);
      const response = await fetch(`/api/products/${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Product data received:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const [isStoreReady, setIsStoreReady] = useState(false);
  const { addItem } = useCartStore();

  // Ensure the store is hydrated before rendering
  useEffect(() => {
    // Set a timeout to prevent infinite loading if hydration fails
    const timeoutId = setTimeout(() => {
      console.log('Store hydration timeout - forcing ready state');
      setIsStoreReady(true);
    }, 2000); // 2 second timeout

    const checkHydration = () => {
      const store = useCartStore.persist.hasHydrated();
      if (store) {
        console.log('Store is hydrated');
        setIsStoreReady(true);
        clearTimeout(timeoutId);
      } else {
        const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
          console.log('Store finished hydration');
          setIsStoreReady(true);
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
  }, []);

  const addToCart = () => {
    if (!product) return;

    setAddingToCart(true);

    // Check if store is ready
    if (!isStoreReady) {
      console.log('Cart store not ready yet, waiting...');
      // Show a waiting message
      const waitingNotification = document.createElement('div');
      waitingNotification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
      waitingNotification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Preparing cart...</span>
        </div>
      `;
      document.body.appendChild(waitingNotification);

      // Try again after a short delay
      setTimeout(() => {
        document.body.removeChild(waitingNotification);
        // Force store to be ready
        setIsStoreReady(true);
        // Try adding to cart again
        try {
          addItem(product, quantity);
          showSuccessNotification();
        } catch (retryError) {
          console.error('Error adding product to cart on retry:', retryError);
          showErrorNotification();
        } finally {
          setAddingToCart(false);
        }
      }, 1000);
      return;
    }

    try {
      addItem(product, quantity);
      showSuccessNotification();
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showErrorNotification();
    } finally {
      setAddingToCart(false);
    }
  };

  // Helper function to show success notification
  const showSuccessNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>Product added to cart!</span>
      </div>
    `;
    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  // Helper function to show error notification
  const showErrorNotification = () => {
    const errorNotification = document.createElement('div');
    errorNotification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
    errorNotification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <span>Failed to add product to cart. Please try again.</span>
      </div>
    `;
    document.body.appendChild(errorNotification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
      errorNotification.style.opacity = '0';
      errorNotification.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        document.body.removeChild(errorNotification);
      }, 500);
    }, 3000);
  };

  // Only show loading spinner when product data is loading
  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">Error Loading Product</h2>
        <p>{error}</p>
        <button
          onClick={fetchProduct}
          className="mt-4 px-4 py-2 bg-[#6A4E3C] text-white rounded-md hover:bg-[#4E3B2D] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">Product Not Found</h2>
        <p>The product you're looking for could not be found.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-[#6A4E3C] text-white rounded-md hover:bg-[#4E3B2D] transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  // Wrap the rendering in a try-catch to handle any unexpected errors
  try {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg p-4 flex items-center justify-center">
            <div className="relative w-full" style={{ height: '400px' }}>
              <Image
                src={product.images || '/Images/placeholder.jpg'}
                alt={product.name || 'Product Image'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-contain rounded-lg"
                quality={90}
              />
            </div>
          </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#6A4E3C] hover:text-[#4E3B2D] transition-colors">{product.name}</h1>
          <div className="flex items-center space-x-3 my-3">
            <span className="text-2xl font-semibold text-[#6A4E3C]">{product.price.toFixed(2)} جنيه</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">{product.originalPrice.toFixed(2)} جنيه</span>
            )}
            {product.discountPercentage && (
              <span className="text-lg text-orange-500 font-medium">{product.discountPercentage}% OFF</span>
            )}
          </div>
          <p className="text-[#6A4E3C]">{product.subDescription}</p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#6A4E3C] hover:text-[#4E3B2D] transition-colors">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded text-[#6A4E3C] hover:bg-[#D9DADA] transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-20 text-center border rounded text-[#6A4E3C] hover:border-[#4E3B2D] transition-colors"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border rounded text-[#6A4E3C] hover:bg-[#D9DADA] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={addingToCart}
            className={`w-full py-3 rounded-lg transition-colors ${
              addingToCart
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#6A4E3C] text-white hover:bg-[#4E3B2D]'
            }`}
          >
            {addingToCart ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>

          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4 text-[#6A4E3C]">Product Description</h2>
            <p className="text-[#4E3B2D] leading-relaxed">
              {product.mainDescription}
            </p>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 text-[#6A4E3C] hover:text-[#4E3B2D] transition-colors">Product Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-[#6A4E3C]">
              <div>
                <span className="font-medium">Category:</span> {product.category ? product.category.name : 'Uncategorized'}
              </div>
              <div>
                <span className="font-medium">Stock:</span> {product.stock}
              </div>
              {product.link && (
                <div className="col-span-2 mt-2">
                  <span className="font-medium">Website: </span>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                  >
                    Visit Official Website
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (renderError) {
    console.error('Error rendering product details:', renderError);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Error Displaying Product</h2>
          <p>There was a problem displaying this product. Please try again later.</p>
          <p className="text-sm mt-2 text-red-500">{renderError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#6A4E3C] text-white rounded-md hover:bg-[#4E3B2D] transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
