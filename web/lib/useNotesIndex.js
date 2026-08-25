'use client';

import { useCallback, useSyncExternalStore } from 'react';
import * as Y from 'yjs';
import { getYDoc } from './ydoc';
import { useLiveSync } from './useLiveSync';

const INDEX_DOC_ID = 'index';

// بند ۱۳.۳: «متادیتای فهرست‌ها در یک سند سبک جداگانه به‌نام index» — تا فهرست
// یادداشت‌های آزاد و جست‌وجو بدون باز کردن سند هر یادداشت کار کنند. هر عضو
// این Y.Map یک Y.Map دیگر است: {id, title, plain, dayKey, updatedAt, deletedAt}.
// dayKey طبق بند ۳ اختیاری است — یادداشت آزاد می‌تواند به یک روز مشخص هم
// وصل شود، بدون این‌که با یادداشت خودِ آن روز یکی شود.
// حذف طبق قاعدهٔ ۱ در CLAUDE.md فقط علامت‌گذاری (deletedAt) است، نه واقعاً حذف.
function toPlainEntry(ymap) {
  return {
    id: ymap.get('id'),
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
    entry.set('title', '');
    entry.set('plain', '');
    entry.set('dayKey', null);
    entry.set('updatedAt', now);
    entry.set('deletedAt', null);
    ydoc.transact(() => notesMap.set(id, entry));
    return id;
  }, [ydoc, notesMap]);

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

  return { notes, createNote, updateNoteMeta, deleteNote };
}
