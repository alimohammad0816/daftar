'use client';

import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { navItems } from './navItems';
import { useEditorFocus } from '@/lib/EditorFocusContext';
import { useHideOnScrollDown } from '@/lib/useHideOnScrollDown';

// درخواست کاربر: بدون sidebar — همان ناوبری پایین («island») در هر سه حالت
// موبایل/تبلت/دسکتاپ، شناور و شیشه‌ای، نه یک نوار کامل‌عرض ثابت.
export default function IslandNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { focused } = useEditorFocus();
  // با هر تغییر مسیر از نو پیدا می‌شود (اسکرول هم به بالا برمی‌گردد).
  const hidden = useHideOnScrollDown(pathname);

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
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
        zIndex: (theme) => theme.zIndex.appBar,
        // موبایل هنگام فوکوس ادیتور: MobileToolbar کف صفحه می‌نشیند، این جزیره
        // موقتاً کنار می‌رود تا دو نوار روی هم تلنبار نشوند. آن حالت با display
        // است نه transform، چون باید کاملاً از جریان بیرون برود.
        display: { xs: focused ? 'none' : 'flex', sm: 'flex' },
        // پنهان‌شدن خودکار با اسکرول به پایین. با transform جابه‌جا می‌شود نه
        // bottom، تا روی لایهٔ ترکیب مرورگر بماند و کنارِ backdrop-filter تکان
        // نخورد. translateX(-50%) همان وسط‌چین‌کنندهٔ قبلی است و باید بماند —
        // stylis-plugin-rtl فقط همان جزء را آینه می‌کند (به translateX(50%)
        // کنار right: 50%) و translateY را دست نمی‌زند.
        transform: hidden
          ? 'translateX(-50%) translateY(calc(100% + 24px))'
          : 'translateX(-50%)',
        opacity: hidden ? 0 : 1,
        // بعد از رفتن، نباید کلیک‌های همان ناحیه را بگیرد.
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'transform 0.25s ease, opacity 0.2s ease',
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
