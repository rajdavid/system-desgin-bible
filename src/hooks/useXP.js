import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sdb_xp';

const LEVELS = [
  { level: 1, title: 'Beginner', xpNeeded: 0 },
  { level: 2, title: 'Learner', xpNeeded: 100 },
  { level: 3, title: 'Explorer', xpNeeded: 300 },
  { level: 4, title: 'Practitioner', xpNeeded: 600 },
  { level: 5, title: 'Architect', xpNeeded: 1000 },
  { level: 6, title: 'Senior Architect', xpNeeded: 1500 },
  { level: 7, title: 'Principal', xpNeeded: 2200 },
  { level: 8, title: 'Distinguished', xpNeeded: 3000 },
  { level: 9, title: 'Fellow', xpNeeded: 4000 },
  { level: 10, title: 'Legend', xpNeeded: 5500 },
];

const XP_REWARDS = {
  study: 10,
  master: 25,
  streak: 15,
  mockComplete: 50,
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { xp: 0, history: [] };
  } catch {
    return { xp: 0, history: [] };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useXP() {
  const [state, setState] = useState(load);

  const addXP = useCallback((amount, reason) => {
    setState((prev) => {
      const next = {
        xp: prev.xp + amount,
        history: [...prev.history.slice(-99), { amount, reason, ts: Date.now() }],
      };
      save(next);
      return next;
    });
  }, []);

  const currentLevel = [...LEVELS].reverse().find((l) => state.xp >= l.xpNeeded) || LEVELS[0];
  const nextLevel = LEVELS[currentLevel.level] || null;
  const xpInLevel = state.xp - currentLevel.xpNeeded;
  const xpForNext = nextLevel ? nextLevel.xpNeeded - currentLevel.xpNeeded : 1;
  const levelProgress = nextLevel ? Math.min(xpInLevel / xpForNext, 1) : 1;

  return {
    xp: state.xp,
    level: currentLevel,
    nextLevel,
    levelProgress,
    addXP,
    XP_REWARDS,
  };
}
