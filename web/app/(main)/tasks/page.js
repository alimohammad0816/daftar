'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import { toDayKey, today, fromDayKey, formatDayNumber, formatMonthYear } from '@/lib/jalali';
import { useLiveSync } from '@/lib/useLiveSync';
import { useRollingTasks } from '@/lib/useRollingTasks';
import { toggleDayTask } from '@/lib/useDayTasks';
import TaskList from '@/components/tasks/TaskList';

// فقط سند همان روز را زنده نگه می‌دارد تا تیک‌زدن یک کار «رهاشده» از روزهای
// قبل روی سند درست بنشیند — رندری ندارد.
function DaySyncKeeper({ dayKey }) {
  useLiveSync(dayKey);
  return null;
}

// «کارها» طبق درخواست کاربر: امروز + کارهایی که خودش با پین‌کردن (rollover)
// گفته تا انجام نشدند همچنان دیده شوند — نه همهٔ کارهای ناتمام همهٔ تاریخ.
export default function TasksPage() {
  const todayKey = useMemo(() => toDayKey(today()), []);
  const rolling = useRollingTasks();
  const rollingFromPast = rolling.filter((t) => t.dayKey !== todayKey);
  const uniqueDayKeys = [...new Set(rollingFromPast.map((t) => t.dayKey))];

  return (
    <Box sx={{ pt: { xs: 1.5, sm: 2.5 }, width: '100%', maxWidth: 640, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {uniqueDayKeys.map((dayKey) => (
        <DaySyncKeeper key={dayKey} dayKey={dayKey} />
      ))}

      <TaskList key={todayKey} dayKey={todayKey} />

      {rollingFromPast.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 0.5, mb: 1 }}>
            رهاشده از روزهای قبل
          </Typography>
          <Paper elevation={0} sx={{ overflow: 'hidden' }}>
            {rollingFromPast.map((t, i) => {
              const date = fromDayKey(t.dayKey);
              return (
                <Box key={t.id}>
                  {i > 0 && <Divider sx={{ borderColor: 'glass.border' }} />}
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 1, minHeight: 52 }}>
                    <Checkbox
                      checked={false}
                      onChange={() => toggleDayTask(t.dayKey, t.id)}
                      sx={{ width: 44, height: 44 }}
                    />
                    <Typography sx={{ flexGrow: 1, minWidth: 0, fontSize: '0.9rem', overflowWrap: 'break-word' }}>
                      {t.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, pl: 1 }}>
                      {formatDayNumber(date)} {formatMonthYear(date)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
