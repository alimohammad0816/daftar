'use client';

import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import { formatDayNumber, isToday, toDayKey } from '@/lib/jalali';
import { isHoliday } from '@/lib/holidays';
import { RADIUS_SM } from '@/theme/theme';

export default function DayCell({ date, inMonth = true, selected = false, onSelect }) {
  const holiday = isHoliday(toDayKey(date));
  const todayFlag = isToday(date);

  return (
    <ButtonBase
      onClick={() => onSelect?.(date)}
      sx={{
        width: { xs: 44, sm: 56 },
        height: { xs: 44, sm: 56 },
        borderRadius: `${RADIUS_SM}px`,
        fontSize: { xs: '0.875rem', sm: '1.05rem' },
        fontWeight: selected || todayFlag ? 800 : 400,
        color: selected ? 'primary.contrastText' : holiday ? 'holiday.main' : 'text.primary',
        opacity: inMonth ? 1 : 0.35,
        bgcolor: selected
          ? 'primary.main'
          : todayFlag
            ? (theme) => alpha(theme.palette.primary.main, 0.16)
            : 'transparent',
        transition: 'background-color 0.15s, color 0.15s',
      }}
    >
      {formatDayNumber(date)}
    </ButtonBase>
  );
}
