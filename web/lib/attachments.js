import { deletePendingBlob, getPendingBlob, putPendingBlob } from './blobStore';
import { sha256Hex } from './sha256';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// دانلود تنبل، یک‌بار در طول نشست — بند ۱۲.۶: «روی گوشی دانلود ضمیمه‌ها تنبل
// باشد». این کش سطح-ماژول همان «یک‌بار» را در طول یک بارگذاری صفحه تضمین می‌کند.
const readyUrlCache = new Map();

export async function stageBlob(blob, mime) {
  const hash = await sha256Hex(blob);
  await putPendingBlob(hash, blob, mime);
  return hash;
}

// هم بلافاصله بعد از insert صدا زده می‌شود (از NodeView mount effect)، هم دوباره
// وقتی یادداشتی با نودِ «در حال آپلود» باز می‌شود — بند ۱۵.۵ #۱ (صف آپلود)
// ساده‌شده: «بازگشت» یعنی وقتی دوباره این نود را می‌بینی، نه صف پس‌زمینهٔ سراسری.
export async function uploadPendingBlob(hash) {
  const pending = await getPendingBlob(hash);
  if (!pending) return false;

  const form = new FormData();
  form.append('file', pending.blob, hash);
  const res = await fetch(`${API_BASE}/blobs`, { method: 'POST', credentials: 'include', body: form });
  if (!res.ok) throw new Error('آپلود ناموفق بود');

  await deletePendingBlob(hash);
  return true;
}

// اگر بایت‌ها همین‌جا (روی همین دستگاه) در انتظار آپلودند، فوری URL محلی بده —
// حتی قبل از تمام‌شدن آپلود هم پیش‌نمایش داری. تماس‌گیرنده باید این URL را
// خودش revoke کند (فقط وقتی محلی بوده، نه کش‌شدهٔ دوردست).
export async function getLocalBlobUrl(hash) {
  const pending = await getPendingBlob(hash);
  if (!pending) return null;
  return URL.createObjectURL(pending.blob);
}

export async function getRemoteBlobUrl(hash) {
  if (readyUrlCache.has(hash)) return readyUrlCache.get(hash);
  const res = await fetch(`${API_BASE}/blobs/${hash}`, { credentials: 'include' });
  if (!res.ok) throw new Error('دریافت فایل ناموفق بود');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  readyUrlCache.set(hash, url);
  return url;
}
