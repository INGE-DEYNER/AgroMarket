/*
 * SeccionAuditoria — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";

export default function SeccionAuditoria() {
  const { dashboardPedidos, dashboardProductos, dashboardTickets, dashboardUsuarios } = useAdminData();

  return (
<div className="section" id="sec-auditoria">
                <div className="table-header">
                  <div>
                    <h3 className="card-title">Auditoría y actividad</h3>
                    <p className="section-subtitle">
                      Vista preparada para eventos administrativos expuestos
                      por el backend.
                    </p>
                  </div>
                </div>
                <div className="audit-grid">
                  <div className="audit-card">
                    <span>Usuarios</span>
                    <strong>{dashboardUsuarios}</strong>
                    <small>registros administrativos</small>
                  </div>
                  <div className="audit-card">
                    <span>Productos</span>
                    <strong>{dashboardProductos}</strong>
                    <small>registros del catálogo</small>
                  </div>
                  <div className="audit-card">
                    <span>Pedidos</span>
                    <strong>{dashboardPedidos}</strong>
                    <small>registros conocidos</small>
                  </div>
                  <div className="audit-card">
                    <span>Tickets</span>
                    <strong>{dashboardTickets}</strong>
                    <small>incidencias conocidas</small>
                  </div>
                </div>
                <div className="empty-audit">
                  No se inventa un endpoint de auditoría. Esta vista queda
                  preparada para conectar el contrato real cuando el backend
                  lo exponga.
                </div>
              </div>
  );
}
