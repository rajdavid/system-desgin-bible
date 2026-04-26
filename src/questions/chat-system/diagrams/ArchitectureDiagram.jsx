import { useState, useEffect, useCallback } from 'react';
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

const palette = {
  light: {
    neutral: { bg: '#FBF9F5', border: '#C4C4C4', text: '#2A2A2A' },
    accent:  { bg: '#F0F4FF', border: '#4A6CF7', text: '#1E3DB5' },
    teal:    { bg: '#E5F3EE', border: '#2D8B66', text: '#145038' },
    warn:    { bg: '#FFF7ED', border: '#D97706', text: '#92400E' },
    purple:  { bg: '#F5F3FF', border: '#7C3AED', text: '#4C1D95' },
    edge: '#B0B0B0', edgeLabel: '#737373',
    flowBg: '#FAFAF8',
  },
  dark: {
    neutral: { bg: '#1C1C1E', border: '#3A3A3C', text: '#E4E0D8' },
    accent:  { bg: '#0A1229', border: '#4A6CF7', text: '#93B4FF' },
    teal:    { bg: '#071A12', border: '#2D8B66', text: '#6EE7B7' },
    warn:    { bg: '#1A0E00', border: '#D97706', text: '#FCD34D' },
    purple:  { bg: '#13051D', border: '#7C3AED', text: '#C4B5FD' },
    edge: '#4A4A4C', edgeLabel: '#888',
    flowBg: '#111113',
  },
};

function ChatNode({ data }) {
  const { label, sub, variant = 'neutral', active, dark } = data;
  const p = dark ? palette.dark : palette.light;
  const s = p[variant] || p.neutral;
  return (
    <div
      className="relative px-3 py-2.5 rounded-lg text-center transition-all duration-300"
      style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        boxShadow: active ? `0 0 16px ${s.border}40, 0 0 4px ${s.border}60` : '0 1px 3px rgba(0,0,0,0.08)',
        transform: active ? 'scale(1.05)' : 'scale(1)',
        minWidth: 88,
      }}
    >
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle id="top"    type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1 }} />
      <div className="font-medium text-[12px] leading-tight" style={{ color: s.text }}>{label}</div>
      {sub && <div className="text-[10px] mt-0.5 opacity-70" style={{ color: s.text }}>{sub}</div>}
      {active && (
        <motion.div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
          style={{ background: s.border }}
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      )}
    </div>
  );
}

function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style }) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const color = style?.stroke || '#B0B0B0';
  const isActive = data?.active;
  return (
    <>
      <defs>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <BaseEdge id={id} path={path} style={{ stroke: color, strokeWidth: isActive ? 2.5 : 1.5, transition: 'all 0.3s' }} />
      {isActive && (
        <circle r="4" fill={color} filter={`url(#glow-${id})`}>
          <animateMotion dur="1.4s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {data?.label && (
        <text className="text-[10px]" fill={data.labelColor || '#888'} textAnchor="middle">
          <textPath href={`#${id}`} startOffset="50%">{data.label}</textPath>
        </text>
      )}
    </>
  );
}

const nodeTypes = { chat: ChatNode };
const edgeTypes = { animated: AnimatedEdge };

/* ── Step definitions for the animation walkthrough ── */
const STEPS = [
  {
    label: 'Overview',
    desc: 'Six-layer architecture: Edge → Chat Servers → Connection Manager → Message Pipeline → Persistence → Push',
    active: [],
  },
  {
    label: 'Client connects',
    desc: 'Client upgrades HTTP → WebSocket via TLS termination at the edge layer. Chat Server A holds the live socket.',
    active: ['n0', 'n1', 'e0'],
  },
  {
    label: 'Register connection',
    desc: 'Chat Server A writes userId→serverId into the Connection Manager (Redis cluster). Now any server can find where a user is.',
    active: ['n1', 'n2', 'e1'],
  },
  {
    label: 'Send message',
    desc: 'User A sends a WS frame. Chat Server A validates session, generates clientMsgId, publishes to Kafka.',
    active: ['n0', 'n1', 'n3', 'e0', 'e2'],
  },
  {
    label: 'Persist to Cassandra',
    desc: 'Message Service reads from Kafka, writes one row to Cassandra partitioned by (chatId, bucket). Durable.',
    active: ['n3', 'n4', 'n5', 'e3', 'e4'],
  },
  {
    label: 'Route to receiver',
    desc: 'Router looks up User B in Connection Manager → finds Chat Server B → delivers via Redis pub/sub channel.',
    active: ['n3', 'n2', 'n6', 'e5', 'e6'],
  },
  {
    label: 'Offline delivery',
    desc: 'If User B is offline: message goes to offline-deliveries Kafka topic → APNS/FCM push notification.',
    active: ['n3', 'n7', 'n8', 'e7', 'e8'],
  },
];

