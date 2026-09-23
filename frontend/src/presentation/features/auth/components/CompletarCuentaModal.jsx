import { useState } from "react";
import api from "@/infrastructure/http/api";
import { useTranslation } from "react-i18next";
import leafIcon from "@/assets/icon-leaf.svg";
import shieldCheckIcon from "@/assets/icon-shield-check.svg";
import completeProfileBg from "@/assets/complete-profile-bg.png";
import "@/presentation/styles/auth-flow.css";

export default function CompletarCuentaModal({ onComplete }) {
  const { t } = useTranslation();
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [cedula, setCedula] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCedulaChange = (e) => {
    // Solo dígitos para CC/CE/NIT; el pasaporte sí permite letras
    const raw = e.target.value;
    if (tipoDocumento === "PASSPORT") {
      setCedula(raw.toUpperCase().slice(0, 20));
    } else {
      setCedula(raw.replace(/[^\d]/g, "").slice(0, 15));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cedulaLimpia = cedula.trim();

    if (!cedulaLimpia) {
      setError(
        t("completar.error.documento", "El número de documento es obligatorio"),
      );
      return;
    }

    if (cedulaLimpia.length < 5) {
      setError(
        t(
          "completar.error.documentoCorto",
          "El número de documento no es válido",
        ),
      );
      return;
    }

    if (!fechaNacimiento) {
      setError(
        t("completar.error.fecha", "La fecha de nacimiento es obligatoria"),
      );
      return;
    }

    // Validación de edad (mayor de 18 años)
    const birthDate = new Date(fechaNacimiento);
    if (Number.isNaN(birthDate.getTime())) {
      setError(
        t("completar.error.fechaInvalida", "La fecha ingresada no es válida"),
      );
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setError(
        t(
          "completar.error.edad",
          "Debes ser mayor de 18 años para usar la plataforma",
        ),
      );
      return;
    }

    if (age > 120) {
      setError(
        t("completar.error.fechaInvalida", "La fecha ingresada no es válida"),
      );
      return;
    }

                setLoading(true);
    try {
      const payload = {
        idType: tipoDocumento,
        idNumber: cedulaLimpia,
        birthDate: fechaNacimiento,
      };

      await api.put("/usuarios/mi-perfil", payload);

      // Fix: no dependemos únicamente de que el backend devuelva el nombre
      // exacto de campo esperado (cuentaCompleta). Si el PUT respondió OK,
      // desbloqueamos la UI de inmediato y sincronizamos en segundo plano.
      if (onComplete) {
        await onComplete({
          tipoDocumento,
          cedula: cedulaLimpia,
          fechaNacimiento,
        });
      }
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const msg = err?.message || "";

      if (
        status === 401 ||
        msg.includes("401") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("expirado")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("agromarket_cart");
        window.location.href = "/login";
        return;
      }

      setError(
        err?.fieldErrors?.cedula ||
          err?.fieldErrors?.documento ||
          err?.message ||
          t("completar.error.general", "Error al guardar los datos"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-modal-overlay" role="dialog" aria-modal="true">
      <div className="af-modal">
        {/* Panel izquierdo: imagen + avatar (frame: left-panel-complete) */}
        <div
          className="af-modal-left"
          style={{ backgroundImage: `url(${completeProfileBg})` }}
        >
          <div className="af-logo af-logo--light">
            <span className="af-logo-icon">
              <img src={leafIcon} alt="" width="20" height="20" />
            </span>
            <span className="af-logo-name af-logo-name--light">
              <em>Agro</em>Market
            </span>
          </div>

          <div className="af-avatar-ring" aria-hidden="true">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
            </svg>
          </div>
          <h2 className="af-modal-title">
            {t("completar.titulo", "Completa tu perfil")}
          </h2>
          <p className="af-modal-sub">
            {t(
              "completar.subtitulo",
              "Queremos brindarte la mejor experiencia de entrega rápida y directa según tu ubicación en Colombia.",
            )}
          </p>
          <p className="af-modal-privacy">
            {t(
              "completar.privacidad",
              "Tus datos están protegidos bajo nuestra estricta ley de protección de datos personales.",
            )}
          </p>
        </div>

        {/* Panel derecho: formulario (frame: form-container) */}
        <div className="af-modal-right">
          <div className="af-text af-text--left">
            <h1>{t("completar.formTitle", "Información personal")}</h1>
            <p>
              {t(
                "completar.formSub",
                "Por favor, bríndanos los detalles necesarios para verificar tu identidad y cumplir con la ley.",
              )}
            </p>
          </div>

          {error && (
            <div className="af-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <form className="af-form" onSubmit={handleSubmit} noValidate>
            <div className="af-field">
              <label htmlFor="tipoDocumento">
                {t("completar.tipoDoc", "Tipo de documento")}
              </label>
              <select
                id="tipoDocumento"
                className="af-input af-select"
                value={tipoDocumento}
                onChange={(e) => {
                  setTipoDocumento(e.target.value);
                  setCedula("");
                }}
                disabled={loading}
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="NIT">NIT</option>
                <option value="PASSPORT">Pasaporte</option>
              </select>
            </div>

            <div className="af-field">
              <label htmlFor="numeroDocumento">
                {t("completar.numDoc", "Número de documento")}
              </label>
              <input
                id="numeroDocumento"
                type="text"
                inputMode={tipoDocumento === "PASSPORT" ? "text" : "numeric"}
                placeholder={t(
                  "completar.placeholder.numDoc",
                  "Ingresa tu número de documento",
                )}
                value={cedula}
                onChange={handleCedulaChange}
                disabled={loading}
                className="af-input"
              />
            </div>

            <div className="af-field">
              <label htmlFor="fechaNacimiento">
                {t("completar.fechaNac", "Fecha de nacimiento")}
              </label>
              <input
                id="fechaNacimiento"
                type="date"
                className="af-input"
                value={fechaNacimiento}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="af-safety-note">
              <img src={shieldCheckIcon} alt="" width="16" height="16" />
              <span>
                {t(
                  "completar.seguridad",
                  "Tu información está segura. Solo la usamos para verificar tu identidad y cumplir con la ley.",
                )}
              </span>
            </div>

            <button type="submit" className="af-btn-primary" disabled={loading}>
              {loading
                ? t("completar.guardando", "Guardando...")
                : t("completar.guardar", "Guardar y continuar")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
