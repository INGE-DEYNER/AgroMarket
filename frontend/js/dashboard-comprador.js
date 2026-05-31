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

Auth.requireRole(["comprador"]);

const state = {
  productos: [],
  pedidos: [],
  contactos: [],
};

function showSection(name) {
  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.remove("active"));
  document
    .querySelectorAll(".sidebar-link, .mobile-nav-item")
    .forEach((link) => link.classList.remove("active"));

  const targetSection = document.getElementById(`sec-${name}`);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // Sidebar link toggle
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  sidebarLinks.forEach((link) => {
    const clickAttr = link.getAttribute("onclick") || "";
    if (clickAttr.includes(name)) {
      link.classList.add("active");
    }
  });

  // Mobile nav item toggle
  const mobileLinks = document.querySelectorAll(".mobile-nav-item");
  mobileLinks.forEach((link) => {
    const clickAttr = link.getAttribute("onclick") || "";
    if (clickAttr.includes(name)) {
      link.classList.add("active");
    }
  });
}

function renderRecs() {
  const grid = document.getElementById("recsGrid");
  if (!grid) return;

  if (!state.productos.length) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text-muted);">Aún no hay productos recomendados de temporada.</div>';
    return;
  }

  grid.innerHTML = state.productos
    .slice(0, 4)
    .map((producto) => {
      const nombre = producto && producto.nombre ? escapeHtml(producto.nombre) : "";
      const imagen = producto && producto.imagenUrl ? producto.imagenUrl : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";
      const precio = producto && typeof producto.precio !== "undefined" ? formatearPrecio(producto.precio) : "";

      // Only render rating if values are provided by API
      const ratingHtml =
        typeof producto.calificacionPromedio !== "undefined" &&
        typeof producto.totalResenas !== "undefined"
          ? `<div class="product-rating">★ ${Number(producto.calificacionPromedio).toFixed(1)} <span class="rating-value">(${producto.totalResenas})</span></div>`
          : "";

      return `
      <div class="product-card">
        ${producto.enPromocion ? '<span class="badge-promo">OFERTA</span>' : ""}
        <div class="product-img-container">
          <img src="${imagen}" alt="${nombre}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'">
        </div>
        <div class="product-body">
          <span class="product-name">${nombre}</span>
          ${ratingHtml}
          <div class="product-price">${precio}${precio ? '<span>/kg</span>' : ''}</div>
          <button class="btn-add-cart" onclick="location.href='catalogo.html'">🛒 Comprar ahora</button>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderRecentPedidos() {
  const tbody = document.getElementById("tbRecentPedidos");
  if (!tbody) return;

  if (!state.pedidos.length) {
    tbody.innerHTML =
      '<tr><td colspan="5"><div class="empty-state" style="text-align:center;padding:20px;color:var(--text-muted);">Aún no has realizado ningún pedido. <a href="catalogo.html" style="color:var(--primary);font-weight:600;">Explorar catálogo</a></div></td></tr>';
    return;
  }

  const recent = state.pedidos.slice(0, 5);
  tbody.innerHTML = recent
    .map((pedido) => {
      const trackingBtn =
        String(pedido.estado).toUpperCase() === "ENVIADO" ||
        String(pedido.estado).toUpperCase() === "PREPARANDO"
          ? `<a href="envios.html" class="btn btn-secondary btn-sm">Rastrear</a>`
          : `<button class="btn btn-ghost btn-sm" style="opacity:0.6;" disabled>Ninguna</button>`;

      return `<tr>
      <td data-label="ID" style="color:var(--text-dim); font-weight:600;">#${pedido.id}</td>
      <td data-label="Producto" style="font-weight:500;">${escapeHtml(pedido.productoNombre)}</td>
      <td data-label="Total" style="font-weight:600;">${formatearPrecio(pedido.total)}</td>
      <td data-label="Estado">${badgeEstado(pedido.estado)}</td>
      <td data-label="Acciones" class="actions-cell">${trackingBtn}</td>
    </tr>`;
    })
    .join("");
}

function renderPedidosComp(filteredList = state.pedidos) {
  const tbody = document.getElementById("tbPedidosComp");
  if (!tbody) return;

  if (!filteredList.length) {
    tbody.innerHTML =
      '<tr><td colspan="6"><div class="empty-state" style="text-align:center;padding:24px;color:var(--text-muted);">Aún no tienes pedidos registrados con este filtro.</div></td></tr>';
    return;
  }

  tbody.innerHTML = filteredList
    .map((pedido) => {
      const acciones = [];
      const estadoUpper = String(pedido.estado).toUpperCase();

      if (
        estadoUpper === "ENVIADO" ||
        estadoUpper === "PREPARANDO" ||
        estadoUpper === "EN_CAMINO"
      ) {
        acciones.push(
          `<button class="btn btn-secondary btn-sm" onclick="location.href='envios.html'">Rastrear</button>`,
        );
      }
      if (estadoUpper === "ENTREGADO") {
        acciones.push(
          `<button class="btn btn-secondary btn-sm" onclick="verFactura(${pedido.id})">Factura</button>`,
        );
      }
      if (estadoUpper === "PENDIENTE") {
        acciones.push(
          `<button class="btn btn-danger btn-sm" onclick="cancelarPed(${pedido.id})">Cancelar</button>`,
        );
      }

      return `<tr>
      <td data-label="ID" style="color:var(--text-dim); font-weight:600;">#${pedido.id}</td>
      <td data-label="Producto" style="font-weight:500;">${escapeHtml(pedido.productoNombre)}</td>
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
  const filtered = filtro
    ? state.pedidos.filter(
        (pedido) =>
          String(pedido.estado).toUpperCase() === String(filtro).toUpperCase(),
      )
    : state.pedidos;
  renderPedidosComp(filtered);
}

async function cancelarPed(id) {
  if (!window.confirm("¿Deseas cancelar este pedido?")) return;
  try {
    await api.cancelarPedido(id);
    state.pedidos = state.pedidos.filter(
      (pedido) => String(pedido.id) !== String(id),
    );
    filtrarPedidosComp();
    renderRecentPedidos();
    actualizarStats();
  } catch (error) {
    alert(error?.message || "No se pudo cancelar el pedido.");
  }
}

async function verFactura(id) {
  try {
    const factura = await api.getFacturaPorPedido(id);
    const body = document.getElementById("facturaContent");
    if (body) {
      const siteNameRaw = globalThis.getSite?.("siteName") || document.querySelector('[data-site="siteName"]')?.textContent;
      const siteRegionRaw = globalThis.getSite?.("siteRegion") || document.querySelector('[data-site="siteRegion"]')?.textContent;
      const siteName = siteNameRaw ? escapeHtml(siteNameRaw) : "";
      const siteRegion = siteRegionRaw ? escapeHtml(siteRegionRaw) : "";
      body.innerHTML = `
        <div class="invoice" style="border:1px dashed var(--border); padding:20px; border-radius:8px;">
            <div style="text-align:center; margin-bottom:15px;">
            <h3 style="color:var(--primary-dark)">${siteName}${siteRegion ? " " + siteRegion : ""}</h3>
                    <span style="font-size:0.8rem;color:var(--text-muted)"></span>
          </div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:6px 0;"><span>Nº Factura</span><strong>${escapeHtml(factura.numeroFactura || "FAC-" + factura.id)}</strong></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:6px 0;"><span>Fecha</span><span>${escapeHtml(formatearFecha(factura.fechaEmision))}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:6px 0;"><span>Pedido</span><span>#${escapeHtml(factura.pedidoId)}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:6px 0;"><span>Subtotal</span><span>${formatearPrecio(factura.subtotal)}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:6px 0;"><span>Impuesto (19%)</span><span>${formatearPrecio(factura.impuesto)}</span></div>
          <div class="invoice-row" style="display:flex;justify-content:space-between;margin:10px 0 0 0;padding-top:10px;border-top:2px solid var(--primary);">
            <span class="invoice-total" style="font-weight:700;">Total a pagar</span><span class="invoice-total" style="font-weight:700;color:var(--primary-dark);">${formatearPrecio(factura.total)}</span>
          </div>
        </div>`;
    }
    document.getElementById("modalFactura")?.classList.add("open");
  } catch (error) {
    alert(error?.message || "No se pudo abrir la factura.");
  }
}

function renderPerfil() {
  const user = Auth.getUsuario();
  if (!user) return;

  const sidebarName = document.getElementById("sidebarUserName");
  const sidebarRole = document.getElementById("sidebarUserRole");
  const sidebarAvatar = document.getElementById("sidebarUserAvatar");
  const welcomeText = document.getElementById("welcomeUserText");

  if (sidebarName && user.nombre) sidebarName.textContent = user.nombre;
  if (sidebarRole && user.rol)
    sidebarRole.textContent = user.rol.toString().replace(/^(.)/, (s) => s.toUpperCase());
  if (welcomeText && user.nombre) {
    const firstName = (user.nombre || "").split(" ").filter(Boolean)[0] || "";
    welcomeText.textContent = firstName ? `¡Hola de nuevo, ${firstName}! 👋` : "";
  }
  if (sidebarAvatar && user.nombre) {
    sidebarAvatar.textContent = user.nombre
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
}

function actualizarStats() {
  const totalPedidos = state.pedidos.length;
  const totalInversion = state.pedidos
    .filter((p) => String(p.estado).toUpperCase() !== "CANCELADO")
    .reduce((sum, p) => sum + Number(p.total || 0), 0);
  const reviewsDejadas = state.pedidos.filter(
    (p) => String(p.estado).toUpperCase() === "ENTREGADO",
  ).length;
  const totalContactos = state.contactos.length;

  const statPedidos = document.getElementById("statPedidos");
  const statInversion = document.getElementById("statInversion");
  const statResenas = document.getElementById("statResenas");
  const statContactos = document.getElementById("statContactos");

  if (statPedidos)
    statPedidos.textContent = String(totalPedidos).padStart(2, "0");
  if (statInversion)
    statInversion.textContent = formatearPrecio(totalInversion);
  if (statResenas)
    statResenas.textContent = String(reviewsDejadas).padStart(2, "0");
  if (statContactos)
    statContactos.textContent = String(totalContactos).padStart(2, "0");
}

async function cargarDashboard() {
  const recsGrid = document.getElementById("recsGrid");
  const recentTableWrap = document
    .getElementById("tbRecentPedidos")
    ?.closest(".card-table");
  const compTableWrap = document
    .getElementById("tbPedidosComp")
    ?.closest(".card-table");

  if (recsGrid) mostrarSpinner(recsGrid, "Cargando recomendaciones...");
  if (recentTableWrap)
    mostrarSpinner(recentTableWrap, "Cargando compras recientes...");
  if (compTableWrap)
    mostrarSpinner(compTableWrap, "Cargando historial de pedidos...");

  try {
    const [productosResp, pedidosResp, contactosResp] = await Promise.all([
      api.getProductos({ page: 0, size: 100 }),
      api.getMisCompras(),
      api.getContactos().catch(() => []), // fallback si falla mensajería
    ]);

    state.productos = productosResp?.content || productosResp || [];
    state.pedidos = pedidosResp || [];
    state.contactos = contactosResp || [];

    // Render lists
    renderRecs();
    renderRecentPedidos();
    renderPedidosComp();

    // Render Stats and dates
    actualizarStats();

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
    const errorMsg =
      error?.message || "No se pudo cargar el panel del comprador.";
    if (recsGrid) mostrarError(recsGrid, errorMsg);
    if (recentTableWrap) mostrarError(recentTableWrap, errorMsg);
    if (compTableWrap) mostrarError(compTableWrap, errorMsg);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = (await Auth.loadPerfil()) || Auth.getUsuario();
  if (perfil) renderPerfil();

  document
    .getElementById("filtroPedComp")
    ?.addEventListener("change", filtrarPedidosComp);

  cargarDashboard();
});

window.verFactura = verFactura;
window.cancelarPed = cancelarPed;
