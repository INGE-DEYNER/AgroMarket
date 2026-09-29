/*
 * SeccionProductos — panel de administración.
 *
 * Movimiento puro del JSX que estaba dentro de Admin.jsx. Lo único que
 * cambia: el estado llega por contexto en vez de por el ámbito del padre, y
 * el contenedor ya no lleva la condición de activeSection porque con el
 * Outlet solo se monta la sección activa.
 */
import { useAdminData } from "./AdminContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionProductos() {
  const { t } = useTranslation();
  const { formatPrice } = useAuth();
  const { eliminarProducto, pageProductos, productos, searchProductosInput, setPageProductos, setSearchProductosInput, totalElementsProductos, totalPagesProductos } = useAdminData();

  return (
<div className="section" id="sec-productos">
                <div
                  className="table-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <h3 className="card-title">
                    {t("admin.globalInventory", "Inventario Global")}
                  </h3>
                  <div
                    className="search-box"
                    style={{ maxWidth: "280px", width: "100%", margin: 0 }}
                  >
                    <input
                      type="text"
                      placeholder={t(
                        "admin.searchProducts",
                        "Buscar productos...",
                      )}
                      value={searchProductosInput}
                      onChange={(e) =>
                        setSearchProductosInput(e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>{t("dashboardProductor.product", "Producto")}</th>
                        <th>{t("pedidos.producer", "Productor")}</th>
                        <th>
                          {t("dashboardProductor.pricePerKg", "Precio/kg")}
                        </th>
                        <th>{t("dashboardProductor.stock", "Stock")}</th>
                        <th>{t("pedidos.actions", "Acciones")}</th>
                      </tr>
                    </thead>
                    <tbody id="tbProductos">
                      {productos.map((p) => (
                        <tr key={p.id}>
                          <td
                            data-label={t(
                              "dashboardProductor.product",
                              "Producto",
                            )}
                          >
                            {p.nombre}
                          </td>
                          <td data-label={t("pedidos.producer", "Productor")}>
                            {p.productor || p.nombreProductor || "—"}
                          </td>
                          <td
                            data-label={t(
                              "dashboardProductor.pricePerKg",
                              "Precio/kg",
                            )}
                          >
                            {formatPrice(p.precio)}
                          </td>
                          <td
                            data-label={t(
                              "dashboardProductor.stock",
                              "Stock",
                            )}
                          >
                            {p.stock} kg
                          </td>
                          <td data-label={t("pedidos.actions", "Acciones")}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: "var(--red)" }}
                              onClick={() => eliminarProducto(p.id)}
                            >
                              {t("admin.delete", "Eliminar")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls for Products */}
                {totalPagesProductos > 1 && (
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
                      disabled={pageProductos === 0}
                      onClick={() =>
                        setPageProductos((p) => Math.max(0, p - 1))
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
                      Página <strong>{pageProductos + 1}</strong> de{" "}
                      <strong>{totalPagesProductos}</strong> (
                      {totalElementsProductos} productos)
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={pageProductos >= totalPagesProductos - 1}
                      onClick={() => setPageProductos((p) => p + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
  );
}
