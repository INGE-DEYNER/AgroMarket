import { useProductorData } from "./ProductorContexto.js";
import Icon from "@/presentation/shared/components/Icon";

/*
 * Seccion "Resenas" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionResenas() {
  const {
    calificacionProductor,
    reputacion,
    resenasProductor,
  } = useProductorData();

  return (
<div className={`section producer-section`} id="sec-resenas">
  <div className="producer-section-head">
    <div>
      <span className="producer-eyebrow">Reputación</span>
      <h1>Reseñas y calificaciones</h1>
      <p>
        Conoce la percepción de tus compradores y la valoración de tu
        negocio.
      </p>
    </div>
  </div>
  <div className="producer-rating-grid">
    <article className="producer-panel producer-rating-main">
      <span className="producer-panel-kicker">
        Calificación promedio
      </span>
      <strong>{calificacionProductor}</strong>
      <div className="producer-stars">
        {reputacion ? (
          <span className="flex text-yellow-500">
            {[...Array(Math.round(reputacion.promedio))].map(
              (_, i) => (
                <Icon key={i} name="star" size={16} />
              ),
            )}
          </span>
        ) : (
          <small style={{ color: "var(--text-dim)" }}>
            Aún no tienes reseñas publicadas.
          </small>
        )}
      </div>
      <small>
        {reputacion
          ? `${reputacion.total} reseñas de tus productos`
          : "Las reseñas de tus clientes aparecerán aquí"}
      </small>
    </article>
    <article className="producer-panel producer-recommendation">
      <span className="producer-panel-kicker">Recomendación</span>
      <strong>
        {resenasProductor.length
          ? "Compradores activos"
          : "Sin datos suficientes"}
      </strong>
      <p>
        La API actual no expone en el frontend un porcentaje
        específico de recomendación del productor.
      </p>
    </article>
  </div>
  <div className="producer-panel producer-table-panel">
    <div className="producer-panel-title">
      <h2>Últimas reseñas</h2>
      <span>{resenasProductor.length} registros</span>
    </div>
    {resenasProductor.length === 0 ? (
      <div className="producer-empty">
        No hay reseñas del productor disponibles con el identificador
        de productor expuesto por la respuesta actual.
      </div>
    ) : (
      <div className="producer-review-list">
        {resenasProductor.map((r, index) => (
          <article className="producer-review" key={r.id || index}>
            <div className="producer-review-avatar">
              {(
                r.usuarioNombre ||
                r.clienteNombre ||
                r.nombreUsuario ||
                "C"
              )
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="producer-review-body">
              <div className="producer-review-top">
                <strong>
                  {r.usuarioNombre ||
                    r.clienteNombre ||
                    r.nombreUsuario ||
                    "Comprador"}
                </strong>
                <span>{r.fecha || r.createdAt || ""}</span>
              </div>
              <div className="producer-stars">
                {"★".repeat(
                  Math.max(
                    0,
                    Math.min(
                      5,
                      Number(r.calificacion || r.rating || 5),
                    ),
                  ),
                )}
                {"☆".repeat(
                  Math.max(
                    0,
                    5 -
                      Math.min(
                        5,
                        Number(r.calificacion || r.rating || 5),
                      ),
                  ),
                )}
              </div>
              <p>
                {r.comentario ||
                  r.descripcion ||
                  r.texto ||
                  "Sin comentario."}
              </p>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
</div>
  );
}
