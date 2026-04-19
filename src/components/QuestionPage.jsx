import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getQuestion, questions } from '../data/questions';
import { useProgress } from '../hooks/useProgress';
import { useXP } from '../hooks/useXP';
import { useStreak } from '../hooks/useStreak';
import DiagramViewer from './nodes/DiagramViewer';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Lock,
  Star,
} from 'lucide-react';

const diffColors = {
  Easy: 'text-teal-400',
  Medium: 'text-amber-400',
  Hard: 'text-red-400',
};

export default function QuestionPage() {
  const { slug } = useParams();
  const q = getQuestion(slug);
  const { getStatus, markStudied, markMastered } = useProgress();
  const { addXP, XP_REWARDS } = useXP();
  const { recordActivity } = useStreak();

  useEffect(() => {
    document.title = q ? `${q.title} — System Design Bible` : 'System Design Bible';
  }, [q]);

  if (!q) {
    return (
      <div className="gradient-mesh min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center glass-card rounded-2xl p-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="font-serif text-xl text-ink-900 dark:text-night-900 mb-2">Question not found</h2>
          <Link to="/" className="text-sm text-rust-500 hover:underline">← Back to all questions</Link>
        </motion.div>
      </div>
    );
  }

  const isComingSoon = q.status !== 'available';
  const progressStatus = getStatus(q.slug);
  const idx = questions.indexOf(q);
  const prev = idx > 0 ? questions[idx - 1] : null;
  const next = idx < questions.length - 1 ? questions[idx + 1] : null;

  function handleStudied() {
    markStudied(q.slug);
    addXP(XP_REWARDS.study, `Studied: ${q.title}`);
    recordActivity();
  }

  function handleMastered() {
    markMastered(q.slug);
    addXP(XP_REWARDS.master, `Mastered: ${q.title}`);
    recordActivity();
  }

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back nav */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            All questions
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-serif text-sm text-ink-400 dark:text-night-600">#{q.number}</span>
            <span className={`text-xs font-semibold ${diffColors[q.difficulty]}`}>{q.difficulty}</span>
            {q.frequency && (
              <span className="text-xs text-ink-500 dark:text-night-700 font-medium">{q.frequency} freq</span>
            )}
            {isComingSoon && (
              <span className="flex items-center gap-1 text-xs text-ink-400 dark:text-night-600 ml-auto glass-pill px-2 py-0.5 rounded-full">
                <Lock size={11} />
                Coming Soon
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink-900 dark:text-night-900 leading-tight mb-5">
            {q.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {q.tags.map((t) => (
              <span key={t} className="text-xs font-medium glass-pill px-2.5 py-0.5 rounded-md text-ink-500 dark:text-night-700">
                {t}
              </span>
            ))}
          </div>

          {/* Companies */}
          {q.companies.length > 0 && (
            <p className="text-xs text-ink-400 dark:text-night-600">
              Asked at: {q.companies.join(', ')}
            </p>
          )}
        </motion.header>

        {isComingSoon ? (
          /* Coming Soon state */
          <motion.section
            className="glass-card rounded-2xl p-10 text-center mb-10 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rust-500/5 via-transparent to-teal-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🚧</div>
              <h2 className="font-serif text-2xl font-medium text-ink-900 dark:text-night-900 mb-3">
                Deep Dive Coming Soon
              </h2>
              <p className="text-sm text-ink-600 dark:text-night-700 max-w-md mx-auto mb-7 leading-relaxed">
                We're building an in-depth walkthrough for this question — complete with interactive
                architecture diagrams, follow-up scenarios, and step-by-step reasoning.
              </p>
              <Link
                to="/"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Browse available questions
              </Link>
            </div>
          </motion.section>
        ) : (
          /* Full content for available questions */
          <>
            {/* Progress buttons */}
            <motion.div
              className="flex gap-3 mb-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={handleStudied}
                disabled={progressStatus === 'mastered'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  progressStatus !== 'new'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'glass-pill text-ink-600 dark:text-night-700 hover:text-amber-400 hover:border-amber-500/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <BookOpen size={14} />
                {progressStatus === 'studied' || progressStatus === 'mastered' ? 'Studied ✓' : 'Mark Studied'}
              </motion.button>
              <motion.button
                onClick={handleMastered}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  progressStatus === 'mastered'
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 badge-earned'
                    : 'glass-pill text-ink-600 dark:text-night-700 hover:text-teal-400 hover:border-teal-500/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Star size={14} />
                {progressStatus === 'mastered' ? 'Mastered ★' : 'Mark Mastered'}
              </motion.button>
            </motion.div>

            {/* Diagram */}
            {q.diagramNodes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DiagramViewer diagramNodes={q.diagramNodes} diagramTitle={q.diagramTitle} />
              </motion.div>
            )}

            {/* Answer */}
            {q.answer && (
              <motion.section
                className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-teal-400" />
                  Answer
                </h2>
                <div className="prose-custom text-sm whitespace-pre-wrap">{q.answer}</div>
              </motion.section>
            )}

            {/* Resources */}
            {q.resources.length > 0 && (
              <motion.section
                className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-4">
                  Resources
                </h2>
                <ul className="space-y-2.5">
                  {q.resources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-rust-500 dark:text-rust-300 hover:underline transition-colors group"
                      >
                        <ExternalLink size={12} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        {r.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </>
        )}

        {/* Prev / Next */}
        <motion.nav
          className="flex justify-between pt-8 border-t border-ink-100/30 dark:border-night-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {prev ? (
            <Link
              to={`/q/${prev.slug}`}
              className="flex items-center gap-2 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="max-w-[200px] truncate">{prev.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={`/q/${next.slug}`}
              className="flex items-center gap-2 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition group"
            >
              <span className="max-w-[200px] truncate">{next.title}</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </motion.nav>
      </div>
    </div>
  );
}
