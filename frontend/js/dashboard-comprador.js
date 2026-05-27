import api from "./api.js";
import Auth from "./auth.js";
import {
  badgeEstado,
  formatearPrecio,
  formatearFecha,
  mostrarError,
  mostrarSpinner,
} from "./ui.js";

Auth.requireRole(["comprador", "admin"]);

const state = {
  productos: [],
  pedidos: [],
};

function showSection(name) {
  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.remove("active"));
  document
    .querySelectorAll(".sidebar-link, .mobile-nav-item")
    .forEach((link) => link.classList.remove("active"));
  document.getElementById(`sec-${name}`)?.classList.add("active");
  const sidebarLink = document.querySelector(
    `.sidebar-link[onclick*="${name}"]`,
  );
  if (sidebarLink) sidebarLink.classList.add("active");
  const mobileLink = document.querySelector(
    `.mobile-nav-item[onclick*="${name}"]`,
  );
  if (mobileLink) mobileLink.classList.add("active");
}

function renderRecs() {
  const grid = document.getElementById("recsGrid");
  if (!grid) return;

  if (!state.productos.length) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:32px;">No hay productos disponibles.</div>';
    return;
  }

  grid.innerHTML = state.productos
    .slice(0, 8)
    .map(
      (producto) => `
    <div class="product-card">
      ${producto.enPromocion ? '<span class="badge-promo">OFERTA</span>' : ""}
      <div class="product-img-container">
        <img src="${producto.imagenUrl || "https://placehold.co/400x300/e8f5e9/1a5c2a?text=Fruta"}" alt="${producto.nombre}" onerror="this.src='https://placehold.co/400x300/e8f5e9/1a5c2a?text=Fruta'">
      </div>
      <div class="product-body">
        <span class="product-name">${producto.nombre}</span>
        <div class="product-rating">★ ${Number(producto.calificacionPromedio || 0).toFixed(1)} <span class="rating-value">(${producto.totalResenas || 0})</span></div>
        <div class="product-price">${formatearPrecio(producto.precio)}<span>/kg</span></div>
        <button class="btn-add-cart" onclick="location.href='catalogo.html'">🛒 Comprar ahora</button>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderPedidosComp() {
  const tbody = document.getElementById("tbPedidosComp");
  if (!tbody) return;

  if (!state.pedidos.length) {
    tbody.innerHTML =
      '<tr><td colspan="6"><div class="empty-state">No tienes pedidos todavía.</div></td></tr>';
    return;
  }

  tbody.innerHTML = state.pedidos
    .map((pedido) => {
      const acciones = [];
      if (
        String(pedido.estado).toUpperCase() === "ENVIADO" ||
        String(pedido.estado).toUpperCase() === "PREPARANDO"
      ) {
        acciones.push(
          `<button class="btn btn-secondary btn-sm" onclick="location.href='envios.html'">Rastrear</button>`,
        );
      }
      if (String(pedido.estado).toUpperCase() === "ENTREGADO") {
        acciones.push(
          `<button class="btn btn-secondary btn-sm" onclick="verFactura(${pedido.id})">Factura</button>`,
        );
      }
      if (String(pedido.estado).toUpperCase() === "PENDIENTE") {
        acciones.push(
          `<button class="btn btn-danger btn-sm" onclick="cancelarPed(${pedido.id})">Cancelar</button>`,
        );
      }

      return `<tr>
      <td data-label="ID" style="color:var(--text-dim); font-weight:600;">#${pedido.id}</td>
      <td data-label="Producto" style="font-weight:500;">${pedido.productoNombre}</td>
      <td data-label="Cantidad">${pedido.cantidad} kg</td>
      <td data-label="Total" style="font-weight:600;">${formatearPrecio(pedido.total)}</td>
      <td data-label="Estado">${badgeEstado(pedido.estado)}</td>
      <td data-label="Acciones" class="actions-cell">${acciones.join("")}</td>
    </tr>`;
    })
    .join("");
}

function filtrarPedidosComp() {
  const filtro = document.getElementById("filtroPedComp")?.value || "";
  renderPedidosComp(
    filtro
      ? state.pedidos.filter(
          (pedido) =>
            String(pedido.estado).toUpperCase() ===
            String(filtro).toUpperCase(),
        )
      : state.pedidos,
  );
}

async function cancelarPed(id) {
  if (!window.confirm("¿Deseas cancelar este pedido?")) return;
  try {
    await api.cancelarPedido(id);
    state.pedidos = state.pedidos.filter(
      (pedido) => String(pedido.id) !== String(id),
    );
    filtrarPedidosComp();
  } catch (error) {
    alert(error?.message || "No se pudo cancelar el pedido.");
  }
}

async function verFactura(id) {
  try {
    const factura = await api.getFacturaPorPedido(id);
    const body =
      document.getElementById("facturaContent") ||
      document.getElementById("facturaBody");
    if (body) {
      body.innerHTML = `
        <div class="invoice" style="border:1px dashed var(--border); padding:20px; border-radius:8px;">
          <div style="text-align:center; margin-bottom:15px;">
            <h3 style="color:var(--primary-dark)">AGROMARKET Urabá</h3>
          </div>
          <div class="invoice-row"><span>Nº Factura</span><strong>${factura.numeroFactura}</strong></div>
          <div class="invoice-row"><span>Fecha</span><span>${formatearFecha(factura.fechaEmision)}</span></div>
          <div class="invoice-row"><span>Pedido</span><span>#${factura.pedidoId}</span></div>
          <div class="invoice-row"><span>Subtotal</span><span>${formatearPrecio(factura.subtotal)}</span></div>
          <div class="invoice-row"><span>IVA (19%)</span><span>${formatearPrecio(factura.iva)}</span></div>
          <div class="invoice-row" style="border-top:2px solid var(--primary); margin-top:10px; padding-top:10px;">
            <span class="invoice-total">Total a pagar</span><span class="invoice-total">${formatearPrecio(factura.total)}</span>
          </div>
        </div>`;
    }
    document.getElementById("modalFactura")?.classList.add("open");
  } catch (error) {
    alert(error?.message || "No se pudo abrir la factura.");
  }
}

async function cargarDashboard() {
  const recsGrid = document.getElementById("recsGrid");
  if (recsGrid) mostrarSpinner(recsGrid, "Cargando recomendaciones...");
  const pedidosTable = document.getElementById("tbPedidosComp");
  if (pedidosTable)
    mostrarSpinner(
      pedidosTable.closest(".card-table") || pedidosTable.parentElement,
      "Cargando pedidos...",
    );

  try {
    const [productos, pedidos] = await Promise.all([
      api.getProductos({ page: 0, size: 100 }),
      api.getMisCompras(),
    ]);
    state.productos = productos?.content || [];
    state.pedidos = pedidos || [];

    renderRecs();
    filtrarPedidosComp();

    const totalPedidos = state.pedidos.length;
    const totalInversion = state.pedidos.reduce(
      (sum, pedido) => sum + Number(pedido.total || 0),
      0,
    );
    const productosActivos = state.productos.length;
    const reviews = 0;

    const values = document.querySelectorAll(".stat-value");
    if (values[0])
      values[0].textContent = String(totalPedidos).padStart(2, "0");
    if (values[1]) values[1].textContent = formatearPrecio(totalInversion);
    if (values[2]) values[2].textContent = String(reviews).padStart(2, "0");
    if (values[3])
      values[3].textContent = String(productosActivos).padStart(2, "0");

    const currentDate = document.getElementById("currentDate");
    if (currentDate) {
      currentDate.textContent = new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  } catch (error) {
    mostrarError(
      recsGrid || pedidosTable,
      error?.message || "No se pudo cargar el panel del comprador.",
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("filtroPedComp")
    ?.addEventListener("change", filtrarPedidosComp);
  cargarDashboard();
});

window.showSection = showSection;
window.filtrarPedidosComp = filtrarPedidosComp;
window.verFactura = verFactura;
window.cancelarPed = cancelarPed;
