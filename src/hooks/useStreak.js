import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'sdb_streak';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { current: 0, best: 0, lastDate: null, dates: [] };
  } catch {
    return { current: 0, best: 0, lastDate: null, dates: [] };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStreak() {
  const [state, setState] = useState(load);

  // On mount, check if streak is broken
  useEffect(() => {
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.lastDate && state.lastDate !== today && state.lastDate !== yesterday) {
      // Streak broken
      setState((prev) => {
        const next = { ...prev, current: 0 };
        save(next);
        return next;
      });
    }
  }, []);

  const recordActivity = useCallback(() => {
    const today = getToday();
    setState((prev) => {
      if (prev.lastDate === today) return prev; // Already recorded today
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newCurrent = prev.lastDate === yesterday ? prev.current + 1 : 1;
      const next = {
        current: newCurrent,
        best: Math.max(prev.best, newCurrent),
        lastDate: today,
        dates: [...prev.dates.slice(-29), today],
      };
      save(next);
      return next;
    });
  }, []);

  const isActiveToday = state.lastDate === getToday();

  return {
    current: state.current,
    best: state.best,
    isActiveToday,
    recordActivity,
    dates: state.dates,
  };
}
