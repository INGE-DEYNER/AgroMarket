// File: frontend/src/components/Login.jsx
import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin.js';
import { resolveDashboardRoute } from '../utils/auth.js';

export default function Login() {
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

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await handleSubmit();
    if (result?.success) {
      const target = resolveDashboardRoute(result.user.rol || result.user.tipo);
      window.location.assign(target);
    } else if (result?.pendingVerification) {
      sessionStorage.setItem("pendingVerificationEmail", result.email);
      window.location.assign(`/verificar-correo.html?correo=${encodeURIComponent(result.email)}`);
    }
  };

  return (
    <div className="wrapper">
      {/* LEFT PANEL: FORM */}
      <div className="left-panel">
        <a href="/home.html" className="brand">
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

        <div style={{ margin: "auto 0", maxWidth: "400px", width: "100%" }}>
          <h1 className="page-title">Bienvenido de nuevo</h1>
          <p className="page-sub">Ingresa tus credenciales para continuar.</p>

          {globalError && <div className="global-error visible">{globalError}</div>}

          <form onSubmit={onSubmit} noValidate>
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
              {emailError && <span className="form-error visible">{emailError}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validatePassword(true)}
                  autoComplete="current-password"
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
              {passwordError && <span className="form-error visible">{passwordError}</span>}
            </div>

            {pendingTwoFactorToken && (
              <div className="form-group">
                <label className="form-label" htmlFor="otpCode">Código Authenticator (6 dígitos)</label>
                <input
                  className={`form-input ${otpError ? 'error' : ''}`}
                  type="text"
                  id="otpCode"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  onBlur={() => validateOtp(true)}
                  autoComplete="one-time-code"
                />
                {otpError && <span className="form-error visible">{otpError}</span>}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Verificando...' : pendingTwoFactorToken ? 'Verificar código' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="divider"></div>

          <div
            className="form-footer"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <a href="/recuperar-contrasena.html">¿Olvidaste tu contraseña?</a>
            <a
              className="btn-google"
              href="https://agromarket-vj8x.onrender.com/oauth2/authorization/google"
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
              Continuar con Google
            </a>
            <div>
              ¿No tienes cuenta? <a href="/registro.html">Regístrate gratis</a>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "24px", fontSize: "0.75rem", color: "#9a9a9a" }}>
          &copy; 2026 AgroMarket. Todos los derechos reservados.
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
            Accede a tu panel de control para gestionar tus productos, pedidos o
            realizar compras frescas directo a los productores de Urabá.
          </p>
        </div>
      </div>
    </div>
  );
}
