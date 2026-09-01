// کلاینت نازک روی /auth/* — بند ۱۶.۵ در PLAN.md. کوکی نشست هم‌مبدأ کافی است
// (بند ۱۴.۲)، پس credentials:'include' لازم است تا مرورگر کوکی را بفرستد/بپذیرد.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.detail;
    throw new Error(typeof message === 'string' ? message : 'خطای غیرمنتظره');
  }
  return data;
}

export function login(username, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function verifyTotp(code) {
  return request('/auth/totp', { method: 'POST', body: JSON.stringify({ code }) });
}

export function verifyRecovery(code) {
  return request('/auth/recovery', { method: 'POST', body: JSON.stringify({ code }) });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function me() {
  return request('/auth/me');
}

// دستگاه‌های وارد شده — همهٔ نشست‌های زنده، با پرچم `current` برای همین دستگاه.
export function listSessions() {
  return request('/auth/sessions');
}

// بستن نشست یک دستگاه دیگر. برای خودِ این دستگاه logout() است، نه این.
export function revokeSession(id) {
  return request(`/auth/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
