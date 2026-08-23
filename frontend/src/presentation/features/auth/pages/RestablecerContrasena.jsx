import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";
import leafIcon from "@/assets/icon-leaf.svg";
import { ThemeToggle } from "@/presentation/shared/components/ThemeToggle";
import "@/presentation/styles/auth-flow.css";

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // DATOS DEL ENLACE DEL CORREO
  const searchParams = new URLSearchParams(location.search);
  const emailFromUrl = searchParams.get("email") || "";
  const tokenFromUrl = searchParams.get("token") || "";

  // DATOS TEMPORALES DE RESPALDO
  const storedEmail = sessionStorage.getItem("agromarket_recovery_email") || "";
  const storedToken = sessionStorage.getItem("agromarket_recovery_token") || "";

  const normalizeEmail = (value) => {
    if (!value) return "";
    try {
      return decodeURIComponent(value).trim().toLowerCase();
    } catch {
      return value.trim().toLowerCase();
    }
  };

  const normalizeToken = (value) => {
    if (!value) return "";
    try {
      return decodeURIComponent(value).trim();
    } catch {
      return value.trim();
    }
  };

  // PRIORIDAD: 1. URL, 2. React Router state, 3. sessionStorage
  const initialEmail =
    normalizeEmail(emailFromUrl) ||
    normalizeEmail(location.state?.email) ||
    normalizeEmail(storedEmail);

  const initialToken =
    normalizeToken(tokenFromUrl) ||
    normalizeToken(location.state?.token) ||
    normalizeToken(storedToken);

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
  // Estados locales de UI para los toggles de visibilidad del frame
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      sessionStorage.setItem("agromarket_recovery_email", initialEmail);
    }
    if (initialToken) {
      sessionStorage.setItem("agromarket_recovery_token", initialToken);
    }
  }, [initialEmail, initialToken]);

  // VERIFICACIÓN AUTOMÁTICA (?email=...&token=...)
  useEffect(() => {
    if (!initialEmail || !initialToken) return;

    let cancelled = false;

    const verifyTokenFromUrl = async () => {
      setLoadingVerify(true);
      setError("");

      try {
        await api.post("/auth/verify-code", {
          email: initialEmail,
          token: initialToken,
        });

        if (cancelled) return;

        setEmail(initialEmail);
        setToken(initialToken);
        setVerified(true);

        sessionStorage.setItem("agromarket_recovery_email", initialEmail);
        sessionStorage.setItem("agromarket_recovery_token", initialToken);
      } catch (err) {
        if (cancelled) return;
        setVerified(false);
        setError(getBackendMessage(err));
      } finally {
        if (!cancelled) setLoadingVerify(false);
      }
    };

    verifyTokenFromUrl();

    return () => {
      cancelled = true;
    };
  }, [initialEmail, initialToken]);

  function getBackendMessage(err) {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.detail ||
      err?.message ||
      ""
    );
  }

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

  const handleVerify = async (event) => {
    event.preventDefault();
    if (loadingVerify) return;
    await verificarCodigo();
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (loadingReset) return;

    setError("");
    setPasswordError("");

    const normalizedEmail = normalizeEmail(email);
    const normalizedToken = normalizeToken(token);

    if (!normalizedEmail) {
      setError(
        t("resetPass.emailRequired", "El correo electrónico es obligatorio."),
      );
      return;
    }

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

      sessionStorage.removeItem("agromarket_recovery_email");
      sessionStorage.removeItem("agromarket_recovery_token");

      setSuccess(true);
      setVerified(false);

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
      const backendMessage = getBackendMessage(err);
      setError(
        backendMessage ||
          t(
            "resetPass.resetError",
            "No fue posible restablecer la contraseña.",
          ),
      );
      // Si el backend rechaza el token porque expiró, obligamos a
      // solicitar uno nuevo.
      setVerified(false);
    } finally {
      setLoadingReset(false);
    }
  };

  const handleCodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
    setToken(value);
    if (error) setError("");
    // Si el usuario modifica el código, ya no consideramos válida
    // la verificación anterior.
    if (verified) setVerified(false);
  };

  const passwordChecks = [
    {
      label: t("resetPass.reqLength", "Mínimo 8 caracteres de longitud"),
      valid: newPassword.length >= 8,
    },
    {
      label: t("resetPass.reqUpper", "Al menos una letra mayúscula"),
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: t("resetPass.reqLower", "Al menos una letra minúscula"),
      valid: /[a-z]/.test(newPassword),
    },
    {
      label: t("resetPass.reqNumber", "Al menos un número o carácter especial"),
      valid: /[0-9!@#$%^&*.]/.test(newPassword),
    },
  ];

  const eyeIcon = (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeOffIcon = (
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
  );

  return (
    <div className="af-page">
      {/* Selector de tema — reutiliza el mecanismo global del repo */}
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="af-card af-card--sm">
        {/* Marca + ícono */}
        <div className="af-brand">
          <Link to="/home" className="af-logo">
            <span className="af-logo-icon">
              <img src={leafIcon} alt="" width="20" height="20" />
            </span>
            <span className="af-logo-name">
              <em>Agro</em>Market
            </span>
          </Link>
          <div className="af-success-badge" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2ECC71"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.3L12 3z" />
              <path d="M19 15l.7 2.1L21.8 18l-2.1.7L19 20.8l-.7-2.1L16.2 18l2.1-.9L19 15z" />
            </svg>
          </div>
        </div>

        {/* Textos */}
        <div className="af-text">
          <h1>
            {success
              ? t("resetPass.successTitle", "Contraseña actualizada")
              : verified
                ? t(
                    "resetPass.newPasswordTitle",
                    "Crea una nueva contraseña segura",
                  )
                : t("resetPass.title", "Restablecer contraseña")}
          </h1>
          <p>
            {success
              ? t(
                  "resetPass.successMessage",
                  "Tu contraseña fue actualizada correctamente. Serás redirigido al inicio de sesión.",
                )
              : verified
                ? t(
                    "resetPass.newPasswordSub",
                    "Por favor, crea una nueva contraseña segura para tu cuenta.",
                  )
                : t(
                    "resetPass.subtitle",
                    "Ingresa tu correo y el código de 6 dígitos que recibiste por correo electrónico.",
                  )}
          </p>
        </div>

        {/* Contenido principal */}
        {success ? null : loadingVerify && initialToken ? (
          <div className="af-info-box">
            {t(
              "resetPass.verifyingLink",
              "Verificando el código de recuperación...",
            )}
          </div>
        ) : !verified ? (
          <>
            {error && (
              <div className="af-error" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <form className="af-form" onSubmit={handleVerify} noValidate>
              <div className="af-field">
                <label htmlFor="email">
                  {t("auth.email", "Correo electrónico")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="af-input"
                  placeholder={t(
                    "forgotPass.emailPlaceholder",
                    "ejemplo@email.com",
                  )}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                  }}
                  disabled={loadingVerify}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                />
              </div>

              <div className="af-field">
                <label htmlFor="token">
                  {t("resetPass.codeLabel", "Código de recuperación")}
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  className="af-input af-input--otp"
                  value={token}
                  onChange={handleCodeChange}
                  disabled={loadingVerify}
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <button
                type="submit"
                className="af-btn-primary"
                disabled={loadingVerify || !email.trim() || token.length !== 6}
              >
                {loadingVerify
                  ? t("resetPass.verifying", "Verificando...")
                  : t("resetPass.verify", "Verificar código")}
              </button>
            </form>
          </>
        ) : (
          <>
            {error && (
              <div className="af-error" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <form className="af-form" onSubmit={handleResetPassword} noValidate>
              <div className="af-field">
                <label htmlFor="newPassword">
                  {t("resetPass.newPassword", "Nueva contraseña")}
                </label>
                <div className="af-input-wrap">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    className="af-input"
                    placeholder={t(
                      "resetPass.newPasswordPlaceholder",
                      "Mínimo 8 caracteres",
                    )}
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      if (passwordError) setPasswordError("");
                      if (error) setError("");
                    }}
                    disabled={loadingReset}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="af-toggle-visibility"
                    onClick={() => setShowNew(!showNew)}
                    aria-label={
                      showNew ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showNew ? eyeOffIcon : eyeIcon}
                  </button>
                </div>
              </div>

              <div className="af-field">
                <label htmlFor="confirmPassword">
                  {t("resetPass.confirmPassword", "Confirmar nueva contraseña")}
                </label>
                <div className="af-input-wrap">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    className="af-input"
                    placeholder={t(
                      "resetPass.confirmPlaceholder",
                      "Repite tu nueva contraseña",
                    )}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    disabled={loadingReset}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="af-toggle-visibility"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={
                      showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showConfirm ? eyeOffIcon : eyeIcon}
                  </button>
                </div>
              </div>

              {/* Requisitos de la contraseña (frame: requirements) */}
              <div className="af-requirements">
                <span className="af-requirements-title">
                  {t(
                    "resetPass.requirementsTitle",
                    "La contraseña debe contener:",
                  )}
                </span>
                {passwordChecks.map((c) => (
                  <span key={c.label} className="af-requirement">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke={c.valid ? "#2ECC71" : "currentColor"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9.99969 3L4.50024 8.4996L2.00049 5.99978" />
                    </svg>
                    {c.label}
                  </span>
                ))}
              </div>

              {passwordError && (
                <div className="af-error" role="alert">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="af-btn-primary"
                disabled={loadingReset || !newPassword || !confirmPassword}
              >
                {loadingReset
                  ? t("resetPass.resetting", "Actualizando...")
                  : t("resetPass.resetButton", "Restablecer contraseña")}
              </button>
            </form>
          </>
        )}

        {/* Pie */}
        {!success && (
          <>
            <hr className="af-divider" />
            <Link to="/login" className="af-back-link">
              ← {t("forgotPass.backToLogin", "Volver al inicio de sesión")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
