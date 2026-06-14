import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE } from '../utils/api';
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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('oauth2') === 'success') {
      const urlToken = params.get('token');
      (async () => {
        try {
          let authData = null;
          let token = urlToken;

          if (token) {
            // Se recibió el token directamente en la URL (evita problemas de SameSite/cookies)
            localStorage.setItem('token', token);
            const res = await api.get('/usuarios/me');
            authData = res.data || res;
          } else {
            // Intenta el intercambio de cookies tradicional como fallback
            const res = await api.get('/auth/token-exchange');
            authData = res.data || res;
            token = authData?.token;
          }

          if (token && authData) {
            localStorage.setItem('token', token);
            login(authData.user || authData, token);
            redirectByRole((authData.user || authData)?.role || authData.rol);
          } else {
            throw new Error('Token o datos de usuario no recibidos');
          }
        } catch (e) {
          setGlobalError(e.message || 'Error al verificar sesión OAuth2.');
        }
      })();
    } else if (params.get('oauth2') === 'pending') {
      setGlobalError('Tu cuenta ha sido registrada con éxito mediante Google, pero está pendiente de aprobación por un administrador.');
    }
  }, [location.search]);

  const redirectByRole = (role) => {
    const r = role?.toLowerCase();
    if (r === 'productor') navigate('/dashboard-productor');
    else if (r === 'admin' || r === 'administrador') navigate('/admin');
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
      const res = await api.post('/auth/login', { email, password });
      const authData = res.data || res;
      login(authData.user || authData, authData.token);
      redirectByRole((authData.user || authData)?.role || authData.rol);
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
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {passwordError && <span className="form-error visible" id="passwordError">{passwordError}</span>}
            </div>

            <button type="submit" className="btn-submit" id="submitBtn" disabled={loading}>
              {loading ? 'Ingresando...' : t('auth.submit', 'Iniciar sesión')}
            </button>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <Link to="/recuperar-contrasena" style={{ fontSize: '0.9rem', color: '#688e4e', textDecoration: 'none', fontWeight: '500' }}>
                {t('auth.forgotPassword', '¿Olvidaste tu contraseña?')}
              </Link>
            </div>

            <div className="divider" style={{ margin: '16px 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: '#9a9a9a' }}>
              <span style={{ flex: 1, borderBottom: '1px solid #ddd' }}></span>
              <span style={{ padding: '0 10px', fontSize: '0.85rem' }}>O</span>
              <span style={{ flex: 1, borderBottom: '1px solid #ddd' }}></span>
            </div>

            <a 
              href={`${API_BASE.replace('/api', '')}/oauth2/authorization/google`} 
              className="btn-submit" 
              style={{ backgroundColor: '#fff', color: '#444', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.73 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {t('auth.continueWithGoogle', 'Continuar con Google')}
            </a>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            {t('auth.noAccount', '¿No tienes cuenta?')} <Link to="/registro">{t('auth.registerFree', 'Regístrate gratis')}</Link>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '24px', fontSize: '0.75rem', color: '#9a9a9a' }}>
          &copy; 2026 AgroMarket ASAFRUT. Todos los derechos reservados · Desarrollado por Deyner Chaverra
        </div>
      </div>

      {/* RIGHT PANEL: IMAGE & OVERLAY */}
      <div className="right-panel">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="Cultivos" className="bg-img" loading="lazy" />
        <div className="right-overlay">
          <div className="right-badge"> Plataforma oficial de la Asociación</div>
          <h2 className="right-title">Conectando el campo con tu mesa.</h2>
          <p className="right-sub">
            Accede a tu panel de control para gestionar tus productos, pedidos o realizar compras frescas directo a los productores de Urabá.
          </p>
        </div>
      </div>
    </div>
  );
}
