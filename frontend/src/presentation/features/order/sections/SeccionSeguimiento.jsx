/*
 * SeccionSeguimiento — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useTranslation } from "react-i18next";
import Icon from "@/presentation/shared/components/Icon";

export default function SeccionSeguimiento() {
  const { t } = useTranslation();
  const { contactProductor, expandedShipmentId, historialEnvios, pedidos, progressColor, setExpandedShipmentId, shipments } = useCompradorData();

  return (
<div className="section" id="sec-seguimiento">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1> {t("envios.title", "Seguimiento de Envíos")}</h1>
              <p>{t("paneles.track.subtitle", "Monitorea tus pedidos en ruta en tiempo real")}</p>
            </div>
          </div>

          <div id="shipmentsContainer" style={{ marginTop: "20px" }}>
            {shipments.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  padding: "40px",
                  textAlign: "center",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                }}
              >
                <div style={{ fontSize: "2rem" }}></div>
                <div style={{ marginTop: "8px" }}>
                  {t(
                    "envios.noActive",
                    "No hay envíos activos en este momento.",
                  )}
                </div>
              </div>
            ) : (
              shipments.map((s) => {
                const isExpanded = expandedShipmentId === s.id;

                // Map state to active step (0-4)
                const getActiveStep = (estado) => {
                  const est = estado?.toUpperCase();
                  if (est === "ENTREGADO" || est === "DELIVERED") return 4;
                  if (est === "EN_REPARTO") return 3;
                  if (
                    est === "EN_CAMINO" ||
                    est === "EN_TRANSITO" ||
                    est === "EN TRÁNSITO"
                  )
                    return 2;
                  if (est === "PREPARANDO") return 1;
                  return 0; // PEDIDO_CONFIRMADO
                };

                const activeStep = getActiveStep(s.estado);
                const progressPct = (activeStep + 1) * 20;

                const steps = [
                  {
                    label: "Pago Confirmado",
                    desc: "Pago procesado y verificado.",
                  },
                  {
                    label: "Preparando Envío",
                    desc: "El productor está alistando los productos frescamente.",
                  },
                  {
                    label: "En Camino",
                    desc: "El paquete está en tránsito con la transportadora.",
                  },
                  {
                    label: "En Reparto",
                    desc: "El transportista está en ruta a tu ubicación de entrega.",
                  },
                  {
                    label: "Entregado",
                    desc: "El pedido ha sido entregado en la dirección indicada.",
                  },
                ];

                const matchOrder = pedidos.find((p) => p.id === s.pedidoId);
                const productorNombre = matchOrder
                  ? matchOrder.productorNombre || matchOrder.productor
                  : null;

                return (
                  <div
                    key={s.id}
                    className="shipment-card"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "12px",
                      padding: "24px",
                      marginBottom: "20px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "1.05rem",
                            color: "var(--text-dark)",
                          }}
                        >
                          {s.producto || "Producto ASAFRUT"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {s.origen || "Chigorodó, Antioquia"} &rarr;{" "}
                          {s.direccionDestino || "Destino"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="badge-status status-shipped"
                          style={{ textTransform: "capitalize" }}
                        >
                          {t(
                            "pedidos.status." + s.estado?.toLowerCase(),
                            s.estado,
                          )}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            setExpandedShipmentId(isExpanded ? null : s.id)
                          }
                        >
                          {isExpanded ? "Ocultar" : "Rastrear"}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "var(--border-light)",
                        borderRadius: "4px",
                        height: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpandedShipmentId(isExpanded ? null : s.id)
                      }
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progressPct}%`,
                          background: progressColor(s.estado),
                          borderRadius: "4px",
                          transition: "width 0.5s ease",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        marginTop: "8px",
                      }}
                    >
                      <span>Guía: {s.guia || "No asignada"}</span>
                      <span>
                        Transportista: {s.transportista || "Por asignar"}
                      </span>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: "24px",
                          borderTop: "1px solid var(--border-light)",
                          paddingTop: "20px",
                          animation: "fadeIn 0.4s ease",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            marginBottom: "16px",
                            color: "var(--text-dark)",
                          }}
                        >
                          Detalles de Trazabilidad
                        </h4>

                        {/* ESTIMATED DATE */}
                        {s.fechaEstimadaEntrega && (
                          <div
                            style={{
                              background: "var(--color-surface-2)",
                              color: "var(--color-primary-dark)",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              marginBottom: "20px",
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            Fecha estimada de entrega:{" "}
                            {new Date(
                              s.fechaEstimadaEntrega + "T12:00:00",
                            ).toLocaleDateString("es-CO", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        )}

                        {/* ROUTE ILLUSTRATION */}
                        <div
                          className="cell-soft"
                          style={{
                            position: "relative",
                            height: "54px",
                            borderRadius: "10px",
                            margin: "20px 0",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 20px",
                            border: "1px solid var(--am-border, #cbd5e1)",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: "16px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "var(--am-text, #475569)",
                            }}
                          >
                            Chigorodó
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              right: "16px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "var(--am-text, #475569)",
                              maxWidth: "180px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.direccionDestino || "Destino"}
                          </div>
                          {/* Moving Truck Emoji */}
                          <div
                            style={{
                              position: "absolute",
                              left: `${20 + activeStep * 15}%`, // Move truck based on step
                              transition:
                                "left 1s cubic-bezier(0.25, 0.8, 0.25, 1)",
                              fontSize: "1.6rem",
                              zIndex: 10,
                            }}
                          >
                            <Icon name="truck" size={22} />
                          </div>
                          {/* Visual Dashed Route Line */}
                          <div
                            style={{
                              position: "absolute",
                              left: "10%",
                              right: "10%",
                              borderBottom: "2px dashed var(--am-border, #cbd5e1)",
                              zIndex: 1,
                            }}
                          ></div>
                        </div>

                        {/* VERTICAL TIMELINE */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                            paddingLeft: "8px",
                            position: "relative",
                          }}
                        >
                          {/* Vertical Line Connector */}
                          <div
                            style={{
                              position: "absolute",
                              left: "18px",
                              top: "10px",
                              bottom: "10px",
                              width: "2px",
                              background: "var(--am-surface-2, #e2e8f0)",
                            }}
                          ></div>

                          {steps.map((step, idx) => {
                            const isCompleted = idx <= activeStep;
                            const isActive = idx === activeStep;
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  gap: "16px",
                                  position: "relative",
                                  zIndex: 2,
                                }}
                              >
                                <div
                                  style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    background: isCompleted
                                      ? "var(--am-green)"
                                      : "var(--am-border, #cbd5e1)",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.7rem",
                                    fontWeight: "bold",
                                    border: isActive
                                      ? "4px solid var(--am-green)"
                                      : "none",
                                    boxSizing: "content-box",
                                  }}
                                >
                                  {isCompleted ? <Icon name="check" size={14} /> : idx + 1}
                                </div>
                                <div>
                                  <h5
                                    style={{
                                      fontSize: "0.88rem",
                                      fontWeight: isActive ? "700" : "600",
                                      color: isActive
                                        ? "var(--am-green)"
                                        : "var(--am-text, #1e293b)",
                                      margin: 0,
                                    }}
                                  >
                                    {step.label}
                                  </h5>
                                  <p
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "var(--am-text-muted, #64748b)",
                                      margin: "4px 0 0 0",
                                    }}
                                  >
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* CONTACT PRODUCER BUTTON */}
                        {productorNombre && (
                          <div
                            style={{
                              marginTop: "24px",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              className="btn btn-primary"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                              onClick={() =>
                                contactProductor(productorNombre)
                              }
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="currentColor"
                              >
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                              </svg>
                              Contactar Productor ({productorNombre})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: "32px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
              {" "}
              {t("envios.historyTitle", "Historial de todos los envíos")}
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("envios.id", "ID Envío")}</th>
                    <th>{t("envios.route", "Origen - Destino")}</th>
                    <th>{t("envios.carrier", "Transportista")}</th>
                    <th>{t("envios.status", "Estado")}</th>
                    <th> {t("paneles.track.guide", "Guía")} </th>
                  </tr>
                </thead>
                <tbody>
                  {historialEnvios.map((e) => (
                    <tr key={e.id}>
                      <td data-label="ID Envío">#{e.id}</td>
                      <td data-label="Ruta">
                        {e.origen || "Chigorodó"} - {e.direccionDestino}
                      </td>
                      <td data-label="Transportista">
                        {e.transportista || "—"}
                      </td>
                      <td data-label="Estado">
                        <span
                          className={`badge-status ${e.estado === "Entregado" ? "status-delivered" : "status-pending"}`}
                        >
                          {t(
                            "pedidos.status." + e.estado?.toLowerCase(),
                            e.estado,
                          )}
                        </span>
                      </td>
                      <td data-label="Guía">{e.guia || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  );
}
