/*
 * SeccionLogistica — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";

export default function SeccionLogistica() {
  const { errorLogistica, loadingLogistica, logisticaData } = useAdminData();

  return (
<div
                className="section"
                id="sec-logistica"
                style={{ padding: "24px" }}
              >
                <div
                  className="table-header"
                  style={{ marginBottom: "20px" }}
                >
                  <h3
                    className="card-title"
                    style={{
                      fontSize: "1.25rem",
                      color: "var(--primary-dark)",
                    }}
                  >
                    Reporte de Logística y Envíos
                  </h3>
                </div>

                {loadingLogistica ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "var(--text-dim)",
                    }}
                  >
                    Cargando datos logísticos...
                  </div>
                ) : errorLogistica ? (
                  <div style={{ color: "var(--red)", padding: "20px" }}>
                    {errorLogistica}
                  </div>
                ) : logisticaData ? (
                  <div>
                    {/* Logistics KPI Cards */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          background: "var(--green-bg)",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid var(--primary-light)",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            color: "var(--primary-dark)",
                            textTransform: "uppercase",
                          }}
                        >
                          Total Envíos
                        </span>
                        <h2
                          style={{
                            fontSize: "1.6rem",
                            color: "var(--primary)",
                            margin: "4px 0 0 0",
                          }}
                        >
                          {logisticaData.totalEnvios}
                        </h2>
                      </div>
                      <div
                        style={{
                          background: "#e0f2fe",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #38bdf8",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            color: "#0369a1",
                            textTransform: "uppercase",
                          }}
                        >
                          En Camino
                        </span>
                        <h2
                          style={{
                            fontSize: "1.6rem",
                            color: "#0284c7",
                            margin: "4px 0 0 0",
                          }}
                        >
                          {logisticaData.enviosPorEstado?.["EN_CAMINO"] || 0}
                        </h2>
                      </div>
                      <div
                        style={{
                          background: "#dcfce7",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #4ade80",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            color: "#15803d",
                            textTransform: "uppercase",
                          }}
                        >
                          Entregados
                        </span>
                        <h2
                          style={{
                            fontSize: "1.6rem",
                            color: "#16a34a",
                            margin: "4px 0 0 0",
                          }}
                        >
                          {logisticaData.enviosPorEstado?.["ENTREGADO"] || 0}
                        </h2>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                      }}
                    >
                      {/* Shipments by Status */}
                      <div>
                        <h4
                          style={{
                            marginBottom: "12px",
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            color: "var(--text)",
                          }}
                        >
                          Por Estado del Envío
                        </h4>
                        <div className="table-wrap">
                          <table
                            className="table-responsive"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <thead>
                              <tr>
                                <th>Estado</th>
                                <th>Envíos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(
                                logisticaData.enviosPorEstado || {},
                              ).length === 0 ? (
                                <tr>
                                  <td
                                    colSpan="2"
                                    style={{ textAlign: "center" }}
                                  >
                                    No hay envíos registrados
                                  </td>
                                </tr>
                              ) : (
                                Object.keys(
                                  logisticaData.enviosPorEstado,
                                ).map((estado) => (
                                  <tr key={estado}>
                                    <td
                                      data-label="Estado"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      {estado.replace("_", " ")}
                                    </td>
                                    <td data-label="Envíos">
                                      {logisticaData.enviosPorEstado[estado]}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Shipments by Carrier */}
                      <div>
                        <h4
                          style={{
                            marginBottom: "12px",
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            color: "var(--text)",
                          }}
                        >
                          Distribución por Transportista
                        </h4>
                        <div className="table-wrap">
                          <table
                            className="table-responsive"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <thead>
                              <tr>
                                <th>Transportista</th>
                                <th>Envíos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(
                                logisticaData.enviosPorTransportista || {},
                              ).length === 0 ? (
                                <tr>
                                  <td
                                    colSpan="2"
                                    style={{ textAlign: "center" }}
                                  >
                                    No hay envíos registrados
                                  </td>
                                </tr>
                              ) : (
                                Object.keys(
                                  logisticaData.enviosPorTransportista,
                                ).map((transportista) => (
                                  <tr key={transportista}>
                                    <td
                                      data-label="Transportista"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      {transportista}
                                    </td>
                                    <td data-label="Envíos">
                                      {
                                        logisticaData.enviosPorTransportista[
                                          transportista
                                        ]
                                      }
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "20px", textAlign: "center" }}>
                    Sin datos disponibles.
                  </div>
                )}
              </div>
  );
}
