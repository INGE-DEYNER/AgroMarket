import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/styles.css';

export default function Perfil() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '40px 32px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Mi Perfil</h1>
      {user ? (
        <div className="card-table" style={{ padding: '24px' }}>
          <div className="avatar avatar-blue" style={{ width: '64px', height: '64px', fontSize: '1.5rem', marginBottom: '16px' }}>
            {user.nombre?.charAt(0)?.toUpperCase()}{user.apellido?.charAt(0)?.toUpperCase()}
          </div>
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Correo:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role}</p>
          {user.telefono && <p><strong>Teléfono:</strong> {user.telefono}</p>}
          {user.ubicacion && <p><strong>Ubicación:</strong> {user.ubicacion}</p>}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Link to="/dashboard-comprador" className="btn btn-secondary">← Mi Panel</Link>
            <button className="btn btn-primary" onClick={logout} style={{ color: 'var(--red)', background: 'transparent', border: '1px solid var(--red)' }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <p>No has iniciado sesión. <Link to="/login">Inicia sesión</Link></p>
      )}
    </div>
  );
}
