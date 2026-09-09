/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";
import leafIcon from "@/assets/icon-leaf.svg";
import { ThemeToggle } from "@/presentation/shared/components/ThemeToggle";
import "@/presentation/styles/auth-flow.css";

export default function VerificarCorreo() {
  const location = useLocation();
  const { token: paramsToken } = useParams();
  const searchToken = new URLSearchParams(location.search).get("token");
  const token = paramsToken || searchToken;
  const { t } = useTranslation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendiente, setPendiente] = useState(false);

  const verificarPorToken = useCallback(
    async (tk) => {
      setLoading(true);
      try {
        const res = await api.post("/auth/email-verification/verify", { token: tk });
        if (res.pendiente) setPendiente(true);
        setSuccess(
          res.message ||
            t("verifyEmail.successVerifying", "Correo verificado con éxito."),
        );
      } catch (err) {
        setError(
          err.message ||
            t("verifyEmail.errorVerifying", "Error al verificar el token."),
        );
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (!token) return;
    void verificarPorToken(token);
  }, [token, verificarPorToken]);

  const handleSubmitCodigo = async (e) => {
    e.preventDefault();
    if (!email || !codigo) {
      setError(
        t(
          "verifyEmail.inputCodeError",
          "Debes ingresar el correo y el código de 6 dígitos.",
        ),
      );
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/auth/email-verification/verify", {
        token: codigo,
      });
      if (res.pendiente) setPendiente(true);
      setSuccess(
        res.message ||
          t("verifyEmail.successVerifying", "Correo verificado con éxito."),
      );
    } catch (err) {
      setError(
        err.message ||
          t("verifyEmail.incorrectCodeError", "Código incorrecto o expirado."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(
        t(
          "verifyEmail.resendInputError",
          "Ingresa tu correo para reenviar el código.",
        ),
      );
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/email-verification/resend", { email });
      setSuccess(
        t(
          "verifyEmail.resendSuccess",
          "Código reenviado. Revisa tu bandeja de entrada.",
        ),
      );
    } catch (err) {
      setError(
        err.message || t("verifyEmail.resendError", "Error al reenviar."),
      );
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

      <div className="af-card">
        {/* Marca + ícono de éxito */}
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
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2ECC71"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Contenido principal */}
        {success ? (
          <div className="af-text">
            <h1>
              {pendiente
                ? t("verifyEmail.pendingTitle", "¡Casi listo!")
                : t("verifyEmail.successTitle", "¡Correo verificado!")}
            </h1>
            <p>{success}</p>
            {email && <span className="af-email-pill">{email}</span>}
            {pendiente && (
              <div className="af-info-box">
                {t(
                  "verifyEmail.pendingProducerDesc",
                  "Como Productor, tu cuenta está ahora en revisión por un administrador. Te notificaremos cuando puedas acceder.",
                )}
              </div>
            )}
            <Link to="/login" className="af-btn-primary af-btn-inline">
              {t("verifyEmail.loginLinkBtn", "Ir al inicio de sesión")}
            </Link>
          </div>
        ) : (
          <>
            <div className="af-text">
              <h1>
                {t("verifyEmail.title", "¡Casi listo! Verifica tu correo")}
              </h1>
              <p>
                {t(
                  "verifyEmail.formSub",
                  "Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico registrado para proteger tu cuenta:",
                )}
              </p>
              {email && <span className="af-email-pill">{email}</span>}
            </div>

            {error && (
              <div className="af-error" role="alert">
                {error}
              </div>
            )}

            <form className="af-form" onSubmit={handleSubmitCodigo} noValidate>
              <div className="af-field">
                <label htmlFor="email">
                  {t("auth.email", "Correo electrónico")}
                </label>
                <input
                  id="email"
                  type="email"
                  className="af-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="af-field">
                <label htmlFor="codigo">
                  {t("verifyEmail.codeLabel", "Código de 6 dígitos")}
                </label>
                <input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="af-input af-input--otp"
                  placeholder="000000"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="af-btn-primary"
                disabled={loading}
              >
                {loading
                  ? t("verifyEmail.verifyingBtn", "Verificando...")
                  : t("verifyEmail.verifyBtn", "Verificar correo")}
              </button>
            </form>
          </>
        )}

        {/* Pasos */}
        <div className="af-steps">
          <div className="af-step">
            <span className="af-step-num">1</span>
            <span>
              {t("verifyEmail.step1", "Revisa tu bandeja de entrada o spam.")}
            </span>
          </div>
          <div className="af-step">
            <span className="af-step-num">2</span>
            <span>
              {t("verifyEmail.step2", "Haz clic en el botón de confirmación.")}
            </span>
          </div>
          <div className="af-step">
            <span className="af-step-num">3</span>
            <span>
              {t(
                "verifyEmail.step3",
                "¡Listo! Empieza a comprar directo del campo.",
              )}
            </span>
          </div>
        </div>

        {/* Ayuda */}
        {!success && (
          <div className="af-troubleshoot">
            <div className="af-resend-row">
              <span>
                {t(
                  "verifyEmail.notReceived",
                  "¿No recibiste el correo electrónico?",
                )}
              </span>
              <a href="#" onClick={handleReenviar} className="af-resend-link">
                {loading
                  ? t("verifyEmail.resending", "Reenviando...")
                  : t("verifyEmail.resendLink", "Reenviar enlace")}
              </a>
            </div>
            <hr className="af-divider" />
            <p className="af-help-text">
              {t("verifyEmail.needHelp", "¿Tienes algún problema?")}{" "}
              <Link to="/ayuda" className="af-help-strong">
                {t("verifyEmail.whatsappHelp", "Contáctanos por WhatsApp 24/7")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
