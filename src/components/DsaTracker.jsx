import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Search, BarChart3, ListChecks, BookOpen, ArrowRight,
  LayoutGrid, Type, Link2, Layers, ArrowRightLeft, Hash, Network,
  Triangle, TextSearch, Share2, Combine, Database, ArrowDownUp,
  MoveHorizontal, PanelRightOpen, GitFork, Split, Coins, Boxes,
  Route, Binary, Sigma, SpellCheck, CalendarRange, Plus,
} from 'lucide-react';
import {
  TOPICS, QUESTIONS, COMPANY_NAMES, ROLE_NAMES, LIST_NAMES,
} from '../data/dsa';
import { useDsaProgress } from '../hooks/useDsaProgress';

/* lucide icon per topic id */
const TOPIC_ICONS = {
  1: LayoutGrid, 2: Type, 3: Link2, 4: Layers, 5: ArrowRightLeft, 6: Hash,
  7: Network, 8: Triangle, 9: TextSearch, 10: Share2, 11: Combine,
  12: BarChart3, 13: Database, 14: ArrowDownUp, 15: Search, 16: MoveHorizontal,
  17: PanelRightOpen, 18: GitFork, 19: Split, 20: Coins, 21: Boxes, 22: Route,
  23: Binary, 24: Sigma, 25: SpellCheck, 26: CalendarRange, 27: Plus,
};

const DIFF_ORDER = { E: 0, M: 1, H: 2 };
const DIFF_LABEL = { E: 'Easy', M: 'Medium', H: 'Hard' };

const diffPill = {
  E: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/25',
  M: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/25',
  H: 'bg-rust-500/15 text-rust-600 dark:text-rust-300 border-rust-500/25',
};

const listPill = {
  N: 'bg-teal-500/12 text-teal-600 dark:text-teal-300',
  B: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
  S: 'bg-accent-purple/15 text-accent-purple dark:text-violet-300',
};
const listLabel = { N: 'NC', B: 'B75', S: 'STR' };

const companyDomain = {
  G: 'google.com', Am: 'amazon.com', Me: 'meta.com', Ap: 'apple.com', Nf: 'netflix.com',
};

const roleColor = { AI: '#8b5cf6', BE: '#0ea5e9', FE: '#f97316' };

const lcSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ +/g, '-');

