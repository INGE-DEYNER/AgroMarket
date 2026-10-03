/*
 * SeccionSoporte — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import Icon from "@/presentation/shared/components/Icon";

export default function SeccionSoporte() {
  const { adminTickets, exportarTickets, formatearFechaTicket } = useAdminData();

  return (
<div className="section" id="sec-soporte">
                <div className="table-header">
                  <div>
                    <h3 className="card-title">Tickets de soporte</h3>
                    <p className="section-subtitle">
                      Centro de atención y seguimiento de incidencias.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="table-action"
                    onClick={exportarTickets}
                    disabled={adminTickets.length === 0}
                    title={
                      adminTickets.length === 0
                        ? "No hay tickets para exportar"
                        : "Descargar los tickets visibles en formato CSV"
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
                        <th>Ticket</th>
                        <th>Asunto</th>
                        <th>Usuario</th>
                        <th>Estado</th>
                        <th>Mensajes</th>
                        <th>Actualizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminTickets.length === 0 ? (
                        <tr>
                          <td colSpan="6">
                            <div className="estado-vacio">
                              <span className="estado-vacio__icono" aria-hidden="true">
                                <Icon name="check" size={26} />
                              </span>
                              <p className="estado-vacio__titulo">
                                No hay tickets de soporte
                              </p>
                              <p className="estado-vacio__texto">
                                Cuando un usuario abra un ticket aparecerá aquí.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        adminTickets.map((ticket, i) => (
                          <tr key={ticket.id || i}>
                            <td data-label="Ticket">
                              {ticket.id || `#T-${i + 1}`}
                            </td>
                            <td data-label="Asunto">
                              {ticket.subject || "—"}
                            </td>
                            <td data-label="Usuario">
                              {ticket.creatorUsername || "—"}
                            </td>
                            <td data-label="Estado">
                              <span className="badge-status status-pending">
                                {ticket.status || "—"}
                              </span>
                            </td>
                            <td data-label="Mensajes">
                              {Array.isArray(ticket.messages)
                                ? ticket.messages.length
                                : 0}
                            </td>
                            <td data-label="Actualizado">
                              {formatearFechaTicket(ticket.updatedAt)}
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
