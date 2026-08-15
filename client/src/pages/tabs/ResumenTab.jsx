import { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  Gamepad2,
  Gauge,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { api } from '../../lib/api';
import { Card, StatTile, Spinner, EmptyState } from '../../components/ui';
import { worldName } from '../../lib/format';

const WORLD_COLORS = ['#f472b6', '#c99bf5', '#4ade80', '#ffc23d', '#fb923c'];

export default function ResumenTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <EmptyState icon={Gauge} title="No se pudieron cargar las estadísticas" hint={error} />;
  if (!data) return <Spinner />;

  const { totals, byWorld, byDay } = data;
  const worldData = byWorld.map((w) => ({ ...w, name: worldName(w.world_index) }));
  const dayData = byDay.map((d) => ({
    ...d,
    label: new Date(d.dia).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile icon={UsersIcon} tone="grape" label="Usuarios" value={totals.total_usuarios} />
        <StatTile icon={ShieldCheck} tone="berry" label="Administradores" value={totals.total_admins} />
        <StatTile icon={Gamepad2} tone="mint" label="Partidas jugadas" value={totals.total_partidas} />
        <StatTile icon={Gauge} tone="honey" label="Punt. media global" value={totals.punt_media_global ?? '—'} />
        <StatTile icon={Crown} tone="honey" label="Mejor puntuación" value={totals.mejor_punt_global ?? '—'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-frost-300">Partidas (últimos 14 días)</h3>
          {dayData.length === 0 ? (
            <EmptyState icon={Gamepad2} title="Aún no hay partidas registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dayData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#43301f" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#b6906f', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#b6906f', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip unit="partidas" />} cursor={{ fill: 'rgba(245,166,35,0.10)' }} />
                <Bar dataKey="partidas" fill="#f5a623" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-frost-300">Partidas por mundo</h3>
          {worldData.length === 0 ? (
            <EmptyState icon={Gamepad2} title="Sin datos por mundo todavía" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={worldData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#43301f" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#b6906f', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fill: '#e6cba9', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip unit="partidas" />} cursor={{ fill: 'rgba(245,166,35,0.10)' }} />
                <Bar dataKey="partidas" radius={[0, 6, 6, 0]}>
                  {worldData.map((_, i) => (
                    <Cell key={i} fill={WORLD_COLORS[i % WORLD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm shadow-xl">
      <p className="font-medium text-frost-100">{payload[0].payload.name || label}</p>
      <p className="text-frost-400">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}
