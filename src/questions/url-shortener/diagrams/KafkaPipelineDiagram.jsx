export default function KafkaPipelineDiagram() {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 my-8 not-prose">
      <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-4">
        Analytics pipeline — decoupled from the redirect hot path
      </div>
      <svg viewBox="0 0 720 340" className="w-full h-auto">
        <defs>
          <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke="#9A9A9A" strokeWidth="1.5" />
          </marker>
          <marker id="arrT" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1 L8 5 L2 9" fill="none" stroke="#2D8B66" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Hot path label */}
        <text x="20" y="22" fontSize="11" fontWeight="600" fill="#1F6D50">HOT PATH — user redirect (must be fast)</text>

        {/* Hot path row */}
        <rect x="20" y="36" width="80" height="44" rx="6" fill="#F5F1E9" stroke="#9A9A9A" />
        <text x="60" y="62" textAnchor="middle" fontSize="13">Client</text>
        <line x1="100" y1="58" x2="130" y2="58" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrA)" />

        <rect x="130" y="36" width="100" height="44" rx="6" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="180" y="62" textAnchor="middle" fontSize="13" fill="#145038" fontWeight="500">App server</text>
        <line x1="230" y1="58" x2="260" y2="58" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrA)" />

        <rect x="260" y="36" width="100" height="44" rx="6" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="310" y="62" textAnchor="middle" fontSize="13" fill="#145038" fontWeight="500">Redis/DB</text>
        <line x1="360" y1="58" x2="390" y2="58" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrA)" />

        <rect x="390" y="36" width="200" height="44" rx="6" fill="#E5F3EE" stroke="#2D8B66" />
        <text x="490" y="56" textAnchor="middle" fontSize="13" fill="#145038" fontWeight="500">302 redirect to long URL</text>
        <text x="490" y="72" textAnchor="middle" fontSize="10" fill="#145038" opacity="0.7">~5ms total</text>

        {/* Fire and forget */}
        <text x="20" y="108" fontSize="11" fontWeight="600" fill="#C4643A">App server also fires a click event — non-blocking, fire-and-forget</text>
        <path d="M 180 80 L 180 130" stroke="#C4643A" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrA)" />
        <text x="195" y="110" fontSize="10" fill="#C4643A" fontStyle="italic">publish</text>

        {/* Kafka */}
        <rect x="100" y="130" width="500" height="64" rx="8" fill="#E5F3EE" stroke="#2D8B66" strokeWidth="1.5" />
        <text x="350" y="152" textAnchor="middle" fontSize="14" fontWeight="600" fill="#145038">Kafka cluster (3+ brokers)</text>
        <text x="350" y="170" textAnchor="middle" fontSize="11" fill="#145038">Topic: url_clicks · partitioned · replicated</text>
        <text x="350" y="186" textAnchor="middle" fontSize="11" fill="#145038" opacity="0.7">buffers millions of events, durable for 7 days</text>

        <line x1="350" y1="194" x2="350" y2="220" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrA)" />

        {/* Consumer */}
        <rect x="200" y="220" width="300" height="44" rx="6" fill="#FAF0EC" stroke="#C4643A" />
        <text x="350" y="240" textAnchor="middle" fontSize="13" fontWeight="600" fill="#843E1C">Analytics consumers</text>
        <text x="350" y="256" textAnchor="middle" fontSize="11" fill="#843E1C" opacity="0.7">parse, enrich, batch into files</text>

        <line x1="350" y1="264" x2="350" y2="290" stroke="#9A9A9A" strokeWidth="1.5" markerEnd="url(#arrA)" />

        {/* BigQuery */}
        <rect x="200" y="290" width="300" height="44" rx="6" fill="#FAF0EC" stroke="#C4643A" />
        <text x="350" y="310" textAnchor="middle" fontSize="13" fontWeight="600" fill="#843E1C">BigQuery / Snowflake</text>
        <text x="350" y="326" textAnchor="middle" fontSize="11" fill="#843E1C" opacity="0.7">columnar warehouse — aggregations, dashboards</text>
      </svg>
    </div>
  );
}
