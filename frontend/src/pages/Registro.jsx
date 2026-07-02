import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { API_BASE } from '../utils/api';
import '../styles/registro.css';

const COUNTRY_CODES = [
  { code: '+57', name: 'Colombia (🇨🇴)' },
  { code: '+1', name: 'USA (🇺🇸)' },
  { code: '+34', name: 'España (🇪🇸)' },
  { code: '+52', name: 'México (🇲🇽)' },
  { code: '+54', name: 'Argentina (🇦🇷)' },
  { code: '+56', name: 'Chile (🇨🇱)' },
  { code: '+51', name: 'Perú (🇵🇪)' },
  { code: '+58', name: 'Venezuela (🇻🇪)' },
];

export default function Registro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [rol, setRol] = useState('comprador'); // comprador | comprador_empresa | productor
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [codigoPais, setCodigoPais] = useState('+57');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nit, setNit] = useState('');

  // Phone validation states
  const [smsEnviado, setSmsEnviado] = useState(false);
  const [smsCodigo, setSmsCodigo] = useState('');
  const [telefonoVerificado, setTelefonoVerificado] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (success) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      const accion = params.get('accion');

      if (redirect) {
        const productoPendiente = localStorage.getItem('producto_pendiente');
        if (productoPendiente && accion === 'comprar') {
          navigate(redirect + '?accion=comprar');
        } else {
          navigate(redirect);
        }
      }
    }
  }, [success, location.search, navigate]);

  // Real-time validations on changes
  useEffect(() => {
    if (nombre) validateField('nombre', nombre);
  }, [nombre]);

  useEffect(() => {
    if (apellido) validateField('apellido', apellido);
  }, [apellido]);

  useEffect(() => {
    if (email) validateField('email', email);
  }, [email]);

  useEffect(() => {
    if (telefono) validateField('telefono', telefono);
  }, [telefono]);

  useEffect(() => {
    if (password) validateField('password', password);
  }, [password, confirmPass]);

  useEffect(() => {
    if (confirmPass) validateField('confirmPass', confirmPass);
  }, [confirmPass, password]);

  useEffect(() => {
    if (ubicacion) validateField('ubicacion', ubicacion);
  }, [ubicacion, rol]);

  useEffect(() => {
    if (nombreEmpresa) validateField('nombreEmpresa', nombreEmpresa);
  }, [nombreEmpresa, rol]);

  useEffect(() => {
    if (nit) validateField('nit', nit);
  }, [nit, rol]);

  const handleGoogleRegistro = () => {
    const rolSeleccionado = rol === 'comprador_empresa' ? 'EMPRESA' : rol.toUpperCase();
    window.location.href = `${API_BASE.replace('/api', '')}/oauth2/authorization/google?role=${rolSeleccionado}`;
  };

  const validateField = (field, val) => {
    const errs = { ...errors };
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

    switch (field) {
      case 'nombre':
        if (!val.trim()) errs.nombre = t('errors.required', 'Campo requerido.');
        else delete errs.nombre;
        break;
      case 'apellido':
        if (!val.trim()) errs.apellido = t('errors.required', 'Campo requerido.');
        else delete errs.apellido;
        break;
      case 'email':
        if (!val || !/\S+@\S+\.\S+/.test(val)) errs.email = t('errors.invalidEmail', 'Ingresa un correo válido.');
        else delete errs.email;
        break;
      case 'telefono':
        if (!val.trim()) errs.telefono = t('errors.required', 'Campo requerido.');
        else if (!/^\d{7,15}$/.test(val.trim())) errs.telefono = 'Teléfono debe contener entre 7 y 15 dígitos.';
        else delete errs.telefono;
        break;
      case 'password':
        if (!val) errs.password = t('errors.required', 'Campo requerido.');
        else if (val.length < 8) errs.password = 'La contraseña debe tener al menos 8 caracteres.';
        else if (!strongPasswordRegex.test(val)) errs.password = 'Debe contener al menos 1 mayúscula, 1 número y 1 carácter especial (ej: @$!%*?&.).';
        else delete errs.password;
        break;
      case 'confirmPass':
        if (val !== password) errs.confirmPass = t('errors.passwordMismatch', 'Las contraseñas no coinciden.');
        else delete errs.confirmPass;
        break;
      case 'ubicacion':
        if (rol === 'productor' && !val.trim()) errs.ubicacion = 'Campo requerido para productores.';
        else delete errs.ubicacion;
        break;
      case 'nombreEmpresa':
        if (rol === 'comprador_empresa' && !val.trim()) errs.nombreEmpresa = 'Nombre de empresa requerido.';
        else delete errs.nombreEmpresa;
        break;
      case 'nit':
        if (rol === 'comprador_empresa' && !val.trim()) errs.nit = 'NIT requerido.';
        else delete errs.nit;
        break;
      default:
        break;
    }
    setErrors(errs);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#e0e0e0', width: '0%' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[@$!%*?&.]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Débil ❌', color: '#e53935', width: '33%' };
    if (score <= 3) return { score: 2, label: 'Media ⚡', color: '#ff9800', width: '66%' };
    return { score: 3, label: 'Fuerte 💪', color: '#4caf50', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSendSms = async () => {
    setSmsError('');
    if (!telefono || errors.telefono) {
      setSmsError('Ingresa un teléfono válido antes de verificar.');
      return;
    }
    setTelefonoVerificado(true);
  };

  const handleVerifySms = async () => {
    setSmsError('');
    if (!smsCodigo || smsCodigo.length !== 6) {
      setSmsError('El código debe ser de 6 dígitos.');
      return;
    }
    setSmsLoading(true);
    const fullPhone = codigoPais + telefono.trim();
    try {
      await api.post('/auth/verificar-sms', { telefono: fullPhone, codigo: smsCodigo });
      setTelefonoVerificado(true);
      setSmsEnviado(false);
    } catch (err) {
      setSmsError(err.message || 'Código SMS incorrecto.');
    } finally {
      setSmsLoading(false);
    }
  };

  const validateAll = () => {
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
    if (rol === 'comprador_empresa' && !nombreEmpresa.trim()) errs.nombreEmpresa = 'Nombre de empresa requerido.';
    if (rol === 'comprador_empresa' && !nit.trim()) errs.nit = 'NIT requerido.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateAll();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!telefonoVerificado) {
      setErrors({ global: 'Debes verificar tu número de teléfono por SMS antes de registrarte.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre,
        apellido,
        email,
        telefono: codigoPais + telefono.trim(),
        codigoPais,
        password,
        confirmPassword: confirmPass,
        rol: rol === 'comprador_empresa' ? 'COMPRADOR_EMPRESA' : rol.toUpperCase(),
        ubicacion: rol === 'productor' ? ubicacion : undefined,
        nombreEmpresa: rol === 'comprador_empresa' ? nombreEmpresa : undefined,
        nit: rol === 'comprador_empresa' ? nit : undefined,
      };

      await api.post('/auth/registro', payload);
      setSuccess(true);
    } catch (err) {
      setErrors({ global: err.message || 'Error al registrar.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      {/* LEFT: FORM or SUCCESS PAGE */}
      <div className="left-panel">
        <Link className="brand" to="/login">
          <div className="brand-logo">
            <img src="/logo-asafrut.jpg" alt="Asafrut Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        {success ? (
          <div className="success-screen">
            <div className="success-checkmark">🎉</div>
            <h1 className="page-title">¡Registro Exitoso!</h1>
            <p className="page-sub" style={{ maxWidth: '400px', margin: '8px auto 24px auto' }}>
              Tu cuenta ha sido creada exitosamente. Hemos enviado un correo de verificación para activar tu cuenta.
            </p>
            
            <div className="success-card">
              <div className="success-card-item">
                <strong>Nombre:</strong> {nombre} {apellido}
              </div>
              <div className="success-card-item">
                <strong>Correo:</strong> {email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
              </div>
              <div className="success-card-item">
                <strong>Perfil:</strong> {t('auth.' + rol.toLowerCase(), rol === 'comprador_empresa' ? 'Empresa' : rol.charAt(0).toUpperCase() + rol.slice(1))}
              </div>
            </div>

            <button 
              type="button" 
              className="btn-submit" 
              style={{ maxWidth: '400px' }}
              onClick={() => navigate('/verificar-correo', { state: { email } })}
            >
              Ir a Verificar Correo
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }}>
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </button>
          </div>
        ) : (
          <>
            <h1 className="page-title">{t('auth.registerTitle', 'Comienza tu viaje')}</h1>
            <p className="page-sub">{t('auth.registerSub', 'Selecciona tu perfil y únete a la revolución agrícola.')}</p>

            {errors.global && (
              <div className="global-error" style={{ display: 'block', marginBottom: '16px', color: '#e53935', background: '#ffebee', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
                {errors.global}
              </div>
            )}

            {/* ROLE SELECTOR (3 cards) */}
            <div className="role-selector">
              <div
                className={`role-card${rol === 'comprador' ? ' selected' : ''}`}
                id="roleComprador"
                onClick={() => setRol('comprador')}
              >
                <div className="role-check">
                  <svg viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="role-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
                <div className="role-name">{t('auth.buyer', 'Comprador')}</div>
                <div className="role-desc">Compra frescos al mejor precio</div>
              </div>

              <div
                className={`role-card${rol === 'comprador_empresa' ? ' selected' : ''}`}
                id="roleEmpresa"
                onClick={() => setRol('comprador_empresa')}
              >
                <div className="role-check">
                  <svg viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="role-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                  </svg>
                </div>
                <div className="role-name">Empresa</div>
                <div className="role-desc">Licitaciones y compras al por mayor B2B</div>
              </div>

              <div
                className={`role-card${rol === 'productor' ? ' selected' : ''}`}
                id="roleProductor"
                onClick={() => setRol('productor')}
              >
                <div className="role-check">
                  <svg viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="role-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/>
                  </svg>
                </div>
                <div className="role-name">{t('auth.producer', 'Productor')}</div>
                <div className="role-desc">Vende cosechas sin intermediarios</div>
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

              {/* TELEFONO CON SELECTOR DE CODIGO PAIS Y SMS VERIFY */}
              <div className="form-group">
                <label className="form-label" htmlFor="telefono">{t('auth.phone', 'Teléfono')}</label>
                <div className="phone-input-container">
                  <select 
                    className="form-select country-select" 
                    value={codigoPais} 
                    onChange={(e) => setCodigoPais(e.target.value)}
                    disabled={telefonoVerificado}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                  <input 
                    className="form-input" 
                    type="tel" 
                    id="telefono" 
                    placeholder="3001234567" 
                    value={telefono} 
                    onChange={(e) => setTelefono(e.target.value)} 
                    disabled={telefonoVerificado}
                  />
                  <button 
                    type="button" 
                    className="phone-verify-btn" 
                    onClick={handleSendSms}
                    disabled={telefonoVerificado || smsLoading}
                  >
                    {telefonoVerificado ? 'Verificado ✓' : smsEnviado ? 'Reenviar' : 'Verificar'}
                  </button>
                </div>
                {errors.telefono && <span className="form-error visible" id="telefonoError">{errors.telefono}</span>}
                
                {smsEnviado && (
                  <div className="sms-verify-container">
                    <input 
                      className="form-input" 
                      type="text" 
                      placeholder="Código de 6 dígitos" 
                      maxLength={6}
                      value={smsCodigo} 
                      onChange={(e) => setSmsCodigo(e.target.value)}
                      style={{ letterSpacing: '4px', textAlign: 'center', maxWidth: '180px' }}
                    />
                    <button 
                      type="button" 
                      className="phone-verify-btn" 
                      onClick={handleVerifySms}
                      disabled={smsLoading}
                    >
                      Confirmar
                    </button>
                  </div>
                )}
                {smsError && <div style={{ color: '#e53935', fontSize: '0.75rem', marginTop: '6px' }}>{smsError}</div>}
                {telefonoVerificado && <div style={{ color: '#4caf50', fontSize: '0.75rem', marginTop: '6px', fontWeight: 'bold' }}>✓ Teléfono verificado por SMS</div>}
              </div>

              {/* CONTRASEÑA */}
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
                      aria-label={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? (
                        // Eye-off SVG
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#6b7280">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        // Eye SVG
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#6b7280">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* PASSWORD STRENGTH BAR */}
                  {password && (
                    <div className="password-strength-container">
                      <div className="password-strength-bar">
                        <div 
                          className="password-strength-fill" 
                          style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                        />
                      </div>
                      <span className="password-strength-text" style={{ color: passwordStrength.color }}>
                        Fortaleza: {passwordStrength.label}
                      </span>
                    </div>
                  )}
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
                      aria-label={showConfirmPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showConfirmPassword ? (
                        // Eye-off SVG
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#6b7280">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        // Eye SVG
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#6b7280">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
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

              {/* EXTRA FIELDS FOR COMPANY */}
              {rol === 'comprador_empresa' && (
                <div className="form-row extra-field visible">
                  <div className="form-group">
                    <label className="form-label" htmlFor="nombreEmpresa">Nombre de la Empresa</label>
                    <input className="form-input" type="text" id="nombreEmpresa" placeholder="Empresa S.A.S." value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} />
                    {errors.nombreEmpresa && <span className="form-error visible">{errors.nombreEmpresa}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="nit">NIT</label>
                    <input className="form-input" type="text" id="nit" placeholder="900.123.456-7" value={nit} onChange={(e) => setNit(e.target.value)} />
                    {errors.nit && <span className="form-error visible">{errors.nit}</span>}
                  </div>
                </div>
              )}

              <input type="hidden" id="rolSelected" value={rol} />

              <button type="submit" className="btn-submit" id="submitBtn" disabled={loading || !telefonoVerificado}>
                {loading ? 'Creando cuenta...' : t('auth.createAccount', 'Crear cuenta')}
              </button>

              <div className="divider" style={{ margin: '16px 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: '#9a9a9a' }}>
                <span style={{ flex: 1, borderBottom: '1px solid #ddd' }}></span>
                <span style={{ padding: '0 10px', fontSize: '0.85rem' }}>O</span>
                <span style={{ flex: 1, borderBottom: '1px solid #ddd' }}></span>
              </div>

              <button
                type="button"
                onClick={handleGoogleRegistro}
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
              </button>
            </form>

            <div className="form-footer">
              {t('auth.haveAccount', '¿Ya tienes cuenta?')} <Link to="/login">{t('auth.signIn', 'Inicia sesión')}</Link>
            </div>
          </>
        )}
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
