// frontend/src/app/reports/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await api('/api/reports', { headers });
        setData(res);
      } catch (err:any) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading reports…</div>;
  if (!data) return <div className="bg-white p-4 rounded shadow">Reports are available for admin only or no data.</div>;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Daily Revenue</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th>Date</th><th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(data.dailyRevenue || []).map((r:any) => (
                <tr key={r.date}>
                  <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2">₹{Number(r.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Category Summary</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th>Category</th><th>#Products</th><th>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {(data.categorySales || []).map((c:any) => (
                <tr key={c._id}>
                  <td className="py-2">{c._id}</td>
                  <td className="py-2">{c.totalProducts}</td>
                  <td className="py-2">₹{Number(c.avgPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
