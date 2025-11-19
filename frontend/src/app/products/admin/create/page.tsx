'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '../../../../../lib/auth';

export default function CreateProductPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '0',
  });

  // ---- verify admin ----
  useEffect(() => {
    async function verify() {
      const token = getToken();
      if (!token) return router.replace('/products');

      const meRes = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meRes.ok) return router.replace('/products');

      const meBody = await meRes.json();
      const me = meBody?.user ?? meBody;
      if (!me || me.role !== 'admin') return router.replace('/products');

      setChecking(false);
    }
    verify();
  }, [API, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    // basic validation
    if (!form.sku.trim()) { alert('SKU is required'); setSaving(false); return; }
    if (!form.name.trim()) { alert('Name is required'); setSaving(false); return; }
    if (!form.price || Number(form.price) <= 0) { alert('Price must be greater than 0'); setSaving(false); return; }
    if (Number(form.stock) < 0) { alert('Stock cannot be negative'); setSaving(false); return; }

    const token = getToken();

    const res = await fetch(`${API}/api/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: form.sku,
        name: form.name,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        stock: Number(form.stock),
      }),
    });

    if (!res.ok) {
      alert('Failed to create');
      setSaving(false);
      return;
    }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="SKU"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <textarea
          className="w-full border px-3 py-2 rounded"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/products/admin')}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {saving ? 'Saving…' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
