// File: frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { normalizarRol } from '../utils/auth.js';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#6b7280', fontWeight: 600, gap: 12 }}>
        <span
          style={{
            width: '20px', height: '20px',
            border: '3px solid #d1d5db',
            borderTopColor: '#1f7a3a',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'agro-spin 0.8s linear infinite',
          }}
        />
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.replace('/login.html');
    return null;
  }

  if (allowedRoles.length > 0) {
    const normalizedUserRole = normalizarRol(user?.rol);
    const normalizedAllowed = allowedRoles.map(normalizarRol);
    if (!normalizedAllowed.includes(normalizedUserRole)) {
      window.location.replace('/login.html');
      return null;
    }
  }

  return children;
}
