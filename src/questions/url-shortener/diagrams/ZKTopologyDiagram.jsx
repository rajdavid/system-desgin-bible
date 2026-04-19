import useDark from '../../../hooks/useDark';

export default function ZKTopologyDiagram() {
  const isDark = useDark();

  const labelFill = isDark ? '#A0A0A0' : '#737373';
  const textFill = isDark ? '#E4E0D8' : '#2A2A2A';
  const subtextFill = isDark ? '#8A8A8C' : '#595959';
  const arrowStroke = isDark ? '#6A6A6C' : '#9A9A9A';
  const clientBg = isDark ? '#2C2C2E' : '#F5F1E9';
  const clientBorder = isDark ? '#3A3A3C' : '#9A9A9A';
  const tealBg = isDark ? '#071A12' : '#E5F3EE';
  const tealBorder = isDark ? '#2D8B66' : '#2D8B66';
  const tealText = isDark ? '#6EE7B7' : '#145038';
  const accentBg = isDark ? '#1F0E07' : '#FAF0EC';
  const accentBorder = isDark ? '#D4643A' : '#C4643A';
  const accentText = isDark ? '#E8855A' : '#843E1C';
  const rustLabel = isDark ? '#E8855A' : '#C4643A';
  const greenLabel = isDark ? '#6EE7B7' : '#1F6D50';
  const noteBg = isDark ? '#1C1C1E' : '#FBF9F5';
  const noteBorder = isDark ? '#3A3A3C' : '#E5E3DE';
  const dashLine = isDark ? '#D4643A' : '#C4643A';

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 p-6 my-8 not-prose">
      <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-4">
        Where ZooKeeper sits — off the request path
      </div>
      <svg viewBox="0 0 720 420" className="w-full h-auto">
        <defs>
          <marker id="arrGray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke={arrowStroke} strokeWidth="1.5" />
          </marker>
          <marker id="arrRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke={rustLabel} strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Data plane label */}
        <text x="20" y="24" fontSize="11" fill={greenLabel} fontWeight="600">DATA PLANE · every user request</text>

        {/* Data plane row */}
        <rect x="20" y="40" width="80" height="44" rx="6" fill={clientBg} stroke={clientBorder} />
        <text x="60" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill={textFill}>Client</text>

        <line x1="100" y1="62" x2="130" y2="62" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="130" y="40" width="80" height="44" rx="6" fill={tealBg} stroke={tealBorder} />
        <text x="170" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill={tealText}>LB</text>

        <line x1="210" y1="62" x2="240" y2="62" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="240" y="40" width="120" height="44" rx="6" fill={tealBg} stroke={tealBorder} />
        <text x="300" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill={tealText}>App Servers</text>

        <line x1="360" y1="62" x2="390" y2="62" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="390" y="40" width="80" height="44" rx="6" fill={tealBg} stroke={tealBorder} />
        <text x="430" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill={tealText}>Redis</text>

        <line x1="470" y1="62" x2="500" y2="62" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrGray)" />

        <rect x="500" y="40" width="80" height="44" rx="6" fill={tealBg} stroke={tealBorder} />
        <text x="540" y="66" textAnchor="middle" fontSize="13" fontWeight="500" fill={tealText}>DB</text>

        {/* Transition to KGS */}
        <text x="20" y="130" fontSize="11" fill={rustLabel} fontWeight="600">writes also need a shortKey</text>

        <path d="M 300 84 L 300 150" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrGray)" />

        {/* KGS box */}
        <rect x="220" y="150" width="160" height="54" rx="8" fill={tealBg} stroke={tealBorder} />
        <text x="300" y="172" textAnchor="middle" fontSize="13" fontWeight="500" fill={tealText}>KGS workers</text>
        <text x="300" y="190" textAnchor="middle" fontSize="11" fill={tealText} opacity="0.7">serves keys from local range</text>

        {/* Dashed to ZK */}
        <text x="400" y="240" fontSize="11" fill={rustLabel} fontStyle="italic">once per ~17 min</text>
        <path d="M 300 204 L 300 280" stroke={rustLabel} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrRed)" />

        {/* Control plane label */}
        <text x="20" y="268" fontSize="11" fill={rustLabel} fontWeight="600">CONTROL PLANE · off-path, rare traffic</text>

        <line x1="20" y1="252" x2="700" y2="252" stroke={dashLine} strokeDasharray="2 3" opacity="0.4" />

        {/* ZooKeeper cluster */}
        <rect x="180" y="280" width="240" height="90" rx="10" fill={accentBg} stroke={accentBorder} strokeWidth="1.5" />
        <text x="300" y="308" textAnchor="middle" fontSize="14" fontWeight="600" fill={accentText}>ZooKeeper cluster</text>
        <text x="300" y="328" textAnchor="middle" fontSize="11" fill={accentText}>3–5 nodes · separate subnet</text>
        <text x="300" y="344" textAnchor="middle" fontSize="11" fill={accentText}>no public exposure</text>
        <text x="300" y="362" textAnchor="middle" fontSize="11" fill={accentText} fontStyle="italic" opacity="0.8">only KGS workers can reach it</text>

        {/* Right side: annotation */}
        <g transform="translate(450, 280)">
          <rect width="250" height="90" rx="6" fill={noteBg} stroke={noteBorder} />
          <text x="12" y="22" fontSize="11" fontWeight="600" fill={textFill}>Why it's isolated:</text>
          <text x="12" y="40" fontSize="10" fill={subtextFill}>• Consensus writes take 5–10ms</text>
          <text x="12" y="54" fontSize="10" fill={subtextFill}>• Different failure domain</text>
          <text x="12" y="68" fontSize="10" fill={subtextFill}>• Not routable from internet</text>
          <text x="12" y="82" fontSize="10" fill={subtextFill}>• Load: ~3 req/hour per worker</text>
        </g>
      </svg>
    </div>
  );
}
