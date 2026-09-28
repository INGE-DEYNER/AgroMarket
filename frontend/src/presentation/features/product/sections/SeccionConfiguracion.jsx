import { useProductorData } from "./ProductorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";

/*
 * Seccion "Configuracion" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionConfiguracion() {
  const { user } = useAuth();
  const {
    showSection,
  } = useProductorData();

  return (
<div className={`section producer-section`} id="sec-configuracion">
  <div className="producer-section-head">
    <div>
      <span className="producer-eyebrow">Preferencias</span>
      <h1>Configuración</h1>
      <p>
        Administra los datos básicos y la seguridad de tu cuenta de
        productor.
      </p>
    </div>
  </div>
  <div className="producer-config-grid">
    <article className="producer-panel producer-config-card">
      <div className="producer-panel-title">
        <h2>Perfil de la finca</h2>
        <span>Datos de cuenta</span>
      </div>
      <div className="producer-config-row">
        <span>Nombre</span>
        <strong>{user?.nombre || "—"}</strong>
      </div>
      <div className="producer-config-row">
        <span>Correo</span>
        <strong>{user?.email || "—"}</strong>
      </div>
      <div className="producer-config-row">
        <span>Teléfono</span>
        <strong>{user?.telefono || "—"}</strong>
      </div>
      <div className="producer-config-row">
        <span>Ubicación</span>
        <strong>
          {[user?.ciudad, user?.departamento]
            .filter(Boolean)
            .join(", ") || "Urabá, Antioquia, Colombia"}
        </strong>
      </div>
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => showSection("perfil")}
      >
        Editar datos personales
      </button>
    </article>
    <article className="producer-panel producer-config-card">
      <div className="producer-panel-title">
        <h2>Seguridad</h2>
        <span>Protección de cuenta</span>
      </div>
      <div className="producer-security-item">
        <span className="producer-security-icon"><Icon name="check" size={16} /></span>
        <div>
          <strong>Correo registrado</strong>
          <small>{user?.email || "Sin correo"}</small>
        </div>
      </div>
      <div className="producer-security-item">
        <span className="producer-security-icon"><Icon name="check" size={16} /></span>
        <div>
          <strong>Estado de cuenta</strong>
          <small>
            {user?.verificado
              ? "Verificado"
              : "Pendiente de verificación"}
          </small>
        </div>
      </div>
      <div className="producer-security-item">
        <span className="producer-security-icon"><Icon name="lock" size={16} /></span>
        <div>
          <strong>Contraseña</strong>
          <small>
            Gestionada mediante el formulario seguro de cuenta.
          </small>
        </div>
      </div>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => showSection("perfil")}
      >
        Gestionar contraseña
      </button>
    </article>
  </div>
</div>
  );
}
