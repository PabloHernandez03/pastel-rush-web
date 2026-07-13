import { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Trophy,
  History,
  Users,
  CakeSlice,
  LogOut,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ResumenTab from './tabs/ResumenTab';
import RendimientoTab from './tabs/RendimientoTab';
import RankingTab from './tabs/RankingTab';
import HistorialTab from './tabs/HistorialTab';
import UsuariosTab from './tabs/UsuariosTab';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard, Comp: ResumenTab },
  { id: 'rendimiento', label: 'Rendimiento por mundo', icon: Layers, Comp: RendimientoTab },
  { id: 'ranking', label: 'Ranking', icon: Trophy, Comp: RankingTab },
  { id: 'historial', label: 'Historial', icon: History, Comp: HistorialTab },
  { id: 'usuarios', label: 'Usuarios', icon: Users, Comp: UsuariosTab },
];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('resumen');
  const Active = TABS.find((t) => t.id === active)?.Comp ?? ResumenTab;

  return (
    <div className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-berry-500 to-grape-500 p-2.5 shadow-lg shadow-grape-500/30">
            <CakeSlice size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Panel de Estadísticas</h1>
            <p className="text-sm text-frost-400">Pastel Rush · rendimiento de jugadores</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-sm">
            <UserCircle2 size={16} className="text-grape-400" />
            <span className="font-medium">{user.username}</span>
            <span className="text-frost-400">· {user.role}</span>
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

      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.id === active;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-honey-500 bg-honey-500 text-ink-950'
                  : 'border-ink-700 bg-ink-850 text-frost-300 hover:bg-ink-800 hover:text-frost-100'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <main className="mt-6">
        <Active />
      </main>
    </div>
  );
}
