import { useState, useEffect, useRef } from 'react';

/**
 * Full YouTube lifecycle: upload → transcode → CDN tier → playback.
 * Stepped phase animation, re-themed for app's light/dark Tailwind tokens.
 */
const TOTAL_PHASES = 14;

export default function YouTubeLifecycleDiagram() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (phase < TOTAL_PHASES) {
      timer.current = setTimeout(() => setPhase((p) => p + 1), 800);
    } else {
      timer.current = setTimeout(() => {
        setPhase(0);
        setTimeout(() => setPhase(1), 400);
      }, 3500);
    }
    return () => clearTimeout(timer.current);
  }, [phase, playing]);

  const show = (s) => ({
    opacity: phase >= s ? 1 : 0,
    transition: 'opacity .5s ease, transform .5s ease',
    transform: phase >= s ? 'translateY(0)' : 'translateY(6px)',
  });
  const lShow = (s) => ({ opacity: phase >= s ? 0.6 : 0, transition: 'opacity .5s ease' });

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <style>{`
        @keyframes ytDot { 0%,100%{ opacity:.7; transform:scale(1)} 50%{ opacity:1; transform:scale(1.4)} }
        .yt-dot{ width:6px;height:6px;border-radius:50%;background:#7C3AED;box-shadow:0 0 8px #7C3AED;animation:ytDot 2s ease-in-out infinite;display:inline-block }
        @keyframes ytPacketUp{
          0%{ cx:100;cy:52;opacity:0 } 10%{ opacity:.9 }
          25%{ cx:280;cy:52 } 40%{ cx:505;cy:88 }
          55%{ cx:505;cy:158 } 70%{ cx:150;cy:256 }
          85%{ cx:615;cy:258 } 100%{ cx:825;cy:258;opacity:0 }
        }
        .yt-pu{ animation: ytPacketUp 5s linear infinite }
        @keyframes ytPacketDown{
          0%{ cx:100;cy:400;opacity:0 } 15%{ opacity:.9 }
          30%{ cx:282;cy:400 } 50%{ cx:505;cy:400 }
          70%{ cx:190;cy:523 } 90%{ cx:330;cy:655 }
          100%{ cx:330;cy:680;opacity:0 }
        }
        .yt-pd{ animation: ytPacketDown 4s linear infinite }
        @keyframes ytQual{ 0%{ stroke-dashoffset:600 } 100%{ stroke-dashoffset:0 } }
        .yt-ql{ stroke-dasharray:600; animation: ytQual 3s ease-out forwards }
      `}</style>

      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="yt-dot" /> Animated lifecycle
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Upload → Transcode → CDN → Playback
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
        <svg width="100%" viewBox="0 0 960 870" style={{ display: 'block' }}>
          <defs>
            <marker id="yt-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* ── UPLOAD PATH ── */}
          <text x="55" y="18" className="fill-purple-600 dark:fill-purple-400" fontSize="10" fontFamily="monospace" letterSpacing="1.5px" style={show(0)}>
            UPLOAD PATH — CREATOR UPLOADS VIDEO
          </text>

          <g style={show(1)}>
            <rect x="40" y="32" width="120" height="40" rx="20" className="fill-white dark:fill-night-200 stroke-ink-200 dark:stroke-night-400" strokeWidth="1" />
            <text x="100" y="56" textAnchor="middle" className="fill-ink-700 dark:fill-night-700" fontSize="13" fontWeight="500">Creator</text>
          </g>

          <line x1="160" y1="52" x2="208" y2="52" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" style={lShow(2)} />

          <g style={show(2)}>
            <rect x="210" y="30" width="140" height="44" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
            <line x1="210" y1="34" x2="210" y2="70" stroke="#74b9ff" strokeWidth="2.5" strokeLinecap="round" />
            <text x="280" y="46" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Upload API</text>
            <text x="280" y="63" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">validate, metadata</text>
          </g>

          <g style={show(3)}>
            <path d="M 350 46 L 395 46 L 395 42 L 430 42" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".5" />
            <path d="M 350 60 L 395 60 L 395 82 L 430 82" fill="none" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".5" />
            <rect x="430" y="22" width="150" height="40" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(0,184,148,.5)" strokeWidth="1" />
            <line x1="430" y1="22" x2="580" y2="22" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
            <text x="505" y="42" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Metadata DB</text>
            <rect x="430" y="68" width="150" height="40" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(0,184,148,.5)" strokeWidth="1" />
            <line x1="430" y1="68" x2="580" y2="68" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
            <text x="505" y="88" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">GCS (raw video)</text>
          </g>

          <g style={show(4)}>
            <line x1="505" y1="108" x2="505" y2="138" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".6" />
            <rect x="400" y="138" width="210" height="40" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(253,203,110,.6)" strokeWidth="1" transform="skewX(-2)" />
            <line x1="400" y1="142" x2="400" y2="174" stroke="#fdcb6e" strokeWidth="2.5" strokeLinecap="round" transform="skewX(-2)" />
            <text x="505" y="158" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Pub/Sub — transcode event</text>
          </g>

          {/* Transcode DAG */}
          <g style={show(5)}>
            <line x1="505" y1="178" x2="505" y2="205" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".6" />
            <rect x="65" y="205" width="880" height="115" rx="10" fill="none" className="stroke-ink-200 dark:stroke-night-400" strokeWidth="1" strokeDasharray="5 3" />
            <text x="85" y="222" className="fill-purple-500 dark:fill-purple-300" fontSize="9" fontFamily="monospace" letterSpacing="1.2px">TRANSCODE DAG PIPELINE (PARALLEL)</text>

            <rect x="90" y="238" width="110" height="32" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
            <text x="145" y="258" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="11" fontWeight="500">Split chunks</text>

            <line x1="200" y1="254" x2="238" y2="242" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1" markerEnd="url(#yt-ar)" opacity=".5" />
            <line x1="200" y1="254" x2="238" y2="258" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1" markerEnd="url(#yt-ar)" opacity=".5" />
            <line x1="200" y1="254" x2="238" y2="278" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1" markerEnd="url(#yt-ar)" opacity=".5" />

            <rect x="240" y="230" width="100" height="26" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.4)" strokeWidth="1" />
            <text x="290" y="247" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="10">H.264</text>
            <rect x="240" y="258" width="100" height="26" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.4)" strokeWidth="1" />
            <text x="290" y="275" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="10">VP9</text>
            <rect x="240" y="286" width="100" height="26" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.4)" strokeWidth="1" />
            <text x="290" y="303" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="10">AV1</text>

            <rect x="370" y="240" width="100" height="26" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(253,203,110,.5)" strokeWidth="1" />
            <text x="420" y="257" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="10">Audio Opus</text>
            <rect x="370" y="270" width="100" height="26" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(253,203,110,.5)" strokeWidth="1" />
            <text x="420" y="287" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="10">Thumbnails</text>

            <line x1="470" y1="258" x2="538" y2="258" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1" markerEnd="url(#yt-ar)" opacity=".5" />

            <rect x="540" y="242" width="120" height="32" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
            <text x="600" y="256" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="11" fontWeight="500">Assemble MPD</text>

            <line x1="660" y1="258" x2="718" y2="258" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".5" />

            <rect x="720" y="240" width="200" height="36" rx="5" className="fill-white dark:fill-night-200" stroke="rgba(0,184,148,.5)" strokeWidth="1" />
            <line x1="720" y1="240" x2="920" y2="240" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
            <text x="820" y="254" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="11" fontWeight="500">GCS (segments)</text>
            <text x="820" y="270" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9">6 qualities × 3 codecs</text>
          </g>

          <g style={show(6)}>
            <text x="820" y="300" textAnchor="middle" fill="#00b894" fontSize="10" fontFamily="monospace">video marked ready</text>
          </g>

          {/* DIVIDER */}
          <g style={show(7)}>
            <line x1="50" y1="340" x2="910" y2="340" className="stroke-ink-200 dark:stroke-night-400" strokeWidth="0.5" strokeDasharray="6 4" />
            <text x="480" y="360" textAnchor="middle" className="fill-purple-600 dark:fill-purple-400" fontSize="10" fontFamily="monospace" letterSpacing="1.5px">
              WATCH PATH — VIEWER CLICKS PLAY
            </text>
          </g>

          {/* WATCH PATH */}
          <g style={show(8)}>
            <rect x="40" y="378" width="120" height="40" rx="20" className="fill-white dark:fill-night-200 stroke-ink-200 dark:stroke-night-400" strokeWidth="1" />
            <text x="100" y="402" textAnchor="middle" className="fill-ink-700 dark:fill-night-700" fontSize="13" fontWeight="500">Viewer</text>
          </g>

          <line x1="160" y1="398" x2="208" y2="398" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" style={lShow(8)} />

          <g style={show(8)}>
            <rect x="210" y="376" width="145" height="44" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
            <line x1="210" y1="380" x2="210" y2="416" stroke="#74b9ff" strokeWidth="2.5" strokeLinecap="round" />
            <text x="282" y="392" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Google DNS</text>
            <text x="282" y="410" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">anycast routing</text>
          </g>

          <g style={show(9)}>
            <line x1="355" y1="398" x2="408" y2="398" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".6" />
            <rect x="410" y="376" width="190" height="44" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(162,155,254,.6)" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="505" y="392" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">MPD manifest</text>
            <text x="505" y="410" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">all qualities + segment URLs</text>
          </g>

          <g style={show(9)}>
            <line x1="600" y1="398" x2="648" y2="398" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".6" />
            <rect x="650" y="376" width="180" height="44" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(225,112,85,.55)" strokeWidth="1.5" />
            <text x="740" y="392" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">ABR algorithm</text>
            <text x="740" y="410" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">ML-predicted quality</text>
            <text x="740" y="438" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">bandwidth + buffer + device → 720p VP9</text>
          </g>

          {/* CDN hierarchy */}
          <g style={show(10)}>
            <line x1="505" y1="420" x2="505" y2="462" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".6" />
            <text x="515" y="445" className="fill-ink-500 dark:fill-night-600" fontSize="9">GET segment</text>
            <rect x="65" y="462" width="830" height="140" rx="10" fill="none" stroke="#00cec9" strokeWidth="1" strokeDasharray="5 3" opacity=".5" />
            <text x="85" y="479" fill="#00cec9" fontSize="9" fontFamily="monospace" letterSpacing="1.2px">CDN CACHE HIERARCHY — GOOGLE MEDIA CDN (3,100+ LOCATIONS)</text>
          </g>

          <g style={show(10)}>
            <rect x="95" y="495" width="190" height="50" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(0,184,148,.6)" strokeWidth="1" />
            <line x1="95" y1="495" x2="285" y2="495" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
            <text x="190" y="513" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Edge cache</text>
            <text x="190" y="531" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">ISP-local · ~5ms · 98% hit</text>
          </g>

          <g style={show(11)}>
            <line x1="285" y1="520" x2="348" y2="520" stroke="#e17055" strokeWidth="1" strokeDasharray="4 3" fill="none" markerEnd="url(#yt-ar)" opacity=".5" />
            <text x="316" y="511" textAnchor="middle" fill="#e17055" fontSize="9" fontFamily="monospace">miss</text>
            <rect x="350" y="495" width="190" height="50" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(116,185,255,.5)" strokeWidth="1" />
            <line x1="350" y1="499" x2="350" y2="541" stroke="#74b9ff" strokeWidth="2.5" strokeLinecap="round" />
            <text x="445" y="513" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Regional PoP</text>
            <text x="445" y="531" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">metro cache · ~20ms</text>
          </g>

          <g style={show(11)}>
            <line x1="540" y1="520" x2="608" y2="520" stroke="#e17055" strokeWidth="1" strokeDasharray="4 3" fill="none" markerEnd="url(#yt-ar)" opacity=".5" />
            <text x="574" y="511" textAnchor="middle" fill="#e17055" fontSize="9" fontFamily="monospace">miss</text>
            <rect x="610" y="495" width="190" height="50" rx="6" className="fill-white dark:fill-night-200" stroke="rgba(0,184,148,.5)" strokeWidth="1" />
            <line x1="610" y1="495" x2="800" y2="495" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
            <text x="705" y="513" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="12" fontWeight="600">Origin (GCS)</text>
            <text x="705" y="531" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">cold storage · ~100ms</text>
          </g>

          <g style={show(10)}>
            <text x="190" y="567" textAnchor="middle" fill="#00b894" fontSize="9" fontFamily="monospace">hot: popular videos</text>
            <text x="445" y="567" textAnchor="middle" fill="#74b9ff" fontSize="9" fontFamily="monospace">warm: medium views</text>
            <text x="705" y="567" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">cold: long-tail 80%</text>
            <text x="480" y="592" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">per-segment caching · HTTP/3 (QUIC)</text>
          </g>

          {/* Buffer */}
          <g style={show(12)}>
            <line x1="190" y1="545" x2="190" y2="625" className="stroke-ink-400 dark:stroke-night-600" strokeWidth="1.2" markerEnd="url(#yt-ar)" opacity=".6" />
            <rect x="65" y="625" width="530" height="50" rx="8" className="fill-white dark:fill-night-200" stroke="rgba(0,206,201,.7)" strokeWidth="1.5" />
            <line x1="65" y1="625" x2="595" y2="625" stroke="#00cec9" strokeWidth="2.5" strokeLinecap="round" />
            <text x="330" y="644" textAnchor="middle" className="fill-ink-900 dark:fill-night-900" fontSize="13" fontWeight="600">Player buffer — 10–20s ahead</text>
            <text x="330" y="662" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="10">demux MP4 → decode VP9/AV1 (HW) → sync audio PTS → render</text>
          </g>

          {/* ABR quality ladder */}
          <g style={show(13)}>
            <rect x="65" y="695" width="830" height="160" rx="10" fill="none" className="stroke-purple-400 dark:stroke-purple-300" strokeWidth="1" strokeDasharray="5 3" opacity=".5" />
            <text x="85" y="712" className="fill-purple-600 dark:fill-purple-300" fontSize="9" fontFamily="monospace" letterSpacing="1.2px">
              ADAPTIVE BITRATE — QUALITY LADDER
            </text>

            <line x1="110" y1="730" x2="110" y2="830" className="stroke-ink-200 dark:stroke-night-400" strokeWidth="0.5" />
            <line x1="110" y1="830" x2="860" y2="830" className="stroke-ink-200 dark:stroke-night-400" strokeWidth="0.5" />
            <text x="97" y="740" textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">4K</text>
            <text x="97" y="758" textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">1080p</text>
            <text x="97" y="776" textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">720p</text>
            <text x="97" y="794" textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">360p</text>
            <text x="97" y="812" textAnchor="end" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">144p</text>
          </g>

          <g style={show(14)}>
            <polyline className={phase >= 14 ? 'yt-ql' : ''} points="130,812 200,812 230,794 350,794 380,776 500,776 530,758 620,758 650,740 740,740 760,758 800,758 830,740 850,740" fill="none" stroke="#a29bfe" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="230" cy="794" r="3.5" fill="#00b894" />
            <circle cx="380" cy="776" r="3.5" fill="#00b894" />
            <circle cx="650" cy="740" r="3.5" fill="#00b894" />
            <circle cx="760" cy="758" r="3.5" fill="#e17055" />
            <circle cx="830" cy="740" r="3.5" fill="#00b894" />
            <text x="230" y="786" textAnchor="middle" fill="#00b894" fontSize="8" fontFamily="monospace">ramp</text>
            <text x="650" y="732" textAnchor="middle" fill="#00b894" fontSize="8" fontFamily="monospace">peak</text>
            <text x="760" y="750" textAnchor="middle" fill="#e17055" fontSize="8" fontFamily="monospace">dip</text>
            <text x="830" y="732" textAnchor="middle" fill="#00b894" fontSize="8" fontFamily="monospace">recover</text>
            <text x="480" y="845" textAnchor="middle" className="fill-ink-500 dark:fill-night-600" fontSize="9" fontFamily="monospace">switches at segment boundaries (2–6s) · seamless to viewer</text>
          </g>

          {/* Animated packets */}
          {phase >= 2 && phase <= 6 && <circle r="3" fill="#a29bfe" opacity="0.9" className="yt-pu" />}
          {phase >= 8 && phase <= 12 && <circle r="3" fill="#00cec9" opacity="0.9" className="yt-pd" />}
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
