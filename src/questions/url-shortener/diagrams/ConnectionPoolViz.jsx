import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ConnectionPoolViz() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 400);
    return () => clearInterval(id);
  }, []);

  const POOL_SIZE = 8;
  const connections = Array.from({ length: POOL_SIZE }).map((_, i) => {
    const busy = (tick + i * 3) % 5 !== 0;
    return { id: i, busy };
  });

  const busyCount = connections.filter((c) => c.busy).length;

  return (
    <div className="bg-white rounded-xl border border-ink-200 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 border-b border-ink-200 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
          Animated — watch connections get reused
        </div>
        <div className="font-serif text-lg font-medium text-ink-900">
          Why 2,000 connections can serve 200K QPS
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {connections.map((c) => (
            <motion.div
              key={c.id}
              animate={{
                backgroundColor: c.busy ? '#C4643A' : '#E5F3EE',
                borderColor: c.busy ? '#843E1C' : '#2D8B66',
              }}
              transition={{ duration: 0.15 }}
              className="rounded-lg border-2 p-3 text-center"
            >
              <div className={`font-mono text-[10px] mb-1 ${c.busy ? 'text-rust-100' : 'text-teal-700'}`}>
                conn {c.id}
              </div>
              <div className={`text-xs font-semibold ${c.busy ? 'text-white' : 'text-teal-700'}`}>
                {c.busy ? 'QUERY' : 'idle'}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricBox label="Pool size" value={POOL_SIZE} />
          <MetricBox label="Busy now" value={`${busyCount} / ${POOL_SIZE}`} />
          <MetricBox label="Query time" value="~3ms" />
          <MetricBox label="QPS per conn" value="~300" accent />
        </div>

        <div className="mt-4 text-sm text-ink-700 leading-relaxed">
          <strong className="text-ink-900">Little's Law:</strong> if each query takes 3ms, one connection sustains ~330 QPS
          through reuse. Scale it: 100 connections × 20 app servers = 2,000 pooled sockets comfortably handling 600K+ theoretical QPS.
          You're never connection-bound before you're CPU-bound.
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, accent }) {
  return (
    <div className={`rounded-lg p-3 border ${accent ? 'bg-rust-50 border-rust-200' : 'bg-cream-50 border-ink-200'}`}>
      <div className="text-xs text-ink-500 mb-0.5">{label}</div>
      <div className={`font-mono font-semibold ${accent ? 'text-rust-700' : 'text-ink-900'}`}>{value}</div>
    </div>
  );
}
