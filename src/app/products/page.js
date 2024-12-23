'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?page=${page}`);
      const data = await response.json();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  const addToCart = async (productId) => {
    setAddingToCart(productId);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      
      toast.success('Product added to cart!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="spinner-border animate-spin"></div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleCardClick(product.id)}
            className="cursor-pointer border rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <img
              src={product.images}
              alt={product.name}
              className="w-full h-48 object-cover transition-opacity hover:opacity-80"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-[#89796D]">{product.name}</h3>
              <p className="text-[#89796D]">${product.price}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product.id);
                }}
                disabled={addingToCart === product.id}
                className={`mt-2 w-full py-2 rounded ${addingToCart === product.id ? 'bg-gray-400' : 'bg-[#89796D]'} text-white hover:bg-[#4E3B2D] transition-all duration-300`}
              >
                {addingToCart === product.id ? (
                  <div className="flex justify-center items-center">
                    <span className="animate-spin">✔</span>
                  </div>
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded-full ${page === i + 1 ? 'bg-[#89796D] text-white' : 'bg-[#F0F2F4] hover:bg-[#89796D] hover:text-white transition-all duration-300'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
