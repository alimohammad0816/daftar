'use client';

import { useEffect, useState } from 'react';
import { getDayDoc } from './ydoc';
import { SyncProvider } from './SyncProvider';

// یک SyncProvider برای هر روز، هم‌عمر با Y.Doc همان روز (lib/ydoc.js) — تعویض
// روز، پرووایدر قبلی را pause می‌کند نه destroy، دقیقاً مثل کش خود ydoc.
const providerCache = new Map();

function getProvider(dayKey) {
  let provider = providerCache.get(dayKey);
  if (!provider) {
    const { ydoc } = getDayDoc(dayKey);
    provider = new SyncProvider(dayKey, ydoc);
    providerCache.set(dayKey, provider);
  }
  return provider;
}

// AuthGate تضمین می‌کند این هوک فقط وقتی مانت می‌شود که نشست معتبر است — پس
// اینجا دیگر نیازی به بررسی جداگانهٔ نشست نیست، فقط اتصال زنده در پیش‌زمینه
// (بند ۱۳.۵ مورد ۳: قطع در visibilitychange، همگام‌سازی کامل هنگام بازگشت).
// وضعیت‌های ممکن: connecting | connected | disconnected | error | paused
export function useLiveSync(dayKey) {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const provider = getProvider(dayKey);
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
  }, [dayKey]);

  return status;
}
