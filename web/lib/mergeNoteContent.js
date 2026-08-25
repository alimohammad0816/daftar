import { getDayDoc, getYDoc } from './ydoc';

// کپیِ محتوای یک سند یادداشت به انتهای سند یادداشت دیگر — clone() یک نسخهٔ
// جدا از هر Y.XmlElement/Y.XmlText می‌سازد که هنوز به هیچ سندی متصل نیست،
// پس می‌شود در سند دیگری push کرد (مکانیزم استاندارد Yjs برای کپی محتوا
// بین سندها). سند مبدأ دست‌نخورده می‌ماند — این کپی است، نه جابه‌جایی.
export function appendNoteContent(sourceDocId, targetDocId) {
  const { ydoc: sourceDoc } = getYDoc(sourceDocId);
  const { ydoc: targetDoc } = getYDoc(targetDocId);
  const sourceFragment = sourceDoc.getXmlFragment('note');
  const targetFragment = targetDoc.getXmlFragment('note');
  const nodes = sourceFragment.toArray();
  if (nodes.length === 0) return;
  const cloned = nodes.map((node) => node.clone());
  targetDoc.transact(() => targetFragment.push(cloned));
}

export function hasLegacyDayNoteContent(dayKey) {
  const { ydoc } = getDayDoc(dayKey);
  return ydoc.getXmlFragment('note').length > 0;
}

// پیش از این معماری، هر روز سند مستقل خودش را برای یادداشت داشت
// (getDayDoc(dayKey))؛ حالا یادداشت یک نهاد مستقل است که فقط اختیاری به یک
// روز وصل می‌شود. این تابع یک‌بار محتوای قدیمیِ باقی‌مانده در سند آن روز را
// به یادداشت تازه‌ساخته‌شده منتقل می‌کند و بعد پاکش می‌کند — چیزی از دست
// نرود. فیلد tasks همان سند دست‌نخورده می‌ماند، چون کارها همچنان همان‌جایند.
export function migrateLegacyDayNote(dayKey, targetNoteDocId) {
  const { ydoc: dayDoc } = getDayDoc(dayKey);
  const { ydoc: noteDoc } = getYDoc(targetNoteDocId);
  const legacyFragment = dayDoc.getXmlFragment('note');
  const targetFragment = noteDoc.getXmlFragment('note');
  const nodes = legacyFragment.toArray();
  if (nodes.length === 0) return false;
  const cloned = nodes.map((node) => node.clone());
  noteDoc.transact(() => targetFragment.push(cloned));
  dayDoc.transact(() => legacyFragment.delete(0, legacyFragment.length));
  return true;
}
