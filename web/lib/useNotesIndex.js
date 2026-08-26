'use client';

import { useCallback, useSyncExternalStore } from 'react';
import * as Y from 'yjs';
import { getYDoc } from './ydoc';
import { useLiveSync } from './useLiveSync';
import { appendNoteContent } from './mergeNoteContent';

const INDEX_DOC_ID = 'index';
const PLAIN_SNIPPET_LENGTH = 200;

// بند ۱۳.۳: «متادیتای فهرست‌ها در یک سند سبک جداگانه به‌نام index» — تا فهرست
// یادداشت‌ها و جست‌وجو بدون باز کردن سند هر یادداشت کار کنند.
// یک یادداشت وجود دارد، نه دو نوع جدا — هر یادداشت سند مستقل خودش را دارد
// (`note:{id}`) و اختیاری به یک روز وصل می‌شود (dayKey، بند ۳). حداکثر یک
// یادداشت می‌تواند به یک روز وصل باشد — connectNoteToDay این را تضمین می‌کند.
// هر عضو این Y.Map یک Y.Map دیگر است: {id, title, plain, dayKey, tags, updatedAt, deletedAt}.
// حذف طبق قاعدهٔ ۱ در CLAUDE.md فقط علامت‌گذاری (deletedAt) است، نه واقعاً حذف.
function toPlainEntry(ymap) {
  return {
    id: ymap.get('id'),
    title: ymap.get('title'),
    plain: ymap.get('plain'),
    dayKey: ymap.get('dayKey') ?? null,
    tags: ymap.get('tags') ?? [],
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

  const createNote = useCallback(
    (dayKey = null) => {
      const id = crypto.randomUUID();
      const entry = new Y.Map();
      const now = new Date().toISOString();
      entry.set('id', id);
      entry.set('title', '');
      entry.set('plain', '');
      entry.set('dayKey', dayKey);
      entry.set('tags', []);
      entry.set('updatedAt', now);
      entry.set('deletedAt', null);
      ydoc.transact(() => notesMap.set(id, entry));
      return id;
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

  const addTag = useCallback(
    (id, tag) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      ydoc.transact(() => {
        const entry = notesMap.get(id);
        if (!entry) return;
        const tags = entry.get('tags') ?? [];
        if (tags.includes(trimmed)) return;
        entry.set('tags', [...tags, trimmed]);
        entry.set('updatedAt', new Date().toISOString());
      });
    },
    [ydoc, notesMap],
  );

  const removeTag = useCallback(
    (id, tag) => {
      ydoc.transact(() => {
        const entry = notesMap.get(id);
        if (!entry) return;
        const tags = entry.get('tags') ?? [];
        entry.set('tags', tags.filter((t) => t !== tag));
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

  // یک روز حداکثر یک یادداشت وصل دارد. اگر روز مقصد از قبل یادداشت دیگری
  // داشت، به‌جای رد کردن یا جایگزینی، محتوای این یادداشت به آن اضافه می‌شود
  // (چیزی از دست نرود) و خودش tombstone می‌شود؛ شناسهٔ یادداشتِ نهایی (باقی‌مانده
  // روی آن روز) برگردانده می‌شود تا فراخوان بتواند مثلاً به آن ناوبری کند.
  const connectNoteToDay = useCallback(
    (noteId, dayKey) => {
      const conflict = [...notesMap.values()]
        .map(toPlainEntry)
        .find((n) => n.dayKey === dayKey && n.id !== noteId && !n.deletedAt);

      if (conflict) {
        appendNoteContent(`note:${noteId}`, `note:${conflict.id}`);
        ydoc.transact(() => {
          const noteEntry = notesMap.get(noteId);
          const targetEntry = notesMap.get(conflict.id);
          const mergedPlain = [targetEntry?.get('plain'), noteEntry?.get('plain')]
            .filter(Boolean)
            .join(' ')
            .slice(0, PLAIN_SNIPPET_LENGTH);
          const mergedTags = [...new Set([...(targetEntry?.get('tags') ?? []), ...(noteEntry?.get('tags') ?? [])])];
          targetEntry?.set('plain', mergedPlain);
          targetEntry?.set('tags', mergedTags);
          targetEntry?.set('updatedAt', new Date().toISOString());
          noteEntry?.set('deletedAt', new Date().toISOString());
        });
        return conflict.id;
      }

      updateNoteMeta(noteId, { dayKey });
      return noteId;
    },
    [ydoc, notesMap, updateNoteMeta],
  );

  return { notes, createNote, updateNoteMeta, deleteNote, connectNoteToDay, addTag, removeTag };
}
