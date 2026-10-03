import { useProductorData } from "./ProductorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

/*
 * Seccion "Perfil" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionPerfil() {
  const { user } = useAuth();
  const {
    handleUpdatePassword,
    handleUpdatePerfil,
    perfilForm,
    perfilMsg,
    pwForm,
    pwMsg,
    setPerfilForm,
    setPwForm,
    setShowCurrentPassword,
    setShowNewPassword,
    showCurrentPassword,
    showNewPassword,
  } = useProductorData();

  return (
<div className={`section`} id="sec-perfil">
  <div className="dash-header">
    <div className="dash-welcome">
      <h1>Ajustes de Mi Perfil</h1>
      <p>
        Administra tu información de agricultor y credenciales de
        acceso
      </p>
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
      marginTop: "24px",
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
          <label className="form-label">Nombre del Productor</label>
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
          <label className="form-label">Teléfono de Contacto</label>
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
              setPerfilForm({
                ...perfilForm,
                telefono: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label className="form-label">
            Correo ASAFRUT (No editable)
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
          <label className="form-label">Contraseña Actual</label>
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
                showCurrentPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showCurrentPassword ? (
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
        </div>
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label className="form-label">Nueva Contraseña</label>
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
              {showNewPassword ? (
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
