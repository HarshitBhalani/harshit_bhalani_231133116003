// frontend/src/app/layout.tsx
import './globals.css';
import Navbar from '../../components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeoShop - E-commerce platform',
  description: 'A clean and modern storefront, powered by a fast backend, scalable database, and secure authentication. Build, learn, and deploy with confidence.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
