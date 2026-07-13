import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/ui';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import PlayerPage from './pages/PlayerPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Iniciando Pastel Rush…" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={homeFor(user)} replace /> : <LoginPage />}
      />
      <Route
        path="/admin"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role !== 'admin' ? (
            <Navigate to="/jugador" replace />
          ) : (
            <AdminPage />
          )
        }
      />
      <Route
        path="/jugador"
        element={!user ? <Navigate to="/login" replace /> : <PlayerPage />}
      />
      <Route path="*" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
    </Routes>
  );
}

function homeFor(user) {
  return user.role === 'admin' ? '/admin' : '/jugador';
}
