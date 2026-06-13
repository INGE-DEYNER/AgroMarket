import { useState } from 'react';
import useStyles from '../hooks/useStyles';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

export default function RecuperarContrasena() {
  useStyles(["/css/login.css"]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError(t('forgotPass.inputEmailError', 'Ingresa tu correo electrónico.')); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/recuperar-contrasena', { correo: email });
      setSent(true);
      setTimeout(() => {
        navigate('/restablecer-contrasena', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.message || t('forgotPass.sendError', 'Error al enviar el correo.'));
    } finally {
      setLoading(false);
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
          <h1 className="page-title">{t('forgotPass.title', '¿Olvidaste tu contraseña?')}</h1>
          <p className="page-sub">{t('forgotPass.sub', 'Ingresa tu correo y te enviaremos un código de recuperación de 6 dígitos.')}</p>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '3rem' }}>✅</div>
              <p style={{ marginTop: '16px' }}>{t('forgotPass.sentSuccess', 'Código enviado. Redirigiendo para que lo ingreses...')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="global-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}
              <div className="form-group">
                <label className="form-label" htmlFor="email">{t('auth.email', 'Correo electrónico')}</label>
                <input className="form-input" type="email" id="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? t('forgotPass.sendingBtn', 'Enviando...') : t('forgotPass.sendBtn', 'Enviar código de recuperación')}
              </button>
            </form>
          )}

          <div className="form-footer" style={{ marginTop: '16px' }}>
            <Link to="/login">{t('forgotPass.backToLogin', '← Volver al inicio de sesión')}</Link>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="Cultivos" className="bg-img" />
        <div className="right-overlay">
          <div className="right-badge">{t('forgotPass.badge', '🌿 AgroMarket ASAFRUT')}</div>
          <h2 className="right-title">{t('forgotPass.rightTitle', 'Recupera tu acceso fácilmente.')}</h2>
          <p className="right-sub">{t('forgotPass.rightSub', 'Tu cuenta está a salvo. Solo sigue las instrucciones y verifica con el código.')}</p>
        </div>
      </div>
    </div>
  );
}
