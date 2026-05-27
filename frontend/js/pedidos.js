import api from "./api.js";
import {
  badgeEstado,
  formatearPrecio,
  formatearFecha,
  mostrarError,
  mostrarSpinner,
} from "./ui.js";

const state = {
  pedidos: [],
};

function renderPedidos(list) {
  const tbody = document.getElementById("tbPedidos");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML =
      '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><div>No hay pedidos con este filtro.</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map((pedido) => {
      const acciones = [];
      if (String(pedido.estado).toUpperCase() === "PENDIENTE") {
        acciones.push(
          `<button class="btn btn-danger btn-sm" onclick="cancelar('${pedido.id}')">✕ Cancelar</button>`,
        );
      }
      if (String(pedido.estado).toUpperCase() === "ENTREGADO") {
        acciones.push(
          `<button class="btn btn-ghost btn-sm" onclick="verFactura('${pedido.id}')">🧾 Ver factura</button>`,
        );
      }

      return `<tr>
      <td style="color:var(--text-muted);font-size:.82rem;">#${pedido.id}</td>
      <td><strong>${pedido.productoNombre}</strong></td>
      <td>${pedido.productorNombre || "-"}</td>
      <td>${pedido.cantidad} kg</td>
      <td style="color:var(--green-light);font-weight:600;">${formatearPrecio(pedido.total)}</td>
      <td>${badgeEstado(pedido.estado)}</td>
      <td class="actions-cell">${acciones.join("")}</td>
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
        <div class="invoice">
          <div class="invoice-row"><span>Nº Factura</span><strong>${factura.numeroFactura}</strong></div>
          <div class="invoice-row"><span>Fecha</span><span>${formatearFecha(factura.fechaEmision)}</span></div>
          <div class="invoice-row"><span>Pedido</span><span>#${factura.pedidoId}</span></div>
          <div class="invoice-row"><span>Subtotal</span><span>${formatearPrecio(factura.subtotal)}</span></div>
          <div class="invoice-row"><span>IVA</span><span>${formatearPrecio(factura.iva)}</span></div>
          <div class="invoice-row">
            <span class="invoice-total">Total</span>
            <span class="invoice-total">${formatearPrecio(factura.total)}</span>
          </div>
        </div>`;
    }
    document.getElementById("modalFactura")?.classList.add("open");
  } catch (error) {
    alert(error?.message || "No se pudo abrir la factura.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filtroEstado")?.addEventListener("change", filtrar);
  cargarPedidos();
});

window.cancelar = cancelar;
window.verFactura = verFactura;
window.filtrar = filtrar;
