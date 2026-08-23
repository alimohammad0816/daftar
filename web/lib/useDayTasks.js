'use client';

import { useCallback, useSyncExternalStore } from 'react';
import * as Y from 'yjs';
import { getDayDoc } from './ydoc';

function toPlainTask(ymap) {
  return {
    id: ymap.get('id'),
    title: ymap.get('title'),
    done: ymap.get('done'),
    doneAt: ymap.get('doneAt'),
    priority: ymap.get('priority'),
    rollover: ymap.get('rollover'),
    noteId: ymap.get('noteId'),
  };
}

const EMPTY = [];
// کش اسنپ‌شات per-Y.Array — تعلقش به خودِ استور بیرونی است، نه به کامپوننتی که
// useDayTasks را صدا می‌زند؛ به همین دلیل useRef نیست (که خواندنش وسط رندر
// قانون react-hooks/refs را می‌شکند)، یک WeakMap سطح-ماژول است.
const snapshotCache = new WeakMap();

function computeSnapshot(tasksArray) {
  const snapshot = tasksArray.toArray().map(toPlainTask);
  snapshotCache.set(tasksArray, snapshot);
  return snapshot;
}

// کارهای یک روز، از ydoc.getArray('tasks') همان سند روزانه — بند ۱۳.۳.
// ترتیب همان ترتیب آرایهٔ Y.Array است؛ فیلد `order` جداگانه‌ای نگه نمی‌داریم
// چون در ساختار CRDT خودِ آرایه صاحب ترتیب است و نگه‌داشتن دو منبع ترتیب
// یعنی احتمال ناهم‌خوانی.
export function useDayTasks(dayKey) {
  const { ydoc } = getDayDoc(dayKey);
  const tasksArray = ydoc.getArray('tasks');

  const subscribe = useCallback(
    (onStoreChange) => {
      const handler = () => {
        computeSnapshot(tasksArray);
        onStoreChange();
      };
      tasksArray.observeDeep(handler);
      return () => tasksArray.unobserveDeep(handler);
    },
    [tasksArray],
  );

  const getSnapshot = useCallback(
    () => snapshotCache.get(tasksArray) ?? computeSnapshot(tasksArray),
    [tasksArray],
  );

  const getServerSnapshot = useCallback(() => EMPTY, []);

  const tasks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addTask = useCallback(
    (title) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const task = new Y.Map();
      task.set('id', crypto.randomUUID());
      task.set('title', trimmed);
      task.set('done', false);
      task.set('doneAt', null);
      task.set('priority', 0);
      task.set('rollover', false);
      task.set('noteId', null);
      ydoc.transact(() => tasksArray.push([task]));
    },
    [ydoc, tasksArray],
  );

  const toggleTask = useCallback(
    (id) => {
      ydoc.transact(() => {
        const idx = tasksArray.toArray().findIndex((t) => t.get('id') === id);
        if (idx === -1) return;
        const task = tasksArray.get(idx);
        const done = !task.get('done');
        task.set('done', done);
        task.set('doneAt', done ? new Date().toISOString() : null);
      });
    },
    [ydoc, tasksArray],
  );

  const removeTask = useCallback(
    (id) => {
      ydoc.transact(() => {
        const idx = tasksArray.toArray().findIndex((t) => t.get('id') === id);
        if (idx !== -1) tasksArray.delete(idx, 1);
      });
    },
    [ydoc, tasksArray],
  );

  const moveTask = useCallback(
    (id, direction) => {
      ydoc.transact(() => {
        const arr = tasksArray.toArray();
        const idx = arr.findIndex((t) => t.get('id') === id);
        const target = idx + direction;
        if (idx === -1 || target < 0 || target >= arr.length) return;
        // یک Y.Map حذف‌شده را نمی‌شود دوباره درج کرد — Yjs محتوایش را تخریب
        // می‌کند. برای جابه‌جایی، مقدارها را قبل از حذف بیرون می‌کشیم و یک
        // Y.Map تازه با همان مقدارها در جای جدید می‌سازیم.
        const data = toPlainTask(arr[idx]);
        tasksArray.delete(idx, 1);
        const fresh = new Y.Map();
        for (const [key, value] of Object.entries(data)) fresh.set(key, value);
        tasksArray.insert(target, [fresh]);
      });
    },
    [ydoc, tasksArray],
  );

  return { tasks, addTask, toggleTask, removeTask, moveTask };
}
