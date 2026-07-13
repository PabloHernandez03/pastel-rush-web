import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import Modal from './Modal';
import { Button } from './ui';

const GRADOS = ['Primaria', 'Secundaria', 'Preparatoria', 'Universitario', 'Posgrado', 'Otro'];
const SEXOS = ['Masculino', 'Femenino', 'Otro'];

export default function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'jugador',
    sexo: user?.sexo ?? '',
    edad: user?.edad ?? '',
    pais: user?.pais ?? 'Mexico',
    ciudad: user?.ciudad ?? '',
    grado: user?.grado ?? '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const payload = {
      username: form.username,
      email: form.email,
      role: form.role,
      sexo: form.sexo || null,
      edad: form.edad ? Number(form.edad) : null,
      pais: form.pais || null,
      ciudad: form.ciudad || null,
      grado: form.grado || null,
    };
    if (form.password) payload.password = form.password;

    try {
      if (isEdit) {
        await api(`/admin/users/${user.id}`, { method: 'PUT', body: payload });
      } else {
        if (!form.password) throw new Error('La contraseña es obligatoria para un nuevo usuario');
        await api('/admin/users', { method: 'POST', body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={isEdit ? `Editar a ${user.username}` : 'Nuevo usuario'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usuario">
            <input className={input} value={form.username} onChange={set('username')} required />
          </Field>
          <Field label="Email">
            <input type="email" className={input} value={form.email} onChange={set('email')} required />
          </Field>
          <Field label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}>
            <input
              type="password"
              className={input}
              value={form.password}
              onChange={set('password')}
              placeholder={isEdit ? 'Dejar en blanco para no cambiar' : ''}
            />
          </Field>
          <Field label="Rol">
            <select className={input} value={form.role} onChange={set('role')}>
              <option value="jugador">jugador</option>
              <option value="admin">admin</option>
            </select>
          </Field>
          <Field label="Sexo">
            <select className={input} value={form.sexo} onChange={set('sexo')}>
              <option value="">—</option>
              {SEXOS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Edad">
            <input type="number" min="1" max="120" className={input} value={form.edad} onChange={set('edad')} />
          </Field>
          <Field label="País">
            <input className={input} value={form.pais} onChange={set('pais')} />
          </Field>
          <Field label="Ciudad">
            <input className={input} value={form.ciudad} onChange={set('ciudad')} />
          </Field>
          <div className="col-span-2">
            <Field label="Grado de estudios">
              <select className={input} value={form.grado} onChange={set('grado')}>
                <option value="">—</option>
                {GRADOS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const input =
  'w-full rounded-lg border border-ink-700 bg-ink-900/80 px-3 py-2 text-sm text-frost-100 outline-none focus:border-grape-400 focus:ring-2 focus:ring-grape-500/30';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-frost-400">{label}</span>
      {children}
    </label>
  );
}
