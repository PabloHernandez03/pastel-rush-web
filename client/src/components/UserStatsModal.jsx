import { useEffect, useState } from 'react';
import { Gamepad2, Gauge, Crown, Timer, Star, Package, Flame } from 'lucide-react';
import { api } from '../lib/api';
import Modal from './Modal';
import { Spinner, EmptyState, Stars } from './ui';
import { formatTime, formatDateTime, worldName } from '../lib/format';

export default function UserStatsModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/admin/users/${userId}/stats`).then(setData).catch((e) => setError(e.message));
  }, [userId]);

  return (
    <Modal
      title={data ? `Estadísticas · ${data.user.username}` : 'Estadísticas'}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      {error ? (
        <EmptyState icon={Gauge} title="No se pudieron cargar las estadísticas" hint={error} />
      ) : !data ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini icon={Gamepad2} label="Partidas" value={data.stats.partidas ?? 0} />
            <Mini icon={Gauge} label="Punt. media" value={data.stats.punt_media ?? '—'} />
            <Mini icon={Crown} label="Mejor punt." value={data.stats.mejor_punt ?? '—'} />
            <Mini icon={Timer} label="Mejor tiempo" value={formatTime(data.stats.mejor_tiempo)} />
            <Mini icon={Star} label="Máx. estrellas" value={data.stats.mejor_estrellas ?? 0} />
            <Mini icon={Package} label="Pedidos totales" value={data.stats.pedidos_totales ?? 0} />
            <Mini icon={Flame} label="Quemados" value={data.stats.quemados_totales ?? 0} />
            <Mini icon={Gamepad2} label="Niveles jugados" value={data.progress.length} />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-frost-300">Últimas partidas</h4>
            {data.games.length === 0 ? (
              <EmptyState icon={Gamepad2} title="Este usuario aún no ha jugado" />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-ink-700">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-ink-900/60 text-xs uppercase tracking-wide text-frost-400">
                      <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                      <th className="px-3 py-2 text-left font-semibold">Mundo / Nivel</th>
                      <th className="px-3 py-2 text-right font-semibold">Puntos</th>
                      <th className="px-3 py-2 text-center font-semibold">Estrellas</th>
                      <th className="px-3 py-2 text-right font-semibold">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.games.map((g) => (
                      <tr key={g.id} className="border-t border-ink-800/60">
                        <td className="px-3 py-2 text-frost-400">{formatDateTime(g.created_at)}</td>
                        <td className="px-3 py-2 text-frost-300">
                          {worldName(g.world_index)} · {g.level_name || `Nivel ${g.level_id}`}
                        </td>
                        <td className="px-3 py-2 text-right font-bold tabular-nums text-honey-400">{g.score}</td>
                        <td className="px-3 py-2 text-center"><Stars value={g.stars} /></td>
                        <td className="px-3 py-2 text-right tabular-nums text-frost-300">{formatTime(g.duration_seconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Mini({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-3">
      <div className="flex items-center gap-2 text-frost-400">
        <Icon size={15} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-frost-100">{value}</p>
    </div>
  );
}
