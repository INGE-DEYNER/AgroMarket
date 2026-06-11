import React, { useState } from 'react';
import api from '../utils/api.js';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/registro.css';

export default function Registro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState('comprador');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [ubicacionError, setUbicacionError] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRules = (val) => {
    return {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      number: /\d/.test(val),
      special: /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(val),
    };
  };

  const validatePasswordStrength = (val) => {
    const rules = passwordRules(val);
    return rules.length && rules.upper && rules.number && rules.special;
  };

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validatePhone = (val) => {
    return /^[0-9]{10}$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setNombreError('');
    setApellidoError('');
    setEmailError('');
    setTelefonoError('');
    setPasswordError('');
    setConfirmError('');
    setUbicacionError('');
    setSuccess(false);

    let isValid = true;

    if (!nombre.trim()) {
      setNombreError(t('errores.nameIsRequired'));
      isValid = false;
    }
    if (!apellido.trim()) {
      setApellidoError(t('errores.lastNameIsRequired'));
      isValid = false;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setEmailError(t('errores.invalidEmail'));
      isValid = false;
    }
    if (!telefono.trim() || !validatePhone(telefono.trim())) {
      setTelefonoError(t('errores.invalidPhone'));
      isValid = false;
    }
    if (!password || !validatePasswordStrength(password)) {
      setPasswordError(t('errores.passwordRequirements'));
      isValid = false;
    }
    if (confirmPass !== password) {
      setConfirmError(t('errores.contrasenasNoCoinciden'));
      isValid = false;
    }
    if (role === 'productor' && !ubicacion.trim()) {
      setUbicacionError(t('errores.locationIsRequired'));
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      await api.registro({
        nombre,
        apellido,
        correo: email.trim(),
        telefono,
        contrasena: password,
        rol: role.toUpperCase(),
        ubicacion: role === 'productor' ? ubicacion : null,
      });

      sessionStorage.setItem("pendingVerificationEmail", email.trim());
      setSuccess(true);
      setTimeout(() => {
        navigate(`/verificar-correo?correo=${encodeURIComponent(email.trim())}`);
      }, 2000);
    } catch (error) {
      const message = error?.mensaje || error?.message || t('errores.accountCreationError');
      const campos = error?.campos || {};

      if (Object.keys(campos).length > 0) {
        if (campos.nombre) setNombreError(campos.nombre);
        if (campos.apellido) setApellidoError(campos.apellido);
        if (campos.correo) setEmailError(campos.correo);
        if (campos.telefono) setTelefonoError(campos.telefono);
        if (campos.contrasena) setPasswordError(campos.contrasena);
        if (campos.ubicacion) setUbicacionError(campos.ubicacion);
      } else {
        setEmailError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="left-panel">
        <Link className="brand" to="/login">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24">
              <path
                d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"
              />
            </svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <h1 className="page-title">Comienza tu viaje</h1>
        <p className="page-sub">
          Selecciona tu perfil y únete a la revolución agrícola.
        </p>

        <div className="role-selector">
          <div
            className={`role-card ${role === 'comprador' ? 'selected' : ''}`}
            id="roleComprador"
            onClick={() => setRole('comprador')}
          >
            <div className="role-check">
              <svg viewBox="0 0 10 8">
                <path
                  d="M1 4l3 3 7-5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="role-icon">🛒</div>
            <div className="role-name">Comprador</div>
            <div className="role-desc">Acceso a los mejores precios de origen</div>
          </div>
          <div
            className={`role-card ${role === 'productor' ? 'selected' : ''}`}
            id="roleProductor"
            onClick={() => setRole('productor')}
          >
            <div className="role-check">
              <svg viewBox="0 0 10 8">
                <path
                  d="M1 4l3 3 7-5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="role-icon">🌾</div>
            <div className="role-name">Productor</div>
            <div className="role-desc">Vende directamente sin intermediarios</div>
          </div>
        </div>

        <form id="regForm" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre</label>
              <input
                className={`form-input ${nombreError ? 'error' : ''}`}
                type="text"
                id="nombre"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <span className={`form-error ${nombreError ? 'visible' : ''}`} id="nombreError">Campo requerido.</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellido">Apellido</label>
              <input
                className={`form-input ${apellidoError ? 'error' : ''}`}
                type="text"
                id="apellido"
                placeholder="Pérez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
              <span className={`form-error ${apellidoError ? 'visible' : ''}`} id="apellidoError">Campo requerido.</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
              className={`form-input ${emailError ? 'error' : ''}`}
              type="email"
              id="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className={`form-error ${emailError ? 'visible' : ''}`} id="emailError">Ingresa un correo válido.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="telefono">Teléfono</label>
            <input
              className={`form-input ${telefonoError ? 'error' : ''}`}
              type="tel"
              id="telefono"
              placeholder="3001234567"
              maxLength={10}
              inputMode="numeric"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <span className={`form-error ${telefonoError ? 'visible' : ''}`} id="telefonoError">Campo requerido.</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                className={`form-input ${passwordError ? 'error' : ''}`}
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className={`form-error ${passwordError ? 'visible' : ''}`} id="passwordError">Mínimo 6 caracteres.</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPass">Confirmar contraseña</label>
              <input
                className={`form-input ${confirmError ? 'error' : ''}`}
                type="password"
                id="confirmPass"
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              <span className={`form-error ${confirmError ? 'visible' : ''}`} id="confirmError">Las contraseñas no coinciden.</span>
            </div>
          </div>

          <div className={`form-group extra-field ${role === 'productor' ? 'visible' : ''}`} id="ubicacionGroup">
            <label className="form-label" htmlFor="ubicacion">Ubicación / Vereda</label>
            <input
              className={`form-input ${ubicacionError ? 'error' : ''}`}
              type="text"
              id="ubicacion"
              placeholder="Ej. Vereda Las Margaritas, Chigorodó"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
            <span className={`form-error ${ubicacionError ? 'visible' : ''}`} id="ubicacionError">Campo requerido para productores.</span>
          </div>

          <input type="hidden" id="rolSelected" value={role} />

          <button type="submit" className="btn-submit" id="submitBtn" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className={`success-msg ${success ? 'visible' : ''}`} id="successMsg">
            <span>✔</span>
            <span>Cuenta creada. Redirigiendo al inicio de sesión...</span>
          </div>
        </form>

        <div className="form-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>

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
            Garantizamos trazabilidad total y precios justos para quienes
            cultivan la tierra y quienes disfrutan sus frutos.
          </p>
          <div className="right-features">
            <div className="right-feat">
              <span className="feat-icon">🔐</span>
              <span className="feat-text"><strong style={{ color: "#fff" }}>Trazabilidad total</strong><br />Conoce el origen exacto de cada fruta que compras.</span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">💰</span>
              <span className="feat-text"><strong style={{ color: "#fff" }}>Precios justos</strong><br />Sin intermediarios. Directo del productor al consumidor.</span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">🚚</span>
              <span className="feat-text"><strong style={{ color: "#fff" }}>Envíos seguros</strong><br />Seguimiento en tiempo real desde Urabá hasta tu puerta.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
