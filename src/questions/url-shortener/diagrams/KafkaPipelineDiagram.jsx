import useDark from '../../../hooks/useDark';

export default function KafkaPipelineDiagram() {
  const isDark = useDark();

  const arrowStroke = isDark ? '#6A6A6C' : '#9A9A9A';
  const tealBg = isDark ? '#071A12' : '#E5F3EE';
  const tealBorder = isDark ? '#2D8B66' : '#2D8B66';
  const tealText = isDark ? '#6EE7B7' : '#145038';
  const accentBg = isDark ? '#1F0E07' : '#FAF0EC';
  const accentBorder = isDark ? '#D4643A' : '#C4643A';
  const accentText = isDark ? '#E8855A' : '#843E1C';
  const clientBg = isDark ? '#2C2C2E' : '#F5F1E9';
  const clientBorder = isDark ? '#3A3A3C' : '#9A9A9A';
  const textFill = isDark ? '#E4E0D8' : '#2A2A2A';
  const greenLabel = isDark ? '#6EE7B7' : '#1F6D50';
  const rustLabel = isDark ? '#E8855A' : '#C4643A';

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 p-6 my-8 not-prose">
      <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-4">
        Analytics pipeline — decoupled from the redirect hot path
      </div>
      <svg viewBox="0 0 720 340" className="w-full h-auto">
        <defs>
          <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke={arrowStroke} strokeWidth="1.5" />
          </marker>
          <marker id="arrT" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke={tealBorder} strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Hot path label */}
        <text x="20" y="22" fontSize="11" fontWeight="600" fill={greenLabel}>HOT PATH — user redirect (must be fast)</text>

        {/* Hot path row */}
        <rect x="20" y="36" width="80" height="44" rx="6" fill={clientBg} stroke={clientBorder} />
        <text x="60" y="62" textAnchor="middle" fontSize="13" fill={textFill}>Client</text>
        <line x1="100" y1="58" x2="130" y2="58" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrA)" />

        <rect x="130" y="36" width="100" height="44" rx="6" fill={tealBg} stroke={tealBorder} />
        <text x="180" y="62" textAnchor="middle" fontSize="13" fill={tealText} fontWeight="500">App server</text>
        <line x1="230" y1="58" x2="260" y2="58" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrA)" />

        <rect x="260" y="36" width="100" height="44" rx="6" fill={tealBg} stroke={tealBorder} />
        <text x="310" y="62" textAnchor="middle" fontSize="13" fill={tealText} fontWeight="500">Redis/DB</text>
        <line x1="360" y1="58" x2="390" y2="58" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrA)" />

        <rect x="390" y="36" width="200" height="44" rx="6" fill={tealBg} stroke={tealBorder} />
        <text x="490" y="56" textAnchor="middle" fontSize="13" fill={tealText} fontWeight="500">302 redirect to long URL</text>
        <text x="490" y="72" textAnchor="middle" fontSize="10" fill={tealText} opacity="0.7">~5ms total</text>

        {/* Fire and forget */}
        <text x="20" y="108" fontSize="11" fontWeight="600" fill={rustLabel}>App server also fires a click event — non-blocking, fire-and-forget</text>
        <path d="M 180 80 L 180 130" stroke={rustLabel} strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrA)" />
        <text x="195" y="110" fontSize="10" fill={rustLabel} fontStyle="italic">publish</text>

        {/* Kafka */}
        <rect x="100" y="130" width="500" height="64" rx="8" fill={tealBg} stroke={tealBorder} strokeWidth="1.5" />
        <text x="350" y="152" textAnchor="middle" fontSize="14" fontWeight="600" fill={tealText}>Kafka cluster (3+ brokers)</text>
        <text x="350" y="170" textAnchor="middle" fontSize="11" fill={tealText}>Topic: url_clicks · partitioned · replicated</text>
        <text x="350" y="186" textAnchor="middle" fontSize="11" fill={tealText} opacity="0.7">buffers millions of events, durable for 7 days</text>

        <line x1="350" y1="194" x2="350" y2="220" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrA)" />

        {/* Consumer */}
        <rect x="200" y="220" width="300" height="44" rx="6" fill={accentBg} stroke={accentBorder} />
        <text x="350" y="240" textAnchor="middle" fontSize="13" fontWeight="600" fill={accentText}>Analytics consumers</text>
        <text x="350" y="256" textAnchor="middle" fontSize="11" fill={accentText} opacity="0.7">parse, enrich, batch into files</text>

        <line x1="350" y1="264" x2="350" y2="290" stroke={arrowStroke} strokeWidth="1.5" markerEnd="url(#arrA)" />

        {/* BigQuery */}
        <rect x="200" y="290" width="300" height="44" rx="6" fill={accentBg} stroke={accentBorder} />
        <text x="350" y="310" textAnchor="middle" fontSize="13" fontWeight="600" fill={accentText}>BigQuery / Snowflake</text>
        <text x="350" y="326" textAnchor="middle" fontSize="11" fill={accentText} opacity="0.7">columnar warehouse — aggregations, dashboards</text>
      </svg>
    </div>
  );
}
