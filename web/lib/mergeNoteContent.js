import { getDayDoc, getYDoc } from './ydoc';

// وقتی یادداشت آزاد به یک روز وصل می‌شود، درخواست کاربر: متنش گم نشود —
// به‌جای صرفاً یک برچسب متادیتا، محتوای یادداشت آزاد (کپی، نه جابه‌جایی) به
// انتهای سند همان روز اضافه می‌شود. سند خودِ یادداشت آزاد دست‌نخورده می‌ماند.
// clone() یک نسخهٔ جدا از هر Y.XmlElement/Y.XmlText می‌سازد که هنوز به هیچ
// سندی متصل نیست، پس می‌شود در سند دیگری push کرد — دقیقاً مکانیزم استاندارد
// Yjs برای کپی محتوا بین سندها.
export function appendNoteContentToDay(noteDocId, dayKey) {
  const { ydoc: sourceDoc } = getYDoc(noteDocId);
  const { ydoc: targetDoc } = getDayDoc(dayKey);
  const sourceFragment = sourceDoc.getXmlFragment('note');
  const targetFragment = targetDoc.getXmlFragment('note');
  const nodes = sourceFragment.toArray();
  if (nodes.length === 0) return;
  const cloned = nodes.map((node) => node.clone());
  targetDoc.transact(() => targetFragment.push(cloned));
}
