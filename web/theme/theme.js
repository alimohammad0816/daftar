import { createTheme } from '@mui/material/styles';
import { faIR } from '@mui/material/locale';

// پالت طرح — بند ۱۰ و ۱۴.۳: قرمز فقط برای تعطیلات، جای دیگری خرج نشود.
const INDIGO = '#1A2238';
const TEAL = '#0E7C7B';
const PAPER = '#F5F3EC';
const HOLIDAY_RED = '#B3261E';

export function getTheme(mode) {
  return createTheme(
    {
      direction: 'rtl',
      palette: {
        mode,
        primary: { main: TEAL },
        holiday: { main: HOLIDAY_RED },
        ...(mode === 'light'
          ? {
              background: { default: PAPER, paper: '#FFFFFF' },
              text: { primary: INDIGO },
            }
          : {
              background: { default: '#12141C', paper: '#1A1D29' },
            }),
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: 'var(--font-vazirmatn), Tahoma, Arial, sans-serif',
      },
    },
    faIR,
  );
}
