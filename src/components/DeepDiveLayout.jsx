import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useActiveSection } from '../hooks/useActiveSection';

/* ----- Theme presets keep the call sites short ----- */
const THEMES = {
  blue: {
    progress: 'from-blue-500 via-purple-500 to-teal-400',
    activeBorder: 'border-blue-500 dark:border-blue-400',
    activeText: 'text-blue-600 dark:text-blue-300',
    phaseText: 'text-blue-500 dark:text-blue-300',
    mobileActive: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  },
  rust: {
    progress: 'from-rust-400 via-rust-500 to-teal-400',
    activeBorder: 'border-rust-500 dark:border-rust-400',
    activeText: 'text-rust-600 dark:text-rust-300',
    phaseText: 'text-rust-500 dark:text-rust-300',
    mobileActive: 'bg-rust-500/10 text-rust-600 dark:text-rust-300',
  },
};

const DIFFICULTY_PILL = {
  Easy:   'border-teal-200/60 dark:border-teal-500/30 text-teal-700 dark:text-teal-300',
  Medium: 'border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300',
  Hard:   'border-rust-200/60 dark:border-rust-500/30 text-rust-700 dark:text-rust-300',
};

export default function DeepDiveLayout({
  documentTitle,
  theme = 'blue',
  sections,
  phases,
  header,
  prev,
  next,
  children,
}) {
  const t = THEMES[theme] ?? THEMES.blue;
  const contentRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const activeSection = useActiveSection(sections.map((s) => s.id));

  useEffect(() => {
    if (documentTitle) document.title = documentTitle;
  }, [documentTitle]);

  return (
    <div className="gradient-mesh min-h-screen">
      {/* Reading progress bar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${t.progress} origin-left z-50`}
        style={{ scaleX }}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 mb-6 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            All questions
          </Link>
        </motion.div>

        {/* Header */}
        <DeepDiveHeader header={header} />

        {/* Main layout */}
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 mt-8">
          <DesktopTOC sections={sections} phases={phases} active={activeSection} theme={t} />
          <MobileTOC sections={sections} phases={phases} active={activeSection} theme={t} />

          {/* Content area */}
          <div ref={contentRef} className="min-w-0">
            {children}

            {/* Footer nav */}
            <motion.div
              className="mt-16 pt-8 border-t border-ink-200/60 dark:border-night-400/40 flex items-center justify-between"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {prev ? (
                <Link
                  to={prev.to}
                  className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  {prev.label}
                </Link>
              ) : (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  All questions
                </Link>
              )}

              {next ? (
                <Link
                  to={next.to}
                  className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 group"
                >
                  {next.label}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : prev ? (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 group"
                >
                  All questions
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <div className="text-sm text-ink-400 dark:text-night-600">More questions coming soon</div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----- Header ----- */
function DeepDiveHeader({ header }) {
  if (!header) return null;
  const diffPill = DIFFICULTY_PILL[header.difficulty] ?? '';
  return (
    <motion.header
      className="pb-10 mb-4 border-b border-ink-200/60 dark:border-night-400/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {header.difficulty && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg glass-pill ${diffPill}`}>
            {header.difficulty}
          </span>
        )}
        {header.frequency && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg glass-pill text-ink-700 dark:text-night-800">
            {header.frequency} frequency
          </span>
        )}
        {header.companies && (
          <span className="text-xs text-ink-400 dark:text-night-600 ml-2 font-medium">
            {header.companies}
          </span>
        )}
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink-900 dark:text-night-900 tracking-tight mb-3">
        {header.title}
      </h1>
      {header.subtitle && (
        <p className="text-lg text-ink-500 dark:text-night-700">{header.subtitle}</p>
      )}
      {header.tags && header.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {header.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.header>
  );
}

/* ----- Desktop sticky sidebar TOC ----- */
function DesktopTOC({ sections, phases, active, theme }) {
  const grouped = phases && phases.length > 0;
  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-20">
        <div className="text-[10px] font-semibold text-ink-400 dark:text-night-600 uppercase tracking-widest mb-4">
          On this page
        </div>
        {grouped
          ? phases.map((phase) => {
              const items = sections.filter((s) => s.phase === phase);
              if (items.length === 0) return null;
              return (
                <div key={phase} className="mb-5">
                  <div className={`text-[10px] font-semibold ${theme.phaseText} uppercase tracking-widest mb-2 pl-4`}>
                    {phase}
                  </div>
                  <TOCList items={items} sections={sections} active={active} theme={theme} />
                </div>
              );
            })
          : <TOCList items={sections} sections={sections} active={active} theme={theme} />
        }
      </nav>
    </aside>
  );
}

function TOCList({ items, sections, active, theme }) {
  return (
    <ul className="space-y-0.5 border-l border-ink-200/50 dark:border-night-400/30">
      {items.map((s) => {
        const i = sections.indexOf(s);
        const isActive = active === s.id;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`flex items-center gap-2 pl-4 py-1.5 text-sm transition-all border-l-2 -ml-[1px] ${
                isActive
                  ? `${theme.activeBorder} ${theme.activeText} font-medium`
                  : 'border-transparent text-ink-500 dark:text-night-700 hover:text-ink-800 dark:hover:text-night-800 hover:border-ink-300 dark:hover:border-night-500'
              }`}
            >
              <span className="font-mono text-[10px] tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/* ----- Mobile collapsible TOC ----- */
function MobileTOC({ sections, phases, active, theme }) {
  const [open, setOpen] = useState(false);
  const grouped = phases && phases.length > 0;
  const renderLink = (s) => {
    const i = sections.indexOf(s);
    return (
      <a
        key={s.id}
        href={`#${s.id}`}
        onClick={() => setOpen(false)}
        className={`block px-3 py-2 rounded-lg text-sm transition ${
          active === s.id
            ? `${theme.mobileActive} font-medium`
            : 'text-ink-600 dark:text-night-700 hover:bg-ink-100/50 dark:hover:bg-night-300/30'
        }`}
      >
        <span className="font-mono text-[10px] opacity-50 mr-2">{String(i + 1).padStart(2, '0')}</span>
        {s.label}
      </a>
    );
  };

  return (
    <div className="lg:hidden mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full glass-card rounded-xl px-4 py-3 flex items-center justify-between text-sm font-medium text-ink-700 dark:text-night-800"
      >
        <span>
          <span className="text-ink-400 dark:text-night-600 mr-1.5">§</span>
          {sections.find((s) => s.id === active)?.label || 'On this page'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-ink-400 dark:text-night-600">▾</motion.span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-xl mt-2 p-3 overflow-hidden"
        >
          {grouped
            ? phases.map((phase) => {
                const items = sections.filter((s) => s.phase === phase);
                if (items.length === 0) return null;
                return (
                  <div key={phase} className="mb-3 last:mb-0">
                    <div className={`text-[10px] font-semibold ${theme.phaseText} uppercase tracking-widest mb-1 px-3`}>
                      {phase}
                    </div>
                    <div className="space-y-0.5">{items.map(renderLink)}</div>
                  </div>
                );
              })
            : <div className="space-y-0.5">{sections.map(renderLink)}</div>
          }
        </motion.div>
      )}
    </div>
  );
}
