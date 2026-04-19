export default function Stat({ value, label, sub, accent }) {
  return (
    <div className="bg-white rounded-lg border border-ink-200 p-5">
      <div
        className={`font-serif text-3xl font-semibold tabular-nums leading-none ${
          accent ? 'text-rust-600' : 'text-ink-900'
        }`}
      >
        {value}
      </div>
      <div className="text-sm font-medium text-ink-700 mt-2">{label}</div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
    </div>
  );
}
