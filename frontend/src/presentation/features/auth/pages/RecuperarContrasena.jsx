import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/presentation/shared/components/Icon";
import api from "@/infrastructure/http/api";
import leafIcon from "@/assets/icon-leaf.svg";
import shieldCheckIcon from "@/assets/icon-shield-check.svg";
import { ThemeToggle } from "@/presentation/shared/components/ThemeToggle";
import "@/presentation/styles/auth-flow.css";

export default function RecuperarContrasena() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        t("forgotPass.inputEmailError", "Ingresa tu correo electrónico."),
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError(
        t("forgotPass.invalidEmail", "Ingresa un correo electrónico válido."),
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/recuperar-contrasena", {
        email: normalizedEmail,
      });

      // Guardamos el correo para que no se pierda durante la
      // navegación hacia RestablecerContrasena.
      sessionStorage.setItem("agromarket_recovery_email", normalizedEmail);
      sessionStorage.removeItem("agromarket_recovery_token");

      setSent(true);

      setTimeout(() => {
        navigate("/restablecer-contrasena", {
          state: { email: normalizedEmail },
        });
      }, 1500);
    } catch (err) {
      const status = err?.response?.status;

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail;

      let message;

      switch (status) {
        case 400:
          message =
            backendMessage || "El correo electrónico enviado no es válido.";
          break;
        case 401:
          message =
            backendMessage ||
            "No tienes autorización para realizar esta solicitud.";
          break;
        case 404:
          message =
            backendMessage ||
            "No se encontró la cuenta asociada a este correo.";
          break;
        case 429:
          message =
            backendMessage ||
            "Has realizado demasiadas solicitudes. Espera unos minutos e inténtalo nuevamente.";
          break;
        case 500:
        case 502:
        case 503:
          message =
            backendMessage ||
            "El servidor no pudo procesar la solicitud. Inténtalo nuevamente.";
          break;
        default:
          if (err?.request && !err?.response) {
            message =
              "No se pudo conectar con el servidor. Verifica que AgroMarket esté ejecutándose.";
          } else {
            message =
              backendMessage ||
              err?.message ||
              "No fue posible enviar el código de recuperación.";
          }
          break;
      }

      setError(message);
      setSent(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-page">
      {/* Selector de tema — reutiliza el mecanismo global del repo */}
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="af-card af-card--sm">
        {/* Marca + ícono de seguridad */}
        <div className="af-brand">
          <Link to="/home" className="af-logo">
            <span className="af-logo-icon">
              <img src={leafIcon} alt="" width="20" height="20" />
            </span>
            <span className="af-logo-name">
              <em>Agro</em>Market
            </span>
          </Link>
          <div className="af-success-badge af-success-badge--green">
            <img src={shieldCheckIcon} alt="" width="28" height="28" />
          </div>
        </div>

        {/* Textos */}
        <div className="af-text">
          <h1>{t("forgotPass.title", "¿Olvidaste tu contraseña?")}</h1>
          <p>
            {t(
              "forgotPass.sub",
              "No te preocupes. Introduce el correo asociado a tu cuenta y te enviaremos un enlace de recuperación seguro en segundos.",
            )}
          </p>
        </div>

        {/* Contenido principal */}
        {sent ? (
          <div className="af-text" role="status" aria-live="polite">
            <p className="af-sent-strong">
              {t("forgotPass.sentSuccess", "Código enviado correctamente.")}
            </p>
            <p>
              {t(
                "forgotPass.redirecting",
                "Redirigiendo para que ingreses el código...",
              )}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="af-error" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <form className="af-form" onSubmit={handleSubmit} noValidate>
              <div className="af-field">
                <label htmlFor="email">
                  {t("forgotPass.emailLabel", "Correo electrónico registrado")}
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
                  disabled={loading}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  maxLength={254}
                  required
                  aria-invalid={Boolean(error)}
                />
              </div>

              <button
                type="submit"
                className="af-btn-primary"
                disabled={loading}
              >
                {loading
                  ? t("forgotPass.sendingBtn", "Enviando...")
                  : t("forgotPass.sendBtn", "Enviar enlace de recuperación")}
              </button>
            </form>
          </>
        )}

        {/* Ayuda */}
        <div className="af-troubleshoot">
          <span className="af-safety-badge">
            <img src={shieldCheckIcon} alt="" width="14" height="14" />
            {t(
              "forgotPass.safetyBadge",
              "Tu seguridad es nuestra mayor prioridad",
            )}
          </span>
          <hr className="af-divider" />
          <Link to="/login" className="af-back-link">
            <Icon name="arrowLeft" size={14} /> {t("forgotPass.backToLogin", "Volver al inicio de sesión")}
          </Link>
        </div>
      </div>
    </div>
  );
}
