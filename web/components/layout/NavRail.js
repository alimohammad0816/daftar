'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { navItems } from './navItems';

const RAIL_WIDTH = 240;

export default function NavRail() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        display: { xs: 'none', sm: 'block' },
        width: RAIL_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: RAIL_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          دفتر
        </Typography>
      </Toolbar>
      <List>
        {navItems.map(({ href, label, Icon }) => {
          const selected = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <ListItem key={href} disablePadding>
              <ListItemButton
                component={Link}
                href={href}
                selected={selected}
                sx={{ minHeight: 44 }}
              >
                <ListItemIcon>
                  <Icon color={selected ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
