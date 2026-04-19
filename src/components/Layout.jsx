import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Github, Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-night-100 transition-colors duration-200">
      <header className="sticky top-0 z-40 bg-cream-50/85 dark:bg-night-100/85 backdrop-blur-md border-b border-ink-200 dark:border-night-400 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-rust-500 text-white flex items-center justify-center font-serif font-bold text-lg group-hover:bg-rust-600 transition">
              S
            </div>
            <div className="leading-tight">
              <div className="font-serif font-semibold text-ink-900 dark:text-night-900">System Design Bible</div>
              <div className="text-xs text-ink-500 dark:text-night-700">Interactive interview deep dives</div>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {!isHome && (
              <Link
                to="/"
                className="text-sm text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition flex items-center gap-1.5"
              >
                <BookOpen size={15} />
                All questions
              </Link>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 transition flex items-center gap-1.5"
            >
              <Github size={15} />
              GitHub
            </a>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900 hover:bg-ink-100 dark:hover:bg-night-300 transition"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-200 dark:border-night-400 mt-20 py-8 text-center text-sm text-ink-500 dark:text-night-700 transition-colors duration-200">
        Built for interview prep · Each question goes deeper than you expect
      </footer>
    </div>
  );
}
