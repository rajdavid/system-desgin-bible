import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReadFunnel() {
  const [hitRate, setHitRate] = useState(90);
  const [totalQps, setTotalQps] = useState(200000);
  const [shards, setShards] = useState(10);

  const { cacheAbsorbed, dbLoad, perShard, perConnection } = useMemo(() => {
    const absorbed = Math.round(totalQps * (hitRate / 100));
    const db = totalQps - absorbed;
    const ps = Math.round(db / shards);
    // assume 20 app servers × 100 conns = 2000 pool; each conn serves db/pool per sec
    const perConn = Math.round(db / 2000);
    return { cacheAbsorbed: absorbed, dbLoad: db, perShard: ps, perConnection: perConn };
  }, [hitRate, totalQps, shards]);

  const fmt = (n) => n.toLocaleString();

  return (
    <div className="bg-white rounded-xl border border-ink-200 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 border-b border-ink-200 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
          Interactive — play with the numbers
        </div>
        <div className="font-serif text-lg font-medium text-ink-900">
          Read funnel calculator
        </div>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div>
            <div className="flex justify-between text-xs text-ink-600 mb-2">
              <span className="font-medium">Incoming QPS</span>
              <span className="font-mono text-rust-600 tabular-nums">{fmt(totalQps)}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={500000}
              step={10000}
              value={totalQps}
              onChange={(e) => setTotalQps(Number(e.target.value))}
              className="w-full accent-rust-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-ink-600 mb-2">
              <span className="font-medium">Cache hit rate</span>
              <span className="font-mono text-rust-600 tabular-nums">{hitRate}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={99}
              value={hitRate}
              onChange={(e) => setHitRate(Number(e.target.value))}
              className="w-full accent-rust-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-ink-600 mb-2">
              <span className="font-medium">DB shards</span>
              <span className="font-mono text-rust-600 tabular-nums">{shards}</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={shards}
              onChange={(e) => setShards(Number(e.target.value))}
              className="w-full accent-rust-500"
            />
          </div>
        </div>

        {/* Funnel viz */}
        <div className="space-y-2">
          <FunnelRow
            label="At the load balancer"
            qps={totalQps}
            width={100}
            color="bg-ink-700"
          />

          <FunnelRow
            label={`Redis cache absorbs ${hitRate}%`}
            qps={cacheAbsorbed}
            width={hitRate}
            color="bg-teal-500"
            sub="served in <1ms from memory"
          />

          <FunnelRow
            label="Falls through to DB tier"
            qps={dbLoad}
            width={100 - hitRate}
            color="bg-rust-500"
            sub="spread across shards"
          />

          <FunnelRow
            label={`Per shard (${shards}x parallel)`}
            qps={perShard}
            width={Math.max(2, (100 - hitRate) / shards)}
            color="bg-rust-600"
            sub="trivial for Cassandra/DynamoDB"
          />
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-ink-100">
          <InsightBox
            label="DB connections needed"
            value={`~${fmt(Math.min(2000, Math.max(100, Math.ceil(dbLoad / 100))))}`}
            sub="pool reuse, not 1 per request"
          />
          <InsightBox
            label="QPS per pooled connection"
            value={`~${fmt(perConnection)}/s`}
            sub="each conn serves many queries"
          />
          <InsightBox
            label="Bottleneck layer"
            value={hitRate > 80 ? 'Redis' : hitRate > 50 ? 'DB shards' : 'Connection pool'}
            sub="follow the hot path"
            warn={hitRate < 70}
          />
        </div>
      </div>
    </div>
  );
}

function FunnelRow({ label, qps, width, color, sub }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-sm font-medium text-ink-800">{label}</div>
        <div className="font-mono text-sm font-semibold text-ink-900 tabular-nums">
          {qps.toLocaleString()}/s
        </div>
      </div>
      <div className="h-9 bg-cream-100 rounded overflow-hidden relative">
        <motion.div
          className={`h-full ${color} rounded`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {sub && (
          <div className="absolute inset-0 flex items-center px-3 text-xs text-white font-medium pointer-events-none">
            {width > 25 && sub}
          </div>
        )}
      </div>
    </div>
  );
}

function InsightBox({ label, value, sub, warn }) {
  return (
    <div className={`rounded-lg p-3 border ${warn ? 'bg-rust-50 border-rust-200' : 'bg-cream-50 border-ink-200'}`}>
      <div className="text-xs text-ink-500 mb-0.5">{label}</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`font-mono font-semibold ${warn ? 'text-rust-700' : 'text-ink-900'}`}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}
