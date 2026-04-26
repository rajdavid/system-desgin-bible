import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Kafka configuration explorer for chat: partitions, ordering guarantees, consumer groups */
const CONFIGS = [
  {
    key: 'default',
    label: 'Default config',
    partitions: 8,
    color: '#D97706',
    pros: 'Simple to start.',
    cons: 'Hot partitions if chat load is skewed. May exhaust throughput at scale.',
  },
  {
    key: 'recommended',
    label: 'Recommended (64 partitions)',
    partitions: 64,
    color: '#2D8B66',
    pros: '2M msgs/sec peak ÷ 50K msg/sec/partition = 40 partitions minimum. 64 gives 37% headroom.',
    cons: 'More partitions = more consumer rebalances, more broker memory. OK at 64.',
  },
  {
    key: 'over',
    label: 'Over-partitioned (512)',
    partitions: 512,
    color: '#EF4444',
    pros: 'Extreme throughput headroom.',
    cons: '512 partitions × replication factor 3 = 1536 partition replicas. Zookeeper/KRaft overhead. Memory bloat. Diminishing returns.',
  },
];

const TOPICS = [
  { name: 'chat-messages', partitions: 64, key: 'chatId', retention: '7 days', desc: 'Main message stream. Partition by chatId → per-chat order preserved.' },
  { name: 'offline-deliveries', partitions: 32, key: 'recipientId', retention: '3 days', desc: 'Messages for offline users. Partition by userId → one consumer drains one user\'s queue.' },
  { name: 'delivery-acks', partitions: 32, key: 'chatId', retention: '1 day', desc: 'Delivery & read receipts. Low volume, short retention.' },
  { name: 'presence-events', partitions: 16, key: 'userId', retention: '1 hour', desc: 'Online/offline status changes. Very short retention — stale presence is useless.' },
];

export default function KafkaTopicExplorer() {
  const [config, setConfig] = useState('recommended');
  const [msgsPerSec, setMsgsPerSec] = useState(200000);
  const [selectedTopic, setSelectedTopic] = useState('chat-messages');

  const current = CONFIGS.find((c) => c.key === config);
  const topic = TOPICS.find((t) => t.name === selectedTopic);

  const partitionLoad = Math.round(msgsPerSec / current.partitions);
  const saturated = partitionLoad > 50000;

  const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toLocaleString();

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Kafka deep dive</div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Topic Design & Partition Strategy</div>
      </div>

      <div className="p-6 space-y-6">
        {/* Config selector */}
        <div>
          <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">Partition count</div>
          <div className="flex gap-2 flex-wrap mb-4">
            {CONFIGS.map((c) => (
              <button
                key={c.key}
                onClick={() => setConfig(c.key)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition border"
                style={config === c.key
                  ? { background: c.color, borderColor: c.color, color: '#fff' }
                  : { borderColor: '#D1D5DB', color: '#6B7280' }
                }
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-xs text-ink-600 dark:text-night-700 mb-2">
            <span>Peak messages / sec</span>
            <span className="font-mono" style={{ color: current.color }}>{fmt(msgsPerSec)}/s</span>
          </div>
          <input type="range" min={10000} max={5000000} step={10000} value={msgsPerSec} onChange={(e) => setMsgsPerSec(Number(e.target.value))} className="w-full mb-4" style={{ accentColor: current.color }} />

          {/* Partition load bars */}
          <div className="bg-cream-50 dark:bg-night-300 rounded-lg p-4">
            <div className="text-[11px] text-ink-500 dark:text-night-600 mb-3">
              Load per partition: <span className="font-mono font-semibold" style={{ color: saturated ? '#EF4444' : current.color }}>{fmt(partitionLoad)}/s</span>
              {saturated && <span className="text-red-600 dark:text-red-400 ml-2">⚠ over 50K/s limit!</span>}
            </div>
            <div className="flex gap-[2px] flex-wrap">
              {Array.from({ length: Math.min(current.partitions, 64) }).map((_, i) => {
                const load = partitionLoad / 50000;
                return (
                  <motion.div
                    key={i}
                    className="rounded-sm"
                    style={{
                      width: 8, height: 24,
                      background: saturated ? '#EF4444' : current.color,
                      opacity: Math.min(1, 0.3 + load * 0.7),
                    }}
                    title={`Partition ${i}: ${fmt(partitionLoad)}/s`}
                  />
                );
              })}
              {current.partitions > 64 && (
                <span className="text-[10px] text-ink-400 dark:text-night-600 self-center ml-1">+{current.partitions - 64} more</span>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={config}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3"
            >
              <div className="rounded-lg p-3 bg-teal-50 dark:bg-[#071A12] border border-teal-200 dark:border-teal-900/40 text-xs">
                <div className="font-semibold text-teal-700 dark:text-teal-300 mb-1">✓ {current.label}</div>
                <div className="text-ink-700 dark:text-night-700">{current.pros}</div>
              </div>
              <div className={`rounded-lg p-3 border text-xs ${config === 'over' ? 'bg-red-50 dark:bg-[#1A0000] border-red-200 dark:border-red-900/40' : 'bg-amber-50 dark:bg-[#1A1300] border-amber-200 dark:border-amber-900/40'}`}>
                <div className={`font-semibold mb-1 ${config === 'over' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>Tradeoffs</div>
                <div className="text-ink-700 dark:text-night-700">{current.cons}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Topic explorer */}
        <div>
          <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">Topic explorer</div>
          <div className="flex gap-2 flex-wrap mb-4">
            {TOPICS.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTopic(t.name)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-mono font-medium transition border ${
                  selectedTopic === t.name
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-ink-200 dark:border-night-500 text-ink-600 dark:text-night-700'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTopic}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-[#13051D] overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-purple-200 dark:border-purple-900/40 flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-purple-700 dark:text-purple-300">{topic.name}</span>
                <span className="text-[10px] bg-purple-200 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  {topic.partitions} partitions
                </span>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-ink-400 dark:text-night-600 mb-0.5">Partition key</div>
                    <code className="text-purple-700 dark:text-purple-300 font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">{topic.key}</code>
                  </div>
                  <div>
                    <div className="text-ink-400 dark:text-night-600 mb-0.5">Retention</div>
                    <span className="text-ink-800 dark:text-night-800 font-medium">{topic.retention}</span>
                  </div>
                  <div>
                    <div className="text-ink-400 dark:text-night-600 mb-0.5">Replication</div>
                    <span className="text-ink-800 dark:text-night-800 font-medium">factor 3</span>
                  </div>
                </div>
                <div className="text-sm text-ink-700 dark:text-night-700">{topic.desc}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ordering guarantee explainer */}
        <div className="rounded-xl bg-amber-50 dark:bg-[#1A1300] border border-amber-200 dark:border-amber-900/40 p-4">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">Key insight: ordering guarantee</div>
          <div className="text-sm text-ink-800 dark:text-night-800">
            Kafka preserves order <strong>within a single partition</strong>, not globally. By using <code className="text-xs bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded font-mono">chatId</code> as the partition key, all messages in one conversation land on the same partition, consumed by the same consumer thread — so per-chat ordering is preserved even at millions of msgs/sec. Global ordering across all chats would require a single partition (bottleneck) and is irrelevant for chat anyway.
          </div>
        </div>
      </div>
    </div>
  );
}
