import { useState } from 'react';

/**
 * Comparative codec ladder — H.264 vs VP9 vs AV1.
 * Bitrate vs visual quality, encode time, decode hardware support.
 * Click a row or a codec column to highlight it.
 */
const CODECS = [
  { key: 'h264', label: 'H.264 / AVC',  year: 2003, color: '#74b9ff' },
  { key: 'vp9',  label: 'VP9',          year: 2013, color: '#a29bfe' },
  { key: 'av1',  label: 'AV1',          year: 2018, color: '#00b894' },
];

const QUALITIES = [
  { label: '4K (2160p)',  baseBitrate: 25 },
  { label: '1080p',       baseBitrate: 5 },
  { label: '720p',        baseBitrate: 2.5 },
  { label: '480p',        baseBitrate: 1.0 },
  { label: '360p',        baseBitrate: 0.6 },
  { label: '144p',        baseBitrate: 0.15 },
];

// Compression efficiency multipliers (relative to H.264)
const EFFICIENCY = { h264: 1.0, vp9: 0.7, av1: 0.5 };
const ENCODE_TIME_MULT = { h264: 1.0, vp9: 3.0, av1: 12.0 };
const HW_DECODE_PCT = { h264: 99, vp9: 75, av1: 35 };

export default function CodecLadderViz() {
  const [selectedQ, setSelectedQ] = useState('1080p');
  const [highlightCodec, setHighlightCodec] = useState(null);

  const selectedQuality = QUALITIES.find((q) => q.label === selectedQ);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Compare codecs
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Codec ladder — bitrate, encode cost, hardware decode
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Bitrate bar chart */}
        <div className="bg-cream-100 dark:bg-night-300 rounded-xl p-5 mb-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-ink-500 dark:text-night-600 mb-3">
            Bitrate at each quality (Mbps · lower is better)
          </div>
          <div className="space-y-2">
            {QUALITIES.map((q) => {
              const isSelected = q.label === selectedQ;
              return (
                <div
                  key={q.label}
                  onClick={() => setSelectedQ(q.label)}
                  className={`grid grid-cols-[80px_1fr] gap-3 items-center cursor-pointer rounded p-1 transition-all ${
                    isSelected ? 'bg-purple-500/10' : 'hover:bg-ink-100/30 dark:hover:bg-night-400/30'
                  }`}
                >
                  <div className={`text-xs font-mono text-right ${isSelected ? 'text-purple-600 dark:text-purple-300 font-semibold' : 'text-ink-700 dark:text-night-700'}`}>
                    {q.label}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CODECS.map((codec) => {
                      const bitrate = q.baseBitrate * EFFICIENCY[codec.key];
                      const maxWidth = q.baseBitrate;
                      const widthPct = (bitrate / maxWidth) * 100;
                      const isHighlightedCodec = highlightCodec === null || highlightCodec === codec.key;
                      return (
                        <div
                          key={codec.key}
                          className="bg-white dark:bg-night-200 rounded relative overflow-hidden h-7"
                          style={{ opacity: isHighlightedCodec ? 1 : 0.35 }}
                        >
                          <div
                            className="h-full transition-all duration-300 absolute top-0 left-0"
                            style={{ width: `${widthPct}%`, background: codec.color, opacity: 0.85 }}
                          />
                          <div className="relative z-10 flex items-center justify-between px-2 h-full text-[10px] font-mono">
                            <span className="text-white drop-shadow font-semibold">{codec.label.split(' ')[0]}</span>
                            <span className={isSelected ? 'text-ink-900 dark:text-night-900 font-semibold' : 'text-ink-700 dark:text-night-700'}>
                              {bitrate.toFixed(2)} Mbps
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[11px] text-ink-500 dark:text-night-600 italic">
            Click a row to inspect that quality. Same visual quality, different bitrate by codec — that's the compression efficiency win.
          </div>
        </div>

        {/* Codec comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CODECS.map((codec) => {
            const bitrate = selectedQuality.baseBitrate * EFFICIENCY[codec.key];
            const isHighlight = highlightCodec === codec.key;
            return (
              <div
                key={codec.key}
                onMouseEnter={() => setHighlightCodec(codec.key)}
                onMouseLeave={() => setHighlightCodec(null)}
                className="bg-cream-100 dark:bg-night-300 rounded-lg p-4 cursor-default border-2 transition-all"
                style={{ borderColor: isHighlight ? codec.color : 'transparent' }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-serif text-lg font-semibold" style={{ color: codec.color }}>
                    {codec.label}
                  </div>
                  <div className="text-[10px] font-mono text-ink-400 dark:text-night-600">{codec.year}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <div className="text-[9px] uppercase font-mono text-ink-400 dark:text-night-600 mb-0.5">{selectedQ} bitrate</div>
                    <div className="font-mono font-semibold tabular-nums text-ink-900 dark:text-night-900">
                      {bitrate.toFixed(2)} Mbps
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-mono text-ink-400 dark:text-night-600 mb-0.5">vs H.264</div>
                    <div className="font-mono font-semibold tabular-nums" style={{ color: codec.color }}>
                      {((1 - EFFICIENCY[codec.key]) * 100).toFixed(0)}% smaller
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-mono text-ink-400 dark:text-night-600 mb-0.5">Encode cost</div>
                    <div className="font-mono font-semibold tabular-nums text-ink-900 dark:text-night-900">
                      {ENCODE_TIME_MULT[codec.key].toFixed(0)}× H.264
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-mono text-ink-400 dark:text-night-600 mb-0.5">HW decode</div>
                    <div className="font-mono font-semibold tabular-nums text-ink-900 dark:text-night-900">
                      ~{HW_DECODE_PCT[codec.key]}% devices
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-ink-700 dark:text-night-700 leading-relaxed">
                  {codec.key === 'h264' && (
                    <span><strong className="text-blue-600 dark:text-blue-400">Universal fallback.</strong> Every device built since ~2007 has hardware decode. Patented; royalty-bearing. The "always works" tier.</span>
                  )}
                  {codec.key === 'vp9' && (
                    <span><strong className="text-purple-600 dark:text-purple-300">Royalty-free, ~30% better than H.264.</strong> Native on Chrome, Android, modern smart TVs. YouTube's default for views from supported clients.</span>
                  )}
                  {codec.key === 'av1' && (
                    <span><strong className="text-teal-600 dark:text-teal-400">~50% better than H.264.</strong> Encoding is brutally expensive. Only encoded for top-popularity videos where the storage + egress savings pay back the encode cost. HW decode improving fast.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-sm text-ink-700 dark:text-night-700">
          <strong className="text-purple-600 dark:text-purple-300">Why encode 3 codecs at all?</strong> Storage cost goes up 3× per video, but egress savings dominate. AV1 saves 50% bandwidth on viewable clients (typically the heaviest viewers); VP9 saves 30% on a much wider client base; H.264 ensures playback on the long tail of older devices. The economics flip in favor of multi-codec at scale: the tipping point is roughly 10K total views.
        </div>
      </div>
    </div>
  );
}
