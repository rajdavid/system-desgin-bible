import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Github, Moon, Sun, Flame } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useStreak } from '../hooks/useStreak';

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { theme, toggle } = useTheme();
  const { current: streak, isActiveToday } = useStreak();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-night-50 transition-colors duration-300">
      <header className="sticky top-0 z-40 glass border-b border-ink-200/50 dark:border-night-400/50 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rust-500 to-rust-600 text-white flex items-center justify-center font-serif font-bold text-lg group-hover:shadow-lg group-hover:shadow-rust-500/20 transition-all">
              S
            </div>
            <div className="leading-tight">
              <div className="font-serif font-semibold text-ink-900 dark:text-night-900 text-sm">System Design Bible</div>
              <div className="text-[10px] text-ink-500 dark:text-night-600">265 deep-dive questions</div>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {/* Streak indicator */}
            {streak > 0 && (
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                isActiveToday ? 'text-orange-400 bg-orange-500/10' : 'text-ink-500 dark:text-night-600 glass'
              }`}>
                <Flame size={12} className={isActiveToday ? 'streak-flame' : ''} />
                {streak}d
              </div>
            )}
            {!isHome && (
              <Link
                to="/"
                className="text-sm text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                Questions
              </Link>
            )}
            <a
              href="https://github.com/rajdavid/system-desgin-bible"
              target="_blank"
              rel="noreferrer"
              className="text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition"
            >
              <Github size={16} />
            </a>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 hover:bg-ink-100/50 dark:hover:bg-night-300/50 transition"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-200/50 dark:border-night-400/30 mt-20 py-8 text-center text-xs text-ink-500 dark:text-night-600 transition-colors duration-200">
        Built for interview prep · Each question goes deeper than you expect
      </footer>
    </div>
  );
}
