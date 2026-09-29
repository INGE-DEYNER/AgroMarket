/*
 * SeccionUsuarios — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useTranslation } from "react-i18next";

export default function SeccionUsuarios() {
  const { t } = useTranslation();
  const { handleAprobarUsuario, handleRechazarUsuario, pageUsuarios, searchUsuariosInput, setPageUsuarios, setSearchUsuariosInput, toggleUsuarioActivo, toggleVerificarProductor, totalElementsUsuarios, totalPagesUsuarios, usuariosFiltrados, usuariosPendientes } = useAdminData();

  return (
<div className="section" id="sec-usuarios">
                <div className="table-header">
                  <h3 className="card-title">
                    {t("admin.usersManagement", "Gestión de Usuarios")}
                  </h3>
                </div>

                {/* PENDING APPROVALS */}
                <div
                  style={{
                    padding: "20px 24px",
                    borderBottom: "1px dashed var(--border)",
                  }}
                >
                  <h4
                    style={{
                      color: "var(--gold)",
                      marginBottom: "12px",
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                    }}
                  >
                    Cuentas de Productores Pendientes de Aprobación
                  </h4>
                  {usuariosPendientes.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-dim)",
                        fontStyle: "italic",
                        fontSize: "0.85rem",
                      }}
                    >
                      No hay solicitudes de aprobación pendientes.
                    </p>
                  ) : (
                    <div
                      className="table-wrap"
                      style={{ marginBottom: "10px" }}
                    >
                      <table
                        className="table-responsive"
                        style={{
                          border: "1px solid var(--gold-border)",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <thead>
                          <tr style={{ background: "var(--gold-bg)" }}>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuariosPendientes.map((u) => (
                            <tr key={u.id}>
                              <td data-label="Nombre">
                                {u.nombre} {u.apellido}
                              </td>
                              <td data-label="Correo">{u.email}</td>
                              <td data-label="Ubicación">
                                {u.ubicacion || "—"}
                              </td>
                              <td data-label="Acciones">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleAprobarUsuario(u.id)}
                                >
                                  Aprobar
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  style={{ marginLeft: "6px" }}
                                  onClick={() => handleRechazarUsuario(u.id)}
                                >
                                  Rechazar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="table-filters">
                  <div className="search-box">
                    <input
                      type="text"
                      id="searchUsuarios"
                      placeholder={t(
                        "admin.searchUsers",
                        "Buscar por nombre o correo...",
                      )}
                      value={searchUsuariosInput}
                      onChange={(e) => setSearchUsuariosInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>{t("auth.firstName", "Nombre")}</th>
                        <th>{t("auth.email", "Correo")}</th>
                        <th>{t("profile.role", "Rol")}</th>
                        <th>{t("pedidos.statusHeader", "Estado")}</th>
                        <th>{t("pedidos.actions", "Acciones")}</th>
                      </tr>
                    </thead>
                    <tbody id="tbUsuarios">
                      {usuariosFiltrados.map((u) => (
                        <tr key={u.id}>
                          <td data-label={t("auth.firstName", "Nombre")}>
                            {u.nombre} {u.apellido}
                          </td>
                          <td data-label={t("auth.email", "Correo")}>
                            {u.email}
                          </td>
                          <td data-label={t("profile.role", "Rol")}>
                            <span className="badge-status">
                              {t(
                                "auth." + (u.role || u.rol)?.toLowerCase(),
                                u.role || u.rol,
                              )}
                            </span>
                          </td>
                          <td
                            data-label={t("pedidos.statusHeader", "Estado")}
                          >
                            <span
                              className={`badge-status ${u.activo !== false ? "status-shipped" : "status-pending"}`}
                            >
                              {u.activo !== false
                                ? t("admin.active", "Activo")
                                : t("admin.inactive", "Inactivo")}
                            </span>
                          </td>
                          <td data-label={t("pedidos.actions", "Acciones")}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => toggleUsuarioActivo(u)}
                            >
                              {u.activo !== false
                                ? t("admin.deactivate", "Desactivar")
                                : t("admin.activate", "Activar")}
                            </button>
                            {(u.role || u.rol)?.toUpperCase() ===
                              "PRODUCTOR" && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{
                                  marginLeft: "6px",
                                  background: u.verificado
                                    ? "#385723"
                                    : "#6b7280",
                                  color: "#fff",
                                }}
                                onClick={() => toggleVerificarProductor(u)}
                              >
                                {u.verificado ? "Verificado" : "Verificar"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls for Users */}
                {totalPagesUsuarios > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px 24px",
                      borderTop: "1px solid var(--border-light)",
                    }}
                  >
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={pageUsuarios === 0}
                      onClick={() =>
                        setPageUsuarios((p) => Math.max(0, p - 1))
                      }
                    >
                      Anterior
                    </button>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-dim)",
                      }}
                    >
                      Página <strong>{pageUsuarios + 1}</strong> de{" "}
                      <strong>{totalPagesUsuarios}</strong> (
                      {totalElementsUsuarios} usuarios)
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={pageUsuarios >= totalPagesUsuarios - 1}
                      onClick={() => setPageUsuarios((p) => p + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
  );
}
