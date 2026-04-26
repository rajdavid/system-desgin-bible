import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Interactive Cassandra schema explorer for chat messages */
export default function CassandraSchemaViz() {
  const [chatId]   = useState('abc123');
  const [bucket, setBucket] = useState('202602');
  const [msgCount, setMsgCount] = useState(1200);

  const partitionSizeKB = useMemo(() => {
    // avg 500 bytes/msg
    return Math.round(msgCount * 500 / 1024);
  }, [msgCount]);

  const healthy = partitionSizeKB < 100 * 1024; // <100MB is healthy

  const queryPlan = [
    { step: 'Hash (chat_id, bucket)', detail: `hash("${chatId}", "${bucket}") → token range`, color: '#4A6CF7' },
    { step: 'Route to replica set',   detail: 'consistent hash ring → 3 nodes (LOCAL_QUORUM)', color: '#7C3AED' },
    { step: 'Single-partition scan',  detail: `scan rows WHERE chat_id=? AND bucket=?`, color: '#2D8B66' },
    { step: 'Sorted row return',      detail: 'rows read in clustering key order (message_ts DESC)', color: '#D97706' },
  ];

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Cassandra deep dive</div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Wide-Column Schema — Chat Messages</div>
      </div>

      <div className="p-6 space-y-6">
        {/* Schema */}
        <div>
          <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">Table definition</div>
          <pre className="text-[12px] font-mono bg-[#0d1117] text-[#e6edf3] rounded-lg p-4 overflow-auto leading-relaxed">
{`CREATE TABLE chat.messages (
  chat_id      uuid,          -- identifies the conversation
  bucket       text,          -- 'YYYYMM' — caps partition size
  message_ts   timestamp,     -- clustering key → sorted on disk
  message_id   uuid,          -- idempotency, dedup
  sender_id    uuid,
  msg_type     text,          -- 'text' | 'image' | 'reaction'
  ciphertext   blob,          -- E2E encrypted payload
  deleted      boolean,

  PRIMARY KEY ((chat_id, bucket), message_ts)
) WITH CLUSTERING ORDER BY (message_ts DESC)
  AND compaction = { 'class': 'TimeWindowCompactionStrategy',
                     'compaction_window_unit': 'DAYS',
                     'compaction_window_size': 7 }
  AND compression = { 'class': 'LZ4Compressor' };`}
          </pre>
        </div>

        {/* Partition size calculator */}
        <div>
          <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">Partition size estimator</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="flex justify-between text-xs text-ink-600 dark:text-night-700 mb-2">
                <span>Messages in bucket</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{msgCount.toLocaleString()}</span>
              </div>
              <input type="range" min={100} max={500000} step={100} value={msgCount} onChange={(e) => setMsgCount(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="rounded-lg p-3 border text-center" style={{ background: healthy ? '#E5F3EE' : '#FEF2F2', borderColor: healthy ? '#2D8B66' : '#EF4444' }}>
              <div className="text-xs text-ink-500 mb-1">Partition size</div>
              <div className={`text-xl font-bold font-mono ${healthy ? 'text-teal-700' : 'text-red-600'}`}>
                {partitionSizeKB >= 1024 ? `${(partitionSizeKB / 1024).toFixed(1)} MB` : `${partitionSizeKB} KB`}
              </div>
              <div className={`text-[10px] mt-1 ${healthy ? 'text-teal-700' : 'text-red-600'}`}>
                {healthy ? '✓ healthy (<100MB)' : '⚠ exceeds soft limit!'}
              </div>
            </div>
            <div className="rounded-lg p-3 border border-ink-200 dark:border-night-400 bg-cream-50 dark:bg-night-300 text-center">
              <div className="text-xs text-ink-500 dark:text-night-600 mb-1">At this rate, 1 bucket covers</div>
              <div className="text-xl font-bold font-mono text-ink-900 dark:text-night-900">
                {msgCount < 10 ? '∞' : `${Math.round(30 * 24 * 3600 / (msgCount / 30)).toLocaleString()}s`}
              </div>
              <div className="text-[10px] mt-1 text-ink-400 dark:text-night-600">avg interval between msgs</div>
            </div>
          </div>

          {/* Partition layout visualization */}
          <div className="bg-cream-50 dark:bg-night-300 rounded-lg p-4">
            <div className="text-[11px] font-medium text-ink-500 dark:text-night-700 mb-3">Partition layout for chat "{chatId}" across buckets:</div>
            <div className="flex gap-2 items-end flex-wrap">
              {['202601','202602','202603'].map((b) => {
                const isSelected = b === bucket;
                const height = isSelected ? 80 : 48;
                return (
                  <button key={b} onClick={() => setBucket(b)} className="flex flex-col items-center gap-1">
                    <motion.div
                      animate={{ height }}
                      className="w-20 rounded-t-md flex items-end justify-center pb-2"
                      style={{
                        background: isSelected ? '#4A6CF720' : '#6B728010',
                        border: `2px solid ${isSelected ? '#4A6CF7' : '#D1D5DB'}`,
                      }}
                    >
                      <span className="text-[10px] font-mono" style={{ color: isSelected ? '#4A6CF7' : '#9CA3AF' }}>
                        {isSelected ? `${partitionSizeKB >= 1024 ? `${(partitionSizeKB/1024).toFixed(0)}MB` : `${partitionSizeKB}KB`}` : '~450KB'}
                      </span>
                    </motion.div>
                    <span className="text-[10px] text-ink-500 dark:text-night-700">{b}</span>
                  </button>
                );
              })}
              <div className="text-ink-400 dark:text-night-600 text-sm self-end mb-5 ml-1">…</div>
            </div>
          </div>
        </div>

        {/* Query plan */}
        <div>
          <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">Query execution plan for paginated read</div>
          <pre className="text-[12px] font-mono bg-[#0d1117] text-[#e6edf3] rounded-lg px-4 py-3 mb-4 overflow-auto">
{`SELECT message_ts, sender_id, ciphertext
FROM chat.messages
WHERE chat_id = '${chatId}'
  AND bucket  = '${bucket}'
  AND message_ts < toTimestamp(now())
ORDER BY message_ts DESC
LIMIT 50;`}
          </pre>
          <div className="space-y-2">
            {queryPlan.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ background: step.color + '0D', border: `1px solid ${step.color}25` }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ background: step.color }}>
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-ink-900 dark:text-night-900">{step.step}</div>
                  <div className="text-[11px] font-mono text-ink-500 dark:text-night-700 mt-0.5">{step.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
