'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import useCartStore from '@/store/cartStore';

export default function Checkout() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return <CheckoutInner isAuthenticated={!!session} session={session} />;
}

function CheckoutInner({ isAuthenticated, session }) {
  const router = useRouter();
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(isAuthenticated);
  const { items, getTotal, clearCart, debugCart } = useCartStore();

  // Ensure the store is hydrated before rendering
  useEffect(() => {
    console.log('[Checkout Page] Initializing checkout...');

    // Set a timeout to prevent infinite loading if hydration fails
    const timeoutId = setTimeout(() => {
      console.log('[Checkout Page] Hydration timeout - forcing ready state');
      setIsStoreReady(true);
      setIsLoading(false);
    }, 3000); // 3 second timeout

    const checkHydration = () => {
      const store = useCartStore.persist.hasHydrated();
      if (store) {
        console.log('[Checkout Page] Store is hydrated');
        setIsStoreReady(true);

        // Debug the cart state
        setTimeout(() => {
          console.log('[Checkout Page] Debugging cart state:');
          debugCart();
          setIsLoading(false);
        }, 100);

        clearTimeout(timeoutId);
      } else {
        console.log('[Checkout Page] Store not yet hydrated, setting up listener');
        const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
          console.log('[Checkout Page] Store finished hydration');
          setIsStoreReady(true);

          // Debug the cart state
          setTimeout(() => {
            console.log('[Checkout Page] Debugging cart state after hydration:');
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

  const [formData, setFormData] = useState({
    shippingAddress: '',
    city: '',
    phoneNumber: '',
    country: '',
    paymentMethod: 'cash',
    // Guest checkout fields
    guestEmail: '',
    guestName: '',
  });

  // Fetch user profile if authenticated
  useEffect(() => {
    if (isAuthenticated && session?.user?.id) {
      const fetchUserProfile = async () => {
        try {
          setIsLoadingProfile(true);
          const response = await fetch('/api/user/profile');

          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }

          const profileData = await response.json();
          setUserProfile(profileData);

          // Pre-fill form data with user profile information
          setFormData(prevData => ({
            ...prevData,
            shippingAddress: profileData.shippingAddress || '',
            phoneNumber: profileData.phoneNumber || '',
          }));

        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Could not load your saved information. Please enter your details manually.');
        } finally {
          setIsLoadingProfile(false);
        }
      };

      fetchUserProfile();
    }
  }, [isAuthenticated, session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    console.log('[Checkout Page] Starting form submission');

    try {
      // Validate guest checkout fields if not authenticated
      if (!isAuthenticated) {
        console.log('[Checkout Page] Validating guest checkout fields');
        if (!formData.guestEmail || !formData.guestName) {
          setSubmitError('Please provide your name and email to complete the checkout.');
          setIsSubmitting(false);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.guestEmail)) {
          setSubmitError('Please provide a valid email address.');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate cart items
      if (!items || items.length === 0) {
        setSubmitError('Your cart is empty. Please add items before checking out.');
        setIsSubmitting(false);
        return;
      }

      // Check for required fields
      if (!formData.city || !formData.country) {
        setSubmitError('Please fill in all required shipping information fields.');
        setIsSubmitting(false);
        return;
      }

      // For authenticated users, ensure we have shipping address and phone number
      // either from the form or from the user profile
      if (!isAuthenticated && (!formData.shippingAddress || !formData.phoneNumber)) {
        setSubmitError('Please provide your shipping address and phone number.');
        setIsSubmitting(false);
        return;
      }

      // For authenticated users, use their profile data if available
      if (isAuthenticated && userProfile) {
        if (!formData.shippingAddress && userProfile.shippingAddress) {
          formData.shippingAddress = userProfile.shippingAddress;
        }

        if (!formData.phoneNumber && userProfile.phoneNumber) {
          formData.phoneNumber = userProfile.phoneNumber;
        }
      }

      // Send cart items along with the form data
      const cartItemsFormatted = items.map(item => {
        // Ensure all required fields are present
        if (!item.product || !item.product.id || !item.product.price) {
          console.error('[Checkout Page] Invalid product in cart:', item);
          throw new Error('One or more items in your cart are invalid. Please try again or contact support.');
        }

        // Create a clean copy of the product data
        return {
          productId: item.product.id,
          quantity: parseInt(item.quantity, 10), // Ensure quantity is an integer
          price: parseFloat(item.product.price)  // Ensure price is a float
        };
      });

      console.log('[Checkout Page] Cart items formatted:', JSON.stringify(cartItemsFormatted));

      // Verify that we have valid cart items
      if (cartItemsFormatted.length === 0) {
        setSubmitError('Your cart appears to be empty. Please add items before checking out.');
        setIsSubmitting(false);
        return;
      }

      // Note: city and country fields are not in the Order model in the Prisma schema
      // The server will combine them with the shipping address
      const orderData = {
        ...formData,
        cartItems: cartItemsFormatted
      };

      console.log('[Checkout Page] Sending order data:', JSON.stringify(orderData));

      // Stringify the order data
      const orderDataString = JSON.stringify(orderData);

      console.log('[Checkout Page] Making API request to /api/orders');

      try {
        console.log('[Checkout Page] Sending request with data:', orderDataString);

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: orderDataString,
        });

        console.log('[Checkout Page] Response status:', response.status);

        // Handle timeout
        if (!response) {
          throw new Error('Network response was not received. The request may have timed out.');
        }

        // Handle non-JSON responses
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            responseData = await response.json();
            console.log('[Checkout Page] Response data:', responseData);
          } catch (jsonError) {
            console.error('[Checkout Page] Error parsing JSON response:', jsonError);
            const textResponse = await response.text();
            console.error('[Checkout Page] Raw response text:', textResponse);
            throw new Error('Failed to parse server response as JSON');
          }
        } else {
          const textResponse = await response.text();
          console.error('[Checkout Page] Non-JSON response:', textResponse);
          throw new Error('Server returned an invalid response format');
        }

      if (response.ok) {
        console.log('[Checkout Page] Order created successfully:', responseData);

        // Clear the cart after successful order
        clearCart();

        // Show success message with toast notification
        toast.success('Order placed successfully!', {
          duration: 5000,
          position: 'top-center',
        });

        // Redirect to landing page
        router.push('/');
      } else {
        console.error('[Checkout Page] Error response:', responseData);

        let errorMessage = 'Failed to create order';
        if (responseData && responseData.error) {
          errorMessage = responseData.error;
        }

        throw new Error(errorMessage);
      }
      } catch (fetchError) {
        console.error('[Checkout Page] Fetch error:', fetchError);
        console.error('[Checkout Page] Fetch error stack:', fetchError.stack);
        throw new Error(fetchError.message || 'Network error while creating order');
      }
    } catch (error) {
      console.error('[Checkout Page] Checkout error:', error);
      console.error('[Checkout Page] Checkout error stack:', error.stack);

      // Provide a more user-friendly error message
      let userErrorMessage = 'An unexpected error occurred. Please try again.';

      if (error.message) {
        if (error.message.includes('payload')) {
          userErrorMessage = 'There was an issue with the order data. Please try again or contact support.';
        } else if (error.message.includes('JSON')) {
          userErrorMessage = 'There was an issue processing the server response. Please try again.';
        } else {
          userErrorMessage = error.message;
        }
      }

      // Show error toast notification
      toast.error(userErrorMessage, {
        duration: 5000,
        position: 'top-center',
      });

      setSubmitError(userErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while the store is hydrating
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner />
        <p className="mt-4 text-brown">Loading checkout...</p>
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
        <p className="mt-4 text-brown">Preparing checkout functionality...</p>
        <button
          onClick={() => setIsStoreReady(true)}
          className="mt-2 px-4 py-2 bg-brown text-white rounded-md hover:bg-brown-dark"
        >
          Continue Anyway
        </button>
      </div>
    );
  }

  console.log('[Checkout Page] Rendering with items:', items);

  // Check if cart is empty
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-brown mb-4">Your cart is empty</h2>
        <p className="text-brown-light mb-6">Add some items to your cart before checking out</p>
        <button
          onClick={() => router.push('/products/category/hair-care')}
          className="px-4 py-2 bg-brown text-white rounded-md hover:bg-brown-dark"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl  font-semibold mb-8 text-gray-800">Checkout</h1>

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          {!isAuthenticated && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Shipping Information</h2>

            {isAuthenticated && userProfile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 font-medium">
                  Using your saved shipping information
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Your shipping address and phone number have been automatically filled from your profile.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Shipping Address
                </label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting || (isAuthenticated && userProfile?.shippingAddress)}
                  className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ${
                    isAuthenticated && userProfile?.shippingAddress ? 'bg-gray-100' : ''
                  }`}
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting || (isAuthenticated && userProfile?.phoneNumber)}
                    className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ${
                      isAuthenticated && userProfile?.phoneNumber ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Payment Method</h2>
            <div className="space-y-2">
              <label className="flex items-center text-gray-700">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mr-2"
                />
                Cash
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg transition duration-300 ${
              isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#4E3B2D] text-white hover:bg-[#6b503d]'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Summary</h2>
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between py-2 border-b">
              <span className="text-gray-800">{item.product.name} × {item.quantity}</span>
              <span className="text-gray-600">${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 font-semibold flex justify-between text-gray-800">
            <span>Total</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
