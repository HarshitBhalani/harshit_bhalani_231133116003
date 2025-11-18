'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { removeToken } from '../lib/auth';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname() || '';
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    // update cart badge from localStorage
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 0), 0));
      } catch {
        setCartCount(0);
      }
    };

    updateCart();
    window.addEventListener('storage', updateCart);

    // verify token with backend to know if user is admin (authoritative)
    let mounted = true;
    const token = localStorage.getItem('token');
    if (token) {
      (async () => {
        try {
          const res = await fetch(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
          });
          if (!mounted) return;
          if (!res.ok) {
            // invalid token -> clear and treat as guest
            console.warn('auth/me failed', res.status);
            removeToken();
            setUser(null);
            return;
          }
          const me = await res.json();
          setUser(me); // { id, email, name, role }
        } catch (err) {
          console.error('verify error', err);
          removeToken();
          setUser(null);
        }
      })();
    } else {
      setUser(null);
    }

    return () => {
      mounted = false;
      window.removeEventListener('storage', updateCart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isAdmin = user?.role === 'admin';

  function logout() {
    removeToken();
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    router.replace('/');
  }

  // Logo link: admin -> admin dashboard, others -> homepage
  const logoHref = isAdmin ? '/products/admin' : '/';

  return (
    <header className="bg-white shadow-sm mb-4">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        {/* LOGO */}
        <Link href={logoHref} className="flex flex-col">
          <span className="text-lg font-bold" style={{color:"#14B8A6"}}>NeoShop</span>
          <span className="text-xs text-gray-500">E-commerce platform</span>
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-6">

          {/* Products & Orders - hidden whenever admin is logged in */}
          {!isAdmin && (
            <>
              <Link href="/products" className="text-sm">Products</Link>
              <Link href="/orders" className="text-sm">Orders</Link>
            </>
          )}

          <Link href="/reports" className="text-sm">Reports</Link>

          {/* Admin dashboard link only for admin */}
          {isAdmin && (
            <Link href="/products/admin" className="text-sm font-semibold text-indigo-600" style={{color:"#14B8A6"}}>Dashboard</Link>
          )}

          {/* Auth area */}
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name || user.email}</span>
              <button onClick={logout} className="text-sm text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm">Login</Link>
              <Link href="/auth/register" className="text-sm">Register</Link>
            </>
          )}

          {/* Cart: hidden for admin always */}
          {!isAdmin && (
            <Link href="/cart" className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">🛒</div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}
