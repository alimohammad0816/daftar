'use client';

import { useCallback, useEffect, useState } from 'react';

// محتوای ادیتور همیشه فوری در Y.Doc نوشته می‌شود (بند ۱۳.۳) — این هوک چیزی
// را که قبلاً ذخیره نشده ذخیره نمی‌کند، فقط debounce نوشتن خلاصهٔ متن در
// سند index را زودتر می‌شکند و به کاربر تأیید بصری می‌دهد؛ دکمهٔ «ذخیره»
// دستی و Ctrl+S/Cmd+S هر دو همین کار را می‌کنند.
export function useManualSave(editorRef) {
  const [toastOpen, setToastOpen] = useState(false);

  const handleSave = useCallback(() => {
    editorRef.current?.flushTextChange();
    setToastOpen(true);
  }, [editorRef]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const closeToast = useCallback(() => setToastOpen(false), []);

  return { handleSave, toastOpen, closeToast };
}
