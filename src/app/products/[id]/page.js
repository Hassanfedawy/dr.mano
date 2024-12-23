'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';

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
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: id,
          quantity,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) return <div> <LoadingSpinner /> </div>;
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
          <p className="text-2xl font-semibold text-[#6A4E3C] hover:text-[#4E3B2D] transition-colors">${product.price}</p>
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
                <span className="font-medium">Category:</span> {product.category}
              </div>
              <div>
                <span className="font-medium">Stock:</span> {product.stock}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
