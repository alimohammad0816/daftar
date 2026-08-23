const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

// همهٔ اعداد فارسی — بند «قواعد رابط کاربری» در CLAUDE.md.
export function toFa(value) {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[d]);
}
