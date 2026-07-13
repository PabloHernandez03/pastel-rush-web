import { useEffect, useState } from 'react';
import { Layers, Gamepad2 } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { api } from '../../lib/api';
import { Card, Spinner, EmptyState } from '../../components/ui';
import { worldName, WORLD_NAMES } from '../../lib/format';

const WORLD_COLORS = ['#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#38bdf8'];

export default function RendimientoTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <EmptyState icon={Layers} title="No se pudo cargar el rendimiento" hint={error} />;
  if (!data) return <Spinner />;

  const byWorld = new Map(data.byWorld.map((w) => [w.world_index, w]));
  const rows = WORLD_NAMES.map((name, index) => {
    const w = byWorld.get(index);
    return {
      index,
      name,
      partidas: w?.partidas ?? 0,
      punt_media: w?.punt_media ?? 0,
    };
  });

  const hasData = rows.some((r) => r.partidas > 0);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <Layers size={18} className="text-mint-400" />
          <h2 className="text-lg font-bold">Rendimiento por mundo</h2>
        </div>
        <p className="mb-4 text-sm text-frost-400">
          Puntuación media alcanzada por los jugadores en cada mundo de la campaña.
        </p>

        {!hasData ? (
          <EmptyState icon={Gamepad2} title="Todavía no hay partidas por mundo" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={rows} outerRadius={120}>
              <PolarGrid stroke="#2f4070" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#b9c4e6', fontSize: 12 }} />
              <Tooltip content={<RadarTooltip />} />
              <Radar dataKey="punt_media" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {rows.map((r) => (
          <Card key={r.index} className="p-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: WORLD_COLORS[r.index % WORLD_COLORS.length] }}
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-frost-400">
                Mundo {r.index + 1}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-frost-100">{worldName(r.index)}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-honey-400">{r.punt_media || '—'}</p>
                <p className="text-xs text-frost-400">punt. media</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-frost-100">{r.partidas}</p>
                <p className="text-xs text-frost-400">partidas</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm shadow-xl">
      <p className="font-medium text-frost-100">{p.name}</p>
      <p className="text-frost-400">Punt. media: {p.punt_media}</p>
      <p className="text-frost-400">Partidas: {p.partidas}</p>
    </div>
  );
}
