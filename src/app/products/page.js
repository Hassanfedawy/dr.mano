'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to hair care category
    router.replace('/products/category/hair-care');
  }, [router]);

  // Return a loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="spinner-border animate-spin mb-4"></div>
        <p className="text-gray-600">Redirecting to Hair Care products...</p>
      </div>
    </div>
  );
}
