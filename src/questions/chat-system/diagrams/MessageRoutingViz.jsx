import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Interactive: shows how msgs route online vs offline, via pub/sub vs broadcast */
const STRATEGIES = [
  {
    key: 'pubsub',
    label: 'Redis Pub/Sub (recommended)',
    color: '#2D8B66',
    desc: 'Each chat server subscribes to inbox:server:{id}. Router publishes once to the correct channel. O(1) routing, no broadcast.',
    pros: ['O(1) routing — 1 publish to 1 channel', 'No cross-server mesh complexity', 'Redis handles fan-out internally', 'Extra ~1ms vs direct — below human perception'],
    cons: ['Redis is a new hop in the hot path', 'If Redis cluster blips, delivery pauses (sec)', 'Need Redis HA for this to be safe'],
  },
  {
    key: 'broadcast',
    label: 'Broadcast to all servers',
    color: '#D97706',
    desc: 'Every server listens for all messages, filters its own. Works at small scale, catastrophic at 625 servers.',
    pros: ['No Connection Manager needed', 'Simplest implementation', 'Works fine with 3-5 servers'],
    cons: ['O(N) servers receive every message — N=625 → 624 wasted delivers per msg', '2M msgs/sec × 625 = 1.25B msg delivers/sec total', 'Network + CPU saturation inevitable', 'Never used beyond prototypes'],
  },
  {
    key: 'direct',
    label: 'Direct server-to-server mesh',
    color: '#4A6CF7',
    desc: 'Each server opens a connection to every other server. Message routes directly. Gives ~0ms delay vs pub/sub.',
    pros: ['Sub-millisecond routing (pure TCP)', 'No intermediary dependency', 'Good for very small clusters'],
    cons: ['N² connections: 625² = ~390K open sockets', 'Adding a server requires N new connections simultaneously', 'Operational nightmare at scale'],
  },
];

