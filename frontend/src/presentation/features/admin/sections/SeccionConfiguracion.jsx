/*
 * SeccionConfiguracion — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import api from "@/infrastructure/http/api";

export default function SeccionConfiguracion() {
  const { mantenimientoMode, setMantenimientoMode } = useAdminData();

  return (
<div className="section" id="sec-configuracion">
                <div className="table-header">
                  <h3 className="card-title">Configuración del Sistema</h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {/* Costo envío */}
                  {/* Mantenimiento mode */}
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        marginBottom: "12px",
                        color: "var(--primary-dark)",
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                      }}
                    >
                      Modo Mantenimiento
                    </h4>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        marginBottom: "12px",
                      }}
                    >
                      Activar el modo de mantenimiento bloquea el acceso de
                      clientes a la tienda, permitiendo únicamente el acceso
                      de administradores.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={mantenimientoMode}
                        onChange={async (e) => {
                          const activo = e.target.checked;
                          try {
                            await api.put("/config/system/mantenimiento", {
                              activo,
                            });
                            setMantenimientoMode(activo);
                            // Avisa a MaintenanceLayer para refrescar ya.
                            window.dispatchEvent(
                              new Event("agromarket:maintenance-changed"),
                            );
                            alert(
                              `Modo mantenimiento ${activo ? "ACTIVADO" : "DESACTIVADO"}. Todos los usuarios verán el aviso automáticamente.`,
                            );
                          } catch (err) {
                            alert(
                              "No se pudo cambiar el modo mantenimiento: " +
                                (err.message || "intenta de nuevo."),
                            );
                          }
                        }}
                        id="chkMantenimiento"
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <label
                        htmlFor="chkMantenimiento"
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Activar Modo Mantenimiento
                      </label>
                    </div>
                  </div>
                </div>
              </div>
  );
}
