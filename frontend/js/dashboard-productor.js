import api from "./api.js";
import Auth from "./auth.js";
import {
  badgeEstado,
  escapeHtml,
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
  imagenFile: null,
  imagenUrl: null,
};

function showSection(name) {
  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.remove("active"));
  document
    .querySelectorAll(".sidebar-link")
    .forEach((link) => link.classList.remove("active"));

  const targetSec = document.getElementById(`sec-${name}`);
  if (targetSec) targetSec.classList.add("active");

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
  return mapa[value] || "Otro";
}

function renderMisProductos() {
  const tbody = document.getElementById("tbMisProductos");
  if (!tbody) return;

  if (!state.productos.length) {
    tbody.innerHTML =
      '<tr><td colspan="6"><div class="empty-state" style="text-align:center;padding:32px;"><div class="empty-icon" style="font-size:2rem;margin-bottom:8px;">📦</div><div style="color:var(--text-muted);">No tienes productos publicados.</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = state.productos
    .map(
      (producto) => `
    <tr>
      <td data-label="Producto">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${producto.imagenUrl || "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=80"}" alt="${escapeHtml(producto.nombre)}" style="width:32px; height:32px; border-radius:6px; object-fit:cover;">
          <strong>${escapeHtml(producto.nombre)}</strong>
        </div>
      </td>
      <td data-label="Tipo">${tipoDesdeEnum(producto.tipoFruta)}</td>
      <td data-label="Precio/kg">${formatearPrecio(producto.precio)}</td>
      <td data-label="Stock">${producto.cantidadDisponible} kg</td>
      <td data-label="Estado">${producto.activo ? '<span class="badge-status status-success">Activo</span>' : '<span class="badge-status status-danger">Inactivo</span>'}</td>
      <td data-label="Acciones" class="actions-cell">
        <button class="btn btn-secondary btn-sm" onclick="editarProducto(${producto.id})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">🗑</button>
      </td>
    </tr>`,
    )
    .join("");
}

function renderRecentVentas() {
  const tbody = document.getElementById("tbRecentVentas");
  if (!tbody) return;

  if (!state.ventas.length) {
    tbody.innerHTML =
      '<tr><td colspan="4"><div class="empty-state" style="text-align:center;padding:20px;color:var(--text-muted);">Aún no registras ninguna venta.</div></td></tr>';
    return;
  }

  const recent = state.ventas.slice(0, 5);
  tbody.innerHTML = recent
    .map(
      (pedido) => `
    <tr>
      <td data-label="Pedido" style="color:var(--text-dim); font-weight:600;">#${pedido.id}</td>
      <td data-label="Comprador">${escapeHtml(pedido.compradorNombre || "Cliente")}</td>
      <td data-label="Total" style="font-weight:600;">${formatearPrecio(pedido.total)}</td>
      <td data-label="Estado">${badgeEstado(pedido.estado)}</td>
    </tr>`,
    )
    .join("");
}

function renderPedidosRec() {
  const tbody = document.getElementById("tbPedidosRec");
  if (!tbody) return;

  if (!state.ventas.length) {
    tbody.innerHTML =
      '<tr><td colspan="7"><div class="empty-state" style="text-align:center;padding:32px;"><div class="empty-icon" style="font-size:2rem;margin-bottom:8px;">🧾</div><div style="color:var(--text-muted);">Aún no tienes ventas registradas.</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = state.ventas
    .map((pedido) => {
      const acciones = [];
      const estadoUpper = String(pedido.estado).toUpperCase();

      if (estadoUpper === "PENDIENTE" || estadoUpper === "CONFIRMADO") {
        acciones.push(
          `<button class="btn btn-primary btn-sm" onclick="setPedidoEstado(${pedido.id})">Despachar</button>`,
        );
      }
      if (
        estadoUpper === "ENVIADO" ||
        estadoUpper === "PREPARANDO" ||
        estadoUpper === "EN_CAMINO"
      ) {
        acciones.push(
          `<button class="btn btn-secondary btn-sm" onclick="setPedidoEstado(${pedido.id})">Entregado</button>`,
        );
      }

      return `<tr>
      <td data-label="ID">#${pedido.id}</td>
      <td data-label="Producto">${escapeHtml(pedido.productoNombre || "Producto no disponible")}</td>
      <td data-label="Comprador">${escapeHtml(pedido.compradorNombre || "Cliente")}</td>
      <td data-label="Cant.">${pedido.cantidad} kg</td>
      <td data-label="Total" style="font-weight:600;">${formatearPrecio(pedido.total)}</td>
      <td data-label="Estado">${badgeEstado(pedido.estado)}</td>
      <td data-label="Acciones" class="actions-cell">${acciones.length ? acciones.join("") : '<span style="color:var(--text-muted);font-size:0.8rem">Completado</span>'}</td>
    </tr>`;
    })
    .join("");
}

function renderChart() {
  const chartContainer = document.getElementById("salesChartContainer");
  if (!chartContainer) return;

  if (!state.ventas.length) {
    chartContainer.innerHTML =
      '<div style="text-align:center;padding-top:40px;color:var(--text-muted);">Sin datos de ventas</div>';
    return;
  }

  // Agrupar ventas por producto
  const productTotals = {};
  state.ventas.forEach((v) => {
    if (String(v.estado).toUpperCase() !== "CANCELADO") {
      productTotals[v.productoNombre] =
        (productTotals[v.productoNombre] || 0) + Number(v.total || 0);
    }
  });

  const entries = Object.entries(productTotals);
  if (!entries.length) {
    chartContainer.innerHTML =
      '<div style="text-align:center;padding-top:40px;color:var(--text-muted);">Sin ingresos registrados</div>';
    return;
  }

  const maxVal = Math.max(...entries.map(([_, val]) => val));
  const colors = [
    "var(--primary)",
    "var(--gold)",
    "var(--blue)",
    "var(--purple)",
    "var(--red)",
  ];

  chartContainer.innerHTML = entries
    .map(([name, val], idx) => {
      const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
      const col = colors[idx % colors.length];
      return `
      <div class="chart-bar" style="height: ${Math.max(pct, 15)}%; background: ${col};" data-label="${escapeHtml(name.split(" ")[0] || "")}">
        <span style="position:absolute;top:-20px;font-size:0.7rem;font-weight:700;color:var(--text);">${formatearPrecio(val)}</span>
      </div>`;
    })
    .join("");
}

function renderPerfil() {
  const user = Auth.getUsuario();
  if (!user) return;

  const sidebarName = document.getElementById("sidebarUserName");
  const sidebarRole = document.getElementById("sidebarUserRole");
  const sidebarAvatar = document.getElementById("sidebarUserAvatar");
  const welcomeText = document.getElementById("welcomeUserText");

  if (sidebarName) sidebarName.textContent = user.nombre;
  if (sidebarRole)
    sidebarRole.textContent = (user.rol || "productor")
      .toString()
      .replace(/^(.)/, (s) => s.toUpperCase());
  if (welcomeText) {
    welcomeText.textContent = `¡Excelente día, ${(user.nombre || "Usuario").split(" ")[0]}! 👨‍🌾`;
  }
  if (sidebarAvatar) {
    sidebarAvatar.textContent = (user.nombre || "U")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
}

function actualizarStats() {
  const activeProducts = state.productos.filter((p) => p.activo).length;
  const totalVentas = state.ventas.length;
  const totalRevenue = state.ventas
    .filter((v) => String(v.estado).toUpperCase() !== "CANCELADO")
    .reduce((sum, v) => sum + Number(v.total || 0), 0);

  const elActive = document.getElementById("statActiveProductos");
  const elVentas = document.getElementById("statVentasMes");
  const elRevenue = document.getElementById("statRevenue");

  if (elActive) elActive.textContent = String(activeProducts).padStart(2, "0");
  if (elVentas) elVentas.textContent = String(totalVentas).padStart(2, "0");
  if (elRevenue) elRevenue.textContent = formatearPrecio(totalRevenue);
}

function openProductoModal(producto = null) {
  state.editingId = producto?.id || null;
  state.imagenFile = null;
  state.imagenUrl = producto?.imagenUrl || null;

  const title = document.getElementById("modalTitle");
  if (title) {
    title.textContent = producto
      ? "Editar producto"
      : "Publicar nuevo producto";
  }

  document.getElementById("pNombre").value = producto?.nombre || "";
  document.getElementById("pTipo").value = producto
    ? tipoDesdeEnum(producto.tipoFruta)
    : "";
  document.getElementById("pPrecio").value = producto?.precio || "";
  document.getElementById("pStock").value = producto?.cantidadDisponible || "";
  document.getElementById("pDesc").value = producto?.descripcion || "";

  // Reset imagen
  const imagenInput = document.getElementById("imagenInput");
  if (imagenInput) imagenInput.value = "";
  const previewContainer = document.getElementById("imagenPreviewContainer");
  if (previewContainer) previewContainer.style.display = state.imagenUrl ? "block" : "none";
  const preview = document.getElementById("imagenPreview");
  if (preview && state.imagenUrl) preview.src = state.imagenUrl;

  document.getElementById("modalProducto")?.classList.add("open");
}

function closeProductoModal() {
  state.editingId = null;
  document.getElementById("modalProducto")?.classList.remove("open");
}

async function guardarProducto() {
  const nombre = document.getElementById("pNombre").value.trim();
  const desc = document.getElementById("pDesc").value.trim();
  const precio = Number(document.getElementById("pPrecio").value);
  const stock = Number(document.getElementById("pStock").value);
  const tipo = document.getElementById("pTipo").value;
  const productoExistente = state.editingId
    ? state.productos.find(
        (item) => String(item.id) === String(state.editingId),
      )
    : null;

  if (!nombre || !precio || !stock) {
    alert("Por favor completa los campos obligatorios.");
    return;
  }

  const payload = {
    nombre,
    descripcion: desc,
    precio,
    cantidadDisponible: stock,
    imagenUrl: state.imagenUrl || productoExistente?.imagenUrl || "",
    tipoFruta: normalizarTipoFruta(tipo),
    enPromocion: false,
  };

  try {
    let productoId = state.editingId;

    if (state.editingId) {
      await api.actualizarProducto(state.editingId, payload);
      mostrarExito("Producto actualizado correctamente.");
    } else {
      const res = await api.crearProducto(payload);
      productoId = res?.id;
      mostrarExito("Producto publicado correctamente.");
    }

    // Subir imagen si existe
    if (state.imagenFile && productoId) {
      const progressBar = document.getElementById("imagenProgressBar");
      try {
        await api.subirImagenProducto(productoId, state.imagenFile, (pct) => {
          if (progressBar) progressBar.style.width = `${pct}%`;
        });
      } catch (err) {
        console.warn("Error al subir imagen:", err.message);
      }
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
  if (
    !window.confirm("¿Eliminar este producto permanentemente de tu inventario?")
  )
    return;
  try {
    await api.eliminarProducto(id);
    state.productos = state.productos.filter(
      (item) => String(item.id) !== String(id),
    );
    renderMisProductos();
    actualizarStats();
    mostrarExito("Producto eliminado.");
  } catch (error) {
    alert(error?.message || "No se pudo eliminar el producto.");
  }
}

async function setPedidoEstado(id) {
  try {
    await api.avanzarPedido(id);
    mostrarExito("Estado del pedido actualizado.");
    await cargarVentas();
  } catch (error) {
    alert(error?.message || "No se pudo actualizar el estado del pedido.");
  }
}

async function cargarProductos() {
  const tbody = document.getElementById("tbMisProductos");
  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando inventario...",
    );

  try {
    const respuesta = await api.getMisProductos();
    state.productos = respuesta?.content || respuesta || [];
    renderMisProductos();
  } catch (error) {
    const tbodyEl = document.getElementById("tbMisProductos");
    if (tbodyEl) {
      mostrarError(
        tbodyEl.closest(".card-table") || tbodyEl.parentElement,
        error?.message || "No se pudieron cargar tus productos.",
      );
    }
  }
}

async function cargarVentas() {
  const tbody = document.getElementById("tbPedidosRec");
  const recentTbody = document.getElementById("tbRecentVentas");

  if (tbody)
    mostrarSpinner(
      tbody.closest(".card-table") || tbody.parentElement,
      "Cargando ventas...",
    );
  if (recentTbody)
    mostrarSpinner(
      recentTbody.closest(".card-table") || recentTbody.parentElement,
      "Cargando ventas recientes...",
    );

  try {
    const respuesta = await api.getMisVentas();
    state.ventas = respuesta || [];
    renderPedidosRec();
    renderRecentVentas();
    renderChart();
  } catch (error) {
    const err = error?.message || "No se pudieron cargar tus ventas.";
    if (tbody)
      mostrarError(tbody.closest(".card-table") || tbody.parentElement, err);
  }
}

async function cargarDatos() {
  await Promise.all([cargarProductos(), cargarVentas()]);
  actualizarStats();
}

function setupImagenHandlers() {
  const imagenInput = document.getElementById("imagenInput");
  const imagenUploadArea = document.getElementById("imagenUploadArea");
  const imagenPreviewContainer = document.getElementById("imagenPreviewContainer");
  const imagenPreview = document.getElementById("imagenPreview");
  const uploadProgress = document.getElementById("imagenUploadProgress");
  const progressBar = document.getElementById("imagenProgressBar");

  if (!imagenInput || !imagenUploadArea) return;

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  function handleFile(file) {
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > maxSize) {
      alert("La imagen no puede superar 5 MB.");
      return;
    }

    state.imagenFile = file;

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      if (imagenPreview) imagenPreview.src = e.target.result;
      if (imagenPreviewContainer) imagenPreviewContainer.style.display = "block";
      if (uploadProgress) uploadProgress.style.display = "none";
      if (progressBar) progressBar.style.width = "0%";
    };
    reader.readAsDataURL(file);
  }

  imagenUploadArea.addEventListener("click", () => imagenInput.click());
  imagenUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    imagenUploadArea.style.background = "#f0f0f0";
  });
  imagenUploadArea.addEventListener("dragleave", () => {
    imagenUploadArea.style.background = "";
  });
  imagenUploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    imagenUploadArea.style.background = "";
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  imagenInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  renderPerfil();
  setupImagenHandlers();
  await cargarDatos();
});

window.showSection = showSection;
window.openProductoModal = openProductoModal;
window.closeProductoModal = closeProductoModal;
window.guardarProducto = guardarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.setPedidoEstado = setPedidoEstado;
