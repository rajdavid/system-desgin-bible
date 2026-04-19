import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sdb_progress';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Tracks per-question study state: { [slug]: 'studied' | 'mastered' }
 */
export function useProgress() {
  const [progress, setProgress] = useState(load);

  const markStudied = useCallback((slug) => {
    setProgress((prev) => {
      const next = { ...prev, [slug]: prev[slug] === 'mastered' ? 'mastered' : 'studied' };
      save(next);
      return next;
    });
  }, []);

  const markMastered = useCallback((slug) => {
    setProgress((prev) => {
      const next = { ...prev, [slug]: 'mastered' };
      save(next);
      return next;
    });
  }, []);

  const getStatus = useCallback((slug) => progress[slug] || 'new', [progress]);

  const stats = {
    total: Object.keys(progress).length,
    studied: Object.values(progress).filter((v) => v === 'studied').length,
    mastered: Object.values(progress).filter((v) => v === 'mastered').length,
  };

  return { progress, markStudied, markMastered, getStatus, stats };
}
