// frontend/src/lib/validation.ts
export function isRequired(value: string) {
  return value.trim().length > 0;
}

export function isEmail(value: string) {
  // simple but robust RFC-like check (good for client-side)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(value).toLowerCase());
}

export function minLength(value: string, n = 6) {
  return value.length >= n;
}

export function passwordStrength(password: string) {
  // returns score 0..3 and message
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const msg =
    score <= 1 ? 'Weak — add uppercase, numbers or symbols' :
    score === 2 ? 'Fair — consider adding numbers & symbols' :
    score === 3 ? 'Good' : 'Strong';
  return { score, msg };
}
