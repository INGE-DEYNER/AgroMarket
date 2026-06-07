// File: frontend/src/components/Registro.jsx
import React, { useState } from 'react';
import api from '../utils/api.js';

export default function Registro() {
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const getStrengthMetrics = () => {
    const rules = passwordRules(password);
    const count = Object.values(rules).filter(Boolean).length;
    const pct = (count / 4) * 100;
    
    let label = 'Débil';
    let color = '#dc2626';
    if (count === 2) {
      label = 'Aceptable';
      color = '#f59e0b';
    } else if (count === 3) {
      label = 'Fuerte';
      color = '#84cc16';
    } else if (count === 4) {
      label = 'Muy fuerte';
      color = '#2d6a2d';
    }
    return { rules, pct, label, color };
  };

  const metrics = getStrengthMetrics();

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validatePhone = (val) => {
    return /^[0-9]{10}$/.test(val);
  };

  const validatePasswordStrength = (val) => {
    const rules = passwordRules(val);
    return rules.length && rules.upper && rules.number && rules.special;
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
      setNombreError('El nombre es requerido.');
      isValid = false;
    }
    if (!apellido.trim()) {
      setApellidoError('El apellido es requerido.');
      isValid = false;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setEmailError('Ingresa un correo válido.');
      isValid = false;
    }
    if (!telefono.trim() || !validatePhone(telefono.trim())) {
      setTelefonoError('Debe tener 10 dígitos numéricos.');
      isValid = false;
    }
    if (!password || !validatePasswordStrength(password)) {
      setPasswordError('Debe tener 8 caracteres, una mayúscula, un número y un carácter especial.');
      isValid = false;
    }
    if (confirmPass !== password) {
      setConfirmError('Las contraseñas no coinciden.');
      isValid = false;
    }
    if (role === 'productor' && !ubicacion.trim()) {
      setUbicacionError('La ubicación es requerida.');
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
        window.location.assign(`/verificar-correo.html?correo=${encodeURIComponent(email.trim())}`);
      }, 2000);
    } catch (error) {
      const message = error?.mensaje || error?.message || "No se pudo crear la cuenta.";
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
        <a className="brand" href="/login.html">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
            </svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">Plataforma de comercio agrícola</div>
          </div>
        </a>

        <h1 className="page-title">Comienza tu viaje</h1>
        <p className="page-sub">Selecciona tu perfil y únete a la revolución agrícola.</p>

        {/* ROLE SELECTOR */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-card ${role === 'comprador' ? 'selected' : ''}`}
            onClick={() => setRole('comprador')}
          >
            <div className="role-check">
              <svg viewBox="0 0 10 8">
                <path d="M1 4l3 3 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="role-icon">🛒</div>
            <div className="role-name">Comprador</div>
            <div className="role-desc">Acceso a los mejores precios de origen</div>
          </button>
          <button
            type="button"
            className={`role-card ${role === 'productor' ? 'selected' : ''}`}
            onClick={() => setRole('productor')}
          >
            <div className="role-check">
              <svg viewBox="0 0 10 8">
                <path d="M1 4l3 3 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="role-icon">🌾</div>
            <div className="role-name">Productor</div>
            <div className="role-desc">Vende directamente sin intermediarios</div>
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} noValidate>
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
              {nombreError && <span className="form-error visible">{nombreError}</span>}
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
              {apellidoError && <span className="form-error visible">{apellidoError}</span>}
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
            {emailError && <span className="form-error visible">{emailError}</span>}
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
            {telefonoError && <span className="form-error visible">{telefonoError}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "88px", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    color: "#2d6a2d",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 6px",
                  }}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              <div
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(45, 106, 45, 0.1)",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6b6b6b" }}>
                    Fortaleza
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: metrics.color }}>
                    {metrics.label}
                  </span>
                </div>
                <div style={{ height: "8px", background: "#e8ede8", borderRadius: "999px", overflow: "hidden", marginTop: "10px" }}>
                  <div style={{ width: `${metrics.pct}%`, height: "100%", background: metrics.color, borderRadius: "999px", transition: "width 0.2s ease, background 0.2s ease" }}></div>
                </div>
                <div style={{ display: "grid", gap: "6px", marginTop: "10px", fontSize: "0.78rem", color: "#4e6b54" }}>
                  <div>{passwordRules(password).length ? "✓" : "•"} Mínimo 8 caracteres</div>
                  <div>{passwordRules(password).upper ? "✓" : "•"} Una mayúscula</div>
                  <div>{passwordRules(password).number ? "✓" : "•"} Un número</div>
                  <div>{passwordRules(password).special ? "✓" : "•"} Un carácter especial</div>
                </div>
              </div>
              {passwordError && <span className="form-error visible">{passwordError}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPass">Confirmar contraseña</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  className={`form-input ${confirmError ? 'error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPass"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  style={{ paddingRight: "88px", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    color: "#2d6a2d",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 6px",
                  }}
                >
                  {showConfirm ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {confirmError && <span className="form-error visible">{confirmError}</span>}
            </div>
          </div>

          {role === 'productor' && (
            <div className="form-group extra-field visible" id="ubicacionGroup">
              <label className="form-label" htmlFor="ubicacion">Ubicación / Vereda</label>
              <input
                className={`form-input ${ubicacionError ? 'error' : ''}`}
                type="text"
                id="ubicacion"
                placeholder="Ej. Vereda Las Margaritas, Chigorodó"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
              />
              {ubicacionError && <span className="form-error visible">{ubicacionError}</span>}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          {success && (
            <div className="success-msg visible" id="successMsg">
              <span>✔</span>
              <span>Cuenta creada. Redirigiendo a la verificación...</span>
            </div>
          )}
        </form>

        <div className="form-footer">
          ¿Ya tienes cuenta? <a href="/login.html">Inicia sesión</a>
          <a
            className="btn-google"
            href="https://agromarket-vj8x.onrender.com/oauth2/authorization/google"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "#fff",
              color: "#222",
              textDecoration: "none",
              marginLeft: "12px",
            }}
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="G"
              style={{ width: "16px", height: "16px" }}
            />
            Continuar con Google
          </a>
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
          <div className="right-badge">🌿 Plataforma oficial</div>
          <h2 className="right-title">Del campo de Urabá a tu hogar.</h2>
          <p className="right-sub">
            Garantizamos trazabilidad total y precios justos para quienes cultivan la tierra y quienes disfrutan sus frutos.
          </p>
          <div className="right-features">
            <div className="right-feat">
              <span className="feat-icon">🔐</span>
              <span className="feat-text">
                <strong style={{ color: "#fff" }}>Trazabilidad total</strong><br />Conoce el origen exacto de cada fruta que compras.
              </span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">💰</span>
              <span className="feat-text">
                <strong style={{ color: "#fff" }}>Precios justos</strong><br />Sin intermediarios. Directo del productor al consumidor.
              </span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">🚚</span>
              <span className="feat-text">
                <strong style={{ color: "#fff" }}>Envíos seguros</strong><br />Seguimiento en tiempo real desde Urabá hasta tu puerta.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
