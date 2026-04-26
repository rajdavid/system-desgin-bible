import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Animated message lifecycle: Sender → Chat Server A → Kafka → Cassandra → Chat Server B → Receiver */
const TIMELINE = [
  { t: 0,   actor: 'User A',        event: 'Types & sends message', detail: 'WS frame → Chat Server A', color: '#4A6CF7', side: 'left' },
  { t: 2,   actor: 'Chat Server A', event: 'Validates session, deduplicates', detail: 'clientMsgId check → idempotent. Returns optimistic ACK to A.', color: '#7C3AED', side: 'center' },
  { t: 8,   actor: 'Chat Server A', event: 'Publishes to Kafka', detail: 'key=chatId → partition consistent per chat', color: '#7C3AED', side: 'center' },
  { t: 10,  actor: 'Kafka',         event: 'Leader acks write', detail: 'Durable on 3 replicas. Returns offset.', color: '#D97706', side: 'center' },
  { t: 15,  actor: 'Message Svc',   event: 'Consumes from Kafka', detail: 'Stateless consumer group reads partition', color: '#059669', side: 'center' },
  { t: 18,  actor: 'Cassandra',     event: 'INSERT at LOCAL_QUORUM', detail: `Partition (chatId, bucket). message_id = UUID. Sub-millisecond append to LSM memtable.`, color: '#059669', side: 'center' },
  { t: 20,  actor: 'Router',        event: 'Lookup Connection Manager', detail: 'GET userId → serverId (Redis). Miss = offline path.', color: '#D97706', side: 'center' },
  { t: 25,  actor: 'Redis Pub/Sub', event: 'PUBLISH inbox:server:B', detail: 'Single Redis round-trip. Chat Server B subscribes to this channel.', color: '#2D8B66', side: 'center' },
  { t: 27,  actor: 'Chat Server B', event: 'Receives via SUBSCRIBE callback', detail: 'Pushes WS frame to User B socket immediately.', color: '#7C3AED', side: 'center' },
  { t: 30,  actor: 'User B',        event: 'Message delivered', detail: 'Client renders bubble. Sends delivery_ack WS frame.', color: '#4A6CF7', side: 'right' },
  { t: 35,  actor: 'User A',        event: 'Double-tick ✓✓ shown', detail: 'delivery_ack routes back through Kafka → Chat Server A → User A socket.', color: '#4A6CF7', side: 'left' },
  { t: 80,  actor: 'User B',        event: 'Read receipt', detail: 'User B opens chat. read_ack sent. User A sees blue ticks.', color: '#4A6CF7', side: 'right' },
];

