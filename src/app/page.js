'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-cover bg-center overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-[#F0F2F4] sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-[#6A4E3C] sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Premium Cosmetics for</span>{' '}
                  <span className="block text-[#6A4E3C] xl:inline">Your Beauty</span>
                </h1>
                <p className="mt-3 text-base text-[#6A4E3C] sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover our collection of high-quality cosmetic products designed to enhance your natural beauty. From skincare to makeup, we have everything you need.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {session ? (
                    <div className="rounded-md shadow">
                      <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#6A4E3C] hover:bg-[#4E3B2D] md:py-4 md:text-lg md:px-10"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md shadow">
                        <Link
                          href="/auth/signin"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#6A4E3C] hover:bg-[#4E3B2D] md:py-4 md:text-lg md:px-10"
                        >
                          Get Started
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link
                          href="/products"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#6A4E3C] bg-[#F0F2F4] hover:bg-[#D9DADA] md:py-4 md:text-lg md:px-10"
                        >
                          Browse Products
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-[#F0F2F4] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#6A4E3C] sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-[#6A4E3C]">
              Explore our best-selling cosmetic products
            </p>
          </div>
          {/* Featured Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10">
            {/* Product Card Placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-4 hover:scale-105 transition-all">
              <img src="/product-placeholder.jpg" alt="Product" className="w-full h-64 object-cover rounded-md" />
              <h3 className="mt-4 text-xl font-semibold text-[#6A4E3C]">Product Name</h3>
              <p className="mt-2 text-[#6A4E3C]">$99.99</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
