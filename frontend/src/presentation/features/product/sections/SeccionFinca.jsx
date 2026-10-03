import { useProductorData } from "./ProductorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";

/*
 * Seccion "Finca" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionFinca() {
  const { user } = useAuth();
  const {
    calificacionProductor,
    iniciales,
    pedidos,
    productos,
    showSection,
  } = useProductorData();

  return (
<div className={`section producer-section`} id="sec-finca">
  <div className="producer-section-head">
    <div>
      <span className="producer-eyebrow">Perfil comercial</span>
      <h1>Información de la finca / productor</h1>
      <p>
        Información que identifica tu negocio dentro de AgroMarket.
      </p>
    </div>
    <button
      className="btn btn-primary"
      type="button"
      onClick={() => showSection("perfil")}
    >
      Editar información
    </button>
  </div>
  <div className="producer-farm-grid">
    <article className="producer-farm-card producer-farm-hero">
      <div className="producer-farm-image">{iniciales}</div>
      <span className="producer-verified">
        <Icon name="check" size={16} className="inline mr-1" /> Productor verificado
      </span>
      <h2>{user?.nombreEmpresa || user?.nombre || "Productor AgroMarket"}</h2>
      <p>
        {[
          user?.ciudad,
          user?.departamento,
        ]
          .filter(Boolean)
          .join(", ") || "Urabá, Antioquia, Colombia"}
      </p>
      <div className="producer-farm-stats">
        <span>
          <strong>{productos.length}</strong> productos
        </span>
        <span>
          <strong>{pedidos.length}</strong> pedidos
        </span>
        <span>
          <strong>{calificacionProductor}</strong> rating
        </span>
      </div>
    </article>
    <article className="producer-panel producer-info-list">
      <div className="producer-panel-title">
        <h2>Información general</h2>
      </div>
      <div className="producer-info-row">
        <span>Nombre del productor</span>
        <strong>
          {user?.nombre || "—"} {user?.apellido || ""}
        </strong>
      </div>
      <div className="producer-info-row">
        <span>Correo electrónico</span>
        <strong>{user?.email || "—"}</strong>
      </div>
      <div className="producer-info-row">
        <span>Teléfono</span>
        <strong>{user?.telefono || "—"}</strong>
      </div>
      <div className="producer-info-row">
        <span>Ubicación</span>
        <strong>
          {[user?.ciudad, user?.departamento]
            .filter(Boolean)
            .join(", ") || "Urabá, Antioquia, Colombia"}
        </strong>
      </div>
      <div className="producer-info-row">
        <span>Tipo de productor</span>
        <strong>
          {user?.nombreEmpresa
            ? "Empresa / asociación"
            : "Productor agrícola"}
        </strong>
      </div>
      <div className="producer-info-row">
        <span>Productos principales</span>
        <strong>
          {productos
            .slice(0, 4)
            .map((p) => p.nombre)
            .join(", ") || "Sin productos publicados"}
        </strong>
      </div>
    </article>
  </div>
</div>
  );
}
