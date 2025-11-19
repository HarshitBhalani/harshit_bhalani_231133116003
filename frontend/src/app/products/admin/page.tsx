// frontend/src/app/products/admin/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ sku: '', name: '', price: '', category: '', description: '', stock: '0' });
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = localStorage.getItem('token') || '';
      if (!token) { router.replace('/products'); return; }
      // verify
      const meRes = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }});
      if (!meRes.ok) { router.replace('/products'); return; }
      const meBody = await meRes.json();
      // /api/auth/me returns { user: { ... } } or a raw user object
      const me = meBody?.user ?? meBody;
      if (!me || me.role !== 'admin') { router.replace('/products'); return; }
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

  async function handleCreate(e: any) {
    e.preventDefault();
    // basic validation
    if (!createForm.sku.trim()) return alert('SKU is required');
    if (!createForm.name.trim()) return alert('Name is required');
    if (!createForm.price || Number(createForm.price) <= 0) return alert('Price must be > 0');
    if (Number(createForm.stock) < 0) return alert('Stock cannot be negative');

    setCreating(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: createForm.sku.trim(),
          name: createForm.name.trim(),
          price: Number(createForm.price),
          category: createForm.category.trim(),
          description: createForm.description.trim(),
          stock: Number(createForm.stock),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(()=>({}));
        alert(body.message || 'Failed to create product');
        setCreating(false);
        return;
      }
      const created = await res.json();
      setProducts(p => [created, ...p]);
      setShowCreateModal(false);
      setCreateForm({ sku: '', name: '', price: '', category: '', description: '', stock: '0' });
    } catch (err) {
      console.error('Create error', err);
      alert('Failed to create product');
    } finally {
      setCreating(false);
    }
  }

  if (checking) return <div className="p-8 text-center">Checking access…</div>;

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded" style={{backgroundColor:'#14B8A6'}}>+ Add New</button>
          <Link href="/products/admin/create" className="px-3 py-2 border rounded">Open Create Page</Link>
        </div>
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

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-3">Add Product</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="w-full px-3 py-2 border rounded" placeholder="SKU" value={createForm.sku} onChange={e=>setCreateForm({...createForm, sku: e.target.value})} />
              <input className="w-full px-3 py-2 border rounded" placeholder="Name" value={createForm.name} onChange={e=>setCreateForm({...createForm, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="px-3 py-2 border rounded" placeholder="Price" value={createForm.price} onChange={e=>setCreateForm({...createForm, price: e.target.value})} />
                <input type="number" className="px-3 py-2 border rounded" placeholder="Stock" value={createForm.stock} onChange={e=>setCreateForm({...createForm, stock: e.target.value})} />
              </div>
              <input className="w-full px-3 py-2 border rounded" placeholder="Category" value={createForm.category} onChange={e=>setCreateForm({...createForm, category: e.target.value})} />
              <textarea className="w-full px-3 py-2 border rounded" rows={3} placeholder="Description" value={createForm.description} onChange={e=>setCreateForm({...createForm, description: e.target.value})} />

              <div className="flex justify-between">
                <button type="button" onClick={()=>setShowCreateModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-600 text-white rounded" style={{backgroundColor:'#14B8A6'}}>{creating ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
