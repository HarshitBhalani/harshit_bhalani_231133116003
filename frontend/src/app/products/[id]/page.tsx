// frontend/src/app/products/[id]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';

type Props = { params: { id: string } };

async function fetchProduct(id: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const url = `${API}/api/products/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductDetail({ params }: Props) {
  const id = params.id;
  const product = await fetchProduct(id);
  if (!product) return notFound();

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-100 h-56 rounded flex items-center justify-center">
          <img src="/placeholder.png" alt={product.name} className="object-cover w-full h-full" />
        </div>
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-600 mb-4">{product.description}</p>
          <div className="text-xl font-bold mb-4">₹{product.price}</div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const cur = JSON.parse(localStorage.getItem('cart') || '[]');
                const idx = cur.findIndex((i:any)=>i.productId===product._id);
                if (idx>=0) cur[idx].quantity += 1; else cur.push({ productId: product._id, quantity: 1});
                localStorage.setItem('cart', JSON.stringify(cur));
                window.dispatchEvent(new Event('storage'));
                alert('Added to cart');
              }}
              className="px-4 py-2 bg-teal-500 text-white rounded"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
