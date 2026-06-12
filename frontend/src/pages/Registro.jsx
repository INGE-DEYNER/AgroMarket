import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
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

  const selectRole = (r) => setRol(r);

  const validate = () => {
    const errs = {};
    if (!nombre.trim()) errs.nombre = t('errors.required', 'Campo requerido.');
    if (!apellido.trim()) errs.apellido = t('errors.required', 'Campo requerido.');
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = t('errors.invalidEmail', 'Ingresa un correo válido.');
    if (!telefono.trim()) errs.telefono = t('errors.required', 'Campo requerido.');
    if (password.length < 6) errs.password = t('errors.minPassword', 'Mínimo 6 caracteres.');
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
      await api.post('/auth/register', {
        nombre,
        apellido,
        email,
        telefono,
        password,
        role: rol.toUpperCase(),
        ubicacion: rol === 'productor' ? ubicacion : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/verificar-correo'), 2000);
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
              {errors.nombre && <span className="form-error" id="nombreError">{errors.nombre}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellido">{t('auth.lastName', 'Apellido')}</label>
              <input className="form-input" type="text" id="apellido" placeholder="Pérez" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              {errors.apellido && <span className="form-error" id="apellidoError">{errors.apellido}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.email', 'Correo electrónico')}</label>
            <input className="form-input" type="email" id="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <span className="form-error" id="emailError">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="telefono">{t('auth.phone', 'Teléfono')}</label>
            <input className="form-input" type="tel" id="telefono" placeholder="3001234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            {errors.telefono && <span className="form-error" id="telefonoError">{errors.telefono}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t('auth.password', 'Contraseña')}</label>
              <input className="form-input" type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              {errors.password && <span className="form-error" id="passwordError">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPass">{t('auth.confirmPassword', 'Confirmar contraseña')}</label>
              <input className="form-input" type="password" id="confirmPass" placeholder="••••••••" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              {errors.confirmPass && <span className="form-error" id="confirmError">{errors.confirmPass}</span>}
            </div>
          </div>

          {/* EXTRA FIELD FOR PRODUCER */}
          {rol === 'productor' && (
            <div className="form-group extra-field" id="ubicacionGroup">
              <label className="form-label" htmlFor="ubicacion">{t('auth.location', 'Ubicación / Vereda')}</label>
              <input className="form-input" type="text" id="ubicacion" placeholder="Ej. Vereda Las Margaritas, Chigorodó" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
              {errors.ubicacion && <span className="form-error" id="ubicacionError">{errors.ubicacion}</span>}
            </div>
          )}

          <input type="hidden" id="rolSelected" value={rol} />

          <button type="submit" className="btn-submit" id="submitBtn" disabled={loading}>
            {loading ? 'Creando cuenta...' : t('auth.createAccount', 'Crear cuenta')}
          </button>

          {success && (
            <div className="success-msg" id="successMsg" style={{ display: 'flex' }}>
              <span>✔</span>
              <span>Cuenta creada. Redirigiendo al inicio de sesión...</span>
            </div>
          )}
        </form>

        <div className="form-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
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
