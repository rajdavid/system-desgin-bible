export default function ZKTopologyDiagram() {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 my-8 not-prose">
      <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-4">
        Where ZooKeeper sits — off the request path
      </div>
      <svg viewBox="0 0 720 420" className="w-full h-auto">
        <defs>
          <marker id="arrGray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke="#9A9A9A" strokeWidth="1.5" />
          </marker>
          <marker id="arrRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke="#C4643A" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Data plane label */}
        <text x="20" y="24" fontSize="11" fill="#1F6D50" fontWeight="600">DATA PLANE · every user request</text>

        {/* Data plane row */}
        <rect x="20" y="40" width="80" height="44" rx="6" fill="#F5F1E9" stroke="#9A9A9A" />
        <text x="60" y="66" textAnchor="middle" fontSize="13" fontWeight="500">Client</text>

        <line x1="100" y1="62" x2="130" y2="62" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="130" y="40" width="80" height="44" rx="6" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="170" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill="#145038">LB</text>

        <line x1="210" y1="62" x2="240" y2="62" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="240" y="40" width="120" height="44" rx="6" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="300" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill="#145038">App Servers</text>

        <line x1="360" y1="62" x2="390" y2="62" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="390" y="40" width="80" height="44" rx="6" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="430" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill="#145038">Redis</text>

        <line x1="470" y1="62" x2="500" y2="62" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="500" y="40" width="80" height="44" rx="6" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="540" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill="#145038">DB</text>

        {/* Transition to KGS */}
        <text x="20" y="130" fontSize="11" fill="#C4643A" fontWeight="600">writes also need a shortKey</text>

        <path d="M 300 84 L 300 150" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrGray)" />

        {/* KGS box */}
        <rect x="220" y="150" width="160" height="54" rx="8" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="300" y="172" textAnchor="middle" fontSize="13" fontWeight="500" fill="#145038">KGS workers</text>
        <text x="300" y="190" textAnchor="middle" fontSize="11" fill="#145038" opacity="0.7">serves keys from local range</text>

        {/* Dashed to ZK */}
        <text x="400" y="240" fontSize="11" fill="#C4643A" fontStyle="italic">once per ~17 min</text>
        <path d="M 300 204 L 300 280" stroke="#C4643A" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrRed)" />

        {/* Control plane label */}
        <text x="20" y="268" fontSize="11" fill="#C4643A" fontWeight="600">CONTROL PLANE · off-path, rare traffic</text>

        <line x1="20" y1="252" x2="700" y2="252" stroke="#C4643A" strokeDasharray="2 3" opacity="0.4" />

        {/* ZooKeeper cluster */}
        <rect x="180" y="280" width="240" height="90" rx="10" fill="#FAF0EC" stroke="#C4643A" strokeWidth="1.5" />
        <text x="300" y="308" textAnchor="middle" fontSize="14" fontWeight="600" fill="#843E1C">ZooKeeper cluster</text>
        <text x="300" y="328" textAnchor="middle" fontSize="11" fill="#843E1C">3–5 nodes · separate subnet</text>
        <text x="300" y="344" textAnchor="middle" fontSize="11" fill="#843E1C">no public exposure</text>
        <text x="300" y="362" textAnchor="middle" fontSize="11" fill="#843E1C" fontStyle="italic" opacity="0.8">only KGS workers can reach it</text>

        {/* Right side: annotation */}
        <g transform="translate(450, 280)">
          <rect width="250" height="90" rx="6" fill="#FBF9F5" stroke="#E5E3DE" />
          <text x="12" y="22" fontSize="11" fontWeight="600" fill="#2A2A2A">Why it's isolated:</text>
          <text x="12" y="40" fontSize="10" fill="#595959">• Consensus writes take 5–10ms</text>
          <text x="12" y="54" fontSize="10" fill="#595959">• Different failure domain</text>
          <text x="12" y="68" fontSize="10" fill="#595959">• Not routable from internet</text>
          <text x="12" y="82" fontSize="10" fill="#595959">• Load: ~3 req/hour per worker</text>
        </g>
      </svg>
    </div>
  );
}
