import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Github, Moon, Sun, Flame, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useStreak } from '../hooks/useStreak';

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { theme, toggle } = useTheme();
  const { current: streak, isActiveToday } = useStreak();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-night-50 transition-colors duration-500">
      <motion.header
        className="sticky top-0 z-40 glass border-b border-ink-200/30 dark:border-night-400/30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-rust-500 to-rust-600 text-white flex items-center justify-center font-serif font-bold text-lg shadow-glow-sm"
              whileHover={{ scale: 1.08, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              S
            </motion.div>
            <div className="leading-tight">
              <div className="font-serif font-semibold text-ink-900 dark:text-night-900 text-[15px] tracking-tight">
                System Design Bible
              </div>
              <div className="text-[10px] text-ink-400 dark:text-night-600 font-medium tracking-wide">
                265 deep-dive questions
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {/* Streak indicator */}
            <AnimatePresence>
              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                    isActiveToday
                      ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
                      : 'text-ink-500 dark:text-night-600 glass-pill'
                  }`}
                >
                  <Flame size={13} className={isActiveToday ? 'streak-flame' : ''} />
                  {streak}d
                </motion.div>
              )}
            </AnimatePresence>

            {!isHome && (
              <Link
                to="/"
                className="text-sm text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-ink-100/50 dark:hover:bg-night-300/30"
              >
                <BookOpen size={14} />
                <span className="hidden sm:inline">Questions</span>
              </Link>
            )}
            <a
              href="https://github.com/rajdavid/system-desgin-bible"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 hover:bg-ink-100/50 dark:hover:bg-night-300/30 transition-colors"
            >
              <Github size={16} />
            </a>
            <motion.button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-500 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 hover:bg-ink-100/50 dark:hover:bg-night-300/30 transition-colors"
              whileTap={{ scale: 0.85, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ y: -10, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </nav>
        </div>
      </motion.header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-200/30 dark:border-night-400/20 mt-20 py-10 text-center">
        <p className="text-xs text-ink-400 dark:text-night-600">
          Built for interview prep · Each question goes deeper than you expect
        </p>
      </footer>
    </div>
  );
}
