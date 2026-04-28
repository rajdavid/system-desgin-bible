import { useState, useEffect, useRef } from 'react';

/**
 * News Feed lifecycle: User A posts → fan-out → User B reads.
 * Stepped, auto-playing animation. Re-themed to use the app's
 * Tailwind glass-card surfaces in light & dark mode.
 */
const TOTAL_PHASES = 12;

export default function NewsFeedLifecycleDiagram() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (phase < TOTAL_PHASES) {
      timer.current = setTimeout(() => setPhase((p) => p + 1), 750);
    } else {
      timer.current = setTimeout(() => {
        setPhase(0);
        setTimeout(() => setPhase(1), 400);
      }, 3500);
    }
    return () => clearTimeout(timer.current);
  }, [phase, playing]);

  const vis = (step) => ({
    opacity: phase >= step ? 1 : 0,
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    transform: phase >= step ? 'translateY(0)' : 'translateY(8px)',
  });
  const lineVis = (step) => ({
    opacity: phase >= step ? 0.6 : 0,
    transition: 'opacity 0.6s ease',
  });

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <style>{`
        @keyframes nfDot { 0%,100%{ opacity:.7; transform:scale(1)} 50%{ opacity:1; transform:scale(1.4)} }
        .nf-dot { width:6px;height:6px;border-radius:50%;background:#7C3AED;box-shadow:0 0 8px #7C3AED;animation:nfDot 2s ease-in-out infinite;display:inline-block }
        @keyframes nfPacketW {
          0%   { cx:260; cy:72;  opacity:0 }
          10%  { opacity:.9 }
          30%  { cx:260; cy:200 }
          50%  { cx:170; cy:280 }
          70%  { cx:415; cy:375 }
          90%  { cx:415; cy:510 }
          100% { cx:415; cy:530; opacity:0 }
        }
        .nf-pw { animation: nfPacketW 4s linear infinite }
        @keyframes nfPacketR {
          0%   { cx:440; cy:610; opacity:0 }
          20%  { opacity:.9 }
          50%  { cx:440; cy:680 }
          100% { cx:440; cy:760; opacity:0 }
        }
        .nf-pr { animation: nfPacketR 2.5s linear infinite }
        @keyframes nfReadDash { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
        .nf-rd { animation: nfReadDash 1.5s linear infinite }
      `}</style>

      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="nf-dot" /> Animated lifecycle
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            User A posts → Fan-out → User B reads
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPhase(0); setPlaying(true); }}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-ink-100 dark:bg-night-400 text-ink-600 dark:text-night-700"
          >
            ↻ Replay
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium"
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      <div className="p-5 overflow-x-auto">
        <svg width="100%" viewBox="0 0 960 780" style={{ display: 'block' }}>
          <defs>
            <marker id="nf-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* Theming-aware tokens via CSS vars set on a parent <g> with class names */}
          <g className="text-ink-500 dark:text-night-600">
            <text x="55" y="18" className="fill-purple-600 dark:fill-purple-400" fontSize="10" fontFamily="monospace" letterSpacing="1.5px" style={vis(0)}>
              WRITE PATH — WHEN USER A POSTS
            </text>

            {/* User A */}
            <g style={vis(1)}>
              <rect x="175" y="32" width="170" height="40" rx="20" className="fill-white dark:fill-night-200 stroke-ink-200 dark:stroke-night-400" strokeWidth="1" />
              <text x="260" y="56" textAnchor="middle" className="fill-ink-700 dark:fill-night-700" fontSize="13" fontWeight="500">User A posts</text>
            </g>

            <line x1="260" y1="72" x2="260" y2="100" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" style={lineVis(2)} />

            {/* Post Service */}
            <g style={vis(2)}>
              <rect x="155" y="100" width="210" height="48" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
              <line x1="155" y1="104" x2="155" y2="144" stroke="#74b9ff" strokeWidth="2.5" strokeLinecap="round" />
              <text x="260" y="118" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Post Service</text>
              <text x="260" y="136" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">Save + ack "posted!"</text>
            </g>

            {/* Posts DB & S3 */}
            <g style={vis(3)}>
              <path d="M 365 118 L 420 118 L 420 82 L 500 82" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <path d="M 365 136 L 420 136 L 420 142 L 500 142" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <rect x="500" y="62" width="205" height="40" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(0,184,148,.5)" strokeWidth="1" />
              <line x1="500" y1="62" x2="705" y2="62" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
              <text x="602" y="82" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Posts DB</text>
              <rect x="500" y="122" width="205" height="40" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(0,184,148,.5)" strokeWidth="1" />
              <line x1="500" y1="122" x2="705" y2="122" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
              <text x="602" y="142" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">S3 + CDN (media)</text>
            </g>

            {/* Kafka */}
            <g style={vis(4)}>
              <line x1="260" y1="148" x2="260" y2="185" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".6" />
              <rect x="80" y="185" width="400" height="40" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(253,203,110,.6)" strokeWidth="1" transform="skewX(-2)" />
              <line x1="80" y1="189" x2="80" y2="221" stroke="#fdcb6e" strokeWidth="2.5" strokeLinecap="round" transform="skewX(-2)" />
              <text x="280" y="205" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Kafka — "new post" event (async)</text>
            </g>

            <g style={vis(5)}>
              <text x="280" y="242" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">3 independent consumers</text>
              <line x1="170" y1="225" x2="170" y2="260" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <path d="M 370 225 L 510 240 L 510 260" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <path d="M 480 205 L 700 205 L 700 260" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
            </g>

            {/* Three consumers */}
            <g style={vis(6)}>
              <rect x="65" y="260" width="210" height="48" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
              <line x1="65" y1="264" x2="65" y2="304" stroke="#74b9ff" strokeWidth="2.5" strokeLinecap="round" />
              <text x="170" y="278" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Feed Distributor</text>
              <text x="170" y="296" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">Who gets this post?</text>
              <rect x="415" y="260" width="195" height="48" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(225,112,85,.5)" strokeWidth="1" />
              <line x1="415" y1="264" x2="415" y2="304" stroke="#e17055" strokeWidth="2.5" strokeLinecap="round" />
              <text x="512" y="278" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Notifications</text>
              <text x="512" y="296" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">APNS / FCM push</text>
              <rect x="630" y="260" width="175" height="40" rx="6" className="fill-white dark:fill-night-200 stroke-ink-200 dark:stroke-night-400" strokeWidth="1" />
              <text x="717" y="280" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Search Index</text>
            </g>

            {/* Branch: regular vs celebrity */}
            <g style={vis(7)}>
              <path d="M 120 308 L 120 335 L 130 335 L 130 355" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <text x="75" y="342" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">celebrity &gt;10K</text>
              <path d="M 230 308 L 230 335 L 400 335 L 400 355" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <text x="290" y="330" className="fill-ink-500 dark:fill-night-600" fontSize="10" fontFamily="monospace">regular &lt;10K</text>
              <rect x="55" y="355" width="165" height="48" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(225,112,85,.5)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="137" y="373" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Skip writes</text>
              <text x="137" y="391" textAnchor="middle" fill="#e17055" fontSize="10">Pull on read instead</text>
              <rect x="280" y="355" width="270" height="40" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(253,203,110,.6)" strokeWidth="1" transform="skewX(-2)" />
              <line x1="280" y1="359" x2="280" y2="391" stroke="#fdcb6e" strokeWidth="2.5" strokeLinecap="round" transform="skewX(-2)" />
              <text x="415" y="375" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Task Queue (batched writes)</text>
            </g>

            <g style={vis(8)}>
              <line x1="415" y1="395" x2="415" y2="420" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <rect x="280" y="420" width="270" height="40" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
              <line x1="280" y1="424" x2="280" y2="456" stroke="#74b9ff" strokeWidth="2.5" strokeLinecap="round" />
              <text x="415" y="440" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Worker pool (parallel writes)</text>
            </g>

            {/* Feed Cache */}
            <g style={vis(9)}>
              <line x1="415" y1="460" x2="415" y2="490" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".5" />
              <rect x="160" y="490" width="510" height="50" rx="8" className="fill-white dark:fill-night-200" stroke="rgba(0,206,201,.7)" strokeWidth="1.5" />
              <line x1="160" y1="490" x2="670" y2="490" stroke="#00cec9" strokeWidth="2.5" strokeLinecap="round" />
              <text x="415" y="510" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="13" fontWeight="600">Feed Cache (Redis) — sorted set per userId</text>
              <text x="415" y="528" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">Write path ends here · Read path begins below</text>
            </g>

            {/* Read path divider */}
            <g style={vis(10)}>
              <line x1="50" y1="560" x2="910" y2="560" className="stroke-ink-200 dark:stroke-night-400" strokeWidth="0.5" strokeDasharray="6 4" />
              <text x="480" y="577" textAnchor="middle" className="fill-purple-600 dark:fill-purple-400" fontSize="10" fontFamily="monospace" letterSpacing="1.5px">
                READ PATH — WHEN USER B OPENS APP
              </text>
              <rect x="330" y="590" width="220" height="40" rx="20" className="fill-white dark:fill-night-200 stroke-ink-200 dark:stroke-night-400" strokeWidth="1" />
              <text x="440" y="614" textAnchor="middle" className="fill-ink-700 dark:fill-night-700" fontSize="13" fontWeight="500">User B opens app</text>
            </g>

            <g style={vis(11)}>
              <line x1="440" y1="630" x2="440" y2="656" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".6" />
              <rect x="330" y="656" width="220" height="48" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
              <line x1="330" y1="660" x2="330" y2="700" stroke="#74b9ff" strokeWidth="2.5" strokeLinecap="round" />
              <text x="440" y="674" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Feed Service</text>
              <text x="440" y="692" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">Merge + Rank (ML) + Ads</text>
              <path d="M 160 540 L 100 540 L 100 680 L 330 680" fill="none" stroke="#00cec9" strokeWidth="1.2" strokeDasharray="5 3" markerEnd="url(#nf-ar)" opacity=".7" className={phase >= 11 ? 'nf-rd' : ''} />
              <text x="110" y="610" fill="#00cec9" fontSize="10" fontFamily="monospace">reads pre-built</text>
              <text x="110" y="624" fill="#00cec9" fontSize="10" fontFamily="monospace">feed (1 call)</text>
              <path d="M 705 102 L 870 102 L 870 674 L 550 674" fill="none" stroke="#e17055" strokeWidth="1.2" strokeDasharray="5 3" markerEnd="url(#nf-ar)" opacity=".6" />
              <text x="858" y="400" textAnchor="end" fill="#e17055" fontSize="10" fontFamily="monospace">pulls celebrity</text>
              <text x="858" y="414" textAnchor="end" fill="#e17055" fontSize="10" fontFamily="monospace">posts on demand</text>
            </g>

            <g style={vis(12)}>
              <line x1="440" y1="704" x2="440" y2="730" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#nf-ar)" opacity=".6" />
              <text x="455" y="722" className="fill-ink-500 dark:fill-night-600" fontSize="10">JSON + media URLs</text>
              <rect x="330" y="730" width="220" height="40" rx="20" className="fill-white dark:fill-night-200" stroke="#00b894" strokeWidth="1.2" />
              <text x="440" y="754" textAnchor="middle" className="fill-ink-700 dark:fill-night-700" fontSize="13" fontWeight="500">User B's phone (via CDN)</text>
            </g>

            {/* Animated packet */}
            {phase >= 2 && phase <= 9 && <circle r="4" fill="#a29bfe" opacity="0.95" className="nf-pw" />}
            {phase >= 11 && <circle r="4" fill="#00cec9" opacity="0.95" className="nf-pr" />}
          </g>
        </svg>
      </div>

      {/* Phase indicator */}
      <div className="px-6 pb-5 flex justify-center gap-1.5">
        {Array.from({ length: TOTAL_PHASES + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setPhase(i); setPlaying(false); }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= phase ? 'bg-purple-500' : 'bg-ink-200 dark:bg-night-400'
            }`}
            aria-label={`Jump to phase ${i}`}
          />
        ))}
      </div>
    </div>
  );
}
