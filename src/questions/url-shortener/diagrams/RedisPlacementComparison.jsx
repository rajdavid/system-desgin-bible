import { X, Check, AlertTriangle } from 'lucide-react';

const options = [
  {
    name: 'Colocated',
    sub: 'Redis on each app VM',
    verdict: 'bad',
    pros: ['Zero network hops', 'Cheap — no separate infra'],
    cons: [
      'Cache fragmented across servers (1/20th effective memory)',
      'Restart = lose cache on that node',
      'Redis competes with app for RAM + CPU',
    ],
    recommendation: 'Only for prototypes. Never production.',
  },
  {
    name: 'Self-hosted cluster',
    sub: 'Redis cluster in same VPC',
    verdict: 'ok',
    pros: [
      'Shared cache pool, high hit rate',
      'Sub-millisecond latency in same AZ',
      'Full config control',
    ],
    cons: [
      'You own failover, upgrades, backups',
      'Need 3–6 nodes with replication',
      'Requires SRE ops bandwidth',
    ],
    recommendation: 'Viable if you have a dedicated SRE team.',
  },
  {
    name: 'Managed Redis',
    sub: 'ElastiCache / MemoryDB / Upstash',
    verdict: 'best',
    pros: [
      'Auto failover, patching, monitoring',
      'Multi-AZ replication out of the box',
      'Saves an engineer\'s time',
    ],
    cons: [
      '2–3× cost of raw EC2+Redis',
      'Fewer config knobs',
      'Vendor lock-in',
    ],
    recommendation: 'Almost always the right production answer.',
  },
];

export default function RedisPlacementComparison() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 not-prose">
      {options.map((o) => (
        <div
          key={o.name}
          className={`rounded-xl border p-5 ${
            o.verdict === 'best'
              ? 'bg-teal-50 dark:bg-[#071A12] border-teal-300 dark:border-[#1A3D2E] ring-1 ring-teal-300 dark:ring-[#1A3D2E]'
              : o.verdict === 'bad'
              ? 'bg-cream-50 dark:bg-night-300 border-ink-200 dark:border-night-400 opacity-80'
              : 'bg-white dark:bg-night-200 border-ink-200 dark:border-night-400'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">{o.name}</div>
              <div className="text-xs text-ink-500 dark:text-night-700">{o.sub}</div>
            </div>
            {o.verdict === 'best' && (
              <div className="text-[10px] font-semibold bg-teal-600 text-white px-2 py-0.5 rounded">
                RECOMMENDED
              </div>
            )}
            {o.verdict === 'bad' && (
              <div className="text-[10px] font-semibold bg-rust-600 text-white px-2 py-0.5 rounded">
                AVOID
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-medium text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1.5">Pros</div>
              <ul className="space-y-1">
                {o.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-ink-700 dark:text-night-800 leading-relaxed">
                    <Check size={11} className="mt-0.5 text-teal-600 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-medium text-rust-700 dark:text-rust-300 uppercase tracking-wider mb-1.5">Cons</div>
              <ul className="space-y-1">
                {o.cons.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-ink-700 dark:text-night-800 leading-relaxed">
                    <X size={11} className="mt-0.5 text-rust-600 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 mt-2 border-t border-ink-100 dark:border-night-400">
              <div className="flex items-start gap-1.5 text-xs italic text-ink-600 dark:text-night-700 leading-relaxed">
                <AlertTriangle size={11} className="mt-0.5 text-ink-500 dark:text-night-700 flex-shrink-0" />
                <span>{o.recommendation}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
