import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import useDark from '../../../hooks/useDark';

/* ── palette ── */
const palette = {
  light: {
    neutral: { bg: '#FBF9F5', border: '#C4C4C4', text: '#2A2A2A' },
    accent:  { bg: '#FAF0EC', border: '#C4643A', text: '#843E1C' },
    teal:    { bg: '#E5F3EE', border: '#2D8B66', text: '#145038' },
    edge: '#B0B0B0',
    edgeLabel: '#737373',
    rust: '#C4643A',
    flowBg: '#FAFAF8',
    laneBg: 'rgba(0,0,0,0.015)',
    laneBorder: '#E5E3DE',
    laneText: '#9A9A9A',
    particleGlow: 'rgba(196,100,58,0.6)',
  },
  dark: {
    neutral: { bg: '#1C1C1E', border: '#3A3A3C', text: '#E4E0D8' },
    accent:  { bg: '#1F0E07', border: '#D4643A', text: '#E8855A' },
    teal:    { bg: '#071A12', border: '#2D8B66', text: '#6EE7B7' },
    edge: '#4A4A4C',
    edgeLabel: '#888',
    rust: '#E8855A',
    flowBg: '#111113',
    laneBg: 'rgba(255,255,255,0.02)',
    laneBorder: '#2A2A2C',
    laneText: '#6B6B6B',
    particleGlow: 'rgba(232,133,90,0.7)',
  },
};

/* ── custom node ── */
function ArchNode({ data }) {
  const { label, sub, variant = 'neutral', dashed, active, dark } = data;
  const p = dark ? palette.dark : palette.light;
  const s = p[variant];
  const glow = active && variant !== 'neutral';

  return (
    <div
      className="relative px-4 py-2.5 rounded-lg text-center transition-all duration-300"
      style={{
        background: s.bg,
        border: `1.5px ${dashed ? 'dashed' : 'solid'} ${s.border}`,
        boxShadow: glow
          ? `0 0 16px ${s.border}40, 0 0 4px ${s.border}60`
          : '0 1px 3px rgba(0,0,0,0.08)',
        transform: active ? 'scale(1.04)' : 'scale(1)',
        minWidth: 80,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle id="top" type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />

      <div className="font-medium text-[13px] leading-tight" style={{ color: s.text }}>
        {label}
      </div>
      {sub && (
        <div className="text-[10px] mt-0.5 opacity-70" style={{ color: s.text }}>
          {sub}
        </div>
      )}

      {active && (
        <motion.div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
          style={{ background: s.border }}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </div>
  );
}

/* ── animated edge with particle ── */
function AnimatedEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style,
}) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const edgeColor = style?.stroke || '#B0B0B0';
  const isActive = data?.active;
  const isDashed = data?.dashed;
  const edgeLabel = data?.label;
  const labelColor = data?.labelColor || '#737373';

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: edgeColor,
          strokeWidth: isActive ? 2.5 : 1.5,
          strokeDasharray: isDashed ? '6 4' : undefined,
          transition: 'stroke-width 0.3s, stroke 0.3s',
        }}
      />
      {isActive && (
        <circle r="4" fill={edgeColor} filter="url(#glow)">
          <animateMotion dur="1.2s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {edgeLabel && (
        <text
          x={labelX}
          y={labelY - 8}
          textAnchor="middle"
          fontSize="10"
          fontStyle="italic"
          fill={labelColor}
        >
          {edgeLabel}
        </text>
      )}
    </>
  );
}

/* ── lane background nodes ── */
function LaneNode({ data }) {
  const { label, dark } = data;
  const p = dark ? palette.dark : palette.light;
  return (
    <div
      className="rounded-lg w-full h-full flex items-start p-3"
      style={{
        background: p.laneBg,
        border: `1px dashed ${p.laneBorder}`,
        pointerEvents: 'none',
      }}
    >
      <span
        className="text-[11px] font-medium tracking-wider uppercase"
        style={{ color: p.laneText }}
      >
        {label}
      </span>
    </div>
  );
}

const nodeTypes = { archNode: ArchNode, laneNode: LaneNode };
const edgeTypes = { animated: AnimatedEdge };

/* ── trace sequence ── */
const READ_TRACE =  ['client', 'lb', 'app', 'redis', 'dynamo'];
const WRITE_TRACE = ['client', 'lb', 'app', 'kgs', 'prekeys'];
const ANALYTICS_TRACE = ['app', 'click', 'kafka', 'bq'];

const TRACE_EDGES = {
  read:      ['e-client-lb', 'e-lb-app', 'e-app-redis', 'e-redis-dynamo'],
  write:     ['e-client-lb', 'e-lb-app', 'e-app-kgs'],
  analytics: ['e-app-click', 'e-click-kafka', 'e-kafka-bq'],
};

