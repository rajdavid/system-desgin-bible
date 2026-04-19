import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { questions, BUCKETS } from '../data/questions';
import { useXP } from '../hooks/useXP';
import { useStreak } from '../hooks/useStreak';
import { ArrowRight, ArrowLeft, Clock, Play, RotateCcw, CheckCircle2, Zap } from 'lucide-react';

const DURATIONS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MockInterview() {
  const [phase, setPhase] = useState('setup'); // setup | running | done
  const [bucketFilter, setBucketFilter] = useState(0); // 0 = all
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [diffFilter, setDiffFilter] = useState('all');
  const [pool, setPool] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answered, setAnswered] = useState(0);
  const timerRef = useRef(null);
  const { addXP, XP_REWARDS } = useXP();
  const { recordActivity } = useStreak();

  const startInterview = useCallback(() => {
    let filtered = questions;
    if (bucketFilter > 0) filtered = filtered.filter((q) => q.bucket === bucketFilter);
    if (diffFilter !== 'all') filtered = filtered.filter((q) => q.difficulty === diffFilter);
    if (filtered.length === 0) return;
    setPool(shuffle(filtered));
    setCurrentIdx(0);
    setTimeLeft(duration.seconds);
    setShowAnswer(false);
    setAnswered(0);
    setPhase('running');
  }, [bucketFilter, diffFilter, duration]);

  useEffect(() => {
    if (phase !== 'running') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function nextQuestion() {
    setAnswered((a) => a + 1);
    setShowAnswer(false);
    if (currentIdx + 1 >= pool.length) {
      clearInterval(timerRef.current);
      setPhase('done');
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function finishEarly() {
    clearInterval(timerRef.current);
    setPhase('done');
  }

  useEffect(() => {
    if (phase === 'done' && answered > 0) {
      addXP(XP_REWARDS.mockComplete, `Mock interview: ${answered} questions`);
      recordActivity();
    }
  }, [phase]);

  useEffect(() => {
    document.title = 'Mock Interview — System Design Bible';
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const currentQ = pool[currentIdx];

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink-900 dark:text-night-900 mb-2">
                Mock Interview
              </h1>
              <p className="text-sm sm:text-base text-ink-600 dark:text-night-700 mb-10 leading-relaxed">
                Timed practice with random questions. Think through each design before revealing the answer.
              </p>

              {/* Duration */}
              <div className="mb-7">
                <label className="text-[10px] uppercase tracking-wider text-ink-400 dark:text-night-600 mb-2.5 block font-medium">Duration</label>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <motion.button
                      key={d.seconds}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        duration.seconds === d.seconds
                          ? 'tab-active'
                          : 'glass-pill text-ink-600 dark:text-night-700'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {d.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Bucket filter */}
              <div className="mb-7">
                <label className="text-[10px] uppercase tracking-wider text-ink-400 dark:text-night-600 mb-2.5 block font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBucketFilter(0)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      bucketFilter === 0 ? 'tab-active' : 'glass-pill text-ink-600 dark:text-night-700'
                    }`}
                  >
                    All
                  </button>
                  {BUCKETS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBucketFilter(b.id)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        bucketFilter === b.id ? 'tab-active' : 'glass-pill text-ink-600 dark:text-night-700'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-10">
                <label className="text-[10px] uppercase tracking-wider text-ink-400 dark:text-night-600 mb-2.5 block font-medium">Difficulty</label>
                <div className="flex gap-2">
                  {['all', 'Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiffFilter(d)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                        diffFilter === d ? 'tab-active' : 'glass-pill text-ink-600 dark:text-night-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={startInterview}
                className="flex items-center gap-2.5 px-7 py-3 rounded-xl btn-primary font-semibold"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={16} />
                Start Interview
              </motion.button>
            </motion.div>
          )}

          {phase === 'running' && currentQ && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              {/* Timer bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-sm font-mono text-ink-600 dark:text-night-700">
                  <Clock size={14} />
                  <span className={timeLeft < 60 ? 'text-red-400' : ''}>{formatTime(timeLeft)}</span>
                </div>
                <div className="text-xs text-ink-400 dark:text-night-600 font-medium">
                  Q {currentIdx + 1} / {pool.length} · Answered: {answered}
                </div>
                <button onClick={finishEarly} className="text-xs text-ink-400 dark:text-night-600 hover:text-ink-900 dark:hover:text-night-900 transition font-medium">
                  End early
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-ink-100 dark:bg-night-400/30 mb-8 overflow-hidden">
                <motion.div
                  className="h-full xp-bar rounded-full"
                  animate={{ width: `${(1 - timeLeft / duration.seconds) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ.slug}
                  className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-ink-400 dark:text-night-600">#{currentQ.number}</span>
                    <span className={`text-xs font-semibold ${
                      currentQ.difficulty === 'Easy' ? 'text-teal-400' :
                      currentQ.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                    }`}>{currentQ.difficulty}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-medium text-ink-900 dark:text-night-900 leading-snug mb-4">
                    {currentQ.title}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {currentQ.tags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] font-medium glass-pill px-2 py-0.5 rounded-md text-ink-500 dark:text-night-700">{t}</span>
                    ))}
                  </div>

                  {!showAnswer ? (
                    <motion.button
                      onClick={() => setShowAnswer(true)}
                      className="text-sm font-medium text-rust-500 dark:text-rust-300 hover:underline"
                      whileHover={{ x: 3 }}
                    >
                      Reveal answer →
                    </motion.button>
                  ) : (
                    <motion.div
                      className="border-t border-ink-100/30 dark:border-night-400/20 pt-5 mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="prose-custom text-sm whitespace-pre-wrap mb-5">{currentQ.answer}</div>
                      <motion.button
                        onClick={nextQuestion}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Next question <ArrowRight size={14} />
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div
              key="done"
              className="text-center py-14"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <motion.div
                className="text-6xl mb-5"
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                🎉
              </motion.div>
              <h2 className="font-serif text-3xl font-medium text-ink-900 dark:text-night-900 mb-4">
                Interview Complete!
              </h2>
              <div className="glass-card rounded-2xl p-6 max-w-sm mx-auto mb-8">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-serif font-semibold stat-value">{answered}</div>
                    <div className="text-xs text-ink-400 dark:text-night-600 mt-1">Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-serif font-semibold stat-value flex items-center justify-center gap-1">
                      <Zap size={18} className="text-amber-400" />
                      +{XP_REWARDS.mockComplete}
                    </div>
                    <div className="text-xs text-ink-400 dark:text-night-600 mt-1">XP earned</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={() => setPhase('setup')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-pill text-sm font-medium text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition-all border"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <RotateCcw size={14} />
                  Try again
                </motion.button>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold"
                >
                  <CheckCircle2 size={14} />
                  Done
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
