import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/login.css";

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // ============================================================
  // DATOS DEL ENLACE DEL CORREO
  // ============================================================

  const searchParams = new URLSearchParams(location.search);

  const emailFromUrl = searchParams.get("email") || "";
  const tokenFromUrl = searchParams.get("token") || "";

  // ============================================================
  // DATOS TEMPORALES DE RESPALDO
  // ============================================================

  const storedEmail = sessionStorage.getItem("agromarket_recovery_email") || "";

  const storedToken = sessionStorage.getItem("agromarket_recovery_token") || "";

  // ============================================================
  // NORMALIZACIÓN
  // ============================================================

  const normalizeEmail = (value) => {
    if (!value) {
      return "";
    }

    try {
      return decodeURIComponent(value).trim().toLowerCase();
    } catch {
      return value.trim().toLowerCase();
    }
  };

  const normalizeToken = (value) => {
    if (!value) {
      return "";
    }

    try {
      return decodeURIComponent(value).trim();
    } catch {
      return value.trim();
    }
  };

  // ============================================================
  // PRIORIDAD
  //
  // 1. URL
  // 2. React Router state
  // 3. sessionStorage
  // ============================================================

  const initialEmail =
    normalizeEmail(emailFromUrl) ||
    normalizeEmail(location.state?.email) ||
    normalizeEmail(storedEmail);

  const initialToken =
    normalizeToken(tokenFromUrl) ||
    normalizeToken(location.state?.token) ||
    normalizeToken(storedToken);

  // ============================================================
  // ESTADOS
  // ============================================================

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [verified, setVerified] = useState(false);
  const [success, setSuccess] = useState(false);

  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ============================================================
  // GUARDAR DATOS TEMPORALES
  // ============================================================

  useEffect(() => {
    if (initialEmail) {
      sessionStorage.setItem("agromarket_recovery_email", initialEmail);
    }

    if (initialToken) {
      sessionStorage.setItem("agromarket_recovery_token", initialToken);
    }
  }, [initialEmail, initialToken]);

  // ============================================================
  // VERIFICACIÓN AUTOMÁTICA
  //
  // Solo se ejecuta cuando el enlace del correo trae:
  //
  // ?email=...&token=...
  //
  // Si no hay token, el usuario puede introducirlo manualmente.
  // ============================================================

  useEffect(() => {
    if (!initialEmail || !initialToken) {
      return;
    }

    let cancelled = false;

    const verifyTokenFromUrl = async () => {
      setLoadingVerify(true);
      setError("");

      try {
        await api.post("/auth/verify-code", {
          email: initialEmail,
          token: initialToken,
        });

        if (cancelled) {
          return;
        }

        setEmail(initialEmail);
        setToken(initialToken);
        setVerified(true);

        sessionStorage.setItem("agromarket_recovery_email", initialEmail);

        sessionStorage.setItem("agromarket_recovery_token", initialToken);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Error verificando código desde el enlace:", err);

        setVerified(false);
        setError(getBackendMessage(err));
      } finally {
        if (!cancelled) {
          setLoadingVerify(false);
        }
      }
    };

    verifyTokenFromUrl();

    return () => {
      cancelled = true;
    };
  }, [initialEmail, initialToken]);

  // ============================================================
  // OBTENER MENSAJE DEL BACKEND
  // ============================================================

  function getBackendMessage(err) {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.detail ||
      err?.message ||
      ""
    );
  }

  // ============================================================
  // VERIFICAR CÓDIGO MANUALMENTE
  // ============================================================

  const verificarCodigo = async () => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedToken = normalizeToken(token);

    setError("");

    if (!normalizedEmail) {
      setError(
        t("resetPass.emailRequired", "El correo electrónico es obligatorio."),
      );

      return false;
    }

    if (!normalizedToken) {
      setError(
        t(
          "resetPass.codeRequired",
          "El código de recuperación es obligatorio.",
        ),
      );

      return false;
    }

    if (!/^\d{6}$/.test(normalizedToken)) {
      setError(
        t(
          "resetPass.invalidCodeFormat",
          "El código debe contener exactamente 6 dígitos.",
        ),
      );

      return false;
    }

    setLoadingVerify(true);

    try {
      await api.post("/auth/verify-code", {
        email: normalizedEmail,
        token: normalizedToken,
      });

      setEmail(normalizedEmail);
      setToken(normalizedToken);
      setVerified(true);

      sessionStorage.setItem("agromarket_recovery_email", normalizedEmail);

      sessionStorage.setItem("agromarket_recovery_token", normalizedToken);

      return true;
    } catch (err) {
      console.error("Error al verificar código:", err);

      const backendMessage = getBackendMessage(err);

      setVerified(false);

      setError(
        backendMessage ||
          t("resetPass.invalidCode", "El código no es válido o ha expirado."),
      );

      return false;
    } finally {
      setLoadingVerify(false);
    }
  };

  // ============================================================
  // SUBMIT VERIFICACIÓN
  // ============================================================

  const handleVerify = async (event) => {
    event.preventDefault();

    if (loadingVerify) {
      return;
    }

    await verificarCodigo();
  };

  // ============================================================
  // RESTABLECER CONTRASEÑA
  // ============================================================

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (loadingReset) {
      return;
    }

    setError("");
    setPasswordError("");

    const normalizedEmail = normalizeEmail(email);
    const normalizedToken = normalizeToken(token);

    // ------------------------------------------------------------
    // EMAIL
    // ------------------------------------------------------------

    if (!normalizedEmail) {
      setError(
        t("resetPass.emailRequired", "El correo electrónico es obligatorio."),
      );

      return;
    }

    // ------------------------------------------------------------
    // TOKEN
    // ------------------------------------------------------------

    if (!normalizedToken) {
      setError(
        t(
          "resetPass.codeRequired",
          "El código de recuperación es obligatorio.",
        ),
      );

      return;
    }

    if (!/^\d{6}$/.test(normalizedToken)) {
      setError(
        t(
          "resetPass.invalidCodeFormat",
          "El código debe contener exactamente 6 dígitos.",
        ),
      );

      return;
    }

    // ------------------------------------------------------------
    // CONTRASEÑA
    // ------------------------------------------------------------

    if (!newPassword) {
      setPasswordError(
        t("resetPass.passwordRequired", "La nueva contraseña es obligatoria."),
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        t(
          "resetPass.passwordLength",
          "La contraseña debe tener mínimo 8 caracteres.",
        ),
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        t("resetPass.passwordMismatch", "Las contraseñas no coinciden."),
      );

      return;
    }

    setLoadingReset(true);

    try {
      await api.post("/auth/restablecer-contrasena", {
        email: normalizedEmail,
        token: normalizedToken,
        newPassword,
      });

      // ==========================================================
      // LIMPIAR DATOS TEMPORALES
      // ==========================================================

      sessionStorage.removeItem("agromarket_recovery_email");

      sessionStorage.removeItem("agromarket_recovery_token");

      setSuccess(true);
      setVerified(false);

      // ==========================================================
      // REDIRECCIÓN
      // ==========================================================

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message: t(
              "resetPass.successLogin",
              "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
            ),
          },
        });
      }, 2000);
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);

      const backendMessage = getBackendMessage(err);

      setError(
        backendMessage ||
          t(
            "resetPass.resetError",
            "No fue posible restablecer la contraseña.",
          ),
      );

      /*
       * Si el backend rechaza el token porque expiró,
       * obligamos a solicitar uno nuevo.
       */
      setVerified(false);
    } finally {
      setLoadingReset(false);
    }
  };

  // ============================================================
  // CAMBIO DEL CÓDIGO
  // ============================================================

  const handleCodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setToken(value);

    if (error) {
      setError("");
    }

    /*
     * Si el usuario modifica el código,
     * ya no consideramos válida la verificación anterior.
     */
    if (verified) {
      setVerified(false);
    }
  };

  // ============================================================
  // ÉXITO
  // ============================================================

  if (success) {
    return (
      <div className="wrapper">
        <div className="left-panel">
          <Link to="/home" className="brand">
            <div className="brand-logo">
              <img
                src="/logo-asafrut.jpg"
                alt="Logo de ASAFRUT"
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

          <div
            style={{
              margin: "auto 0",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                marginBottom: "20px",
              }}
            >
              ✓
            </div>

            <h1 className="page-title">
              {t("resetPass.successTitle", "Contraseña actualizada")}
            </h1>

            <p className="page-sub">
              {t(
                "resetPass.successMessage",
                "Tu contraseña fue actualizada correctamente. Serás redirigido al inicio de sesión.",
              )}
            </p>
          </div>
        </div>

        <div className="right-panel">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
            alt="Cultivos agrícolas"
            className="bg-img"
            loading="lazy"
          />

          <div className="right-overlay">
            <div className="right-badge">AgroMarket ASAFRUT</div>

            <h2 className="right-title">Tu cuenta está protegida.</h2>

            <p className="right-sub">
              Ya puedes ingresar nuevamente con tu nueva contraseña.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PANTALLA PRINCIPAL
  // ============================================================

  return (
    <div className="wrapper">
      <div className="left-panel">
        <Link
          to="/home"
          className="brand"
          aria-label="Ir al inicio de AgroMarket"
        >
          <div className="brand-logo">
            <img
              src="/logo-asafrut.jpg"
              alt="Logo de ASAFRUT"
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

        <div
          style={{
            margin: "auto 0",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h1 className="page-title">
            {t("resetPass.title", "Restablecer contraseña")}
          </h1>

          <p className="page-sub">
            {t(
              "resetPass.subtitle",
              "Ingresa el código de 6 dígitos que recibiste por correo y crea una nueva contraseña.",
            )}
          </p>

          {loadingVerify && initialToken && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#f1f7f2",
                border: "1px solid #d5e8d9",
                fontSize: "14px",
              }}
            >
              {t(
                "resetPass.verifyingLink",
                "Verificando el código de recuperación...",
              )}
            </div>
          )}

          {error && (
            <div
              className="global-error"
              style={{
                display: "block",
                marginBottom: "16px",
              }}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {!verified ? (
            <form onSubmit={handleVerify} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  {t("auth.email", "Correo electrónico")}
                </label>

                <input
                  className="form-input"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  disabled={loadingVerify}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="token">
                  {t("resetPass.codeLabel", "Código de recuperación")}
                </label>

                <input
                  className="form-input"
                  type="text"
                  id="token"
                  name="token"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={token}
                  onChange={handleCodeChange}
                  disabled={loadingVerify}
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loadingVerify || !email.trim() || token.length !== 6}
              >
                {loadingVerify
                  ? t("resetPass.verifying", "Verificando...")
                  : t("resetPass.verify", "Verificar código")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} noValidate>
              <div
                style={{
                  marginBottom: "20px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "#f1f7f2",
                  border: "1px solid #d5e8d9",
                }}
              >
                <strong>
                  {t(
                    "resetPass.codeVerified",
                    "Código verificado correctamente.",
                  )}
                </strong>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  {t("resetPass.newPassword", "Nueva contraseña")}
                </label>

                <input
                  className="form-input"
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);

                    if (passwordError) {
                      setPasswordError("");
                    }

                    if (error) {
                      setError("");
                    }
                  }}
                  disabled={loadingReset}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  {t("resetPass.confirmPassword", "Confirmar contraseña")}
                </label>

                <input
                  className="form-input"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);

                    if (passwordError) {
                      setPasswordError("");
                    }
                  }}
                  disabled={loadingReset}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              {passwordError && (
                <div
                  className="global-error"
                  style={{
                    display: "block",
                    marginBottom: "16px",
                  }}
                  role="alert"
                >
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="btn-submit"
                disabled={loadingReset || !newPassword || !confirmPassword}
              >
                {loadingReset
                  ? t("resetPass.resetting", "Actualizando...")
                  : t("resetPass.resetButton", "Restablecer contraseña")}
              </button>
            </form>
          )}

          <div
            className="form-footer"
            style={{
              marginTop: "16px",
            }}
          >
            <Link to="/login">
              {t("forgotPass.backToLogin", "← Volver al inicio de sesión")}
            </Link>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200"
          alt="Cultivos agrícolas"
          className="bg-img"
          loading="lazy"
        />

        <div className="right-overlay">
          <div className="right-badge">
            {t("forgotPass.badge", "AgroMarket ASAFRUT")}
          </div>

          <h2 className="right-title">
            {t("resetPass.rightTitle", "Recupera el acceso a tu cuenta.")}
          </h2>

          <p className="right-sub">
            {t(
              "resetPass.rightSub",
              "Verifica tu código y establece una nueva contraseña de forma segura.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
