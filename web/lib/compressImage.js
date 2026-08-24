// بند ۴ در PLAN.md + دام CLAUDE.md: «عکس خام گوشی چهار مگابایت است و بیست‌تا
// از آن سهمیهٔ IndexedDB را می‌بلعد» — همیشه قبل از ذخیره فشرده کن.
const MAX_SIDE = 1600;
const QUALITY = 0.8;

export async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));
  return { blob, width, height };
}
