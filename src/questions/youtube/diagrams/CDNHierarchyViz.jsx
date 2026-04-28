import { useState, useEffect, useRef } from 'react';

/**
 * Animated 3-tier CDN cache: edge → regional → origin.
 * Live hit-rate counters per tier. Click a popularity scenario to see how
 * the cache hierarchy absorbs requests.
 */
const SCENARIOS = [
  {
    key: 'hot',
    label: 'Viral hot video',
    desc: 'Popular video, all tiers warmed up',
    p_edge: 0.99, p_regional: 0.985, p_origin: 1.0, // conditional hit rate at each level given prior miss
    color: '#00b894',
  },
  {
    key: 'warm',
    label: 'Mid-popularity',
    desc: 'Edge sometimes misses, regional usually hits',
    p_edge: 0.55, p_regional: 0.85, p_origin: 1.0,
    color: '#74b9ff',
  },
  {
    key: 'cold',
    label: 'Long-tail / cold',
    desc: 'New segment, both edges miss, origin pull',
    p_edge: 0.05, p_regional: 0.10, p_origin: 1.0,
    color: '#a29bfe',
  },
];

export default function CDNHierarchyViz() {
  const [scenario, setScenario] = useState('warm');
  const [tick, setTick] = useState(0);
  const [counters, setCounters] = useState({ edge: 0, regional: 0, origin: 0, total: 0 });
  const [requests, setRequests] = useState([]); // recent request results
  const [running, setRunning] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setTimeout(() => {
      const s = SCENARIOS.find((x) => x.key === scenario);
      // Sample one new request
      const r1 = Math.random() < s.p_edge ? 'edge' : Math.random() < s.p_regional ? 'regional' : 'origin';
      setCounters((c) => ({
        edge: c.edge + (r1 === 'edge' ? 1 : 0),
        regional: c.regional + (r1 === 'regional' ? 1 : 0),
        origin: c.origin + (r1 === 'origin' ? 1 : 0),
        total: c.total + 1,
      }));
      setRequests((rs) => [{ tier: r1, t: tick }, ...rs.slice(0, 9)]);
      setTick((t) => t + 1);
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [tick, running, scenario]);

  const reset = () => {
    setCounters({ edge: 0, regional: 0, origin: 0, total: 0 });
    setRequests([]);
    setTick(0);
  };

  const total = Math.max(counters.total, 1);
  const pctEdge = (counters.edge / total * 100).toFixed(1);
  const pctRegional = (counters.regional / total * 100).toFixed(1);
  const pctOrigin = (counters.origin / total * 100).toFixed(1);

  const currentTier = requests[0]?.tier;

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Cache cascade simulator
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            CDN hit hierarchy — edge → regional → origin
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => { setScenario(s.key); reset(); }}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-medium border transition-all ${
                scenario === s.key ? 'text-white' : 'text-ink-700 dark:text-night-700 bg-white dark:bg-night-300 border-ink-200 dark:border-night-500'
              }`}
              style={scenario === s.key ? { background: s.color, borderColor: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setRunning(!running)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium"
          >
            {running ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Cascade diagram */}
        <div className="bg-cream-100 dark:bg-night-300 rounded-xl p-5 mb-5 overflow-x-auto">
          <svg viewBox="0 0 760 300" className="w-full h-auto" style={{ minWidth: 600 }}>
            {/* Viewer */}
            <g>
              <circle cx="50" cy="150" r="22" fill="#a29bfe" />
              <text x="50" y="156" textAnchor="middle" className="fill-white" fontSize="11" fontWeight="600">user</text>
              <text x="50" y="190" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">~5ms p50</text>
            </g>

            {/* Edge */}
            <Tier
              x={140}
              y={100}
              label="Edge cache"
              detail="ISP-local · 3,100+ PoPs"
              latency="~5ms"
              cost="cheapest"
              color="#00b894"
              hitPct={pctEdge}
              isActive={currentTier === 'edge'}
              isCurrentMiss={currentTier === 'regional' || currentTier === 'origin'}
            />

            {/* Arrow edge → regional */}
            <line x1="290" y1="150" x2="345" y2="150" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#cdn-ar)" opacity=".5" />
            <text x="317" y="143" textAnchor="middle" fill="#e17055" fontSize="9" fontFamily="monospace" opacity=".7">miss</text>

            {/* Regional */}
            <Tier
              x={350}
              y={100}
              label="Regional PoP"
              detail="metro cache · ~30 sites"
              latency="~20ms"
              cost="medium"
              color="#74b9ff"
              hitPct={pctRegional}
              isActive={currentTier === 'regional'}
              isCurrentMiss={currentTier === 'origin'}
            />

            {/* Arrow regional → origin */}
            <line x1="500" y1="150" x2="555" y2="150" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#cdn-ar)" opacity=".5" />
            <text x="527" y="143" textAnchor="middle" fill="#e17055" fontSize="9" fontFamily="monospace" opacity=".7">miss</text>

            {/* Origin */}
            <Tier
              x={560}
              y={100}
              label="Origin (GCS)"
              detail="single source of truth"
              latency="~100ms"
              cost="$$$$ egress"
              color="#fdcb6e"
              hitPct={pctOrigin}
              isActive={currentTier === 'origin'}
            />

            <defs>
              <marker id="cdn-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            {/* User → edge arrow */}
            <line x1="72" y1="150" x2="135" y2="150" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#cdn-ar)" opacity=".7" />

            {/* Animated request packet */}
            {currentTier && (
              <circle
                r="5"
                fill="#a29bfe"
                opacity="0.9"
              >
                <animate
                  attributeName="cx"
                  from="72"
                  to={currentTier === 'edge' ? '215' : currentTier === 'regional' ? '425' : '635'}
                  dur="0.5s"
                />
                <animate attributeName="cy" from="150" to="150" dur="0.5s" />
              </circle>
            )}

            <text x="380" y="280" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">
              {counters.total} requests · {pctEdge}% served from edge
            </text>
          </svg>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Counter label="Edge hits"        count={counters.edge}     pct={pctEdge}     color="#00b894" />
          <Counter label="Regional hits"    count={counters.regional} pct={pctRegional} color="#74b9ff" />
          <Counter label="Origin pulls"     count={counters.origin}   pct={pctOrigin}   color="#fdcb6e" />
        </div>

        <div className="mt-4 bg-cream-100 dark:bg-night-300 rounded-lg p-4 text-sm text-ink-700 dark:text-night-700">
          <strong>Why this matters financially:</strong> origin egress is ~10–100× more expensive per byte than edge serving. A single percentage-point shift in edge hit rate translates to millions of dollars annually at YouTube's scale. The 3-tier hierarchy isn't just about latency — it's the financial backbone of the platform. Cold-tier videos get rebalanced down a storage tier (Standard → IA → Glacier) to keep storage cost in check too.
        </div>
      </div>
    </div>
  );
}

function Tier({ x, y, label, detail, latency, cost, color, hitPct, isActive, isCurrentMiss }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="150"
        height="100"
        rx="8"
        className="fill-white dark:fill-night-200"
        stroke={isActive ? color : 'currentColor'}
        strokeWidth={isActive ? 2.5 : 1}
        opacity={isCurrentMiss ? 0.6 : 1}
      />
      <line x1={x} y1={y + 4} x2={x} y2={y + 96} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <text x={x + 75} y={y + 22} textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="700">{label}</text>
      <text x={x + 75} y={y + 38} textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">{detail}</text>
      <text x={x + 75} y={y + 60} textAnchor="middle" fill={color} fontSize="11" fontWeight="600" fontFamily="monospace">{latency}</text>
      <text x={x + 75} y={y + 76} textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">{cost}</text>
      <text x={x + 75} y={y + 92} textAnchor="middle" fill={color} fontSize="11" fontFamily="monospace" fontWeight="600">{hitPct}%</text>
    </g>
  );
}

function Counter({ label, count, pct, color }) {
  return (
    <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-4">
      <div className="text-[10px] uppercase font-mono text-ink-400 dark:text-night-600 mb-1" style={{ color }}>{label}</div>
      <div className="font-mono text-2xl font-semibold tabular-nums text-ink-900 dark:text-night-900">{count}</div>
      <div className="text-[11px] text-ink-500 dark:text-night-600 mt-1 tabular-nums">{pct}% of total</div>
      <div className="mt-2 h-1.5 bg-ink-100 dark:bg-night-400 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-200" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
