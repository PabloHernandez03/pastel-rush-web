import { useEffect, useState } from 'react';
import { History, Flame } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, Spinner, EmptyState, Stars } from '../../components/ui';
import { formatDateTime, formatTime, worldName } from '../../lib/format';

export default function HistorialTab() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/history').then((d) => setRows(d.history)).catch((e) => setError(e.message));
  }, []);

  if (error) return <EmptyState icon={History} title="No se pudo cargar el historial" hint={error} />;
  if (!rows) return <Spinner />;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <History size={18} className="text-grape-400" />
        <h2 className="text-lg font-bold">Historial de partidas</h2>
      </div>
      <p className="mb-4 text-sm text-frost-400">Últimas {rows.length} partidas registradas.</p>

      {rows.length === 0 ? (
        <EmptyState icon={History} title="Aún no hay partidas" hint="Las partidas jugadas aparecerán aquí en orden cronológico." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-frost-400">
                <Th>Fecha</Th>
                <Th>Jugador</Th>
                <Th>Mundo</Th>
                <Th>Nivel</Th>
                <Th right>Puntos</Th>
                <Th center>Estrellas</Th>
                <Th right>Tiempo</Th>
                <Th right>Pedidos</Th>
                <Th right>Quemados</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-800/60 hover:bg-ink-800/40">
                  <td className="px-3 py-3 text-frost-400">{formatDateTime(r.created_at)}</td>
                  <td className="px-3 py-3 font-medium text-frost-100">{r.username}</td>
                  <td className="px-3 py-3 text-frost-300">{worldName(r.world_index)}</td>
                  <td className="px-3 py-3 text-frost-300">{r.level_name || `Nivel ${r.level_id}`}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-honey-400">{r.score}</td>
                  <td className="px-3 py-3 text-center"><Stars value={r.stars} /></td>
                  <td className="px-3 py-3 text-right tabular-nums text-frost-300">{formatTime(r.duration_seconds)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-frost-300">{r.delivered_orders}</td>
                  <td className="px-3 py-3 text-right">
                    {r.burned_count > 0 ? (
                      <span className="inline-flex items-center gap-1 tabular-nums text-berry-400">
                        <Flame size={13} /> {r.burned_count}
                      </span>
                    ) : (
                      <span className="tabular-nums text-frost-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Th({ children, right, center }) {
  return (
    <th className={`px-3 py-3 font-semibold ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}>
      {children}
    </th>
  );
}
