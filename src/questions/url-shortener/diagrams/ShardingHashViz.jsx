import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Simple deterministic hash (FNV-like)
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
  const [key, setKey] = useState('abc123');

  const { hash, hashHex, shard } = useMemo(() => {
    const h = hashStr(key);
    return {
      hash: h,
      hashHex: '0x' + h.toString(16).padStart(8, '0'),
      shard: h % NUM_SHARDS,
    };
  }, [key]);

  return (
    <div className="bg-white rounded-xl border border-ink-200 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 border-b border-ink-200 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
          Interactive — type or pick a key
        </div>
        <div className="font-serif text-lg font-medium text-ink-900">
          Watch a shortKey route to its shard
        </div>
      </div>

      <div className="p-6">
        {/* Input */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-ink-500">GET /</span>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.slice(0, 12))}
              className="flex-1 px-3 py-2 font-mono bg-cream-50 border border-ink-200 rounded focus:outline-none focus:border-rust-500 focus:ring-1 focus:ring-rust-500"
              placeholder="type a shortKey…"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-ink-500 py-1">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setKey(ex)}
                className="text-xs font-mono bg-cream-100 hover:bg-cream-200 border border-ink-200 text-ink-700 px-2 py-1 rounded transition"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <PipelineStep label="Input key" value={key || '—'} mono accent />
          <PipelineStep label="Hash output" value={hashHex} mono />
          <PipelineStep
            label={`Modulo ${NUM_SHARDS}`}
            value={`→ shard ${shard}`}
            mono
            highlight
          />
        </div>

        {/* Shards */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: NUM_SHARDS }).map((_, i) => {
            const isActive = i === shard;
            return (
              <motion.div
                key={i}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  boxShadow: isActive
                    ? '0 0 0 2px #C4643A, 0 8px 24px rgba(196, 100, 58, 0.25)'
                    : '0 0 0 0px transparent',
                }}
                transition={{ duration: 0.25 }}
                className={`relative rounded-lg p-3 text-center border transition-colors ${
                  isActive
                    ? 'bg-rust-50 border-rust-500'
                    : 'bg-cream-50 border-ink-200 opacity-60'
                }`}
              >
                <div className={`font-mono text-[10px] mb-1 ${isActive ? 'text-rust-700' : 'text-ink-500'}`}>
                  shard
                </div>
                <div className={`font-serif text-xl font-medium tabular-nums ${isActive ? 'text-rust-700' : 'text-ink-400'}`}>
                  {i}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="pin"
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rust-500"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-ink-600 leading-relaxed">
          <strong className="text-ink-900">Notice:</strong> every shortKey lands on exactly one shard — deterministically.
          Change the key, the shard changes. Run this 20,000 times/sec with random keys and each shard gets ~2K reads/sec.
          That's the entire sharding model.
        </div>
      </div>
    </div>
  );
}

function PipelineStep({ label, value, mono, accent, highlight }) {
  return (
    <div
      className={`rounded-lg p-3 border ${
        highlight
          ? 'bg-rust-50 border-rust-300'
          : accent
          ? 'bg-teal-50 border-teal-200'
          : 'bg-cream-50 border-ink-200'
      }`}
    >
      <div className="text-xs text-ink-500 mb-1">{label}</div>
      <div
        className={`${mono ? 'font-mono' : ''} font-semibold truncate ${
          highlight ? 'text-rust-700' : 'text-ink-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
