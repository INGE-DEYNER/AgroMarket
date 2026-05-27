import api from "./api.js";
import Auth from "./auth.js";
import {
  badgeEstado,
  formatearPrecio,
  mostrarError,
  mostrarExito,
  mostrarSpinner,
} from "./ui.js";

Auth.requireRole(["productor", "admin"]);

const state = {
  productos: [],
  ventas: [],
  editingId: null,
};

function showSection(name) {
  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.remove("active"));
  document
    .querySelectorAll(".sidebar-link")
    .forEach((link) => link.classList.remove("active"));
  document.getElementById(`sec-${name}`)?.classList.add("active");
  const link = document.getElementById(`link-${name}`);
  if (link) link.classList.add("active");
}

function normalizarTipoFruta(tipo) {
  const value = String(tipo || "").toUpperCase();
  const mapa = {
    BANANO: "BANANO",
    MANGO: "MANGO",
    PIÑA: "PINA",
    PINA: "PINA",
    MARACUYA: "MARACUYA",
    GUANABANA: "GUANABANA",
    NARANJA: "NARANJA",
    COCO: "COCO",
    LIMON: "LIMON",
    OTRO: "OTRO",
  };
  return mapa[value] || "OTRO";
}

function tipoDesdeEnum(tipo) {
  const value = String(tipo || "").toUpperCase();
  const mapa = {
    BANANO: "Banano",
    MANGO: "Mango",
    PINA: "Piña",
    MARACUYA: "Maracuyá",
    GUANABANA: "Guanábana",
    NARANJA: "Naranja",
    COCO: "Coco",
    LIMON: "Limón",
    OTRO: "Otro",
  };
  return mapa[value] || value;
}

function renderMisProductos() {
  const tbody = document.getElementById("tbMisProductos");
  if (!tbody) return;

  if (!state.productos.length) {
    tbody.innerHTML =
      '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📦</div><div>No tienes productos publicados.</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = state.productos
    .map(
      (producto) => `
    <tr>
      <td data-label="Producto">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${producto.imagenUrl || "https://placehold.co/64x64/e8f5e9/1a5c2a?text=Fruta"}" alt="${producto.nombre}" style="width:32px; height:32px; border-radius:6px; object-fit:cover;">
          <strong>${producto.nombre}</strong>
        </div>
      </td>
      <td data-label="Tipo">${tipoDesdeEnum(producto.tipoFruta)}</td>
      <td data-label="Precio/kg">${formatearPrecio(producto.precio)}</td>
      <td data-label="Stock">${producto.cantidadDisponible} kg</td>
      <td data-label="Estado">${producto.activo ? '<span class="badge-status status-shipped">Activo</span>' : '<span class="badge-status badge-red">Inactivo</span>'}</td>
      <td data-label="Acciones" class="actions-cell">
        <button class="btn btn-secondary btn-sm" onclick="editarProducto(${producto.id})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">🗑</button>
      </td>
    </tr>`,
    )
    .join("");
}

function renderPedidosRec() {
  const tbody = document.getElementById("tbPedidosRec");
  if (!tbody) return;

  if (!state.ventas.length) {
    tbody.innerHTML =
      '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🧾</div><div>Aún no tienes ventas registradas.</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = state.ventas
    .map((pedido) => {
      const acciones = [];
      if (
        String(pedido.estado).toUpperCase() === "PENDIENTE" ||
        String(pedido.estado).toUpperCase() === "CONFIRMADO"
      ) {
        acciones.push(
          `<button class="btn btn-primary btn-sm" onclick="setPedidoEstado(${pedido.id})">Despachar</button>`,
        );
      }
      if (String(pedido.estado).toUpperCase() === "ENVIADO") {
        acciones.push(
          `<button class="btn btn-secondary btn-sm" onclick="setPedidoEstado(${pedido.id})">Entregado</button>`,
        );
      }

      return `<tr>
      <td data-label="ID">#${pedido.id}</td>
      <td data-label="Producto">${pedido.productoNombre}</td>
      <td data-label="Comprador">${pedido.compradorNombre}</td>
      <td data-label="Cant.">${pedido.cantidad} kg</td>
      <td data-label="Total">${formatearPrecio(pedido.total)}</td>
      <td data-label="Estado">${badgeEstado(pedido.estado)}</td>
      <td data-label="Acciones" class="actions-cell">${acciones.join("")}</td>
    </tr>`;
    })
    .join("");
}

function openProductoModal(producto = null) {
  state.editingId = producto?.id || null;
  document.getElementById("modalProducto")?.classList.add("open");
  document.getElementById("pNombre").value = producto?.nombre || "";
  document.getElementById("pTipo").value = producto
    ? tipoDesdeEnum(producto.tipoFruta)
    : "Banano";
  document.getElementById("pPrecio").value = producto?.precio || "";
  document.getElementById("pStock").value = producto?.cantidadDisponible || "";
  document.getElementById("pDesc").value = producto?.descripcion || "";
}

function closeProductoModal() {
  state.editingId = null;
  document.getElementById("modalProducto")?.classList.remove("open");
}

async function guardarProducto() {
  const payload = {
    nombre: document.getElementById("pNombre").value.trim(),
    descripcion: document.getElementById("pDesc").value.trim(),
    precio: Number(document.getElementById("pPrecio").value),
    cantidadDisponible: Number(document.getElementById("pStock").value),
    imagenUrl:
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800",
    tipoFruta: normalizarTipoFruta(document.getElementById("pTipo").value),
    enPromocion: false,
  };

  try {
    if (state.editingId) {
      await api.actualizarProducto(state.editingId, payload);
      mostrarExito("Producto actualizado.");
    } else {
      await api.crearProducto(payload);
      mostrarExito("Producto publicado.");
    }
    closeProductoModal();
    await cargarDatos();
  } catch (error) {
    alert(error?.message || "No se pudo guardar el producto.");
  }
}

async function editarProducto(id) {
  const producto = state.productos.find(
    (item) => String(item.id) === String(id),
  );
  if (!producto) return;
  openProductoModal(producto);
}

async function eliminarProducto(id) {
  if (!window.confirm("¿Eliminar este producto?")) return;
  try {
    await api.eliminarProducto(id);
    state.productos = state.productos.filter(
      (item) => String(item.id) !== String(id),
    );
    renderMisProductos();
    mostrarExito("Producto eliminado.");
  } catch (error) {
    alert(error?.message || "No se pudo eliminar el producto.");
  }
}

async function setPedidoEstado(id) {
  try {
    await api.avanzarPedido(id);
    await cargarVentas();
  } catch (error) {
    alert(error?.message || "No se pudo actualizar el pedido.");
  }
}

async function cargarProductos() {
  const tbody = document.getElementById("tbMisProductos");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando inventario...",
    );
  const respuesta = await api.getMisProductos();
  state.productos = respuesta?.content || respuesta || [];
  renderMisProductos();
}

async function cargarVentas() {
  const tbody = document.getElementById("tbPedidosRec");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando ventas...",
    );
  const respuesta = await api.getMisVentas();
  state.ventas = respuesta || [];
  renderPedidosRec();
}

async function cargarDatos() {
  await Promise.all([cargarProductos(), cargarVentas()]);
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarDatos();
});

window.showSection = showSection;
window.openProductoModal = openProductoModal;
window.closeProductoModal = closeProductoModal;
window.guardarProducto = guardarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.setPedidoEstado = setPedidoEstado;
