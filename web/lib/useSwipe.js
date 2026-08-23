'use client';

import { useRef, useCallback } from 'react';

const THRESHOLD_PX = 50;
// شروع کشیدن از روی چک‌باکس/دکمه/ورودی/ادیتور نباید سوایپ حساب شود — وگرنه
// انتخاب متن داخل TaskInput یا ادیتور TipTap (فاز ۳) می‌تواند روز را عوض کند.
const INTERACTIVE_SELECTOR =
  'input, textarea, button, [role="button"], [role="checkbox"], [contenteditable="true"]';

// سوایپ افقی با Pointer Events — هم لمسی و هم موس را پوشش می‌دهد، بدون کتابخانهٔ
// جانبی. قرارداد جهت: سوایپ به چپ (کشیدن انگشت راست→چپ) یعنی جلو/بعدی.
export function useSwipe({ onSwipeLeft, onSwipeRight }) {
  const start = useRef(null);

  const onPointerDown = useCallback((e) => {
    if (e.target.closest?.(INTERACTIVE_SELECTOR)) {
      start.current = null;
      return;
    }
    start.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) < THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    [onSwipeLeft, onSwipeRight],
  );

  return { onPointerDown, onPointerUp };
}
