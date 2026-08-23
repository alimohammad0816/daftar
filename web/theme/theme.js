import { createTheme } from '@mui/material/styles';
import { faIR } from '@mui/material/locale';

// پالت آبی‌لاجوردی/فیروزه‌ای — هم‌راستا با تم landing پروژهٔ beeplan.
// قرمز تعطیلات جدا و ثابت می‌ماند؛ بند ۱۰ و ۱۴.۳ در PLAN.md: جای دیگری خرج نشود.
const PALETTE = {
  light: {
    accent: '#1B6EC4',
    accentLight: '#2D7DCD',
    accent2: '#0D9488',
    accent2Soft: '#14B8A6',
    bg: '#F4F7FC',
    paper: '#FFFFFF',
    ink: '#0E1E33',
    muted: '#5A78A0',
  },
  dark: {
    accent: '#5AA6F0',
    accentLight: '#86C4F4',
    accent2: '#6FE0D2',
    accent2Soft: '#A6ECE2',
    bg: '#070C16',
    paper: '#0C1422',
    ink: '#EAF0F8',
    muted: '#9DB8EC',
  },
};

const HOLIDAY_RED = '#B3261E';

export function getTheme(mode) {
  const p = PALETTE[mode];
  return createTheme(
    {
      direction: 'rtl',
      palette: {
        mode,
        primary: { main: p.accent, light: p.accentLight },
        secondary: { main: p.accent2, light: p.accent2Soft },
        holiday: { main: HOLIDAY_RED },
        background: { default: p.bg, paper: p.paper },
        text: { primary: p.ink, secondary: p.muted },
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: 'var(--font-vazirmatn), Tahoma, Arial, sans-serif',
      },
    },
    faIR,
  );
}
