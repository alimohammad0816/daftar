'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CalendarViewMonthRoundedIcon from '@mui/icons-material/CalendarViewMonthRounded';
import {
  addDays,
  formatDayNumber,
  formatMonthYear,
  formatWeekdayLong,
  today,
  toDayKey,
} from '@/lib/jalali';
import { getHoliday } from '@/lib/holidays';
import { useSwipe } from '@/lib/useSwipe';
import WeekStrip from '@/components/calendar/WeekStrip';
import MonthGrid from '@/components/calendar/MonthGrid';
import MonthSheet from '@/components/calendar/MonthSheet';
import TaskList from '@/components/tasks/TaskList';

export default function DayPage() {
  const [selectedDate, setSelectedDate] = useState(() => today());
  const [viewDate, setViewDate] = useState(() => today());
  const [sheetOpen, setSheetOpen] = useState(false);

  // انتخاب یک روز، هم انتخاب و هم ماهِ نمایشی را با هم به‌روز می‌کند؛ مرور ماه با
  // فلش‌های MonthGrid این را دست نمی‌زند — کاربر می‌تواند بدون تغییر انتخاب مرور کند.
  const selectDay = useCallback((date) => {
    setSelectedDate(date);
    setViewDate(date);
  }, []);

  const daySwipe = useSwipe({
    onSwipeLeft: () => selectDay(addDays(selectedDate, 1)),
    onSwipeRight: () => selectDay(addDays(selectedDate, -1)),
  });

  const dayKey = toDayKey(selectedDate);
  const holiday = getHoliday(dayKey);

  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 320,
          flexShrink: 0,
          borderInlineEnd: '1px solid',
          borderColor: 'divider',
        }}
      >
        <MonthGrid
          viewDate={viewDate}
          selectedDate={selectedDate}
          onViewDateChange={setViewDate}
          onSelectDay={selectDay}
        />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              pt: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {formatMonthYear(selectedDate)}
            </Typography>
            <IconButton
              onClick={() => setSheetOpen(true)}
              aria-label="نمایش شبکهٔ ماه"
              sx={{ width: 44, height: 44 }}
            >
              <CalendarViewMonthRoundedIcon />
            </IconButton>
          </Box>
          <WeekStrip
            anchorDate={selectedDate}
            selectedDate={selectedDate}
            onSelectDay={selectDay}
            onAnchorChange={selectDay}
          />
        </Box>

        <Box
          {...daySwipe}
          sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, touchAction: 'pan-y', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              {formatWeekdayLong(selectedDate)}، {formatDayNumber(selectedDate)} {formatMonthYear(selectedDate)}
            </Typography>
            {holiday && (
              <Typography sx={{ mt: 0.5, color: 'holiday.main', fontWeight: 600 }}>{holiday}</Typography>
            )}
          </Box>

          {/* key=dayKey: با عوض شدن روز، حالت باز/بسته و ref داخلی TaskList هم تازه شود */}
          <TaskList key={dayKey} dayKey={dayKey} />
        </Box>
      </Box>

      <MonthSheet
        open={sheetOpen}
        onOpen={() => setSheetOpen(true)}
        onClose={() => setSheetOpen(false)}
        viewDate={viewDate}
        selectedDate={selectedDate}
        onViewDateChange={setViewDate}
        onSelectDay={selectDay}
      />
    </Box>
  );
}
