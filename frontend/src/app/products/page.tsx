'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '../../../components/ProductCard';
import { getUser } from '../../../lib/auth';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/products?limit=50`);
        const data = await res.json();
        // backend returns { products, page... } or array
        const items = Array.isArray(data) ? data : data.products ?? [];
        setProducts(items);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  const user = getUser();
  const isAdmin = user?.role === 'admin';

  if (loading) return <div className="p-8 text-center">Loading products…</div>;

  return (
    <section className="container mx-auto py-6 px-4">
      <h2 className="text-2xl font-semibold mb-6">Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p._id ?? p.sku} product={p} isAdmin={isAdmin} />
        ))}
      </div>

      {products.length === 0 && <div className="text-center text-gray-500 mt-8">No products available.</div>}
    </section>
  );
}
