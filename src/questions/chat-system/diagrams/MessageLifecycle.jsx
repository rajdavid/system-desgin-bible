import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* Three lifecycle scenarios so candidates see both the happy path and the failure branches. */
const SCENARIOS = {
  happy: {
    label: 'Happy path',
    description: 'Sender → Chat Server A → Kafka → Cassandra → Chat Server B → Receiver. Everything ACKs cleanly.',
    color: '#2D8B66',
    timeline: [
      { t: 0,   actor: 'User A',        event: 'Types & sends message',           detail: 'WS frame → Chat Server A',                                                              color: '#4A6CF7', side: 'left'   },
      { t: 2,   actor: 'Chat Server A', event: 'Validates, deduplicates',         detail: 'clientMsgId check → idempotent. Returns optimistic ACK to A.',                          color: '#7C3AED', side: 'center' },
      { t: 8,   actor: 'Chat Server A', event: 'Publishes to Kafka',              detail: 'key=chatId → partition consistent per chat',                                            color: '#7C3AED', side: 'center' },
      { t: 10,  actor: 'Kafka',         event: 'Leader acks write',               detail: 'Durable on 3 replicas. Returns offset.',                                                color: '#D97706', side: 'center' },
      { t: 15,  actor: 'Message Svc',   event: 'Consumes from Kafka',             detail: 'Stateless consumer group reads partition',                                              color: '#059669', side: 'center' },
      { t: 18,  actor: 'Cassandra',     event: 'INSERT at LOCAL_QUORUM',          detail: 'Partition (chatId, bucket). UUID. Sub-ms LSM memtable append.',                         color: '#059669', side: 'center' },
      { t: 20,  actor: 'Router',        event: 'Lookup Connection Manager',       detail: 'GET userId → serverId (Redis). Miss = offline path.',                                   color: '#D97706', side: 'center' },
      { t: 25,  actor: 'Redis Pub/Sub', event: 'PUBLISH inbox:server:B',          detail: 'Single Redis round-trip. Chat Server B subscribes to this channel.',                    color: '#2D8B66', side: 'center' },
      { t: 27,  actor: 'Chat Server B', event: 'Receives via SUBSCRIBE callback', detail: 'Pushes WS frame to User B socket immediately.',                                         color: '#7C3AED', side: 'center' },
      { t: 30,  actor: 'User B',        event: 'Message delivered',               detail: 'Client renders bubble. Sends delivery_ack WS frame.',                                   color: '#4A6CF7', side: 'right'  },
      { t: 35,  actor: 'User A',        event: 'Double-tick ✓✓ shown',            detail: 'delivery_ack routes back through Kafka → Chat Server A → User A socket.',               color: '#4A6CF7', side: 'left'   },
      { t: 80,  actor: 'User B',        event: 'Read receipt',                    detail: 'User B opens chat. read_ack sent. User A sees blue ticks.',                             color: '#4A6CF7', side: 'right'  },
    ],
  },
  ackLost: {
    label: 'WS ACK lost — client retries',
    description: "Kafka durably accepted the message, but A's network dropped before the WS ACK arrived. Idempotency on clientMsgId saves us.",
    color: '#D97706',
    timeline: [
      { t: 0,   actor: 'User A',        event: 'Types & sends message',          detail: 'WS frame includes clientMsgId=UUID-7f42…',                                              color: '#4A6CF7', side: 'left'   },
      { t: 2,   actor: 'Chat Server A', event: 'Receives frame, dedupe check',   detail: 'clientMsgId not seen. Proceed.',                                                        color: '#7C3AED', side: 'center' },
      { t: 8,   actor: 'Chat Server A', event: 'Publishes to Kafka',             detail: 'acks=all. Successful.',                                                                 color: '#7C3AED', side: 'center' },
      { t: 10,  actor: 'Kafka',         event: 'Leader + 2 replicas acked',      detail: 'Message is durable. Server A computes server-side ACK frame for User A.',               color: '#D97706', side: 'center' },
      { t: 14,  actor: 'Network',       event: '⚠ WS ACK frame lost in transit', detail: 'A’s phone dropped Wi-Fi, ACK never arrives. Server A is unaware — it thinks all is well.', color: '#EF4444', side: 'center' },
      { t: 20,  actor: 'User A',        event: 'Client times out, retries',      detail: 'Same clientMsgId=UUID-7f42… on a new WS connection. Server A may even be a different box.', color: '#4A6CF7', side: 'left'   },
      { t: 25,  actor: 'Chat Server A', event: 'Dedupe HIT on clientMsgId',      detail: 'Looks up Redis: SET dedupe:{clientMsgId} → existing messageId. Returns stored ACK.',     color: '#2D8B66', side: 'center' },
      { t: 27,  actor: 'User A',        event: 'Single tick ✓ shown',            detail: 'Client now believes the message landed. No duplicate Kafka write — no double-bubble for B.', color: '#4A6CF7', side: 'left' },
      { t: 30,  actor: 'User B',        event: 'Receives exactly one bubble',    detail: 'B already got the original at t=27 of the happy path. Idempotency held.',                color: '#4A6CF7', side: 'right'  },
    ],
  },
  kafkaFail: {
    label: 'Kafka write fails — backpressure',
    description: 'Quorum lost on the partition leader. Chat Server must NOT ACK the client. Client buffers locally and retries.',
    color: '#EF4444',
    timeline: [
      { t: 0,   actor: 'User A',        event: 'Types & sends message',                detail: 'WS frame → Chat Server A',                                                          color: '#4A6CF7', side: 'left'   },
      { t: 2,   actor: 'Chat Server A', event: 'Validates, deduplicates',              detail: 'clientMsgId check → new message',                                                   color: '#7C3AED', side: 'center' },
      { t: 8,   actor: 'Chat Server A', event: 'Publishes to Kafka',                   detail: 'Producer has acks=all + idempotence=true',                                          color: '#7C3AED', side: 'center' },
      { t: 12,  actor: 'Kafka',         event: '⚠ NotEnoughReplicasException',         detail: 'min.insync.replicas=2 not met — only the leader is up. Producer retries.',          color: '#EF4444', side: 'center' },
      { t: 30,  actor: 'Kafka',         event: '⚠ Retries exhausted (or timeout)',     detail: 'After delivery.timeout.ms (~120s) producer gives up. Message NOT durable.',         color: '#EF4444', side: 'center' },
      { t: 32,  actor: 'Chat Server A', event: 'NACK to client — do not ack',          detail: 'WS frame { type: "send_failed", clientMsgId, reason: "transient" }',                color: '#D97706', side: 'center' },
      { t: 34,  actor: 'User A',        event: 'Client shows ⏳ (queued locally)',     detail: 'Same clientMsgId stays in client outbox. Will retry on next connect or after backoff.', color: '#4A6CF7', side: 'left' },
      { t: 60,  actor: 'Kafka',         event: 'Leader+ISR healthy again',             detail: 'Replica caught up; min.insync.replicas now satisfied.',                             color: '#2D8B66', side: 'center' },
      { t: 62,  actor: 'User A',        event: 'Client retries with same clientMsgId', detail: 'Resumes the happy path from t=8. Idempotency prevents duplicates if anything raced.', color: '#4A6CF7', side: 'left'   },
    ],
  },
};

