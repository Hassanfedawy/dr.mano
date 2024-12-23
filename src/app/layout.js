import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/providers/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dr.Mano - Cosmetic Products',
  description: 'Your trusted source for premium cosmetic products',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F0F2F4] text-[#6A4E3C]`}>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#F7E1E1',
                color: '#333',
                borderRadius: '8px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
