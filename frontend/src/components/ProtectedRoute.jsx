// File: frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { normalizarRol } from '../utils/auth.js';
import { useTranslation } from 'react-i18next';

export default function ProtectedRoute({ children, allowedRoles = [], roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const activeRoles = allowedRoles.length > 0 ? allowedRoles : roles;

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
        {t('protectedRoute.loading', 'Cargando...')}
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.replace('/login.html');
    return null;
  }

  if (activeRoles.length > 0) {
    const normalizedUserRole = normalizarRol(user?.rol);
    const normalizedAllowed = activeRoles.map(normalizarRol);
    if (!normalizedAllowed.includes(normalizedUserRole)) {
      window.location.replace('/login.html');
      return null;
    }
  }

  return children;
}
