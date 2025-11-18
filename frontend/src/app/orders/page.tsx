// frontend/src/app/orders/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

type OrderItem = {
  id: number;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
  product: any | null;
};

type Order = {
  id: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await api('/api/orders', { headers });
        setOrders(res || []);
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading orders…</div>;
  if (!orders.length) return <div className="text-gray-600">No orders yet.</div>;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-500">Order #{order.id}</div>
                <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-lg font-bold">₹{order.total}</div>
            </div>

            <div className="space-y-2">
              {order.items.map(it => (
                <div key={it.id} className="flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <div className="font-medium">{it.product?.name ?? 'Product name'}</div>
                      <div className="text-xs text-gray-500">{it.product?.category}</div>
                      <div className="text-xs text-gray-400">SKU: {it.product?.sku ?? '-'}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">Qty: {it.quantity}</div>
                    <div className="text-sm">Price: ₹{it.priceAtPurchase}</div>
                    <div className="font-bold">Subtotal: ₹{it.subtotal}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
