'use client';

import { useCallback, useSyncExternalStore } from 'react';
import * as Y from 'yjs';
import { getYDoc } from './ydoc';
import { useLiveSync } from './useLiveSync';

const INDEX_DOC_ID = 'index';
const PLAIN_SNIPPET_LENGTH = 200;

// بند ۱۳.۳: «متادیتای فهرست‌ها در یک سند سبک جداگانه به‌نام index» — تا فهرست
// یادداشت‌ها (روزانه + آزاد) و جست‌وجو بدون باز کردن سند هر یادداشت کار کنند.
// هر عضو این Y.Map یک Y.Map دیگر است:
// {id, kind: 'daily'|'free', title, plain, dayKey, updatedAt, deletedAt}.
// یادداشت روزانه: id همان dayKey است، خودش را lazily از useDayNoteIndexSync
// می‌سازد (اولین باری که متنی در سند آن روز نوشته شود).
// یادداشت آزاد: dayKey طبق بند ۳ اختیاری است — می‌تواند به یک روز مشخص هم
// وصل شود، بدون این‌که با سند خودِ آن روز یکی شود.
// حذف طبق قاعدهٔ ۱ در CLAUDE.md فقط علامت‌گذاری (deletedAt) است — این فقط
// دربارهٔ یادداشت آزاد صدق می‌کند؛ ورودی یادداشت روزانه یک کش مشتق‌شده از سند
// خودِ آن روز است، نه دادهٔ اصلی، پس با خالی‌شدن متن به‌سادگی حذف می‌شود.
function toPlainEntry(ymap) {
  return {
    id: ymap.get('id'),
    kind: ymap.get('kind') ?? 'free',
    title: ymap.get('title'),
    plain: ymap.get('plain'),
    dayKey: ymap.get('dayKey') ?? null,
    updatedAt: ymap.get('updatedAt'),
    deletedAt: ymap.get('deletedAt'),
  };
}

const snapshotCache = new WeakMap();

function computeSnapshot(notesMap) {
  const snapshot = [...notesMap.values()]
    .map(toPlainEntry)
    .filter((n) => !n.deletedAt)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  snapshotCache.set(notesMap, snapshot);
  return snapshot;
}

const EMPTY = [];

export function useNotesIndex() {
  useLiveSync(INDEX_DOC_ID, getYDoc);
  const { ydoc } = getYDoc(INDEX_DOC_ID);
  const notesMap = ydoc.getMap('notes');

  const subscribe = useCallback(
    (onStoreChange) => {
      const handler = () => {
        computeSnapshot(notesMap);
        onStoreChange();
      };
      notesMap.observeDeep(handler);
      return () => notesMap.unobserveDeep(handler);
    },
    [notesMap],
  );

  const getSnapshot = useCallback(
    () => snapshotCache.get(notesMap) ?? computeSnapshot(notesMap),
    [notesMap],
  );

  const getServerSnapshot = useCallback(() => EMPTY, []);

  const notes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const createNote = useCallback(() => {
    const id = crypto.randomUUID();
    const entry = new Y.Map();
    const now = new Date().toISOString();
    entry.set('id', id);
    entry.set('kind', 'free');
    entry.set('title', '');
    entry.set('plain', '');
    entry.set('dayKey', null);
    entry.set('updatedAt', now);
    entry.set('deletedAt', null);
    ydoc.transact(() => notesMap.set(id, entry));
    return id;
  }, [ydoc, notesMap]);

  // یادداشت روزانه ساخت صریح ندارد — همین که کاربر در ادیتور همان روز چیزی
  // نوشت این ورودی lazily ساخته می‌شود؛ خالی‌شدن کامل متن یعنی دیگر لازم
  // نیست در فهرست/جست‌وجو باشد.
  const setDailyNoteText = useCallback(
    (dayKey, text) => {
      const trimmed = text.trim();
      ydoc.transact(() => {
        if (!trimmed) {
          notesMap.delete(dayKey);
          return;
        }
        let entry = notesMap.get(dayKey);
        if (!entry) {
          entry = new Y.Map();
          entry.set('id', dayKey);
          entry.set('kind', 'daily');
          entry.set('dayKey', dayKey);
          entry.set('title', '');
          entry.set('deletedAt', null);
          notesMap.set(dayKey, entry);
        }
        entry.set('plain', trimmed.slice(0, PLAIN_SNIPPET_LENGTH));
        entry.set('updatedAt', new Date().toISOString());
      });
    },
    [ydoc, notesMap],
  );

  const updateNoteMeta = useCallback(
    (id, patch) => {
      ydoc.transact(() => {
        const entry = notesMap.get(id);
        if (!entry) return;
        for (const [key, value] of Object.entries(patch)) entry.set(key, value);
        entry.set('updatedAt', new Date().toISOString());
      });
    },
    [ydoc, notesMap],
  );

  const deleteNote = useCallback(
    (id) => {
      ydoc.transact(() => {
        const entry = notesMap.get(id);
        if (!entry) return;
        entry.set('deletedAt', new Date().toISOString());
      });
    },
    [ydoc, notesMap],
  );

  return { notes, createNote, updateNoteMeta, deleteNote, setDailyNoteText };
}
