import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

const STEPS = [
  {
    label: 'T0 — Initial state',
    desc: 'Three KGS workers running, each with their claimed range. ZooKeeper holds next_available = 3M.',
    workers: [
      { name: 'A', range: '[0, 1M)', local: '5,000', state: 'alive' },
      { name: 'B', range: '[1M, 2M)', local: '1,900,000', state: 'alive' },
      { name: 'C', range: '[2M, 3M)', local: '2,300,000', state: 'alive' },
    ],
    zk: { value: '3,000,000', version: 7 },
  },
  {
    label: 'T1 — Worker A crashes',
    desc: 'A\'s local counter was at 5,000. That state lived only in A\'s RAM — it\'s now gone. ZK is unaware and doesn\'t need to know.',
    workers: [
      { name: 'A', range: '[0, 1M)', local: 'lost', state: 'dead' },
      { name: 'B', range: '[1M, 2M)', local: '1,999,000', state: 'alive' },
      { name: 'C', range: '[2M, 3M)', local: '2,340,000', state: 'alive' },
    ],
    zk: { value: '3,000,000', version: 7 },
  },
  {
    label: 'T2 — D spawns, B exhausts',
    desc: 'Scheduler notices A is gone and launches replacement Worker D. At nearly the same moment, B finishes its range. Both request a new range from ZK simultaneously.',
    workers: [
      { name: 'A', range: '[0, 1M)', local: 'abandoned', state: 'dead' },
      { name: 'B', range: '[1M, 2M)', local: 'asking ZK', state: 'waiting' },
      { name: 'C', range: '[2M, 3M)', local: '2,380,000', state: 'alive' },
      { name: 'D', range: '(new)', local: 'asking ZK', state: 'waiting' },
    ],
    zk: { value: '3,000,000', version: 7 },
  },
  {
    label: 'T3 — D\'s compare-and-set lands first',
    desc: 'ZK leader serializes the requests. D\'s CAS(3M → 4M, v=7) succeeds. B\'s identical request arrives slightly later and fails because the version is now 8.',
    workers: [
      { name: 'A', range: '[0, 1M)', local: 'abandoned', state: 'dead' },
      { name: 'B', range: 'CAS FAILED', local: 'retrying', state: 'retry' },
      { name: 'C', range: '[2M, 3M)', local: '2,400,000', state: 'alive' },
      { name: 'D', range: '[3M, 4M)', local: '0', state: 'alive' },
    ],
    zk: { value: '4,000,000', version: 8 },
  },
  {
    label: 'T4 — B retries, succeeds',
    desc: 'B reads the updated value (4M, v=8) and does CAS(4M → 5M, v=8). No contention this time — succeeds cleanly.',
    workers: [
      { name: 'A', range: '[0, 1M)', local: 'abandoned', state: 'dead' },
      { name: 'B', range: '[4M, 5M)', local: '0', state: 'alive' },
      { name: 'C', range: '[2M, 3M)', local: '2,420,000', state: 'alive' },
      { name: 'D', range: '[3M, 4M)', local: '1,000', state: 'alive' },
    ],
    zk: { value: '5,000,000', version: 9 },
  },
  {
    label: 'T5 — Final state',
    desc: 'Zero collisions. A\'s 995K unused keys in [5001, 1M) are abandoned forever — acceptable given the 3.5 trillion key space. Every live worker owns a distinct, non-overlapping range.',
    workers: [
      { name: 'A', range: '[0, 1M)', local: 'lost 995K keys', state: 'dead' },
      { name: 'B', range: '[4M, 5M)', local: '1,200', state: 'alive' },
      { name: 'C', range: '[2M, 3M)', local: '2,440,000', state: 'alive' },
      { name: 'D', range: '[3M, 4M)', local: '2,400', state: 'alive' },
    ],
    zk: { value: '5,000,000', version: 9 },
  },
];

