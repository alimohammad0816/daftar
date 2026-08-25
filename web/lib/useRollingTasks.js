'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getYDoc } from './ydoc';
import { useLiveSync } from './useLiveSync';

function toPlainEntry(ymap) {
  return { id: ymap.get('id'), dayKey: ymap.get('dayKey'), title: ymap.get('title') };
}

const snapshotCache = new WeakMap();

function computeSnapshot(rollingMap) {
  const snapshot = [...rollingMap.values()].map(toPlainEntry).sort((a, b) => (a.dayKey < b.dayKey ? -1 : 1));
  snapshotCache.set(rollingMap, snapshot);
  return snapshot;
}

const EMPTY = [];

// کارهای انجام‌نشدهٔ روزهای قبل که خودِ کاربر rollover کرده — از سند
// مشترک index می‌آید (lib/useDayTasks.js آن را همیشه به‌روز نگه می‌دارد)،
// بدون باز کردن سند تک‌تک روزها.
export function useRollingTasks() {
  useLiveSync('index', getYDoc);
  const { ydoc } = getYDoc('index');
  const rollingMap = ydoc.getMap('rollingTasks');

  const subscribe = useCallback(
    (onStoreChange) => {
      const handler = () => {
        computeSnapshot(rollingMap);
        onStoreChange();
      };
      rollingMap.observeDeep(handler);
      return () => rollingMap.unobserveDeep(handler);
    },
    [rollingMap],
  );

  const getSnapshot = useCallback(
    () => snapshotCache.get(rollingMap) ?? computeSnapshot(rollingMap),
    [rollingMap],
  );

  const getServerSnapshot = useCallback(() => EMPTY, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
