// برچسب دستگاه همان user-agent خام است (api/app/auth.py آن را دست‌نخورده ذخیره
// می‌کند). آن رشته برای نمایش ساخته نشده — این هلپر فقط دو چیزی را بیرون
// می‌کشد که کاربر واقعاً می‌خواهد بداند: کدام مرورگر، روی چه سیستمی.
//
// عمداً کتابخانهٔ تشخیص UA اضافه نشد: تشخیص کاملِ user-agent بی‌انتهاست و
// اینجا فقط یک عنوان خوانا لازم است. هرچه شناخته نشود، همان رشتهٔ خام
// برمی‌گردد تا اطلاعات گم نشود.

// ترتیب مهم است: Edge و Opera هر دو `Chrome` را هم در UA خود دارند، و کروم
// `Safari` را — پس عام‌ترین‌ها آخر می‌آیند.
const BROWSERS = [
  [/Edg\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

// اندروید هم در UA خود `Linux` دارد، پس باید قبل از لینوکس بیاید.
const SYSTEMS = [
  [/iPhone|iPad|iPod/, 'iOS', 'mobile'],
  [/Android/, 'اندروید', 'mobile'],
  [/Windows/, 'ویندوز', 'desktop'],
  [/Mac OS X|Macintosh/, 'مک', 'desktop'],
  [/Linux/, 'لینوکس', 'desktop'],
];

export function describeDevice(rawLabel) {
  const raw = (rawLabel || '').trim();
  if (!raw) return { browser: null, os: null, kind: 'desktop', raw: '', unknown: true };

  const browser = BROWSERS.find(([re]) => re.test(raw))?.[1] ?? null;
  const system = SYSTEMS.find(([re]) => re.test(raw));

  return {
    browser,
    os: system?.[1] ?? null,
    kind: system?.[2] ?? 'desktop',
    raw,
    // نه مرورگر شناخته شد نه سیستم — کامپوننت خودِ رشتهٔ خام را نشان می‌دهد.
    unknown: !browser && !system,
  };
}
