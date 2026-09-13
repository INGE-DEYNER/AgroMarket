/**
 * Normalizadores de datos del backend.
 *
 * El backend (Jackson) puede serializar LocalDateTime como arreglo
 * [2026, 9, 12, 8, 30] — que produce "Invalid Date" en JS — o como ISO.
 * Aquí se centraliza el parseo robusto y la normalización de pedidos,
 * mensajes y notificaciones para TODOS los dashboards.
 */

export function parseBackendDate(value) {
  if (value === null || value === undefined || value === "") return null;

  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    if (!y) return null;
    const date = new Date(y, (m || 1) - 1, d || 1, h, min, s);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function formatearHora(value) {
  const date = parseBackendDate(value);
  if (!date) return "";
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatearFecha(value) {
  const date = parseBackendDate(value);
  if (!date) return "";
  return date.toLocaleDateString("es-CO");
}

const ESTADO_POR_STATE = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

/**
 * El backend devuelve `state` (enum: PENDING/SHIPPED/DELIVERED/CANCELLED),
 * `product`, `buyer` y `quantity`, pero el frontend históricamente leyó
 * `estado`, `productoNombre`, `comprador` y `cantidad`. Esta función unifica
 * ambos formatos y elimina el bug "pedidos.status.undefined".
 */
export function normalizarPedido(p) {
  if (!p || typeof p !== "object") return p;

  const estado =
    p.estado ||
    ESTADO_POR_STATE[p.state] ||
    (typeof p.state === "string"
      ? p.state.charAt(0) + p.state.slice(1).toLowerCase()
      : "") ||
    "Pendiente";

  return {
    ...p,
    id: p.id ?? p.pedidoId,
    estado,
    cantidad: p.cantidad ?? p.quantity ?? 0,
    total: p.total ?? 0,
    productoNombre:
      p.productoNombre ||
      p.producto ||
      p.product?.name ||
      p.nombreProducto ||
      "—",
    comprador: p.comprador || p.buyer?.name || p.nombreComprador || "—",
    productor: p.productor || p.nombreProductor || "—",
    creadoEn: p.creadoEn || parseBackendDate(p.createdAt),
  };
}

export function normalizarMensaje(m, userId) {
  if (!m || typeof m !== "object") return m;
  const remitente = m.senderId ?? m.remitenteId;
  return {
    ...m,
    id: m.id ?? `${remitente}-${m.sentAt ?? m.createdAt ?? ""}`,
    texto: m.texto || m.contenido || m.content || "",
    mio:
      m.mio ??
      (remitente !== undefined &&
        String(remitente) === String(userId ?? "")),
    hora: m.hora || formatearHora(m.sentAt ?? m.fechaEnvio ?? m.createdAt),
  };
}

export const TIPO_NOTIFICACION = {
  NEW_ORDER: { label: "Pedidos", icon: "🚚" },
  ORDER_UPDATED: { label: "Pedidos", icon: "📦" },
  PAYMENT_CONFIRMED: { label: "Pagos", icon: "✓" },
  NEW_MESSAGE: { label: "Mensajes", icon: "💬" },
  LOW_STOCK: { label: "Inventario", icon: "⚠️" },
};

export function tiempoRelativo(value) {
  const date = parseBackendDate(value);
  if (!date) return "";
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Hace instantes";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const horas = Math.floor(diffMin / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `Hace ${dias} día${dias === 1 ? "" : "s"}`;
  return date.toLocaleDateString("es-CO");
}
