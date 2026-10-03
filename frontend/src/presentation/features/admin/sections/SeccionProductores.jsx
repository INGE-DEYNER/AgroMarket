/*
 * SeccionProductores — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";

export default function SeccionProductores() {
  const { productores, toggleVerificarProductor } = useAdminData();

  return (
<div className="section" id="sec-productores">
                <div className="table-header">
                  <div>
                    <h3 className="card-title">Gestión de productores</h3>
                    <p className="section-subtitle">
                      Productores obtenidos desde el listado administrativo de
                      usuarios.
                    </p>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>Productor</th>
                        <th>Correo</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Verificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productores.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-cell">
                            No hay productores disponibles en el listado
                            administrativo.
                          </td>
                        </tr>
                      ) : (
                        productores.map((u) => (
                          <tr key={u.id}>
                            <td data-label="Productor">
                              {u.nombre} {u.apellido || ""}
                            </td>
                            <td data-label="Correo">
                              {u.email || u.correo || "—"}
                            </td>
                            <td data-label="Ubicación">
                              {u.ubicacion || "—"}
                            </td>
                            <td data-label="Estado">
                              <span
                                className={`badge-status ${u.activo !== false ? "status-shipped" : "status-pending"}`}
                              >
                                {u.activo !== false ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td data-label="Verificación">
                              <button
                                className={`btn btn-sm ${u.verificado ? "btn-secondary" : "btn-primary"}`}
                                onClick={() => toggleVerificarProductor(u)}
                              >
                                {u.verificado ? "Verificado" : "Verificar"}
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
