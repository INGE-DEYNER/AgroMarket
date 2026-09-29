/*
 * SeccionResenas — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useTranslation } from "react-i18next";

export default function SeccionResenas() {
  const { t } = useTranslation();
  const { moderarResena, resenas } = useAdminData();

  return (
<div className="section" id="sec-resenas">
                <div className="table-header">
                  <h3 className="card-title">
                    {t("admin.reviewsModeration", "Moderación de Reseñas")}
                  </h3>
                </div>
                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>{t("admin.user", "Usuario")}</th>
                        <th>
                          {t(
                            "dashboardProductor.stats.rating",
                            "Calificación",
                          )}
                        </th>
                        <th>
                          {t("dashboardProductor.description", "Comentario")}
                        </th>
                        <th>{t("pedidos.statusHeader", "Estado")}</th>
                        <th>{t("pedidos.actions", "Acciones")}</th>
                      </tr>
                    </thead>
                    <tbody id="tbResenas">
                      {resenas.map((r) => (
                        <tr key={r.id}>
                          <td data-label={t("admin.user", "Usuario")}>
                            {r.compradorNombre ||
                              r.usuario ||
                              r.nombreUsuario ||
                              "—"}
                          </td>
                          <td
                            data-label={t(
                              "dashboardProductor.stats.rating",
                              "Calificación",
                            )}
                          >
                            {"★".repeat(r.calificacion || 5)}
                          </td>
                          <td
                            data-label={t(
                              "dashboardProductor.description",
                              "Comentario",
                            )}
                          >
                            {r.comentario}
                          </td>
                          <td
                            data-label={t("pedidos.statusHeader", "Estado")}
                          >
                            <span
                              className={`badge-status ${r.aprobada ? "status-shipped" : "status-pending"}`}
                            >
                              {r.aprobada
                                ? t("pedidos.status.aprobada", "Aprobada")
                                : t("pedidos.status.pendiente", "Pendiente")}
                            </span>
                          </td>
                          <td data-label={t("pedidos.actions", "Acciones")}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => moderarResena(r.id, true)}
                            >
                              {t("admin.approve", "Aprobar")}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{
                                color: "var(--red)",
                                marginLeft: "6px",
                              }}
                              onClick={() => moderarResena(r.id, false)}
                            >
                              {t("admin.reject", "Rechazar")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
  );
}
