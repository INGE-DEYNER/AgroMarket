import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin.js';
import { resolveDashboardRoute } from '../utils/auth.js';
import '../styles/login.css';

export default function Login() {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    otpCode,
    setOtpCode,
    pendingTwoFactorToken,
    emailError,
    passwordError,
    otpError,
    globalError,
    loading,
    validateEmail,
    validatePassword,
    validateOtp,
    handleSubmit,
  } = useLogin();

  const googleAuthUrl = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/oauth2/authorization/google'
    : 'https://agromarket-vj8x.onrender.com/oauth2/authorization/google';

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await handleSubmit();
    if (result?.success) {
      const target = resolveDashboardRoute(result.user.rol || result.user.tipo);
      window.location.assign(target);
    } else if (result?.pendingVerification) {
      sessionStorage.setItem("pendingVerificationEmail", result.email);
      window.location.assign(`/verificar-correo?correo=${encodeURIComponent(result.email)}`);
    }
  };

  return (
    <div className="wrapper">
      {/* LEFT PANEL: FORM */}
      <div className="left-panel">
        <Link to="/" className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/></svg>
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: "auto 0", maxWidth: "400px", width: "100%" }}>
          <h1 className="page-title">Bienvenido de nuevo</h1>
          <p className="page-sub">Ingresa tus credenciales para continuar.</p>

          <div className={`global-error${globalError ? ' visible' : ''}`} id="globalError">
            {globalError}
          </div>

          <form id="loginForm" onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <input
                className={`form-input ${emailError ? 'error' : ''}`}
                type="email"
                id="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(true)}
                autoComplete="email"
              />
              <span className={`form-error${emailError ? ' visible' : ''}`} id="emailError">
                {emailError || 'Ingresa un correo válido.'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                className={`form-input ${passwordError ? 'error' : ''}`}
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validatePassword(true)}
                autoComplete="current-password"
              />
              <span className={`form-error${passwordError ? ' visible' : ''}`} id="passwordError">
                {passwordError || 'La contraseña es requerida.'}
              </span>
            </div>

            <button type="submit" className="btn-submit" id="submitBtn" disabled={loading}>
              {loading ? t('general.verifying') : pendingTwoFactorToken ? t('auth.verifyCode') : 'Iniciar sesión'}
            </button>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            ¿No tienes cuenta? <Link to="/registro">Regístrate gratis</Link>
          </div>
          <div className="form-footer" style={{ marginTop: "12px", fontSize: "0.75rem", color: "#8a8a8a" }}>
            Acceso demo: admin@agromarket.co · productor@agromarket.co · comprador@agromarket.co
          </div>

          <a
            href={googleAuthUrl}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "#fff",
              color: "#222",
              textDecoration: "none",
              marginTop: "6px",
            }}
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="G"
              style={{ width: "18px", height: "18px" }}
            />
            {t('auth.continueWithGoogle')}
          </a>
        </div>
        
        <div style={{ marginTop: "auto", paddingTop: "24px", fontSize: "0.75rem", color: "#9a9a9a" }}>
          &copy; 2026 AgroMarket ASAFRUT. Todos los derechos reservados.
        </div>
      </div>

      {/* RIGHT PANEL: IMAGE & OVERLAY */}
      <div className="right-panel">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
          alt="Cultivos"
          className="bg-img"
        />
        <div className="right-overlay">
          <div className="right-badge">🌿 Plataforma oficial de la Asociación</div>
          <h2 className="right-title">Conectando el campo con tu mesa.</h2>
          <p className="right-sub">
            Accede a tu panel de control para gestionar tus productos, pedidos o realizar compras frescas directo a los productores de Urabá.
          </p>
        </div>
      </div>
    </div>
  );
}
