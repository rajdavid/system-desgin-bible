import { motion } from 'framer-motion';

export default function ArchitectureDiagram() {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 my-8 not-prose">
      <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-4">
        URL Shortener — High-Level Architecture
      </div>
      <svg viewBox="0 0 720 440" className="w-full h-auto">
        <defs>
          <marker id="arr1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke="#9A9A9A" strokeWidth="1.5" strokeLinecap="round" />
          </marker>
          <marker id="arrRust" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke="#C4643A" strokeWidth="1.5" strokeLinecap="round" />
          </marker>
        </defs>

        {/* Lanes */}
        <text x="24" y="32" fontSize="11" fill="#9A9A9A" fontWeight="500" letterSpacing="0.5" style={{ textTransform: 'uppercase' }}>Request flow</text>
        <text x="24" y="218" fontSize="11" fill="#9A9A9A" fontWeight="500" letterSpacing="0.5" style={{ textTransform: 'uppercase' }}>Key generation</text>
        <text x="24" y="346" fontSize="11" fill="#9A9A9A" fontWeight="500" letterSpacing="0.5" style={{ textTransform: 'uppercase' }}>Analytics pipeline</text>

        {/* Lane dividers */}
        <line x1="24" y1="190" x2="696" y2="190" stroke="#E5E3DE" strokeDasharray="3 3" />
        <line x1="24" y1="318" x2="696" y2="318" stroke="#E5E3DE" strokeDasharray="3 3" />

        {/* Row 1 - Request flow */}
        <Node x={50} y={60} w={90} h={50} label="Client" variant="neutral" />
        <Arrow x1={140} y1={85} x2={180} y2={85} />

        <Node x={180} y={60} w={120} h={50} label="Load Balancer" variant="neutral" />
        <Arrow x1={300} y1={85} x2={340} y2={85} />

        <Node x={340} y={60} w={110} h={50} label="App Servers" variant="accent" />
        <Arrow x1={450} y1={85} x2={490} y2={85} />

        <Node x={490} y={60} w={100} h={50} label="Redis Cache" sub="hot URLs" variant="accent" dashed />
        <Arrow x1={590} y1={85} x2={630} y2={85} rust />

        <Node x={630} y={60} w={80} h={50} label="DynamoDB" variant="accent" />
        <text x="610" y="82" fontSize="10" fill="#C4643A" fontStyle="italic">miss</text>

        {/* Row 2 - KGS */}
        <Node x={250} y={240} w={120} h={50} label="Key Gen Service" variant="teal" />
        <Arrow x1={370} y1={265} x2={410} y2={265} />
        <Node x={410} y={240} w={130} h={50} label="Pre-generated Keys" variant="teal" />
        <text x="555" y="267" fontSize="10" fill="#737373">avoids collision</text>

        {/* App server → KGS */}
        <path d="M 395 110 L 395 240" fill="none" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arr1)" strokeDasharray="3 3" />

        {/* Row 3 - Analytics */}
        <Node x={230} y={370} w={120} h={45} label="Click Events" variant="neutral" />
        <Arrow x1={350} y1={392} x2={390} y2={392} />
        <Node x={390} y={370} w={80} h={45} label="Kafka" variant="accent" />
        <Arrow x1={470} y1={392} x2={510} y2={392} />
        <Node x={510} y={370} w={120} h={45} label="BigQuery" sub="warehouse" variant="accent" />

        {/* Click events from app server */}
        <path d="M 395 110 L 395 370" fill="none" stroke="#C4643A" strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}

function Node({ x, y, w, h, label, sub, variant, dashed }) {
  const styles = {
    neutral: { fill: '#FBF9F5', stroke: '#C4C4C4', text: '#2A2A2A' },
    accent: { fill: '#FAF0EC', stroke: '#C4643A', text: '#843E1C' },
    teal: { fill: '#E5F3EE', stroke: '#2D8B66', text: '#145038' },
  };
  const s = styles[variant];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth="1"
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 2 : y + h / 2 + 4}
        textAnchor="middle"
        fontSize="13"
        fontWeight="500"
        fill={s.text}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize="10" fill={s.text} opacity="0.7">
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, rust }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={rust ? '#C4643A' : '#9A9A9A'} strokeWidth="1.5" markerEnd={`url(#${rust ? 'arrRust' : 'arr1'})`} />;
}
