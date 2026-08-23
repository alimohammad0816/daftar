'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { addDays, getWeekDays, toDayKey, WEEKDAY_SHORT } from '@/lib/jalali';
import { useSwipe } from '@/lib/useSwipe';
import DayCell from './DayCell';

// نوار هفته، پیش‌فرض موبایل — بند ۲ در PLAN.md. سوایپ روی خود نوار یک هفته
// جابه‌جا می‌کند؛ سوایپ روز-به-روز مسئولیت محتوای زیرش است.
export default function WeekStrip({ anchorDate, selectedDate, onSelectDay, onAnchorChange }) {
  const days = getWeekDays(anchorDate);
  const swipe = useSwipe({
    onSwipeLeft: () => onAnchorChange(addDays(anchorDate, 7)),
    onSwipeRight: () => onAnchorChange(addDays(anchorDate, -7)),
  });

  return (
    <Box
      {...swipe}
      sx={{ display: 'flex', justifyContent: 'space-between', px: 1, py: 1, touchAction: 'pan-y' }}
    >
      {days.map((date, i) => {
        const dayKey = toDayKey(date);
        return (
          <Box
            key={dayKey}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {WEEKDAY_SHORT[i]}
            </Typography>
            <DayCell date={date} selected={dayKey === toDayKey(selectedDate)} onSelect={onSelectDay} />
          </Box>
        );
      })}
    </Box>
  );
}
