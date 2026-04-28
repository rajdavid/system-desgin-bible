import { useState, useEffect, useRef } from 'react';

/**
 * Interactive ABR (Adaptive Bitrate) simulator.
 * - Slider controls available bandwidth in real time
 * - Buffer fills/drains based on bitrate vs bandwidth
 * - Quality auto-selects to keep buffer healthy
 * - Visualizes the quality-ladder timeline as the simulation runs
 */
const QUALITIES = [
  { label: '4K',     bitrateMbps: 20,  y: 30 },
  { label: '1080p',  bitrateMbps: 5,   y: 70 },
  { label: '720p',   bitrateMbps: 2.5, y: 110 },
  { label: '480p',   bitrateMbps: 1.0, y: 150 },
  { label: '360p',   bitrateMbps: 0.6, y: 190 },
  { label: '144p',   bitrateMbps: 0.15, y: 230 },
];

const BUFFER_TARGET = 20;   // seconds
const BUFFER_PANIC = 4;
const BUFFER_MAX = 30;
const TICK_MS = 200;
const SECONDS_PER_TICK = 1; // 1s of playback per tick (for clarity)
const HISTORY = 60;

export default function ABRSimulator() {
  const [bandwidthMbps, setBandwidthMbps] = useState(8);
  const [running, setRunning] = useState(true);
  const [buffer, setBuffer] = useState(15); // seconds in buffer
  const [currentQ, setCurrentQ] = useState(2); // index into QUALITIES
  const [history, setHistory] = useState([]); // [{q, bw, t}]
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setTimeout(() => {
      // Pick best quality whose bitrate < 80% of measured bandwidth
      const safeBw = bandwidthMbps * 0.8;
      // Add hysteresis: don't switch up until buffer is healthy
      const minBufferToUpgrade = 12;
      let nextQ = currentQ;

      const eligible = QUALITIES.findIndex((q) => q.bitrateMbps <= safeBw);
      const targetQ = eligible === -1 ? QUALITIES.length - 1 : eligible;

      if (buffer < BUFFER_PANIC) {
        // Emergency downgrade — pick lowest viable
        nextQ = Math.min(QUALITIES.length - 1, currentQ + 2);
      } else if (targetQ < currentQ && buffer >= minBufferToUpgrade) {
        // Upgrade only if buffer healthy
        nextQ = targetQ;
      } else if (targetQ > currentQ) {
        // Downgrade quickly if needed
        nextQ = targetQ;
      }

      // Buffer dynamics: ratio of bandwidth to current bitrate
      const bitrate = QUALITIES[nextQ].bitrateMbps;
      const fillRate = bandwidthMbps / bitrate; // seconds of video downloaded per second of playback
      const newBuffer = Math.max(0, Math.min(BUFFER_MAX, buffer + (fillRate - 1) * SECONDS_PER_TICK));

      setBuffer(newBuffer);
      setCurrentQ(nextQ);
      setHistory((h) => [...h.slice(-(HISTORY - 1)), { q: nextQ, bw: bandwidthMbps, t: tick }]);
      setTick((t) => t + 1);
    }, TICK_MS);
    return () => clearTimeout(timerRef.current);
  }, [running, tick, bandwidthMbps, buffer, currentQ]);

  const bufferState = buffer < BUFFER_PANIC ? 'panic' : buffer < 8 ? 'warning' : 'healthy';
  const bufferColor = bufferState === 'panic' ? '#e17055' : bufferState === 'warning' ? '#fdcb6e' : '#00b894';

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Interactive — drag the bandwidth slider
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            ABR algorithm simulator
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setBuffer(15); setCurrentQ(2); setHistory([]); setTick(0); setRunning(true); }}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-ink-100 dark:bg-night-400 text-ink-600 dark:text-night-700"
          >
            ↻ Reset
          </button>
          <button
            onClick={() => setRunning(!running)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium"
          >
            {running ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Left: Quality timeline + buffer */}
        <div>
          <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-4 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500 dark:text-night-600 mb-2">
              Quality timeline
            </div>
            <svg viewBox="0 0 600 280" className="w-full h-auto">
              {/* Grid lines + labels */}
              {QUALITIES.map((q) => (
                <g key={q.label}>
                  <line x1="60" y1={q.y} x2="590" y2={q.y} className="stroke-ink-200 dark:stroke-night-400" strokeWidth="0.5" strokeDasharray="2 3" />
                  <text x="55" y={q.y + 4} textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">{q.label}</text>
                  <text x="595" y={q.y + 4} className="fill-ink-400 dark:fill-night-600" fontSize="9" fontFamily="monospace">{q.bitrateMbps}M</text>
                </g>
              ))}

              {/* History line */}
              {history.length > 1 && (
                <polyline
                  points={history.map((h, i) => {
                    const x = 60 + (i / HISTORY) * 530;
                    const y = QUALITIES[h.q].y;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#a29bfe"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              )}

              {/* Current dot */}
              {history.length > 0 && (
                <circle
                  cx={60 + ((history.length - 1) / HISTORY) * 530}
                  cy={QUALITIES[currentQ].y}
                  r="5"
                  fill={bufferColor}
                  stroke="#a29bfe"
                  strokeWidth="2"
                />
              )}

              <text x="60" y="270" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">time →</text>
            </svg>
          </div>

          {/* Buffer bar */}
          <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500 dark:text-night-600">Player buffer</div>
              <div className="font-mono text-sm font-semibold tabular-nums" style={{ color: bufferColor }}>
                {buffer.toFixed(1)}s ahead · {bufferState.toUpperCase()}
              </div>
            </div>
            <div className="h-4 bg-ink-100 dark:bg-night-400 rounded-full overflow-hidden relative">
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${(buffer / BUFFER_MAX) * 100}%`, background: bufferColor }}
              />
              {/* Target line */}
              <div className="absolute top-0 bottom-0 w-px bg-ink-400 dark:bg-night-600" style={{ left: `${(BUFFER_TARGET / BUFFER_MAX) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-ink-400 dark:text-night-600 mt-1 font-mono">
              <span>0s</span>
              <span style={{ marginLeft: `${(BUFFER_TARGET / BUFFER_MAX) * 100 - 2}%` }}>target {BUFFER_TARGET}s</span>
              <span>{BUFFER_MAX}s max</span>
            </div>
          </div>
        </div>

        {/* Right: Controls + state */}
        <div>
          <div className="mb-5">
            <label className="block text-xs uppercase tracking-wider font-mono text-ink-500 dark:text-night-600 mb-2">
              Bandwidth: <span className="font-semibold text-ink-900 dark:text-night-900 tabular-nums">{bandwidthMbps.toFixed(1)} Mbps</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="25"
              step="0.1"
              value={bandwidthMbps}
              onChange={(e) => setBandwidthMbps(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-ink-400 dark:text-night-600 mt-1 font-mono">
              <span>0.1M (3G)</span>
              <span>5M (4K-min)</span>
              <span>25M (fiber)</span>
            </div>
          </div>

          <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-4 mb-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500 dark:text-night-600 mb-2">Now playing</div>
            <div className="font-mono text-2xl font-semibold text-purple-600 dark:text-purple-300">
              {QUALITIES[currentQ].label}
            </div>
            <div className="text-[11px] text-ink-500 dark:text-night-600 mt-1">
              {QUALITIES[currentQ].bitrateMbps} Mbps · {bandwidthMbps >= QUALITIES[currentQ].bitrateMbps * 1.25 ? '✓ comfortable' : '⚠ tight'}
            </div>
          </div>

          <div className="text-[12px] text-ink-700 dark:text-night-700 leading-relaxed">
            {bufferState === 'panic' && (
              <><strong className="text-rust-600 dark:text-rust-400">Buffer crashing.</strong> ABR drops two quality steps to refill quickly. Viewer sees a quality dip but no rebuffer.</>
            )}
            {bufferState === 'warning' && (
              <><strong className="text-amber-600 dark:text-amber-400">Buffer below target.</strong> ABR holds current quality, doesn't upgrade until buffer recovers above 12s.</>
            )}
            {bufferState === 'healthy' && bandwidthMbps > QUALITIES[currentQ].bitrateMbps * 2 && (
              <><strong className="text-teal-600 dark:text-teal-400">Plenty of headroom.</strong> ABR will upgrade quality next segment boundary if a higher tier fits.</>
            )}
            {bufferState === 'healthy' && bandwidthMbps <= QUALITIES[currentQ].bitrateMbps * 2 && (
              <><strong className="text-teal-600 dark:text-teal-400">Stable.</strong> Buffer holding at target, current quality is the right choice.</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
