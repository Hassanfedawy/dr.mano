'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/products');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred during sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#6A4E3C] to-[#4E3B2D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#6A4E3C]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-[#4E3B2D]">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-[#6A4E3C] hover:text-[#4E3B2D]">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-[#D9DADA] placeholder-[#D9DADA] text-[#6A4E3C] focus:outline-none focus:ring-2 focus:ring-[#6A4E3C] focus:border-[#6A4E3C] focus:z-10 sm:text-sm transition-all"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-[#D9DADA] placeholder-[#D9DADA] text-[#6A4E3C] focus:outline-none focus:ring-2 focus:ring-[#6A4E3C] focus:border-[#6A4E3C] focus:z-10 sm:text-sm transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#6A4E3C] hover:bg-[#4E3B2D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A4E3C] transition-all"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
