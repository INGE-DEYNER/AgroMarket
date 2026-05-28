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

  const sec = document.getElementById(`sec-${name}`);
  if (sec) sec.classList.add("active");

  const link = document.getElementById(`link-${name}`);
  if (link) link.classList.add("active");
}

function renderUsuarios(list = state.usuarios) {
  const tbody = document.getElementById("tbUsuarios");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML =
      '<tr><td colspan="5"><div class="empty-state" style="text-align:center;padding:20px;color:var(--text-muted);">No hay usuarios registrados.</div></td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map(
      (usuario) => `
    <tr>
      <td data-label="Nombre"><strong>${usuario.nombre}</strong></td>
      <td data-label="Correo">${usuario.correo}</td>
      <td data-label="Rol"><span class="badge-status ${String(usuario.rol).toLowerCase() === "productor" ? "status-shipped" : String(usuario.rol).toLowerCase() === "administrador" || String(usuario.rol).toLowerCase() === "admin" ? "status-delivered" : "status-pending"}">${String(usuario.rol).toLowerCase()}</span></td>
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
      '<tr><td colspan="5"><div class="empty-state" style="text-align:center;padding:20px;color:var(--text-muted);">Sin productos en el inventario global.</div></td></tr>';
    return;
  }

  tbody.innerHTML = state.productos
    .map(
      (producto) => `
    <tr>
      <td><strong>${producto.nombre}</strong></td>
      <td>${producto.productorNombre || "-"}</td>
      <td>${formatearPrecio(producto.precio)}</td>
      <td>${producto.cantidadDisponible} kg</td>
      <td class="actions-cell">
        <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">Eliminar</button>
      </td>
    </tr>`,
    )
    .join("");
}

function renderResenas() {
  const tbody = document.getElementById("tbResenas");
  if (!tbody) return;

  if (!state.resenas.length) {
    tbody.innerHTML =
      '<tr><td colspan="5"><div class="empty-state" style="text-align:center;padding:20px;color:var(--text-muted);">No hay reseñas para moderar.</div></td></tr>';
    return;
  }

  tbody.innerHTML = state.resenas
    .map(
      (resena) => `
    <tr>
      <td><strong>${resena.compradorNombre || "Comprador"}</strong></td>
      <td style="color:var(--gold);font-weight:bold;">${"★".repeat(Number(resena.calificacion || 0))}</td>
      <td>"${resena.comentario}"</td>
      <td><span style="font-size:0.8rem;color:var(--text-muted)">${resena.productoNombre || "Producto"}</span></td>
      <td class="actions-cell">
        <button class="btn btn-danger btn-sm" onclick="eliminarResena(${resena.id})">Eliminar</button>
      </td>
    </tr>`,
    )
    .join("");
}

function renderTopProducers() {
  const ul = document.getElementById("ulTopProducers");
  if (!ul) return;

  const producers = state.usuarios.filter(
    (u) => String(u.rol).toUpperCase() === "PRODUCTOR",
  );
  if (!producers.length) {
    ul.innerHTML = `
      <li style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-light);">
        <span>No hay productores destacados</span>
        <span style="font-weight:600; color:var(--primary)">-</span>
      </li>
    `;
    return;
  }

  ul.innerHTML = producers
    .slice(0, 4)
    .map((p) => {
      return `
      <li style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-light);">
        <span>${p.nombre}</span>
        <span style="font-weight:600; color:var(--primary)">-</span>
      </li>`;
    })
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
    mostrarExito("Usuario actualizado correctamente.");
  } catch (error) {
    alert(error?.message || "No se pudo actualizar el usuario.");
  }
}

async function eliminarProducto(id) {
  if (
    !window.confirm(
      "¿Estás seguro de eliminar este producto del catálogo global?",
    )
  )
    return;
  try {
    await api.eliminarProducto(id);
    await cargarProductos();
    await cargarDashboard();
    mostrarExito("Producto eliminado de AgroMarket.");
  } catch (error) {
    alert(error?.message || "No se pudo eliminar el producto.");
  }
}

async function eliminarResena(id) {
  if (
    !window.confirm("¿Eliminar esta reseña permanentemente de la plataforma?")
  )
    return;
  try {
    await api.eliminarResena(id);
    await cargarResenas();
    mostrarExito("Reseña eliminada del sistema.");
  } catch (error) {
    alert(error?.message || "No se pudo eliminar la reseña.");
  }
}

async function cargarDashboard() {
  try {
    state.dashboard = await api.getDashboard();

    const statUsuarios = document.getElementById("statUsuarios");
    const statProductos = document.getElementById("statProductos");
    const statIngresos = document.getElementById("statIngresos");
    const statResenas = document.getElementById("statResenas");

    if (statUsuarios)
      statUsuarios.textContent = String(
        state.dashboard.totalUsuarios || 0,
      ).padStart(2, "0");

    if (statProductos)
      statProductos.textContent = String(
        state.dashboard.totalProductos || 0,
      ).padStart(2, "0");

    if (statIngresos)
      statIngresos.textContent = formatearPrecio(state.dashboard.ingresos || 0);

    if (statResenas)
      statResenas.textContent = String(state.resenas.length || 0).padStart(
        2,
        "0",
      );
  } catch (error) {
    console.error("Error al cargar dashboard: ", error);
  }
}

async function cargarUsuarios() {
  const tbody = document.getElementById("tbUsuarios");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando usuarios...",
    );

  try {
    state.usuarios = await api.getUsuarios();
    renderUsuarios();
    renderTopProducers();
  } catch (error) {
    if (tbody)
      mostrarError(
        tbody.closest(".card-table") || tbody.parentElement,
        error?.message || "Error al cargar usuarios.",
      );
  }
}

async function cargarProductos() {
  const tbody = document.getElementById("tbProductos");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando inventario...",
    );

  try {
    const respuesta = await api.getProductos({ page: 0, size: 100 });
    state.productos = respuesta?.content || respuesta || [];
    renderProductos();
  } catch (error) {
    if (tbody)
      mostrarError(
        tbody.closest(".card-table") || tbody.parentElement,
        error?.message || "Error al cargar inventario.",
      );
  }
}

async function cargarResenas() {
  const tbody = document.getElementById("tbResenas");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando reseñas...",
    );

  try {
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

    const statResenas = document.getElementById("statResenas");
    if (statResenas) {
      statResenas.textContent = String(state.resenas.length || 0).padStart(
        2,
        "0",
      );
    }
  } catch (error) {
    if (tbody)
      mostrarError(
        tbody.closest(".card-table") || tbody.parentElement,
        error?.message || "Error al cargar reseñas.",
      );
  }
}

function renderPerfil() {
  const user = Auth.getUsuario();
  if (!user) return;

  const sidebarName = document.getElementById("sidebarUserName");
  const sidebarRole = document.getElementById("sidebarUserRole");
  const sidebarAvatar = document.getElementById("sidebarUserAvatar");
  const welcomeText = document.getElementById("welcomeUserText");

  if (sidebarName) sidebarName.textContent = user.nombre;
  if (sidebarRole) {
    const rolNormalized = Auth.normalizarRol(
      user.rol || user.role || user.tipo,
    );
    const displayRole = rolNormalized
      ? rolNormalized.charAt(0).toUpperCase() + rolNormalized.slice(1)
      : "Usuario";
    sidebarRole.textContent = displayRole;
  }
  if (welcomeText) {
    welcomeText.textContent = `¡Hola, ${user.nombre.split(" ")[0]}! 👋`;
  }
  if (sidebarAvatar) {
    sidebarAvatar.textContent = user.nombre
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
}

async function cargarTodo() {
  renderPerfil();
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
