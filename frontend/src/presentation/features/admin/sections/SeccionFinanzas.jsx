/*
 * SeccionFinanzas — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionFinanzas() {
  const { formatPrice } = useAuth();
  const { errorFinanzas, finanzasData, loadingFinanzas } = useAdminData();

  return (
<div
                className="section"
                id="sec-finanzas"
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
                    Reportes y estadísticas Global
                  </h3>
                </div>

                {loadingFinanzas ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "var(--text-dim)",
                    }}
                  >
                    Cargando datos financieros...
                  </div>
                ) : errorFinanzas ? (
                  <div style={{ color: "var(--red)", padding: "20px" }}>
                    {errorFinanzas}
                  </div>
                ) : finanzasData ? (
                  <div>
                    {/* Financial KPI Cards */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          background: "var(--green-bg)",
                          padding: "16px",
                          borderRadius: "8px",
                          border: "1px solid var(--primary-light)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "var(--primary-dark)",
                            textTransform: "uppercase",
                          }}
                        >
                          Ingresos Confirmados
                        </span>
                        <h2
                          style={{
                            fontSize: "1.8rem",
                            color: "var(--primary)",
                            margin: "8px 0 0 0",
                          }}
                        >
                          {formatPrice(finanzasData.totalIngresos || 0)}
                        </h2>
                      </div>
                      <div
                        style={{
                          background: "#fef3c7",
                          padding: "16px",
                          borderRadius: "8px",
                          border: "1px solid #f59e0b",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "#b45309",
                            textTransform: "uppercase",
                          }}
                        >
                          Fondos en Fideicomiso
                        </span>
                        <h2
                          style={{
                            fontSize: "1.8rem",
                            color: "#d97706",
                            margin: "8px 0 0 0",
                          }}
                        >
                          {formatPrice(finanzasData.totalFideicomiso || 0)}
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
                      {/* Payments by Method */}
                      <div>
                        <h4
                          style={{
                            marginBottom: "12px",
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            color: "var(--text)",
                          }}
                        >
                          Por Método de Pago
                        </h4>
                        <div className="table-wrap">
                          <table
                            className="table-responsive"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <thead>
                              <tr>
                                <th>Método</th>
                                <th>Transacciones</th>
                                <th>Monto Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(
                                finanzasData.transaccionesPorMetodo || {},
                              ).length === 0 ? (
                                <tr>
                                  <td
                                    colSpan="3"
                                    style={{ textAlign: "center" }}
                                  >
                                    No hay transacciones
                                  </td>
                                </tr>
                              ) : (
                                Object.keys(
                                  finanzasData.transaccionesPorMetodo,
                                ).map((metodo) => (
                                  <tr key={metodo}>
                                    <td
                                      data-label="Método"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      {metodo.replace("_", " ")}
                                    </td>
                                    <td data-label="Transacciones">
                                      {
                                        finanzasData.transaccionesPorMetodo[
                                          metodo
                                        ]
                                      }
                                    </td>
                                    <td data-label="Monto Total">
                                      {formatPrice(
                                        finanzasData.montoPorMetodo[metodo] ||
                                          0,
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Payments by Status */}
                      <div>
                        <h4
                          style={{
                            marginBottom: "12px",
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            color: "var(--text)",
                          }}
                        >
                          Por Estado de Transacción
                        </h4>
                        <div className="table-wrap">
                          <table
                            className="table-responsive"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <thead>
                              <tr>
                                <th>Estado</th>
                                <th>Transacciones</th>
                                <th>Monto Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(
                                finanzasData.transaccionesPorEstado || {},
                              ).length === 0 ? (
                                <tr>
                                  <td
                                    colSpan="3"
                                    style={{ textAlign: "center" }}
                                  >
                                    No hay transacciones
                                  </td>
                                </tr>
                              ) : (
                                Object.keys(
                                  finanzasData.transaccionesPorEstado,
                                ).map((estado) => (
                                  <tr key={estado}>
                                    <td
                                      data-label="Estado"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      {estado.replace("_", " ")}
                                    </td>
                                    <td data-label="Transacciones">
                                      {
                                        finanzasData.transaccionesPorEstado[
                                          estado
                                        ]
                                      }
                                    </td>
                                    <td data-label="Monto Total">
                                      {formatPrice(
                                        finanzasData.montoPorEstado[estado] ||
                                          0,
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                        fontSize: "0.85rem",
                        color: "var(--text-dim)",
                        textAlign: "right",
                      }}
                    >
                      Total transacciones registradas:{" "}
                      <strong>{finanzasData.totalTransacciones}</strong>
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
