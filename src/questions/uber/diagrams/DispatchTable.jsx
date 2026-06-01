import { motion } from 'framer-motion';

/**
 * Animated dispatch scoring table.
 * Each row enters staggered; the winning row pulses green every cycle.
 */

const ROWS = [
  { id: 'D-1024', eta: '2.1 min', rating: '4.9', pAccept: '0.88', score: '0.92', win: true },
  { id: 'D-3318', eta: '2.4 min', rating: '4.7', pAccept: '0.71', score: '0.74', win: false },
  { id: 'D-7705', eta: '3.0 min', rating: '4.8', pAccept: '0.65', score: '0.66', win: false },
  { id: 'D-2210', eta: '3.4 min', rating: '4.6', pAccept: '0.55', score: '0.51', win: false },
];

export default function DispatchTable() {
  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Batched assignment — score = f(ETA, P(accept), rating, fairness)
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          Dispatcher picks the highest-scoring driver — not the closest
        </div>
      </div>

      <div className="px-2 py-3">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-left text-[11px] text-rust-500 dark:text-[#D4724A] uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Driver</th>
              <th className="px-4 py-2 font-medium">ETA</th>
              <th className="px-4 py-2 font-medium">Rating</th>
              <th className="px-4 py-2 font-medium">P(accept)</th>
              <th className="px-4 py-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-night-400">
            {ROWS.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                animate={
                  r.win
                    ? { backgroundColor: ['rgba(0,184,148,0)', 'rgba(0,184,148,0.10)', 'rgba(0,184,148,0)'] }
                    : {}
                }
                {...(r.win && { transition: { backgroundColor: { duration: 4, repeat: Infinity, ease: 'easeInOut' } } })}
                className={r.win ? 'text-teal-700 dark:text-teal-400' : 'text-ink-800 dark:text-night-800'}
              >
                <td className="px-4 py-2.5 font-medium">{r.id}</td>
                <td className="px-4 py-2.5">{r.eta}</td>
                <td className="px-4 py-2.5">{r.rating}</td>
                <td className="px-4 py-2.5">{r.pAccept}</td>
                <td className="px-4 py-2.5 font-semibold">
                  {r.score}
                  {r.win && <span className="ml-2 text-xs">← offer sent</span>}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-cream-50 dark:bg-night-300 border-t border-ink-200 dark:border-night-400 text-xs text-ink-500 dark:text-night-700 font-mono">
        score = w₁·(−ETA) + w₂·P(accept) + w₃·driver_idle_time − w₄·rider_wait
      </div>
    </div>
  );
}
