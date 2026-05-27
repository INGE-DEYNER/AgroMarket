import api from "./api.js";
import Auth from "./auth.js";
import { formatearFecha, mostrarError, mostrarSpinner } from "./ui.js";

Auth.requireRole(["comprador", "productor", "admin"]);

const state = {
  envios: [],
};

function labelEstado(estado) {
  const value = String(estado || "").toUpperCase();
  const mapa = {
    PENDIENTE: "Pendiente",
    CONFIRMADO: "Confirmado",
    PREPARANDO: "Preparando",
    EN_CAMINO: "En camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };
  return mapa[value] || estado;
}

function pasoActual(estado) {
  const value = String(estado || "").toUpperCase();
  const mapa = {
    PENDIENTE: 0,
    CONFIRMADO: 1,
    PREPARANDO: 2,
    EN_CAMINO: 3,
    ENTREGADO: 4,
    CANCELADO: 0,
  };
  return mapa[value] ?? 0;
}

function badgeEstadoEnvio(estado) {
  const label = labelEstado(estado);
  const value = String(estado || "").toUpperCase();
  const clase =
    value === "ENTREGADO"
      ? "badge-gray"
      : value === "EN_CAMINO"
        ? "badge-yellow"
        : value === "PREPARANDO"
          ? "badge-blue"
          : "badge-green";
  return `<span class="badge ${clase}">${label}</span>`;
}

function renderShipment(envio) {
  const steps = [
    "Pedido recibido",
    "Pago confirmado",
    "Preparando envío",
    "En camino",
    "Entregado",
  ];
  const actual = pasoActual(envio.estado);
  const stepsHtml = steps
    .map((label, index) => {
      const isDone = index < actual;
      const isCurrent = index === actual;
      return `
      <div class="track-step">
        <div class="track-circle ${isDone ? "done" : isCurrent ? "current" : "pending"}">${isDone ? "✓" : index + 1}</div>
        <div class="track-label">${label}</div>
        <div class="track-line ${isDone ? "done" : ""}"></div>
      </div>`;
    })
    .join("");

  return `
    <div class="shipment-card">
      <div class="shipment-header">
        <div>
          <div class="shipment-id">ENV-${envio.id} · Pedido #${envio.pedidoId} · Guía: ${envio.guia || "-"}</div>
          <div class="shipment-route">${envio.origen} → ${envio.direccionDestino}</div>
          <div class="shipment-meta">
            <span>🚛 <strong>${envio.transportista || "Por asignar"}</strong></span>
          </div>
        </div>
        ${badgeEstadoEnvio(envio.estado)}
      </div>
      <div class="tracking-bar">${stepsHtml}</div>
      <div class="last-update">📅 Entrega estimada: <strong>${formatearFecha(envio.fechaEstimadaEntrega)}</strong></div>
      <div class="shipment-actions">
        <a href="mensajeria.html" class="btn btn-secondary btn-sm">💬 Contactar</a>
        <a href="pedidos.html" class="btn btn-ghost btn-sm">🧾 Ver pedido</a>
      </div>
    </div>`;
}

function renderAll() {
  const container = document.getElementById("shipmentsContainer");
  if (!container) return;
  if (!state.envios.length) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-icon">🚚</div><div>No tienes envíos registrados.</div></div>';
    return;
  }
  container.innerHTML = state.envios.map(renderShipment).join("");
}

function renderHistorial() {
  const tbody = document.getElementById("tbHistorial");
  if (!tbody) return;
  if (!state.envios.length) {
    tbody.innerHTML =
      '<tr><td colspan="6"><div class="empty-state">Sin historial de envíos.</div></td></tr>';
    return;
  }
  tbody.innerHTML = state.envios
    .map(
      (envio) => `
    <tr>
      <td style="color:var(--text-muted);font-size:.82rem;">ENV-${envio.id}</td>
      <td>${envio.pedidoId}</td>
      <td style="font-size:.82rem;">${envio.origen} → ${envio.direccionDestino}</td>
      <td>${envio.transportista || "-"}</td>
      <td>${badgeEstadoEnvio(envio.estado)}</td>
      <td style="color:var(--text-muted);font-size:.82rem;">${formatearFecha(envio.fechaEstimadaEntrega)}</td>
    </tr>`,
    )
    .join("");
}

async function cargarEnvios() {
  const container = document.getElementById("shipmentsContainer");
  if (container) mostrarSpinner(container, "Cargando envíos...");
  try {
    state.envios = await api.getMisEnvios();
    renderAll();
    renderHistorial();
  } catch (error) {
    mostrarError(
      container,
      error?.message || "No se pudieron cargar los envíos.",
    );
  }
}

document.addEventListener("DOMContentLoaded", cargarEnvios);
