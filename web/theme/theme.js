import { createTheme, alpha } from '@mui/material/styles';
import { faIR } from '@mui/material/locale';

// دو پالت، هرکدام با نسخهٔ روشن و تیره. نام توکن‌ها در هر دو یکی است، پس
// هیچ کامپوننتی نمی‌داند کدام پالت فعال است — عوض‌کردن پالت فقط همین جدول را
// عوض می‌کند (AppBackground هم از primary/secondary همین‌جا تغذیه می‌شود).
//
// azure — پالت اصلی دفتر، هم‌راستا با تم landing پروژهٔ beeplan (بند ۱۰).
// turquoise — از پروژهٔ beehoosh-web (src/theme/tokens.js) آورده شده.
//
// در پالت فیروزه‌ای، نقشِ هر رنگ مهم‌تر از روشنی‌اش است: در حالت روشن تیره‌ترین
// فیروزه‌ای رنگ متن است و در تیره روشن‌ترین‌شان — به همین دلیل primary در دو
// حالت از دو سرِ طیف می‌آید. فیروزه‌ای پرقدرت (#0FB5AB) عمداً primary نشده:
// سفید رویش ۲.۵۶:۱ است و در هیچ حالتی به‌عنوان رنگ متن قبول نمی‌شود.
// قرمز تعطیلات جدا و ثابت می‌ماند؛ بند ۱۰ و ۱۴.۳: جای دیگری خرج نشود.
const PALETTES = {
  azure: {
    label: 'لاجوردی',
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
  },
  turquoise: {
    label: 'فیروزه‌ای',
    light: {
      accent: '#06736F', // turqInk — تنها فیروزه‌ایِ مجاز برای متن در حالت روشن
      accentLight: '#0FB5AB', // turqFill — فقط سطح را پر می‌کند، متن نمی‌شود
      accent2: '#1B6EC4', // azure
      accent2Soft: '#4A8FD6',
      bg: '#F2F7F8', // paper — سفید خالص نیست، ته‌مایهٔ فیروزه‌ای دارد
      paper: '#FFFFFF', // surface
      ink: '#08222B',
      muted: '#52707A',
      glassBg: 'rgba(255,255,255,0.72)',
      glassBorder: 'rgba(255,255,255,0.9)',
      glassShadow: '0 12px 34px rgba(22,48,84,0.10)',
    },
    dark: {
      accent: '#19D3C4', // turqInk در تیره روشن‌ترین است، نقش عوض نمی‌شود
      accentLight: '#5FE3D4', // turqGlow
      accent2: '#5AA6F0',
      accent2Soft: '#86C4F4',
      bg: '#04141A',
      paper: '#0A2029', // surface
      ink: '#EAF7F8',
      muted: '#7FA3AC',
      glassBg: 'rgba(11,34,43,0.62)',
      glassBorder: 'rgba(255,255,255,0.08)',
      glassShadow: '0 12px 40px rgba(0,0,0,0.55)',
    },
  },
};

export const PALETTE_KEYS = Object.keys(PALETTES);
export const DEFAULT_PALETTE = 'azure';
export const paletteLabel = (key) => PALETTES[key]?.label ?? PALETTES[DEFAULT_PALETTE].label;
// نمونه‌رنگ انتخابگر تنظیمات: دو رنگ شاخص همان پالت، مستقیم از همین جدول.
// عمداً getTheme صدا زده نمی‌شود — ساختن یک تم کامل MUI فقط برای دو نقطهٔ
// رنگی، هر بار رندر، گران است.
export const paletteSwatch = (key, mode) => {
  const p = (PALETTES[key] ?? PALETTES[DEFAULT_PALETTE])[mode];
  return [p.accent, p.accent2];
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

export function getTheme(mode, paletteKey = DEFAULT_PALETTE) {
  const p = (PALETTES[paletteKey] ?? PALETTES[DEFAULT_PALETTE])[mode];
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
