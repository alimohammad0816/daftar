'use client';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import MonthGrid from './MonthGrid';

// بند ۱۰ در PLAN.md — شبکهٔ ماه در موبایل داخل SwipeableDrawer anchor="bottom".
export default function MonthSheet({ open, onClose, onOpen, viewDate, selectedDate, onSelectDay, onViewDateChange }) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen
      slotProps={{ paper: { sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16 } } }}
    >
      <Box sx={{ pt: 1, pb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: 2,
            bgcolor: 'divider',
            mx: 'auto',
            mb: 1,
          }}
        />
        <MonthGrid
          viewDate={viewDate}
          selectedDate={selectedDate}
          onViewDateChange={onViewDateChange}
          onSelectDay={(date) => {
            onSelectDay(date);
            onClose();
          }}
        />
      </Box>
    </SwipeableDrawer>
  );
}
