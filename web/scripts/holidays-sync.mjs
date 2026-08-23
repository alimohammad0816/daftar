#!/usr/bin/env node
// اجرای دستی سالی یک‌بار — بند ۵ در PLAN.md. اپ در زمان اجرا به این اسکریپت
// یا اینترنت وصل نمی‌شود؛ فقط data/holidays/<year>.json را می‌خواند.
//
// منبع: samanzamani/PersianHoliday (استخراج‌شده از time.ir). دو مسئلهٔ دادهٔ خام:
// ۱) ردیف اول هر ماه (day=1) گاهی همهٔ رویدادهای همان ماه را یک‌جا به‌عنوان یک
//    event بلند به day=1 می‌چسباند — با آستانهٔ طول عنوان (۱۲۰ نویسه) رد می‌شود.
// ۲) متن event با پیشوند «{روز} {نام ماه}» بدون فاصله شروع می‌شود؛ آن پیشوند را
//    جدا می‌کنیم تا فقط عنوان واقعی بماند.
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import initSqlJs from 'sql.js';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_URL = 'https://raw.githubusercontent.com/samanzamani/PersianHoliday/main/persian_holiday.db';
const OUT_DIR = path.join(__dirname, '..', 'data', 'holidays');
const CORRUPT_TITLE_LENGTH = 120;

// «اَمرداد» املای قدیمی همان «مرداد» است که دیتاست گاهی همین را به کار می‌برد.
const MONTH_VARIANTS = {
  1: ['فروردین'], 2: ['اردیبهشت'], 3: ['خرداد'], 4: ['تیر'],
  5: ['اَمرداد', 'مرداد'], 6: ['شهریور'], 7: ['مهر'], 8: ['آبان'],
  9: ['آذر'], 10: ['دی'], 11: ['بهمن'], 12: ['اسفند'],
};

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const toFaDigits = (s) => s.replace(/[0-9]/g, (d) => FA_DIGITS[d]);

async function fetchDb() {
  console.log('در حال دریافت دیتابیس از samanzamani/PersianHoliday…');
  const res = await fetch(DB_URL);
  if (!res.ok) throw new Error(`دریافت دیتابیس شکست خورد: HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

function extractYear(db, year) {
  const stmt = db.prepare('SELECT month, day, event, is_holiday FROM events WHERE year = :year ORDER BY month, day');
  stmt.bind({ ':year': year });

  const perDay = new Map();
  while (stmt.step()) {
    const { month, day, event, is_holiday } = stmt.getAsObject();
    if (!is_holiday) continue;

    const candidates = (MONTH_VARIANTS[month] || []).map((name) => `${day} ${name}`);
    const matched = candidates.find((c) => event.startsWith(c));
    if (!matched) continue;

    const title = event.slice(matched.length).trim();
    if (!title || title.length > CORRUPT_TITLE_LENGTH) continue;

    const key = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const titles = perDay.get(key) ?? [];
    if (!titles.includes(title)) titles.push(title);
    perDay.set(key, titles);
  }
  stmt.free();

  const out = {};
  for (const key of [...perDay.keys()].sort()) {
    out[key] = toFaDigits(perDay.get(key).join('، '));
  }
  return out;
}

async function main() {
  const years = process.argv.slice(2).map(Number).filter((n) => Number.isInteger(n) && n > 0);
  if (years.length === 0) {
    console.error('استفاده: yarn holidays:sync <سال> [سال...]');
    console.error('مثال:    yarn holidays:sync 1404 1405 1406');
    process.exitCode = 1;
    return;
  }

  const buffer = await fetchDb();
  const SQL = await initSqlJs({ locateFile: (file) => require.resolve(`sql.js/dist/${file}`) });
  const db = new SQL.Database(buffer);

  await mkdir(OUT_DIR, { recursive: true });
  for (const year of years) {
    const out = extractYear(db, year);
    const outPath = path.join(OUT_DIR, `${year}.json`);
    await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf-8');
    console.log(`${year}.json نوشته شد — ${Object.keys(out).length} روز تعطیل`);
  }
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
