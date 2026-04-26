import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Presence system: lazy vs eager, cost comparison */
const MODES = [
  {
    key: 'lazy',
    label: 'Lazy (recommended)',
    color: '#2D8B66',
    desc: 'Friends query presence on-demand when they open a chat. Short Redis TTL (30s). Cost = O(active conversations).',
    formula: (users, friends, activePct) => {
      const activePairs = Math.round(users * activePct / 100);
      return activePairs; // presence queries per minute
    },
    formulaLabel: (users, friends, activePct) => {
      const pairs = Math.round(users * activePct / 100);
      return `Active chat sessions (~${activePct}% of ${users.toLocaleString()} users) = ${pairs.toLocaleString()} presence queries/min`;
    },
  },
  {
    key: 'eager',
    label: 'Eager (naïve)',
    color: '#EF4444',
    desc: 'Push every online/offline toggle to every friend immediately. Cost = O(friends²) × event rate.',
    formula: (users, friends, activePct) => {
      const togglesPerMin = Math.round(users * 0.02); // 2% of users toggle status per minute
      return togglesPerMin * friends; // total writes per min
    },
    formulaLabel: (users, friends, activePct) => {
      const toggles = Math.round(users * 0.02);
      return `${toggles.toLocaleString()} status changes/min × ${friends} friends = ${(toggles * friends).toLocaleString()} cache writes/min`;
    },
  },
];

const HEARTBEAT_EVENTS = [
  { t: 0,   label: 'User opens app', icon: '📱', detail: 'Client sends PING frame every 30s to keep WS alive.' },
  { t: 30,  label: 'PING → PONG', icon: '🏓', detail: 'Server responds PONG. Refreshes presence TTL (60s) in Redis.' },
  { t: 60,  label: 'PING → PONG', icon: '🏓', detail: 'Heartbeat continues. Redis key expiry reset.' },
  { t: 90,  label: 'User backgrounds app', icon: '🔒', detail: 'WebSocket may idle. PING interval increases to 60s (platform limits). Last seen = now.' },
  { t: 150, label: 'No PING received', icon: '⏳', detail: 'Redis TTL (60s) expires. User appears offline automatically — no extra message needed.' },
  { t: 155, label: 'Status → Offline', icon: '⭕', detail: 'Connection Manager entry expires. Friends see "last seen X ago" on next presence query.' },
];

export default function PresenceHeartbeat() {
  const [mode, setMode] = useState('lazy');
  const [users, setUsers] = useState(50000);
  const [friends, setFriends] = useState(150);
  const [activePct, setActivePct] = useState(20);
  const [heartbeatStep, setHeartbeatStep] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const current = MODES.find((m) => m.key === mode);
  const costPerMin = useMemo(() => current.formula(users, friends, activePct), [current, users, friends, activePct]);
  const lazyModes = MODES[0].formula(users, friends, activePct);
  const eagerModes = MODES[1].formula(users, friends, activePct);
  const savings = eagerModes > 0 ? Math.round((1 - lazyModes / eagerModes) * 100) : 0;

  useState(() => {
    if (!playing) return;
    if (heartbeatStep >= HEARTBEAT_EVENTS.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setHeartbeatStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  });

  const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toLocaleString();

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Presence system</div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Heartbeat · Online Status · Lazy vs Eager</div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode toggle */}
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition border`}
              style={mode === m.key
                ? { background: m.color, borderColor: m.color, color: '#fff' }
                : { borderColor: '#D1D5DB', color: '#6B7280' }
              }
            >
              {m.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-ink-700 dark:text-night-700 rounded-lg p-3"
            style={{ background: current.color + '0D', border: `1px solid ${current.color}25` }}
          >
            {current.desc}
          </motion.div>
        </AnimatePresence>

        {/* Sliders */}
        <div className="grid grid-cols-3 gap-4">
          <Slider label="Total users" value={users} display={`${(users/1000).toFixed(0)}K`} min={1000} max={1000000} step={1000} onChange={setUsers} color={current.color} />
          <Slider label="Avg friends/user" value={friends} display={friends} min={10} max={500} step={10} onChange={setFriends} color={current.color} />
          <Slider label="Active sessions %" value={activePct} display={`${activePct}%`} min={1} max={80} step={1} onChange={setActivePct} color={current.color} />
        </div>

        {/* Cost comparison */}
        <div>
          <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">Writes per minute to Redis</div>
          <div className="space-y-3">
            {MODES.map((m) => {
              const cost = m.formula(users, friends, activePct);
              const max = Math.max(lazyModes, eagerModes);
              const pct = max > 0 ? (cost / max) * 100 : 0;
              return (
                <div key={m.key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-ink-700 dark:text-night-800">{m.label}</span>
                    <span className="font-mono tabular-nums" style={{ color: m.color }}>{fmt(cost)}/min</span>
                  </div>
                  <div className="h-7 bg-cream-100 dark:bg-night-300 rounded-md overflow-hidden">
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      className="h-full rounded-md"
                      style={{ background: m.color + '80' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="text-[10px] text-ink-400 dark:text-night-600 mt-1">{m.formulaLabel(users, friends, activePct)}</div>
                </div>
              );
            })}
          </div>

          {savings > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-[#071A12] border border-teal-200 dark:border-teal-900/40 rounded-lg px-4 py-2"
            >
              ✓ Lazy approach uses {savings}% fewer Redis writes at these numbers
            </motion.div>
          )}
        </div>

        {/* Heartbeat timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-ink-500 dark:text-night-700 uppercase tracking-wider">Heartbeat timeline (WebSocket PING/PONG)</div>
            <div className="flex gap-2">
              <button onClick={() => { setHeartbeatStep(-1); setPlaying(false); }} className="text-xs px-2 py-1 rounded bg-ink-100 dark:bg-night-400 text-ink-600 dark:text-night-700">Reset</button>
              <button
                onClick={() => { setHeartbeatStep(0); setPlaying(true); }}
                className="text-xs px-3 py-1 rounded bg-teal-600 text-white font-medium"
              >▶ Simulate</button>
            </div>
          </div>
          <HeartbeatTimeline step={heartbeatStep} />
        </div>
      </div>
    </div>
  );
}

function HeartbeatTimeline({ step }) {
  return (
    <div className="relative border-l-2 border-ink-100 dark:border-night-400 ml-3 pl-5 space-y-3">
      {HEARTBEAT_EVENTS.map((e, i) => {
        const done = step >= i;
        return (
          <motion.div
            key={i}
            animate={{ opacity: done ? 1 : 0.2 }}
            className="relative"
          >
            <motion.div
              className="absolute -left-[23px] text-sm"
              animate={{ scale: done ? 1 : 0.8 }}
              style={{ top: 2 }}
            >
              {e.icon}
            </motion.div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="font-mono text-[10px] text-ink-400 dark:text-night-600">t={e.t}s</span>
              <span className="text-[11px] font-semibold text-ink-800 dark:text-night-800">{e.label}</span>
            </div>
            {done && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-ink-500 dark:text-night-700"
              >
                {e.detail}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function Slider({ label, value, display, min, max, step, onChange, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-600 dark:text-night-700 mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-mono tabular-nums" style={{ color }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" style={{ accentColor: color }} />
    </div>
  );
}
