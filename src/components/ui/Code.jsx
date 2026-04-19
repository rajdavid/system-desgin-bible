export default function Code({ children, lang, inline }) {
  if (inline) {
    return (
      <code className="font-mono text-[0.9em] bg-cream-100 dark:bg-night-300 text-ink-900 dark:text-night-900 px-1.5 py-0.5 rounded border border-ink-200 dark:border-night-500">
        {children}
      </code>
    );
  }
  return (
    <div className="my-6 not-prose">
      {lang && (
        <div className="text-[11px] text-ink-500 dark:text-night-700 font-mono px-4 pt-3 pb-1">{lang}</div>
      )}
      <pre className="bg-ink-900 text-cream-100 rounded-lg p-5 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}
