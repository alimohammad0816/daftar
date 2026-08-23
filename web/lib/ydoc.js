// یک Y.Doc برای هر روز — بند ۱۳.۳ در PLAN.md. همین سند بعداً (فاز ۳) میزبان
// `getXmlFragment('note')` هم می‌شود؛ تیک‌زدن یک کار و نوشتن متن همان روز
// اتمیک با هم همگام می‌مانند.
//
// نمونهٔ Y.Doc باید در کل عمر برنامه یکی بماند (نه هر رندر یک نمونهٔ تازه)،
// وگرنه observe/persistence از دست می‌رود؛ به همین دلیل این ماژول یک کش
// سطح-ماژول نگه می‌دارد.
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

const cache = new Map();

export function getDayDoc(dayKey) {
  let entry = cache.get(dayKey);
  if (entry) return entry;

  const ydoc = new Y.Doc();
  // IndexedDB فقط سمت کلاینت وجود دارد؛ روی سرور (SSR) سند فقط در حافظه می‌ماند.
  const provider = typeof window !== 'undefined' ? new IndexeddbPersistence(`daftar:day:${dayKey}`, ydoc) : null;

  entry = { ydoc, provider };
  cache.set(dayKey, entry);
  return entry;
}
