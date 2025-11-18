// frontend/src/lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function api(path: string, opts: RequestInit = {}) {
  const url = `${API}${path}`;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    let json = null;
    try { json = JSON.parse(txt); } catch {}
    const err: any = new Error(json?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = json || txt;
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('json')) return res.json();
  return res.text();
}