export default function DsaTracker() {
  const { done, toggle, total: doneCount } = useDsaProgress();
  const [tab, setTab] = useState('questions');
  const [activeTopic, setActiveTopic] = useState(null);
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterList, setFilterList] = useState('all');
  const [filterCo, setFilterCo] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    document.title = 'DSA Tracker — FAANG Problems';
  }, []);

  const totalQ = QUESTIONS.length;
  const pct = totalQ ? Math.round((doneCount / totalQ) * 100) : 0;

  const topicStats = useMemo(() => {
    const s = {};
    TOPICS.forEach((t) => (s[t.id] = { total: 0, done: 0 }));
    QUESTIONS.forEach((q) => {
      s[q.topic].total++;
      if (done.has(q.id)) s[q.topic].done++;
    });
    return s;
  }, [done]);

  const filtered = useMemo(() => {
    return QUESTIONS.filter((q) => {
      if (activeTopic !== null && q.topic !== activeTopic) return false;
      if (filterDiff !== 'all' && q.d !== filterDiff) return false;
      if (filterRole !== 'all' && !q.role.includes(filterRole)) return false;
      if (filterList === 'NONE' && /[NBS]/.test(q.lists)) return false;
      if (filterList !== 'all' && filterList !== 'NONE' && !q.lists.includes(filterList)) return false;
      if (filterCo !== 'all' && !q.co.includes(filterCo)) return false;
      if (searchQ && !q.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (a.topic !== b.topic ? a.topic - b.topic : DIFF_ORDER[a.d] - DIFF_ORDER[b.d]));
  }, [activeTopic, filterDiff, filterRole, filterList, filterCo, searchQ]);

  const freqData = useMemo(
    () =>
      TOPICS.map((t) => ({
        ...t,
        count: QUESTIONS.filter((q) => q.topic === t.id).length,
        done: QUESTIONS.filter((q) => q.topic === t.id && done.has(q.id)).length,
      })).sort((a, b) => b.count - a.count),
    [done]
  );
  const maxFreq = Math.max(...freqData.map((f) => f.count));

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="orb w-[450px] h-[450px] bg-teal-400 -top-40 -right-40" />
      <div className="orb w-[350px] h-[350px] bg-rust-400 bottom-20 -left-32" style={{ animationDelay: '6s' }} />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Hero + stats */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-500 dark:text-teal-300 glass-pill px-3.5 py-1.5 rounded-full mb-5">
            <Binary size={12} />
            FAANG problem tracker · 27 topics
          </div>
          <h1 className="font-serif text-display-sm font-medium text-ink-900 dark:text-night-900 leading-[1.06] tracking-tight mb-6">
            Data Structures &amp;{' '}
            <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-rust-400 bg-clip-text text-transparent italic">
              Algorithms
            </span>
          </h1>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            <Stat label="Solved" value={doneCount} accent="text-teal-400" />
            <Stat label="Total" value={totalQ} accent="text-rust-400" />
            <Stat label="Progress" value={`${pct}%`} accent="text-amber-400" />
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-ink-100 dark:bg-night-400/30 overflow-hidden max-w-md">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-rust-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct, 1)}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-7">
          <TabBtn active={tab === 'questions'} onClick={() => setTab('questions')} icon={<ListChecks size={15} />}>Questions</TabBtn>
          <TabBtn active={tab === 'chart'} onClick={() => setTab('chart')} icon={<BarChart3 size={15} />}>Frequency Chart</TabBtn>
          <TabBtn active={tab === 'resources'} onClick={() => setTab('resources')} icon={<BookOpen size={15} />}>Resources</TabBtn>
        </div>

        {tab === 'questions' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-60 flex-shrink-0">
              <div className="glass-card rounded-xl p-2 lg:sticky lg:top-20 max-h-[75vh] overflow-y-auto">
                <TopicRow active={activeTopic === null} onClick={() => setActiveTopic(null)} label="All Topics" count={`${totalQ}`} />
                <SidebarGroup title="Data Structures" color="text-rust-400" />
                {TOPICS.filter((t) => t.category === 'DS').map((t) => (
                  <TopicRow
                    key={t.id}
                    active={activeTopic === t.id}
                    onClick={() => setActiveTopic(t.id)}
                    icon={TOPIC_ICONS[t.id]}
                    label={t.name}
                    count={`${topicStats[t.id].done}/${topicStats[t.id].total}`}
                    complete={topicStats[t.id].done === topicStats[t.id].total && topicStats[t.id].total > 0}
                  />
                ))}
                <SidebarGroup title="Algorithms" color="text-teal-400" />
                {TOPICS.filter((t) => t.category === 'A').map((t) => (
                  <TopicRow
                    key={t.id}
                    active={activeTopic === t.id}
                    onClick={() => setActiveTopic(t.id)}
                    icon={TOPIC_ICONS[t.id]}
                    label={t.name}
                    count={`${topicStats[t.id].done}/${topicStats[t.id].total}`}
                    complete={topicStats[t.id].done === topicStats[t.id].total && topicStats[t.id].total > 0}
                  />
                ))}
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center mb-5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-night-600" />
                  <input
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search problems…"
                    className="glass-pill rounded-lg pl-9 pr-3 py-2 text-sm w-52 outline-none text-ink-900 dark:text-night-900 placeholder:text-ink-400 dark:placeholder:text-night-600 focus:border-rust-400/50"
                  />
                </div>
                <FilterSelect value={filterDiff} onChange={setFilterDiff} opts={[['all', 'All Difficulty'], ['E', 'Easy'], ['M', 'Medium'], ['H', 'Hard']]} />
                <FilterSelect value={filterRole} onChange={setFilterRole} opts={[['all', 'All Roles'], ['AI', 'AI Engineer'], ['BE', 'Backend Full Stack'], ['FE', 'Frontend Full Stack']]} />
                <FilterSelect value={filterList} onChange={setFilterList} opts={[['all', 'All Lists'], ['N', 'NeetCode 150'], ['B', 'Blind 75'], ['S', 'Striver'], ['NONE', 'FAANG Extras']]} />
                <FilterSelect value={filterCo} onChange={setFilterCo} opts={[['all', 'All Companies'], ['G', 'Google'], ['Am', 'Amazon'], ['Me', 'Meta'], ['Ap', 'Apple'], ['Nf', 'Netflix']]} />
                <span className="ml-auto text-xs text-ink-400 dark:text-night-600 tabular-nums">{filtered.length} problems</span>
              </div>

              {/* List */}
              <div className="flex flex-col gap-2">
                {filtered.map((q) => {
                  const isDone = done.has(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`glass-card rounded-xl px-4 py-3 flex items-start gap-3 ${isDone ? 'border-teal-500/30' : ''}`}
                    >
                      <button
                        onClick={() => toggle(q.id)}
                        aria-label={isDone ? 'Mark unsolved' : 'Mark solved'}
                        className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          isDone ? 'bg-teal-500 border-teal-500 text-white' : 'border-ink-300 dark:border-night-500 hover:border-teal-400'
                        }`}
                      >
                        {isDone && <Check size={13} strokeWidth={3} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Line 1 — difficulty + title + complexity */}
                        <div className="flex items-baseline gap-2">
                          <span className={`text-[11px] font-bold flex-shrink-0 ${diffPill[q.d].split(' ').filter((c) => c.startsWith('text')).join(' ')}`}>
                            {q.d}
                          </span>
                          <a
                            href={`https://leetcode.com/problems/${lcSlug(q.name)}/`}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-[15px] font-medium flex-1 min-w-0 hover:text-rust-500 dark:hover:text-rust-300 transition-colors ${
                              isDone ? 'text-teal-700 dark:text-teal-300' : 'text-ink-900 dark:text-night-900'
                            }`}
                          >
                            <span className="text-ink-400 dark:text-night-600 mr-1.5 font-mono text-xs">#{q.lc}</span>
                            {q.name}
                          </a>
                          <span className="font-mono text-[10px] text-ink-400 dark:text-night-600 flex-shrink-0">
                            {q.tc} · {q.sc}
                          </span>
                        </div>

                        {/* Line 2 — pattern description + badges */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-1.5">
                          <span className="text-xs text-ink-500 dark:text-night-600 italic">{q.pattern}</span>

                          <span className="w-px h-3 bg-ink-200 dark:bg-night-500/50" />

                          {['N', 'B', 'S'].filter((l) => q.lists.includes(l)).map((l) => (
                            <span key={l} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${listPill[l]}`}>{listLabel[l]}</span>
                          ))}

                          <div className="flex gap-1.5">
                            {q.co.map((c) => (
                              <CompanyBadge key={c} code={c} />
                            ))}
                          </div>

                          {q.role.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
                              style={{ color: roleColor[r], background: `${roleColor[r]}1a` }}
                            >
                              {ROLE_NAMES[r]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-ink-400 dark:text-night-600 text-sm">No problems match your filters.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'chart' && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-5">Problems per Topic</h2>
            <div className="flex flex-col gap-2">
              {freqData.map((f) => {
                const Icon = TOPIC_ICONS[f.id];
                return (
                  <button
                    key={f.id}
                    onClick={() => { setActiveTopic(f.id); setTab('questions'); }}
                    className="flex items-center gap-3 group text-left"
                  >
                    <div className="w-40 sm:w-48 flex items-center gap-2 justify-end text-xs text-ink-500 dark:text-night-700 flex-shrink-0 truncate">
                      <span className="truncate">{f.name}</span>
                      {Icon && <Icon size={13} className="flex-shrink-0 opacity-60" />}
                    </div>
                    <div className="flex-1 h-5 rounded-md bg-ink-100 dark:bg-night-400/30 overflow-hidden relative">
                      <div
                        className={`h-full rounded-md ${f.category === 'DS' ? 'bg-gradient-to-r from-rust-500 to-rust-300' : 'bg-gradient-to-r from-teal-500 to-teal-300'} group-hover:opacity-90`}
                        style={{ width: `${(f.count / maxFreq) * 100}%` }}
                      />
                      {f.done > 0 && (
                        <div className="absolute top-0 left-0 h-full bg-white/30 dark:bg-white/20 rounded-md" style={{ width: `${(f.done / maxFreq) * 100}%` }} />
                      )}
                    </div>
                    <span className="w-8 text-xs font-bold text-ink-700 dark:text-night-800 text-right tabular-nums">{f.count}</span>
                    <span className="w-12 text-[11px] text-teal-500 dark:text-teal-400 text-right tabular-nums">{f.done}/{f.count}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-5 text-[11px] text-ink-400 dark:text-night-600">
              <Legend color="bg-rust-400" label="Data Structures" />
              <Legend color="bg-teal-400" label="Algorithms" />
              <Legend color="bg-white/40" label="Completed" />
            </div>
          </div>
        )}

        {tab === 'resources' && <Resources />}
      </div>
    </div>
  );
}

/* ── small components ── */
function CompanyBadge({ code }) {
  const name = COMPANY_NAMES[code];
  return (
    <span
      title={`Asked at ${name}`}
      className="w-6 h-6 rounded-md bg-white border border-ink-200/70 dark:border-night-500/40 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0"
    >
      <img
        src={`https://www.google.com/s2/favicons?sz=64&domain=${companyDomain[code]}`}
        alt={name}
        width={15}
        height={15}
        loading="lazy"
        className="block"
      />
    </span>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className={`text-2xl sm:text-3xl font-serif font-semibold tabular-nums ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500 dark:text-night-700 mt-1">{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
        active ? 'tab-active' : 'glass-pill text-ink-600 dark:text-night-700 hover:text-ink-900 dark:hover:text-night-900'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function SidebarGroup({ title, color }) {
  return (
    <div className={`px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider ${color}`}>{title}</div>
  );
}

function TopicRow({ active, onClick, icon: Icon, label, count, complete }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
        active ? 'tab-active' : 'text-ink-600 dark:text-night-700 hover:bg-ink-100/50 dark:hover:bg-night-300/30'
      }`}
    >
      {Icon ? <Icon size={14} className="flex-shrink-0 opacity-70" /> : <span className="w-3.5" />}
      <span className="text-xs flex-1 truncate">{label}</span>
      <span className={`text-[10px] tabular-nums flex-shrink-0 ${complete ? 'text-teal-500 dark:text-teal-400' : 'text-ink-400 dark:text-night-600'}`}>{count}</span>
    </button>
  );
}

function FilterSelect({ value, onChange, opts }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="glass-pill rounded-lg px-2.5 py-2 text-xs outline-none cursor-pointer text-ink-700 dark:text-night-800 bg-transparent"
    >
      {opts.map(([v, l]) => (
        <option key={v} value={v} className="bg-cream-50 dark:bg-night-200 text-ink-900 dark:text-night-900">{l}</option>
      ))}
    </select>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

const RESOURCES = [
  {
    tag: 'NC', title: 'NeetCode 150', accent: 'text-teal-500',
    desc: 'The most comprehensive structured list for coding interview prep. 18 categories, 3–5 problems per pattern. Superset of Blind 75.',
    links: [
      ['Practice on NeetCode.io', 'https://neetcode.io/practice?tab=neetcode150'],
      ['Roadmap', 'https://neetcode.io/roadmap'],
      ['YouTube', 'https://www.youtube.com/@NeetCode'],
    ],
  },
  {
    tag: 'B75', title: 'Blind 75', accent: 'text-amber-500',
    desc: 'The original curated list by Yangshun Tay. All essential patterns in 75 problems. Best for under 6 weeks of prep.',
    links: [
      ['Practice on NeetCode.io', 'https://neetcode.io/practice?tab=blind75'],
      ['Grind 75 (customizable)', 'https://www.techinterviewhandbook.org/grind75'],
    ],
  },
  {
    tag: 'STR', title: "Striver's SDE & A2Z Sheets", accent: 'text-violet-500',
    desc: 'By Raj Vikramaditya (Google). SDE Sheet (180) for interviews, A2Z (400+) for a full DSA curriculum with written explanations.',
    links: [
      ['A2Z DSA Sheet', 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2'],
      ['SDE Sheet (180)', 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems'],
      ['YouTube', 'https://www.youtube.com/@takeUforward'],
    ],
  },
];

function Resources() {
  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-xl font-medium text-ink-900 dark:text-night-900 mb-5">Curated Problem Lists</h2>
      <div className="flex flex-col gap-4">
        {RESOURCES.map((r) => (
          <div key={r.title} className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`text-xs font-bold ${r.accent}`}>{r.tag}</span>
              <h3 className="font-serif text-lg font-medium text-ink-900 dark:text-night-900">{r.title}</h3>
            </div>
            <p className="text-sm text-ink-600 dark:text-night-700 leading-relaxed mb-4">{r.desc}</p>
            <div className="flex flex-wrap gap-2">
              {r.links.map(([label, url]) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium glass-pill px-3 py-1.5 rounded-lg text-ink-700 dark:text-night-800 hover:text-rust-500 dark:hover:text-rust-300 transition-colors"
                >
                  {label}
                  <ArrowRight size={11} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
