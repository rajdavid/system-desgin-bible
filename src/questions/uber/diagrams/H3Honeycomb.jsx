import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Animated H3 hexagonal grid showing:
 *  - 1 center cell (rider request)
 *  - 6 neighbor cells (the "1-ring" dispatch scan)
 *  - 5 driver dots drifting via translate animation
 *  - 3 staggered radar pulses from rider
 *  - 1 hot cell that glows red (sub-shard candidate)
 */

const R = 34;                                   // hex circumradius
const COS = R * Math.cos(Math.PI / 6);          // ≈ 29.4 — half-width
const ROW_H = R * 1.5;                          // 51 — vertical center-to-center

// Center the layout in a 420×260 viewBox
const CX = 210;
const CY = 130;

// Pointy-top hex relative to center (cx, cy)
const hexPoints = (cx, cy) => [
  [cx, cy - R],
  [cx + COS, cy - R / 2],
  [cx + COS, cy + R / 2],
  [cx, cy + R],
  [cx - COS, cy + R / 2],
  [cx - COS, cy - R / 2],
].map(p => p.join(',')).join(' ');

const CELLS = [
  { id: 'C',  cx: CX,           cy: CY,           role: 'center', label: 'H3·C' },
  { id: 'NW', cx: CX - COS,     cy: CY - ROW_H,   role: 'neighbor', label: 'NW' },
  { id: 'NE', cx: CX + COS,     cy: CY - ROW_H,   role: 'neighbor', label: 'NE' },
  { id: 'W',  cx: CX - 2 * COS, cy: CY,           role: 'neighbor', label: 'W' },
  { id: 'E',  cx: CX + 2 * COS, cy: CY,           role: 'hot',      label: 'E·HOT' },
  { id: 'SW', cx: CX - COS,     cy: CY + ROW_H,   role: 'neighbor', label: 'SW' },
  { id: 'SE', cx: CX + COS,     cy: CY + ROW_H,   role: 'neighbor', label: 'SE' },
];

// Drivers seeded inside specific cells; they drift but stay nearby
const DRIVERS = [
  { x: CX - 2 * COS + 6,  y: CY + 6,   delay: 0,    dur: 6 },
  { x: CX + COS + 4,      y: CY - ROW_H + 6, delay: -2, dur: 7.5 },
  { x: CX + 2 * COS - 8,  y: CY + 4,   delay: -4,   dur: 6.8 },
  { x: CX - COS + 4,      y: CY + ROW_H - 4, delay: -1.2, dur: 8 },
  { x: CX + COS - 6,      y: CY + ROW_H + 6, delay: -3.4, dur: 7 },
];

const driftKeyframes = {
  x: [0, 18, 30, 12, 0],
  y: [0, -10, 6, 16, 0],
};

export default function H3Honeycomb() {
  const [showRing, setShowRing] = useState(true);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Live — H3 dispatch scan
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Rider request → 1-ring of 7 H3 cells → candidate drivers
          </div>
        </div>
        <button
          onClick={() => setShowRing(!showRing)}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-ink-200 dark:border-night-400 bg-cream-50 dark:bg-night-300 text-ink-600 dark:text-night-800 hover:border-rust-400"
        >
          {showRing ? 'Hide ring' : 'Show ring'}
        </button>
      </div>

      <div className="p-6">
        <svg viewBox="0 0 420 260" className="w-full h-auto" style={{ maxHeight: 360 }}>
          <defs>
            <radialGradient id="riderGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a29bfe" />
              <stop offset="100%" stopColor="#6c5ce7" />
            </radialGradient>
            <radialGradient id="driverGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fdcb6e" />
              <stop offset="100%" stopColor="#e17055" />
            </radialGradient>
            <radialGradient id="centerCellBg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgba(108,92,231,0.40)" />
              <stop offset="100%" stopColor="rgba(108,92,231,0.05)" />
            </radialGradient>
            <radialGradient id="hotCellBg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgba(225,112,85,0.40)" />
              <stop offset="100%" stopColor="rgba(225,112,85,0.05)" />
            </radialGradient>
            <filter id="hexShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* Hex cells */}
          {CELLS.map((cell) => {
            const isCenter = cell.role === 'center';
            const isHot = cell.role === 'hot';
            const fill = isCenter
              ? 'url(#centerCellBg)'
              : isHot
              ? 'url(#hotCellBg)'
              : 'rgba(116,185,255,0.06)';
            const stroke = isCenter ? '#6c5ce7' : isHot ? '#e17055' : '#3a3a4a';

            return (
              <g key={cell.id}>
                <motion.polygon
                  points={hexPoints(cell.cx, cell.cy)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCenter || isHot ? 1.5 : 1}
                  animate={
                    isCenter || isHot
                      ? {
                          filter: [
                            'drop-shadow(0 0 0px transparent)',
                            `drop-shadow(0 0 10px ${isCenter ? '#6c5ce7' : '#e17055'})`,
                            'drop-shadow(0 0 0px transparent)',
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: isCenter ? 2.2 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <text
                  x={cell.cx}
                  y={cell.cy + 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fill={isCenter || isHot ? '#e4e0d8' : '#8a8a9a'}
                  letterSpacing="0.5"
                >
                  {cell.label}
                </text>
              </g>
            );
          })}

          {/* Radar pulses from rider */}
          {showRing &&
            [0, 0.8, 1.6].map((delay, i) => (
              <motion.circle
                key={i}
                cx={CX}
                cy={CY}
                r={6}
                fill="none"
                stroke="#a29bfe"
                strokeWidth="2"
                initial={{ r: 6, opacity: 0.9 }}
                animate={{ r: [6, 120], opacity: [0.9, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay }}
              />
            ))}

          {/* Drivers (orange dots, drifting) */}
          {DRIVERS.map((d, i) => (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={5.5}
              fill="url(#driverGlow)"
              animate={driftKeyframes}
              transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(253,203,110,0.7))' }}
            />
          ))}

          {/* Rider (center, purple) */}
          <motion.circle
            cx={CX}
            cy={CY - R - 6}
            r={7}
            fill="url(#riderGlow)"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 10px rgba(162,155,254,0.95))' }}
          />
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs font-mono text-ink-500 dark:text-night-700">
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: 'radial-gradient(circle, #a29bfe, #6c5ce7)' }}
            />
            Rider request
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: 'radial-gradient(circle, #fdcb6e, #e17055)' }}
            />
            Driver (live GPS)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-3 h-2 rounded" style={{ background: 'rgba(225,112,85,0.5)' }} />
            Hot zone (sub-shard)
          </span>
          <span>○ Radar = 1-ring dispatch scan</span>
        </div>
      </div>
    </div>
  );
}
