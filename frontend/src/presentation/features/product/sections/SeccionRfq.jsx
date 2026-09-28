import { useProductorData } from "./ProductorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

/*
 * Seccion "Rfq" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionRfq() {
  const { formatPrice, user } = useAuth();
  const {
    activeRfqs,
    bidForm,
    bidMsg,
    biddingRfq,
    enviarBid,
    productos,
    setBidForm,
    setBidMsg,
    setBiddingRfq,
  } = useProductorData();

  return (
<div className={`section`} id="sec-rfq">
  <div className="dash-header">
    <div className="dash-welcome">
      <h1>Licitaciones / Oportunidades Comerciales</h1>
      <p>
        Encuentra solicitudes de compra al por mayor y envía tus
        cotizaciones de forma segura
      </p>
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: biddingRfq ? "1fr 1fr" : "1fr",
      gap: "24px",
      marginTop: "24px",
    }}
  >
    {/* Active RFQ List */}
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
        Licitaciones Disponibles
      </h3>
      {activeRfqs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--text-muted)",
          }}
        >
          No hay licitaciones activas en este momento.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {activeRfqs.map((rfq) => {
            const yaOferto = rfq.ofertas?.find(
              (of) => of.productorId === user?.id,
            );
            return (
              <div
                key={rfq.id}
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "1rem",
                      color: "var(--primary)",
                    }}
                  >
                    {rfq.tipoFruta} - {rfq.cantidadRequerida} kg
                  </span>
                  <div
                    style={{ fontSize: "0.8rem", margin: "4px 0" }}
                  >
                    Comprador: <strong>{rfq.compradorNombre}</strong>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      margin: "4px 0",
                    }}
                  >
                    {rfq.descripcion}
                  </p>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Vence:{" "}
                    {new Date(rfq.fechaLimite).toLocaleString()}
                  </span>
                </div>
                <div>
                  {yaOferto ? (
                    <div
                      style={{
                        color: "var(--primary)",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        textAlign: "right",
                      }}
                    >
                      Ofertado:{" "}
                      {formatPrice(yaOferto.precioPropuesto)}/kg
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setBiddingRfq(rfq);
                        setBidMsg({ type: "", text: "" });
                      }}
                    >
                      Cotizar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Bidding Panel */}
    {biddingRfq && (
      <div
        className="card-table"
        style={{
          padding: "24px",
          borderRadius: "12px",
          background: "var(--card-bg)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            borderBottom: "1px solid var(--border-light)",
            paddingBottom: "8px",
          }}
        >
          <h3 style={{ fontSize: "1.1rem" }}>
            Enviar Cotización para RFQ #{biddingRfq.id}
          </h3>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
            onClick={() => setBiddingRfq(null)}
          >
            ✕
          </button>
        </div>
        {bidMsg.text && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "0.85rem",
              background:
                bidMsg.type === "success"
                  ? "var(--green-bg)"
                  : "var(--red-bg)",
              color:
                bidMsg.type === "success"
                  ? "var(--primary)"
                  : "var(--red)",
            }}
          >
            {bidMsg.text}
          </div>
        )}
        <form onSubmit={enviarBid}>
          <div
            className="form-group"
            style={{ marginBottom: "16px" }}
          >
            <label className="form-label">
              Detalles de la Solicitud
            </label>
            <div
              style={{
                background: "#f8fafc",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "0.8rem",
              }}
            >
              <p>
                <strong>Fruta solicitada:</strong>{" "}
                {biddingRfq.tipoFruta}
              </p>
              <p>
                <strong>Cantidad requerida:</strong>{" "}
                {biddingRfq.cantidadRequerida} kg
              </p>
            </div>
          </div>
          <div
            className="form-group"
            style={{ marginBottom: "16px" }}
          >
            <label className="form-label">Producto ofrecido *</label>
            <select
              className="form-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
              value={bidForm.productId}
              onChange={(e) =>
                setBidForm({
                  ...bidForm,
                  productId: e.target.value,
                })
              }
              required
            >
              <option value="">Selecciona un producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
            <label className="form-label">
              Precio Propuesto por kg (COP) *
            </label>
            <input
              type="number"
              min="1"
              className="form-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
              }}
              value={bidForm.precioPropuesto}
              onChange={(e) =>
                setBidForm({
                  ...bidForm,
                  precioPropuesto: e.target.value,
                })
              }
              placeholder="Ej: 2200"
            />
          </div>
          <div
            className="form-group"
            style={{ marginBottom: "20px" }}
          >
            <label className="form-label">
              Comentarios / Condiciones de Entrega
            </label>
            <textarea
              rows="3"
              className="form-textarea"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
              }}
              value={bidForm.comentarios}
              onChange={(e) =>
                setBidForm({
                  ...bidForm,
                  comentarios: e.target.value,
                })
              }
              placeholder="Ej: Despacho inmediato, calidad premium certificada."
            ></textarea>
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: "100%" }}
          >
            Enviar Cotización
          </button>
        </form>
      </div>
    )}
  </div>
</div>
  );
}
