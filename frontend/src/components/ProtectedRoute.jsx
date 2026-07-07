import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, logout } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!user || (token && isTokenExpired(token))) {
    return <Navigate to="/login?message=expired" replace />;
  }

  if (roles && !roles.includes(user.role?.toUpperCase()) && !roles.includes(user.role?.toLowerCase())) {
    // Redirigir según rol
    const role = user.role?.toLowerCase();
    if (role === 'productor') return <Navigate to="/dashboard-productor" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard-comprador" replace />;
  }

  return children;
}
