'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useColorMode } from '@/theme/ThemeRegistry';

export default function TopBar() {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="default"
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar>
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
          دفتر
        </Typography>
        <IconButton
          onClick={toggleColorMode}
          aria-label={mode === 'light' ? 'حالت تیره' : 'حالت روشن'}
          sx={{ width: 44, height: 44 }}
        >
          {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
