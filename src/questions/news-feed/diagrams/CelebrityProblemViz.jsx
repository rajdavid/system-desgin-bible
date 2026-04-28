import { useState, useEffect, useRef } from 'react';

/**
 * Visualizes the celebrity write-storm problem and how a hybrid threshold solves it.
 * - Slider lets the user pick a follower count
 * - Below threshold: animated push fan-out (fast)
 * - Above threshold: animated celebrity overload turns red, then switches to pull
 */
export default function CelebrityProblemViz() {
  const [followers, setFollowers] = useState(500);
  const [strategy, setStrategy] = useState('auto'); // 'auto' | 'push' | 'pull'
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  const THRESHOLD = 10000;
  const effectiveStrategy = strategy === 'auto'
    ? (followers > THRESHOLD ? 'pull' : 'push')
    : strategy;
  const isOverloaded = effectiveStrategy === 'push' && followers > THRESHOLD;

  // Auto-tick for the write storm visualization
  useEffect(() => {
    timerRef.current = setTimeout(() => setTick((t) => (t + 1) % 60), 100);
    return () => clearTimeout(timerRef.current);
  }, [tick]);

  // Format helpers
  const fmt = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;
  const writeCount = effectiveStrategy === 'push' ? followers : 0;
  const writeMs = effectiveStrategy === 'push' ? Math.ceil(followers / 100) : 0; // 100 writes/ms baseline
  const readMs = effectiveStrategy === 'pull' ? Math.ceil(followers * 0.5 / 30) : 1; // very rough

  // Pulsating red intensity when overloaded
  const stormIntensity = isOverloaded ? Math.min(followers / 50_000_000, 1) : 0;

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Interactive — drag the slider
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          The celebrity problem at scale
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left: Visualization */}
        <div className="bg-cream-100 dark:bg-night-300 rounded-xl p-5">
          <svg viewBox="0 0 500 320" className="w-full h-auto">
            {/* Author */}
            <circle
              cx="80"
              cy="160"
              r={isOverloaded ? 28 + Math.sin(tick * 0.4) * 3 : 26}
              fill={isOverloaded ? '#e17055' : '#a29bfe'}
              opacity="0.95"
            />
            <text x="80" y="166" textAnchor="middle" className="fill-white" fontSize="14" fontWeight="700">{fmt(followers)}</text>
            <text x="80" y="200" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="11">followers</text>

            {/* Connection lines + follower dots */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * Math.PI * 2;
              const dist = 110 + (i % 3) * 12;
              const cx = 280 + Math.cos(angle) * dist;
              const cy = 160 + Math.sin(angle) * dist * 0.6;
              const isPush = effectiveStrategy === 'push';
              const writeWaveActive = isPush && (tick % 30) > i / 2 && (tick % 30) < i / 2 + 12;
              const isWritten = isPush && (tick % 30) > i / 2;

              return (
                <g key={i}>
                  {writeWaveActive && (
                    <line
                      x1="108"
                      y1="160"
                      x2={cx}
                      y2={cy}
                      stroke={isOverloaded ? '#e17055' : '#74b9ff'}
                      strokeWidth="0.6"
                      opacity={writeWaveActive ? 0.5 : 0}
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="3"
                    fill={isWritten ? (isOverloaded ? '#e17055' : '#74b9ff') : 'currentColor'}
                    className={isWritten ? '' : 'fill-ink-300 dark:fill-night-500'}
                    opacity={isWritten ? 0.95 : 0.45}
                  />
                </g>
              );
            })}

            {/* Storm warning */}
            {isOverloaded && (
              <g opacity={0.7 + Math.sin(tick * 0.3) * 0.3}>
                <text x="250" y="40" textAnchor="middle" fill="#e17055" fontSize="13" fontWeight="700">
                  ⚠ WRITE STORM
                </text>
                <text x="250" y="56" textAnchor="middle" fill="#e17055" fontSize="10" fontFamily="monospace">
                  {fmt(followers)} writes from one post
                </text>
              </g>
            )}

            {/* Pull-mode label */}
            {effectiveStrategy === 'pull' && (
              <g>
                <text x="320" y="40" textAnchor="middle" fill="#fdcb6e" fontSize="12" fontWeight="700">
                  PULL ON READ
                </text>
                <text x="320" y="56" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">
                  Skip writes — fetch when followers open
                </text>
              </g>
            )}

            {/* Push-mode normal label */}
            {effectiveStrategy === 'push' && !isOverloaded && (
              <g>
                <text x="320" y="40" textAnchor="middle" fill="#74b9ff" fontSize="12" fontWeight="700">
                  PUSH ON WRITE
                </text>
                <text x="320" y="56" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">
                  Fan out → followers' caches
                </text>
              </g>
            )}
          </svg>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white dark:bg-night-200 rounded-lg p-3">
              <div className="text-[9px] uppercase text-ink-400 dark:text-night-600 font-mono mb-1">Writes / post</div>
              <div className="font-mono text-lg font-semibold tabular-nums" style={{ color: isOverloaded ? '#e17055' : '#74b9ff' }}>
                {fmt(writeCount)}
              </div>
            </div>
            <div className="bg-white dark:bg-night-200 rounded-lg p-3">
              <div className="text-[9px] uppercase text-ink-400 dark:text-night-600 font-mono mb-1">Write latency</div>
              <div className="font-mono text-lg font-semibold tabular-nums text-ink-900 dark:text-night-900">
                {writeMs > 0 ? `${writeMs}ms` : '—'}
              </div>
            </div>
            <div className="bg-white dark:bg-night-200 rounded-lg p-3">
              <div className="text-[9px] uppercase text-ink-400 dark:text-night-600 font-mono mb-1">Read latency</div>
              <div className="font-mono text-lg font-semibold tabular-nums text-ink-900 dark:text-night-900">
                {readMs}ms
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls + explanation */}
        <div>
          <div className="mb-5">
            <label className="block text-xs uppercase tracking-wider font-mono text-ink-500 dark:text-night-600 mb-2">
              Followers: <span className="font-semibold text-ink-900 dark:text-night-900">{fmt(followers)}</span>
            </label>
            <input
              type="range"
              min="100"
              max="50000000"
              step="100"
              value={followers}
              onChange={(e) => setFollowers(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-ink-400 dark:text-night-600 mt-1 font-mono">
              <span>100</span>
              <span>10K (threshold)</span>
              <span>50M (mega-celebrity)</span>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs uppercase tracking-wider font-mono text-ink-500 dark:text-night-600 mb-2">
              Strategy
            </label>
            <div className="flex gap-2">
              {[
                { key: 'auto', label: 'Auto (hybrid)' },
                { key: 'push', label: 'Force push' },
                { key: 'pull', label: 'Force pull' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStrategy(opt.key)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg font-medium border ${
                    strategy === opt.key
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-white dark:bg-night-300 border-ink-200 dark:border-night-500 text-ink-700 dark:text-night-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-ink-700 dark:text-night-700 leading-relaxed">
            {followers <= THRESHOLD && (
              <>
                <strong className="text-blue-600 dark:text-blue-400">Push works fine here.</strong> {fmt(followers)} writes is comfortably handled by the worker pool — completes in &lt;100ms total. Reads stay at one Redis call.
              </>
            )}
            {followers > THRESHOLD && strategy === 'auto' && (
              <>
                <strong className="text-amber-600 dark:text-amber-400">Auto-switched to pull.</strong> The hybrid distributor sees this account is over the {fmt(THRESHOLD)} threshold, skips the write storm, and lets followers pull on demand at read time.
              </>
            )}
            {followers > THRESHOLD && strategy === 'push' && (
              <>
                <strong className="text-rust-600 dark:text-rust-400">Forced push at celebrity scale = write storm.</strong> {fmt(followers)} writes saturate the queue, build up Kafka lag, and clog the Redis cluster for minutes after each post.
              </>
            )}
            {strategy === 'pull' && (
              <>
                <strong className="text-amber-600 dark:text-amber-400">Forced pull is wasteful for small accounts.</strong> If a regular user with {fmt(followers)} followers runs pull-only, every feed open requires querying their posts table — adding read load that push would have prevented.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
