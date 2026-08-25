'use client';

import { useState } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import { today } from '@/lib/jalali';
import { RADIUS_SM } from '@/theme/theme';
import MonthGrid from '@/components/calendar/MonthGrid';

// شیت پایین‌صفحه برای وصل‌کردن یک یادداشت آزاد به یک روز مشخص (بند ۳:
// dayKey برای یادداشت آزاد اختیاری است) — همان تقویم خودِ اپ، نه یک
// date-picker جدا.
export default function DayPickerSheet({ open, onClose, onOpen, selectedDate, onSelectDay }) {
  const [viewDate, setViewDate] = useState(() => selectedDate ?? today());

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen
      slotProps={{
        paper: {
          sx: { borderTopLeftRadius: RADIUS_SM, borderTopRightRadius: RADIUS_SM, border: 'none' },
        },
      }}
    >
      <Box sx={{ pt: 1.5, pb: 2 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'glass.border', mx: 'auto', mb: 1 }} />
        <MonthGrid
          viewDate={viewDate}
          selectedDate={selectedDate}
          onViewDateChange={setViewDate}
          onSelectDay={(date) => {
            onSelectDay(date);
            onClose();
          }}
        />
      </Box>
    </SwipeableDrawer>
  );
}
