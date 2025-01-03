'use client'
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navigation() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if the user is an admin
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <nav className="bg-[#F0F2F4] shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center h-full">
                <Image 
                  src="/Images/Logo.jpg" 
                  alt="Dr. Mano Logo" 
                  width={150} 
                  height={50} 
                  priority
                  className="h-12 sm:h-14 md:h-16 w-auto object-contain"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/products"
                className="text-[#6A4E3C] hover:text-[#4E3B2D] inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Products
              </Link>
              {!isAdmin && (
                <>
                  <Link
                    href="/cart"
                    className="text-[#6A4E3C] hover:text-[#4E3B2D] inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Cart
                  </Link>
                  <Link
                    href="/orders"
                    className="text-[#6A4E3C] hover:text-[#4E3B2D] inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Orders
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="text-[#6A4E3C] hover:text-[#4E3B2D] px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {!isAdmin && (
                  <Link
                    href="/cart"
                    className="text-[#6A4E3C] hover:text-[#4E3B2D] px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Cart
                  </Link>
                )}
                <div className="relative ml-3">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A4E3C]"
                  >
                    <span className="sr-only">Open user menu</span>
                    {session.user.image ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt={session.user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#6A4E3C] flex items-center justify-center text-white">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                      </div>
                    )}
                  </button>
                  {mobileMenuOpen && (
                    <div className="z-40 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {!isAdmin && (
                        <>
                          <Link
                            href="/cart"
                            className="block px-4 py-2 text-sm text-[#6A4E3C] hover:bg-[#F0F2F4]"
                          >
                            Cart
                          </Link>
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-[#6A4E3C] hover:bg-[#F0F2F4]"
                          >
                            Orders
                          </Link>
                        </>
                      )}
                      <Link
                        href="/products"
                        className="block px-4 py-2 text-sm text-[#6A4E3C] hover:bg-[#F0F2F4]"
                      >
                        Products
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-[#6A4E3C] hover:bg-[#F0F2F4]"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-[#6A4E3C] hover:bg-[#F0F2F4]"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-[#6A4E3C] hover:text-[#4E3B2D] px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#6A4E3C] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#4E3B2D]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}