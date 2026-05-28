import api from "./api.js";
import {
  escapeHtml,
  formatearPrecio,
  mostrarError,
  mostrarExito,
  mostrarSpinner,
} from "./ui.js";

const state = {
  productos: [],
};

function getCartItems() {
  return window.Cart?.getItems?.() || [];
}

function renderGrid(list) {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:48px;">No se encontraron productos.</div>';
    return;
  }

  grid.innerHTML = list
    .map(
      (producto) => `
    <div class="product-card">
      ${producto.enPromocion ? '<span class="badge-promo">OFERTA</span>' : ""}
      <div class="product-img-container">
        <img src="${producto.imagenUrl || "https://placehold.co/400x300/e8f5e9/1a5c2a?text=Fruta"}" alt="${escapeHtml(producto.nombre)}" onerror="this.src='https://placehold.co/400x300/e8f5e9/1a5c2a?text=Fruta'">
      </div>
      <div class="product-body">
        <span class="product-name">${escapeHtml(producto.nombre)}</span>
        <div class="product-rating">★ ${Number(producto.calificacionPromedio || 0).toFixed(1)} <span class="rating-value">(${producto.totalResenas || 0})</span></div>
        <div class="product-price">${formatearPrecio(producto.precio)}<span>/kg</span></div>
        <button class="btn-add-cart" ${producto.cantidadDisponible <= 0 ? "disabled" : ""} onclick="addToCart(${producto.id})">
          ${producto.cantidadDisponible > 0 ? "🛒 Agregar al carrito" : "Agotado"}
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

function filtrarProductos() {
  const busqueda =
    document.getElementById("searchCatalog")?.value?.trim().toLowerCase() || "";
  const tipo = document.getElementById("filtroTipo")?.value || "";
  const tipoNormalizado =
    {
      Banano: "BANANO",
      Piña: "PINA",
      Mango: "MANGO",
      Maracuyá: "MARACUYA",
      Guanábana: "GUANABANA",
      Naranja: "NARANJA",
      Coco: "COCO",
      Limón: "LIMON",
    }[tipo] || tipo;

  const filtrados = state.productos.filter((producto) => {
    const coincideTexto =
      !busqueda ||
      producto.nombre.toLowerCase().includes(busqueda) ||
      (producto.productorNombre || "").toLowerCase().includes(busqueda);
    const coincideTipo =
      !tipo ||
      String(producto.tipoFruta || "").toUpperCase() ===
        String(tipoNormalizado).toUpperCase();
    return coincideTexto && coincideTipo;
  });

  renderGrid(filtrados);
}

function addToCart(id) {
  const producto = state.productos.find((item) => item.id === id);
  if (!producto || !window.Cart) return;

  window.Cart.addItem(
    {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      img:
        producto.imagenUrl ||
        "https://placehold.co/100x100/e8f5e9/1a5c2a?text=Fruta",
    },
    1,
  );

  if (window.toggleCart) {
    const drawer = document.getElementById("cartDrawer");
    if (drawer && !drawer.classList.contains("open")) {
      toggleCart();
    } else {
      renderCartItems();
    }
  }
}

function renderCartItems() {
  const container = document.getElementById("cartItemsContainer");
  const countHeader = document.getElementById("cartCountHeader");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  const footer = document.getElementById("cartFooter");

  if (!container || !window.Cart) return;

  const items = getCartItems();
  if (countHeader) {
    countHeader.textContent = `(${items.length} item${items.length !== 1 ? "s" : ""})`;
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 60px 20px; color: var(--text-dim);">
        <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
        <div style="font-weight: 600; font-size: 16px; color: var(--text-muted); margin-bottom: 8px;">Tu carrito está vacío</div>
        <div style="font-size: 13px; margin-bottom: 24px;">Explora el catálogo y agrega productos frescos de <span>${escapeHtml((window.getSite && window.getSite("siteRegion")) || "tu región")}</span></div>
        <button class="btn btn-primary" onclick="toggleCart()" style="padding: 10px 20px;">Ver catálogo →</button>
      </div>`;
    if (footer) footer.style.display = "none";
    return;
  }

  if (footer) footer.style.display = "block";
  container.innerHTML = items
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.img}" class="cart-item-img" onerror="this.src='https://placehold.co/100x100/e8f5e9/1a5c2a?text=Fruta'">
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.nombre)}</div>
        <div class="cart-item-meta">${item.cantidad} kg · ${formatearPrecio(item.precio)}/kg</div>
        <div class="cart-item-controls">
          <button class="control-btn" onclick="updateCartQty(${item.id}, -1)">−</button>
          <span class="cart-item-qty">${item.cantidad}</span>
          <button class="control-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
          <div class="cart-item-total">${formatearPrecio(item.precio * item.cantidad)}</div>
        </div>
      </div>
      <div class="cart-item-remove" onclick="window.Cart.removeItem(${item.id}); renderCartItems();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </div>
    </div>
  `,
    )
    .join("");

  const subtotal = window.Cart.getTotal();
  if (subtotalEl) subtotalEl.textContent = formatearPrecio(subtotal);
  if (totalEl) totalEl.textContent = formatearPrecio(subtotal + 15000);
}

function updateCartQty(id, change) {
  const item = getCartItems().find((cartItem) => cartItem.id === id);
  if (!item) return;

  if (item.cantidad + change <= 0) {
    window.Cart.removeItem(id);
  } else {
    window.Cart.addItem(item, change);
  }
  renderCartItems();
}

async function checkoutCart() {
  const items = getCartItems();
  if (!items.length) return;

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Procesando...";
  }

  try {
    for (const item of items) {
      await api.crearPedido(item.id, item.cantidad);
    }
    window.Cart.clearCart();
    renderCartItems();
    mostrarExito("Pedido procesado con éxito.");
    window.location.href = "pedidos.html";
  } catch (error) {
    mostrarError(
      document.getElementById("cartItemsContainer"),
      error?.message || "No se pudo procesar la compra.",
    );
  } finally {
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Finalizar compra";
    }
  }
}

async function cargarProductos() {
  const grid = document.getElementById("catalogGrid");
  if (grid) mostrarSpinner(grid, "Cargando catálogo...");

  try {
    const page = await api.getProductos({ page: 0, size: 100 });
    state.productos = page?.content || [];
    filtrarProductos();
  } catch (error) {
    mostrarError(grid, error?.message || "No se pudo cargar el catálogo.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("searchCatalog")
    ?.addEventListener("input", filtrarProductos);
  document
    .getElementById("filtroTipo")
    ?.addEventListener("change", filtrarProductos);

  if (window.location.search.includes("openCart=true")) {
    window.setTimeout(() => toggleCart(), 300);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  cargarProductos();
});

window.addToCart = addToCart;
window.renderCartItems = renderCartItems;
window.updateCartQty = updateCartQty;
window.checkoutCart = checkoutCart;
window.applyFilters = filtrarProductos;
window.toggleCart = function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer) {
    drawer.classList.toggle("open");
  }
  if (overlay) {
    overlay.classList.toggle("open");
  }
  if (drawer?.classList.contains("open")) {
    renderCartItems();
  }
};
