// Shared formatting helpers.

export function formatTime(seconds) {
  if (seconds == null || seconds === '' || Number(seconds) <= 0) return '—';
  const s = Math.floor(Number(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function orNull(value) {
  return value == null || value === '' ? '—' : value;
}

// 5-world campaign names (from the game's LevelRegistry / README).
export const WORLD_NAMES = [
  'Pastelería de barrio',
  'Fiesta de cumpleaños',
  'Repostería de bodas',
  'Feria dulce',
  'Cocina encantada',
];

export function worldName(index) {
  if (index == null) return 'Práctica';
  return WORLD_NAMES[index] || `Mundo ${Number(index) + 1}`;
}
