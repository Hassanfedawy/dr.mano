'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useCartStore from '@/store/cartStore';

export default function CategoryPage() {
  const { category } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState(null);

  // Format category name for display
  const formatCategoryName = (category) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log(`Fetching products for category: ${category}, page: ${page}`);

      // Add a timeout to the fetch to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `/api/products?category=${category}&page=${page}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        setProducts([]);
        setTotalPages(1);
        return;
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (data && data.products && Array.isArray(data.products)) {
        console.log(`Found ${data.products.length} products`);
        setProducts(data.products);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        console.warn('Invalid response format:', data);
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      // Handle specific abort error differently
      if (error.name === 'AbortError') {
        console.error('Request timed out');
      } else {
        console.error('Error fetching products:', error);
      }
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
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
    }, 3000); // 3 second timeout

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

  const addToCart = (productId) => {
    setAddingToCart(productId);
    try {
      // Find the product in our products array
      const product = products.find(p => p.id === productId);

      if (!product) {
        console.error('Product not found with ID:', productId);
        throw new Error('Product not found');
      }

      console.log('Adding product to cart:', product);

      // Make a clean copy of the product to avoid any reference issues
      const productToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        mainDescription: product.mainDescription,
        subDescription: product.subDescription
      };

      // Add the product to the cart using Zustand store
      addItem(productToAdd, 1);

      // Debug the cart after adding
      setTimeout(() => {
        console.log('Cart after adding product:');
        useCartStore.getState().debugCart();
      }, 100);

      toast.success('Product added to cart!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
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
      });
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-charcoal mb-8 text-center">
        {formatCategoryName(category)}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <button
            onClick={() => setLoading(false)}
            className="ml-4 px-4 py-2 bg-brown text-white rounded-md hover:bg-brown-dark"
          >
            Cancel Loading
          </button>
        </div>
      ) : !isStoreReady ? (
        <div className="flex flex-col justify-center items-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-brown">Preparing cart functionality...</p>
          <button
            onClick={() => setIsStoreReady(true)}
            className="mt-2 px-4 py-2 bg-brown text-white rounded-md hover:bg-brown-dark"
          >
            Continue Anyway
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-brown-light">No products found in this category.</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-brown text-white rounded-md hover:bg-brown-dark"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-cream rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100"
              >
                <div className="flex flex-row">
                  {/* Product Image - Left Side */}
                  <div
                    className="relative h-[120px] w-[120px] sm:h-[150px] sm:w-[150px] cursor-pointer flex-shrink-0"
                    onClick={() => handleCardClick(product.id)}
                  >
                    <Image
                      src={product.images || '/Images/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info - Middle */}
                  <div
                    className="p-3 sm:p-4 flex-grow flex flex-col justify-center cursor-pointer overflow-hidden"
                    onClick={() => handleCardClick(product.id)}
                  >
                    <div>
                      <h2 className="text-base sm:text-lg font-medium text-charcoal mb-1 sm:mb-2 truncate">{product.name}</h2>
                      <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <span className="text-brown font-bold text-sm sm:text-base">{product.price.toFixed(2)} جنيه</span>
                        {product.originalPrice && (
                          <span className="text-gray-500 line-through text-xs sm:text-sm">{product.originalPrice.toFixed(2)} جنيه</span>
                        )}
                        {product.discountPercentage && (
                          <span className="text-orange-500 text-xs sm:text-sm font-medium">{product.discountPercentage}% OFF</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">{product.mainDescription}</p>
                    </div>
                  </div>

                  {/* Add to Cart Button - Right Side */}
                  <div className="p-2 sm:p-4 flex items-center justify-center w-[80px] sm:w-[100px] bg-gray-50 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      disabled={addingToCart === product.id}
                      className={`px-2 sm:px-3 py-2 sm:py-3 rounded-md text-xs sm:text-sm w-full ${
                        addingToCart === product.id
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-[#6A4E3C] text-white hover:bg-[#4E3B2D]'
                      } font-medium transition-colors`}
                    >
                      {addingToCart === product.id ? (
                        <div className="flex justify-center items-center">
                          <span className="animate-spin">✔</span>
                        </div>
                      ) : (
                        'Add to cart'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md ${
                page === 1
                  ? 'bg-beige-light text-brown-light cursor-not-allowed'
                  : 'bg-brown text-white hover:bg-brown-dark'
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-brown">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-md ${
                page === totalPages
                  ? 'bg-beige-light text-brown-light cursor-not-allowed'
                  : 'bg-brown text-white hover:bg-brown-dark'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}
