import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Fan-out calculator for group chats: shows when fan-out-on-write breaks down */
export default function GroupFanoutViz() {
  const [members, setMembers]       = useState(50);
  const [onlinePct, setOnlinePct]   = useState(30);
  const [msgsPerMin, setMsgsPerMin] = useState(10);

  const {
    online, offline,
    writesPerMsg, readsPerMsg,
    writesPerSec, totalKafkaReads,
    strategy, strColor,
  } = useMemo(() => {
    const online  = Math.round(members * onlinePct / 100);
    const offline = members - online;
    const isWrite = members <= 500;
    const strategy   = isWrite ? 'Fan-out on Write' : 'Fan-out on Read';
    const strColor   = isWrite ? '#2D8B66' : '#4A6CF7';
    const writesPerMsg  = isWrite ? members : 1;
    const readsPerMsg   = isWrite ? 0 : online;
    const mps           = msgsPerMin / 60;
    const writesPerSec  = writesPerMsg * mps;
    const totalKafkaReads = isWrite ? online * mps : online * mps;
    return { online, offline, writesPerMsg, readsPerMsg, writesPerSec, totalKafkaReads, strategy, strColor };
  }, [members, onlinePct, msgsPerMin]);

  const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : n.toFixed(1);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Interactive calculator</div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Group Chat — Fan-out Strategy Selector</div>
      </div>

      <div className="p-6">
        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <Slider label="Group members" value={members} display={members.toLocaleString()} min={2} max={50000} step={50} onChange={setMembers} color={strColor} />
          <Slider label="Online percentage" value={onlinePct} display={`${onlinePct}%`} min={1} max={100} step={1} onChange={setOnlinePct} color={strColor} />
          <Slider label="Messages / minute" value={msgsPerMin} display={msgsPerMin} min={1} max={300} step={1} onChange={setMsgsPerMin} color={strColor} />
        </div>

        {/* Strategy badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={strategy}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-xl p-4 mb-6"
            style={{ background: strColor + '12', border: `2px solid ${strColor}40` }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: strColor + '20' }}>
              {strategy === 'Fan-out on Write' ? '✍️' : '📖'}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: strColor }}>Strategy: {strategy}</div>
              <div className="text-xs text-ink-600 dark:text-night-700 mt-0.5">
                {strategy === 'Fan-out on Write'
                  ? `≤500 members → write one Cassandra row, deliver to each online member via pub/sub`
                  : `>500 members → write once per message; online members pull on chat-open`
                }
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Group visualization */}
        <div className="bg-cream-50 dark:bg-night-300 rounded-lg p-4 mb-6">
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 mb-3">
            {members} members · {online} online · {offline} offline
          </div>
          <MemberGrid total={Math.min(members, 200)} onlinePct={onlinePct} strColor={strColor} />
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Cassandra writes/msg" value={fmt(writesPerMsg)} sub="rows written" warn={writesPerMsg > 10000} color={strColor} />
          <Metric label="Delivers to online" value={fmt(online)} sub="via pub/sub channels" color={strColor} />
          <Metric label="Writes/sec" value={fmt(writesPerSec)} sub={`at ${msgsPerMin} msg/min`} warn={writesPerSec > 100000} color={strColor} />
          <Metric label="Storage cost" value={strategy === 'Fan-out on Write' ? '1 row/msg' : '1 row/msg'} sub="always 1 row in Cassandra" color={strColor} />
        </div>

        {/* Threshold callout */}
        {members > 400 && members < 600 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg p-4 bg-amber-50 dark:bg-[#1A1300] border border-amber-200 dark:border-amber-900/50"
          >
            <div className="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-1">⚡ You're near the switchover threshold</div>
            <div className="text-xs text-amber-700 dark:text-amber-400">
              At ~500 members, fan-out on write starts creating write storms. Systems like WhatsApp Business and Slack channels switch to fan-out on read above this point.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MemberGrid({ total, onlinePct, strColor }) {
  const cols = Math.min(total, 40);
  const rows = Math.ceil(Math.min(total, 200) / cols);
  const dots = Array.from({ length: Math.min(total, 200) }).map((_, i) => i / total < onlinePct / 100);

  return (
    <div className="flex flex-wrap gap-[3px]">
      {dots.map((online, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.002 }}
          className="rounded-full"
          style={{ width: 8, height: 8, background: online ? strColor : '#D1D5DB' }}
          title={online ? 'Online' : 'Offline'}
        />
      ))}
      {total > 200 && (
        <span className="text-[10px] text-ink-400 dark:text-night-600 self-end ml-1">+{total - 200} more</span>
      )}
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

function Metric({ label, value, sub, warn, color }) {
  return (
    <div className={`rounded-lg p-3 text-center border ${warn ? 'bg-rust-50 dark:bg-[#1F0E07] border-rust-200 dark:border-[#3D2012]' : 'bg-cream-50 dark:bg-night-300 border-ink-200 dark:border-night-400'}`}>
      <div className="text-[10px] text-ink-500 dark:text-night-700 mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${warn ? 'text-rust-600 dark:text-rust-400' : ''}`} style={warn ? {} : { color }}>
        {value}
      </div>
      <div className="text-[10px] text-ink-400 dark:text-night-600 mt-0.5">{sub}</div>
    </div>
  );
}
