import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import api, { API_BASE } from "@/infrastructure/http/api";
// Assets del frame de Figma "Screen-1-Login" (página 01 Autenticacion)
import bgCampo from "@/assets/login-bg-campo.png";
import leafIcon from "@/assets/icon-leaf.svg";
import mapPinIcon from "@/assets/icon-map-pin.svg";
import eyeIcon from "@/assets/icon-eye.svg";
import shieldCheckIcon from "@/assets/icon-shield-check.svg";
import handHeartIcon from "@/assets/icon-hand-heart.svg";
import { ThemeToggle } from "@/presentation/shared/components/ThemeToggle";
import "@/presentation/styles/login.css";

export default function Login() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("message") === "inicia_sesion") {
      return "Inicia sesión para completar tu compra de forma segura.";
    }

    if (params.get("message") === "expired") {
      return "Tu sesión ha expirado por seguridad. Por favor inicia sesión nuevamente.";
    }

    if (params.get("oauth2") === "pending") {
      return "Tu cuenta ha sido registrada con éxito mediante Google, pero está pendiente de aprobación por un administrador.";
    }

    return "";
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectByRole = useCallback(
    (role) => {
      const pendingRedirect = localStorage.getItem("redirect_after_login");
      if (pendingRedirect) {
        localStorage.removeItem("redirect_after_login");
        navigate(pendingRedirect);
        return;
      }
      const r = role?.toLowerCase();
      if (r === "productor") navigate("/dashboard-productor");
      else if (r === "admin" || r === "administrador") navigate("/admin");
      else navigate("/dashboard-comprador");
    },
    [navigate],
  );

  const handleLogin = useCallback(
    (userData, token) => {
      login(userData, token);
    },
    [login],
  );

  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user, redirectByRole]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("oauth2") === "success") {
      (async () => {
        try {
          // SECURITY: el token ya NO viene en la URL — se obtiene via cookie httpOnly + /auth/token-exchange
          await new Promise((r) => setTimeout(r, 800));
          const res = await api.get("/auth/token-exchange");
          const authData = res?.data || res;
          const token = authData?.token;
          if (token && authData) {
            localStorage.setItem("token", token);
            handleLogin(authData.user || authData, token);
          } else {
            throw new Error(
              "Token o datos de usuario no recibidos del intercambio OAuth2",
            );
          }
        } catch (e) {
          setGlobalError(
            e.message ||
              "Error al verificar sesión OAuth2. Intenta iniciar sesión de nuevo.",
          );
        }
      })();
    }
  }, [location.search, handleLogin]);

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setGlobalError("");
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t("errors.invalidEmail", "Ingresa un correo válido."));
      valid = false;
    }
    if (!password) {
      setPasswordError(
        t("errors.passwordRequired", "La contraseña es requerida."),
      );
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const authData = res.data || res;
      handleLogin(authData.user || authData, authData.token);
    } catch (err) {
      setGlobalError(err.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Selector de tema — reutiliza el mecanismo global del repo */}
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      {/* ── Panel izquierdo: imagen de campo + mensaje de bienvenida ── */}
      <aside
        className="login-left"
        style={{ backgroundImage: `url(${bgCampo})` }}
      >
        <div className="login-left-overlay">
          <Link to="/home" className="login-brand">
            <span className="login-brand-icon">
              <img src={leafIcon} alt="" width="20" height="20" />
            </span>
            <span className="login-brand-name">
              <em>Agro</em>Market
            </span>
          </Link>

          <div className="login-banner">
            <span className="login-banner-badge">
              🇨🇴 {t("auth.bannerBadge", "Directo del campo colombiano")}
            </span>
            <h1 className="login-banner-title">
              {t(
                "auth.welcomeBackTitle",
                "¡Bienvenido de vuelta a AgroMarket!",
              )}
            </h1>
            <p className="login-banner-sub">
              {t(
                "auth.welcomeBackSub",
                "Accede a tu cuenta para comprar los alimentos más frescos directamente cosechados por nuestros campesinos de Urabá y de toda Colombia.",
              )}
            </p>
          </div>

          <p className="login-left-note">
            <img src={mapPinIcon} alt="" width="18" height="18" />
            {t(
              "auth.leftNote",
              "Fincas de Urabá y de toda Colombia unidas en un solo lugar.",
            )}
          </p>
        </div>
      </aside>

      {/* ── Panel derecho: formulario ── */}
      <main className="login-right">
        <section className="login-form-container">
          <header className="login-form-header">
            <h2>{t("auth.submit", "Iniciar sesión")}</h2>
            <p>
              {t(
                "auth.formSub",
                "Ingresa tus credenciales para acceder a la frescura del campo.",
              )}
            </p>
          </header>

          {globalError && (
            <div className="login-global-error" role="alert">
              {globalError}
            </div>
          )}

          <form noValidate onSubmit={handleSubmit}>
            <div className="login-fields">
              <div className="login-field">
                <label htmlFor="email">
                  {t("auth.email", "Correo electrónico")}
                </label>
                <input
                  id="email"
                  type="email"
                  className={`login-input${emailError ? " has-error" : ""}`}
                  placeholder={t(
                    "auth.emailPlaceholder",
                    "juanperez@email.com",
                  )}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <span className="login-error-text">{emailError}</span>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  {t("auth.password", "Contraseña")}
                </label>
                <div className="login-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`login-input${passwordError ? " has-error" : ""}`}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="login-toggle-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <img src={eyeIcon} alt="" width="18" height="18" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <span className="login-error-text">{passwordError}</span>
                )}
              </div>

              <div className="login-options-row">
                <label className="login-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="login-checkbox-box" aria-hidden="true" />
                  {t("auth.remember", "Recordarme")}
                </label>
                <Link to="/recuperar-contrasena" className="login-forgot-link">
                  {t("auth.forgotPassword", "¿Olvidaste tu contraseña?")}
                </Link>
              </div>
            </div>

            <div className="login-actions">
              <button
                type="submit"
                className="login-btn-primary"
                disabled={loading}
              >
                {loading
                  ? t("auth.submitting", "Ingresando...")
                  : t("auth.submit", "Iniciar sesión")}
              </button>

              <div className="login-social-block">
                <div className="login-divider">
                  <span>{t("auth.orContinueWith", "o continúa con")}</span>
                </div>
                <div className="login-social-row">
                  <a
                    href={`${API_BASE.replace("/api", "")}/oauth2/authorization/google`}
                    className="login-btn-social"
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.73 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    {t("auth.google", "Google")}
                  </a>
                </div>
              </div>
            </div>
          </form>
        </section>

        <footer className="login-bottom">
          <div className="login-trust-badges">
            <span className="login-trust-badge">
              <img src={shieldCheckIcon} alt="" width="16" height="16" />
              {t("auth.trustSecure", "Compra 100% Segura")}
            </span>
            <span className="login-trust-badge">
              <img src={handHeartIcon} alt="" width="16" height="16" />
              {t("auth.trustLocal", "Apoyo campestre directo")}
            </span>
          </div>
          <p className="login-register-link">
            {t("auth.noAccount", "¿No tienes cuenta aún?")}{" "}
            <Link to="/registro">
              {t("auth.registerHere", "Regístrate aquí")}
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
