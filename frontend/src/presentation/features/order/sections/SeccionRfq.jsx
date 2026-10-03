/*
 * SeccionRfq — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionRfq() {
  const { formatPrice } = useAuth();
  const { aceptarOfertaRfq, crearRfq, rfqForm, rfqMsg, rfqs, setRfqForm } = useCompradorData();

  return (
<div className="section" id="sec-rfq">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1> Licitaciones B2B (RFQ)</h1>
              <p>
                Publica solicitudes de cotización al por mayor para recibir
                ofertas competitivas de productores verificados
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "24px",
              marginTop: "24px",
            }}
          >
            {/* Publicar Solicitud */}
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
                Nueva Solicitud (RFQ)
              </h3>
              {rfqMsg.text && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "0.85rem",
                    background:
                      rfqMsg.type === "success"
                        ? "var(--green-bg)"
                        : "var(--red-bg)",
                    color:
                      rfqMsg.type === "success"
                        ? "var(--primary)"
                        : "var(--red)",
                  }}
                >
                  {rfqMsg.text}
                </div>
              )}
              <form onSubmit={crearRfq}>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">Tipo de Fruta *</label>
                  <select
                    className="form-select"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border-light)",
                      borderRadius: "6px",
                    }}
                    value={rfqForm.tipoFruta}
                    onChange={(e) =>
                      setRfqForm({ ...rfqForm, tipoFruta: e.target.value })
                    }
                  >
                    <option value="PASSION_FRUIT"> Maracuyá</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">
                    Cantidad Requerida (kg) *
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
                    value={rfqForm.cantidadRequerida}
                    onChange={(e) =>
                      setRfqForm({
                        ...rfqForm,
                        cantidadRequerida: e.target.value,
                      })
                    }
                    placeholder="Ej: 500"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">
                    Fecha Límite para Ofertar *
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border-light)",
                      borderRadius: "6px",
                    }}
                    value={rfqForm.fechaLimite}
                    onChange={(e) =>
                      setRfqForm({ ...rfqForm, fechaLimite: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">
                    Instrucciones / Especificaciones
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
                    value={rfqForm.descripcion}
                    onChange={(e) =>
                      setRfqForm({ ...rfqForm, descripcion: e.target.value })
                    }
                    placeholder="Ej: Busco piña manzana de calibre grande, despacho a bodega en Medellín."
                  ></textarea>
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ width: "100%" }}
                >
                  Publicar Licitación
                </button>
              </form>
            </div>

            {/* Mis Solicitudes y sus Ofertas */}
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
                Mis Licitaciones Publicadas
              </h3>
              {rfqs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  No has publicado ninguna licitación.
                </div>
              ) : (
                rfqs.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="cell-soft"
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "1rem",
                          color: "var(--primary)",
                        }}
                      >
                        {rfq.tipoFruta} - {rfq.cantidadRequerida} kg
                      </span>
                      <span
                        className={`badge-status ${rfq.activo ? "status-shipped" : "status-pending"}`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {rfq.activo ? "Activa" : "Cerrada"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", margin: "4px 0" }}>
                      {rfq.descripcion || "Sin descripción."}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Vence: {new Date(rfq.fechaLimite).toLocaleString()}
                    </p>

                    <div
                      style={{
                        marginTop: "14px",
                        borderTop: "1px dashed var(--am-border, #cbd5e1)",
                        paddingTop: "10px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "0.8rem",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        Cotizaciones Recibidas ({rfq.ofertas?.length || 0}):
                      </strong>
                      {!rfq.ofertas || rfq.ofertas.length === 0 ? (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          Esperando ofertas de productores...
                        </span>
                      ) : (
                        rfq.ofertas.map((of) => (
                          <div
                            key={of.id}
                            style={{
                              background: "var(--surface)",
                              padding: "10px 12px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-light)",
                              fontSize: "0.8rem",
                              marginBottom: "8px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <strong>{of.productorNombre}</strong>:{" "}
                              <span
                                style={{
                                  color: "var(--primary)",
                                  fontWeight: "600",
                                }}
                              >
                                {formatPrice(of.precioPropuesto)}/kg
                              </span>
                              <div
                                style={{
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                  marginTop: "2px",
                                }}
                              >
                                "{of.comentarios}"
                              </div>
                            </div>
                            {rfq.activo && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "0.7rem",
                                }}
                                onClick={() =>
                                  aceptarOfertaRfq(rfq.id, of.id)
                                }
                              >
                                Aceptar
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
  );
}
