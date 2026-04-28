import { useState, useEffect } from 'react';

/* Track which section ID is currently the most-visible on screen. */
export function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const observers = [];
    const visible = new Map();

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible.set(id, entry.intersectionRatio);
          else visible.delete(id);
          for (const sid of sectionIds) {
            if (visible.has(sid)) { setActive(sid); break; }
          }
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: [0, 0.25] }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return active;
}
