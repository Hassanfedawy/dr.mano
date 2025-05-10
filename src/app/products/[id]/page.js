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
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      console.log(data)
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const [isStoreReady, setIsStoreReady] = useState(false);
  const { addItem } = useCartStore();

  // Ensure the store is hydrated before rendering
  useEffect(() => {
    const store = useCartStore.persist.hasHydrated();
    if (store) {
      setIsStoreReady(true);
    } else {
      const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
        setIsStoreReady(true);
      });

      // Cleanup subscription
      return () => {
        unsubFinishHydration();
      };
    }
  }, []);

  const addToCart = () => {
    if (product) {
      try {
        addItem(product, quantity);
        // Use a more user-friendly notification instead of an alert
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
      } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Failed to add product to cart. Please try again.');
      }
    }
  };

  if (loading || !isStoreReady) return <div> <LoadingSpinner /> </div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-96 w-full">
          <Image
            src={product.images}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
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
          <p className="text-[#6A4E3C]">{product.description}</p>

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
            className="w-full bg-[#6A4E3C] text-white py-3 rounded-lg hover:bg-[#4E3B2D] transition-colors"
          >
            Add to Cart
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
}
