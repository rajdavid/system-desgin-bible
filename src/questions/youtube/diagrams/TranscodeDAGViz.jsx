import { useState, useEffect, useRef } from 'react';

/**
 * Animated transcode pipeline — chunks fan out across worker pool, encode in
 * parallel into 6 qualities × 3 codecs, audio + thumbs in parallel, then
 * assemble into MPD manifest. Live counters track wall-clock saved by
 * embarrassingly-parallel processing.
 */
const SOURCE_DURATION_MIN = 10; // 10-min source video
const CHUNK_SECONDS = 4;
const TOTAL_CHUNKS = (SOURCE_DURATION_MIN * 60) / CHUNK_SECONDS; // 150 chunks

const QUALITIES = [
  { name: '4K',     bitrate: '20 Mbps', encodeMs: 4500 },
  { name: '1080p',  bitrate: '4 Mbps',  encodeMs: 2200 },
  { name: '720p',   bitrate: '2 Mbps',  encodeMs: 1500 },
  { name: '480p',   bitrate: '1 Mbps',  encodeMs: 900 },
  { name: '360p',   bitrate: '600 Kbps', encodeMs: 600 },
  { name: '144p',   bitrate: '120 Kbps', encodeMs: 300 },
];
const CODECS = ['H.264', 'VP9', 'AV1'];