export default function MessageLifecycle() {
  const [scenarioKey, setScenarioKey] = useState('happy');
  const scenario = SCENARIOS[scenarioKey];
  const TIMELINE = scenario.timeline;

  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= TIMELINE.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setStep((s) => s + 1), speed);
    return () => clearTimeout(timerRef.current);
  }, [playing, step, speed, TIMELINE.length]);

  // Reset progression when scenario changes
  useEffect(() => {
    setStep(-1);
    setPlaying(false);
    clearTimeout(timerRef.current);
  }, [scenarioKey]);

  const start = () => { setStep(0); setPlaying(true); };
  const pause = () => setPlaying(false);
  const reset = () => { setStep(-1); setPlaying(false); clearTimeout(timerRef.current); };

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Step-by-step animation</div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Message Lifecycle</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Scenario selector */}
      <div className="px-6 pt-4 pb-2 border-b border-ink-100 dark:border-night-400/50 flex flex-wrap gap-2">
        {Object.entries(SCENARIOS).map(([key, s]) => {
          const isActive = scenarioKey === key;
          return (
            <button
              key={key}
              onClick={() => setScenarioKey(key)}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-medium border transition-all ${isActive ? 'text-white' : 'text-ink-700 dark:text-night-700 bg-white dark:bg-night-300 border-ink-200 dark:border-night-500 hover:bg-ink-100 dark:hover:bg-night-400'}`}
              style={isActive ? { background: s.color, borderColor: s.color } : {}}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="px-6 pt-2 pb-1 text-[12px] text-ink-600 dark:text-night-700 italic">{scenario.description}</div>

      <div className="p-6">
        {/* Progress bar */}
        <div className="h-1.5 bg-ink-100 dark:bg-night-400 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: scenario.color }}
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
            Pick a scenario above and hit Play to walk through it step by step.
          </div>
        )}
      </div>
    </div>
  );
}