export default function MessageLifecycle() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= TIMELINE.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setStep((s) => s + 1), speed);
    return () => clearTimeout(timerRef.current);
  }, [playing, step, speed]);

  const start = () => { setStep(0); setPlaying(true); };
  const pause = () => setPlaying(false);
  const reset = () => { setStep(-1); setPlaying(false); clearTimeout(timerRef.current); };

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Step-by-step animation</div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Message Lifecycle — t=0ms to t=80ms</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="text-xs bg-white dark:bg-night-300 border border-ink-200 dark:border-night-500 rounded-md px-2 py-1 text-ink-600 dark:text-night-700"
          >
            <option value={1500}>0.5× speed</option>
            <option value={700}>1× speed</option>
            <option value={300}>2× speed</option>
          </select>
          <button onClick={reset} className="text-xs px-2.5 py-1.5 rounded-lg bg-ink-100 dark:bg-night-400 text-ink-600 dark:text-night-700">Reset</button>
          {playing
            ? <button onClick={pause} className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium">⏸ Pause</button>
            : <button onClick={start} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium">▶ Play</button>
          }
        </div>
      </div>

      <div className="p-6">
        {/* Progress bar */}
        <div className="h-1.5 bg-ink-100 dark:bg-night-400 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            animate={{ width: `${step < 0 ? 0 : ((step + 1) / TIMELINE.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Three-column layout: User A | Events | User B */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-4">
          {/* User A */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-ink-400 dark:text-night-600 uppercase text-center mb-3">User A (Sender)</div>
            {TIMELINE.filter((e) => e.side === 'left').map((e, i) => {
              const globalIdx = TIMELINE.indexOf(e);
              const done = step >= globalIdx;
              return (
                <motion.div
                  key={i}
                  animate={{ opacity: done ? 1 : 0.2, scale: done ? 1 : 0.97 }}
                  className="rounded-lg p-2.5 text-right"
                  style={{ background: done ? e.color + '12' : 'transparent', border: `1px solid ${done ? e.color + '30' : 'transparent'}` }}
                >
                  <div className="text-[11px] font-medium" style={{ color: done ? e.color : '#9CA3AF' }}>{e.event}</div>
                  {done && <div className="text-[10px] text-ink-500 dark:text-night-600 mt-0.5">{e.detail}</div>}
                </motion.div>
              );
            })}
          </div>

          {/* Center timeline */}
          <div className="relative">
            <div className="text-[10px] font-semibold text-ink-400 dark:text-night-600 uppercase text-center mb-3">System</div>
            <div className="relative border-l-2 border-ink-100 dark:border-night-400 ml-4 pl-4 space-y-2">
              {TIMELINE.filter((e) => e.side === 'center').map((e, i) => {
                const globalIdx = TIMELINE.indexOf(e);
                const done = step >= globalIdx;
                const isCurrent = step === globalIdx;
                return (
                  <motion.div
                    key={i}
                    animate={{ opacity: done ? 1 : 0.25 }}
                    className="relative"
                  >
                    {/* dot on the line */}
                    <motion.div
                      className="absolute -left-[21px] w-3.5 h-3.5 rounded-full border-2 border-white dark:border-night-200"
                      animate={{ scale: isCurrent ? [1, 1.4, 1] : 1 }}
                      transition={{ duration: 0.6 }}
                      style={{ background: done ? e.color : '#D1D5DB', top: 6 }}
                    />
                    <div
                      className="rounded-lg p-2.5"
                      style={{ background: done ? e.color + '0F' : 'transparent', border: `1px solid ${done ? e.color + '25' : 'transparent'}` }}
                    >
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="font-mono text-[9px] text-ink-400 dark:text-night-600">t={e.t}ms</span>
                        <span className="text-[10px] font-semibold" style={{ color: done ? e.color : '#9CA3AF' }}>{e.actor}</span>
                      </div>
                      <div className="text-[11px] font-medium text-ink-800 dark:text-night-800">{e.event}</div>
                      {done && <div className="text-[10px] text-ink-500 dark:text-night-600 mt-0.5">{e.detail}</div>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* User B */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-ink-400 dark:text-night-600 uppercase text-center mb-3">User B (Receiver)</div>
            {TIMELINE.filter((e) => e.side === 'right').map((e, i) => {
              const globalIdx = TIMELINE.indexOf(e);
              const done = step >= globalIdx;
              return (
                <motion.div
                  key={i}
                  animate={{ opacity: done ? 1 : 0.2, scale: done ? 1 : 0.97 }}
                  className="rounded-lg p-2.5"
                  style={{ background: done ? e.color + '12' : 'transparent', border: `1px solid ${done ? e.color + '30' : 'transparent'}` }}
                >
                  <div className="text-[11px] font-medium" style={{ color: done ? e.color : '#9CA3AF' }}>{e.event}</div>
                  {done && <div className="text-[10px] text-ink-500 dark:text-night-600 mt-0.5">{e.detail}</div>}
                </motion.div>
              );
            })}
          </div>
        </div>

        {step === -1 && (
          <div className="text-center text-sm text-ink-500 dark:text-night-600 mt-4">
            Hit Play to walk through the full message delivery lifecycle from User A typing to User B reading.
          </div>
        )}
      </div>
    </div>
  );
}
