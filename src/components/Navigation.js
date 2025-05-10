'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa'
import useCartStore from '@/store/cartStore'

export default function Navigation() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [productsSubmenuOpen, setProductsSubmenuOpen] = useState(false)
  const [isStoreReady, setIsStoreReady] = useState(false)
  const { items, getItemCount } = useCartStore()
  const [cartCount, setCartCount] = useState(0)

  // Ensure the store is hydrated before rendering cart count
  useEffect(() => {
    console.log('[Navigation] Initializing cart count...');

    // Set a timeout to prevent infinite loading if hydration fails
    const timeoutId = setTimeout(() => {
      console.log('[Navigation] Hydration timeout - forcing ready state');
      setIsStoreReady(true);
    }, 3000); // 3 second timeout

    const checkHydration = () => {
      const store = useCartStore.persist.hasHydrated();
      if (store) {
        console.log('[Navigation] Store is hydrated');
        setIsStoreReady(true);
        clearTimeout(timeoutId);
      } else {
        console.log('[Navigation] Store not yet hydrated, setting up listener');
        const unsubFinishHydration = useCartStore.persist.onFinishHydration(() => {
          console.log('[Navigation] Store finished hydration');
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

  // Update cart count when items change
  useEffect(() => {
    if (isStoreReady) {
      const count = getItemCount();
      console.log('[Navigation] Updating cart count:', count);
      setCartCount(count);

      // Debug the cart state
      if (items.length > 0) {
        console.log('[Navigation] Cart items:', items);
      }
    }
  }, [items, getItemCount, isStoreReady])

  const isAdmin = session?.user?.role === 'ADMIN'

  const toggleProductsSubmenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setProductsSubmenuOpen(prev => !prev)
  }

  const handleCategoryMenuToggle = () => {
    setCategoryMenuOpen(prev => {
      const newState = !prev
      if (!newState) setProductsSubmenuOpen(false)
      return newState
    })
  }

  const closeMenus = () => {
    setCategoryMenuOpen(false)
    setProductsSubmenuOpen(false)
    setMobileMenuOpen(false)
  }

  const AuthLinks = session ? (
    <button
      onClick={() => {
        signOut()
        closeMenus()
      }}
      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-brown hover:bg-beige-light"
    >
      Sign Out
    </button>
  ) : (
    <div className="flex justify-start space-x-3 px-3 py-2">
      <Link
        href="/auth/signin"
        className="text-center px-4 py-2 rounded-md text-base font-medium text-brown border border-brown hover:bg-beige-dark transition-colors"
        onClick={closeMenus}
      >
        Sign In
      </Link>
      <Link
        href="/auth/signup"
        className="text-center px-4 py-2 rounded-md text-base font-medium text-white bg-brown hover:bg-brown-dark transition-colors"
        onClick={closeMenus}
      >
        Sign Up
      </Link>
    </div>
  )

  return (
    <nav className="bg-beige-light shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center h-full space-x-2">
              <Image
                src="/Images/Logo.jpg"
                alt="Dr. Mano Logo"
                width={150}
                height={50}
                priority
                className="h-12 sm:h-14 md:h-16 w-auto object-contain"
              />
              <h1 className="text-2xl tracking-tight font-serif font-bold text-charcoal sm:text-3xl md:text-4xl">
                Fusion Elix
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A4E3C]"
              >
                <span className="sr-only">Open user menu</span>
                {session ? (
                  session.user.image ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brown flex items-center justify-center text-white">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                    </div>
                  )
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brown flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>

              <div
                className={`z-40 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-cream ring-1 ring-brown ring-opacity-20 transition-all duration-200 ease-in-out overflow-hidden ${mobileMenuOpen
                    ? 'max-h-[500px] opacity-100 scale-100'
                    : 'max-h-0 opacity-0 scale-95 pointer-events-none'
                  }`}
              >
                <Link href="/" className="block px-4 py-2 text-sm text-brown hover:bg-beige-light">
                  Home
                </Link>
                <Link href="/products/category/hair-care" className="block px-4 py-2 text-sm text-brown hover:bg-beige-light">
                  Products
                </Link>
                <Link href="/cart" className="flex items-center justify-between px-4 py-2 text-sm text-brown hover:bg-beige-light">
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-brown text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {session && (
                  <Link href="/orders" className="block px-4 py-2 text-sm text-brown hover:bg-beige-light">
                    Past Orders
                  </Link>
                )}
                {session && (
                  <Link href="/profile" className="block px-4 py-2 text-sm text-brown hover:bg-beige-light">
                    Profile
                  </Link>
                )}
                {session && (
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-brown hover:bg-beige-light"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleCategoryMenuToggle}
              className="text-brown hover:text-brown-dark p-2 rounded-md focus:outline-none"
            >
              {categoryMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`bg-cream shadow-lg rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out ${categoryMenuOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {/* Home link */}
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-brown hover:bg-beige-light"
            onClick={closeMenus}
          >
            Home
          </Link>

          {/* Products with subcategories */}
          <div className="mb-2">
            <div
              className="flex justify-between items-center px-3 py-2 rounded-md text-base font-bold text-brown hover:bg-beige-light cursor-pointer"
              onClick={toggleProductsSubmenu}
            >
              <span>Products</span>
              <span className="text-sm">{productsSubmenuOpen ? '▲' : '▼'}</span>
            </div>

            <div
              className={`pl-6 space-y-1 mt-1 border-l-2 border-brown-light ml-4 overflow-hidden transition-all duration-300 ease-in-out ${productsSubmenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              {['hair-care', 'skin-care', 'fragrances', 'home-care'].map((category) => (
                <Link
                  key={category}
                  href={`/products/category/${category}`}
                  className="block px-3 py-1 rounded-md text-base font-medium text-brown hover:bg-beige-light"
                  onClick={closeMenus}
                >
                  {category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>

          {/* Cart and Orders links - available to all users */}
          <Link
            href="/cart"
            className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-brown hover:bg-beige-light"
            onClick={closeMenus}
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-brown text-white rounded-full w-5 h-5 flex items-center justify-center text-xs ml-2">
                {cartCount}
              </span>
            )}
          </Link>
          {session && (
            <Link
              href="/orders"
              className="block px-3 py-2 rounded-md text-base font-medium text-brown hover:bg-beige-light"
              onClick={closeMenus}
            >
              Past Orders
            </Link>
          )}

          {AuthLinks}

          {session && isAdmin && (
            <Link
              href="/admin/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-brown hover:bg-beige-light"
              onClick={closeMenus}
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
