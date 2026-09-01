'use client';

import { useEffect, useRef, useState } from 'react';

// نزدیک بالای صفحه، جزیره همیشه دیده می‌شود — وگرنه در صفحه‌های کوتاه که
// اسکرول‌شان چند ده پیکسل بیشتر نیست، یک تکان کوچک آن را پنهان می‌کرد.
const ALWAYS_VISIBLE_ABOVE = 80;
// آستانه تا لرزش انگشت/ترک‌پد (و کشسانی انتهای صفحه در iOS) نوار را نلرزاند.
const THRESHOLD = 8;

// اسکرول به پایین یعنی «دارم محتوا می‌خوانم، نوار را بردار»؛ اسکرول به بالا
// یعنی «دنبال ناوبری‌ام، برگرد». همان الگوی آشنای نوار پایین موبایل.
// اسکرول‌کننده خودِ سند است (AppShell هیچ ظرف overflow جدایی ندارد)، پس
// شنونده روی window می‌نشیند.
export function useHideOnScrollDown(resetKey) {
  const [hidden, setHidden] = useState(false);
  const [seenKey, setSeenKey] = useState(resetKey);
  const lastY = useRef(0);
  const ticking = useRef(false);

  // با عوض‌شدن صفحه، اسکرول به بالا برمی‌گردد؛ نوار هم باید پیدا باشد. این
  // همان الگوی رسمی «تنظیم state هنگام تغییر ورودی» است — نه افکت: افکتی که
  // در بدنه‌اش setState صدا بزند یک رندر آبشاری اضافه می‌سازد (و قانون
  // react-hooks/set-state-in-effect هم جلویش را می‌گیرد).
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setHidden(false);
  }

  useEffect(() => {
    lastY.current = Math.max(0, window.scrollY);

    const evaluate = () => {
      ticking.current = false;
      // scrollY در iOS هنگام کشسانی منفی می‌شود.
      const y = Math.max(0, window.scrollY);
      if (y < ALWAYS_VISIBLE_ABOVE) {
        lastY.current = y;
        setHidden(false);
        return;
      }
      const delta = y - lastY.current;
      // زیر آستانه، lastY عمداً به‌روز نمی‌شود تا حرکت‌های ریز روی هم جمع شوند.
      if (Math.abs(delta) < THRESHOLD) return;
      lastY.current = y;
      setHidden(delta > 0);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(evaluate);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [resetKey]);

  return hidden;
}
