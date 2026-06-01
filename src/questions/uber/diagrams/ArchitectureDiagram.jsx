import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * 3-tier Uber architecture diagram (pure SVG + framer-motion).
 * Three traces the user can toggle:
 *   - "track"    : driver GPS → loc gateway → loc service → geo index
 *   - "request"  : rider → API → ride svc → dispatcher → trip FSM
 *   - "complete" : trip FSM → payment → notification
 *
 * The active trace's edges glow and a particle travels each segment.
 */

const TRACES = {
  track: {
    label: 'Track — driver GPS stream',
    nodes: ['driver', 'locgw', 'locsvc', 'geo'],
    edges: ['e-driver-locgw', 'e-locgw-locsvc', 'e-locsvc-geo'],
  },
  request: {
    label: 'Request — rider asks for a ride',
    nodes: ['rider', 'api', 'ride', 'disp', 'trip'],
    edges: ['e-rider-api', 'e-api-ride', 'e-ride-disp', 'e-disp-trip'],
  },
  complete: {
    label: 'Complete — trip ends, fare locked',
    nodes: ['trip', 'pay', 'notif'],
    edges: ['e-trip-pay', 'e-trip-notif'],
  },
};

// Nodes: { id, x, y, w, h, label, sub, variant }
const NODES = [
  // Tier 1: tracking (top)
  { id: 'driver', x:  30, y:  30, w: 90,  h: 44, label: 'Driver App',   sub: 'WSS · 4s',     variant: 'ext' },
  { id: 'locgw',  x: 160, y:  30, w: 110, h: 44, label: 'Loc Gateway',  sub: 'sticky shard', variant: 'svc' },
  { id: 'locsvc', x: 300, y:  30, w: 110, h: 44, label: 'Loc Service',  sub: 'upsert+pub',   variant: 'svc' },
  { id: 'geo',    x: 440, y:  30, w: 100, h: 44, label: 'Geo Index',    sub: 'Redis · H3',   variant: 'db'  },

  // Tier 2: matching (middle)
  { id: 'rider',  x:  30, y: 130, w: 90,  h: 44, label: 'Rider App',    sub: 'HTTPS',         variant: 'ext' },
  { id: 'api',    x: 160, y: 130, w: 110, h: 44, label: 'API Gateway',  sub: '+ idempotency', variant: 'svc' },
  { id: 'ride',   x: 300, y: 130, w: 110, h: 44, label: 'Ride Service', sub: 'orchestrate',   variant: 'svc' },
  { id: 'disp',   x: 440, y: 130, w: 100, h: 44, label: 'Dispatcher',   sub: 'batched',       variant: 'dec' },
  { id: 'trip',   x: 580, y: 130, w: 100, h: 44, label: 'Trip FSM',     sub: 'sticky',        variant: 'svc' },

  // Tier 3: completion (bottom)
  { id: 'pay',    x: 440, y: 230, w: 100, h: 44, label: 'Payment',      sub: 'Stripe',        variant: 'svc' },
  { id: 'notif',  x: 580, y: 230, w: 100, h: 44, label: 'Notification', sub: 'APNS / FCM',    variant: 'svc' },
];

const EDGES = [
  { id: 'e-driver-locgw', from: 'driver', to: 'locgw' },
  { id: 'e-locgw-locsvc', from: 'locgw',  to: 'locsvc' },
  { id: 'e-locsvc-geo',   from: 'locsvc', to: 'geo' },

  { id: 'e-rider-api',    from: 'rider',  to: 'api' },
  { id: 'e-api-ride',     from: 'api',    to: 'ride' },
  { id: 'e-ride-disp',    from: 'ride',   to: 'disp' },
  { id: 'e-disp-trip',    from: 'disp',   to: 'trip' },

  { id: 'e-trip-pay',     from: 'trip',   to: 'pay',   bend: true },
  { id: 'e-trip-notif',   from: 'trip',   to: 'notif' },
];

