import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/login.css';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('oauth2') === 'success') {
      (async () => {
        try {
          const data = await api.get('/auth/oauth2/token');
          if (data?.token) {
            localStorage.setItem('token', data.token);
            login(data.user, data.token);
            redirectByRole(data.user?.role);
          }
        } catch (e) {
          setGlobalError('Error al verificar sesión OAuth2.');
        }
      })();
    }
  }, [location.search]);

  const redirectByRole = (role) => {
    const r = role?.toLowerCase();
    if (r === 'productor') navigate('/dashboard-productor');
    else if (r === 'admin') navigate('/admin');
    else navigate('/dashboard-comprador');
  };

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setGlobalError('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('errors.invalidEmail', 'Ingresa un correo válido.'));
      valid = false;
    }
    if (!password) {
      setPasswordError(t('errors.passwordRequired', 'La contraseña es requerida.'));
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      login(data.user || data, data.token);
      redirectByRole((data.user || data)?.role);
    } catch (err) {
      setGlobalError(err.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      {/* LEFT PANEL: FORM */}
      <div className="left-panel">
        <Link to="/home" className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
            </svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: 'auto 0', maxWidth: '400px', width: '100%' }}>
          <h1 className="page-title">{t('auth.loginTitle', 'Bienvenido de nuevo')}</h1>
          <p className="page-sub">{t('auth.loginSub', 'Ingresa tus credenciales para continuar.')}</p>

          {globalError && (
            <div className="global-error" id="globalError" style={{ display: 'block' }}>
              {globalError}
            </div>
          )}

          <form id="loginForm" noValidate onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                {t('auth.email', 'Correo electrónico')}
              </label>
              <input
                className="form-input"
                type="email"
                id="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <span className="form-error" id="emailError">{emailError}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                {t('auth.password', 'Contraseña')}
              </label>
              <input
                className="form-input"
                type="password"
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && <span className="form-error" id="passwordError">{passwordError}</span>}
            </div>

            <button type="submit" className="btn-submit" id="submitBtn" disabled={loading}>
              {loading ? 'Ingresando...' : t('auth.submit', 'Iniciar sesión')}
            </button>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            ¿No tienes cuenta? <Link to="/registro">{t('auth.registerFree', 'Regístrate gratis')}</Link>
          </div>
          <div className="form-footer" style={{ marginTop: '12px', fontSize: '0.75rem', color: '#8a8a8a' }}>
            Acceso demo: admin@agromarket.co · productor@agromarket.co · comprador@agromarket.co
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '24px', fontSize: '0.75rem', color: '#9a9a9a' }}>
          &copy; 2026 AgroMarket ASAFRUT. Todos los derechos reservados.
        </div>
      </div>

      {/* RIGHT PANEL: IMAGE & OVERLAY */}
      <div className="right-panel">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="Cultivos" className="bg-img" />
        <div className="right-overlay">
          <div className="right-badge">🌿 Plataforma oficial de la Asociación</div>
          <h2 className="right-title">Conectando el campo con tu mesa.</h2>
          <p className="right-sub">
            Accede a tu panel de control para gestionar tus productos, pedidos o realizar compras frescas directo a los productores de Urabá.
          </p>
        </div>
      </div>
    </div>
  );
}
