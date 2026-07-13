import { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldMinus,
  BarChart3,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge, Spinner, EmptyState } from '../../components/ui';
import { orNull } from '../../lib/format';
import UserFormModal from '../../components/UserFormModal';
import UserStatsModal from '../../components/UserStatsModal';

export default function UsuariosTab() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // user object or 'new'
  const [statsFor, setStatsFor] = useState(null); // user id

  async function load() {
    try {
      const d = await api('/admin/users');
      setUsers(d.users);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(u) {
    const next = u.role === 'admin' ? 'jugador' : 'admin';
    try {
      await api(`/admin/users/${u.id}/role`, { method: 'PUT', body: { role: next } });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function remove(u) {
    if (!confirm(`¿Eliminar al usuario "${u.username}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api(`/admin/users/${u.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (error) return <EmptyState icon={UsersIcon} title="No se pudieron cargar los usuarios" hint={error} />;
  if (!users) return <Spinner />;

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon size={18} className="text-grape-400" />
            <h2 className="text-lg font-bold">Gestión de usuarios</h2>
          </div>
          <p className="mt-1 text-sm text-frost-400">
            Crea, edita o elimina usuarios y asigna el rol de administrador.
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setEditing('new')}>
          Nuevo usuario
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-frost-400">
              <Th>ID</Th>
              <Th>Usuario</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Sexo</Th>
              <Th right>Edad</Th>
              <Th>País</Th>
              <Th>Ciudad</Th>
              <Th>Grado</Th>
              <Th right>Partidas</Th>
              <Th right>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink-800/60 hover:bg-ink-800/40">
                <td className="px-3 py-3 tabular-nums text-frost-400">{u.id}</td>
                <td className="px-3 py-3 font-semibold text-frost-100">{u.username}</td>
                <td className="px-3 py-3 text-frost-300">{orNull(u.email)}</td>
                <td className="px-3 py-3">
                  {u.role === 'admin' ? <Badge tone="honey">admin</Badge> : <Badge tone="grape">jugador</Badge>}
                </td>
                <td className="px-3 py-3 text-frost-300">{orNull(u.sexo)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-frost-300">{orNull(u.edad)}</td>
                <td className="px-3 py-3 text-frost-300">{orNull(u.pais)}</td>
                <td className="px-3 py-3 text-frost-300">{orNull(u.ciudad)}</td>
                <td className="px-3 py-3 text-frost-300">{orNull(u.grado)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-frost-300">{u.partidas}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconBtn title="Estadísticas" onClick={() => setStatsFor(u.id)} icon={BarChart3} tone="info" />
                    <IconBtn title="Editar" onClick={() => setEditing(u)} icon={Pencil} tone="info" />
                    {u.role === 'admin' ? (
                      <IconBtn title="Quitar admin" onClick={() => toggleRole(u)} icon={ShieldMinus} tone="warn" />
                    ) : (
                      <IconBtn title="Hacer admin" onClick={() => toggleRole(u)} icon={ShieldCheck} tone="success" />
                    )}
                    <IconBtn
                      title="Eliminar"
                      onClick={() => remove(u)}
                      icon={Trash2}
                      tone="danger"
                      disabled={u.id === me.id}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <UserFormModal
          user={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {statsFor && <UserStatsModal userId={statsFor} onClose={() => setStatsFor(null)} />}
    </Card>
  );
}

function Th({ children, right }) {
  return <th className={`px-3 py-3 font-semibold ${right ? 'text-right' : 'text-left'}`}>{children}</th>;
}

const TONES = {
  info: 'bg-ink-700 text-frost-100 hover:bg-ink-600',
  success: 'bg-mint-400/20 text-mint-400 hover:bg-mint-400/30',
  warn: 'bg-honey-500/20 text-honey-400 hover:bg-honey-500/30',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
};

function IconBtn({ title, onClick, icon: Icon, tone = 'info', disabled }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${TONES[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
}
