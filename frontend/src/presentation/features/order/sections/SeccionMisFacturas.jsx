/*
 * SeccionMisFacturas — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useAuth } from "@/app/hooks/useAuth";

export default function SeccionMisFacturas() {
  const { formatPrice } = useAuth();
  const { descargarPdfGroup, facturas, getGroupedFacturas } = useCompradorData();

  return (
<div className="section" id="sec-misFacturas">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>Mis Facturas de Compra</h1>
              <p>
                Descarga tus comprobantes electrónicos detallados de ASAFRUT
              </p>
            </div>
          </div>
          <div className="card-table">
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>Factura N°</th>
                    <th>Pedido ID</th>
                    <th>Subtotal</th>
                    <th>IVA (19%)</th>
                    <th>Total</th>
                    <th>Fecha Emisión</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "24px",
                          color: "var(--text-muted)",
                        }}
                      >
                        No tienes facturas emitidas en este momento.
                      </td>
                    </tr>
                  ) : (
                    getGroupedFacturas(facturas).map((f) => (
                      <tr key={f.checkoutId || f.id}>
                        <td data-label="Factura N°">{f.numeroFactura}</td>
                        <td data-label="Pedido ID">
                          {f.checkoutId || `#${f.pedidoId}`}
                        </td>
                        <td data-label="Subtotal">
                          {formatPrice(f.subtotal)}
                        </td>
                        <td data-label="IVA">{formatPrice(f.impuesto)}</td>
                        <td
                          data-label="Total"
                          style={{
                            fontWeight: "600",
                            color: "var(--primary)",
                          }}
                        >
                          {formatPrice(f.total)}
                        </td>
                        <td data-label="Fecha">
                          {new Date(f.fechaEmision).toLocaleDateString()}
                        </td>
                        <td data-label="Acciones">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => descargarPdfGroup(f)}
                          >
                            Descargar PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  );
}
