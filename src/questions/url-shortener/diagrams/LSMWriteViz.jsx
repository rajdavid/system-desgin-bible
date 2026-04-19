import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

export default function LSMWriteViz() {
  const [writes, setWrites] = useState([]);
  const [running, setRunning] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCounter((c) => c + 1);
      setWrites((prev) => {
        const newWrite = { id: Date.now() + Math.random(), key: `key${Math.floor(Math.random() * 9000) + 1000}` };
        const next = [...prev, newWrite];
        return next.slice(-6);
      });
    }, 700);
    return () => clearInterval(id);
  }, [running]);

  const simulate = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 6000);
  };

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Animated — click to simulate writes
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            LSM-tree write path — no locks, no blocking
          </div>
        </div>
        <button
          onClick={simulate}
          disabled={running}
          className="flex items-center gap-1.5 bg-rust-500 hover:bg-rust-600 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm font-medium transition"
        >
          <Play size={14} />
          {running ? 'Running…' : 'Simulate'}
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Incoming writes */}
        <div className="border border-ink-200 dark:border-night-400 rounded-lg bg-cream-50 dark:bg-night-300 p-4">
          <div className="text-xs text-ink-500 dark:text-night-700 uppercase tracking-wider mb-3">1. Client writes arriving</div>
          <div className="flex gap-2 flex-wrap min-h-[40px]">
            <AnimatePresence>
              {writes.map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white dark:bg-night-200 border border-ink-300 dark:border-night-400 font-mono text-xs px-2 py-1 rounded text-ink-900 dark:text-night-900"
                >
                  PUT {w.key}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Step 2 - WAL */}
        <div className="border border-rust-200 dark:border-[#3D2012] bg-rust-50 dark:bg-[#1F0E07] rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs text-rust-600 dark:text-rust-300 uppercase tracking-wider font-medium">2. Append to WAL (disk)</div>
            <div className="text-[10px] text-ink-500 dark:text-night-700 font-mono">~microseconds</div>
          </div>
          <div className="font-mono text-xs bg-ink-900 text-cream-100 rounded p-2 overflow-x-auto">
            {running && writes.length > 0 ? (
              <>
                {writes.map((w, i) => (
                  <div key={w.id} className="opacity-70">
                    [{String(counter - writes.length + i + 1).padStart(8, '0')}] WRITE {w.key} → append
                  </div>
                ))}
              </>
            ) : (
              <div className="text-ink-500 italic">// press simulate to see appends…</div>
            )}
          </div>
          <div className="text-[11px] text-ink-600 dark:text-night-700 mt-2">
            Sequential file append — no seeking, no locks. fsync'd before ack.
          </div>
        </div>

        {/* Step 3 - Memtable */}
        <div className="border border-teal-200 dark:border-[#1A3D2E] bg-teal-50 dark:bg-[#071A12] rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs text-teal-700 dark:text-teal-400 uppercase tracking-wider font-medium">3. Insert into memtable (RAM)</div>
            <div className="text-[10px] text-ink-500 dark:text-night-700 font-mono">in-memory sorted map</div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 min-h-[36px]">
            <AnimatePresence>
              {writes.map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-night-200 border border-teal-300 dark:border-[#1A3D2E] font-mono text-[10px] px-2 py-1 rounded text-center truncate text-ink-900 dark:text-night-900"
                >
                  {w.key}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="text-[11px] text-ink-600 dark:text-night-700 mt-2">
            Ack returned to client here. No disk round-trip on the hot path.
          </div>
        </div>

        {/* Step 4 - Flush */}
        <div className="border border-ink-200 dark:border-night-400 bg-white dark:bg-night-200 rounded-lg p-4 opacity-70">
          <div className="text-xs text-ink-500 dark:text-night-700 uppercase tracking-wider mb-2">4. Background flush to SSTable</div>
          <div className="text-[11px] text-ink-500 dark:text-night-700">
            Eventually (when memtable fills), flushed asynchronously to disk as an immutable sorted file.
            Compaction runs in the background. Never blocks writes.
          </div>
        </div>
      </div>
    </div>
  );
}
