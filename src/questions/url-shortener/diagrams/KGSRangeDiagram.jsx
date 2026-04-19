export default function KGSRangeDiagram() {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 my-8 not-prose">
      <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-4">
        KGS range allocation via ZooKeeper
      </div>
      <svg viewBox="0 0 720 360" className="w-full h-auto">
        <defs>
          <marker id="arrK" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke="#9A9A9A" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* ZK */}
        <rect x="230" y="30" width="260" height="80" rx="10" fill="#FAF0EC" stroke="#C4643A" strokeWidth="1.5" />
        <text x="360" y="58" textAnchor="middle" fontSize="14" fontWeight="600" fill="#843E1C">ZooKeeper cluster</text>
        <text x="360" y="78" textAnchor="middle" fontSize="12" fill="#843E1C" fontFamily="monospace">next_available = 3,000,000</text>
        <text x="360" y="96" textAnchor="middle" fontSize="11" fill="#843E1C" opacity="0.7">atomic compare-and-set · Zab consensus</text>

        {/* Arrows down to workers */}
        <path d="M 280 110 L 140 165" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrK)" strokeDasharray="3 3" />
        <text x="170" y="135" fontSize="11" fill="#737373">claim 1M</text>

        <path d="M 360 110 L 360 165" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrK)" strokeDasharray="3 3" />
        <text x="370" y="140" fontSize="11" fill="#737373">claim 1M</text>

        <path d="M 440 110 L 580 165" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrK)" strokeDasharray="3 3" />
        <text x="500" y="135" fontSize="11" fill="#737373">claim 1M</text>

        {/* Workers */}
        <Worker x={60} name="Worker A" range="[0, 1M)" local="847,231" />
        <Worker x={275} name="Worker B" range="[1M, 2M)" local="1,203,994" />
        <Worker x={495} name="Worker C" range="[2M, 3M)" local="2,501,110" />

        {/* Down arrows */}
        <line x1="140" y1="255" x2="140" y2="290" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrK)" />
        <line x1="360" y1="255" x2="360" y2="290" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrK)" />
        <line x1="580" y1="255" x2="580" y2="290" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrK)" />

        {/* Encoded keys */}
        <rect x="40" y="290" width="640" height="48" rx="8" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="360" y="310" textAnchor="middle" fontSize="12" fontWeight="500" fill="#145038">Encode local counter → Base62 → serve to app servers</text>
        <text x="360" y="328" textAnchor="middle" fontSize="11" fill="#145038" opacity="0.7">no ZooKeeper call per key — amortized across a full range</text>
      </svg>
    </div>
  );
}

function Worker({ x, name, range, local }) {
  return (
    <g>
      <rect x={x} y={165} width={160} height={90} rx={8} fill="#FBF9F5" stroke="#C4643A" />
      <text x={x + 80} y={186} textAnchor="middle" fontSize="13" fontWeight="600" fill="#843E1C">
        {name}
      </text>
      <text x={x + 80} y={206} textAnchor="middle" fontSize="11" fill="#737373">
        Range: <tspan fontFamily="monospace" fill="#2A2A2A" fontWeight="500">{range}</tspan>
      </text>
      <text x={x + 80} y={224} textAnchor="middle" fontSize="11" fill="#737373">
        Local counter:
      </text>
      <text x={x + 80} y={242} textAnchor="middle" fontSize="13" fontFamily="monospace" fontWeight="600" fill="#2A2A2A">
        {local}
      </text>
    </g>
  );
}
