'use client';

import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { addDays, formatDayNumber, formatMonthYear, formatWeekdayLong, fromDayKey, toDayKey } from '@/lib/jalali';
import { getHoliday } from '@/lib/holidays';
import { useSwipe } from '@/lib/useSwipe';
import { useLiveSync } from '@/lib/useLiveSync';
import TaskList from '@/components/tasks/TaskList';
import Editor from '@/components/editor/Editor';

// از تقویم باز می‌شود (app/(main)/page.js) — یادداشت و کارهای همان یک روز.
// سوایپ افقی هم مثل قبل بین روزها جابه‌جا می‌کند، فقط حالا با تغییر مسیر.
export default function DayPage() {
  const { dayKey } = useParams();
  const router = useRouter();
  const date = fromDayKey(dayKey);
  const holiday = getHoliday(dayKey);
  useLiveSync(dayKey);

  const goToDay = (d) => router.push(`/day/${toDayKey(d)}`);
  const daySwipe = useSwipe({
    onSwipeLeft: () => goToDay(addDays(date, 1)),
    onSwipeRight: () => goToDay(addDays(date, -1)),
  });

  return (
    <Box {...daySwipe} sx={{ touchAction: 'pan-y', display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => router.push('/')} aria-label="بازگشت به تقویم" sx={{ width: 44, height: 44 }}>
          <ArrowForwardRoundedIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            {formatWeekdayLong(date)}، {formatDayNumber(date)} {formatMonthYear(date)}
          </Typography>
          {holiday && (
            <Typography variant="body2" sx={{ color: 'holiday.main', fontWeight: 600 }}>
              {holiday}
            </Typography>
          )}
        </Box>
      </Box>

      <TaskList key={dayKey} dayKey={dayKey} />

      <Box sx={{ flexGrow: 1 }}>
        <Editor key={dayKey} dayKey={dayKey} />
      </Box>
    </Box>
  );
}
