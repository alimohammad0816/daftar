// wrapper نازک روی date-fns-jalali — بند ۷ و ۸ در PLAN.md.
// هفتهٔ ایرانی از شنبه شروع می‌شود؛ لوکال fa-IR همین را به‌عنوان weekStartsOn دارد.
import {
  addDays as _addDays,
  addMonths as _addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format as _format,
  isSameDay as _isSameDay,
  isSameMonth,
  isToday as _isToday,
  newDate,
  startOfMonth,
  startOfWeek,
} from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { toFa } from './toFa';

export const addDays = _addDays;
export const addMonths = _addMonths;
export const isSameDay = _isSameDay;
export const isToday = _isToday;

// نام یک‌حرفی روزها، از شنبه تا جمعه — همان ترتیبی که getWeekDays/getMonthGrid برمی‌گردانند.
export const WEEKDAY_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function today() {
  return new Date();
}

// تاریخ شمسی به‌صورت رشته: "1405-05-26" — همیشه ارقام لاتین، برای کلید و ایندکس.
export function toDayKey(date) {
  return _format(date, 'yyyy-MM-dd');
}

export function fromDayKey(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return newDate(y, m - 1, d);
}

export function formatMonthYear(date) {
  return `${_format(date, 'MMMM', { locale: faIR })} ${toFa(_format(date, 'yyyy'))}`;
}

export function formatDayNumber(date) {
  return toFa(_format(date, 'd'));
}

export function formatWeekdayLong(date) {
  return _format(date, 'EEEE', { locale: faIR });
}

// هفتی که `date` در آن است، شنبه تا جمعه.
export function getWeekDays(date) {
  return eachDayOfInterval({
    start: startOfWeek(date, { locale: faIR }),
    end: endOfWeek(date, { locale: faIR }),
  });
}

// شبکهٔ کامل ماه برای MonthGrid: آرایه‌ای از هفته‌ها، هرکدام ۷ خانه، شامل
// روزهای ابتدا/انتهای ماه‌های مجاور تا هفته‌ها کامل شوند.
export function getMonthGrid(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { locale: faIR });
  const gridEnd = endOfWeek(monthEnd, { locale: faIR });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd }).map((d) => ({
    date: d,
    inMonth: isSameMonth(d, date),
  }));

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}
