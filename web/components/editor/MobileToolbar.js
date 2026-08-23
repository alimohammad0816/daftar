'use client';

import { useEffect, useState } from 'react';
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

export default function MobileToolbar({ editor }) {
  const offset = useKeyboardOffset();

  if (!editor) return null;

  return (
    <Box
      sx={{
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        insetInline: 0,
        bottom: offset,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar editor={editor} />
    </Box>
  );
}