export default function MessageRoutingViz() {
  const [strategy, setStrategy] = useState('pubsub');
  const [servers, setServers] = useState(10);
  const [msgsPerSec, setMsgsPerSec] = useState(200000);

  const metrics = useMemo(() => {
    const current = STRATEGIES.find((s) => s.key === strategy);
    const connections = strategy === 'direct' ? servers * (servers - 1) : strategy === 'pubsub' ? servers : servers;
    const msgsDelivered = strategy === 'broadcast' ? msgsPerSec * servers : strategy === 'pubsub' ? msgsPerSec * 1.02 : msgsPerSec;
    const overhead = strategy === 'broadcast' ? `${((servers - 1) * 100).toFixed(0)}% wasted` : strategy === 'direct' ? `${(servers * (servers - 1)).toLocaleString()} open sockets` : `~1ms Redis hop`;
    return { current, connections, msgsDelivered, overhead };
  }, [strategy, servers, msgsPerSec]);

  const fmt = (n) => n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n.toLocaleString();

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Interactive comparison</div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Message Routing Strategies</div>
      </div>

      <div className="p-6">
        {/* Strategy tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STRATEGIES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStrategy(s.key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition border ${
                strategy === s.key ? 'text-white border-transparent' : 'border-ink-200 dark:border-night-400 text-ink-600 dark:text-night-700 bg-transparent hover:bg-ink-50 dark:hover:bg-night-300'
              }`}
              style={strategy === s.key ? { background: s.color, borderColor: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <Slider label="Chat servers" value={servers} display={servers} min={2} max={1000} step={10} onChange={setServers} />
          <Slider label="Messages / sec" value={msgsPerSec} display={fmt(msgsPerSec)} min={10000} max={2000000} step={10000} onChange={setMsgsPerSec} />
        </div>

        {/* Visual routing diagram */}
        <AnimatePresence mode="wait">
          <motion.div key={strategy} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6">
            <RoutingDiagram strategy={strategy} servers={Math.min(servers, 8)} color={metrics.current.color} />
          </motion.div>
        </AnimatePresence>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MetricBox label="Total msg delivers/sec" value={fmt(metrics.msgsDelivered)} warn={strategy === 'broadcast'} color={metrics.current.color} />
          <MetricBox label="Overhead" value={metrics.overhead} warn={strategy !== 'pubsub'} color={metrics.current.color} />
          <MetricBox label="Connections" value={metrics.connections.toLocaleString()} warn={strategy === 'direct' && servers > 50} color={metrics.current.color} />
        </div>

        {/* Pros/Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg p-4" style={{ background: metrics.current.color + '08', border: `1px solid ${metrics.current.color}25` }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: metrics.current.color }}>Advantages</div>
            <ul className="space-y-1">
              {metrics.current.pros.map((p, i) => (
                <li key={i} className="text-sm text-ink-800 dark:text-night-800 flex gap-1.5">
                  <span style={{ color: metrics.current.color }}>✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg p-4 bg-rust-50 dark:bg-[#1F0E07] border border-rust-200 dark:border-[#3D2012]">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-rust-700 dark:text-[#E8855A]">Disadvantages</div>
            <ul className="space-y-1">
              {metrics.current.cons.map((c, i) => (
                <li key={i} className="text-sm text-ink-800 dark:text-night-800 flex gap-1.5">
                  <span className="text-rust-500">⚠</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutingDiagram({ strategy, servers, color }) {
  const srvCount = Math.max(2, Math.min(servers, 8));
  const srvArr = Array.from({ length: srvCount }, (_, i) => i);

  return (
    <div className="bg-cream-50 dark:bg-night-300 rounded-lg p-4 overflow-hidden">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {/* Sender */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 flex items-center justify-center text-xl">👤</div>
          <span className="text-[10px] text-ink-500 dark:text-night-700">Sender</span>
        </div>

        {strategy === 'pubsub' && (
          <>
            <Arrow color={color} label="1 publish" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-[#071A12] border-2 border-teal-500 flex items-center justify-center text-lg font-mono font-bold text-teal-700 dark:text-teal-400">R</div>
              <span className="text-[10px] text-ink-500 dark:text-night-700">Redis</span>
            </div>
            <Arrow color={color} label="1 deliver" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-[#0A1229] border-2 border-blue-500 flex items-center justify-center text-lg font-bold text-blue-700 dark:text-blue-400">S</div>
              <span className="text-[10px] text-ink-500 dark:text-night-700">Server B</span>
            </div>
          </>
        )}

        {strategy === 'broadcast' && (
          <>
            <Arrow color={color} label={`${srvCount} sends`} />
            <div className="flex flex-col gap-1">
              {srvArr.map((i) => (
                <motion.div
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-1"
                >
                  <div
                    className={`w-8 h-6 rounded text-[9px] font-bold flex items-center justify-center border ${i === 1 ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-[#0A1229]' : 'border-ink-300 dark:border-night-500 text-ink-500 dark:text-night-700 bg-white dark:bg-night-200'}`}
                  >
                    {i === 1 ? '✓' : '✗'}
                  </div>
                  <span className="text-[9px] text-ink-400 dark:text-night-600">Srv {i + 1}{i === 1 ? ' (target)' : ' (waste)'}</span>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {strategy === 'direct' && (
          <>
            <div className="text-xs text-ink-600 dark:text-night-700 mx-2">→</div>
            <div className="relative w-40 h-32">
              {srvArr.map((i) => {
                const angle = (i / srvCount) * 2 * Math.PI - Math.PI / 2;
                const x = 50 + 38 * Math.cos(angle);
                const y = 50 + 38 * Math.sin(angle);
                return (
                  <div
                    key={i}
                    className="absolute w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
                    style={{
                      left: `${x}%`, top: `${y}%`,
                      transform: 'translate(-50%,-50%)',
                      background: i === 0 ? color + '20' : '#F9FAFB',
                      borderColor: i === 0 ? color : '#D1D5DB',
                      color: i === 0 ? color : '#6B7280',
                    }}
                  >
                    {i === 0 ? 'B' : i}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Arrow({ color, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="text-[10px] font-medium" style={{ color }}>{label}</div>
      <div className="w-8 h-px" style={{ background: color }} />
      <div className="text-[8px]" style={{ color }}>▶</div>
    </div>
  );
}

function Slider({ label, value, display, min, max, step, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-600 dark:text-night-700 mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-blue-600 dark:text-blue-400">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-blue-600" />
    </div>
  );
}

function MetricBox({ label, value, warn, color }) {
  return (
    <div className={`rounded-lg p-3 text-center border ${warn ? 'bg-rust-50 dark:bg-[#1F0E07] border-rust-200 dark:border-[#3D2012]' : 'bg-cream-50 dark:bg-night-300 border-ink-200 dark:border-night-400'}`}>
      <div className="text-xs text-ink-500 dark:text-night-700 mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono tabular-nums ${warn ? 'text-rust-600 dark:text-rust-400' : ''}`} style={warn ? {} : { color }}>
        {value}
      </div>
    </div>
  );
}
