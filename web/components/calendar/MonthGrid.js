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
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <IconButton
          size="small"
          onClick={() => onViewDateChange(addMonths(viewDate, -1))}
          aria-label="ماه قبل"
          sx={{ width: 44, height: 44 }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {formatMonthYear(viewDate)}
        </Typography>
        <IconButton
          size="small"
          onClick={() => onViewDateChange(addMonths(viewDate, 1))}
          aria-label="ماه بعد"
          sx={{ width: 44, height: 44 }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', justifyItems: 'center', mb: 0.5 }}>
        {WEEKDAY_SHORT.map((label, i) => (
          <Typography key={i} variant="caption" color="text.secondary">
            {label}
          </Typography>
        ))}
      </Box>

      {weeks.map((week, wi) => (
        <Box
          key={wi}
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', justifyItems: 'center', mb: 0.5 }}
        >
          {week.map(({ date, inMonth }) => (
            <DayCell
              key={toDayKey(date)}
              date={date}
              inMonth={inMonth}
              selected={toDayKey(date) === toDayKey(selectedDate)}
              onSelect={onSelectDay}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}
