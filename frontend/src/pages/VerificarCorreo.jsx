import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import '../styles/login.css';

export default function VerificarCorreo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  const { t } = useTranslation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendiente, setPendiente] = useState(false);

  useEffect(() => {
    if (token) {
      verificarPorToken(token);
    }
  }, [token]);

  const verificarPorToken = async (tk) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verificar', { token: tk });
      if (res.pendiente) setPendiente(true);
      setSuccess(res.message || t('verifyEmail.successVerifying', 'Correo verificado con éxito.'));
    } catch (err) {
      setError(err.message || t('verifyEmail.errorVerifying', 'Error al verificar el token.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCodigo = async (e) => {
    e.preventDefault();
    if (!email || !codigo) {
      setError(t('verifyEmail.inputCodeError', 'Debes ingresar el correo y el código de 6 dígitos.'));
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/verificar-correo', { correo: email, codigo });
      if (res.pendiente) setPendiente(true);
      setSuccess(res.message || t('verifyEmail.successVerifying', 'Correo verificado con éxito.'));
    } catch (err) {
      setError(err.message || t('verifyEmail.incorrectCodeError', 'Código incorrecto o expirado.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(t('verifyEmail.resendInputError', 'Ingresa tu correo para reenviar el código.'));
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/reenviar-verificacion', { correo: email });
      setSuccess(t('verifyEmail.resendSuccess', 'Código reenviado. Revisa tu bandeja de entrada.'));
    } catch (err) {
      setError(err.message || t('verifyEmail.resendError', 'Error al reenviar.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Link to="/home" className="brand" style={{ justifyContent: 'center' }}>
          <div className="brand-logo">
            <img src="/logo-asafrut.jpg" alt="Asafrut Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: 'auto 0', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}></div>
          <h1 className="page-title">{success && pendiente ? t('verifyEmail.pendingTitle', '¡Casi listo!') : t('verifyEmail.title', 'Verifica tu correo')}</h1>
          
          {error && <div className="global-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}
          
          {success ? (
            <div style={{ padding: '24px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}></div>
              <p style={{ fontWeight: '500', color: '#2c3e50', marginBottom: '16px' }}>{success}</p>
              {pendiente && (
                <p style={{ color: '#e67e22', fontSize: '0.9rem', marginBottom: '24px', backgroundColor: '#fff3e0', padding: '12px', borderRadius: '8px' }}>
                  {t('verifyEmail.pendingProducerDesc', ' Como Productor, tu cuenta está ahora en revisión por un administrador. Te notificaremos cuando puedas acceder.')}
                </p>
              )}
              <Link to="/login" className="btn-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                {t('verifyEmail.loginLinkBtn', 'Ir al inicio de sesión')}
              </Link>
            </div>
          ) : (
            <>
              <p className="page-sub">
                {t('verifyEmail.sub', 'Te hemos enviado un código de verificación de 6 dígitos. Ingrésalo a continuación para activar tu cuenta.')}
              </p>
              
              <form onSubmit={handleSubmitCodigo} style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">{t('auth.email', 'Correo electrónico')}</label>
                  <input className="form-input" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="codigo">{t('verifyEmail.codeLabel', 'Código de 6 dígitos')}</label>
                  <input className="form-input" type="text" id="codigo" placeholder="123456" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value)} required style={{ letterSpacing: '8px', fontSize: '1.2rem', textAlign: 'center' }} />
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? t('verifyEmail.verifyingBtn', 'Verificando...') : t('verifyEmail.verifyBtn', 'Verificar')}
                </button>
              </form>

              <div className="form-footer" style={{ marginTop: '20px' }}>
                {t('verifyEmail.notReceived', '¿No recibiste el correo?')} <a href="#" onClick={handleReenviar}>{t('verifyEmail.resendLink', 'Reenviar código')}</a>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="right-panel">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="Cultivos" className="bg-img" loading="lazy" />
        <div className="right-overlay">
          <div className="right-badge">{t('verifyEmail.badge', ' Plataforma oficial de la Asociación')}</div>
          <h2 className="right-title">{t('verifyEmail.rightTitle', '¡Ya casi estás!')}</h2>
          <p className="right-sub">{t('verifyEmail.rightSub', 'Verifica tu correo para comenzar a comprar o vender en AgroMarket.')}</p>
        </div>
      </div>
    </div>
  );
}
