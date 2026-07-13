import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CakeSlice, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

const GRADOS = ['Primaria', 'Secundaria', 'Preparatoria', 'Universitario', 'Posgrado', 'Otro'];
const SEXOS = ['Masculino', 'Femenino', 'Otro'];

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    login: '',
    username: '',
    email: '',
    password: '',
    sexo: '',
    edad: '',
    pais: 'Mexico',
    ciudad: '',
    grado: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.login, form.password);
      } else {
        user = await register({
          username: form.username,
          email: form.email,
          password: form.password,
          sexo: form.sexo || null,
          edad: form.edad ? Number(form.edad) : null,
          pais: form.pais || null,
          ciudad: form.ciudad || null,
          grado: form.grado || null,
        });
      }
      navigate(user.role === 'admin' ? '/admin' : '/jugador', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-gradient-to-br from-berry-500 to-grape-500 p-3 shadow-lg shadow-grape-500/30">
            <CakeSlice size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pastel Rush</h1>
          <p className="mt-1 text-sm text-frost-400">
            Inicia sesión para cocinar, competir y subir en el ranking.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-700/70 bg-ink-850/80 p-6 shadow-xl shadow-black/40 backdrop-blur">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-ink-900/70 p-1">
            <TabButton active={mode === 'login'} onClick={() => setMode('login')} icon={LogIn}>
              Entrar
            </TabButton>
            <TabButton active={mode === 'register'} onClick={() => setMode('register')} icon={UserPlus}>
              Crear cuenta
            </TabButton>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === 'login' ? (
              <Field label="Usuario o email">
                <input
                  className={inputClass}
                  value={form.login}
                  onChange={set('login')}
                  autoComplete="username"
                  required
                />
              </Field>
            ) : (
              <>
                <Field label="Nombre de usuario">
                  <input className={inputClass} value={form.username} onChange={set('username')} required />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    required
                  />
                </Field>
              </>
            )}

            <Field label="Contraseña">
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </Field>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Field label="Sexo">
                  <select className={inputClass} value={form.sexo} onChange={set('sexo')}>
                    <option value="">—</option>
                    {SEXOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Edad">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    className={inputClass}
                    value={form.edad}
                    onChange={set('edad')}
                  />
                </Field>
                <Field label="País">
                  <input className={inputClass} value={form.pais} onChange={set('pais')} />
                </Field>
                <Field label="Ciudad">
                  <input className={inputClass} value={form.ciudad} onChange={set('ciudad')} />
                </Field>
                <div className="col-span-2">
                  <Field label="Grado de estudios">
                    <select className={inputClass} value={form.grado} onChange={set('grado')}>
                      <option value="">—</option>
                      {GRADOS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={busy}
              icon={mode === 'login' ? LogIn : UserPlus}
            >
              {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-ink-700 bg-ink-900/80 px-3 py-2 text-sm text-frost-100 outline-none transition-colors placeholder:text-frost-400/60 focus:border-grape-400 focus:ring-2 focus:ring-grape-500/30';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-frost-400">{label}</span>
      {children}
    </label>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        active ? 'bg-honey-500 text-ink-950' : 'text-frost-300 hover:bg-ink-800'
      }`}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}
