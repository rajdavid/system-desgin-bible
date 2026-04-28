import { useState, useEffect, useRef } from 'react';

/**
 * Side-by-side comparison: Push vs Pull vs Hybrid fan-out.
 * Live counters for write count, read count, and feed-open latency.
 * One post by a user with N followers — animation cycles through the three strategies.
 */
const STRATEGIES = [
  {
    key: 'push',
    label: 'Fan-out on write (push)',
    color: '#74b9ff',
    bg: 'rgba(116,185,255,0.08)',
    border: 'rgba(116,185,255,0.45)',
    summary: 'On every post, write into all N followers\' caches.',
    pros: ['Reads are 1 Redis call', 'Sub-millisecond feed open'],
    cons: ['Write storm for celebrities (N writes per post)', 'Wasted writes for inactive users'],
    write: 'N',
    read: '1',
    bestFor: 'Regular users (< 10K followers)',
  },
  {
    key: 'pull',
    label: 'Fan-out on read (pull)',
    color: '#fdcb6e',
    bg: 'rgba(253,203,110,0.08)',
    border: 'rgba(253,203,110,0.45)',
    summary: 'On every feed open, query each followed user\'s recent posts.',
    pros: ['No write amplification', 'Always fresh, no cache staleness'],
    cons: ['~F queries per feed open', 'Blocks user with a spinner'],
    write: '1',
    read: 'F',
    bestFor: 'Inactive users / cold accounts',
  },
  {
    key: 'hybrid',
    label: 'Hybrid (real systems)',
    color: '#00b894',
    bg: 'rgba(0,184,148,0.08)',
    border: 'rgba(0,184,148,0.45)',
    summary: 'Push for regulars, pull for celebrities. Merge at read time.',
    pros: ['Bounded write cost', 'Fast reads for everyone'],
    cons: ['Two code paths to maintain', 'Threshold tuning'],
    write: '~10K (capped)',
    read: '1 + ~30 celebs',
    bestFor: 'Production at scale',
  },
];

