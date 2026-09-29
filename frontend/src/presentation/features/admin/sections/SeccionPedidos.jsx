/*
 * SeccionPedidos — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";
import api from "@/infrastructure/http/api";

export default function SeccionPedidos() {
  const { formatPrice } = useAuth();
  const { adminPedidos, exportarPedidos, loadAll } = useAdminData();

  return (
<div className="section" id="sec-pedidos">
                <div className="table-header">
                  <div>
                    <h3 className="card-title">Gestión de pedidos</h3>
                    <p className="section-subtitle">
                      Seguimiento global de pedidos registrados en el
                      dashboard administrativo.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="table-action"
                    onClick={exportarPedidos}
                    disabled={adminPedidos.length === 0}
                    title={
                      adminPedidos.length === 0
                        ? "No hay pedidos para exportar"
                        : "Descargar los pedidos visibles en formato CSV"
                    }
                  >
                    <Icon name="download" size={15} />
                    Exportar
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminPedidos.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-cell">
                            El endpoint administrativo actual no expone un
                            listado global de pedidos. Se muestran pedidos
                            aquí cuando /admin/dashboard devuelve una
                            colección de pedidos.
                          </td>
                        </tr>
                      ) : (
                        adminPedidos.map((p, i) => (
                          <tr key={p.id || p.codigo || i}>
                            <td data-label="Pedido">
                              {p.codigo ||
                                p.numeroPedido ||
                                p.id ||
                                `#${i + 1}`}
                            </td>
                            <td data-label="Cliente">
                              {p.cliente ||
                                p.compradorNombre ||
                                p.nombreCliente ||
                                "—"}
                            </td>
                            <td data-label="Total">
                              {p.total != null ? formatPrice(p.total) : "—"}
                            </td>
                            <td data-label="Estado">
                              <span
                                className={`badge-status ${p.estado === "ENTREGADO" || p.estado === "Entregado" ? "status-delivered" : p.estado === "ENVIADO" || p.estado === "Enviado" ? "status-shipped" : p.estado === "CANCELADO" || p.estado === "Cancelado" ? "status-cancelled" : "status-pending"}`}
                              >
                                {p.estado || "—"}
                              </span>
                            </td>
                            <td data-label="Fecha">
                              {p.fecha || p.fechaCreacion || "—"}
                            </td>
                            <td data-label="Acciones">
                              <select
                                className="form-select"
                                style={{ width: "140px", fontSize: "0.8rem" }}
                                defaultValue=""
                                onChange={async (e) => {
                                  if (!e.target.value) return;
                                  try {
                                    await api.put(
                                      `/admin/pedidos/${p.id}/estado`,
                                      {
                                        estado: e.target.value,
                                      },
                                    );
                                    // loadAll() ya refresca el dashboard (y con
                                    // él la lista de pedidos): no existe un
                                    // loadPedidos separado.
                                    void loadAll();
                                  } catch (err) {
                                    alert("Error: " + err.message);
                                  }
                                }}
                              >
                                <option value="">Cambiar...</option>
                                <option value="ACEPTADO">Aceptar</option>
                                <option value="ENVIADO">Enviado</option>
                                <option value="ENTREGADO">Entregado</option>
                                <option value="CANCELADO">Cancelar</option>
                              </select>
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
