/*
 * SeccionDashboard — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionDashboard() {
  const { formatPrice } = useAuth();
  const { dashboardData, dashboardNuevosProductores, dashboardNuevosUsuarios, dashboardPedidos, dashboardProductores, dashboardProductos, dashboardTickets, dashboardUsuarios, dashboardVentasHoy } = useAdminData();

  return (
    <div
      className="section admin-dashboard-section"
      id="sec-dashboard"
    >
      {/*
        El grid de dos columnas vive AQUI, dentro de la sección, y no en el
        contenedor del shell. Antes estaba en el padre con un ternario
        `activeSection === "dashboard" ? "2fr 1fr" : "1fr"`, así que el layout
        reproporcionaba cada vez que cambiabas de sección. Con el Outlet solo
        se monta la activa, así que este wrapper es siempre el de dos columnas
        y las demás secciones ocupan el ancho completo por su cuenta.
      */}
                <div className="table-header">

                  <div>
                    <h3 className="card-title">
                      ¡Bienvenido, Administrador!
                    </h3>
                    <p className="section-subtitle">
                      Resumen general de la plataforma
                    </p>
                  </div>
                  <span className="date-chip">
                    {new Date().toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="admin-kpi-grid">
                  <div className="admin-kpi">
                    <span>Usuarios totales</span>
                    <strong>
                      {Number(dashboardUsuarios).toLocaleString("es-CO")}
                    </strong>
                    <small>Usuarios registrados</small>
                  </div>
                  <div className="admin-kpi">
                    <span>Productores</span>
                    <strong>
                      {Number(dashboardProductores).toLocaleString("es-CO")}
                    </strong>
                    <small>Productores registrados</small>
                  </div>
                  <div className="admin-kpi">
                    <span>Productos publicados</span>
                    <strong>
                      {Number(dashboardProductos).toLocaleString("es-CO")}
                    </strong>
                    <small>Inventario global</small>
                  </div>
                  <div className="admin-kpi">
                    <span>Pedidos totales</span>
                    <strong>
                      {Number(dashboardPedidos).toLocaleString("es-CO")}
                    </strong>
                    <small>Pedidos registrados</small>
                  </div>
                </div>
                <div className="admin-dashboard-grid">
                  <div className="admin-panel">
                    <div className="admin-panel-heading">
                      <h4>Ventas totales</h4>
                      <span>Resumen</span>
                    </div>
                    <div className="admin-big-number">
                      {dashboardData?.ingresos != null
                        ? formatPrice(dashboardData.ingresos)
                        : "—"}
                    </div>
                    <div className="admin-chart-placeholder">
                      {dashboardData?.ingresosPorMes &&
                      dashboardData.ingresosPorMes.length > 0
                        ? // Usar datos reales de ingresos por mes
                          dashboardData.ingresosPorMes.map((mes, index) => {
                            const amount = Number(mes.monto) || 0;
                            // Calcular porcentaje relativo (max 100%)
                            const maxAmount =
                              Math.max(
                                ...dashboardData.ingresosPorMes.map(
                                  (m) => Number(m.monto) || 0,
                                ),
                              ) || 1;
                            const percentage = Math.min(
                              (amount / maxAmount) * 100,
                              100,
                            );
                            return (
                              <span
                                key={index}
                                style={{ height: `${percentage}%` }}
                                title={`${mes.mes}: ${formatPrice(amount)}`}
                              />
                            );
                          })
                        : // Fallback a datos de ejemplo si no hay datos reales
                          [38, 52, 46, 61, 56, 72, 68, 84, 78, 91].map(
                            (height, index) => (
                              <span
                                key={index}
                                style={{ height: `${height}%` }}
                              />
                            ),
                          )}
                    </div>
                  </div>
                  <div className="admin-panel">
                    <div className="admin-panel-heading">
                      <h4>Pedidos por estado</h4>
                      <span>{dashboardPedidos} total</span>
                    </div>
                    <div className="status-list">
                      <div>
                        <span className="dot dot-green" />
                        Entregados{" "}
                        <strong>
                          {dashboardData?.pedidosEntregados ?? "—"}
                        </strong>
                      </div>
                      <div>
                        <span className="dot dot-blue" />
                        En camino{" "}
                        <strong>
                          {dashboardData?.pedidosEnCamino ?? "—"}
                        </strong>
                      </div>
                      <div>
                        <span className="dot dot-yellow" />
                        Pendientes{" "}
                        <strong>
                          {dashboardData?.pedidosPendientes ?? "—"}
                        </strong>
                      </div>
                      <div>
                        <span className="dot dot-red" />
                        Cancelados{" "}
                        <strong>
                          {dashboardData?.pedidosCancelados ?? "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="admin-mini-grid">
                  <div className="admin-mini">
                    <span>Ventas hoy</span>
                    <strong>
                      {dashboardVentasHoy != null
                        ? formatPrice(dashboardVentasHoy)
                        : "—"}
                    </strong>
                  </div>
                  <div className="admin-mini">
                    <span>Nuevos usuarios</span>
                    <strong>{dashboardNuevosUsuarios ?? "—"}</strong>
                  </div>
                  <div className="admin-mini">
                    <span>Nuevos productores</span>
                    <strong>{dashboardNuevosProductores ?? "—"}</strong>
                  </div>
                  <div className="admin-mini">
                    <span>Tickets de soporte</span>
                    <strong>{dashboardTickets}</strong>
                  </div>
                </div>
              </div>
  );
}
