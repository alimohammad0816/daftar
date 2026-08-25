'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useColorMode } from '@/theme/ThemeRegistry';

// نوار بالا حذف شد؛ دکمهٔ تعویض حالت روشن/تاریک که آنجا بود حالا اینجاست.
export default function AppearancePanel() {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography>حالت نمایش</Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_e, newMode) => {
          if (newMode && newMode !== mode) toggleColorMode();
        }}
        size="small"
      >
        <ToggleButton value="light" aria-label="حالت روشن" sx={{ minWidth: 44, minHeight: 44 }}>
          <LightModeRoundedIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="dark" aria-label="حالت تیره" sx={{ minWidth: 44, minHeight: 44 }}>
          <DarkModeRoundedIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
