import { useState } from 'react';
import { Link } from 'react-router-dom';
import { questions, BUCKETS, getQuestionsByBucket } from '../data/questions';
import { useProgress } from '../hooks/useProgress';
import { useXP } from '../hooks/useXP';
import { useStreak } from '../hooks/useStreak';
import {
  ArrowRight,
  Flame,
  Trophy,
  Zap,
  Star,
  BookOpen,
  CheckCircle2,
  Target,
  Brain,
  Server,
  Cpu,
  HelpCircle,
  Lock,
} from 'lucide-react';

const bucketIcons = {
  1: <Brain size={16} />,
  2: <Server size={16} />,
  3: <Cpu size={16} />,
  4: <HelpCircle size={16} />,
};

const difficultyColors = {
  Easy: 'bg-teal-500/15 text-teal-300 border-teal-500/20',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Hard: 'bg-red-500/15 text-red-300 border-red-500/20',
};

const difficultyColorsLight = {
  Easy: 'bg-teal-50 text-teal-700 border-teal-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rust-50 text-rust-700 border-rust-200',
};

export default function HomePage() {
  const [activeBucket, setActiveBucket] = useState(1);
  const [filter, setFilter] = useState('all');
  const { getStatus, stats } = useProgress();
  const { xp, level, levelProgress } = useXP();
  const { current: streak, isActiveToday } = useStreak();

  const bucketQuestions = getQuestionsByBucket(activeBucket);
  const filtered =
    filter === 'all'
      ? bucketQuestions
      : filter === 'new'
        ? bucketQuestions.filter((q) => getStatus(q.slug) === 'new')
        : bucketQuestions.filter((q) => getStatus(q.slug) === filter);

  const totalQ = questions.length;
  const pct = totalQ ? Math.round(((stats.studied + stats.mastered) / totalQ) * 100) : 0;

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <section className="pt-4 pb-10 max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-rust-400 dark:text-[#E8855A] glass px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} />
            265 deep-dive questions
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink-900 dark:text-night-900 leading-[1.08] tracking-tight mb-5">
            System design interviews,{' '}
            <span className="bg-gradient-to-r from-rust-500 to-amber-500 dark:from-[#E8855A] dark:to-amber-400 bg-clip-text text-transparent italic">
              understood
            </span>{' '}
            — not memorized.
          </h1>
          <p className="text-base text-ink-600 dark:text-night-700 leading-relaxed">
            Each question walks through the architecture, starting from requirements, building the
            design, then pressure-testing with follow-ups. Interactive diagrams included.
          </p>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 animate-slide-up">
          <StatCard
            icon={<Target size={18} className="text-rust-500" />}
            label="Progress"
            value={`${pct}%`}
            sub={`${stats.studied + stats.mastered} / ${totalQ}`}
          />
          <StatCard
            icon={<Star size={18} className="text-amber-500" />}
            label="XP"
            value={xp}
            sub={`Lv ${level.level} · ${level.title}`}
            bar={levelProgress}
          />
          <StatCard
            icon={<Flame size={18} className={`${isActiveToday ? 'text-orange-400 streak-flame' : 'text-night-600'}`} />}
            label="Streak"
            value={`${streak}d`}
            sub={isActiveToday ? 'Active today' : 'Study to keep it'}
          />
          <StatCard
            icon={<Trophy size={18} className="text-teal-500" />}
            label="Mastered"
            value={stats.mastered}
            sub={`${stats.studied} studied`}
          />
        </section>

        {/* Bucket tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {BUCKETS.map((b) => (
            <button
              key={b.id}
              onClick={() => { setActiveBucket(b.id); setFilter('all'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeBucket === b.id
                  ? 'tab-active'
                  : 'glass text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900'
              }`}
            >
              {bucketIcons[b.id]}
              {b.label}
              <span className="text-xs opacity-60">{b.count}</span>
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6">
          {['all', 'new', 'studied', 'mastered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-all capitalize ${
                filter === f
                  ? 'bg-rust-500/15 border-rust-500/30 text-rust-400 dark:text-[#E8855A]'
                  : 'glass text-ink-500 dark:text-night-700'
              }`}
            >
              {f} {f === 'all' ? `(${bucketQuestions.length})` : ''}
            </button>
          ))}
        </div>

        {/* Questions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q, i) => (
            <QuestionCard key={q.slug} q={q} status={getStatus(q.slug)} delay={i * 30} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-500 dark:text-night-600">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No questions match this filter.</p>
          </div>
        )}

        {/* Mock Interview CTA */}
        <section className="mt-16 glass-card rounded-2xl p-8 text-center animate-fade-in">
          <div className="text-3xl mb-3">⏱️</div>
          <h3 className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-2">
            Mock Interview Mode
          </h3>
          <p className="text-sm text-ink-600 dark:text-night-700 mb-5 max-w-md mx-auto">
            Get random questions with a timer. Practice thinking under pressure like a real interview.
          </p>
          <Link
            to="/mock"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rust-500 to-rust-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-rust-500/20 transition-all"
          >
            Start Mock Interview
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, bar }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-ink-500 dark:text-night-700 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-serif font-semibold text-ink-900 dark:text-night-900">{value}</div>
      <div className="text-xs text-ink-500 dark:text-night-600 mt-0.5">{sub}</div>
      {bar != null && (
        <div className="mt-2 h-1 rounded-full bg-night-400/30 overflow-hidden">
          <div className="h-full xp-bar rounded-full" style={{ width: `${bar * 100}%` }} />
        </div>
      )}
    </div>
  );
}

function QuestionCard({ q, status, delay }) {
  const isComingSoon = q.status !== 'available';
  const statusIcon =
    isComingSoon ? (
      <Lock size={14} className="text-ink-400 dark:text-night-600" />
    ) : status === 'mastered' ? (
      <CheckCircle2 size={14} className="text-teal-400" />
    ) : status === 'studied' ? (
      <BookOpen size={14} className="text-amber-400" />
    ) : null;

  return (
    <Link
      to={`/q/${q.slug}`}
      className="stagger-item block"
      style={{ animationDelay: `${delay}ms` }}
    >
      <article className={`glass-card rounded-xl p-5 h-full group relative overflow-hidden ${isComingSoon ? 'opacity-60' : ''}`}>
        {/* Number watermark */}
        <div className="absolute top-4 right-4 font-serif text-3xl text-ink-200/50 dark:text-night-400/30 font-medium tabular-nums">
          #{q.number}
        </div>

        {/* Difficulty + frequency */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded border dark:${difficultyColors[q.difficulty]} ${difficultyColorsLight[q.difficulty]}`}
          >
            {q.difficulty}
          </span>
          {q.frequency && (
            <span className="text-[11px] text-ink-500 dark:text-night-700">{q.frequency}</span>
          )}
          {statusIcon && <span className="ml-auto">{statusIcon}</span>}
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-medium text-ink-900 dark:text-night-900 leading-snug mb-3 pr-12">
          {q.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {q.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] glass px-1.5 py-0.5 rounded text-ink-600 dark:text-night-700"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-ink-100/50 dark:border-night-400/30">
          <div className="text-[11px] text-ink-500 dark:text-night-600 truncate max-w-[60%]">
            {q.companies.slice(0, 3).join(' · ')}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-rust-500 dark:text-[#E8855A] group-hover:gap-2 transition-all">
            {isComingSoon ? 'Soon' : 'Study'} <ArrowRight size={12} />
          </span>
        </div>
      </article>
    </Link>
  );
}
