import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Server, Code2, Sparkles, Layers, Binary } from 'lucide-react';
import { questions } from '../data/questions';
import { QUESTIONS } from '../data/dsa';
import { useProgress } from '../hooks/useProgress';
import { useDsaProgress } from '../hooks/useDsaProgress';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function LandingPage() {
  const { stats } = useProgress();
  const { total: dsaDone } = useDsaProgress();

  useEffect(() => {
    document.title = 'Crux — System Design & DSA Interview Prep';
  }, []);

  const sdTotal = questions.length;
  const sdDone = stats.studied + stats.mastered;
  const dsaTotal = QUESTIONS.length;

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="orb w-[500px] h-[500px] bg-rust-400 -top-48 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-teal-400 top-1/3 -right-32" style={{ animationDelay: '5s' }} />
      <div className="orb w-[350px] h-[350px] bg-accent-purple bottom-20 left-1/4" style={{ animationDelay: '10s' }} />

      <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 relative z-10">
        {/* Hero */}
        <motion.section className="text-center max-w-3xl mx-auto mb-16" initial="hidden" animate="show">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 text-xs font-medium text-rust-400 dark:text-rust-300 glass-pill px-3.5 py-1.5 rounded-full mb-7"
          >
            <Sparkles size={12} className="animate-bounce-subtle" />
            Your complete interview prep hub
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-serif text-display-sm sm:text-display font-medium text-ink-900 dark:text-night-900 leading-[1.06] tracking-tight mb-6"
          >
            Master the interview,{' '}
            <span className="bg-gradient-to-r from-rust-500 via-rust-400 to-amber-500 dark:from-rust-300 dark:via-rust-400 dark:to-amber-400 bg-clip-text text-transparent italic">
              both sides
            </span>
            .
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-base sm:text-lg text-ink-600 dark:text-night-700 leading-relaxed max-w-2xl mx-auto"
          >
            Pick your track. Deep-dive system design walkthroughs, or a curated FAANG DSA problem
            tracker covering NeetCode 150, Blind 75 &amp; Striver.
          </motion.p>
        </motion.section>

        {/* Two choice cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChoiceCard
            to="/system-design"
            icon={<Server size={26} className="text-rust-400" />}
            badge="Deep Dives"
            badgeIcon={<Layers size={11} />}
            title="System Design"
            desc="265 deep-dive questions with architecture walkthroughs, interactive diagrams, and follow-up pressure tests."
            stat={`${sdDone} / ${sdTotal} studied`}
            accent="from-rust-500/15 to-rust-600/8"
            delay={0.15}
          />
          <ChoiceCard
            to="/dsa"
            icon={<Code2 size={26} className="text-teal-400" />}
            badge="Problem Tracker"
            badgeIcon={<Binary size={11} />}
            title="DSA"
            desc="262 curated FAANG problems across 27 topics. Filter by difficulty, company, role, and list. Track your progress."
            stat={`${dsaDone} solved · ${dsaTotal} problems`}
            accent="from-teal-500/15 to-teal-600/8"
            delay={0.25}
          />
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({ to, icon, badge, badgeIcon, title, desc, stat, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 24 }}
    >
      <Link to={to} className="block h-full">
        <article className="glass-card rounded-2xl p-8 h-full group relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-pill">
                {icon}
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium glass-pill px-2.5 py-1 rounded-full text-ink-500 dark:text-night-700">
                {badgeIcon}
                {badge}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink-900 dark:text-night-900 mb-3">
              {title}
            </h2>
            <p className="text-sm sm:text-[15px] text-ink-600 dark:text-night-700 leading-relaxed mb-7">
              {desc}
            </p>

            <div className="flex items-center justify-between pt-5 border-t border-ink-100/40 dark:border-night-400/20">
              <span className="text-xs font-medium text-ink-400 dark:text-night-600 tabular-nums">{stat}</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-rust-500 dark:text-rust-300 group-hover:gap-2.5 transition-all">
                Open
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
