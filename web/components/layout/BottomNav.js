'use client';

import { usePathname, useRouter } from 'next/navigation';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { navItems } from './navItems';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const current = navItems.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  );

  return (
    <Paper
      elevation={3}
      sx={{
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <BottomNavigation
        showLabels
        value={current?.href}
        onChange={(_event, value) => router.push(value)}
      >
        {navItems.map(({ href, label, Icon }) => (
          <BottomNavigationAction
            key={href}
            label={label}
            value={href}
            icon={<Icon />}
            sx={{ minWidth: 44, minHeight: 56 }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
