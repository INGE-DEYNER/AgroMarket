/*
 * SeccionPerfil — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";

export default function SeccionPerfil() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { handleUpdatePassword, handleUpdatePerfil, perfilForm, perfilMsg, pwForm, pwMsg, setPerfilForm, setPwForm, setShowCurrentPassword, setShowNewPassword, showCurrentPassword, showNewPassword } = useAdminData();

  return (
<div
                className="section"
                id="sec-perfil"
              >
                <div className="table-header">
                  <div>
                    <h3 className="card-title">
                      {t("profile.title", "Mi Perfil")}
                    </h3>
                    <p className="section-subtitle">
                      Datos personales y seguridad de tu cuenta
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "24px",
                    padding: "24px",
                  }}
                >
            {/* Profile Details Form */}
            <div
              className="card-table"
              style={{
                padding: "24px",
                borderRadius: "12px",
                background: "var(--card-bg)",
              }}
            >
              <h3
                style={{
                  marginBottom: "16px",
                  fontSize: "1.1rem",
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "8px",
                }}
              >
                Datos Personales
              </h3>
              {perfilMsg.text && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "0.85rem",
                    background:
                      perfilMsg.type === "success"
                        ? "var(--green-bg)"
                        : "var(--red-bg)",
                    color:
                      perfilMsg.type === "success"
                        ? "var(--primary)"
                        : "var(--red)",
                  }}
                >
                  {perfilMsg.text}
                </div>
              )}
              <form onSubmit={handleUpdatePerfil}>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label"> {t("paneles.admin.adminName")} </label>
                  <input
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border-light)",
                      borderRadius: "6px",
                    }}
                    value={perfilForm.nombre}
                    onChange={(e) =>
                      setPerfilForm({ ...perfilForm, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label"> {t("paneles.admin.supportPhone")} </label>
                  <input
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border-light)",
                      borderRadius: "6px",
                    }}
                    value={perfilForm.telefono}
                    onChange={(e) =>
                      setPerfilForm({ ...perfilForm, telefono: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">
                    Correo de Soporte (No editable)
                  </label>
                  <input
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border-light)",
                      borderRadius: "6px",
                      background: "var(--border-light)",
                      cursor: "not-allowed",
                    }}
                    value={user?.email || ""}
                    readOnly
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ width: "100%" }}
                >
                  Guardar Cambios
                </button>
              </form>
            </div>

            {/* Password Change Form */}
            <div
              className="card-table"
              style={{
                padding: "24px",
                borderRadius: "12px",
                background: "var(--card-bg)",
              }}
            >
              <h3
                style={{
                  marginBottom: "16px",
                  fontSize: "1.1rem",
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "8px",
                }}
              >
                Seguridad de la Cuenta
              </h3>
              {pwMsg.text && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "0.85rem",
                    background:
                      pwMsg.type === "success"
                        ? "var(--green-bg)"
                        : "var(--red-bg)",
                    color:
                      pwMsg.type === "success"
                        ? "var(--primary)"
                        : "var(--red)",
                  }}
                >
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={handleUpdatePassword}>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label"> {t("paneles.pw.current")} </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showCurrentPassword ? "text" : "password"}
                      style={{
                        width: "100%",
                        padding: "10px 40px 10px 12px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "6px",
                      }}
                      value={pwForm.contrasenaActual}
                      onChange={(e) =>
                        setPwForm({
                          ...pwForm,
                          contrasenaActual: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
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
                      aria-label={
                        showCurrentPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showCurrentPassword ? <Icon name="eyeOff" size={18} /> : <Icon name="eye" size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label"> {t("paneles.pw.new")} </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showNewPassword ? "text" : "password"}
                      style={{
                        width: "100%",
                        padding: "10px 40px 10px 12px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "6px",
                      }}
                      value={pwForm.nuevaContrasena}
                      onChange={(e) =>
                        setPwForm({
                          ...pwForm,
                          nuevaContrasena: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
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
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showNewPassword ? <Icon name="eyeOff" size={18} /> : <Icon name="eye" size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ width: "100%" }}
                >
                  Cambiar Contraseña
                </button>
              </form>
                </div>
              </div>
              </div>
  );
}
