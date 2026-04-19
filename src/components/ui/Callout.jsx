import { Info, Lightbulb, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

const variants = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    labelColor: 'text-blue-900',
  },
  insight: {
    icon: Lightbulb,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    labelColor: 'text-amber-900',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-rust-50',
    border: 'border-rust-200',
    iconColor: 'text-rust-600',
    labelColor: 'text-rust-900',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    iconColor: 'text-teal-600',
    labelColor: 'text-teal-900',
  },
  interview: {
    icon: Zap,
    bg: 'bg-gradient-to-br from-rust-50 to-cream-100',
    border: 'border-rust-200',
    iconColor: 'text-rust-600',
    labelColor: 'text-rust-700',
  },
};

export default function Callout({ variant = 'info', title, children }) {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div className={`${v.bg} ${v.border} border rounded-lg p-5 my-6 not-prose`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${v.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`font-semibold text-sm ${v.labelColor} mb-1`}>{title}</div>
          )}
          <div className="text-ink-800 text-[15px] leading-relaxed [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>ul]:my-2 [&>ul>li]:text-[15px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
