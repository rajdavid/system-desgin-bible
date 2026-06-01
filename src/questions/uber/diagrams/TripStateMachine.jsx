import { motion } from 'framer-motion';

/**
 * Animated 6-state trip lifecycle.
 * Dots light up sequentially; a gradient sweep fills the connecting line left → right
 * on a 6-second loop, then resets.
 */

const STATES = [
  { id: 'REQUESTED',    desc: 'Rider taps "request"' },
  { id: 'MATCHED',      desc: 'Driver accepts offer' },
  { id: 'EN_ROUTE',     desc: 'Driver heading to pickup' },
  { id: 'ARRIVED',      desc: 'Driver at pickup point' },
  { id: 'IN_TRIP',      desc: 'Rider on board' },
  { id: 'COMPLETED',    desc: 'Drop-off + fare locked' },
];

const TOTAL = 6; // seconds per full cycle

export default function TripStateMachine() {
  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4">
        <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
          Trip FSM — pinned to one worker per trip_id (consistent hash)
        </div>
        <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
          Strict state machine, append-only event log
        </div>
      </div>

      <div className="px-6 pt-10 pb-6 relative">
        {/* Line — gradient that sweeps from right (unfilled) to left (filled) */}
        <div className="absolute left-12 right-12 top-[58px] h-[3px] bg-ink-200 dark:bg-night-400 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6c5ce7, #a29bfe, #00cec9)' }}
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%', '100%'] }}
            transition={{
              duration: TOTAL,
              times: [0, 0.85, 1],
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="grid grid-cols-6 gap-1 relative">
          {STATES.map((s, i) => {
            const lightUpAt = (i / (STATES.length - 1)) * (TOTAL * 0.85);
            return (
              <div key={s.id} className="flex flex-col items-center text-center">
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-ink-300 dark:border-night-500 bg-white dark:bg-night-200 relative z-10"
                  animate={{
                    backgroundColor: ['#ffffff00', '#6c5ce7', '#6c5ce7'],
                    borderColor: ['#c4c4c4', '#a29bfe', '#a29bfe'],
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      '0 0 0px transparent',
                      '0 0 12px #6c5ce7',
                      '0 0 6px #6c5ce7',
                    ],
                  }}
                  transition={{
                    duration: TOTAL,
                    times: [Math.max(0, lightUpAt / TOTAL - 0.02), lightUpAt / TOTAL, 1],
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-ink-700 dark:text-night-800">
                  {s.id}
                </div>
                <div className="mt-1 text-[10.5px] text-ink-500 dark:text-night-700 leading-snug">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-3 bg-cream-50 dark:bg-night-300 border-t border-ink-200 dark:border-night-400 text-xs text-ink-500 dark:text-night-700">
        Branches not shown: <span className="font-mono">REQUESTED → CANCELED</span>, <span className="font-mono">MATCHED → CANCELED</span>, driver no-show retry.
      </div>
    </div>
  );
}
