import { useState } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function RestablecerContrasena() {
  useStyles(["/css/login.css"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (password !== confirmPass) { setError('Las contraseñas no coinciden.'); return; }
    setError('');
    try {
      await api.post('/auth/restablecer-contrasena', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel">
        <Link to="/home" className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" /></svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: 'auto 0', maxWidth: '400px', width: '100%' }}>
          <h1 className="page-title">Restablecer contraseña</h1>
          <p className="page-sub">Ingresa tu nueva contraseña.</p>

          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '3rem' }}>✅</div>
              <p>Contraseña restablecida. Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="global-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}
              <div className="form-group">
                <label className="form-label" htmlFor="password">Nueva contraseña</label>
                <input className="form-input" type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPass">Confirmar contraseña</label>
                <input className="form-input" type="password" id="confirmPass" placeholder="••••••••" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              </div>
              <button type="submit" className="btn-submit">Restablecer contraseña</button>
            </form>
          )}

          <div className="form-footer" style={{ marginTop: '16px' }}>
            <Link to="/login">← Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="Cultivos" className="bg-img" />
        <div className="right-overlay">
          <div className="right-badge">🌿 AgroMarket ASAFRUT</div>
          <h2 className="right-title">Tu nueva contraseña es tu llave.</h2>
          <p className="right-sub">Crea una contraseña segura para proteger tu cuenta.</p>
        </div>
      </div>
    </div>
  );
}
