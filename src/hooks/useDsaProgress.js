import { useState, useCallback } from 'react';

const STORAGE_KEY = 'dsa_done';

function load() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

function save(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

/**
 * Tracks solved DSA problems as a Set of question ids, persisted to localStorage.
 */
export function useDsaProgress() {
  const [done, setDone] = useState(load);

  const toggle = useCallback((id) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      save(next);
      return next;
    });
  }, []);

  const isDone = useCallback((id) => done.has(id), [done]);

  return { done, toggle, isDone, total: done.size };
}