export default function CrashRecoveryTimeline() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 2500);
    return () => clearInterval(id);
  }, [playing]);

  const current = STEPS[step];

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Interactive timeline — press play
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Crash recovery + concurrent claim
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="p-2 rounded hover:bg-cream-200 dark:hover:bg-night-400 disabled:opacity-40 transition text-ink-700 dark:text-night-800"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={() => {
              if (step >= STEPS.length - 1) setStep(0);
              setPlaying(!playing);
            }}
            className="flex items-center gap-1.5 bg-rust-500 hover:bg-rust-600 text-white px-3 py-1.5 rounded text-sm font-medium transition"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pause' : step >= STEPS.length - 1 ? 'Replay' : 'Play'}
          </button>
          <button
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            disabled={step === STEPS.length - 1}
            className="p-2 rounded hover:bg-cream-200 dark:hover:bg-night-400 disabled:opacity-40 transition text-ink-700 dark:text-night-800"
          >
            <SkipForward size={16} />
          </button>
          <button
            onClick={() => {
              setStep(0);
              setPlaying(false);
            }}
            className="p-2 rounded hover:bg-cream-200 dark:hover:bg-night-400 transition text-ink-700 dark:text-night-800"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 pt-4">
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? 'bg-rust-500' : 'bg-ink-200 dark:bg-night-400'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-mono text-ink-500 dark:text-night-700">
          {STEPS.map((s, i) => (
            <span key={i} className={i === step ? 'text-rust-600 dark:text-rust-300 font-semibold' : ''}>
              T{i}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Label and description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-5"
          >
            <div className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-2">{current.label}</div>
            <div className="text-sm text-ink-700 dark:text-night-800 leading-relaxed">{current.desc}</div>
          </motion.div>
        </AnimatePresence>

        {/* State grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
          {/* Workers */}
          <div>
            <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">
              KGS Workers
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {current.workers.map((w) => (
                  <motion.div
                    key={w.name}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className={`rounded-lg border p-3 flex items-center gap-3 ${workerStyles(w.state)}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-semibold ${workerBadge(w.state)}`}>
                      {w.name}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-medium">Range: {w.range}</div>
                      <div className="text-xs opacity-75 font-mono">local counter: {w.local}</div>
                    </div>
                    <div className={`text-xs font-medium uppercase tracking-wide ${workerStateColor(w.state)}`}>
                      {w.state}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ZK */}
          <div className="md:w-56">
            <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">
              ZooKeeper State
            </div>
            <div className="bg-rust-50 dark:bg-[#1F0E07] border border-rust-200 dark:border-[#3D2012] rounded-lg p-4">
              <div className="text-xs text-rust-600 dark:text-rust-300 mb-1">/kgs/next_available</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.zk.value}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="font-mono text-xl font-semibold text-rust-700 dark:text-rust-300 tabular-nums"
                >
                  {current.zk.value}
                </motion.div>
              </AnimatePresence>
              <div className="text-[10px] text-rust-600 dark:text-rust-300 mt-2 font-mono">
                version = {current.zk.version}
              </div>
              <div className="mt-3 pt-3 border-t border-rust-200 dark:border-[#3D2012] text-[11px] text-ink-600 dark:text-night-700 leading-relaxed">
                Replicated across 3 ZK nodes. Every write needs majority ack.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function workerStyles(state) {
  return {
    alive: 'bg-teal-50 dark:bg-[#071A12] border-teal-200 dark:border-[#1A3D2E] text-teal-900 dark:text-teal-300',
    dead: 'bg-ink-100 dark:bg-night-300 border-ink-200 dark:border-night-400 text-ink-500 dark:text-night-600 opacity-75',
    waiting: 'bg-amber-50 dark:bg-[#1A1400] border-amber-200 dark:border-[#3D3000] text-amber-900 dark:text-amber-300',
    retry: 'bg-rust-50 dark:bg-[#1F0E07] border-rust-200 dark:border-[#3D2012] text-rust-900 dark:text-rust-300',
  }[state];
}

function workerBadge(state) {
  return {
    alive: 'bg-teal-500 text-white',
    dead: 'bg-ink-300 dark:bg-night-500 text-ink-500 dark:text-night-700',
    waiting: 'bg-amber-500 text-white',
    retry: 'bg-rust-500 text-white',
  }[state];
}

function workerStateColor(state) {
  return {
    alive: 'text-teal-600 dark:text-teal-400',
    dead: 'text-ink-400 dark:text-night-600',
    waiting: 'text-amber-600 dark:text-amber-400',
    retry: 'text-rust-600 dark:text-rust-300',
  }[state];
}
