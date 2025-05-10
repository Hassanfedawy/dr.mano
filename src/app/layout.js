import { Inter, Playfair_Display } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/providers/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: 'Dr.Mano - Cosmetic Products',
  description: 'Your trusted source for premium cosmetic products',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-beige-light text-charcoal font-serif">
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#f5f0e8',
                color: '#333333',
                borderRadius: '8px',
                border: '1px solid #6A4E3C',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
