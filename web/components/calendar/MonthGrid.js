'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { addMonths, formatMonthYear, getMonthGrid, toDayKey, WEEKDAY_SHORT } from '@/lib/jalali';
import DayCell from './DayCell';

export default function MonthGrid({ viewDate, selectedDate, onSelectDay, onViewDateChange }) {
  const weeks = getMonthGrid(viewDate);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2.5 } }}>
        <IconButton
          onClick={() => onViewDateChange(addMonths(viewDate, -1))}
          aria-label="ماه قبل"
          sx={{ width: 44, height: 44 }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {formatMonthYear(viewDate)}
        </Typography>
        <IconButton
          onClick={() => onViewDateChange(addMonths(viewDate, 1))}
          aria-label="ماه بعد"
          sx={{ width: 44, height: 44 }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', justifyItems: 'center', mb: 1 }}>
        {WEEKDAY_SHORT.map((label, i) => (
          <Typography key={i} variant="body2" sx={{ fontWeight: 600 }} color="text.secondary">
            {label}
          </Typography>
        ))}
      </Box>

      {weeks.map((week, wi) => (
        <Box
          key={wi}
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', justifyItems: 'center', mb: { xs: 0.5, sm: 1 } }}
        >
          {week.map(({ date, inMonth }) => (
            <DayCell
              key={toDayKey(date)}
              date={date}
              inMonth={inMonth}
              selected={!!selectedDate && toDayKey(date) === toDayKey(selectedDate)}
              onSelect={onSelectDay}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}
