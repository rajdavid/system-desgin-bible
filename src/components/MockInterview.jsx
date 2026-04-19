import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { questions, BUCKETS } from '../data/questions';
import { useXP } from '../hooks/useXP';
import { useStreak } from '../hooks/useStreak';
import { ArrowRight, Clock, Play, RotateCcw, CheckCircle2, Zap } from 'lucide-react';

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

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const currentQ = pool[currentIdx];

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/" className="text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition mb-8 inline-block">
          ← Back
        </Link>

        {phase === 'setup' && (
          <div className="animate-slide-up">
            <h1 className="font-serif text-3xl font-medium text-ink-900 dark:text-night-900 mb-2">
              Mock Interview
            </h1>
            <p className="text-sm text-ink-600 dark:text-night-700 mb-8">
              Timed practice with random questions. Think through each design before revealing the answer.
            </p>

            {/* Duration */}
            <div className="mb-6">
              <label className="text-xs uppercase tracking-wide text-ink-500 dark:text-night-600 mb-2 block">Duration</label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.seconds}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      duration.seconds === d.seconds
                        ? 'tab-active'
                        : 'glass text-ink-600 dark:text-night-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bucket filter */}
            <div className="mb-6">
              <label className="text-xs uppercase tracking-wide text-ink-500 dark:text-night-600 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setBucketFilter(0)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                    bucketFilter === 0 ? 'tab-active' : 'glass text-ink-600 dark:text-night-700'
                  }`}
                >
                  All
                </button>
                {BUCKETS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBucketFilter(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                      bucketFilter === b.id ? 'tab-active' : 'glass text-ink-600 dark:text-night-700'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-8">
              <label className="text-xs uppercase tracking-wide text-ink-500 dark:text-night-600 mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {['all', 'Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-all capitalize ${
                      diffFilter === d ? 'tab-active' : 'glass text-ink-600 dark:text-night-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startInterview}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rust-500 to-rust-600 text-white font-medium hover:shadow-lg hover:shadow-rust-500/20 transition-all"
            >
              <Play size={16} />
              Start Interview
            </button>
          </div>
        )}

        {phase === 'running' && currentQ && (
          <div className="animate-scale-in">
            {/* Timer bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm font-mono text-ink-600 dark:text-night-700">
                <Clock size={14} />
                <span className={timeLeft < 60 ? 'text-red-400 animate-pulse' : ''}>{formatTime(timeLeft)}</span>
              </div>
              <div className="text-xs text-ink-500 dark:text-night-600">
                Q {currentIdx + 1} / {pool.length} · Answered: {answered}
              </div>
              <button onClick={finishEarly} className="text-xs text-ink-500 dark:text-night-600 hover:text-ink-900 dark:hover:text-night-900 transition">
                End early
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-night-400/30 mb-8 overflow-hidden">
              <div
                className="h-full xp-bar rounded-full transition-all duration-1000"
                style={{ width: `${(1 - timeLeft / duration.seconds) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-ink-500 dark:text-night-600">#{currentQ.number}</span>
                <span className={`text-xs font-medium ${
                  currentQ.difficulty === 'Easy' ? 'text-teal-400' :
                  currentQ.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                }`}>{currentQ.difficulty}</span>
              </div>
              <h2 className="font-serif text-2xl font-medium text-ink-900 dark:text-night-900 leading-snug mb-4">
                {currentQ.title}
              </h2>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {currentQ.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-[10px] glass px-1.5 py-0.5 rounded text-ink-600 dark:text-night-700">{t}</span>
                ))}
              </div>

              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="text-sm text-rust-500 dark:text-[#E8855A] hover:underline"
                >
                  Reveal answer →
                </button>
              ) : (
                <div className="border-t border-ink-100/50 dark:border-night-400/30 pt-4 mt-4">
                  <div className="prose-custom text-sm whitespace-pre-wrap mb-4">{currentQ.answer}</div>
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rust-500 to-rust-600 text-white text-sm font-medium transition-all"
                  >
                    Next question <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="animate-scale-in text-center py-10">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-serif text-2xl font-medium text-ink-900 dark:text-night-900 mb-3">
              Interview Complete!
            </h2>
            <div className="glass-card rounded-2xl p-6 max-w-sm mx-auto mb-8">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-serif font-semibold text-ink-900 dark:text-night-900">{answered}</div>
                  <div className="text-xs text-ink-500 dark:text-night-600">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-serif font-semibold text-ink-900 dark:text-night-900 flex items-center justify-center gap-1">
                    <Zap size={16} className="text-amber-500" />
                    +{XP_REWARDS.mockComplete}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-night-600">XP earned</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setPhase('setup')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-sm font-medium text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition-all"
              >
                <RotateCcw size={14} />
                Try again
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rust-500 to-rust-600 text-white text-sm font-medium transition-all"
              >
                <CheckCircle2 size={14} />
                Done
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
