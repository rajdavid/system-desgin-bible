import { useState, useEffect, useRef } from 'react';

/**
 * Animated 3-stage ML ranking funnel: Candidate Generation → Light Ranker → Heavy Ranker → Top K.
 * Particles flow through narrowing stages with counters and per-stage details.
 */
const STAGES = [
  {
    key: 'cand',
    label: 'Candidate Generation',
    sub: 'Two-tower embedding + ANN',
    inCount: '~10M posts',
    outCount: '~1000',
    latency: '~5ms',
    color: '#74b9ff',
    detail: 'User & item towers produce embeddings. ANN search (FAISS / ScaNN) retrieves top-1000 by cosine similarity. Cheap to score: just a vector lookup. Optimizes for recall.',
  },
  {
    key: 'light',
    label: 'Light Ranker',
    sub: 'Gradient-boosted trees',
    inCount: '~1000',
    outCount: '~100',
    latency: '~10ms',
    color: '#fdcb6e',
    detail: 'GBDT (XGBoost / LightGBM) scores each of the 1000 with ~50 cheap features: poster affinity, recency, content type, basic engagement signals. Drops 90% before the expensive model touches them.',
  },
  {
    key: 'heavy',
    label: 'Heavy Ranker',
    sub: 'Deep neural network',
    inCount: '~100',
    outCount: '~10',
    latency: '~30ms',
    color: '#a29bfe',
    detail: 'Wide & deep DNN (or transformer) scores top-100 with ~500 features including cross-features, sequence features, full-text embeddings. Outputs P(like), P(comment), P(share), P(hide). Composite = w1·P(like) + w2·P(comment) + w3·P(share) − w4·P(hide).',
  },
  {
    key: 'rerank',
    label: 'Re-rank & Diversify',
    sub: 'Business rules',
    inCount: '~10',
    outCount: '~10 (ordered)',
    latency: '~2ms',
    color: '#00b894',
    detail: 'Diversity (no 5 posts from same friend), creator fairness, freshness boost, ad insertion at fixed slots, anti-clickbait penalties. Final order shipped to client.',
  },
];

export default function RankingFunnelViz() {
  const [active, setActive] = useState('cand');
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => setTick((t) => t + 1), 80);
    return () => clearTimeout(timerRef.current);
  }, [tick, playing]);

  const activeStage = STAGES.find((s) => s.key === active);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            ML pipeline
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Ranking funnel — millions to ten in 47ms
          </div>
        </div>
        <button
          onClick={() => setPlaying(!playing)}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      <div className="p-5">
        {/* Funnel diagram */}
        <div className="bg-cream-100 dark:bg-night-300 rounded-xl p-5 mb-5 overflow-x-auto">
          <svg viewBox="0 0 800 280" className="w-full h-auto" style={{ minWidth: 600 }}>
            {/* Background trapezoid showing the funnel narrowing */}
            <path
              d="M 30 50 L 200 70 L 380 100 L 560 130 L 770 150 L 770 200 L 560 180 L 380 175 L 200 170 L 30 220 Z"
              fill="url(#funnelGrad)"
              opacity="0.15"
            />
            <defs>
              <linearGradient id="funnelGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#74b9ff" />
                <stop offset="33%" stopColor="#fdcb6e" />
                <stop offset="66%" stopColor="#a29bfe" />
                <stop offset="100%" stopColor="#00b894" />
              </linearGradient>
            </defs>

            {/* Stage groups */}
            {STAGES.map((s, i) => {
              const x = 30 + (i * 180);
              const isActiveStage = active === s.key;
              return (
                <g
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x}
                    y="100"
                    width="160"
                    height="80"
                    rx="8"
                    fill={isActiveStage ? s.color : 'transparent'}
                    stroke={s.color}
                    strokeWidth={isActiveStage ? 2 : 1.5}
                    opacity={isActiveStage ? 0.9 : 0.6}
                  />
                  <text x={x + 80} y="125" textAnchor="middle" className={isActiveStage ? 'fill-white' : 'fill-ink-900 dark:fill-night-900'} fontSize="12" fontWeight="700">
                    {s.label}
                  </text>
                  <text x={x + 80} y="142" textAnchor="middle" className={isActiveStage ? 'fill-white' : 'fill-ink-500 dark:fill-night-600'} fontSize="10">
                    {s.sub}
                  </text>
                  <text x={x + 80} y="162" textAnchor="middle" fill={isActiveStage ? '#fff' : s.color} fontSize="11" fontWeight="600" fontFamily="monospace">
                    {s.inCount} → {s.outCount}
                  </text>
                  <text x={x + 80} y="200" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">
                    {s.latency}
                  </text>
                </g>
              );
            })}

            {/* Animated particles flowing through */}
            {Array.from({ length: 18 }).map((_, i) => {
              const t = ((tick + i * 5) % 80) / 80;
              const x = 20 + t * 760;
              // Particle gets fewer/larger as it moves through stages
              let opacity = 0;
              if (t < 0.22) opacity = 1;
              else if (t < 0.5) opacity = i % 2 === 0 ? 0.9 : 0;
              else if (t < 0.8) opacity = i % 4 === 0 ? 0.9 : 0;
              else opacity = i % 8 === 0 ? 0.9 : 0;
              const colorStops = ['#74b9ff', '#fdcb6e', '#a29bfe', '#00b894'];
              const colorIdx = Math.min(Math.floor(t * 4), 3);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={140 + Math.sin((tick + i * 7) * 0.1) * 8}
                  r={1.5 + t * 2}
                  fill={colorStops[colorIdx]}
                  opacity={opacity}
                />
              );
            })}

            {/* Labels above & below */}
            <text x="30" y="40" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace" letterSpacing="1.5px">INPUT</text>
            <text x="770" y="40" textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace" letterSpacing="1.5px">OUTPUT</text>
            <text x="30" y="265" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">~10M posts</text>
            <text x="770" y="265" textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">~10 ranked</text>
          </svg>
        </div>

        {/* Active stage detail */}
        <div
          className="rounded-lg p-5 border"
          style={{
            background: `${activeStage.color}15`,
            borderColor: `${activeStage.color}55`,
          }}
        >
          <div className="flex items-baseline gap-3 mb-2 flex-wrap">
            <div className="text-sm font-semibold text-ink-900 dark:text-night-900">{activeStage.label}</div>
            <div className="text-xs text-ink-500 dark:text-night-600 font-mono">{activeStage.sub}</div>
            <div className="text-xs font-mono ml-auto" style={{ color: activeStage.color }}>
              {activeStage.inCount} → {activeStage.outCount} · {activeStage.latency}
            </div>
          </div>
          <div className="text-sm text-ink-700 dark:text-night-700 leading-relaxed">
            {activeStage.detail}
          </div>
        </div>

        {/* Total latency strip */}
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-500 dark:text-night-600 font-mono">
          <span>Total budget:</span>
          <div className="flex-1 h-1.5 bg-ink-100 dark:bg-night-400 rounded-full overflow-hidden flex">
            <div className="h-full" style={{ width: '10%', background: '#74b9ff' }} />
            <div className="h-full" style={{ width: '21%', background: '#fdcb6e' }} />
            <div className="h-full" style={{ width: '64%', background: '#a29bfe' }} />
            <div className="h-full" style={{ width: '5%', background: '#00b894' }} />
          </div>
          <span className="text-ink-900 dark:text-night-900 font-semibold">~47ms</span>
        </div>
      </div>
    </div>
  );
}
