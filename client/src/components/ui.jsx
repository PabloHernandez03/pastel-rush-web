import { Loader2 } from 'lucide-react';

// Shared presentational primitives for the dark bakery theme.

export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-ink-700/70 bg-ink-850/70 shadow-xl shadow-black/30 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: 'bg-honey-500 text-ink-950 hover:bg-honey-400',
  ghost: 'bg-ink-800 text-frost-100 hover:bg-ink-700 border border-ink-700',
  info: 'bg-ink-700 text-frost-100 hover:bg-ink-600',
  success: 'bg-mint-400/90 text-ink-950 hover:bg-mint-400',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
  warn: 'bg-honey-500/90 text-ink-950 hover:bg-honey-500',
};

export function Button({
  variant = 'primary',
  className = '',
  icon: Icon,
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold
        transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {Icon && <Icon size={16} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

export function Badge({ tone = 'grape', children }) {
  const tones = {
    grape: 'bg-grape-500/15 text-grape-400 border-grape-500/30',
    honey: 'bg-honey-500/15 text-honey-400 border-honey-500/30',
    mint: 'bg-mint-400/15 text-mint-400 border-mint-400/30',
    berry: 'bg-berry-500/15 text-berry-400 border-berry-500/30',
    muted: 'bg-ink-700/60 text-frost-400 border-ink-600/50',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatTile({ icon: Icon, label, value, hint, tone = 'grape' }) {
  const tones = {
    grape: 'text-grape-400 bg-grape-500/15',
    honey: 'text-honey-400 bg-honey-500/15',
    mint: 'text-mint-400 bg-mint-400/15',
    berry: 'text-berry-400 bg-berry-500/15',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}>
          {Icon && <Icon size={22} strokeWidth={2} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-frost-400">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-frost-100">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-frost-400">{hint}</p>}
        </div>
      </div>
    </Card>
  );
}

export function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-frost-400">
      <Loader2 className="animate-spin" size={20} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {Icon && <Icon size={34} className="text-frost-400/60" />}
      <p className="text-frost-300">{title}</p>
      {hint && <p className="max-w-sm text-sm text-frost-400">{hint}</p>}
    </div>
  );
}

// Renders 0-3 stars, filled/empty, without emojis.
export function Stars({ value = 0, size = 15 }) {
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {[0, 1, 2].map((i) => (
        <StarGlyph key={i} filled={i < value} size={size} />
      ))}
    </span>
  );
}

function StarGlyph({ filled, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={filled ? 'text-honey-400' : 'text-ink-600'}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
