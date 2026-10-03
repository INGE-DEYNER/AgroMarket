/*
 * SeccionPagos — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionPagos() {
  const { formatPrice } = useAuth();
  const { liberarPago, pagosFideicomiso, reembolsarPago } = useAdminData();

  return (
<div className="section" id="sec-pagos">
                <div className="table-header">
                  <h3 className="card-title">Transacciones en Fideicomiso</h3>
                </div>
                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>Pago ID</th>
                        <th>Pedido ID</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagosFideicomiso.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              textAlign: "center",
                              padding: "24px",
                              color: "var(--text-muted)",
                            }}
                          >
                            No hay transacciones retenidas en fideicomiso.
                          </td>
                        </tr>
                      ) : (
                        pagosFideicomiso.map((p) => (
                          <tr key={p.id}>
                            <td data-label="Pago ID">#{p.id}</td>
                            <td data-label="Pedido ID">#{p.pedidoId}</td>
                            <td data-label="Monto">{formatPrice(p.monto)}</td>
                            <td data-label="Método">{p.metodoPago}</td>
                            <td data-label="Estado">
                              <span className="badge-status status-pending">
                                {p.estado}
                              </span>
                            </td>
                            <td data-label="Acciones">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => liberarPago(p.id)}
                              >
                                Liberar Fondos
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{
                                  color: "var(--red)",
                                  marginLeft: "6px",
                                }}
                                onClick={() => reembolsarPago(p.id)}
                              >
                                Reembolsar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
  );
}
