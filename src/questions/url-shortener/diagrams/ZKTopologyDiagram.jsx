import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDark from '../../../hooks/useDark';

const DATA_PLANE = [
  { id: 'client', label: 'Client', variant: 'neutral' },
  { id: 'lb', label: 'LB', variant: 'teal' },
  { id: 'app', label: 'App Servers', variant: 'teal' },
  { id: 'redis', label: 'Redis', variant: 'teal' },
  { id: 'db', label: 'DB', variant: 'teal' },
];

const ISOLATION_REASONS = [
  'Consensus writes take 5–10ms',
  'Different failure domain',
  'Not routable from internet',
  'Load: ~3 req/hour per worker',
];

export default function ZKTopologyDiagram() {
  const isDark = useDark();
  const [activeDP, setActiveDP] = useState(-1);
  const [showKGS, setShowKGS] = useState(false);
  const [showZK, setShowZK] = useState(false);

  // looping animation
  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      if (step <= 4) {
        setActiveDP(step);
        if (step === 2) setShowKGS(true);
      }
      if (step === 4) setShowZK(true);
      if (step >= 6) {
        step = -1;
        setActiveDP(-1);
        setShowKGS(false);
        setShowZK(false);
      }
      step++;
    }, 650);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      {/* header */}
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Animated — data plane vs control plane
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          Where ZooKeeper sits — off the request path
        </div>
      </div>

      <div className="p-6">
        {/* ── DATA PLANE ── */}
        <div className="mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
            ⚡ Data plane · every user request
          </span>
        </div>

        <div className="flex items-center gap-0 overflow-x-auto pb-2 mb-1">
          {DATA_PLANE.map((node, i) => (
            <div key={node.id} className="flex items-center shrink-0">
              {i > 0 && <HArrow active={activeDP >= i} isDark={isDark} />}
              <FlowNode
                label={node.label}
                variant={node.variant}
                active={activeDP >= i}
                isDark={isDark}
              />
            </div>
          ))}
        </div>

        {/* ── writes also need shortKey ── */}
        <div className="flex items-start gap-3 ml-[120px] sm:ml-[140px] mb-1">
          <motion.span
            animate={{ opacity: showKGS ? 1 : 0.3 }}
            className="text-[11px] font-semibold text-rust-500 dark:text-rust-400 pt-0.5"
          >
            writes also need a shortKey
          </motion.span>
        </div>

        {/* arrow down to KGS */}
        <div className="flex justify-center mb-1 -ml-16 sm:ml-0" style={{ maxWidth: 340, margin: '0 auto' }}>
          <VArrow active={showKGS} isDark={isDark} color="gray" />
        </div>

        {/* ── KGS Workers ── */}
        <div className="max-w-xs mx-auto mb-2">
          <motion.div
            animate={{ opacity: showKGS ? 1 : 0.35, scale: showKGS ? 1 : 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded-xl p-3.5 border-2 text-center border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-[#071A12]"
            style={{
              boxShadow: showKGS
                ? isDark ? '0 0 14px rgba(45,139,102,0.2)' : '0 0 14px rgba(45,139,102,0.1)'
                : 'none',
            }}
          >
            <div className="text-sm font-semibold text-teal-700 dark:text-teal-300">KGS workers</div>
            <div className="text-[11px] text-teal-600/70 dark:text-teal-400/50 mt-0.5">
              serves keys from local range
            </div>
          </motion.div>
        </div>

        {/* ── dashed arrow + "once per ~17 min" ── */}
        <div className="flex items-center justify-center gap-3 mb-1">
          <VArrow active={showZK} isDark={isDark} color="rust" dashed />
          <motion.span
            animate={{ opacity: showZK ? 1 : 0.3 }}
            className="text-[11px] italic text-rust-500 dark:text-rust-400"
          >
            once per ~17 min
          </motion.span>
        </div>

        {/* ── CONTROL PLANE divider ── */}
        <div className="relative my-3">
          <div className="border-t-2 border-dashed border-rust-300/40 dark:border-rust-600/30" />
          <span className="absolute -top-2.5 left-0 bg-white dark:bg-night-200 pr-3 text-[11px] font-semibold uppercase tracking-wide text-rust-500 dark:text-rust-400">
            🔒 Control plane · off-path, rare traffic
          </span>
        </div>

        {/* ── ZooKeeper + Annotation ── */}
        <div className="flex flex-col md:flex-row items-start gap-3 mt-4">
          {/* ZK cluster */}
          <motion.div
            animate={{
              opacity: showZK ? 1 : 0.35,
              scale: showZK ? 1 : 0.97,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative rounded-xl px-6 py-4 border-2 text-center border-rust-400 dark:border-rust-500 shrink-0"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #1F0E07 0%, #2A1510 100%)'
                : 'linear-gradient(135deg, #FAF0EC 0%, #FFF5EF 100%)',
              boxShadow: showZK
                ? isDark ? '0 0 18px rgba(212,100,58,0.2)' : '0 0 18px rgba(196,100,58,0.12)'
                : 'none',
            }}
          >
            <div className="text-sm font-semibold text-rust-700 dark:text-rust-300">
              ZooKeeper cluster
            </div>
            <div className="text-[11px] text-rust-600/80 dark:text-rust-400/70 mt-1">
              3–5 nodes · separate subnet
            </div>
            <div className="text-[11px] text-rust-600/80 dark:text-rust-400/70">
              no public exposure
            </div>
            <div className="text-[11px] italic text-rust-500/70 dark:text-rust-400/50 mt-0.5">
              only KGS workers can reach it
            </div>

            {/* pulsing ring */}
            {showZK && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-rust-400/30 dark:border-rust-500/20"
                animate={{ scale: [1, 1.03, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.div>

          {/* isolation reasons */}
          <motion.div
            animate={{ opacity: showZK ? 1 : 0.35 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-lg px-4 py-3 border border-ink-200 dark:border-night-400 bg-cream-50 dark:bg-night-300 shrink-0"
          >
            <div className="text-[11px] font-semibold text-ink-800 dark:text-night-900 mb-1.5">
              Why it's isolated:
            </div>
            <ul className="space-y-1">
              {ISOLATION_REASONS.map((reason, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: showZK ? 1 : 0.3, x: showZK ? 0 : -6 }}
                  transition={{ delay: showZK ? 0.3 + i * 0.1 : 0 }}
                  className="flex items-center gap-1.5 text-[11px] text-ink-600 dark:text-night-700 leading-tight"
                >
                  <span className="w-1 h-1 rounded-full bg-rust-400 dark:bg-rust-500 shrink-0" />
                  {reason}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── step indicator ── */}
        <div className="flex items-center gap-1.5 mt-5">
          <span className="text-[10px] text-ink-400 dark:text-night-600 mr-1">data:</span>
          {DATA_PLANE.map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full flex-1 max-w-6"
              animate={{
                backgroundColor: activeDP >= i
                  ? (isDark ? '#2D8B66' : '#2D8B66')
                  : (isDark ? '#2A2A2C' : '#E5E3DE'),
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
          <span className="text-[10px] text-ink-300 dark:text-night-500 mx-1">|</span>
          <span className="text-[10px] text-ink-400 dark:text-night-600 mr-1">ctrl:</span>
          <motion.div
            className="h-1.5 rounded-full flex-1 max-w-6"
            animate={{
              backgroundColor: showKGS
                ? (isDark ? '#2D8B66' : '#2D8B66')
                : (isDark ? '#2A2A2C' : '#E5E3DE'),
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="h-1.5 rounded-full flex-1 max-w-6"
            animate={{
              backgroundColor: showZK
                ? (isDark ? '#D4643A' : '#C4643A')
                : (isDark ? '#2A2A2C' : '#E5E3DE'),
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── flow node ── */
function FlowNode({ label, variant, active, isDark }) {
  const isTeal = variant === 'teal';
  return (
    <motion.div
      animate={{ scale: active ? 1.03 : 1, opacity: active ? 1 : 0.4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative rounded-lg px-4 py-2.5 text-center border-2 transition-colors duration-300 ${
        isTeal
          ? 'bg-teal-50 dark:bg-[#071A12] border-teal-400 dark:border-teal-600'
          : 'bg-cream-100 dark:bg-night-300 border-ink-300 dark:border-night-500'
      }`}
      style={{
        boxShadow: active && isTeal
          ? isDark ? '0 0 12px rgba(45,139,102,0.2)' : '0 0 12px rgba(45,139,102,0.1)'
          : 'none',
        minWidth: label.length > 6 ? 110 : 70,
      }}
    >
      <div className={`text-sm font-semibold ${
        isTeal ? 'text-teal-700 dark:text-teal-300' : 'text-ink-800 dark:text-night-800'
      }`}>
        {label}
      </div>
      {active && (
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/* ── horizontal arrow ── */
function HArrow({ active, isDark }) {
  return (
    <motion.div animate={{ opacity: active ? 1 : 0.2 }} className="flex items-center px-0.5">
      <svg width="24" height="12" viewBox="0 0 24 12" className="shrink-0">
        <line x1="0" y1="6" x2="18" y2="6" stroke={isDark ? '#4A4A4C' : '#B0B0B0'} strokeWidth="1.5" />
        <path d="M14 2 L20 6 L14 10" fill="none" stroke={isDark ? '#4A4A4C' : '#B0B0B0'} strokeWidth="1.5" strokeLinecap="round" />
        {active && (
          <circle r="2.5" fill={isDark ? '#6EE7B7' : '#2D8B66'}>
            <animateMotion dur="0.5s" repeatCount="indefinite" path="M0,6 L20,6" />
          </circle>
        )}
      </svg>
    </motion.div>
  );
}

/* ── vertical arrow ── */
function VArrow({ active, isDark, color = 'gray', dashed }) {
  const strokeColor = color === 'rust'
    ? (isDark ? '#E8855A' : '#C4643A')
    : (isDark ? '#4A4A4C' : '#B0B0B0');
  const dotColor = color === 'rust'
    ? (isDark ? '#E8855A' : '#C4643A')
    : (isDark ? '#6EE7B7' : '#2D8B66');

  return (
    <motion.div animate={{ opacity: active ? 1 : 0.2 }} className="flex justify-center py-0.5">
      <svg width="12" height="24" viewBox="0 0 12 24" className="shrink-0">
        <line
          x1="6" y1="0" x2="6" y2="18"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeDasharray={dashed ? '4 3' : undefined}
        />
        <path d="M2 14 L6 20 L10 14" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        {active && (
          <circle r="2.5" fill={dotColor}>
            <animateMotion dur="0.5s" repeatCount="indefinite" path="M6,0 L6,20" />
          </circle>
        )}
      </svg>
    </motion.div>
  );
}
