import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGE_META = {
  lb:    { icon: '⚡', gradient: 'from-ink-600 to-ink-700 dark:from-[#3A3A3C] dark:to-[#2C2C2E]' },
  cache: { icon: '🟢', gradient: 'from-teal-400 to-teal-600 dark:from-teal-600 dark:to-teal-800' },
  db:    { icon: '🔶', gradient: 'from-rust-400 to-rust-600 dark:from-rust-600 dark:to-rust-800' },
  shard: { icon: '🔸', gradient: 'from-rust-500 to-rust-700 dark:from-rust-700 dark:to-rust-900' },
};

export default function ReadFunnel() {
  const [hitRate, setHitRate] = useState(90);
  const [totalQps, setTotalQps] = useState(200000);
  const [shards, setShards] = useState(10);

  const { cacheAbsorbed, dbLoad, perShard, perConnection } = useMemo(() => {
    const absorbed = Math.round(totalQps * (hitRate / 100));
    const db = totalQps - absorbed;
    const ps = Math.round(db / shards);
    const perConn = Math.round(db / 2000);
    return { cacheAbsorbed: absorbed, dbLoad: db, perShard: ps, perConnection: perConn };
  }, [hitRate, totalQps, shards]);

  const fmt = (n) => n.toLocaleString();

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Interactive — play with the numbers
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          Read funnel calculator
        </div>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <SliderControl label="Incoming QPS" value={totalQps} display={fmt(totalQps)} min={50000} max={500000} step={10000} onChange={setTotalQps} />
          <SliderControl label="Cache hit rate" value={hitRate} display={`${hitRate}%`} min={0} max={99} step={1} onChange={setHitRate} />
          <SliderControl label="DB shards" value={shards} display={shards} min={1} max={50} step={1} onChange={setShards} />
        </div>

        {/* Funnel viz */}
        <div className="space-y-3">
          <FunnelRow stage="lb" label="At the load balancer" qps={totalQps} width={100} sub="" />
          <FunnelRow stage="cache" label={`Redis cache absorbs ${hitRate}%`} qps={cacheAbsorbed} width={hitRate} sub="served in <1ms from memory" />
          <FunnelRow stage="db" label="Falls through to DB tier" qps={dbLoad} width={100 - hitRate} sub="spread across shards" />
          <FunnelRow stage="shard" label={`Per shard (${shards}x parallel)`} qps={perShard} width={Math.max(2, (100 - hitRate) / shards)} sub="trivial for Cassandra/DynamoDB" />
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-ink-100 dark:border-night-400">
          <InsightBox label="DB connections needed" value={`~${fmt(Math.min(2000, Math.max(100, Math.ceil(dbLoad / 100))))}`} sub="pool reuse, not 1 per request" />
          <InsightBox label="QPS per pooled connection" value={`~${fmt(perConnection)}/s`} sub="each conn serves many queries" />
          <InsightBox label="Bottleneck layer" value={hitRate > 80 ? 'Redis' : hitRate > 50 ? 'DB shards' : 'Connection pool'} sub="follow the hot path" warn={hitRate < 70} />
        </div>
      </div>
    </div>
  );
}

/* ── slider control ── */
function SliderControl({ label, value, display, min, max, step, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-600 dark:text-night-700 mb-2">
        <span className="font-medium">{label}</span>
        <motion.span
          key={display}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-mono text-rust-600 dark:text-rust-300 tabular-nums"
        >
          {display}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-rust-500"
      />
    </div>
  );
}

/* ── funnel row ── */
function FunnelRow({ stage, label, qps, width, sub }) {
  const meta = STAGE_META[stage];
  const showInside = width > 28 && sub;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-sm font-medium text-ink-800 dark:text-night-800 flex items-center gap-1.5">
          <span className="text-xs">{meta.icon}</span>
          {label}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={qps}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="font-mono text-sm font-semibold text-ink-900 dark:text-night-900 tabular-nums"
          >
            {qps.toLocaleString()}/s
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="h-9 bg-cream-100 dark:bg-night-300 rounded-md overflow-hidden relative">
        <motion.div
          className={`h-full rounded-md bg-gradient-to-r ${meta.gradient} relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(width, 1)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* shimmer effect */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.5s ease-in-out infinite',
            }}
          />
        </motion.div>
        {showInside && (
          <div className="absolute inset-0 flex items-center px-3 text-xs text-white/90 font-medium pointer-events-none">
            {sub}
          </div>
        )}
      </div>
      {!showInside && sub && (
        <div className="text-[11px] text-ink-500 dark:text-night-600 mt-1 pl-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

/* ── insight box ── */
function InsightBox({ label, value, sub, warn }) {
  return (
    <motion.div
      className={`rounded-lg p-3 border transition-colors duration-300 ${warn ? 'bg-rust-50 dark:bg-[#1F0E07] border-rust-200 dark:border-[#3D2012]' : 'bg-cream-50 dark:bg-night-200 border-ink-200 dark:border-night-400'}`}
      whileHover={{ y: -1, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-xs text-ink-500 dark:text-night-700 mb-0.5">{label}</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`font-mono font-semibold ${warn ? 'text-rust-700 dark:text-rust-300' : 'text-ink-900 dark:text-night-900'}`}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <div className="text-[11px] text-ink-500 dark:text-night-700 mt-0.5">{sub}</div>
    </motion.div>
  );
}

/* shimmer keyframe — injected once */
if (typeof document !== 'undefined' && !document.getElementById('rf-shimmer')) {
  const style = document.createElement('style');
  style.id = 'rf-shimmer';
  style.textContent = `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(style);
}
