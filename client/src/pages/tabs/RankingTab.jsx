import { useEffect, useMemo, useState } from 'react';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, Spinner, EmptyState, Stars } from '../../components/ui';
import { formatTime, orNull } from '../../lib/format';

const COLUMNS = [
  { key: 'username', label: 'Jugador', align: 'left' },
  { key: 'sexo', label: 'Sexo', align: 'left' },
  { key: 'edad', label: 'Edad', align: 'left' },
  { key: 'pais', label: 'País', align: 'left' },
  { key: 'grado', label: 'Grado', align: 'left' },
  { key: 'partidas', label: 'Partidas', align: 'right', num: true },
  { key: 'punt_media', label: 'Punt. media', align: 'right', num: true },
  { key: 'mejor_punt', label: 'Mejor punt.', align: 'right', num: true },
  { key: 'mejor_tiempo', label: 'Mejor tiempo', align: 'right', num: true, time: true },
  { key: 'mejor_estrellas', label: 'Estrellas', align: 'center' },
  { key: 'niveles_completados', label: 'Niveles', align: 'right', num: true },
];

export default function RankingTab() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ key: 'punt_media', dir: 'desc' });

  useEffect(() => {
    api('/ranking', { auth: false })
      .then((d) => setRows(d.ranking))
      .catch((e) => setError(e.message));
  }, []);

  const sorted = useMemo(() => {
    if (!rows) return [];
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv), 'es') * factor;
    });
  }, [rows, sort]);

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  }

  if (error) return <EmptyState icon={Trophy} title="No se pudo cargar el ranking" hint={error} />;
  if (!rows) return <Spinner />;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <Trophy size={18} className="text-honey-400" />
        <h2 className="text-lg font-bold">Ranking de jugadores</h2>
      </div>
      <p className="mb-4 text-sm text-frost-400">
        Haz clic en un encabezado para ordenar. Ordenado por puntuación media.
      </p>

      {sorted.length === 0 ? (
        <EmptyState icon={Trophy} title="Todavía no hay partidas en el ranking" hint="Cuando los jugadores completen partidas aparecerán aquí." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-frost-400">
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className={`cursor-pointer select-none px-3 py-3 font-semibold hover:text-frost-100 ${alignClass(c.align)}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {sort.key === c.key &&
                        (sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-ink-800/60 transition-colors hover:bg-ink-800/40"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <RankBadge position={i + 1} />
                      <span className="font-semibold text-frost-100">{r.username}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-frost-300">{orNull(r.sexo)}</td>
                  <td className="px-3 py-3 text-frost-300">{orNull(r.edad)}</td>
                  <td className="px-3 py-3 text-frost-300">{orNull(r.pais)}</td>
                  <td className="px-3 py-3 text-frost-300">{orNull(r.grado)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-frost-300">{r.partidas}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-honey-400">{r.punt_media}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-frost-100">{r.mejor_punt}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-frost-300">{formatTime(r.mejor_tiempo)}</td>
                  <td className="px-3 py-3 text-center"><Stars value={r.mejor_estrellas} /></td>
                  <td className="px-3 py-3 text-right tabular-nums text-frost-300">{r.niveles_completados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function alignClass(align) {
  return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}

function RankBadge({ position }) {
  const styles = {
    1: 'bg-honey-500 text-ink-950',
    2: 'bg-frost-300 text-ink-950',
    3: 'bg-berry-400 text-ink-950',
  };
  return (
    <span
      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
        styles[position] || 'bg-ink-700 text-frost-300'
      }`}
    >
      {position}
    </span>
  );
}