/* ── main component ── */
export default function ArchitectureDiagram() {
  const isDark = useDark();
  const p = isDark ? palette.dark : palette.light;
  const [activeTrace, setActiveTrace] = useState('read');
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef(null);

  const traceNodes = activeTrace === 'read' ? READ_TRACE : activeTrace === 'write' ? WRITE_TRACE : ANALYTICS_TRACE;
  const traceEdges = TRACE_EDGES[activeTrace];

  // auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveStep((s) => (s + 1) % traceNodes.length);
    }, 900);
    return () => clearInterval(timerRef.current);
  }, [traceNodes.length]);

  const activeNodeIds = traceNodes.slice(0, activeStep + 1);
  const activeEdgeIds = traceEdges.slice(0, activeStep);

  const makeNode = useCallback((id, x, y, label, variant, opts = {}) => ({
    id,
    type: 'archNode',
    position: { x, y },
    data: {
      label,
      variant,
      dark: isDark,
      active: activeNodeIds.includes(id),
      ...opts,
    },
    draggable: false,
  }), [isDark, activeNodeIds]);

  const makeEdge = useCallback((id, source, target, opts = {}) => ({
    id,
    source,
    target,
    type: 'animated',
    sourceHandle: opts.sourceHandle,
    targetHandle: opts.targetHandle,
    data: {
      active: activeEdgeIds.includes(id),
      dashed: opts.dashed,
      label: opts.label,
      labelColor: opts.labelColor || p.edgeLabel,
    },
    style: { stroke: opts.rust ? p.rust : p.edge },
  }), [isDark, activeEdgeIds, p]);

  const nodes = [
    // lanes
    { id: 'lane-req', type: 'laneNode', position: { x: 0, y: 0 }, data: { label: 'Request Flow', dark: isDark }, draggable: false, style: { width: 700, height: 130 }, selectable: false },
    { id: 'lane-kgs', type: 'laneNode', position: { x: 0, y: 155 }, data: { label: 'Key Generation', dark: isDark }, draggable: false, style: { width: 700, height: 110 }, selectable: false },
    { id: 'lane-ana', type: 'laneNode', position: { x: 0, y: 290 }, data: { label: 'Analytics Pipeline', dark: isDark }, draggable: false, style: { width: 700, height: 110 }, selectable: false },

    // request flow
    makeNode('client', 30, 40, 'Client', 'neutral'),
    makeNode('lb', 170, 40, 'Load Balancer', 'neutral'),
    makeNode('app', 340, 40, 'App Servers', 'accent'),
    makeNode('redis', 500, 30, 'Redis Cache', 'accent', { sub: 'hot URLs', dashed: true }),
    makeNode('dynamo', 500, 80, 'DynamoDB', 'accent'),

    // key generation
    makeNode('kgs', 200, 185, 'Key Gen Service', 'teal'),
    makeNode('prekeys', 400, 185, 'Pre-generated Keys', 'teal'),

    // analytics
    makeNode('click', 170, 320, 'Click Events', 'neutral'),
    makeNode('kafka', 360, 320, 'Kafka', 'accent'),
    makeNode('bq', 530, 320, 'BigQuery', 'accent', { sub: 'warehouse' }),
  ];

  const edges = [
    // request flow
    makeEdge('e-client-lb', 'client', 'lb'),
    makeEdge('e-lb-app', 'lb', 'app'),
    makeEdge('e-app-redis', 'app', 'redis'),
    makeEdge('e-redis-dynamo', 'redis', 'dynamo', { label: 'miss', labelColor: p.rust, rust: true }),

    // app → KGS
    makeEdge('e-app-kgs', 'app', 'kgs', { sourceHandle: 'bottom', targetHandle: 'top', dashed: true }),
    // KGS → prekeys
    makeEdge('e-kgs-prekeys', 'kgs', 'prekeys'),
    // prekeys annotation handled below

    // app → click events
    makeEdge('e-app-click', 'app', 'click', { sourceHandle: 'bottom', targetHandle: 'top', dashed: true, rust: true }),
    makeEdge('e-click-kafka', 'click', 'kafka'),
    makeEdge('e-kafka-bq', 'kafka', 'bq'),
  ];

  const traceLabels = {
    read: 'Read path — cache lookup → DB fallback',
    write: 'Write path — get pre-generated key',
    analytics: 'Analytics — fire-and-forget click events',
  };

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Interactive — trace request flows
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          URL Shortener — High-Level Architecture
        </div>
      </div>

      {/* Trace picker */}
      <div className="px-6 pt-4 flex flex-wrap items-center gap-2">
        {(['read', 'write', 'analytics']).map((t) => (
          <button
            key={t}
            onClick={() => { setActiveTrace(t); setActiveStep(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              activeTrace === t
                ? 'bg-rust-500 text-white border-rust-500 shadow-sm'
                : 'bg-cream-50 dark:bg-night-300 text-ink-600 dark:text-night-800 border-ink-200 dark:border-night-400 hover:border-ink-300 dark:hover:border-night-600'
            }`}
          >
            {t === 'read' ? '📖 Read' : t === 'write' ? '✏️ Write' : '📊 Analytics'}
          </button>
        ))}
        <AnimatePresence mode="wait">
          <motion.span
            key={activeTrace}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            className="text-xs text-ink-500 dark:text-night-700 ml-2"
          >
            {traceLabels[activeTrace]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Flow canvas */}
      <div className="px-4 pb-4 pt-2" style={{ height: 440 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Background
            color={isDark ? '#222' : '#e8e6e1'}
            gap={24}
            size={1}
            style={{ opacity: 0.5 }}
          />
        </ReactFlow>
      </div>

      {/* Step indicator */}
      <div className="px-6 pb-4 flex items-center gap-1.5">
        {traceNodes.map((nodeId, i) => (
          <motion.div
            key={nodeId}
            className="h-1.5 rounded-full flex-1"
            animate={{
              backgroundColor: i <= activeStep
                ? (isDark ? '#D4643A' : '#C4643A')
                : (isDark ? '#2A2A2C' : '#E5E3DE'),
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
