/*
 * SeccionMisPedidos — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionMisPedidos() {
  const { t } = useTranslation();
  const { formatPrice } = useAuth();
  const { badgeClass, filtroEstado, getGroupedPedidos, openFactura, pedidosFiltrados, setCheckoutPedido, setFiltroEstado, setPagoModalOpen } = useCompradorData();

  return (
<div className="section" id="sec-misPedidos">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>
                {t("dashboardComprador.nav.myOrders", "Historial de Pedidos")}
              </h1>
              <p>
                {t(
                  "dashboardComprador.ordersSub",
                  "Gestiona y revisa tus compras anteriores",
                )}
              </p>
            </div>
          </div>
          <div className="card-table">
            <div
              className="table-filters"
              style={{ display: "flex", gap: "12px", marginBottom: "20px" }}
            >
              <select
                className="form-select"
                style={{ width: "180px" }}
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">
                  {t("pedidos.allStates", "Todos los estados")}
                </option>
                <option value="Pendiente">
                  {t("pedidos.status.pendiente", "Pendiente")}
                </option>
                <option value="Enviado">
                  {t("pedidos.status.enviado", "Enviado")}
                </option>
                <option value="Entregado">
                  {t("pedidos.status.entregado", "Entregado")}
                </option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>{t("pedidos.id", "ID")}</th>
                    <th>{t("pedidos.product", "Producto")}</th>
                    <th>{t("pedidos.quantity", "Cantidad")}</th>
                    <th>{t("pedidos.total", "Total")}</th>
                    <th>{t("pedidos.statusHeader", "Estado")}</th>
                    <th>{t("pedidos.actions", "Acciones")}</th>
                  </tr>
                </thead>
                <tbody>
                  {getGroupedPedidos(pedidosFiltrados).map((p) => (
                    <tr key={p.checkoutId || p.id}>
                      <td data-label={t("pedidos.id", "ID")}>
                        {p.checkoutId || `#${p.id}`}
                      </td>
                      <td data-label={t("pedidos.product", "Producto")}>
                        {p.items.map((item, idx) => (
                          <div key={item.id || idx}>
                            • {item.productoNombre || item.producto} (
                            {item.cantidad} kg)
                          </div>
                        ))}
                      </td>
                      <td data-label={t("pedidos.quantity", "Cantidad")}>
                        {p.items.reduce(
                          (sum, item) => sum + Number(item.cantidad || 0),
                          0,
                        )}{" "}
                        kg
                      </td>
                      <td data-label={t("pedidos.total", "Total")}>
                        {formatPrice(p.total)}
                      </td>
                      <td data-label={t("pedidos.statusHeader", "Estado")}>
                        <span className={badgeClass(p.estado)}>
                          {t(
                            "pedidos.status." + p.estado?.toLowerCase(),
                            p.estado,
                          )}
                        </span>
                      </td>
                      <td data-label={t("pedidos.actions", "Acciones")}>
                        {p.estado?.toLowerCase() === "pendiente" && (
                          <button
                            onClick={() => {
                              setCheckoutPedido(p);
                              setPagoModalOpen(true);
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ marginRight: "6px" }}
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openFactura(p)}
                        >
                          {t("pedidos.invoice", "Factura")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  );
}
