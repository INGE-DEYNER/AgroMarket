// File: frontend/js/ui.js

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  const s = String(str);
  // First, decode common HTML entities to avoid double-escaping
  const decoded = s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");

  // Then escape special characters once
  return decoded
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function showToast(message, type = "info", timeout = 4000) {
  let container = document.getElementById("am-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "am-toast-container";
    container.style.position = "fixed";
    container.style.right = "16px";
    container.style.top = "16px";
    container.style.zIndex = 9999;
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = "am-toast am-toast-" + type;
  el.style.marginTop = "8px";
  el.style.padding = "12px 16px";
  let background = "#333";
  if (type === "error") background = "#c0392b";
  else if (type === "success") background = "#2d6a4f";
  el.style.background = background;
  el.style.color = "#fff";
  el.style.borderRadius = "6px";
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 400);
  }, timeout);
}

export function mostrarExito(message, timeout = 4000) {
  showToast(message, "success", timeout);
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
  return `<span class="badge-estado badge-estado-${escapeHtml(normalized || 'desconocido').toLowerCase()}" style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:${style.bg};color:${style.fg};font-size:.78rem;font-weight:700;letter-spacing:.02em;">${escapeHtml(value || 'Desconocido')}</span>`;
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

export function createSkeleton(container, count = 3) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "am-skeleton";
    s.style.height = "72px";
    s.style.marginBottom = "8px";
    s.style.background = "#eee";
    s.style.borderRadius = "6px";
    fragment.appendChild(s);
  }
  container.appendChild(fragment);
}

export function maskEmail(email) {
  if (!email) return "";
  const parts = email.split("@");
  if (parts[0].length <= 2) return "***@" + parts[1];
  return parts[0][0] + "***" + parts[0].slice(-1) + "@" + parts[1];
}

function resolveContainer(contenedor) {
  if (!contenedor) return null;
  if (typeof contenedor === "string") {
    return document.querySelector(contenedor);
  }
  return contenedor;
}

export function mostrarSpinner(contenedor, mensaje = "Cargando...") {
  const target = resolveContainer(contenedor);
  if (!target) return;
  target.replaceChildren();
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "display:flex;align-items:center;justify-content:center;min-height:180px;padding:24px;color:#6b7280;font-weight:600;gap:12px;text-align:center;";
  const spinner = document.createElement("span");
  spinner.setAttribute("aria-hidden", "true");
  spinner.style.cssText = "width:18px;height:18px;border:3px solid #d1d5db;border-top-color:#1f7a3a;border-radius:50%;display:inline-block;animation:agro-spin 0.8s linear infinite;";
  const text = document.createElement("span");
  text.textContent = mensaje;
  wrapper.append(spinner, text);
  target.appendChild(wrapper);
}

export function mostrarError(contenedor, mensaje) {
  const target = resolveContainer(contenedor);
  if (!target) return;
  target.replaceChildren();
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "margin:24px 0;padding:16px 18px;border-radius:14px;background:#fff1f2;border:1px solid #fecdd3;color:#9f1239;font-weight:600;";
  wrapper.textContent = mensaje;
  target.appendChild(wrapper);
}

export function mostrarEstadoVacio(contenedor, mensaje, icono = "") {
  const target = resolveContainer(contenedor);
  if (!target) return;
  target.replaceChildren();
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "margin:24px 0;padding:24px;text-align:center;color:#6b7280;font-weight:600;";
  wrapper.textContent = (icono ? icono + " " : "") + mensaje;
  target.appendChild(wrapper);
}

export function formatearPrecio(valor) {
  if (valor === null || valor === undefined) return "$0";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor);
}

export const UI = {
  escapeHtml,
  showToast,
  mostrarExito,
  badgeEstado,
  formatearFecha,
  createSkeleton,
  maskEmail,
  mostrarSpinner,
  mostrarError,
  mostrarEstadoVacio,
  formatearPrecio,
};

globalThis.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("agro-ui-spinner-style")) {
    const style = document.createElement("style");
    style.id = "agro-ui-spinner-style";
    style.textContent = "@keyframes agro-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
    document.head.appendChild(style);
  }
});

export default UI;
