// frontend/src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <section className="w-full max-w-4xl mx-auto px-4 text-center">

        {/* App Name */}
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Welcome to <span className="text-indigo-600" style={{color:"#14B8A6"}}>NeoShop</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Fast, secure, and easy to use <br /> the perfect place to shop and explore products.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link href="/products">
            <button
              className="px-6 py-3 rounded-lg text-white"
              style={{
                backgroundColor: "#14B8A6",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0D8F85")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#14B8A6")}
            >
              Browse Products
            </button>
          </Link>


          <Link href="/auth/register">
            <button className="px-6 py-3 rounded-lg bg-white border border-teal-400 text-teal-600 hover:bg-teal-50 transition">
              Create Account
            </button>
          </Link>

        </div>

        {/* Login Link */}
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:underline" style={{color:"#14B8A6"}}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
