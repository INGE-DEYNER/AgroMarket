import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
