import localFont from 'next/font/local';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { SessionProvider } from '@/lib/SessionContext';
import AuthGate from '@/components/auth/AuthGate';
import './globals.css';

const vazirmatn = localFont({
  src: '../public/fonts/Vazirmatn[wght].woff2',
  variable: '--font-vazirmatn',
  weight: '100 900',
  display: 'swap',
});

export const metadata = {
  title: 'دفتر',
  description: 'دفترچهٔ یادداشت روزانهٔ شخصی',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body>
        <ThemeRegistry>
          <SessionProvider>
            <AuthGate>{children}</AuthGate>
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
