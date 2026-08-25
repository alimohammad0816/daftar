'use client';

import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';
import { addDays, formatDayNumber, formatMonthYear, formatWeekdayLong, fromDayKey, toDayKey } from '@/lib/jalali';
import { getHoliday } from '@/lib/holidays';
import { useSwipe } from '@/lib/useSwipe';
import { useLiveSync } from '@/lib/useLiveSync';
import { useNotesIndex } from '@/lib/useNotesIndex';
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

  // یادداشت آزادِ متصل به این روز (بند ۳: dayKey اختیاری) فقط یک برچسب روی
  // سند مستقل خودش است، با سند این روز ادغام نمی‌شود — پس اینجا باید صریح
  // لینکش را نشان بدهیم وگرنه از دید کاربر «گم» به نظر می‌رسد.
  const { notes } = useNotesIndex();
  const linkedNotes = notes.filter((n) => n.dayKey === dayKey);

  const goToDay = (d) => router.push(`/day/${toDayKey(d)}`);
  const daySwipe = useSwipe({
    onSwipeLeft: () => goToDay(addDays(date, 1)),
    onSwipeRight: () => goToDay(addDays(date, -1)),
  });

  return (
    <Box
      {...daySwipe}
      sx={{
        touchAction: 'pan-y',
        width: '100%',
        maxWidth: 720,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
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

      {linkedNotes.length > 0 && (
        <Paper elevation={0} sx={{ overflow: 'hidden' }}>
          {linkedNotes.map((note, i) => (
            <Box key={note.id}>
              {i > 0 && <Divider sx={{ borderColor: 'glass.border' }} />}
              <ButtonBase
                onClick={() => router.push(`/notes/${note.id}`)}
                sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'start', px: 2, minHeight: 52 }}
              >
                <StickyNote2RoundedIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                <Typography noWrap sx={{ fontSize: '0.9rem' }}>
                  {note.title || 'بی‌عنوان'}
                </Typography>
              </ButtonBase>
            </Box>
          ))}
        </Paper>
      )}

      <TaskList key={dayKey} dayKey={dayKey} />

      <Box sx={{ flexGrow: 1 }}>
        <Editor key={dayKey} docId={dayKey} />
      </Box>
    </Box>
  );
}
