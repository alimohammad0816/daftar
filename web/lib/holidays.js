// بند ۵ در PLAN.md — مهم‌ترین نکتهٔ داده‌ای پروژه.
//
// خورشیدی ثابت: هر سال روی همان ماه/روز می‌افتند، پس همین‌جا هاردکد می‌شوند و
// حتی برای سال‌هایی که هنوز JSON ندارند کار می‌کنند.
//
// قمری متغیر: محاسبه‌پذیر نیستند. از data/holidays/<year>.json می‌آیند که با
// `yarn holidays:sync <year>` ساخته می‌شود (اسکریپت: scripts/holidays-sync.mjs).
// هر سال تازه که سینک شد، importش را هم به HOLIDAYS_BY_YEAR زیر اضافه کن.
import holidays1404 from '../data/holidays/1404.json';
import holidays1405 from '../data/holidays/1405.json';
import holidays1406 from '../data/holidays/1406.json';

const HOLIDAYS_BY_YEAR = {
  1404: holidays1404,
  1405: holidays1405,
  1406: holidays1406,
};

const FIXED_SOLAR = {
  '01-01': 'عید نوروز',
  '01-02': 'عید نوروز',
  '01-03': 'عید نوروز',
  '01-04': 'عید نوروز',
  '01-12': 'روز جمهوری اسلامی',
  '01-13': 'سیزده به‌در',
  '03-14': 'رحلت امام خمینی',
  '03-15': 'قیام ۱۵ خرداد',
  '11-22': 'پیروزی انقلاب اسلامی',
  '12-29': 'روز ملی‌شدن صنعت نفت',
};

// عنوان تعطیلی روز، یا null اگر تعطیل نیست.
export function getHoliday(dayKey) {
  const [year, month, day] = dayKey.split('-');
  const fixed = FIXED_SOLAR[`${month}-${day}`];
  if (fixed) return fixed;
  return HOLIDAYS_BY_YEAR[year]?.[dayKey] ?? null;
}

export function isHoliday(dayKey) {
  return getHoliday(dayKey) !== null;
}
