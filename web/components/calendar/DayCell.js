'use client';

import ButtonBase from '@mui/material/ButtonBase';
import { formatDayNumber, isToday, toDayKey } from '@/lib/jalali';
import { isHoliday } from '@/lib/holidays';

const CELL_SIZE = 44;

export default function DayCell({ date, inMonth = true, selected = false, onSelect }) {
  const holiday = isHoliday(toDayKey(date));
  const todayFlag = isToday(date);

  return (
    <ButtonBase
      onClick={() => onSelect?.(date)}
      sx={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: '50%',
        fontSize: '0.875rem',
        fontWeight: selected || todayFlag ? 800 : 400,
        color: selected ? 'primary.contrastText' : holiday ? 'holiday.main' : 'text.primary',
        opacity: inMonth ? 1 : 0.35,
        bgcolor: selected ? 'primary.main' : 'transparent',
        border: '2px solid',
        borderColor: !selected && todayFlag ? 'primary.main' : 'transparent',
        transition: 'background-color 0.15s, color 0.15s',
      }}
    >
      {formatDayNumber(date)}
    </ButtonBase>
  );
}