const buildGraph = (dark, activeIds) => {
  const p = dark ? palette.dark : palette.light;
  const isActive = (id) => activeIds.includes(id);

  const nodes = [
    { id: 'n0', type: 'chat', position: { x: 0,   y: 110 }, data: { label: 'Client A', sub: 'WebSocket', variant: 'neutral', dark, active: isActive('n0') } },
    { id: 'n1', type: 'chat', position: { x: 170, y: 110 }, data: { label: 'Chat Server A', sub: 'stateful WS', variant: 'accent', dark, active: isActive('n1') } },
    { id: 'n2', type: 'chat', position: { x: 340, y: 20  }, data: { label: 'Conn Manager', sub: 'Redis userId→srv', variant: 'warn', dark, active: isActive('n2') } },
    { id: 'n3', type: 'chat', position: { x: 340, y: 110 }, data: { label: 'Kafka', sub: 'chat-messages', variant: 'purple', dark, active: isActive('n3') } },
    { id: 'n4', type: 'chat', position: { x: 340, y: 200 }, data: { label: 'Message Svc', sub: 'stateless', variant: 'neutral', dark, active: isActive('n4') } },
    { id: 'n5', type: 'chat', position: { x: 510, y: 200 }, data: { label: 'Cassandra', sub: '(chatId, bucket)', variant: 'teal', dark, active: isActive('n5') } },
    { id: 'n6', type: 'chat', position: { x: 510, y: 110 }, data: { label: 'Chat Server B', sub: 'receiver WS', variant: 'accent', dark, active: isActive('n6') } },
    { id: 'n7', type: 'chat', position: { x: 510, y: 20  }, data: { label: 'Offline Queue', sub: 'Kafka topic', variant: 'purple', dark, active: isActive('n7') } },
    { id: 'n8', type: 'chat', position: { x: 680, y: 20  }, data: { label: 'APNS / FCM', sub: 'push notify', variant: 'warn', dark, active: isActive('n8') } },
    { id: 'n9', type: 'chat', position: { x: 680, y: 110 }, data: { label: 'Client B', sub: 'WebSocket', variant: 'neutral', dark, active: isActive('n6') } },
  ];

  const mk = (id, src, tgt, label, opts = {}) => ({
    id, source: src, target: tgt, type: 'animated',
    data: { label, active: isActive(id), labelColor: p.edgeLabel, ...opts },
    style: { stroke: isActive(id) ? p.accent.border : p.edge },
  });

  const edges = [
    mk('e0', 'n0', 'n1', 'WS'),
    mk('e1', 'n1', 'n2', 'register'),
    mk('e2', 'n1', 'n3', 'publish'),
    mk('e3', 'n3', 'n4', 'consume'),
    mk('e4', 'n4', 'n5', 'INSERT'),
    mk('e5', 'n3', 'n2', 'lookup'),
    mk('e6', 'n3', 'n6', 'pub/sub', { targetHandle: 'left' }),
    mk('e7', 'n3', 'n7', 'offline'),
    mk('e8', 'n7', 'n8', 'push'),
    mk('e9', 'n6', 'n9', 'WS deliver'),
  ];

  return { nodes, edges };
};

export default function ChatArchitectureDiagram() {
  const dark = useDark();
  const [step, setStep]   = useState(0);
  const [playing, setPlaying] = useState(false);

  const { nodes: initNodes, edges: initEdges } = buildGraph(dark, STEPS[step].active);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(dark, STEPS[step].active);
    setNodes(n);
    setEdges(e);
  }, [step, dark]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 2200);
    return () => clearInterval(t);
  }, [playing]);

  const p = dark ? palette.dark : palette.light;

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      {/* Header */}
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">Interactive walkthrough</div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">Chat System — Six-Layer Architecture</div>
        </div>
        <button
          onClick={() => { setStep(0); setPlaying(true); }}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
        >
          {playing ? 'Playing…' : '▶ Auto-play'}
        </button>
      </div>

      {/* Step selector */}
      <div className="flex gap-1 px-6 pt-4 flex-wrap">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setPlaying(false); setStep(i); }}
            className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
              step === i
                ? 'bg-blue-600 text-white'
                : 'bg-cream-100 dark:bg-night-300 text-ink-600 dark:text-night-700 hover:bg-ink-200 dark:hover:bg-night-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mx-6 mt-3 mb-2 text-sm text-ink-700 dark:text-night-700 bg-blue-50 dark:bg-[#0A1229] border border-blue-200 dark:border-blue-900/40 rounded-lg px-4 py-3"
        >
          {STEPS[step].desc}
        </motion.div>
      </AnimatePresence>

      {/* React Flow diagram */}
      <div style={{ height: 300 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          zoomOnScroll={false}
          panOnScroll={false}
          panOnDrag={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color={p.edge} gap={24} size={1} style={{ opacity: 0.4 }} />
        </ReactFlow>
      </div>
    </div>
  );
}
