import { Link } from 'react-router-dom';
import useStyles from '../hooks/useStyles';

export default function VerificarCorreo() {
  useStyles(["/css/login.css"]);
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
          <h1 className="page-title">Verifica tu correo</h1>
          <p className="page-sub">
            Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link to="/login" className="btn-submit" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
              Ir al inicio de sesión
            </Link>
          </div>
          <div className="form-footer" style={{ marginTop: '20px' }}>
            ¿No recibiste el correo? <a href="#">Reenviar verificación</a>
          </div>
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
