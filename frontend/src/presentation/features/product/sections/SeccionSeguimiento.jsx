import { useProductorData } from "./ProductorContexto.js";

/*
 * Seccion "Seguimiento" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionSeguimiento() {
  const {
    badgeClass,
    openUpdateShipment,
    shipments,
  } = useProductorData();

  return (
<div className={`section`} id="sec-seguimiento">
  <div className="dash-header">
    <h1>Gestión de Despachos</h1>
    <p>
      Monitorea y actualiza la información de entrega de tus productos
      vendidos
    </p>
  </div>

  <div className="card-table" style={{ marginTop: "20px" }}>
    <div className="table-wrap">
      <table className="table-responsive">
        <thead>
          <tr>
            <th>Pedido ID</th>
            <th>Producto</th>
            <th>Destino</th>
            <th>Transportista</th>
            <th>Guía de Envío</th>
            <th>Fecha Estimada</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id}>
              <td data-label="Pedido ID">#{s.pedidoId || s.id}</td>
              <td data-label="Producto">{s.producto || "—"}</td>
              <td data-label="Destino">
                {s.direccionDestino || "—"}
              </td>
              <td data-label="Transportista">
                {s.transportista || "—"}
              </td>
              <td data-label="Guía">{s.guia || "—"}</td>
              <td data-label="Fecha Estimada">
                {s.fechaEstimadaEntrega || "—"}
              </td>
              <td data-label="Estado">
                <span className={badgeClass(s.estado)}>
                  {s.estado}
                </span>
              </td>
              <td data-label="Acciones">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openUpdateShipment(s)}
                >
                  Actualizar
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
