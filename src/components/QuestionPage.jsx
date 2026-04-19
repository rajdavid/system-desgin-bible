import { useParams, Link } from 'react-router-dom';
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

  if (!q) {
    return (
      <div className="gradient-mesh min-h-screen flex items-center justify-center">
        <div className="text-center glass-card rounded-2xl p-10 animate-scale-in">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="font-serif text-xl text-ink-900 dark:text-night-900 mb-2">Question not found</h2>
          <Link to="/" className="text-sm text-rust-500 hover:underline">← Back to all questions</Link>
        </div>
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
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition mb-8"
        >
          <ArrowLeft size={14} />
          All questions
        </Link>

        {/* Header */}
        <header className="animate-slide-up mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-serif text-sm text-ink-400 dark:text-night-600">#{q.number}</span>
            <span className={`text-xs font-medium ${diffColors[q.difficulty]}`}>{q.difficulty}</span>
            {q.frequency && (
              <span className="text-xs text-ink-500 dark:text-night-700">{q.frequency} freq</span>
            )}
            {isComingSoon && (
              <span className="flex items-center gap-1 text-xs text-ink-400 dark:text-night-600 ml-auto">
                <Lock size={12} />
                Coming Soon
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink-900 dark:text-night-900 leading-tight mb-4">
            {q.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {q.tags.map((t) => (
              <span key={t} className="text-xs glass px-2 py-0.5 rounded text-ink-600 dark:text-night-700">
                {t}
              </span>
            ))}
          </div>

          {/* Companies */}
          {q.companies.length > 0 && (
            <p className="text-xs text-ink-500 dark:text-night-600">
              Asked at: {q.companies.join(', ')}
            </p>
          )}
        </header>

        {isComingSoon ? (
          /* Coming Soon state */
          <section className="glass-card rounded-2xl p-10 text-center animate-scale-in mb-10">
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="font-serif text-2xl font-medium text-ink-900 dark:text-night-900 mb-3">
              Deep Dive Coming Soon
            </h2>
            <p className="text-sm text-ink-600 dark:text-night-700 max-w-md mx-auto mb-6 leading-relaxed">
              We're building an in-depth walkthrough for this question — complete with interactive
              architecture diagrams, follow-up scenarios, and step-by-step reasoning.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rust-500 to-rust-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-rust-500/20 transition-all"
            >
              <ArrowLeft size={14} />
              Browse available questions
            </Link>
          </section>
        ) : (
          /* Full content for available questions */
          <>
            {/* Progress buttons */}
            <div className="flex gap-3 mb-10 animate-fade-in">
              <button
                onClick={handleStudied}
                disabled={progressStatus === 'mastered'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  progressStatus !== 'new'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'glass text-ink-600 dark:text-night-700 hover:text-amber-400 hover:border-amber-500/30'
                }`}
              >
                <BookOpen size={14} />
                {progressStatus === 'studied' || progressStatus === 'mastered' ? 'Studied ✓' : 'Mark Studied'}
              </button>
              <button
                onClick={handleMastered}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  progressStatus === 'mastered'
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 badge-earned'
                    : 'glass text-ink-600 dark:text-night-700 hover:text-teal-400 hover:border-teal-500/30'
                }`}
              >
                <Star size={14} />
                {progressStatus === 'mastered' ? 'Mastered ★' : 'Mark Mastered'}
              </button>
            </div>

            {/* Diagram */}
            {q.diagramNodes && (
              <DiagramViewer diagramNodes={q.diagramNodes} diagramTitle={q.diagramTitle} />
            )}

            {/* Answer */}
            {q.answer && (
              <section className="glass-card rounded-2xl p-6 sm:p-8 mb-8 animate-slide-up">
                <h2 className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-teal-500" />
                  Answer
                </h2>
                <div className="prose-custom text-sm whitespace-pre-wrap">{q.answer}</div>
              </section>
            )}

            {/* Resources */}
            {q.resources.length > 0 && (
              <section className="glass-card rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in">
                <h2 className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-4">
                  Resources
                </h2>
                <ul className="space-y-2">
                  {q.resources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-rust-500 dark:text-[#E8855A] hover:underline"
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {r.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {/* Prev / Next */}
        <nav className="flex justify-between pt-8 border-t border-ink-100/50 dark:border-night-400/30">
          {prev ? (
            <Link
              to={`/q/${prev.slug}`}
              className="flex items-center gap-2 text-sm text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition"
            >
              <ArrowLeft size={14} />
              <span className="max-w-[200px] truncate">{prev.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={`/q/${next.slug}`}
              className="flex items-center gap-2 text-sm text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition"
            >
              <span className="max-w-[200px] truncate">{next.title}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </div>
  );
}
