'use client';
import Link from 'next/link';
import React from 'react';

type Product = {
  _id?: string;
  sku?: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  stock?: number;
};

export default function ProductCard({
  product,
  isAdmin,
  onDelete,
}: {
  product: Product;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}) {
  const id = product._id ?? product.sku ?? '';

  function addToCart() {
    const cur = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cur.findIndex((i: any) => i.productId === id);
    if (idx >= 0) cur[idx].quantity += 1;
    else cur.push({ productId: id, quantity: 1, name: product.name, price: product.price });

    localStorage.setItem('cart', JSON.stringify(cur));
    window.dispatchEvent(new Event('storage'));
    alert(`${product.name} added to cart`);
  }

  async function handleDelete() {
    if (!confirm('Delete this product?')) return;
    if (onDelete) onDelete(id);
  }

  const shortDesc =
    (product.description || '').length > 120
      ? (product.description || '').slice(0, 117) + '...'
      : product.description || '';

  return (
    <article className="bg-white rounded-lg shadow p-4 flex flex-col h-full">

      {/* 💥 IMAGE REMOVED — layout preserved */}

      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>

        {shortDesc ? (
          <p className="text-sm text-gray-600 mb-3">{shortDesc}</p>
        ) : (
          <p className="text-sm text-gray-400 mb-3">No description available.</p>
        )}

        <div className="text-xs text-gray-500 mb-2">
          {product.category && <span className="capitalize mr-2">{product.category}</span>}
          {product.sku && <span className="mr-2">SKU: {product.sku}</span>}
          <span className="mr-2">Stock: {product.stock ?? 0}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">Price</div>
          <div className="text-lg font-bold">₹{product.price}</div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {isAdmin ? (
            <>
              <Link
                href={`/products/admin/edit/${encodeURIComponent(id)}`}
                className="inline-block text-sm px-3 py-1 border rounded"
              >
                Edit
              </Link>

              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={addToCart}
                className="inline-block text-sm px-3 py-1 bg-teal-500 text-white rounded"
              >
                Add to cart
              </button>
            </>
          )}
        </div>
      </div>

    </article>
  );
}