export default function FanoutComparisonViz() {
  const [active, setActive] = useState('push');
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => {
      setTick((t) => (t + 1) % 30);
      if ((tick + 1) % 30 === 0) {
        const idx = STRATEGIES.findIndex((s) => s.key === active);
        setActive(STRATEGIES[(idx + 1) % STRATEGIES.length].key);
      }
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [tick, playing, active]);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Strategy comparison
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Fan-out: push vs pull vs hybrid
          </div>
        </div>
        <div className="flex gap-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.key}
              onClick={() => { setActive(s.key); setPlaying(false); }}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-medium border transition-all ${
                active === s.key ? 'text-white' : 'text-ink-700 dark:text-night-700 bg-white dark:bg-night-300 border-ink-200 dark:border-night-500'
              }`}
              style={active === s.key ? { background: s.color, borderColor: s.color } : {}}
            >
              {s.label.split(' ')[0].replace('(push)', '').replace('(pull)', '')}
              {s.key === 'push' && ' Push'}
              {s.key === 'pull' && ' Pull'}
              {s.key === 'hybrid' && ' Hybrid'}
            </button>
          ))}
          <button
            onClick={() => setPlaying(!playing)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium"
          >
            {playing ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {STRATEGIES.map((s) => (
          <StrategyCard
            key={s.key}
            strategy={s}
            isActive={active === s.key}
            tick={tick}
          />
        ))}
      </div>

      <div className="px-5 pb-5">
        <div
          className="rounded-lg p-4 text-sm leading-relaxed border"
          style={{
            background: STRATEGIES.find((s) => s.key === active).bg,
            borderColor: STRATEGIES.find((s) => s.key === active).border,
          }}
        >
          <div className="font-semibold text-ink-900 dark:text-night-900 mb-1.5">
            {STRATEGIES.find((s) => s.key === active).label}
          </div>
          <div className="text-ink-700 dark:text-night-700">
            {STRATEGIES.find((s) => s.key === active).summary}
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyCard({ strategy, isActive, tick }) {
  const { key, label, color, write, read, bestFor, pros, cons } = strategy;
  const FOLLOWERS = 12;
  const writeStep = key === 'push' ? Math.min(tick, FOLLOWERS) : key === 'hybrid' ? Math.min(tick, FOLLOWERS - 2) : 0;
  const readStep = key === 'pull' ? Math.min(tick - 4, FOLLOWERS) : key === 'hybrid' ? Math.min(Math.max(tick - 6, 0), 2) : 0;

  return (
    <div
      className="rounded-lg border p-4 flex flex-col"
      style={{
        borderColor: isActive ? color : undefined,
        boxShadow: isActive ? `0 0 0 1px ${color}40, 0 4px 16px ${color}20` : undefined,
      }}
    >
      <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color }}>
        {key}
      </div>
      <div className="text-sm font-semibold text-ink-900 dark:text-night-900 mb-3">
        {label}
      </div>

      {/* Mini animated diagram */}
      <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-3 mb-3">
        <svg viewBox="0 0 240 120" className="w-full h-auto">
          {/* Author at left */}
          <circle cx="30" cy="60" r="14" fill={color} opacity={isActive ? 1 : 0.4} />
          <text x="30" y="64" textAnchor="middle" className="fill-white" fontSize="10" fontWeight="600">A</text>
          <text x="30" y="92" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9">poster</text>

          {/* Cache (only in push and hybrid) */}
          {(key === 'push' || key === 'hybrid') && (
            <>
              <rect x="100" y="48" width="40" height="24" rx="4" className="fill-white dark:fill-night-200" stroke={color} strokeWidth="1.5" />
              <text x="120" y="64" textAnchor="middle" className="fill-ink-700 dark:fill-night-700" fontSize="9" fontWeight="600">cache</text>
              <line x1="44" y1="60" x2="100" y2="60" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={writeStep > 0 ? 1 : 0.2} />
            </>
          )}

          {/* Followers at right (12 dots) */}
          {Array.from({ length: FOLLOWERS }).map((_, i) => {
            const cx = 175 + (i % 4) * 18;
            const cy = 25 + Math.floor(i / 4) * 28;
            const isWritten = key === 'push' ? i < writeStep : key === 'hybrid' ? i < writeStep && i < FOLLOWERS - 2 : false;
            const isCelebrity = key === 'hybrid' && i >= FOLLOWERS - 2;
            const isPulled = key === 'pull' ? i < readStep : isCelebrity ? readStep > i - (FOLLOWERS - 2) : false;
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill={isWritten || isPulled ? color : 'transparent'}
                  className={isWritten || isPulled ? '' : 'fill-ink-200 dark:fill-night-400'}
                  stroke={isCelebrity ? '#e17055' : color}
                  strokeWidth={isCelebrity ? '1.5' : '0.8'}
                  opacity={isActive ? 1 : 0.45}
                />
              </g>
            );
          })}

          {/* Bottom label */}
          <text x="195" y="105" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9">
            {key === 'push' && `${writeStep}/${FOLLOWERS} written`}
            {key === 'pull' && `${readStep} pulled at read`}
            {key === 'hybrid' && `${writeStep} pushed · ${readStep > 0 ? readStep : 0} pulled`}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-cream-100 dark:bg-night-300 rounded p-2">
          <div className="text-[10px] uppercase text-ink-400 dark:text-night-600 font-mono mb-0.5">Writes/post</div>
          <div className="text-ink-900 dark:text-night-900 font-mono font-semibold tabular-nums">{write}</div>
        </div>
        <div className="bg-cream-100 dark:bg-night-300 rounded p-2">
          <div className="text-[10px] uppercase text-ink-400 dark:text-night-600 font-mono mb-0.5">Reads/open</div>
          <div className="text-ink-900 dark:text-night-900 font-mono font-semibold tabular-nums">{read}</div>
        </div>
      </div>

      <div className="text-[11px] text-ink-700 dark:text-night-700 mb-2">
        <div className="text-teal-600 dark:text-teal-400 font-semibold mb-1">Pros</div>
        <ul className="ml-4 list-disc space-y-0.5">{pros.map((p) => <li key={p}>{p}</li>)}</ul>
      </div>
      <div className="text-[11px] text-ink-700 dark:text-night-700 mb-2">
        <div className="text-rust-600 dark:text-rust-400 font-semibold mb-1">Cons</div>
        <ul className="ml-4 list-disc space-y-0.5">{cons.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      <div className="mt-auto text-[10px] text-ink-500 dark:text-night-600 pt-2 border-t border-ink-100 dark:border-night-400/40 font-mono uppercase tracking-wider">
        Best for: {bestFor}
      </div>
    </div>
  );
}
