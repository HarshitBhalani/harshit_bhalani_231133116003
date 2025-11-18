// frontend/src/lib/auth.ts
export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  window.dispatchEvent(new Event('storage'));
}
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('storage'));
}
export function getUser() {
  try {
    const t = getToken(); if (!t) return null;
    const payload = JSON.parse(atob(t.split('.')[1]));
    return payload;
  } catch { return null; }
}
