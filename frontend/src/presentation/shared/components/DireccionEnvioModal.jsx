import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";

/**
 * Modal de dirección de envío del usuario.
 *
 * BUG "Configura tu dirección" no hacía nada: el bloque del navbar era un
 * <div> sin onClick y en el repo NO existía ninguna lógica real de
 * direcciones (la página /especial/direcciones es un mock estático).
 *
 * Este modal usa lo que ya existe en el backend: los campos de dirección
 * del perfil (fullAddress, city, department, addressReference, postalCode)
 * persistidos con PUT /usuarios/mi-perfil (UserController.updateMe). Al
 * guardar, actualiza el usuario del AuthContext para que el navbar refleje
 * la dirección de inmediato (y también tras recargar, porque viene del
 * backend vía /usuarios/me).
 */
export default function DireccionEnvioModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    direccionCompleta: "",
    ciudad: "",
    departamento: "",
    referencia: "",
    codigoPostal: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setForm({
      direccionCompleta:
        user?.direccionCompleta || user?.direccion || user?.ubicacion || "",
      ciudad: user?.ciudad || "",
      departamento: user?.departamento || "",
      referencia: user?.referencia || "",
      codigoPostal: user?.codigoPostal || "",
    });
    setError("");
    setExito(false);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, user, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setExito(false);

    if (!form.direccionCompleta.trim()) {
      setError(
        t("direccion.error.obligatoria", "La dirección de envío es obligatoria"),
      );
      return;
    }

    setLoading(true);

    try {
      await api.put("/usuarios/mi-perfil", {
        fullAddress: form.direccionCompleta.trim(),
        city: form.ciudad.trim() || null,
        department: form.departamento.trim() || null,
        addressReference: form.referencia.trim() || null,
        postalCode: form.codigoPostal.trim() || null,
      });

      // Reflejar la dirección de inmediato en el navbar (user del
      // AuthContext). El backend ya la persistió, así que también
      // sobrevive a un F5 vía /usuarios/me.
      setUser((prev) =>
        prev
          ? {
              ...prev,
              direccionCompleta: form.direccionCompleta.trim(),
              ciudad: form.ciudad.trim() || prev.ciudad,
              departamento: form.departamento.trim() || prev.departamento,
              referencia: form.referencia.trim() || prev.referencia,
              codigoPostal: form.codigoPostal.trim() || prev.codigoPostal,
            }
          : prev,
      );

      setExito(true);
      setTimeout(() => onClose(), 900);
    } catch (err) {
      setError(
        err?.message ||
          t("direccion.error.guardar", "No se pudo guardar la dirección"),
      );
    } finally {
      setLoading(false);
    }
  };

  return renderModal({
    t,
    onClose,
    error,
    exito,
    loading,
    handleSubmit,
    form,
    handleChange,
  });
}

function renderModal({
  t,
  onClose,
  error,
  exito,
  loading,
  handleSubmit,
  form,
  handleChange,
}) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(2, 10, 6, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configurar dirección de envío"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(480px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--color-surface, #ffffff)",
          color: "var(--color-text-primary, #0f172a)",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
          padding: "26px 26px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "6px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
              {t("direccion.titulo", "Configura tu dirección")}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.86rem",
                color: "var(--color-text-muted, #64748b)",
              }}
            >
              {t(
                "direccion.subtitulo",
                "Esta es la dirección donde recibiremos tus pedidos.",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: "pointer",
              color: "var(--color-text-secondary, #475569)",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {exito && (
          <div
            role="status"
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#dcfce7",
              color: "#166534",
              fontSize: "0.85rem",
            }}
          >
            {t("direccion.exito", "Dirección guardada correctamente")}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "14px",
          }}
        >
          <Field
            label={t("direccion.direccion", "Dirección completa")}
            value={form.direccionCompleta}
            onChange={handleChange("direccionCompleta")}
            placeholder={t(
              "direccion.placeholder.direccion",
              "Calle 10 # 20-30, Apt 501",
            )}
            required
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Field
              label={t("direccion.ciudad", "Ciudad")}
              value={form.ciudad}
              onChange={handleChange("ciudad")}
              placeholder={t("direccion.placeholder.ciudad", "Apartadó")}
            />

            <Field
              label={t("direccion.departamento", "Departamento")}
              value={form.departamento}
              onChange={handleChange("departamento")}
              placeholder={t("direccion.placeholder.departamento", "Antioquia")}
            />
          </div>

          <Field
            label={t("direccion.referencia", "Referencia (opcional)")}
            value={form.referencia}
            onChange={handleChange("referencia")}
            placeholder={t(
              "direccion.placeholder.referencia",
              "Casa de puerta verde, cerca al parque",
            )}
          />

          <Field
            label={t("direccion.codigoPostal", "Código postal (opcional)")}
            value={form.codigoPostal}
            onChange={handleChange("codigoPostal")}
            placeholder="050021"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "6px",
              minHeight: "46px",
              border: "none",
              borderRadius: "10px",
              background: "var(--color-primary, #10b981)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? t("direccion.guardando", "Guardando...")
              : t("direccion.guardar", "Guardar dirección")}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, value, onChange, placeholder, required = false }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--color-text-secondary, #475569)",
        }}
      >
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          minHeight: "42px",
          padding: "9px 12px",
          borderRadius: "9px",
          border: "1px solid var(--color-border, #e2e8f0)",
          background: "var(--color-surface, #ffffff)",
          color: "var(--color-text-primary, #0f172a)",
          fontSize: "0.92rem",
        }}
      />
    </label>
  );
}