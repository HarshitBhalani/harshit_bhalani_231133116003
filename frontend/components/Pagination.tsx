// frontend/src/components/Pagination.tsx
'use client';
import React from 'react';

export default function Pagination({
  page,
  totalPages,
  onPage
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i <= 2 || i > totalPages - 2 || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== -1) pages.push(-1);
  }

  return (
    <div className="flex items-center gap-2 justify-center mt-6">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
      {pages.map((p, i) =>
        p === -1 ? (
          <span key={i} className="px-2 text-gray-400">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p)} className={`px-3 py-1 rounded ${p === page ? 'bg-indigo-600 text-white' : 'border'}`}>{p}</button>
        )
      )}
      <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
    </div>
  );
}
