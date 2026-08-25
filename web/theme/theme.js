import { createTheme, alpha } from '@mui/material/styles';
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
    glassBg: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.7)',
    glassShadow: '0 8px 32px rgba(20,45,80,0.10)',
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
    glassBg: 'rgba(22,32,52,0.55)',
    glassBorder: 'rgba(255,255,255,0.09)',
    glassShadow: '0 8px 32px rgba(0,0,0,0.45)',
  },
};

const HOLIDAY_RED = '#B3261E';

// یک مقیاس گردیِ هماهنگ، نه یک عدد ثابت همه‌جا — همه از همین دو مرحله می‌آیند
// تا هم یکدست باشند هم متناسب: کارت‌ها (پنل‌ها) کمی گردتر از کنترل‌های داخلشان
// (دکمه، فیلد، بلوک کد، کارت ضمیمه)؛ نوار شناور پایین یک استثنای عمدی است —
// کپسول کاملاً گرد، مثل تب‌بارهای شناور اپلی.
export const RADIUS = 20; // کارت‌ها/پنل‌ها (Paper)
export const RADIUS_SM = 16; // کنترل‌های داخل کارت‌ها — کمی کمتر از RADIUS برای هارمونی تودرتو

// «شیشهٔ مایع» اپلی: بک‌گراند نیمه‌شفاف + بلور پشت‌زمینه + حاشیهٔ نوری کم‌رنگ.
// هرجا Paper (کارت، Drawer، Dialog، Menu) استفاده شود همین ظاهر را می‌گیرد —
// یک‌بار اینجا تعریف می‌شود تا همه‌جای اپ یکدست بماند.
export function glassSx(p) {
  return {
    backgroundColor: p.glassBg,
    backgroundImage: 'none',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: `1px solid ${p.glassBorder}`,
    boxShadow: p.glassShadow,
  };
}

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
        glass: { bg: p.glassBg, border: p.glassBorder, shadow: p.glassShadow },
      },
      shape: { borderRadius: RADIUS },
      typography: {
        fontFamily: 'var(--font-vazirmatn), Tahoma, Arial, sans-serif',
      },
      components: {
        // AppBackground (position:fixed, z-index:-1) خودش رنگ پس‌زمینه را می‌کشد؛
        // اگر body هم مات باشد آن لکه‌های نوری هرگز دیده نمی‌شوند.
        MuiCssBaseline: {
          styleOverrides: { body: { backgroundColor: 'transparent' } },
        },
        MuiPaper: {
          styleOverrides: {
            root: glassSx(p),
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { borderRadius: RADIUS_SM, textTransform: 'none' },
          },
        },
        MuiButtonBase: {
          defaultProps: { disableRipple: false },
        },
        MuiTextField: {
          defaultProps: { variant: 'filled' },
        },
        MuiFilledInput: {
          styleOverrides: {
            root: {
              borderRadius: RADIUS_SM,
              overflow: 'hidden',
              backgroundColor: alpha(p.accent, mode === 'light' ? 0.05 : 0.08),
            },
          },
        },
      },
    },
    faIR,
  );
}
