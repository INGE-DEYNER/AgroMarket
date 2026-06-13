import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Perfil() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === 'comprador') {
      return <Navigate to="/dashboard-comprador?section=perfil" replace />;
    } else if (role === 'productor') {
      return <Navigate to="/dashboard-productor?section=perfil" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin?section=perfil" replace />;
    }
  }

  return (
    <div style={{ padding: '40px 32px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>{t('profile.title', 'Mi Perfil')}</h1>
      {user ? (
        <div className="card-table" style={{ padding: '24px' }}>
          <div className="avatar avatar-blue" style={{ width: '64px', height: '64px', fontSize: '1.5rem', marginBottom: '16px' }}>
            {user.nombre?.charAt(0)?.toUpperCase()}{user.apellido?.charAt(0)?.toUpperCase()}
          </div>
          <p><strong>{t('profile.name', 'Nombre')}:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>{t('profile.email', 'Correo')}:</strong> {user.email}</p>
          <p><strong>{t('profile.role', 'Rol')}:</strong> {t('auth.' + user.role?.toLowerCase(), user.role)}</p>
          {user.telefono && <p><strong>{t('profile.phone', 'Teléfono')}:</strong> {user.telefono}</p>}
          {user.ubicacion && <p><strong>{t('profile.location', 'Ubicación')}:</strong> {user.ubicacion}</p>}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Link to={user.role?.toLowerCase() === 'productor' ? '/dashboard-productor' : user.role?.toLowerCase() === 'admin' ? '/admin' : '/dashboard-comprador'} className="btn btn-secondary">
              {t('profile.backToPanel', '← Mi Panel')}
            </Link>
            <button className="btn btn-primary" onClick={logout} style={{ color: 'var(--red)', background: 'transparent', border: '1px solid var(--red)' }}>
              {t('profile.logout', 'Cerrar sesión')}
            </button>
          </div>
        </div>
      ) : (
        <p>{t('profile.notLoggedIn', 'No has iniciado sesión.')} <Link to="/login">{t('profile.loginLink', 'Inicia sesión')}</Link></p>
      )}
    </div>
  );
}
