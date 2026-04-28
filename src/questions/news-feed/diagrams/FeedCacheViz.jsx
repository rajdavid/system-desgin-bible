import { useState, useEffect, useRef } from 'react';

/**
 * Animates ZADD then ZREVRANGE against a per-user feed Redis sorted set.
 * Shows posts being inserted, score-ordered, then read out in one call.
 */
const SAMPLE_POSTS = [
  { id: 'p7', author: '@alice', score: 1714, text: 'Just shipped the new ranker' },
  { id: 'p3', author: '@bob',   score: 1689, text: 'thread on distributed systems...' },
  { id: 'p9', author: '@carol', score: 1655, text: 'Photo: spring trail run' },
  { id: 'p1', author: '@dave',  score: 1620, text: 'Ranking debate continues' },
  { id: 'p5', author: '@eve',   score: 1602, text: 'New blog post on ANN' },
  { id: 'p2', author: '@alice', score: 1577, text: 'Reply: yeah agreed' },
  { id: 'p4', author: '@bob',   score: 1540, text: 'Coffee #☕' },
];

export default function FeedCacheViz() {
  const [phase, setPhase] = useState(0); // 0: idle, 1: ZADD writes, 2: ZREVRANGE read, 3: shown
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (phase < 4) {
      timerRef.current = setTimeout(() => setPhase((p) => p + 1), 1100);
    } else {
      timerRef.current = setTimeout(() => setPhase(0), 2000);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, playing]);

  const visibleCount = phase === 0 ? 0 : phase === 1 ? 4 : SAMPLE_POSTS.length;

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Storage detail
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Feed cache — Redis sorted set per user
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setPhase(0); setPlaying(true); }}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-ink-100 dark:bg-night-400 text-ink-600 dark:text-night-700"
          >
            ↻ Replay
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium"
          >
            {playing ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5">
        {/* Left: Operation log */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500 dark:text-night-600 mb-2">
            Operation log
          </div>
          <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-4 font-mono text-[12px] leading-relaxed">
            <div className={`transition-all ${phase >= 1 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="text-purple-500"># Author Alice posts → distributor writes to all followers' caches</div>
              <div className="text-ink-700 dark:text-night-700">
                ZADD <span className="text-blue-500">feed:user_42</span> <span className="text-amber-500">1714</span> "p7"
              </div>
              <div className={`text-ink-700 dark:text-night-700 transition-all ${phase >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                ZADD feed:user_42 <span className="text-amber-500">1689</span> "p3"
              </div>
              <div className={`text-ink-700 dark:text-night-700 transition-all ${phase >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                ZADD feed:user_42 <span className="text-amber-500">1655</span> "p9"
              </div>
              <div className={`text-ink-700 dark:text-night-700 transition-all ${phase >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                ZADD feed:user_42 <span className="text-amber-500">1620</span> "p1"
              </div>
              <div className={`text-ink-500 dark:text-night-600 transition-all ${phase >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                ZADD feed:user_42 <span className="text-amber-500">1602</span> "p5" <span className="text-ink-400">{'/* … */'}</span>
              </div>
              <div className={`text-ink-500 italic mt-1 transition-all ${phase >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                # bound: <span className="text-rust-500">ZREMRANGEBYRANK feed:user_42 0 -1001</span> → keep newest 1000
              </div>
            </div>

            <div className={`mt-4 transition-all ${phase >= 3 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="text-purple-500"># User opens app — single Redis call</div>
              <div className="text-ink-900 dark:text-night-900 font-semibold">
                ZREVRANGE <span className="text-blue-500">feed:user_42</span> 0 19 WITHSCORES
              </div>
              <div className="text-ink-500 dark:text-night-600 mt-1 text-[11px]">
                → top 20 postIds in score order, latency &lt; 1ms
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Per-user size" value="~3.2KB" sub="1000 entries × ~32B" />
            <Stat label="Total (500M users)" value="~1.6TB" sub="fits in cluster" />
            <Stat label="Read latency" value="<1ms" sub="single ZREVRANGE" />
          </div>
        </div>

        {/* Right: Sorted set state */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500 dark:text-night-600 mb-2 flex items-center justify-between">
            <span>feed:user_42 (sorted by score, descending)</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] ${phase >= 3 ? 'bg-teal-500/20 text-teal-600 dark:text-teal-300' : 'bg-blue-500/20 text-blue-600 dark:text-blue-300'}`}>
              {phase === 0 && 'idle'}
              {phase === 1 && 'WRITING'}
              {phase === 2 && 'WRITTEN'}
              {phase === 3 && 'READING'}
              {phase >= 4 && 'DELIVERED'}
            </span>
          </div>
          <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-3 max-h-[420px] overflow-y-auto">
            <div className="space-y-1.5">
              {SAMPLE_POSTS.map((post, i) => {
                const isVisible = i < visibleCount;
                const isReadOut = phase >= 3 && i < 4;
                return (
                  <div
                    key={post.id}
                    className={`bg-white dark:bg-night-200 rounded p-2.5 border transition-all flex items-center gap-3 ${
                      isReadOut
                        ? 'border-teal-400 dark:border-teal-500 ring-2 ring-teal-400/20'
                        : 'border-ink-200/50 dark:border-night-400/50'
                    }`}
                    style={{
                      opacity: isVisible ? 1 : 0.2,
                      transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
                      transition: `all 0.3s ease ${i * 0.05}s`,
                    }}
                  >
                    <div className="text-[10px] font-mono text-ink-400 dark:text-night-600 w-6 text-right tabular-nums">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[11px] text-purple-600 dark:text-purple-300 font-semibold">{post.id}</span>
                        <span className="font-mono text-[10px] text-ink-500 dark:text-night-600">{post.author}</span>
                        <span className="font-mono text-[10px] text-amber-500 dark:text-amber-400 ml-auto tabular-nums">
                          score: {post.score}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-700 dark:text-night-700 truncate mt-0.5">{post.text}</div>
                    </div>
                    {isReadOut && (
                      <div className="text-teal-500 text-sm">→</div>
                    )}
                  </div>
                );
              })}
            </div>

            {phase === 0 && (
              <div className="text-center py-4 text-xs text-ink-400 dark:text-night-600 italic">
                Empty — waiting for distributor writes
              </div>
            )}
          </div>

          {phase >= 3 && (
            <div className="mt-3 text-xs text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
              <strong>One Redis round-trip</strong> returns the top 20 postIds. The Feed Service then batch-fetches post bodies from Posts DB (1 query, batched IN clause) and pipes through the ranker.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-2.5">
      <div className="text-[9px] uppercase font-mono text-ink-400 dark:text-night-600 mb-0.5">{label}</div>
      <div className="text-base font-mono font-semibold text-ink-900 dark:text-night-900 tabular-nums">{value}</div>
      <div className="text-[10px] text-ink-500 dark:text-night-600">{sub}</div>
    </div>
  );
}
