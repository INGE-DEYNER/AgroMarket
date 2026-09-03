/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BuyerShell from "@/presentation/features/order/components/BuyerShell";
import { useAuth } from "@/app/hooks/useAuth";
import { useSecureParams } from "@/presentation/shared/hooks/useSecureParams";
import api from "@/infrastructure/http/api";
import PedidoCard from "@/presentation/features/order/components/PedidoCard";

export default function Pedidos() {
  const { t } = useTranslation();
  const { user, formatPrice } = useAuth();
  const [params] = useSecureParams();

  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const loadPedidos = useCallback(async () => {
    try {
      const data = await api.get("/pedidos/mis-pedidos");

      setPedidos(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error("Error loadPedidos:", err);
      setPedidos([]);
    }
  }, []);

  useEffect(() => {
    if (params.success === "1") {
      setSuccessBanner(true);
    }

    void loadPedidos();
  }, [params.success, loadPedidos]);

  const pedidosFiltrados = filtroEstado
    ? pedidos.filter(
        (p) => p.estado?.toLowerCase() === filtroEstado.toLowerCase(),
      )
    : pedidos;

  const openFactura = (pedido) => {
    setFacturaData(pedido);
    setModalFactura(true);
  };
  const closeFactura = () => setModalFactura(false);

  const badgeClass = (estado) => {
    const e = estado?.toLowerCase();
    if (e === "pendiente") return "badge-status status-pending";
    if (e === "enviado") return "badge-status status-shipped";
    if (e === "entregado") return "badge-status status-delivered";
    if (e === "cancelado") return "badge-status status-cancelled";
    return "badge-status";
  };

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "comprador") {
      // Buyers stay on the dedicated orders page.
    } else if (role === "productor") {
      return <Navigate to="/dashboard-productor?section=pedidosRec" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }
  return (
    <BuyerShell activeKey="misPedidos">
      <main className="buyer-page-content"
        style={{ padding: "28px 32px", maxWidth: "1280px", margin: "0 auto" }}
      >
        {/* SUCCESS BANNER */}
        {successBanner && (
          <div
            id="successBanner"
            style={{
              background: "var(--green-bg)",
              border: "1px solid #1f4d2a",
              borderRadius: "var(--radius)",
              padding: "14px 18px",
              marginBottom: "20px",
              color: "var(--green-light)",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {t(
              "pedidos.successMessage",
              "¡Pedido realizado con éxito! Ya está siendo procesado por el productor.",
            )}
          </div>
        )}

        <div className="section-header">
          <span className="section-title">
            {" "}
            {t("pedidos.title", "Mis Pedidos")}
          </span>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              className="form-select"
              style={{ width: "170px" }}
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
              }}
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
              <option value="Cancelado">
                {t("pedidos.status.cancelado", "Cancelado")}
              </option>
            </select>
            <Link to="/catalogo" className="btn btn-primary">
              {t("pedidos.newOrder", "+ Nuevo pedido")}
            </Link>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("pedidos.id", "ID")}</th>
                <th>{t("pedidos.product", "Producto")}</th>
                <th>{t("pedidos.producer", "Productor")}</th>
                <th>{t("pedidos.quantity", "Cantidad")}</th>
                <th>{t("pedidos.total", "Total")}</th>
                <th>{t("pedidos.statusHeader", "Estado")}</th>
                <th>{t("pedidos.actions", "Acciones")}</th>
              </tr>
            </thead>
            <tbody id="tbPedidos">
              {pedidosFiltrados.map((p) => (
                <PedidoCard
                  key={p.id}
                  p={p}
                  t={t}
                  badgeClass={badgeClass}
                  openFactura={openFactura}
                />
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL FACTURA */}
      {modalFactura && (
        <div className="modal-overlay open" id="modalFactura">
          <div className="modal" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <span className="modal-title">
                {t("pedidos.invoiceTitle", "Factura de Pedido")}
              </span>
              <button className="modal-close" onClick={closeFactura}>
                ✕
              </button>
            </div>
            <div id="facturaBody" style={{ padding: "24px" }}>
              {facturaData && (
                <>
                  <p>
                    <strong>
                      {t("pedidos.invoiceDetail.id", "Pedido #:")}
                    </strong>{" "}
                    {facturaData.id}
                  </p>
                  <p>
                    <strong>
                      {t("pedidos.invoiceDetail.product", "Producto:")}
                    </strong>{" "}
                    {facturaData.producto || facturaData.nombreProducto}
                  </p>
                  <p>
                    <strong>
                      {t("pedidos.invoiceDetail.producer", "Productor:")}
                    </strong>{" "}
                    {facturaData.productor || facturaData.nombreProductor}
                  </p>
                  <p>
                    <strong>
                      {t("pedidos.invoiceDetail.quantity", "Cantidad:")}
                    </strong>{" "}
                    {facturaData.cantidad} kg
                  </p>
                  <p>
                    <strong>
                      {t("pedidos.invoiceDetail.total", "Total:")}
                    </strong>{" "}
                    {formatPrice(facturaData.total)}
                  </p>
                  <p>
                    <strong>
                      {t("pedidos.invoiceDetail.status", "Estado:")}
                    </strong>{" "}
                    {t(
                      "pedidos.status." + facturaData.estado?.toLowerCase(),
                      facturaData.estado,
                    )}
                  </p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeFactura}>
                {t("pedidos.close", "Cerrar")}
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const pedidoId = facturaData?.id;
                    if (!pedidoId) {
                      alert("No se encontro el pedido.");
                      return;
                    }
                    const invRes = await api.get(`/facturas/pedido/${pedidoId}`);
                    // La API devuelve un objeto factura (o 404); normalizar.
                    const data = invRes?.data || invRes;
                    const factura = Array.isArray(data)
                      ? data[0]
                      : data?.id
                        ? data
                        : null;
                    const facturaId = factura?.id;
                    if (!facturaId) {
                      alert(
                        "No se encontro una factura emitida para este pedido. La factura se genera cuando el pago es confirmado por MercadoPago.",
                      );
                      return;
                    }
                    const res = await api.post(`/facturas/${facturaId}/enviar`);
                    alert(
                      `Factura enviada al correo ${res?.email || "registrado"} exitosamente.`,
                    );
                    closeFactura();
                  } catch (err) {
                    alert(
                      "No se pudo enviar la factura: " +
                        (err.message || "Intenta de nuevo."),
                    );
                  }
                }}
              >
                {t("pedidos.sendEmail", "Enviar por correo")}
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerShell>
  );
}
