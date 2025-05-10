'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Carousel({ images, autoplaySpeed = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Function to go to the next slide
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this with the CSS transition duration
  }, [images.length, isTransitioning]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this with the CSS transition duration
  }, [images.length, isTransitioning]);

  // Set up autoplay
  useEffect(() => {
    if (autoplaySpeed <= 0) return; // Don't autoplay if speed is 0 or negative

    const interval = setInterval(() => {
      nextSlide();
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [nextSlide, autoplaySpeed]);

  // Go to a specific slide
  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;

    setIsTransitioning(true);
    setCurrentIndex(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-xl">
      {/* Carousel container */}
      <div className="relative aspect-[16/9] sm:aspect-auto sm:h-[400px] md:h-[500px] lg:h-[600px]">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt || `Slide ${index + 1}`}
              fill
              priority={index === 0}
              className="object-contain"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-brown p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <FaChevronLeft size={20} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-brown p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <FaChevronRight size={20} />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-brown' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
