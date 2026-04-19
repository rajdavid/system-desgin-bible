export default function Stat({ value, label, sub, accent }) {
  return (
    <div className="bg-white dark:bg-night-200 rounded-lg border border-ink-200 dark:border-night-400 p-5">
      <div
        className={`font-serif text-3xl font-semibold tabular-nums leading-none ${
          accent ? 'text-rust-600 dark:text-[#D4724A]' : 'text-ink-900 dark:text-night-900'
        }`}
      >
        {value}
      </div>
      <div className="text-sm font-medium text-ink-700 dark:text-night-800 mt-2">{label}</div>
      {sub && <div className="text-xs text-ink-500 dark:text-night-700 mt-1">{sub}</div>}
    </div>
  );
}
