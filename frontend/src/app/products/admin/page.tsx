// frontend/src/app/products/admin/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = localStorage.getItem('token') || '';
      if (!token) { router.replace('/products'); return; }
      // verify
      const meRes = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }});
      if (!meRes.ok) { router.replace('/products'); return; }
      const me = await meRes.json();
      if (me.role !== 'admin') { router.replace('/products'); return; }
      // load products
      const res = await fetch(`${API}/api/products?limit=500`, { headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) { alert('Failed to load admin products'); return; }
      const data = await res.json();
      if (!mounted) return;
      setProducts(Array.isArray(data) ? data : data.products ?? []);
      setChecking(false);
    })();
    return () => { mounted = false; };
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API}/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) { alert('Delete failed'); return; }
    setProducts(p => p.filter((x:any) => (x._id ?? x.sku) !== id));
  }

  if (checking) return <div className="p-8 text-center">Checking access…</div>;

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Admin Dashboard</h1>
        <Link href="/products/admin/create" className="px-4 py-2 bg-indigo-600 text-white rounded" style={{backgroundColor:"#14B8A6"}}>+ Add New</Link>
      </div>

      <div className="space-y-4">
        {products.map((p:any) => {
          const id = p._id ?? p.sku;
          return (
            <div key={id} className="bg-white p-4 rounded shadow flex justify-between items-start">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">{p.description}</div>
                <div className="mt-2 text-sm text-gray-500">SKU: {p.sku} • Category: {p.category}</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-bold">₹{p.price}</div>
                <Link href={`/products/admin/edit/${encodeURIComponent(id)}`} className="px-3 py-1 border rounded">Edit</Link>
                <button onClick={() => handleDelete(id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
