'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { today, toDayKey } from '@/lib/jalali';
import MonthGrid from '@/components/calendar/MonthGrid';

// درخواست کاربر: صفحهٔ اصلی فقط تقویم است — انتخاب یک روز به بخش یادداشت و
// کارهای همان روز می‌رود (app/(main)/day/[dayKey]). یکسان در موبایل/تبلت/دسکتاپ.
export default function CalendarPage() {
  const router = useRouter();
  const [viewDate, setViewDate] = useState(() => today());

  const selectDay = useCallback(
    (date) => {
      router.push(`/day/${toDayKey(date)}`);
    },
    [router],
  );

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 640, p: { xs: 2, sm: 3 } }}>
        <MonthGrid viewDate={viewDate} selectedDate={null} onViewDateChange={setViewDate} onSelectDay={selectDay} />
      </Paper>
    </Box>
  );
}
