'use client';

import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';

// پس‌زمینهٔ ثابتِ تمام‌صفحه — لکه‌های نوری آبی/فیروزه‌ای محو، پشت هر چیز دیگری.
// بدون این، بلور «شیشهٔ مایع» چیزی برای دیدن از پشتِ کارت‌ها ندارد و صرفاً
// خاکستری کدر به نظر می‌رسد؛ دقیقاً همان ترفندی که صفحات اپل استفاده می‌کنند.
export default function AppBackground() {
  const theme = useTheme();
  const { mode } = theme.palette;
  const o = mode === 'light' ? { a: 0.28, b: 0.22, c: 0.16 } : { a: 0.22, b: 0.18, c: 0.12 };

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        bgcolor: 'background.default',
        transition: 'background-color 0.2s',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-18%',
          insetInlineEnd: '-12%',
          width: { xs: 360, sm: 560 },
          height: { xs: 360, sm: 560 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, o.a)} 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-16%',
          insetInlineStart: '-14%',
          width: { xs: 380, sm: 600 },
          height: { xs: 380, sm: 600 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, o.b)} 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '32%',
          insetInlineStart: '38%',
          width: { xs: 300, sm: 460 },
          height: { xs: 300, sm: 460 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, o.c)} 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />
    </Box>
  );
}
