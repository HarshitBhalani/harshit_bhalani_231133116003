// frontend/src/app/cart/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

type CartItem = { productId: string; quantity: number };
type Product = { _id: string; name: string; price: number; sku?: string; category?: string; description?: string };

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [details, setDetails] = useState<Record<string, Product | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cur = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cur);
  }, []);

  useEffect(() => {
    async function loadDetails() {
      const uniqueIds = Array.from(new Set(cart.map(c => c.productId)));
      const map: Record<string, Product | null> = {};
      for (const id of uniqueIds) {
        try {
          const p = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/products/${id}`).then(r => r.ok ? r.json() : null);
          map[id] = p;
        } catch (e) {
          map[id] = null;
        }
      }
      setDetails(map);
    }
    if (cart.length) loadDetails();
  }, [cart]);

  function updateQty(index: number, qty: number) {
    const c = [...cart];
    c[index].quantity = Math.max(1, qty);
    setCart(c);
    localStorage.setItem('cart', JSON.stringify(c));
    window.dispatchEvent(new Event('storage'));
  }

  function removeItem(index: number) {
    const c = [...cart];
    c.splice(index, 1);
    setCart(c);
    localStorage.setItem('cart', JSON.stringify(c));
    window.dispatchEvent(new Event('storage'));
  }

  async function checkout() {
    try {
      if (!cart.length) return alert('Cart is empty');
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      if (!token) {
        // save pending checkout and prompt user to login/register
        localStorage.setItem('pending_checkout', JSON.stringify(cart));
        setShowLoginModal(true);
        return;
      }

      const headers: any = { 'Content-Type': 'application/json' };
      headers['Authorization'] = `Bearer ${token}`;
      const res = await api('/api/orders/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ items: cart })
      });
      alert('Order created: ' + res.id);
      localStorage.removeItem('cart');
      setCart([]);
      setDetails({});
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const grandTotal = cart.reduce((sum, it) => {
    const p = details[it.productId];
    const price = p?.price ?? 0;
    return sum + price * it.quantity;
  }, 0);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="text-gray-600">Your cart is empty.</div>
      ) : (
        <>
          <div className="bg-white p-4 rounded shadow">
            {cart.map((it, i) => {
              const product = details[it.productId];
              return (
                <div key={it.productId} className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-4">
                    
                    <div>
                      <div className="font-medium">{product?.name ?? 'Product'}</div>
                      <div className="text-xs text-gray-500">{product?.category}</div>
                      <div className="text-sm text-gray-600">SKU: {product?.sku ?? '-'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="font-bold">₹{product?.price ?? '0'}</div>
                    </div>

                    <div>
                      <input className="w-20 px-2 py-1 border rounded" type="number" value={it.quantity} onChange={(e)=> updateQty(i, Number(e.target.value))} />
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">Subtotal</div>
                      <div className="font-bold">₹{( (product?.price ?? 0) * it.quantity ).toFixed(2)}</div>
                    </div>

                    <button onClick={() => removeItem(i)} className="text-sm text-red-500">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Grand total</div>
              <div className="text-2xl font-bold">₹{grandTotal.toFixed(2)}</div>
            </div>

            <div>
              <button onClick={checkout} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded" style={{backgroundColor:"#14B8A6"}}>
                {loading ? 'Processing…' : 'Checkout'}
              </button>
            </div>
          </div>
        </>
      )}
      {/* Login/Register modal shown when attempting checkout while not authenticated */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
            <p className="text-sm text-gray-600 mb-4">You need to register or login before checking out.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowLoginModal(false); }} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={() => { router.push('/auth/register'); }} className="px-3 py-2 bg-gray-200 rounded">Register</button>
              <button onClick={() => { router.push('/auth/login'); }} className="px-3 py-2 bg-indigo-600 text-white rounded" style={{backgroundColor:'#14B8A6'}}>Login</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
