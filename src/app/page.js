'use client';

import Link from 'next/link';
import Carousel from '@/components/Carousel';
import Image from 'next/image';

export default function Home() {
  // Define carousel images
  const carouselImages = [
    { src: "/Images/Carasoul logo.jpg", alt: "Dr. Mano Cosmetics" },
    { src: "/Images/Carasoul1.jpg", alt: "Premium Skincare" },
    { src: "/Images/Carasoul2.jpg", alt: "Premium Skincare" },
    { src: "/Images/Carasoul3.jpg", alt: "Premium Skincare" },
    { src: "/Images/Carasoul4.jpg", alt: "Premium Skincare" },
  ];

  return (
    <div>
      {/* Carousel Section */}
      <div className="w-full px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <Carousel images={carouselImages} autoplaySpeed={5000} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-cover bg-center overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-beige-light sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-serif font-bold text-charcoal sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Where Beauty Meets Innovation</span>
                  <span className="block text-brown xl:inline">Discover Your Brilliance</span>
                </h1>
              </div>
            </main>
          </div>
        </div>
      </div>

    

      {/* Sign In/Sign Up Buttons */}
      <div className="w-full flex justify-center space-x-4 my-8">
        <Link href="/auth/signin" className="border border-brown text-brown hover:bg-beige-dark transition-colors px-8 py-3 text-lg font-medium rounded-md">
          SIGN IN
        </Link>
        <Link href="/auth/signup" className="bg-brown text-white hover:bg-brown-dark transition-colors px-8 py-3 text-lg font-medium rounded-md">
          SIGN UP
        </Link>
      </div>

      {/* Category Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hair Care Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[400px] overflow-hidden rounded-lg">
          <Link href="/products/category/hair-care">
            <Image
              src="/Images/HairCare.jpg"
              alt="Hair Care"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            </Link>
          </div>
          <div className="flex flex-col justify-center items-center md:items-start">
            <h2 className="text-5xl font-serif text-charcoal mb-4">Hair Care</h2>
            <p className="text-lg text-brown-light mb-6 text-center md:text-left">
              Experience luxurious nourishment and styling for every strand.
            </p>
            <Link href="/products/category/hair-care" className="border border-brown text-brown hover:bg-brown hover:text-white transition-colors px-8 py-2">
              EXPLORE HAIR CARE
            </Link>
          </div>
        </div>

        {/* Skin Care Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="flex flex-col justify-center items-center md:items-end order-2 md:order-1">
            <h2 className="text-5xl font-serif text-charcoal mb-4">Skin Care</h2>
            <p className="text-lg text-brown-light mb-6 text-center md:text-right">
              Unveil timeless beauty with our meticulously crafted skincare collections.
            </p>
            <Link href="/products/category/skin-care" className="border border-brown text-brown hover:bg-brown hover:text-white transition-colors px-8 py-2">
              EXPLORE SKIN CARE
            </Link>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[400px] overflow-hidden rounded-lg order-1 md:order-2">
          <Link href="/products/category/skin-care">
            <Image
              src="/Images/SkinCare.jpg"
              alt="Skin Care"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Link>
          </div>
        </div>

        {/* Fragrances Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[400px] overflow-hidden rounded-lg">
          <Link href="/products/category/fragrances">
            <Image
              src="/Images/Fragnence.jpg"
              alt="Fragrances"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            </Link>
          </div>
          <div className="flex flex-col justify-center items-center md:items-start">
            <h2 className="text-5xl font-serif text-charcoal mb-4">Fragrances</h2>
            <p className="text-lg text-brown-light mb-6 text-center md:text-left">
              Immerse yourself in exquisite aromas designed to leave a lasting impression.
            </p>
            <Link href="/products/category/fragrances" className="border border-brown text-brown hover:bg-brown hover:text-white transition-colors px-8 py-2">
              DISCOVER FRAGRANCES
            </Link>
          </div>
        </div>

        {/* Home Care Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center items-center md:items-end order-2 md:order-1">
            <h2 className="text-5xl font-serif text-charcoal mb-4">Home Care</h2>
            <p className="text-lg text-brown-light mb-6 text-center md:text-right">
              Transform your space with our premium collection of home care essentials.
            </p>
            <Link href="/products/category/home-care" className="border border-brown text-brown hover:bg-brown hover:text-white transition-colors px-8 py-2">
              EXPLORE HOME CARE
            </Link>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[400px] overflow-hidden rounded-lg order-1 md:order-2">
          <Link href="/products/category/home-care">
            <Image
              src="/Images/HomeCare.jpg"
              alt="Home Care"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
