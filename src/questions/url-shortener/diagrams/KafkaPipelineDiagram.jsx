import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDark from '../../../hooks/useDark';

const HOT_PATH = [
  { id: 'client',   label: 'Client',   sub: null,       variant: 'neutral' },
  { id: 'app',      label: 'App Server', sub: null,      variant: 'teal' },
  { id: 'redis',    label: 'Redis / DB', sub: null,      variant: 'teal' },
  { id: 'redirect', label: '302 Redirect', sub: '~5ms total', variant: 'teal' },
];

const COLD_PATH = [
  { id: 'kafka',    label: 'Kafka cluster (3+ brokers)', sub: 'Topic: url_clicks · partitioned · replicated', detail: 'buffers millions of events, durable for 7 days', variant: 'teal' },
  { id: 'consumer', label: 'Analytics consumers',        sub: 'parse, enrich, batch into files', variant: 'accent' },
  { id: 'bq',       label: 'BigQuery / Snowflake',       sub: 'columnar warehouse — aggregations, dashboards', variant: 'accent' },
];

export default function KafkaPipelineDiagram() {
  const isDark = useDark();
  const [activeHot, setActiveHot] = useState(-1);
  const [activeCold, setActiveCold] = useState(-1);
  const [eventCount, setEventCount] = useState(0);
  const timerRef = useRef(null);

  // animate hot path flow
  useEffect(() => {
    let step = 0;
    timerRef.current = setInterval(() => {
      if (step <= 3) {
        setActiveHot(step);
        if (step === 1) setActiveCold(-1); // reset cold when app server fires
      }
      if (step === 2) {
        setActiveCold(0); // kafka lights up at same time as redis
        setEventCount((c) => c + 1);
      }
      if (step === 3) setActiveCold(1);
      if (step === 4) setActiveCold(2);
      if (step >= 5) {
        step = -1;
        setActiveHot(-1);
        setActiveCold(-1);
      }
      step++;
    }, 700);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      {/* header */}
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Animated — watch events flow through the pipeline
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          Analytics pipeline — decoupled from the redirect hot path
        </div>
      </div>

      <div className="p-6">
        {/* ── HOT PATH ── */}
        <div className="mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
            ⚡ Hot path — user redirect (must be fast)
          </span>
        </div>

        <div className="flex items-center gap-0 mb-2 overflow-x-auto pb-2">
          {HOT_PATH.map((node, i) => (
            <div key={node.id} className="flex items-center shrink-0">
              {i > 0 && <HArrow active={activeHot >= i} isDark={isDark} />}
              <HotNode node={node} active={activeHot >= i} isDark={isDark} />
            </div>
          ))}
        </div>

        {/* ── fire-and-forget bridge ── */}
        <div className="flex items-start gap-3 ml-[72px] mb-1">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ opacity: activeCold >= 0 ? 1 : 0.3 }}
              className="w-px h-8 border-l-2 border-dashed border-rust-400 dark:border-rust-500"
            />
            <motion.div
              animate={{ opacity: activeCold >= 0 ? 1 : 0.3 }}
            >
              <svg width="10" height="8" viewBox="0 0 10 8" className="text-rust-400 dark:text-rust-500">
                <path d="M5 8 L0 0 L10 0 Z" fill="currentColor" />
              </svg>
            </motion.div>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-rust-500 dark:text-rust-400">
              fire-and-forget click event
            </span>
            <span className="text-[10px] text-ink-400 dark:text-night-600 ml-1.5">
              non-blocking, async publish
            </span>
          </div>
        </div>

        {/* ── COLD PATH ── */}
        <div className="space-y-0">
          {COLD_PATH.map((node, i) => (
            <div key={node.id}>
              {i > 0 && <VArrow active={activeCold >= i} isDark={isDark} />}
              <ColdNode node={node} active={activeCold >= i} isDark={isDark} isKafka={node.id === 'kafka'} eventCount={eventCount} />
            </div>
          ))}
        </div>

        {/* ── step indicator dots ── */}
        <div className="flex items-center gap-1.5 mt-5">
          <span className="text-[10px] text-ink-400 dark:text-night-600 mr-1">flow:</span>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full flex-1 max-w-8"
              animate={{
                backgroundColor: activeHot >= i
                  ? (isDark ? '#2D8B66' : '#2D8B66')
                  : (isDark ? '#2A2A2C' : '#E5E3DE'),
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
          <span className="text-[10px] text-ink-300 dark:text-night-500 mx-1">|</span>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full flex-1 max-w-8"
              animate={{
                backgroundColor: activeCold >= i
                  ? (isDark ? '#D4643A' : '#C4643A')
                  : (isDark ? '#2A2A2C' : '#E5E3DE'),
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── hot path node ── */
function HotNode({ node, active, isDark }) {
  const isHighlight = node.variant === 'teal';
  return (
    <motion.div
      animate={{
        scale: active ? 1.03 : 1,
        opacity: active ? 1 : 0.45,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative rounded-lg px-4 py-2.5 text-center border-2 transition-colors duration-300 ${
        isHighlight
          ? 'bg-teal-50 dark:bg-[#071A12] border-teal-400 dark:border-teal-600'
          : 'bg-cream-100 dark:bg-night-300 border-ink-300 dark:border-night-500'
      }`}
      style={{
        boxShadow: active && isHighlight
          ? isDark
            ? '0 0 14px rgba(45,139,102,0.25)'
            : '0 0 14px rgba(45,139,102,0.15)'
          : 'none',
        minWidth: node.sub ? 130 : 90,
      }}
    >
      <div className={`text-sm font-semibold ${
        isHighlight ? 'text-teal-700 dark:text-teal-300' : 'text-ink-800 dark:text-night-800'
      }`}>
        {node.label}
      </div>
      {node.sub && (
        <div className="text-[10px] mt-0.5 text-teal-600/70 dark:text-teal-400/50">
          {node.sub}
        </div>
      )}
      {active && (
        <motion.div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-500"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/* ── cold path node ── */
function ColdNode({ node, active, isDark, isKafka, eventCount }) {
  const isAccent = node.variant === 'accent';
  return (
    <motion.div
      animate={{
        scale: active ? 1.01 : 1,
        opacity: active ? 1 : 0.4,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative rounded-xl p-4 border-2 transition-colors duration-300 ${
        isAccent
          ? 'bg-rust-50/60 dark:bg-[#1F0E07]/60 border-rust-300 dark:border-rust-700'
          : 'bg-teal-50 dark:bg-[#071A12] border-teal-400 dark:border-teal-600'
      }`}
      style={{
        boxShadow: active
          ? isDark
            ? isAccent ? '0 0 12px rgba(212,100,58,0.15)' : '0 0 12px rgba(45,139,102,0.2)'
            : isAccent ? '0 0 12px rgba(196,100,58,0.1)' : '0 0 12px rgba(45,139,102,0.12)'
          : 'none',
      }}
    >
      <div className="text-center">
        <div className={`text-sm font-semibold ${
          isAccent ? 'text-rust-700 dark:text-rust-300' : 'text-teal-700 dark:text-teal-300'
        }`}>
          {node.label}
        </div>
        {node.sub && (
          <div className={`text-[11px] mt-1 ${
            isAccent ? 'text-rust-500/80 dark:text-rust-400/70' : 'text-teal-600/80 dark:text-teal-400/70'
          }`}>
            {node.sub}
          </div>
        )}
        {node.detail && (
          <div className="text-[10px] mt-0.5 text-teal-500/60 dark:text-teal-500/40">
            {node.detail}
          </div>
        )}
      </div>

      {/* kafka event counter badge */}
      {isKafka && eventCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-rust-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center shadow-md"
        >
          {eventCount}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── horizontal arrow ── */
function HArrow({ active, isDark }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.25 }}
      transition={{ duration: 0.2 }}
      className="flex items-center px-1"
    >
      <svg width="28" height="12" viewBox="0 0 28 12" className="shrink-0">
        <line x1="0" y1="6" x2="22" y2="6" stroke={isDark ? '#4A4A4C' : '#B0B0B0'} strokeWidth="1.5" />
        <path d="M18 2 L24 6 L18 10" fill="none" stroke={isDark ? '#4A4A4C' : '#B0B0B0'} strokeWidth="1.5" strokeLinecap="round" />
        {active && (
          <circle r="3" fill={isDark ? '#6EE7B7' : '#2D8B66'}>
            <animateMotion dur="0.6s" repeatCount="indefinite" path="M0,6 L24,6" />
          </circle>
        )}
      </svg>
    </motion.div>
  );
}

/* ── vertical arrow ── */
function VArrow({ active, isDark }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.25 }}
      transition={{ duration: 0.2 }}
      className="flex justify-center py-0.5"
    >
      <svg width="12" height="24" viewBox="0 0 12 24" className="shrink-0">
        <line x1="6" y1="0" x2="6" y2="18" stroke={isDark ? '#4A4A4C' : '#B0B0B0'} strokeWidth="1.5" />
        <path d="M2 14 L6 20 L10 14" fill="none" stroke={isDark ? '#4A4A4C' : '#B0B0B0'} strokeWidth="1.5" strokeLinecap="round" />
        {active && (
          <circle r="3" fill={isDark ? '#E8855A' : '#C4643A'}>
            <animateMotion dur="0.5s" repeatCount="indefinite" path="M6,0 L6,20" />
          </circle>
        )}
      </svg>
    </motion.div>
  );
}
