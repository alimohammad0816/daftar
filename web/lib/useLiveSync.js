'use client';

import { useEffect, useState } from 'react';
import { getDayDoc } from './ydoc';
import { SyncProvider } from './SyncProvider';

// یک SyncProvider برای هر docId، هم‌عمر با Y.Doc همان سند (lib/ydoc.js) —
// تعویض سند، پرووایدر قبلی را pause می‌کند نه destroy، دقیقاً مثل کش خود ydoc.
// این کش با getDoc فرقی نمی‌کند چون docId خودش (روز/note:{id}/index) یکتاست.
const providerCache = new Map();

function getProvider(docId, getDoc) {
  let provider = providerCache.get(docId);
  if (!provider) {
    const { ydoc } = getDoc(docId);
    provider = new SyncProvider(docId, ydoc);
    providerCache.set(docId, provider);
  }
  return provider;
}

// AuthGate تضمین می‌کند این هوک فقط وقتی مانت می‌شود که نشست معتبر است — پس
// اینجا دیگر نیازی به بررسی جداگانهٔ نشست نیست، فقط اتصال زنده در پیش‌زمینه
// (بند ۱۳.۵ مورد ۳: قطع در visibilitychange، همگام‌سازی کامل هنگام بازگشت).
// وضعیت‌های ممکن: connecting | connected | disconnected | error | paused
// getDoc پیش‌فرض getDayDoc است (سند روزانه)؛ فاز ۷ با getYDoc همین هوک را
// برای سند یادداشت آزاد و سند index هم استفاده می‌کند.
export function useLiveSync(docId, getDoc = getDayDoc) {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const provider = getProvider(docId, getDoc);
    const unsubscribe = provider.onStatus(setStatus);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') provider.connect();
      else provider.pause();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    if (document.visibilityState === 'visible') provider.connect();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribe();
      provider.pause();
    };
  }, [docId, getDoc]);

  return status;
}
