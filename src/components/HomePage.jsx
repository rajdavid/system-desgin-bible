import { Link } from 'react-router-dom';
import { questions } from '../data/questions';
import { ArrowRight, Lock, Zap } from 'lucide-react';

const difficultyColors = {
  Easy:   'bg-teal-50 text-teal-700 border-teal-100 dark:bg-[#0B1F16] dark:text-[#3DA882] dark:border-[#163324]',
  Medium: 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-[#1F1800] dark:text-amber-400 dark:border-amber-900/40',
  Hard:   'bg-rust-50 text-rust-700 border-rust-100 dark:bg-[#1F0E07] dark:text-[#D4724A] dark:border-[#3D1E0E]',
};

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="pt-8 pb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-rust-600 dark:text-[#D4724A] bg-rust-50 dark:bg-[#1F0E07] border border-rust-100 dark:border-[#3D1E0E] px-3 py-1 rounded-full mb-6">
          <Zap size={12} />
          Deep-dive, not surface-level
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl font-medium text-ink-900 dark:text-night-900 leading-[1.05] tracking-tight mb-6">
          System design interviews, <span className="text-rust-500 dark:text-[#D4724A] italic">understood</span> — not memorized.
        </h1>
        <p className="text-lg text-ink-600 dark:text-night-700 leading-relaxed">
          Each question walks through the architecture the way you'd actually reason about it in an interview —
          starting from requirements, building up the design, then pressure-testing it with follow-ups an interviewer
          would ask. Interactive diagrams let you play with the numbers and see what changes.
        </p>
      </section>

      {/* Questions grid */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif font-medium text-ink-900 dark:text-night-900">Questions</h2>
          <div className="text-sm text-ink-500 dark:text-night-700">
            {questions.filter((q) => q.status === 'available').length} available
            {' · '}
            {questions.filter((q) => q.status === 'coming-soon').length} coming soon
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {questions.map((q) => (
            <QuestionCard key={q.slug} q={q} />
          ))}
        </div>
      </section>
    </div>
  );
}

function QuestionCard({ q }) {
  const available = q.status === 'available';

  const inner = (
    <article
      className={`group relative bg-white dark:bg-night-200 rounded-xl border overflow-hidden transition-all h-full ${
        available
          ? 'border-ink-200 dark:border-night-400 hover:border-rust-500 dark:hover:border-[#C4643A] hover:shadow-lg dark:hover:shadow-black/40 hover:-translate-y-0.5'
          : 'border-ink-200 dark:border-night-400 opacity-60'
      }`}
    >
      {/* Number badge */}
      <div className="absolute top-5 right-5 font-serif text-4xl text-ink-200 dark:text-night-400 font-medium tabular-nums">
        #{String(q.number).padStart(2, '0')}
      </div>

      <div className="p-6">
        {/* Header: difficulty + frequency */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded border ${difficultyColors[q.difficulty]}`}
          >
            {q.difficulty}
          </span>
          <span className="text-xs text-ink-500 dark:text-night-700">{q.frequency} frequency</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl font-medium text-ink-900 dark:text-night-900 mb-1 leading-tight">
          {q.title}
        </h3>
        <div className="text-sm text-ink-500 dark:text-night-700 mb-4">{q.subtitle}</div>

        {/* Summary */}
        <p className="text-sm text-ink-600 dark:text-night-800 leading-relaxed mb-5 line-clamp-3">{q.summary}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {q.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[11px] bg-cream-100 dark:bg-night-300 text-ink-700 dark:text-night-800 px-2 py-0.5 rounded border border-ink-200 dark:border-night-500"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-ink-100 dark:border-night-400">
          <div className="text-xs text-ink-500 dark:text-night-700">
            Asked at {q.companies.slice(0, 3).join(', ')}
          </div>
          {available ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-rust-600 dark:text-[#D4724A] group-hover:gap-2 transition-all">
              Study
              <ArrowRight size={14} />
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-ink-400 dark:text-night-700">
              <Lock size={12} />
              Soon
            </span>
          )}
        </div>
      </div>
    </article>
  );

  if (!available) return inner;
  return (
    <Link to={`/q/${q.slug}`} className="block">
      {inner}
    </Link>
  );
}
