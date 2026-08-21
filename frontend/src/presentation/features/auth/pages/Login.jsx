import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import api, { API_BASE } from "@/infrastructure/http/api";
import "@/presentation/styles/login.css";

export default function Login() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          // Pequeño delay para asegurar que la cookie esté disponible
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
    <div className="wrapper">
      {/* LEFT PANEL: FORM */}
      <div className="left-panel">
        <Link to="/home" className="brand">
          <div className="brand-logo">
            <img
              src="/logo-asafrut.jpg"
              alt="Asafrut Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <div className="brand-name">AgroMarket</div>
            <div className="brand-sub">ASAFRUT · Chigorodó, Antioquia</div>
          </div>
        </Link>

        <div style={{ margin: "auto 0", maxWidth: "400px", width: "100%" }}>
          <h1 className="page-title">
            {t("auth.loginTitle", "Bienvenido de nuevo")}
          </h1>
          <p className="page-sub">
            {t("auth.loginSub", "Ingresa tus credenciales para continuar.")}
          </p>

          {globalError && (
            <div
              className="global-error"
              id="globalError"
              style={{ display: "block" }}
            >
              {globalError}
            </div>
          )}

          <form id="loginForm" noValidate onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                {t("auth.email", "Correo electrónico")}
              </label>
              <input
                className="form-input"
                type="email"
                id="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <span className="form-error" id="emailError">
                  {emailError}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                {t("auth.password", "Contraseña")}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye-off SVG
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="#6b7280"
                    >
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  ) : (
                    // Eye SVG
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="#6b7280"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <span className="form-error visible" id="passwordError">
                  {passwordError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-submit"
              id="submitBtn"
              disabled={loading}
            >
              {loading ? "Ingresando..." : t("auth.submit", "Iniciar sesión")}
            </button>

            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <Link
                to="/recuperar-contrasena"
                style={{
                  fontSize: "0.9rem",
                  color: "#688e4e",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                {t("auth.forgotPassword", "¿Olvidaste tu contraseña?")}
              </Link>
            </div>

            <div
              className="divider"
              style={{
                margin: "16px 0",
                display: "flex",
                alignItems: "center",
                textAlign: "center",
                color: "#9a9a9a",
              }}
            >
              <span style={{ flex: 1, borderBottom: "1px solid #ddd" }}></span>
              <span style={{ padding: "0 10px", fontSize: "0.85rem" }}>O</span>
              <span style={{ flex: 1, borderBottom: "1px solid #ddd" }}></span>
            </div>

            <a
              href={`${API_BASE.replace("/api", "")}/oauth2/authorization/google`}
              className="btn-submit"
              style={{
                backgroundColor: "#fff",
                color: "#444",
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                textDecoration: "none",
              }}
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
              {t("auth.continueWithGoogle", "Continuar con Google")}
            </a>
          </form>

          <div className="divider"></div>

          <div className="form-footer">
            {t("auth.noAccount", "¿No tienes cuenta?")}{" "}
            <Link to="/registro">
              {t("auth.registerFree", "Regístrate gratis")}
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "24px",
            fontSize: "0.75rem",
            color: "#9a9a9a",
          }}
        >
          &copy; 2026 AgroMarket ASAFRUT. Todos los derechos reservados ·
          Desarrollado por Deyner Chaverra
        </div>
      </div>

      {/* RIGHT PANEL: IMAGE & OVERLAY */}
      <div className="right-panel">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
          alt="Cultivos"
          className="bg-img"
          loading="lazy"
        />
        <div className="right-overlay">
          <div className="right-badge">
            {" "}
            Plataforma oficial de la Asociación
          </div>
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
