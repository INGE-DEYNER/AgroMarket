import { useState } from "react";
import api from "@/infrastructure/http/api";
import { useTranslation } from "react-i18next";

export default function CompletarCuentaModal({ onComplete }) {
  const { t } = useTranslation();
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [cedula, setCedula] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cedula.trim()) {
      setError(
        t("completar.error.documento", "El número de documento es obligatorio"),
      );
      return;
    }

    if (!fechaNacimiento) {
      setError(
        t("completar.error.fecha", "La fecha de nacimiento es obligatoria"),
      );
      return;
    }

    // Age validation (older than 18)
    const birthDate = new Date(fechaNacimiento);
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

    setLoading(true);
    try {
      await api.put("/usuarios/mi-perfil", {
        tipoDocumento,
        cedula,
        fechaNacimiento,
      });
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      // 401 → sesión expirada, redirige a login (el auto-logout de api.js ya lo maneja,
      // pero por si acaso capturamos aquí también)
      const msg = err.message || "";
      if (
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
        err.message ||
          t("completar.error.general", "Error al guardar los datos"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(26, 46, 30, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#2E7D32",
            textAlign: "center",
          }}
        >
          {t("completar.titulo", "Completa tu cuenta")}
        </h2>
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "14px",
            color: "#666666",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          {t(
            "completar.subtitulo",
            "Por regulaciones legales, debes completar los siguientes datos antes de continuar.",
          )}
        </p>

        {error && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "20px",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#4a5d4e" }}
            >
              {t("completar.tipoDoc", "Tipo de Documento")}
            </label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cccccc",
                outline: "none",
                fontSize: "15px",
              }}
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="NIT">NIT</option>
              <option value="PASSPORT">Pasaporte</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#4a5d4e" }}
            >
              {t("completar.numDoc", "Número de Documento")}
            </label>
            <input
              type="text"
              placeholder={t(
                "completar.placeholder.numDoc",
                "Ingresa tu número de documento",
              )}
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cccccc",
                outline: "none",
                fontSize: "15px",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#4a5d4e" }}
            >
              {t("completar.fechaNac", "Fecha de Nacimiento")}
            </label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cccccc",
                outline: "none",
                fontSize: "15px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2E7D32",
              color: "#ffffff",
              border: "none",
              padding: "14px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px",
              transition: "background 0.3s",
            }}
          >
            {loading
              ? t("completar.guardando", "Guardando...")
              : t("completar.guardar", "Guardar y Continuar")}
          </button>
        </form>
      </div>
    </div>
  );
}
