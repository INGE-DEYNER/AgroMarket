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
    
    let label = t('perfil.passwordRulesWeak');
    let color = '#dc2626';
    if (count === 2) {
      label = t('perfil.passwordRulesAcceptable');
      color = '#f59e0b';
    } else if (count === 3) {
      label = t('perfil.passwordRulesStrong');
      color = '#84cc16';
    } else if (count === 4) {
      label = t('perfil.passwordRulesVeryStrong');
      color = '#2d6a2d';
    }
    return { rules, pct, label, color };
  };

  const metrics = getStrengthMetrics();

  const googleAuthUrl = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/oauth2/authorization/google'
    : 'https://agromarket-vj8x.onrender.com/oauth2/authorization/google';

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
              <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
            </svg>
          </div>
          <div>
            <div className="brand-name">{t('general.appName')}</div>
            <div className="brand-sub">{t('general.appSlogan')}</div>
          </div>
        </Link>

        <h1 className="page-title">{t('auth.startYourJourney')}</h1>
        <p className="page-sub">{t('auth.selectProfileJoinRevolution')}</p>

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
            <div className="role-name">{t('auth.buyer')}</div>
            <div className="role-desc">{t('auth.buyerDesc')}</div>
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
            <div className="role-name">{t('auth.producer')}</div>
            <div className="role-desc">{t('auth.producerDesc')}</div>
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">{t('auth.nameLabel')}</label>
              <input
                className={`form-input ${nombreError ? 'error' : ''}`}
                type="text"
                id="nombre"
                placeholder={t('auth.namePlaceholder')}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              {nombreError && <span className="form-error visible">{nombreError}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellido">{t('auth.lastNameLabel')}</label>
              <input
                className={`form-input ${apellidoError ? 'error' : ''}`}
                type="text"
                id="apellido"
                placeholder={t('auth.lastNamePlaceholder')}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
              {apellidoError && <span className="form-error visible">{apellidoError}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.email')}</label>
            <input
              className={`form-input ${emailError ? 'error' : ''}`}
              type="email"
              id="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <span className="form-error visible">{emailError}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="telefono">{t('auth.phoneLabel')}</label>
            <input
              className={`form-input ${telefonoError ? 'error' : ''}`}
              type="tel"
              id="telefono"
              placeholder={t('auth.phonePlaceholder')}
              maxLength={10}
              inputMode="numeric"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            {telefonoError && <span className="form-error visible">{telefonoError}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t('auth.passwordLabel')}</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder={t('auth.passwordPlaceholder')}
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
                  {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                    {t('auth.passwordStrength')}
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: metrics.color }}>
                    {metrics.label}
                  </span>
                </div>
                <div style={{ height: "8px", background: "#e8ede8", borderRadius: "999px", overflow: "hidden", marginTop: "10px" }}>
                  <div style={{ width: `${metrics.pct}%`, height: "100%", background: metrics.color, borderRadius: "999px", transition: "width 0.2s ease, background 0.2s ease" }}></div>
                </div>
                <div style={{ display: "grid", gap: "6px", marginTop: "10px", fontSize: "0.78rem", color: "#4e6b54" }}>
                  <div>{passwordRules(password).length ? "✓" : "•"} {t('perfil.passwordMinLength')}</div>
                  <div>{passwordRules(password).upper ? "✓" : "•"} {t('perfil.passwordUppercase')}</div>
                  <div>{passwordRules(password).number ? "✓" : "•"} {t('perfil.passwordNumber')}</div>
                  <div>{passwordRules(password).special ? "✓" : "•"} {t('perfil.passwordSpecialChar')}</div>
                </div>
              </div>
              {passwordError && <span className="form-error visible">{passwordError}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPass">{t('auth.confirmPasswordLabel')}</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  className={`form-input ${confirmError ? 'error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPass"
                  placeholder={t('auth.passwordPlaceholder')}
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
                  {showConfirm ? t('auth.hidePassword') : t('auth.showPassword')}
                </button>
              </div>
              {confirmError && <span className="form-error visible">{confirmError}</span>}
            </div>
          </div>

          {role === 'productor' && (
            <div className="form-group extra-field visible" id="ubicacionGroup">
              <label className="form-label" htmlFor="ubicacion">{t('auth.locationLabel')}</label>
              <input
                className={`form-input ${ubicacionError ? 'error' : ''}`}
                type="text"
                id="ubicacion"
                placeholder={t('auth.locationPlaceholder')}
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
              />
              {ubicacionError && <span className="form-error visible">{ubicacionError}</span>}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
          </button>

          {success && (
            <div className="success-msg visible" id="successMsg">
              <span>✔</span>
              <span>{t('auth.accountCreatedRedirecting')}</span>
            </div>
          )}
        </form>

        <div className="form-footer">
          {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.loginHere')}</Link>
          <a
            className="btn-google"
            href={googleAuthUrl}
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
            {t('auth.continueWithGoogle')}
          </a>
        </div>
      </div>

      <div className="right-panel">
        <img
          className="bg-img"
          src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200"
          alt={t('auth.tropicalFruits')}
          loading="lazy"
        />
        <div className="right-overlay">
          <div className="right-badge">{t('auth.officialPlatform')}</div>
          <h2 className="right-title">{t('auth.fromFarmToHome')}</h2>
          <p className="right-sub">
            {t('auth.traceabilityDescription')}
          </p>
          <div className="right-features">
            <div className="right-feat">
              <span className="feat-icon">🔐</span>
              <span className="feat-text">
                <strong style={{ color: "#fff" }}>{t('auth.totalTraceability')}</strong><br />{t('auth.knowExactOrigin')}
              </span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">💰</span>
              <span className="feat-text">
                <strong style={{ color: "#fff" }}>{t('auth.fairPrices')}</strong><br />{t('auth.noIntermediaries')}
              </span>
            </div>
            <div className="right-feat">
              <span className="feat-icon">🚚</span>
              <span className="feat-text">
                <strong style={{ color: "#fff" }}>{t('auth.secureShipping')}</strong><br />{t('auth.realTimeTracking')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}