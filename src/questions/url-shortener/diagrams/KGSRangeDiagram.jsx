import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDark from '../../../hooks/useDark';

const WORKERS = [
  { id: 'A', range: [0, 1_000_000], label: '[0, 1M)' },
  { id: 'B', range: [1_000_000, 2_000_000], label: '[1M, 2M)' },
  { id: 'C', range: [2_000_000, 3_000_000], label: '[2M, 3M)' },
];

function fmt(n) {
  return n.toLocaleString();
}

export default function KGSRangeDiagram() {
  const isDark = useDark();

  // animate local counters ticking up
  const [counters, setCounters] = useState([847231, 1203994, 2501110]);
  const [claimingIdx, setClaimingIdx] = useState(-1);
  const [nextAvailable, setNextAvailable] = useState(3_000_000);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCounters((prev) => prev.map((c, i) => {
        const max = WORKERS[i].range[1];
        return c < max - 1 ? c + Math.floor(Math.random() * 80 + 20) : c;
      }));
    }, 120);
    return () => clearInterval(timerRef.current);
  }, []);

  // simulate a claim when a worker gets close to exhausting its range
  const handleClaim = (workerIdx) => {
    setClaimingIdx(workerIdx);
    setTimeout(() => {
      setNextAvailable((n) => n + 1_000_000);
      setClaimingIdx(-1);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      {/* header */}
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Animated — counters tick in real time
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          KGS range allocation via ZooKeeper
        </div>
      </div>

      <div className="p-6">
        {/* ── ZooKeeper cluster ── */}
        <div className="flex justify-center mb-2">
          <motion.div
            className="relative rounded-xl px-8 py-4 text-center border-2 border-rust-400 dark:border-rust-500"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #1F0E07 0%, #2A1510 100%)'
                : 'linear-gradient(135deg, #FAF0EC 0%, #FFF5EF 100%)',
              boxShadow: isDark
                ? '0 4px 20px rgba(212,100,58,0.15)'
                : '0 4px 20px rgba(196,100,58,0.1)',
            }}
          >
            <div className="text-sm font-semibold text-rust-700 dark:text-rust-300">
              ZooKeeper cluster
            </div>
            <div className="font-mono text-xs mt-1 text-rust-600 dark:text-rust-400">
              next_available = <AnimatePresence mode="wait">
                <motion.span
                  key={nextAvailable}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="font-semibold text-rust-700 dark:text-rust-300"
                >
                  {fmt(nextAvailable)}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="text-[10px] mt-1 text-rust-500/70 dark:text-rust-400/60">
              atomic compare-and-set · Zab consensus
            </div>

            {/* pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-rust-400/30 dark:border-rust-500/20"
              animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* ── claim arrows ── */}
        <div className="flex justify-center gap-[15%] mb-1">
          {WORKERS.map((_, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center"
              animate={{
                opacity: claimingIdx === i ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            >
              <svg width="24" height="28" viewBox="0 0 24 28">
                <path
                  d="M12 0 L12 20 M6 14 L12 20 L18 14"
                  fill="none"
                  stroke={isDark ? '#6A6A6C' : '#9A9A9A'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="3 2"
                />
              </svg>
              <span className="text-[10px] text-ink-400 dark:text-night-600 font-medium -mt-0.5">
                claim 1M
              </span>
            </motion.div>
          ))}
        </div>

        {/* ── worker cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {WORKERS.map((w, i) => {
            const counter = Math.min(counters[i], w.range[1] - 1);
            const progress = (counter - w.range[0]) / (w.range[1] - w.range[0]);
            const nearExhaust = progress > 0.95;
            const isClaiming = claimingIdx === i;

            return (
              <motion.div
                key={w.id}
                className={`relative rounded-xl p-4 border-2 transition-colors duration-300 ${
                  isClaiming
                    ? 'border-rust-500 dark:border-rust-400'
                    : 'border-ink-200 dark:border-night-400'
                }`}
                style={{
                  background: isDark ? '#1C1C1E' : '#FBF9F5',
                  boxShadow: isClaiming
                    ? isDark
                      ? '0 0 16px rgba(212,100,58,0.25)'
                      : '0 0 16px rgba(196,100,58,0.15)'
                    : 'none',
                }}
                animate={{ scale: isClaiming ? 1.03 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold text-rust-600 dark:text-rust-300">
                    Worker {w.id}
                  </div>
                  <div className="text-[11px] text-ink-500 dark:text-night-700 mt-1">
                    Range: <span className="font-mono font-medium text-ink-700 dark:text-night-800">{w.label}</span>
                  </div>
                  <div className="text-[11px] text-ink-400 dark:text-night-600 mt-0.5">
                    Local counter:
                  </div>
                  <motion.div
                    className="font-mono text-lg font-bold text-ink-900 dark:text-night-900 tabular-nums mt-0.5"
                    key={counter}
                    initial={false}
                    animate={{ opacity: 1 }}
                  >
                    {fmt(counter)}
                  </motion.div>
                </div>

                {/* progress bar */}
                <div className="mt-3 h-1.5 rounded-full bg-ink-100 dark:bg-night-400 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      nearExhaust
                        ? 'bg-rust-500'
                        : 'bg-teal-500 dark:bg-teal-600'
                    }`}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.15, ease: 'linear' }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-ink-400 dark:text-night-600 font-mono">{fmt(w.range[0])}</span>
                  <span className={`text-[9px] font-mono ${nearExhaust ? 'text-rust-500' : 'text-ink-400 dark:text-night-600'}`}>
                    {nearExhaust ? 'nearly full' : fmt(w.range[1])}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── down arrows ── */}
        <div className="flex justify-center gap-[15%] mb-2">
          {[0, 1, 2].map((i) => (
            <svg key={i} width="20" height="22" viewBox="0 0 20 22" className="text-ink-300 dark:text-night-500">
              <path d="M10 0 L10 16 M4 11 L10 17 L16 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ))}
        </div>

        {/* ── encode box ── */}
        <div
          className="rounded-xl p-4 text-center border-2"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #071A12 0%, #0A2419 100%)'
              : 'linear-gradient(135deg, #E5F3EE 0%, #F0FAF5 100%)',
            borderColor: isDark ? '#2D8B66' : '#2D8B66',
          }}
        >
          <div className="text-sm font-medium text-teal-700 dark:text-teal-300">
            Encode local counter → Base62 → serve to app servers
          </div>
          <div className="text-[11px] text-teal-600/70 dark:text-teal-400/60 mt-1">
            no ZooKeeper call per key — amortized across a full range
          </div>
        </div>

        {/* ── reset / simulate button ── */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              setCounters(WORKERS.map((w) => w.range[0]));
              handleClaim(Math.floor(Math.random() * 3));
            }}
            className="text-xs font-medium px-4 py-1.5 rounded-full border border-ink-200 dark:border-night-400 text-ink-600 dark:text-night-700 hover:border-rust-400 hover:text-rust-600 dark:hover:border-rust-500 dark:hover:text-rust-300 transition-all bg-cream-50 dark:bg-night-300"
          >
            ↻ Reset &amp; simulate claim
          </button>
        </div>
      </div>
    </div>
  );
}
