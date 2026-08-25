'use client';

import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { navItems } from './navItems';
import { useEditorFocus } from '@/lib/EditorFocusContext';

// درخواست کاربر: بدون sidebar — همان ناوبری پایین («island») در هر سه حالت
// موبایل/تبلت/دسکتاپ، شناور و شیشه‌ای، نه یک نوار کامل‌عرض ثابت.
export default function IslandNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { focused } = useEditorFocus();

  // صفحهٔ یک روز (/day/...) از دل تقویم باز می‌شود؛ همان آیتم «تقویم» فعال بماند.
  const current = navItems.find((item) =>
    item.href === '/' ? pathname === '/' || pathname.startsWith('/day') : pathname.startsWith(item.href),
  );

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
        zIndex: (theme) => theme.zIndex.appBar,
        // موبایل هنگام فوکوس ادیتور: MobileToolbar کف صفحه می‌نشیند، این جزیره
        // موقتاً کنار می‌رود تا دو نوار روی هم تلنبار نشوند.
        display: { xs: focused ? 'none' : 'flex', sm: 'flex' },
        alignItems: 'center',
        gap: 0.5,
        p: 0.75,
        // استثنای عمدی مقیاس گردی: نوار شناور، نه یک پنل — کپسول کاملاً گرد.
        borderRadius: '999px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        bgcolor: 'glass.bg',
        border: '1px solid',
        borderColor: 'glass.border',
        boxShadow: (theme) => theme.palette.glass.shadow,
      }}
    >
      {navItems.map(({ href, label, Icon }) => {
        const selected = current?.href === href;
        return (
          <ButtonBase
            key={href}
            onClick={() => router.push(href)}
            aria-label={label}
            aria-current={selected ? 'page' : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '999px',
              color: selected ? 'primary.main' : 'text.secondary',
              transition: 'color 0.2s, transform 0.15s',
              '&:active': { transform: 'scale(0.94)' },
            }}
          >
            <Icon />
          </ButtonBase>
        );
      })}
    </Box>
  );
}
