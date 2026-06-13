import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { API_BASE } from '../utils/api';
import '../styles/registro.css';

export default function Registro() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rol, setRol] = useState('comprador');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const selectRole = (r) => setRol(r);

  const handlePasswordChange = (val) => {
    setPassword(val);
    const errs = { ...errors };
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!val) {
      errs.password = t('errors.required', 'Campo requerido.');
    } else if (val.length < 8) {
      errs.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!strongPasswordRegex.test(val)) {
      errs.password = 'Debe contener al menos 1 mayúscula, 1 número y 1 carácter especial (ej: @$!%*?&.).';
    } else {
      delete errs.password;
    }
    setErrors(errs);
  };

  const validate = () => {
    const errs = {};
    if (!nombre.trim()) errs.nombre = t('errors.required', 'Campo requerido.');
    if (!apellido.trim()) errs.apellido = t('errors.required', 'Campo requerido.');
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = t('errors.invalidEmail', 'Ingresa un correo válido.');
    if (!telefono.trim()) errs.telefono = t('errors.required', 'Campo requerido.');
    
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!password) {
      errs.password = t('errors.required', 'Campo requerido.');
    } else if (password.length < 8) {
      errs.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!strongPasswordRegex.test(password)) {
      errs.password = 'Debe contener al menos 1 mayúscula, 1 número y 1 carácter especial (ej: @$!%*?&.).';
    }

    if (password !== confirmPass) errs.confirmPass = t('errors.passwordMismatch', 'Las contraseñas no coinciden.');
    if (rol === 'productor' && !ubicacion.trim()) errs.ubicacion = 'Campo requerido para productores.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/registro', {
        nombre,
        apellido,
        email,
        telefono,
        password,
        role: rol.toUpperCase(),
        ubicacion: rol === 'productor' ? ubicacion : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/verificar-correo', { state: { email } }), 2000);
    } catch (err) {
      setErrors({ global: err.message || 'Error al registrar.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      {/* LEFT: FORM */}
      <div className="left-panel">
        <Link className="brand" to="/login">
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

        <h1 className="page-title">{t('auth.registerTitle', 'Comienza tu viaje')}</h1>
        <p className="page-sub">{t('auth.registerSub', 'Selecciona tu perfil y únete a la revolución agrícola.')}</p>

        {errors.global && <div className="global-error" style={{ display: 'block', marginBottom: '16px' }}>{errors.global}</div>}

        {/* ROLE SELECTOR */}
        <div className="role-selector">
          <div
            className={`role-card${rol === 'comprador' ? ' selected' : ''}`}
            id="roleComprador"
            onClick={() => selectRole('comprador')}
          >
            <div className="role-check">
              <svg viewBox="0 0 10 8">
                <path d="M1 4l3 3 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="role-icon">🛒</div>
            <div className="role-name">{t('auth.buyer', 'Comprador')}</div>
            <div className="role-desc">Acceso a los mejores precios de origen</div>
          </div>
          <div
            className={`role-card${rol === 'productor' ? ' selected' : ''}`}
            id="roleProductor"
            onClick={() => selectRole('productor')}
          >
            <div className="role-check">
              <svg viewBox="0 0 10 8">
                <path d="M1 4l3 3 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="role-icon">🌾</div>
            <div className="role-name">{t('auth.producer', 'Productor')}</div>
            <div className="role-desc">Vende directamente sin intermediarios</div>
          </div>
        </div>

        {/* FORM */}
        <form id="regForm" noValidate onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">{t('auth.firstName', 'Nombre')}</label>
              <input className="form-input" type="text" id="nombre" placeholder="Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              {errors.nombre && <span className="form-error visible" id="nombreError">{errors.nombre}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellido">{t('auth.lastName', 'Apellido')}</label>
              <input className="form-input" type="text" id="apellido" placeholder="Pérez" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              {errors.apellido && <span className="form-error visible" id="apellidoError">{errors.apellido}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.email', 'Correo electrónico')}</label>
            <input className="form-input" type="email" id="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <span className="form-error visible" id="emailError">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="telefono">{t('auth.phone', 'Teléfono')}</label>
            <input className="form-input" type="tel" id="telefono" placeholder="3001234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            {errors.telefono && <span className="form-error visible" id="telefonoError">{errors.telefono}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t('auth.password', 'Contraseña')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
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
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.password && <span className="form-error visible" id="passwordError">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPass">{t('auth.confirmPassword', 'Confirmar contraseña')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPass"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                >
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.confirmPass && <span className="form-error visible" id="confirmError">{errors.confirmPass}</span>}
            </div>
          </div>

          {/* EXTRA FIELD FOR PRODUCER */}
          {rol === 'productor' && (
            <div className="form-group extra-field visible" id="ubicacionGroup">
              <label className="form-label" htmlFor="ubicacion">{t('auth.location', 'Ubicación / Vereda')}</label>
              <input className="form-input" type="text" id="ubicacion" placeholder="Ej. Vereda Las Margaritas, Chigorodó" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
              {errors.ubicacion && <span className="form-error visible" id="ubicacionError">{errors.ubicacion}</span>}
            </div>
          )}

          <input type="hidden" id="rolSelected" value={rol} />

          <button type="submit" className="btn-submit" id="submitBtn" disabled={loading}>
            {loading ? 'Creando cuenta...' : t('auth.createAccount', 'Crear cuenta')}
          </button>

          {success && (
            <div className="success-msg visible" id="successMsg">
              <span>✔</span>
              <span>{t('auth.accountCreated', 'Cuenta creada. Redirigiendo a verificación...')}</span>
            </div>
          )}

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
            {t('auth.registerWithGoogle', 'Registrarse con Google')}
          </a>
        </form>

        <div className="form-footer">
          {t('auth.haveAccount', '¿Ya tienes cuenta?')} <Link to="/login">{t('auth.signIn', 'Inicia sesión')}</Link>
        </div>
      </div>

      {/* RIGHT: IMAGE */}
      <div className="right-panel">
        <img
          className="bg-img"
          src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200"
          alt="Frutas tropicales"
          loading="lazy"
        />
        <div className="right-overlay">
          <div className="right-badge">🌿 ASAFRUT · Chigorodó, Antioquia</div>
          <h2 className="right-title">Del campo de Urabá<br />a tu hogar.</h2>
          <p className="right-sub">
            Garantizamos trazabilidad total y precios justos para quienes cultivan la tierra y quienes disfrutan sus frutos.
          </p>
          <div className="right-features">
            <div className="right-feat">
              <span className="feat-icon">🔐</span>
              <span className="feat-text"><strong style={{ color: '#fff' }}>Trazabilidad total</strong><br />Conoce el origen exacto de cada fruta que compras.</span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">💰</span>
              <span className="feat-text"><strong style={{ color: '#fff' }}>Precios justos</strong><br />Sin intermediarios. Directo del productor al consumidor.</span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">🚚</span>
              <span className="feat-text"><strong style={{ color: '#fff' }}>Envíos seguros</strong><br />Seguimiento en tiempo real desde Urabá hasta tu puerta.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
