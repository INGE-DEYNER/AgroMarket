import { useProductorData } from "./ProductorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

/*
 * Seccion "Finanzas" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionFinanzas() {
  const { formatPrice } = useAuth();
  const {
    badgeClass,
    pedidos,
    productos,
  } = useProductorData();

  return (
<div className={`section producer-section`} id="sec-finanzas">
  <div className="producer-section-head">
    <div>
      <span className="producer-eyebrow">Rendimiento comercial</span>
      <h1>Finanzas / pagos</h1>
      <p>
        Resumen calculado con los pedidos que devuelve la API del
        productor.
      </p>
    </div>
  </div>
  <div className="producer-finance-grid">
    <article className="producer-finance-card">
      <span>Ventas registradas</span>
      <strong>
        {formatPrice(
          pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0),
        )}
      </strong>
      <small>Acumulado disponible en esta sesión</small>
    </article>
    <article className="producer-finance-card">
      <span>Pedidos gestionados</span>
      <strong>{pedidos.length}</strong>
      <small>Pedidos devueltos por /pedidos/mis-pedidos</small>
    </article>
    <article className="producer-finance-card">
      <span>Ticket promedio</span>
      <strong>
        {formatPrice(
          pedidos.length
            ? pedidos.reduce(
                (sum, p) => sum + Number(p.total || 0),
                0,
              ) / pedidos.length
            : 0,
        )}
      </strong>
      <small>Promedio sobre pedidos cargados</small>
    </article>
    <article className="producer-finance-card">
      <span>Productos activos</span>
      <strong>{productos.length}</strong>
      <small>Inventario devuelto por /productos/mis-productos</small>
    </article>
  </div>
  <div className="producer-panel producer-table-panel">
    <div className="producer-panel-title">
      <h2>Movimientos comerciales</h2>
      <span>{pedidos.length} pedidos</span>
    </div>
    <div className="table-wrap">
      <table className="producer-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>#{p.id}</td>
              <td>{p.fecha || p.fechaCreacion || "—"}</td>
              <td>{p.comprador || p.nombreComprador || "—"}</td>
              <td>{formatPrice(p.total)}</td>
              <td>
                <span className={badgeClass(p.estado)}>
                  {p.estado || "Pendiente"}
                </span>
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