const VARIANTS = {
  ext: { fill: '#1c1c1e', stroke: '#3a3a4a', text: '#e4e0d8' },
  svc: { fill: '#0e1a26', stroke: '#74b9ff', text: '#cfe0f6' },
  db:  { fill: '#0a1a13', stroke: '#00b894', text: '#a7e9d0' },
  dec: { fill: '#1f0e07', stroke: '#e17055', text: '#f4c8b6' },
};

function nodeById(id) { return NODES.find(n => n.id === id); }

function edgePath(e) {
  const a = nodeById(e.from);
  const b = nodeById(e.to);
  const x1 = a.x + a.w;
  const y1 = a.y + a.h / 2;
  const x2 = b.x;
  const y2 = b.y + b.h / 2;
  if (e.bend) {
    // S-curve for cross-tier edges
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`;
  }
  if (Math.abs(y1 - y2) < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  return `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
}

export default function ArchitectureDiagram() {
  const [trace, setTrace] = useState('request');
  const activeNodes = new Set(TRACES[trace].nodes);
  const activeEdges = new Set(TRACES[trace].edges);

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Interactive — trace the three primary flows
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          Uber — End-to-End Architecture
        </div>
      </div>

      <div className="px-6 pt-4 flex flex-wrap items-center gap-2">
        {Object.keys(TRACES).map((k) => (
          <button
            key={k}
            onClick={() => setTrace(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              trace === k
                ? 'bg-rust-500 text-white border-rust-500 shadow-sm'
                : 'bg-cream-50 dark:bg-night-300 text-ink-600 dark:text-night-800 border-ink-200 dark:border-night-400 hover:border-ink-300 dark:hover:border-night-600'
            }`}
          >
            {k === 'track' ? '📡 Track' : k === 'request' ? '🚕 Request' : '💳 Complete'}
          </button>
        ))}
        <span className="text-xs text-ink-500 dark:text-night-700 ml-2">{TRACES[trace].label}</span>
      </div>

      <div className="p-4">
        <svg viewBox="0 0 700 290" className="w-full h-auto" style={{ maxHeight: 380 }}>
          <defs>
            <filter id="archGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* Tier backgrounds */}
          {[
            { y: 14, label: 'Real-time Tracking · 1.25M loc upd/s' },
            { y: 114, label: 'Matching & Trip Lifecycle' },
            { y: 214, label: 'Settlement' },
          ].map((tier, i) => (
            <g key={i}>
              <rect
                x={10}
                y={tier.y}
                width={680}
                height={80}
                rx={8}
                fill="rgba(108,92,231,0.025)"
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="3 3"
              />
              <text x={20} y={tier.y + 14} fontSize="9" fontFamily="ui-monospace, monospace" fill="#8a8a9a" letterSpacing="1">
                {tier.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Edges */}
          {EDGES.map((e) => {
            const isActive = activeEdges.has(e.id);
            const path = edgePath(e);
            return (
              <g key={e.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={isActive ? '#a29bfe' : '#3a3a4a'}
                  strokeWidth={isActive ? 2 : 1.2}
                  strokeDasharray={e.bend ? '4 3' : undefined}
                  style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                />
                {isActive && (
                  <motion.circle
                    r="3.5"
                    fill="#a29bfe"
                    style={{ filter: 'drop-shadow(0 0 6px #a29bfe)' }}
                  >
                    <animateMotion dur="1.4s" repeatCount="indefinite" path={path} />
                  </motion.circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const v = VARIANTS[n.variant];
            const isActive = activeNodes.has(n.id);
            return (
              <g key={n.id}>
                <motion.rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx={6}
                  fill={v.fill}
                  stroke={v.stroke}
                  strokeWidth={isActive ? 1.8 : 1}
                  animate={
                    isActive
                      ? { filter: [`drop-shadow(0 0 0px ${v.stroke})`, `drop-shadow(0 0 10px ${v.stroke})`, `drop-shadow(0 0 4px ${v.stroke})`] }
                      : { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }
                  }
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <text
                  x={n.x + n.w / 2}
                  y={n.y + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill={v.text}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text
                    x={n.x + n.w / 2}
                    y={n.y + 32}
                    textAnchor="middle"
                    fontSize="9"
                    fill={v.text}
                    opacity="0.7"
                    fontFamily="ui-monospace, monospace"
                  >
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
