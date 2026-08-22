import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/login.css";

export default function RecuperarContrasena() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

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

      /*
       * Guardamos el correo para que no se pierda
       * durante la navegación hacia RestablecerContrasena.
       */
      sessionStorage.setItem("agromarket_recovery_email", normalizedEmail);

      /*
       * Eliminamos cualquier código anterior.
       */
      sessionStorage.removeItem("agromarket_recovery_token");

      console.log("Solicitud de recuperación enviada correctamente.");

      setSent(true);

      setTimeout(() => {
        navigate("/restablecer-contrasena", {
          state: {
            email: normalizedEmail,
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Error al solicitar recuperación de contraseña:", err);

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
            {t("forgotPass.title", "¿Olvidaste tu contraseña?")}
          </h1>

          <p className="page-sub">
            {t(
              "forgotPass.sub",
              "Ingresa tu correo y te enviaremos un código de recuperación de 6 dígitos.",
            )}
          </p>

          {sent ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
              }}
              role="status"
              aria-live="polite"
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e8f5e9",
                  color: "#218739",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
                aria-hidden="true"
              >
                ✓
              </div>

              <p
                style={{
                  margin: "0 0 8px",
                  fontWeight: "600",
                }}
              >
                {t("forgotPass.sentSuccess", "Código enviado correctamente.")}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  opacity: 0.75,
                }}
              >
                {t(
                  "forgotPass.redirecting",
                  "Redirigiendo para que ingreses el código...",
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
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

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading
                  ? t("forgotPass.sendingBtn", "Enviando...")
                  : t("forgotPass.sendBtn", "Enviar código de recuperación")}
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
            {t("forgotPass.rightTitle", "Recupera tu acceso fácilmente.")}
          </h2>

          <p className="right-sub">
            {t(
              "forgotPass.rightSub",
              "Tu cuenta está a salvo. Solo sigue las instrucciones y verifica con el código.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
