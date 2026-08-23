'use client';

import * as React from 'react';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';

const STORAGE_KEY = 'daftar-color-mode';
const CHANGE_EVENT = 'daftar-color-mode-change';

export const ColorModeContext = React.createContext({
  mode: 'light',
  toggleColorMode: () => {},
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

export default function ThemeRegistry({ children }) {
  const mode = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        const next = mode === 'light' ? 'dark' : 'light';
        window.localStorage.setItem(STORAGE_KEY, next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
      },
    }),
    [mode],
  );

  const theme = React.useMemo(() => getTheme(mode), [mode]);

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
