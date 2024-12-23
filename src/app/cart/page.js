'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Cart() {
  return (
    <ProtectedRoute>
      <CartInner />
    </ProtectedRoute>
  );
}

function CartInner() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCart(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
  
      if (response.ok) {
        fetchCart(); // Refresh the cart
      } else {
        console.error('Failed to update quantity:', await response.json());
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotal = () => {
    return cart?.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0) || 0;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cart?.items?.length) {
    return (
      <EmptyState 
        title="Your cart is empty"
        description="Add some items to your cart to get started"
        actionLink="/products"
        actionText="Browse Products"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-primary mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b py-4 items-center">
              <div className="relative w-24 h-24">
                <Image
                  src={item.product.images}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="flex-grow">
                <h3 className="font-semibold text-xl">{item.product.name}</h3>
                <p className="text-gray-600 text-sm">${item.product.price}</p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 border rounded-lg hover:bg-gray-200"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 border rounded-lg hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg h-fit shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-primary">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Subtotal</span>
              <span className="text-sm font-semibold">${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Shipping</span>
              <span className="text-sm font-semibold">Free</span>
            </div>
            <div className="border-t pt-2 font-semibold flex justify-between">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-[#4E3B2D] text-white py-3 rounded-lg hover:bg-secondary transition-all duration-300"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
