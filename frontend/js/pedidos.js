import api from "./api.js";
import Auth from "./auth.js";
import {
  badgeEstado,
  escapeHtml,
  formatearPrecio,
  formatearFecha,
  mostrarError,
  mostrarSpinner,
} from "./ui.js";

// Proteger la ruta
Auth.requireRole(["comprador", "productor", "admin"]);

const state = {
  pedidos: [],
};

function renderPedidos(list) {
  const tbody = document.getElementById("tbPedidos");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML =
      '<tr><td colspan="7"><div class="empty-state" style="text-align:center;padding:24px;"><div class="empty-icon" style="font-size:2rem;margin-bottom:8px;">📋</div><div style="color:var(--text-muted);">No hay pedidos con este filtro.</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map((pedido) => {
      const acciones = [];
      const estadoUpper = String(pedido.estado).toUpperCase();

      if (estadoUpper === "PENDIENTE") {
        acciones.push(
          `<button class="btn btn-danger btn-sm" onclick="cancelar('${pedido.id}')">✕ Cancelar</button>`,
        );
      }
      if (estadoUpper === "ENTREGADO") {
        acciones.push(
          `<button class="btn btn-ghost btn-sm" onclick="verFactura('${pedido.id}')">🧾 Ver factura</button>`,
        );
      }

      return `<tr>
      <td style="color:var(--text-muted);font-size:.82rem;">#${pedido.id}</td>
      <td><strong>${escapeHtml(pedido.productoNombre)}</strong></td>
      <td>${escapeHtml(pedido.productorNombre || "Luis Palacios")}</td>
      <td>${pedido.cantidad} kg</td>
      <td style="color:var(--green-light);font-weight:600;">${formatearPrecio(pedido.total)}</td>
      <td>${badgeEstado(pedido.estado)}</td>
      <td class="actions-cell">${acciones.length ? acciones.join("") : '<span style="color:var(--text-muted);font-size:0.8rem">Ninguna</span>'}</td>
    </tr>`;
    })
    .join("");
}

function filtrar() {
  const estado = document.getElementById("filtroEstado")?.value || "";
  renderPedidos(
    estado
      ? state.pedidos.filter(
          (pedido) =>
            String(pedido.estado).toUpperCase() ===
            String(estado).toUpperCase(),
        )
      : state.pedidos,
  );
}

async function cargarPedidos() {
  const tbody = document.getElementById("tbPedidos");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando pedidos...",
    );

  try {
    const pedidos = await api.getMisCompras();
    state.pedidos = pedidos || [];
    filtrar();
  } catch (error) {
    mostrarError(
      tbody?.closest(".card-table") || tbody?.parentElement,
      error?.message || "No se pudieron cargar los pedidos.",
    );
  }
}

async function cancelar(id) {
  if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido?"))
    return;

  try {
    await api.cancelarPedido(id);
    state.pedidos = state.pedidos.filter(
      (pedido) => String(pedido.id) !== String(id),
    );
    filtrar();
  } catch (error) {
    alert(error?.message || "No se pudo cancelar el pedido.");
  }
}

async function verFactura(id) {
  try {
    const factura = await api.getFacturaPorPedido(id);
    const body = document.getElementById("facturaBody");
    if (body) {
      body.innerHTML = `
        <div class="invoice" style="border: 1px dashed var(--border); padding: 18px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 12px;">
            <h3 style="color: var(--primary-dark)">${escapeHtml((window.getSite && window.getSite("siteName")) || "AGROMARKET")} ${escapeHtml((window.getSite && window.getSite("siteRegion")) || "Urabá")}</h3>
          </div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:4px 0;"><span>Nº Factura</span><strong>${escapeHtml(factura.numeroFactura || "FAC-" + factura.id)}</strong></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:4px 0;"><span>Fecha</span><span>${escapeHtml(formatearFecha(factura.fechaEmision))}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:4px 0;"><span>Pedido</span><span>#${escapeHtml(factura.pedidoId)}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:4px 0;"><span>Subtotal</span><span>${formatearPrecio(factura.subtotal)}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:4px 0;"><span>IVA (19%)</span><span>${formatearPrecio(factura.iva)}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:10px 0 0 0;padding-top:10px;border-top:2px solid var(--primary);">
            <span class="invoice-total" style="font-weight:700;">Total</span>
            <span class="invoice-total" style="font-weight:700;color:var(--primary-dark);">${formatearPrecio(factura.total)}</span>
          </div>
        </div>`;
    }
    document.getElementById("modalFactura")?.classList.add("open");
  } catch (error) {
    alert(error?.message || "No se pudo abrir la factura.");
  }
}

function closeFactura() {
  document.getElementById("modalFactura")?.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filtroEstado")?.addEventListener("change", filtrar);
  cargarPedidos();
});

window.cancelar = cancelar;
window.verFactura = verFactura;
window.closeFactura = closeFactura;
window.filtrar = filtrar;
