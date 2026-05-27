import api from "./api.js";
import Auth from "./auth.js";
import {
  formatearPrecio,
  mostrarError,
  mostrarExito,
  mostrarSpinner,
} from "./ui.js";

Auth.requireRole(["admin"]);

const state = {
  usuarios: [],
  productos: [],
  resenas: [],
  dashboard: null,
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

function renderUsuarios(list = state.usuarios) {
  const tbody = document.getElementById("tbUsuarios");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML =
      '<tr><td colspan="5"><div class="empty-state">No hay usuarios.</div></td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map(
      (usuario) => `
    <tr>
      <td data-label="Nombre"><strong>${usuario.nombre}</strong></td>
      <td data-label="Correo">${usuario.correo}</td>
      <td data-label="Rol"><span class="badge-status ${String(usuario.rol).toLowerCase() === "productor" ? "status-shipped" : String(usuario.rol).toLowerCase() === "admin" ? "status-delivered" : "status-pending"}">${String(usuario.rol).toLowerCase()}</span></td>
      <td data-label="Estado">${usuario.activo ? "🟢 Activo" : "🟡 Inactivo"}</td>
      <td data-label="Acciones" class="actions-cell">
        <button class="btn btn-secondary btn-sm" onclick="toggleUsuario(${usuario.id}, ${usuario.activo})">${usuario.activo ? "Bloquear" : "Habilitar"}</button>
      </td>
    </tr>`,
    )
    .join("");
}

function renderProductos() {
  const tbody = document.getElementById("tbProductos");
  if (!tbody) return;

  if (!state.productos.length) {
    tbody.innerHTML =
      '<tr><td colspan="5"><div class="empty-state">Sin productos para moderar.</div></td></tr>';
    return;
  }

  tbody.innerHTML = state.productos
    .map(
      (producto) => `
    <tr>
      <td>${producto.nombre}</td>
      <td>${producto.productorNombre || "-"}</td>
      <td>${formatearPrecio(producto.precio)}</td>
      <td>${producto.cantidadDisponible} kg</td>
      <td class="actions-cell"><button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">Eliminar</button></td>
    </tr>`,
    )
    .join("");
}

function renderResenas() {
  const tbody = document.getElementById("tbResenas");
  if (!tbody) return;

  if (!state.resenas.length) {
    tbody.innerHTML =
      '<tr><td colspan="5"><div class="empty-state">No hay reseñas para moderar.</div></td></tr>';
    return;
  }

  tbody.innerHTML = state.resenas
    .map(
      (resena) => `
    <tr>
      <td>${resena.compradorNombre}</td>
      <td>${"★".repeat(Number(resena.calificacion || 0))}</td>
      <td>${resena.comentario}</td>
      <td>Visible</td>
      <td class="actions-cell"><button class="btn btn-danger btn-sm" onclick="eliminarResena(${resena.id})">Eliminar</button></td>
    </tr>`,
    )
    .join("");
}

function filterUsuarios() {
  const query =
    document.getElementById("searchUsuarios")?.value?.toLowerCase() || "";
  const filtered = state.usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(query) ||
      usuario.correo.toLowerCase().includes(query),
  );
  renderUsuarios(filtered);
}

async function toggleUsuario(id, activo) {
  try {
    if (activo) {
      await api.deshabilitarUsuario(id);
    } else {
      await api.habilitarUsuario(id);
    }
    await cargarUsuarios();
    mostrarExito("Usuario actualizado.");
  } catch (error) {
    alert(error?.message || "No se pudo actualizar el usuario.");
  }
}

async function eliminarProducto(id) {
  if (!window.confirm("¿Eliminar este producto?")) return;
  try {
    await api.eliminarProducto(id);
    await cargarProductos();
    mostrarExito("Producto eliminado.");
  } catch (error) {
    alert(error?.message || "No se pudo eliminar el producto.");
  }
}

async function eliminarResena(id) {
  if (!window.confirm("¿Eliminar esta reseña?")) return;
  try {
    await api.eliminarResena(id);
    await cargarResenas();
    mostrarExito("Reseña eliminada.");
  } catch (error) {
    alert(error?.message || "No se pudo eliminar la reseña.");
  }
}

async function cargarDashboard() {
  try {
    state.dashboard = await api.getDashboard();
    const statUsuarios = document.getElementById("statUsuarios");
    const statProductos = document.getElementById("statProductos");
    const statResenas = document.getElementById("statResenas");
    if (statUsuarios)
      statUsuarios.textContent = String(
        state.dashboard.totalUsuarios || 0,
      ).padStart(2, "0");
    if (statProductos)
      statProductos.textContent = String(
        state.dashboard.totalProductos || 0,
      ).padStart(2, "0");
    if (statResenas)
      statResenas.textContent = String(state.resenas.length || 0).padStart(
        2,
        "0",
      );
  } catch (error) {
    mostrarError(
      document.body,
      error?.message || "No se pudo cargar el dashboard.",
    );
  }
}

async function cargarUsuarios() {
  const tbody = document.getElementById("tbUsuarios");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando usuarios...",
    );
  state.usuarios = await api.getUsuarios();
  renderUsuarios();
}

async function cargarProductos() {
  const tbody = document.getElementById("tbProductos");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando productos...",
    );
  const respuesta = await api.getProductos({ page: 0, size: 100 });
  state.productos = respuesta?.content || [];
  renderProductos();
}

async function cargarResenas() {
  const tbody = document.getElementById("tbResenas");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando reseñas...",
    );
  const respuestas = await Promise.all(
    state.productos.slice(0, 10).map(async (producto) => {
      try {
        const resenas = await api.getResenas(producto.id);
        return resenas.map((resena) => ({
          ...resena,
          productoNombre: producto.nombre,
        }));
      } catch {
        return [];
      }
    }),
  );
  state.resenas = respuestas.flat();
  renderResenas();
}

async function cargarTodo() {
  await cargarUsuarios();
  await cargarProductos();
  await cargarResenas();
  await cargarDashboard();
}

document.addEventListener("DOMContentLoaded", async () => {
  document
    .getElementById("searchUsuarios")
    ?.addEventListener("input", filterUsuarios);
  await cargarTodo();
});

window.showSection = showSection;
window.filterUsuarios = filterUsuarios;
window.toggleUsuario = toggleUsuario;
window.eliminarProducto = eliminarProducto;
window.eliminarResena = eliminarResena;
