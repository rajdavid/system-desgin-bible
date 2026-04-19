import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDark from '../../../hooks/useDark';

/* ── deterministic hash (FNV-1a) ── */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const NUM_SHARDS = 10;
const EXAMPLES = ['abc123', 'Ht8xK2', 'zZz999', 'XyZaBc', 'qwer7890', 'mN3pQ5'];

export default function ShardingHashViz() {
  const isDark = useDark();
  const [key, setKey] = useState('abc123');
  const [animPhase, setAnimPhase] = useState(3); // 0=input,1=hash,2=mod,3=done

  const { hashHex, shard } = useMemo(() => {
    const h = hashStr(key);
    return {
      hashHex: '0x' + h.toString(16).padStart(8, '0'),
      shard: h % NUM_SHARDS,
    };
  }, [key]);

  // animate the 3-step pipeline on key change
  const prevKey = useRef(key);
  useEffect(() => {
    if (key === prevKey.current) return;
    prevKey.current = key;
    setAnimPhase(0);
    const t1 = setTimeout(() => setAnimPhase(1), 250);
    const t2 = setTimeout(() => setAnimPhase(2), 550);
    const t3 = setTimeout(() => setAnimPhase(3), 850);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [key]);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      {/* header */}
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Interactive — type or pick a key
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          Watch a shortKey route to its shard
        </div>
      </div>

      <div className="p-6">
        {/* ── input ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-ink-400 dark:text-night-600 select-none shrink-0">GET /</span>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.slice(0, 12))}
              className="flex-1 px-3 py-2 font-mono text-sm bg-cream-50 dark:bg-night-300 border border-ink-200 dark:border-night-400 rounded-md focus:outline-none focus:border-rust-500 focus:ring-1 focus:ring-rust-500/30 text-ink-900 dark:text-night-900 placeholder:text-ink-400 dark:placeholder:text-night-600"
              placeholder="type a shortKey…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-400 dark:text-night-600 mr-0.5">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setKey(ex)}
                className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-all duration-200 ${
                  key === ex
                    ? 'bg-rust-500 text-white border-rust-500 shadow-sm'
                    : 'bg-cream-50 dark:bg-night-300 text-ink-600 dark:text-night-800 border-ink-200 dark:border-night-400 hover:border-rust-400 dark:hover:border-rust-600 hover:text-rust-700 dark:hover:text-rust-300'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* ── pipeline: 3-step animated ── */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0 mb-8">
          {/* connecting arrows (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[33.33%] -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ opacity: animPhase >= 1 ? 1 : 0.3, x: animPhase === 1 ? [0, 3, 0] : 0 }}
              transition={{ duration: 0.3 }}
              className="text-ink-400 dark:text-night-600 text-lg"
            >→</motion.div>
          </div>
          <div className="hidden md:block absolute top-1/2 left-[66.66%] -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ opacity: animPhase >= 2 ? 1 : 0.3, x: animPhase === 2 ? [0, 3, 0] : 0 }}
              transition={{ duration: 0.3 }}
              className="text-ink-400 dark:text-night-600 text-lg"
            >→</motion.div>
          </div>

          <PipelineStep
            phase={0}
            animPhase={animPhase}
            icon="🔑"
            label="Input key"
            value={key || '—'}
            variant="input"
          />
          <PipelineStep
            phase={1}
            animPhase={animPhase}
            icon="⚙️"
            label="FNV-1a hash"
            value={hashHex}
            variant="hash"
          />
          <PipelineStep
            phase={2}
            animPhase={animPhase}
            icon="📍"
            label={`% ${NUM_SHARDS}`}
            value={`shard ${shard}`}
            variant="result"
          />
        </div>

        {/* ── shard grid ── */}
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: NUM_SHARDS }).map((_, i) => {
            const isActive = i === shard && animPhase >= 3;
            return (
              <motion.div
                key={i}
                layout
                animate={{
                  scale: isActive ? 1.06 : 1,
                  opacity: animPhase >= 3 ? (isActive ? 1 : 0.5) : 0.5,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative rounded-xl p-3 text-center border-2 transition-colors duration-300 ${
                  isActive
                    ? 'bg-rust-50 dark:bg-[#1F0E07] border-rust-500 dark:border-rust-400'
                    : 'bg-cream-50 dark:bg-night-300 border-transparent'
                }`}
                style={{
                  boxShadow: isActive
                    ? isDark
                      ? '0 0 20px rgba(212,100,58,0.25), 0 4px 12px rgba(0,0,0,0.3)'
                      : '0 0 20px rgba(196,100,58,0.2), 0 4px 12px rgba(0,0,0,0.08)'
                    : 'none',
                }}
              >
                <div className={`text-[10px] font-medium tracking-wide mb-0.5 transition-colors duration-300 ${
                  isActive ? 'text-rust-500 dark:text-rust-400' : 'text-ink-400 dark:text-night-600'
                }`}>
                  shard
                </div>
                <div className={`font-mono text-2xl font-bold tabular-nums transition-colors duration-300 ${
                  isActive ? 'text-rust-600 dark:text-rust-300' : 'text-ink-300 dark:text-night-500'
                }`}>
                  {i}
                </div>

                {/* active glow ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-rust-500/40 dark:border-rust-400/30"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                {/* landing dot */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, y: -20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-rust-500 dark:bg-rust-400 shadow-md"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── notice ── */}
        <div className="mt-5 flex gap-2.5 items-start text-sm text-ink-600 dark:text-night-800 leading-relaxed bg-cream-50 dark:bg-night-300 rounded-lg p-3.5 border border-ink-100 dark:border-night-400">
          <span className="text-base mt-0.5 shrink-0">💡</span>
          <span>
            <strong className="text-ink-900 dark:text-night-900">Notice:</strong> every shortKey lands on exactly one shard — deterministically.
            Change the key, the shard changes. Run this 20,000 times/sec with random keys and each shard gets ~2K reads/sec.
            That's the entire sharding model.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── pipeline step ── */
function PipelineStep({ phase, animPhase, icon, label, value, variant }) {
  const reached = animPhase >= phase;
  const justReached = animPhase === phase;

  const borderClass = {
    input:  'border-teal-300 dark:border-teal-700',
    hash:   'border-ink-300 dark:border-night-500',
    result: 'border-rust-300 dark:border-rust-700',
  }[variant];

  const bgClass = {
    input:  'bg-teal-50/60 dark:bg-[#071A12]/60',
    hash:   'bg-cream-50 dark:bg-night-200',
    result: 'bg-rust-50/60 dark:bg-[#1F0E07]/60',
  }[variant];

  const valColor = variant === 'result'
    ? 'text-rust-600 dark:text-rust-300'
    : 'text-ink-900 dark:text-night-900';

  return (
    <motion.div
      animate={{
        opacity: reached ? 1 : 0.35,
        scale: justReached ? 1.03 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`rounded-lg p-3.5 border md:mx-2 mb-2 md:mb-0 ${borderClass} ${bgClass}`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[11px] font-medium text-ink-500 dark:text-night-700 uppercase tracking-wide">{label}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`font-mono text-base font-semibold truncate ${valColor}`}
        >
          {variant === 'result' ? `→ ${value}` : value}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
