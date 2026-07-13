import { useEffect, useState } from 'react';
import { CakeSlice, LogOut, UserCircle2, Trophy, Star, Gauge, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card, StatTile, Spinner, EmptyState, Stars } from '../components/ui';
import { formatTime } from '../lib/format';

export default function PlayerPage() {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState(null);
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    api('/progress').then((d) => setProgress(d.progress)).catch(() => setProgress([]));
    api('/ranking', { auth: false }).then((d) => setRanking(d.ranking)).catch(() => setRanking([]));
  }, []);

  const totalStars = progress?.reduce((sum, p) => sum + (p.best_stars || 0), 0) ?? 0;
  const bestScore = progress?.reduce((max, p) => Math.max(max, p.best_score || 0), 0) ?? 0;
  const myRank = ranking?.findIndex((r) => r.id === user.id);

  return (
    <div className="mx-auto min-h-screen max-w-[1100px] px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-berry-500 to-grape-500 p-2.5 shadow-lg shadow-grape-500/30">
            <CakeSlice size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Pastel Rush</h1>
            <p className="text-sm text-frost-400">Tu progreso y el ranking global</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-sm">
            <UserCircle2 size={16} className="text-grape-400" />
            <span className="font-medium">{user.username}</span>
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-sm font-medium text-frost-300 transition-colors hover:bg-ink-800 hover:text-frost-100"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={Star} tone="honey" label="Estrellas" value={totalStars} />
        <StatTile icon={Gauge} tone="mint" label="Mejor puntuación" value={bestScore || '—'} />
        <StatTile icon={Gamepad2} tone="grape" label="Niveles jugados" value={progress?.length ?? 0} />
        <StatTile
          icon={Trophy}
          tone="berry"
          label="Tu posición"
          value={myRank != null && myRank >= 0 ? `#${myRank + 1}` : '—'}
        />
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-honey-400" />
          <h2 className="text-lg font-bold">Ranking global</h2>
        </div>
        {!ranking ? (
          <Spinner />
        ) : ranking.length === 0 ? (
          <EmptyState icon={Trophy} title="Todavía no hay partidas en el ranking" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-frost-400">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-3 py-2 text-left font-semibold">Jugador</th>
                  <th className="px-3 py-2 text-right font-semibold">Punt. media</th>
                  <th className="px-3 py-2 text-right font-semibold">Mejor punt.</th>
                  <th className="px-3 py-2 text-right font-semibold">Mejor tiempo</th>
                  <th className="px-3 py-2 text-center font-semibold">Estrellas</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => {
                  const isMe = r.id === user.id;
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-ink-800/60 ${isMe ? 'bg-grape-500/10' : 'hover:bg-ink-800/40'}`}
                    >
                      <td className="px-3 py-2 tabular-nums text-frost-400">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold text-frost-100">
                        {r.username}
                        {isMe && <span className="ml-2 text-xs text-grape-400">(tú)</span>}
                      </td>
                      <td className="px-3 py-2 text-right font-bold tabular-nums text-honey-400">{r.punt_media}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-frost-100">{r.mejor_punt}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-frost-300">{formatTime(r.mejor_tiempo)}</td>
                      <td className="px-3 py-2 text-center"><Stars value={r.mejor_estrellas} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
