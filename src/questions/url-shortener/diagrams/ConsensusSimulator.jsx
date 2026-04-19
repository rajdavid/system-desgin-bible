import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function ConsensusSimulator() {
  const [clusterSize, setClusterSize] = useState(3);
  const [killed, setKilled] = useState(new Set());

  const alive = clusterSize - killed.size;
  const quorum = Math.floor(clusterSize / 2) + 1;
  const hasQuorum = alive >= quorum;

  const reset = () => setKilled(new Set());

  const toggleNode = (i) => {
    setKilled((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const setSize = (n) => {
    setClusterSize(n);
    setKilled(new Set());
  };

  return (
    <div className="bg-white dark:bg-night-200 rounded-xl border border-ink-200 dark:border-night-400 overflow-hidden my-8 not-prose">
      <div className="bg-cream-100 dark:bg-night-300 border-b border-ink-200 dark:border-night-400 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-ink-500 dark:text-night-700 uppercase tracking-wider mb-1">
            Interactive — click nodes to kill them
          </div>
          <div className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">
            Why consensus needs 3 or 5 nodes, never 2 or 4
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="p-6">
        {/* Cluster size picker */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm text-ink-600 dark:text-night-700">Cluster size:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition border ${
                clusterSize === n
                  ? 'bg-rust-500 text-white border-rust-500'
                  : 'bg-white dark:bg-night-200 text-ink-700 dark:text-night-800 border-ink-200 dark:border-night-400 hover:border-ink-300 dark:hover:border-night-600'
              }`}
            >
              {n} {n === 1 ? 'node' : 'nodes'}
            </button>
          ))}
        </div>

        {/* Nodes */}
        <div className="bg-cream-50 dark:bg-night-300 rounded-lg border border-ink-200 dark:border-night-400 p-6 mb-5">
          <div className="flex justify-center items-center gap-4 flex-wrap min-h-[140px]">
            {Array.from({ length: clusterSize }).map((_, i) => {
              const isDead = killed.has(i);
              return (
                <motion.button
                  key={i}
                  onClick={() => toggleNode(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    opacity: isDead ? 0.4 : 1,
                    rotate: isDead ? -8 : 0,
                  }}
                  className={`relative w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-colors ${
                    isDead
                      ? 'bg-ink-200 dark:bg-night-400 border-ink-300 dark:border-night-500'
                      : 'bg-teal-50 dark:bg-[#071A12] border-teal-500 shadow-sm'
                  }`}
                >
                  {isDead ? (
                    <Skull size={24} className="text-ink-500 dark:text-night-600 mb-1" />
                  ) : (
                    <CheckCircle2 size={24} className="text-teal-600 dark:text-teal-400 mb-1" />
                  )}
                  <div className="text-xs font-mono font-medium text-ink-700 dark:text-night-800">ZK{i + 1}</div>
                  <div className="text-[10px] text-ink-500 dark:text-night-700">{isDead ? 'dead' : 'alive'}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <StatusBox label="Alive" value={`${alive} / ${clusterSize}`} />
          <StatusBox label="Majority needed" value={quorum} />
          <StatusBox
            label="Quorum status"
            value={hasQuorum ? 'Reached' : 'LOST'}
            ok={hasQuorum}
            bad={!hasQuorum}
          />
        </div>

        {/* Verdict banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={hasQuorum ? 'ok' : 'fail'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`rounded-lg p-4 flex items-start gap-3 border ${
              hasQuorum
                ? 'bg-teal-50 dark:bg-[#071A12] border-teal-200 dark:border-[#1A3D2E] text-teal-800 dark:text-teal-300'
                : 'bg-rust-50 dark:bg-[#1F0E07] border-rust-200 dark:border-[#3D2012] text-rust-800 dark:text-rust-300'
            }`}
          >
            {hasQuorum ? (
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle size={18} className="mt-0.5 flex-shrink-0" />
            )}
            <div className="text-sm leading-relaxed">
              {getVerdict(clusterSize, alive, killed.size, hasQuorum)}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Take-aways */}
        <div className="mt-6 pt-6 border-t border-ink-100 dark:border-night-400 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="text-ink-700 dark:text-night-800">
            <strong className="text-ink-900 dark:text-night-900">Try this:</strong> pick 4 nodes and kill one. Pick 3 nodes and kill one.
            Both tolerate exactly 1 failure. 4 costs more with no extra benefit.
          </div>
          <div className="text-ink-700 dark:text-night-800">
            <strong className="text-ink-900 dark:text-night-900">Rule:</strong> odd numbers only. 2N+1 nodes tolerate N failures.
            3 → 1 failure, 5 → 2 failures, 7 → 3 failures.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBox({ label, value, ok, bad }) {
  return (
    <div
      className={`rounded-lg p-3 border ${
        bad
          ? 'bg-rust-50 dark:bg-[#1F0E07] border-rust-200 dark:border-[#3D2012]'
          : ok
          ? 'bg-teal-50 dark:bg-[#071A12] border-teal-200 dark:border-[#1A3D2E]'
          : 'bg-cream-50 dark:bg-night-200 border-ink-200 dark:border-night-400'
      }`}
    >
      <div className="text-xs text-ink-500 dark:text-night-700 mb-0.5">{label}</div>
      <div
        className={`font-serif text-xl font-semibold ${
          bad ? 'text-rust-700 dark:text-rust-300' : ok ? 'text-teal-700 dark:text-teal-400' : 'text-ink-900 dark:text-night-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function getVerdict(size, alive, killed, hasQuorum) {
  if (size === 1) {
    return alive === 1
      ? 'Single node cluster — "works" when up but has no redundancy. One crash = total outage. Strictly worse than having no coordinator. Never run ZK this way.'
      : 'Single node down = entire coordination layer gone. Every KGS worker stalls when it runs out of range.';
  }
  if (size === 2) {
    return hasQuorum
      ? 'Both nodes alive — temporarily fine, but if either dies you lose quorum. 2-node clusters tolerate ZERO failures. This is strictly worse than 1 node from an availability standpoint.'
      : 'Quorum lost. 2-node clusters need both nodes alive — a single failure takes the whole thing down.';
  }
  if (size === 4) {
    if (killed === 0) return 'All 4 alive. But majority is 3-of-4 — same as 3-of-3. You\'re paying for an extra node and getting nothing.';
    if (killed === 1) return '3 of 4 alive → quorum holds. Same resilience as a 3-node cluster. You paid for an extra node that doesn\'t improve fault tolerance.';
    return 'Below quorum. Notice: 4 nodes tolerate the same number of failures as 3 nodes. Always pick odd numbers.';
  }
  if (hasQuorum) {
    if (killed === 0) return `All ${size} alive. Cluster healthy. Any write requires ack from at least ${Math.floor(size / 2) + 1} nodes before returning to the client.`;
    return `${alive} of ${size} alive → majority quorum holds. Writes continue normally. When the dead node${killed > 1 ? 's' : ''} recover, they catch up from the others.`;
  }
  return `Only ${alive} alive — below the ${Math.floor(size / 2) + 1}-node majority. ZK goes read-only: workers can\'t claim new ranges. Availability is lost, but no split-brain possible.`;
}
