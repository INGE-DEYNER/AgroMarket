import { useProductorData } from "./ProductorContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";

/*
 * Seccion "PedidosRec" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionPedidosRec() {
  const { t } = useTranslation();
  const { formatPrice } = useAuth();
  const {
    badgeClass,
    loadPedidos,
    pedidos,
  } = useProductorData();

  return (
<div className={`section`} id="sec-pedidosRec">
  <div className="dash-header">
    <h1>{t("dashboardProductor.nav.sales", "Gestión de Ventas")}</h1>
  </div>
  <div className="card-table">
    <div className="table-wrap">
      <table className="table-responsive">
        <thead>
          <tr>
            <th>{t("pedidos.id", "ID")}</th>
            <th>{t("pedidos.product", "Producto")}</th>
            <th>{t("dashboardProductor.buyer", "Comprador")}</th>
            <th>{t("dashboardProductor.quantityHeader", "Cant.")}</th>
            <th>{t("pedidos.total", "Total")}</th>
            <th>{t("pedidos.statusHeader", "Estado")}</th>
            <th>{t("pedidos.actions", "Acciones")}</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td data-label="ID">#{p.id}</td>
              <td data-label="Producto">
                {p.productoNombre ||
                  p.producto ||
                  p.nombreProducto ||
                  "—"}
              </td>
              <td data-label="Comprador">
                {p.comprador || p.nombreComprador || "—"}
              </td>
              <td data-label="Cant.">{p.cantidad} kg</td>
              <td data-label="Total">{formatPrice(p.total)}</td>
              <td data-label="Estado">
                <span className={badgeClass(p.estado)}>
                  {t(
                    "pedidos.status." + p.estado?.toLowerCase(),
                    p.estado,
                  )}
                </span>
              </td>
              <td data-label="Acciones">
                <select
                  className="form-select"
                  style={{ width: "150px" }}
                  value=""
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    try {
                      await api.put(`/pedidos/${p.id}/estado`, {
                        estado: e.target.value,
                      });
                      loadPedidos();
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  <option value="">
                    {t(
                      "dashboardProductor.changeState",
                      "Cambiar estado",
                    )}
                  </option>
                  <option value="Enviado"> {t("paneles.order.markShipped")} </option>
                  <option value="Entregado"> {t("paneles.order.markDelivered")} </option>
                  <option value="Cancelar"> {t("paneles.order.cancel")} </option>
                </select>
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
