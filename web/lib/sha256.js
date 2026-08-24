// هش محتوا قبل از آپلود — بند ۱۲.۶: آدرس‌دهی بر اساس هش تا فایل تکراری دوبار
// آپلود نشود. سرور هم دوباره حساب می‌کند (اعتماد به کلاینت کافی نیست).
export async function sha256Hex(blob) {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
