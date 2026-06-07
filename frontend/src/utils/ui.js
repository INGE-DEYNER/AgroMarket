// File: frontend/src/utils/ui.js

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  const s = String(str);
  const decoded = s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
  return decoded
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function badgeEstado(estado) {
  const value = String(estado || "").trim();
  const normalized = value.toUpperCase();
  const styles = {
    PENDIENTE: { bg: "#f59e0b", fg: "#fff" },
    PREPARANDO: { bg: "#2563eb", fg: "#fff" },
    ENVIADO: { bg: "#0ea5e9", fg: "#fff" },
    EN_CAMINO: { bg: "#06b6d4", fg: "#fff" },
    ENTREGADO: { bg: "#16a34a", fg: "#fff" },
    CANCELADO: { bg: "#dc2626", fg: "#fff" },
    PAGADO: { bg: "#16a34a", fg: "#fff" },
    CONFIRMADO: { bg: "#16a34a", fg: "#fff" },
    RECHAZADO: { bg: "#dc2626", fg: "#fff" },
  };
  const style = styles[normalized] || { bg: "#6b7280", fg: "#fff" };
  return { label: value || "Desconocido", bg: style.bg, fg: style.fg, normalized };
}

export function formatearFecha(fecha, opciones = {}) {
  if (!fecha) return "";
  const value = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(value.getTime())) return "";
  const hasTimeStyle = Object.hasOwn(opciones, "timeStyle");
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: hasTimeStyle ? opciones.timeStyle : undefined,
    ...opciones,
  }).format(value);
}

export function maskEmail(email) {
  if (!email) return "";
  const parts = email.split("@");
  if (parts[0].length <= 2) return "***@" + parts[1];
  return parts[0][0] + "***" + parts[0].slice(-1) + "@" + parts[1];
}

export function formatearPrecio(valor) {
  if (valor === null || valor === undefined) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

export function showToast(message, type = "info", timeout = 4000) {
  let container = document.getElementById("am-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "am-toast-container";
    container.style.cssText = "position:fixed;right:16px;top:16px;z-index:9999;";
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = "am-toast am-toast-" + type;
  el.style.marginTop = "8px";
  el.style.padding = "12px 16px";
  let background = "#333";
  if (type === "error") background = "#c0392b";
  else if (type === "success") background = "#2d6a4f";
  el.style.cssText += `background:${background};color:#fff;border-radius:6px;`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 400);
  }, timeout);
}
