'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isRequired, isEmail, minLength, passwordStrength } from '@/lib/validation';
import { setToken } from '../../../../lib/auth';

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function validateAll(): boolean {
    const e: Record<string,string> = {};
    if (!isRequired(form.name)) e.name = 'Name is required';
    if (!isRequired(form.email)) e.email = 'Email is required';
    else if (!isEmail(form.email)) e.email = 'Please enter a valid email';
    if (!isRequired(form.password)) e.password = 'Password is required';
    else if (!minLength(form.password, 6)) e.password = 'Password must be at least 6 characters';
    const strength = passwordStrength(form.password);
    if (strength.score <= 1) e.password = (e.password ? e.password + '. ' : '') + strength.msg;

    if (!isRequired(form.confirmPassword)) e.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validateAll()) return;
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.toLowerCase().trim(), password: form.password })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        alert(payload.message || 'Registration failed');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        alert('Registered successfully!');
        router.push('/products');
      } else {
        alert('Registered successfully — please login.');
        router.push('/auth/login');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
          {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border rounded" />
          {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <div className="relative">
            <input
              value={form.password}
              onChange={e=>setForm({...form, password: e.target.value})}
              type={showPwd ? 'text' : 'password'}
              className="w-full px-3 py-2 border rounded pr-12"
            />
            <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600">
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          {form.password && <div className="text-xs text-gray-500 mt-1">Strength: {passwordStrength(form.password).msg}</div>}
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input value={form.confirmPassword} onChange={e=>setForm({...form, confirmPassword: e.target.value})} type={showPwd ? 'text' : 'password'} className="w-full px-3 py-2 border rounded" />
          {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded" style={{backgroundColor:"#14B8A6"}}>
            {loading ? 'Registering…' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
