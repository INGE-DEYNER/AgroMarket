import api from "./api.js";
import Auth from "./auth.js";
import { mostrarError, mostrarSpinner } from "./ui.js";

Auth.requireRole(["comprador", "productor", "admin"]);

const state = {
  productos: [],
  resenas: [],
  currentRating: 0,
};

function avatarColor(name) {
  const colors = [
    "avatar-green",
    "avatar-blue",
    "avatar-gold",
    "avatar-purple",
    "avatar-red",
  ];
  return colors[String(name || "A").charCodeAt(0) % colors.length];
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderResenas() {
  const list = document.getElementById("reviewsList");
  if (!list) return;

  if (!state.resenas.length) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-icon">⭐</div><div>Sé el primero en dejar una reseña.</div></div>';
    return;
  }

  list.innerHTML = state.resenas
    .map((resena) => {
      const stars =
        "★".repeat(Number(resena.calificacion || 0)) +
        "☆".repeat(5 - Number(resena.calificacion || 0));
      return `
      <div class="review-card">
        <div class="review-header">
          <div class="avatar ${avatarColor(resena.compradorNombre)}">${initials(resena.compradorNombre)}</div>
          <div class="review-meta">
            <div class="review-user">${resena.compradorNombre}</div>
            <div class="review-time">${new Date(resena.fecha).toLocaleDateString("es-CO")}</div>
          </div>
          <div class="review-product-badge">${document.getElementById("rProducto")?.selectedOptions?.[0]?.textContent || "Producto"}</div>
        </div>
        <div class="review-stars">${stars}</div>
        <div class="review-comment">${resena.comentario}</div>
      </div>`;
    })
    .join("");
}

function hoverStar(val) {
  document.querySelectorAll(".star-inp").forEach((star) => {
    star.classList.toggle("hover", Number(star.dataset.val) <= val);
  });
}

function resetHover() {
  document
    .querySelectorAll(".star-inp")
    .forEach((star) => star.classList.remove("hover"));
  updateStarDisplay();
}

function setRating(val) {
  state.currentRating = val;
  updateStarDisplay();
  document.getElementById("rRatingErr")?.classList.remove("visible");
}

function updateStarDisplay() {
  document.querySelectorAll(".star-inp").forEach((star) => {
    star.classList.toggle(
      "active",
      Number(star.dataset.val) <= state.currentRating,
    );
  });
}

function openModal() {
  state.currentRating = 0;
  document.getElementById("rComentario").value = "";
  updateStarDisplay();
  ["rProductoErr", "rRatingErr", "rComentErr"].forEach((id) =>
    document.getElementById(id)?.classList.remove("visible"),
  );
  ["rProducto", "rComentario"].forEach((id) =>
    document.getElementById(id)?.classList.remove("error"),
  );
  document.getElementById("modalResena")?.classList.add("open");
}

function closeModal() {
  document.getElementById("modalResena")?.classList.remove("open");
}

async function publicarResena() {
  const productoId = document.getElementById("rProducto").value;
  const comentario = document.getElementById("rComentario").value.trim();
  let isValid = true;

  if (!productoId) {
    document.getElementById("rProducto").classList.add("error");
    document.getElementById("rProductoErr").classList.add("visible");
    isValid = false;
  }
  if (!state.currentRating) {
    document.getElementById("rRatingErr").classList.add("visible");
    isValid = false;
  }
  if (!comentario) {
    document.getElementById("rComentario").classList.add("error");
    document.getElementById("rComentErr").classList.add("visible");
    isValid = false;
  }

  if (!isValid) return;

  try {
    await api.crearResena({
      productoId: Number(productoId),
      calificacion: state.currentRating,
      comentario,
    });
    closeModal();
    await cargarProductoYResenas();
  } catch (error) {
    alert(error?.message || "No se pudo publicar la reseña.");
  }
}

async function cargarProductoYResenas() {
  const list = document.getElementById("reviewsList");
  if (list) mostrarSpinner(list, "Cargando reseñas...");

  try {
    const productos = await api.getProductos({ page: 0, size: 100 });
    state.productos = productos?.content || [];
    const select = document.getElementById("rProducto");
    if (select) {
      select.innerHTML =
        '<option value="">Selecciona un producto...</option>' +
        state.productos
          .map(
            (producto) =>
              `<option value="${producto.id}">${producto.nombre}</option>`,
          )
          .join("");
    }

    const productoSeleccionado = state.productos[0]?.id || select?.value;
    if (productoSeleccionado) {
      select.value = String(productoSeleccionado);
      state.resenas = await api.getResenas(productoSeleccionado);
    } else {
      state.resenas = [];
    }
    renderResenas();
  } catch (error) {
    mostrarError(list, error?.message || "No se pudieron cargar las reseñas.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("rProducto")
    ?.addEventListener("change", async (event) => {
      const productoId = event.target.value;
      if (!productoId) {
        state.resenas = [];
        renderResenas();
        return;
      }
      state.resenas = await api.getResenas(productoId);
      renderResenas();
    });

  cargarProductoYResenas();
});

window.openModal = openModal;
window.closeModal = closeModal;
window.publicarResena = publicarResena;
window.hoverStar = hoverStar;
window.resetHover = resetHover;
window.setRating = setRating;
window.updateStarDisplay = updateStarDisplay;
