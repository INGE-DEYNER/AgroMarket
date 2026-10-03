/*
 * SeccionResenas — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import Icon from "@/presentation/shared/components/Icon";

export default function SeccionResenas() {
  // `comentario` no se usa en esta seccion: el formulario de la reseña vive en
  // el modal del padre, que se queda montado a proposito.
  const { reviews, setReviewModalOpen } = useCompradorData();

  return (
<div className="section" id="sec-resenas">
          <div
            className="section-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <span
              className="section-title"
              style={{ fontSize: "1.25rem", fontWeight: "700" }}
            >
              {" "}
              Mis Reseñas de Productos
            </span>
            <button
              className="btn btn-primary"
              onClick={() => setReviewModalOpen(true)}
            >
              + Nueva reseña
            </button>
          </div>

          <div id="reviewsList">
            {reviews.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  padding: "60px",
                  textAlign: "center",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                }}
              >
                <div style={{ fontSize: "2rem" }}></div>
                <div>No hay reseñas registradas aún.</div>
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="review-card"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "12px",
                    padding: "20px 24px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ fontWeight: "700" }}>
                      {r.compradorNombre || "Usuario"}
                    </div>
                    <div style={{ color: "var(--gold)", fontSize: "1.1rem" }}>
                      {[...Array(r.calificacion || 5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="star"
                          size={14}
                          className="inline text-yellow-500"
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ color: "var(--text-secondary)" }}>
                    {r.comentario}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "8px",
                    }}
                  >
                    {new Date(r.fecha).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
  );
}
