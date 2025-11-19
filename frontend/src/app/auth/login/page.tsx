'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '../../../../lib/auth';
import { getUser } from '../../../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged-in admin, redirect to admin dashboard
  useEffect(() => {
    try {
      const u = getUser();
      if (u && u.role === 'admin') router.replace('/products/admin');
    } catch (err) {}
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) call login endpoint
      const loginRes = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok || !loginData.token) {
        alert(loginData.message || 'Login failed');
        setLoading(false);
        return;
      }

      // 2) store token immediately (so other calls can use it)
      setToken(loginData.token);

      // If backend provided user info in login response, use it to route quickly
      const loginUser = loginData.user ?? null;
      if (loginUser && loginUser.role === 'admin') {
        router.replace('/products/admin');
        return;
      }

      // 3) verify with backend using the newly stored token (authoritative)
      const meRes = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });

      if (!meRes.ok) {
        // verification failed — remove token and show message
        localStorage.removeItem('token');
        const body = await meRes.json().catch(()=>({}));
        alert(body.message || 'Could not verify account. Try login again.');
        setLoading(false);
        return;
      }

      const meBody = await meRes.json();
      const meUser = meBody?.user ?? meBody;

      // 4) redirect based on server role
      if (meUser && meUser.role === 'admin') {
        router.replace('/products/admin');
      } else {
        // if there is a pending checkout (user tried to checkout before login), complete it
        try {
          const pending = localStorage.getItem('pending_checkout');
          if (pending) {
            const items = JSON.parse(pending);
            const resp = await fetch(`${API}/api/orders/checkout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` },
              body: JSON.stringify({ items })
            });
            if (resp.ok) {
              const body = await resp.json();
              localStorage.removeItem('pending_checkout');
              localStorage.removeItem('cart');
              window.dispatchEvent(new Event('storage'));
              alert('Your order has been placed' + (body?.id ? ` (Order #${body.id})` : ''));
              router.replace('/orders');
              return;
            } else {
              // failed to complete checkout — fall back to products page
              localStorage.removeItem('pending_checkout');
              router.replace('/cart');
              return;
            }
          }
        } catch (err) {
          console.error('Auto-checkout failed', err);
        }

        router.replace('/products');
      }
    } catch (err: any) {
      console.error('Login error', err);
      alert('Network error — try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4" >Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border rounded pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600" 
            >
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded"style={{backgroundColor:"#14B8A6"}}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
