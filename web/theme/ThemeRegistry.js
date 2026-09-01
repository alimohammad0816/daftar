'use client';

import * as React from 'react';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme, DEFAULT_PALETTE, PALETTE_KEYS } from './theme';

const STORAGE_KEY = 'daftar-color-mode';
const PALETTE_KEY = 'daftar-palette';
const CHANGE_EVENT = 'daftar-color-mode-change';

export const ColorModeContext = React.createContext({
  mode: 'light',
  toggleColorMode: () => {},
  palette: DEFAULT_PALETTE,
  setPalette: () => {},
});

export function useColorMode() {
  return React.useContext(ColorModeContext);
}

// خواندن ترجیح رنگ فقط سمت کلاینت ممکن است؛ سرور همیشه 'light' برمی‌گرداند
// تا رندر اول کلاینت با HTML سرور یکی باشد و React بعد از mount خودش هماهنگ کند.
function subscribe(callback) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  window.addEventListener('storage', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    media.removeEventListener('change', callback);
    window.removeEventListener('storage', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerSnapshot() {
  return 'light';
}

// پالت برخلاف حالت روشن/تیره معادل سیستمی ندارد؛ اگر چیزی ذخیره نشده باشد
// همان پیش‌فرض پروژه است. هر دو getSnapshot رشته برمی‌گردانند نه شیء — یعنی
// useSyncExternalStore خودش تشخیص تغییر می‌دهد و نیازی به کش نیست.
function getPaletteSnapshot() {
  const stored = window.localStorage.getItem(PALETTE_KEY);
  return PALETTE_KEYS.includes(stored) ? stored : DEFAULT_PALETTE;
}

function getPaletteServerSnapshot() {
  return DEFAULT_PALETTE;
}

export default function ThemeRegistry({ children }) {
  const mode = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const palette = React.useSyncExternalStore(subscribe, getPaletteSnapshot, getPaletteServerSnapshot);

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        const next = mode === 'light' ? 'dark' : 'light';
        window.localStorage.setItem(STORAGE_KEY, next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
      },
      palette,
      setPalette: (next) => {
        if (!PALETTE_KEYS.includes(next)) return;
        window.localStorage.setItem(PALETTE_KEY, next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
      },
    }),
    [mode, palette],
  );

  const theme = React.useMemo(() => getTheme(mode, palette), [mode, palette]);

  return (
    <AppRouterCacheProvider options={{ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
