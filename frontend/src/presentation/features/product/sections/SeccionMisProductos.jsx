import { useProductorData } from "./ProductorContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";

/*
 * Seccion "MisProductos" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionMisProductos() {
  const { t } = useTranslation();
  const { formatPrice } = useAuth();
  const {
    eliminarProducto,
    openProductoModal,
    productos,
  } = useProductorData();

  return (
<div className={`section`} id="sec-misProductos">
  <div className="dash-header">
    <h1>{t("dashboardProductor.nav.inventory", "Mi Inventario")}</h1>
    <button className="btn-cta" onClick={() => openProductoModal()}>
      {t("dashboardProductor.newProduct", "+ Nuevo Producto")}
    </button>
  </div>
  <div className="card-table">
    <div className="table-wrap">
      <table className="table-responsive">
        <thead>
          <tr>
            <th>{t("dashboardProductor.product", "Producto")}</th>
            <th>{t("dashboardProductor.type", "Tipo")}</th>
            <th>{t("dashboardProductor.pricePerKg", "Precio/kg")}</th>
            <th>{t("dashboardProductor.stock", "Stock")}</th>
            <th>{t("dashboardProductor.status", "Estado")}</th>
            <th>{t("dashboardProductor.actions", "Acciones")}</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td data-label="Producto">{p.nombre}</td>
              <td data-label="Tipo">{p.tipo}</td>
              <td data-label="Precio/kg">{formatPrice(p.precio)}</td>
              <td data-label="Stock">{p.stock} kg</td>
              <td data-label="Estado">
                <span className="badge-status status-shipped">
                  {t("dashboardProductor.active", "Activo")}
                </span>
              </td>
              <td data-label="Acciones">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openProductoModal(p)}
                >
                  {t("dashboardProductor.edit", "Editar")}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: "var(--red)", marginLeft: "6px" }}
                  onClick={() => eliminarProducto(p.id)}
                  aria-label={`Eliminar ${p.nombre || "producto"}`}
                >
                  Eliminar
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
