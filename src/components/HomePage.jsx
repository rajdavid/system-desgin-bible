import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Timer,
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

/* Framer-motion helpers */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HomePage() {
  const [activeBucket, setActiveBucket] = useState(1);
  const [filter, setFilter] = useState('all');
  const { getStatus, stats } = useProgress();
  const { xp, level, levelProgress } = useXP();
  const { current: streak, isActiveToday } = useStreak();

  useEffect(() => {
    document.title = 'System Design Bible — 265 Deep-Dive Questions';
  }, []);

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
      {/* Decorative orbs */}
      <div className="orb w-[500px] h-[500px] bg-rust-400 -top-48 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-teal-400 top-1/3 -right-32" style={{ animationDelay: '5s' }} />
      <div className="orb w-[350px] h-[350px] bg-accent-purple bottom-20 left-1/4" style={{ animationDelay: '10s' }} />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Hero */}
        <motion.section
          className="pt-6 pb-14 max-w-3xl"
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 text-xs font-medium text-rust-400 dark:text-rust-300 glass-pill px-3.5 py-1.5 rounded-full mb-7"
          >
            <Sparkles size={12} className="animate-bounce-subtle" />
            265 deep-dive questions
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-serif text-display-sm sm:text-display font-medium text-ink-900 dark:text-night-900 leading-[1.06] tracking-tight mb-6"
          >
            System design interviews,{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-rust-500 via-rust-400 to-amber-500 dark:from-rust-300 dark:via-rust-400 dark:to-amber-400 bg-clip-text text-transparent italic">
                understood
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-rust-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>{' '}
            — not memorized.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-base sm:text-lg text-ink-600 dark:text-night-700 leading-relaxed max-w-2xl"
          >
            Each question walks through the architecture, starting from requirements, building the
            design, then pressure-testing with follow-ups. Interactive diagrams included.
          </motion.p>
        </motion.section>

        {/* Stats row */}
        <motion.section
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div variants={cardVariant}>
            <StatCard
              icon={<Target size={18} className="text-rust-400" />}
              label="Progress"
              value={`${pct}%`}
              sub={`${stats.studied + stats.mastered} / ${totalQ}`}
              bar={pct / 100}
              barColor="from-rust-500 to-rust-400"
            />
          </motion.div>
          <motion.div variants={cardVariant}>
            <StatCard
              icon={<Star size={18} className="text-amber-400" />}
              label="XP"
              value={xp}
              sub={`Lv ${level.level} · ${level.title}`}
              bar={levelProgress}
              barColor="from-amber-500 to-amber-400"
            />
          </motion.div>
          <motion.div variants={cardVariant}>
            <StatCard
              icon={
                <Flame
                  size={18}
                  className={isActiveToday ? 'text-orange-400 streak-flame' : 'text-night-600'}
                />
              }
              label="Streak"
              value={`${streak}d`}
              sub={isActiveToday ? 'Active today' : 'Study to keep it'}
            />
          </motion.div>
          <motion.div variants={cardVariant}>
            <StatCard
              icon={<Trophy size={18} className="text-teal-400" />}
              label="Mastered"
              value={stats.mastered}
              sub={`${stats.studied} studied`}
            />
          </motion.div>
        </motion.section>

        {/* Gradient divider */}
        <div className="gradient-divider mb-10" />

        {/* Bucket tabs */}
        <motion.div
          className="flex flex-wrap gap-2 mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {BUCKETS.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setActiveBucket(b.id);
                setFilter('all');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                activeBucket === b.id
                  ? 'tab-active'
                  : 'glass-pill text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900'
              }`}
            >
              {bucketIcons[b.id]}
              <span className="hidden sm:inline">{b.label}</span>
              <span className="sm:hidden">{b.label.split(' ')[0]}</span>
              <span className="text-[11px] opacity-50 tabular-nums">{b.count}</span>
            </button>
          ))}
        </motion.div>

        {/* Filter pills */}
        <motion.div
          className="flex gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {['all', 'new', 'studied', 'mastered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-all capitalize font-medium ${
                filter === f
                  ? 'bg-rust-500/15 border-rust-500/30 text-rust-400 dark:text-rust-300'
                  : 'glass-pill text-ink-500 dark:text-night-700 hover:text-ink-700 dark:hover:text-night-800'
              }`}
            >
              {f} {f === 'all' ? `(${bucketQuestions.length})` : ''}
            </button>
          ))}
        </motion.div>

        {/* Questions grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeBucket}-${filter}`}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {filtered.map((q) => (
              <motion.div key={q.slug} variants={cardVariant} layout>
                <QuestionCard q={q} status={getStatus(q.slug)} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BookOpen size={36} className="mx-auto mb-4 text-ink-300 dark:text-night-500" />
            <p className="text-sm text-ink-500 dark:text-night-600">No questions match this filter.</p>
          </motion.div>
        )}

        {/* Mock Interview CTA */}
        <motion.section
          className="mt-20 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-card rounded-2xl p-10 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rust-500/5 via-transparent to-teal-500/5 pointer-events-none" />

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rust-500/15 to-rust-600/10 mb-5">
                <Timer size={26} className="text-rust-400" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink-900 dark:text-night-900 mb-3">
                Mock Interview Mode
              </h3>
              <p className="text-sm sm:text-base text-ink-600 dark:text-night-700 mb-7 max-w-lg mx-auto leading-relaxed">
                Get random questions with a timer. Practice thinking under pressure — just like a real interview.
              </p>
              <Link
                to="/mock"
                className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-xl btn-primary text-sm font-semibold"
              >
                Start Mock Interview
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/* Stat Card */
function StatCard({ icon, label, value, sub, bar, barColor }) {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <span className="text-[10px] sm:text-xs text-ink-500 dark:text-night-700 uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-serif font-semibold stat-value tabular-nums">{value}</div>
      <div className="text-[11px] sm:text-xs text-ink-500 dark:text-night-600 mt-1">{sub}</div>
      {bar != null && (
        <div className="mt-3 h-1.5 rounded-full bg-ink-100 dark:bg-night-400/30 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${barColor || 'from-rust-500 to-rust-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(bar * 100, 1)}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}
    </div>
  );
}

/* Question Card */
function QuestionCard({ q, status }) {
  const isComingSoon = q.status !== 'available';
  const statusIcon = isComingSoon ? (
    <Lock size={13} className="text-ink-400 dark:text-night-600" />
  ) : status === 'mastered' ? (
    <CheckCircle2 size={13} className="text-teal-400" />
  ) : status === 'studied' ? (
    <BookOpen size={13} className="text-amber-400" />
  ) : null;

  return (
    <Link to={`/q/${q.slug}`} className="block h-full">
      <article
        className={`glass-card rounded-xl p-5 sm:p-6 h-full group relative overflow-hidden ${
          isComingSoon ? 'opacity-50' : ''
        }`}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-rust-500/10 dark:bg-rust-500/5 rounded-full blur-3xl" />
        </div>

        {/* Number watermark */}
        <div className="absolute top-4 right-5 font-serif text-3xl text-ink-200/40 dark:text-night-400/20 font-medium tabular-nums select-none">
          {q.number}
        </div>

        {/* Difficulty + frequency + status */}
        <div className="flex items-center gap-2 mb-3.5 relative z-10">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border dark:${difficultyColors[q.difficulty]} ${difficultyColorsLight[q.difficulty]}`}
          >
            {q.difficulty}
          </span>
          {q.frequency && (
            <span className="text-[11px] text-ink-400 dark:text-night-600 font-medium">{q.frequency}</span>
          )}
          {statusIcon && <span className="ml-auto">{statusIcon}</span>}
        </div>

        {/* Title */}
        <h3 className="font-serif text-[17px] sm:text-lg font-medium text-ink-900 dark:text-night-900 leading-snug mb-4 pr-10 relative z-10">
          {q.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
          {q.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium glass-pill px-2 py-0.5 rounded-md text-ink-500 dark:text-night-700"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-ink-100/40 dark:border-night-400/20 relative z-10">
          <div className="text-[11px] text-ink-400 dark:text-night-600 truncate max-w-[55%]">
            {q.companies.slice(0, 3).join(' · ')}
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rust-500 dark:text-rust-300 group-hover:gap-2 transition-all">
            {isComingSoon ? 'Soon' : 'Study'}
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </article>
    </Link>
  );
}
