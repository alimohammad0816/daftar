'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Toolbar from './Toolbar';

// روی iOS Safari با position:fixed تولبار زیر کیبورد گم می‌شود — بند ۲ در
// PLAN.md: «این را در فاز ۳ جدی بگیر، وصله‌کردنش بعداً سخت است.»
// window.visualViewport ارتفاع واقعی صفحهٔ دیده‌شده را می‌دهد؛ فاصلهٔ بین
// innerHeight و آن، دقیقاً همان چیزی است که کیبورد پوشانده.
function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;

    const update = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setOffset(Math.max(0, Math.round(covered)));
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}

export default function MobileToolbar({ editor, fullscreen, onToggleFullscreen }) {
  const offset = useKeyboardOffset();

  // این کامپوننت فقط بعد از focus شدن ادیتور (تعامل کاربر) رندر می‌شود — بند
  // بالای Editor.js: `{focused && <MobileToolbar .../>}` — پس هیچ‌وقت وسط
  // SSR/hydration رندر نمی‌شود و document همیشه موجود است، بدون نیاز به
  // useEffect جدا برای «mounted».
  if (!editor || typeof document === 'undefined') return null;

  // Paper (theme.js: glassSx) روی هر کارتی backdropFilter می‌گذارد، و
  // backdrop-filter طبق اسپک CSS برای فرزندهای position:fixed یک containing
  // block تازه می‌سازد — یعنی اگر این تولبار داخل Paper ادیتور بماند، «فیکس»
  // بودنش نسبت به همان Paper است نه صفحه، پس با اسکرول صفحه جابه‌جا می‌شود و
  // روی متن می‌نشیند. با portal مستقیم به body، از هر containing block احتمالی
  // (Paper همین‌جا، یا هر جای دیگری در آینده) خارج می‌ماند.
  return createPortal(
    <Box
      sx={{
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        insetInline: 0,
        bottom: offset,
        // بالاتر از پوستهٔ تمام‌صفحهٔ ادیتور (appBar + 1) بنشیند، وگرنه در آن
        // حالت پشتش گم می‌شود. هنوز زیر BottomSheet جدول (drawer) می‌ماند.
        zIndex: (theme) => theme.zIndex.appBar + 2,
        bgcolor: 'glass.bg',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid',
        borderColor: 'glass.border',
      }}
    >
      <Toolbar editor={editor} fullscreen={fullscreen} onToggleFullscreen={onToggleFullscreen} />
    </Box>,
    document.body,
  );
}
