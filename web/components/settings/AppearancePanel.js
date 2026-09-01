'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useColorMode } from '@/theme/ThemeRegistry';
import { PALETTE_KEYS, paletteLabel, paletteSwatch } from '@/theme/theme';

// دو نقطهٔ رنگی از خودِ همان پالت (primary و secondary) — نمونه‌رنگ باید از
// منبع اصلی بیاید نه از یک کپیِ دستی، وگرنه با تغییر پالت از هم می‌پاشند.
function PaletteDots({ paletteKey, mode }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {paletteSwatch(paletteKey, mode).map((color) => (
        <Box
          key={color}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: color,
            border: '1px solid',
            borderColor: 'glass.border',
          }}
        />
      ))}
    </Box>
  );
}

// نوار بالا حذف شد؛ دکمهٔ تعویض حالت روشن/تاریک که آنجا بود حالا اینجاست،
// و پالت رنگی هم کنارش (هر پالت خودش نسخهٔ روشن و تیره دارد، پس این دو
// انتخاب مستقل‌اند نه چهار گزینهٔ درهم).
export default function AppearancePanel() {
  const { mode, toggleColorMode, palette, setPalette } = useColorMode();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography>پالت رنگی</Typography>
        <ToggleButtonGroup
          value={palette}
          exclusive
          onChange={(_e, next) => next && setPalette(next)}
          size="small"
          // با سه پالت به بالا، روی گوشی در یک خط جا نمی‌شوند.
          sx={{ flexWrap: 'wrap' }}
        >
          {PALETTE_KEYS.map((key) => (
            <ToggleButton
              key={key}
              value={key}
              aria-label={`پالت ${paletteLabel(key)}`}
              sx={{ minHeight: 44, gap: 0.75, px: 1.5, textTransform: 'none' }}
            >
              <PaletteDots paletteKey={key} mode={mode} />
              <Typography variant="body2">{paletteLabel(key)}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
