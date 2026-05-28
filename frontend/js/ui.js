function resolveContainer(contenedor) {
  if (!contenedor) return null;
  if (typeof contenedor === "string") {
    return document.querySelector(contenedor);
  }
  return contenedor;
}

export function escapeHtml(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function mostrarSpinner(contenedor, mensaje = "Cargando...") {
  const target = resolveContainer(contenedor);
  if (!target) return;

  target.replaceChildren();

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display:flex;align-items:center;justify-content:center;min-height:180px;padding:24px;color:#6b7280;font-weight:600;gap:12px;text-align:center;";

  const spinner = document.createElement("span");
  spinner.setAttribute("aria-hidden", "true");
  spinner.style.cssText =
    "width:18px;height:18px;border:3px solid #d1d5db;border-top-color:#1f7a3a;border-radius:50%;display:inline-block;animation:agro-spin 0.8s linear infinite;";

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
  wrapper.style.cssText =
    "margin:24px 0;padding:16px 18px;border-radius:14px;background:#fff1f2;border:1px solid #fecdd3;color:#9f1239;font-weight:600;";
  wrapper.textContent = mensaje;

  target.appendChild(wrapper);
}

export function mostrarEstadoVacio(contenedor, mensaje, icono = "ℹ️") {
  const target = resolveContainer(contenedor);
  if (!target) return;

  target.replaceChildren();

  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";
  wrapper.style.cssText =
    "display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;padding:24px;color:#6b7280;font-weight:600;gap:10px;text-align:center;";

  const icon = document.createElement("div");
  icon.className = "empty-icon";
  icon.style.cssText = "font-size:2rem;line-height:1;";
  icon.textContent = icono;

  const text = document.createElement("div");
  text.textContent = mensaje;

  wrapper.append(icon, text);
  target.appendChild(wrapper);
}

export function mostrarExito(mensaje) {
  const toast = document.createElement("div");
  toast.textContent = mensaje;
  toast.style.cssText =
    "position:fixed;right:20px;bottom:20px;z-index:9999;padding:14px 16px;border-radius:14px;background:#1f7a3a;color:#fff;font-weight:700;box-shadow:0 12px 30px rgba(0,0,0,.18);";
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

export function formatearPrecio(valor) {
  const numero = Number(valor || 0);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numero);
}

export function formatearFecha(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function badgeEstado(estado) {
  const value = String(estado || "").toUpperCase();
  const mapa = {
    PENDIENTE: "warning",
    ENVIADO: "info",
    ENTREGADO: "success",
    CANCELADO: "danger",
    PREPARANDO: "warning",
    EN_CAMINO: "info",
    CONFIRMADO: "success",
    PENDIENTE_PAGO: "warning",
  };
  const clase = mapa[value] || "info";
  return `<span class="badge-status status-${clase}">${escapeHtml(estado)}</span>`;
}

window.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("agro-ui-spinner-style")) {
    const style = document.createElement("style");
    style.id = "agro-ui-spinner-style";
    style.textContent =
      "@keyframes agro-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
    document.head.appendChild(style);
  }
});
