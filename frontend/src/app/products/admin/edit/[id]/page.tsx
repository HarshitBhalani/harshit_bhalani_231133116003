'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '../../../../../../lib/auth';

type FormState = {
  sku: string;
  name: string;
  price: string;
  category: string;
  description: string;
  stock: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();            // <-- useParams for client components
  const id = params?.id || '';          // ensure safe
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    sku: '',
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '0',
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      // must have id
      if (!id) {
        console.warn('No id in params yet, waiting...');
        return;
      }

      const token = getToken();
      if (!token) {
        router.replace('/products');
        return;
      }

      // verify admin on server (authoritative)
      try {
        const meRes = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }});
        if (!meRes.ok) {
          console.warn('auth/me failed', meRes.status);
          router.replace('/products');
          return;
        }
        const meBody = await meRes.json();
        const me = meBody?.user ?? meBody;
        if (!me || me.role !== 'admin') {
          router.replace('/products');
          return;
        }
      } catch (err) {
        console.error('verify error', err);
        router.replace('/products');
        return;
      }

      // fetch product (public GET by id)
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        if (!res.ok) {
          // capture server body for debugging
          let bodyText = '';
          try { bodyText = await res.text(); } catch {}
          console.error('Failed to fetch product', res.status, bodyText);
          alert('Failed to load product (status ' + res.status + '). See console for details.');
          router.push('/products/admin');
          return;
        }
        const p = await res.json();
        if (!mounted) return;
        setForm({
          sku: p.sku ?? '',
          name: p.name ?? '',
          price: String(p.price ?? ''),
          category: p.category ?? '',
          description: p.description ?? '',
          stock: String(p.stock ?? '0'),
          image: p.image ?? '',
        });
      } catch (err) {
        console.error('Fetch product error', err);
        alert('Failed to load product. Check console.');
        router.push('/products/admin');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    // also re-run if id changes
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function validate() {
    if (!form.sku.trim()) return 'SKU is required';
    if (!form.name.trim()) return 'Name is required';
    if (!form.price || Number(form.price) <= 0) return 'Price must be > 0';
    if (Number(form.stock) < 0) return 'Stock cannot be negative';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { alert(v); return; }

    setSaving(true);
    try {
      const token = getToken();
      if (!token) { alert('Not authenticated — please login'); router.replace('/auth/login'); return; }

      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        description: form.description.trim(),
        stock: Number(form.stock),
      };

      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Product updated successfully');
        router.push('/products/admin');
        return;
      }

      // parse body for friendly message
      let body: any = '';
      try { body = await res.json(); } catch { body = await res.text().catch(() => ''); }
      console.error('Update failed', { status: res.status, body });
      alert(`Update failed (status ${res.status})\n\n${JSON.stringify(body)}`);
    } catch (err: any) {
      console.error('Update error', err);
      alert('Update failed: ' + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading product…</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full px-3 py-2 border rounded" value={form.sku} onChange={(e)=>setForm({...form, sku: e.target.value})} placeholder="SKU" />

        <input className="w-full px-3 py-2 border rounded" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Name" />

        <div className="grid grid-cols-2 gap-3">
          <input type="number" className="px-3 py-2 border rounded" value={form.price} onChange={(e)=>setForm({...form, price: e.target.value})} placeholder="Price" />
          <input type="number" className="px-3 py-2 border rounded" value={form.stock} onChange={(e)=>setForm({...form, stock: e.target.value})} placeholder="Stock" />
        </div>

        <input className="w-full px-3 py-2 border rounded" value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} placeholder="Category" />

        <textarea className="w-full px-3 py-2 border rounded" rows={4} value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} placeholder="Description" />

        {/* Image removed per requirement - no image field for admin forms */}

        <div className="flex justify-between">
          <button type="button" onClick={()=>router.push('/products/admin')} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded" style={{backgroundColor:"#14B8A6"}}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
