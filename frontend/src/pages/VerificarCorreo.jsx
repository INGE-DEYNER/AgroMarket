import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import useStyles from '../hooks/useStyles';
import api from '../utils/api';

export default function VerificarCorreo() {
  useStyles(["/css/login.css"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();

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
      setSuccess(res.message || 'Correo verificado con éxito.');
    } catch (err) {
      setError(err.message || 'Error al verificar el token.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCodigo = async (e) => {
    e.preventDefault();
    if (!email || !codigo) {
      setError('Debes ingresar el correo y el código de 6 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/verificar-correo', { correo: email, codigo });
      if (res.pendiente) setPendiente(true);
      setSuccess(res.message || 'Correo verificado con éxito.');
    } catch (err) {
      setError(err.message || 'Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Ingresa tu correo para reenviar el código.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/reenviar-verificacion', { correo: email });
      setSuccess('Código reenviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      setError(err.message || 'Error al reenviar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Link to="/home" className="brand" style={{ justifyContent: 'center' }}>
          <div className="brand-logo">
            <svg viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" /></svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: 'auto 0', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📧</div>
          <h1 className="page-title">{success && pendiente ? '¡Casi listo!' : 'Verifica tu correo'}</h1>
          
          {error && <div className="global-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}
          
          {success ? (
            <div style={{ padding: '24px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
              <p style={{ fontWeight: '500', color: '#2c3e50', marginBottom: '16px' }}>{success}</p>
              {pendiente && (
                <p style={{ color: '#e67e22', fontSize: '0.9rem', marginBottom: '24px', backgroundColor: '#fff3e0', padding: '12px', borderRadius: '8px' }}>
                  ⏳ Como Productor, tu cuenta está ahora en revisión por un administrador. Te notificaremos cuando puedas acceder.
                </p>
              )}
              <Link to="/login" className="btn-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <p className="page-sub">
                Te hemos enviado un código de verificación de 6 dígitos. Ingrésalo a continuación para activar tu cuenta.
              </p>
              
              <form onSubmit={handleSubmitCodigo} style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input className="form-input" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="codigo">Código de 6 dígitos</label>
                  <input className="form-input" type="text" id="codigo" placeholder="123456" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value)} required style={{ letterSpacing: '8px', fontSize: '1.2rem', textAlign: 'center' }} />
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
              </form>

              <div className="form-footer" style={{ marginTop: '20px' }}>
                ¿No recibiste el correo? <a href="#" onClick={handleReenviar}>Reenviar código</a>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="right-panel">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="Cultivos" className="bg-img" />
        <div className="right-overlay">
          <div className="right-badge">🌿 Plataforma oficial de la Asociación</div>
          <h2 className="right-title">¡Ya casi estás!</h2>
          <p className="right-sub">Verifica tu correo para comenzar a comprar o vender en AgroMarket.</p>
        </div>
      </div>
    </div>
  );
}
