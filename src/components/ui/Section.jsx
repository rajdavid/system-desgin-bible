import { motion } from 'framer-motion';

export default function Section({ id, number, eyebrow, title, children, intro }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-20 py-12 first:pt-0"
    >
      <div className="mb-6">
        {eyebrow && (
          <div className="flex items-center gap-2 mb-3">
            {number !== undefined && (
              <span className="font-mono text-xs text-rust-600 font-medium tabular-nums">
                {String(number).padStart(2, '0')}
              </span>
            )}
            <span className="text-xs font-medium text-ink-500 uppercase tracking-wider">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="font-serif text-4xl font-medium text-ink-900 tracking-tight leading-tight">
          {title}
        </h2>
        {intro && (
          <p className="mt-4 text-lg text-ink-600 leading-relaxed max-w-3xl">{intro}</p>
        )}
      </div>
      <div className="prose-custom">{children}</div>
    </motion.section>
  );
}
