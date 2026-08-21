import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";

const PedidoCard = React.memo(({ p, t, badgeClass, openFactura }) => {
  const { formatPrice } = useAuth();

  return (
    <tr>
      <td data-label={t("pedidos.id", "ID")}>#{p.id}</td>
      <td data-label={t("pedidos.product", "Producto")}>
        {p.productoNombre || p.producto || p.nombreProducto || "—"}
      </td>
      <td data-label={t("pedidos.producer", "Productor")}>
        {p.productor || p.nombreProductor || "—"}
      </td>
      <td data-label={t("pedidos.quantity", "Cantidad")}>{p.cantidad} kg</td>
      <td data-label={t("pedidos.total", "Total")}>{formatPrice(p.total)}</td>
      <td data-label={t("pedidos.statusHeader", "Estado")}>
        <span className={badgeClass(p.estado)}>
          {t("pedidos.status." + p.estado?.toLowerCase(), p.estado)}
        </span>
      </td>
      <td data-label={t("pedidos.actions", "Acciones")}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => openFactura(p)}
        >
          {t("pedidos.invoice", "Factura")}
        </button>
        <Link
          to="/envios"
          className="btn btn-secondary btn-sm"
          style={{ marginLeft: "6px" }}
        >
          {t("pedidos.track", "Rastrear")}
        </Link>
      </td>
    </tr>
  );
});

PedidoCard.displayName = "PedidoCard";

export default PedidoCard;