export default function TranscodeDAGViz() {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [parallelism, setParallelism] = useState(60); // worker count
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => setTick((t) => t + 1), 80);
    return () => clearTimeout(timerRef.current);
  }, [tick, playing]);

  const cycleLength = 100;
  const phase = tick % cycleLength;

  // Wall-clock math
  const totalEncodeWorkMs = TOTAL_CHUNKS * QUALITIES.reduce((sum, q) => sum + q.encodeMs, 0) * CODECS.length;
  const sequentialMin = totalEncodeWorkMs / 1000 / 60;
  const parallelSec = totalEncodeWorkMs / parallelism / 1000;

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Embarrassingly parallel
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Transcode DAG — chunk fan-out across the worker pool
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
        {/* DAG diagram */}
        <div className="bg-cream-100 dark:bg-night-300 rounded-xl p-5 mb-5 overflow-x-auto">
          <svg viewBox="0 0 800 360" className="w-full h-auto" style={{ minWidth: 700 }}>
            {/* Source video */}
            <g>
              <rect x="20" y="160" width="100" height="50" rx="6" className="fill-white dark:fill-night-200" stroke="#74b9ff" strokeWidth="1.5" />
              <text x="70" y="180" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="11" fontWeight="600">Raw video</text>
              <text x="70" y="196" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">{SOURCE_DURATION_MIN}min · 4K</text>
            </g>

            {/* Splitter */}
            <line x1="120" y1="185" x2="160" y2="185" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#tdag-ar)" opacity=".6" />
            <g>
              <rect x="160" y="160" width="90" height="50" rx="6" className="fill-white dark:fill-night-200" stroke="#fdcb6e" strokeWidth="1.5" />
              <text x="205" y="180" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="11" fontWeight="600">Splitter</text>
              <text x="205" y="196" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">4s chunks</text>
            </g>

            <defs>
              <marker id="tdag-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            {/* Chunks fanning out */}
            {Array.from({ length: 6 }).map((_, i) => {
              const y = 80 + i * 35;
              const chunkProgress = (phase + i * 8) % 100;
              const isFlight = chunkProgress < 40;
              const x = 250 + chunkProgress * 2;
              return (
                <g key={i}>
                  <line x1="250" y1="185" x2="430" y2={y} className="stroke-ink-300 dark:stroke-night-500" strokeWidth="0.8" opacity="0.4" />
                  {isFlight && (
                    <rect
                      x={Math.min(x, 425)}
                      y={185 + (y - 185) * (chunkProgress / 40) - 6}
                      width="14"
                      height="10"
                      rx="2"
                      fill="#a29bfe"
                      opacity={0.95}
                    />
                  )}
                </g>
              );
            })}

            {/* Worker pool — 6 quality boxes × 3 codecs */}
            {QUALITIES.map((q, qi) => (
              <g key={q.name}>
                {CODECS.map((codec, ci) => {
                  const x = 430 + ci * 95;
                  const y = 60 + qi * 38;
                  const slot = qi * 3 + ci;
                  const isWorking = (phase + slot * 3) % 100 < 50;
                  const progress = ((phase + slot * 3) % 100) / 50;
                  return (
                    <g key={codec}>
                      <rect
                        x={x}
                        y={y}
                        width="80"
                        height="26"
                        rx="3"
                        className="fill-white dark:fill-night-200"
                        stroke={isWorking ? '#00b894' : '#74b9ff'}
                        strokeWidth={isWorking ? 1.5 : 0.8}
                        opacity={isWorking ? 1 : 0.55}
                      />
                      <text x={x + 4} y={y + 16} className="fill-ink-700 dark:fill-night-700" fontSize="9" fontFamily="monospace">
                        {q.name} · {codec}
                      </text>
                      {isWorking && (
                        <rect
                          x={x + 2}
                          y={y + 22}
                          width={(76) * progress}
                          height="2"
                          fill="#00b894"
                          opacity="0.9"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Audio + Thumbs side track */}
            <g>
              <rect x="430" y="290" width="175" height="22" rx="3" className="fill-white dark:fill-night-200" stroke="#fdcb6e" strokeWidth="0.8" />
              <text x="437" y="306" className="fill-ink-700 dark:fill-night-700" fontSize="9" fontFamily="monospace">Audio (Opus 128k)</text>
              <rect x="430" y="316" width="175" height="22" rx="3" className="fill-white dark:fill-night-200" stroke="#fdcb6e" strokeWidth="0.8" />
              <text x="437" y="332" className="fill-ink-700 dark:fill-night-700" fontSize="9" fontFamily="monospace">Thumbnails (every 1s)</text>
            </g>

            {/* Assembler */}
            <line x1="700" y1="185" x2="725" y2="185" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#tdag-ar)" opacity=".6" />
            <g>
              <rect x="725" y="160" width="60" height="50" rx="6" className="fill-white dark:fill-night-200" stroke="#00b894" strokeWidth="1.5" />
              <text x="755" y="180" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="11" fontWeight="600">MPD</text>
              <text x="755" y="196" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">manifest</text>
            </g>
          </svg>
        </div>

        {/* Parallelism slider */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 items-start">
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono text-ink-500 dark:text-night-600 mb-2">
              Worker pool size: <span className="font-semibold text-ink-900 dark:text-night-900 tabular-nums">{parallelism}</span>
            </label>
            <input
              type="range"
              min="1"
              max="500"
              value={parallelism}
              onChange={(e) => setParallelism(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-ink-400 dark:text-night-600 mt-1 font-mono">
              <span>1 worker</span>
              <span>500 workers</span>
            </div>
          </div>

          <div className="bg-cream-100 dark:bg-night-300 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total work" value={`${(sequentialMin / 60).toFixed(1)}h`} sub="if sequential" />
              <Stat label="Wall clock" value={parallelSec < 60 ? `${parallelSec.toFixed(0)}s` : `${(parallelSec / 60).toFixed(1)}min`} sub={`@ ${parallelism} workers`} accent />
              <Stat label="Speedup" value={`${parallelism}×`} sub="ideal scaling" />
            </div>
            <div className="text-[11px] text-ink-500 dark:text-night-600 mt-3 italic">
              Each chunk × quality × codec is an independent encode job. With enough workers, total wall clock = max(single job) ≈ a few seconds. This is why YouTube can publish a 1-hour video minutes after upload completes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div>
      <div className="text-[9px] uppercase font-mono text-ink-400 dark:text-night-600 mb-0.5">{label}</div>
      <div className={`text-lg font-mono font-semibold tabular-nums ${accent ? 'text-purple-600 dark:text-purple-300' : 'text-ink-900 dark:text-night-900'}`}>
        {value}
      </div>
      <div className="text-[10px] text-ink-500 dark:text-night-600">{sub}</div>
    </div>
  );
}
