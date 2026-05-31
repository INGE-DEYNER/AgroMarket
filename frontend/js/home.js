import api from "./api.js";
import {
  escapeHtml,
  formatearPrecio,
  mostrarError,
  mostrarEstadoVacio,
  mostrarSpinner,
} from "./ui.js";

const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");

if (menuToggle && navbar) {
  menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("menu-open");
  });
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navbar?.classList.remove("menu-open");
  });
});

window.addEventListener("scroll", () => {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.15,
};

function makeVisible(elements) {
  elements.forEach((el) => el.classList.add("visible"));
}

let animatedElements = [];

let observer = null;
function setupAnimations() {
  animatedElements = Array.from(document.querySelectorAll(".animate-fade-up"));
  if (typeof IntersectionObserver === "function") {
    observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observerInstance.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach((el) => observer.observe(el));
  } else {
    makeVisible(animatedElements);
  }
}

function renderMetric(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderFeaturedProducts(productos) {
  const container = document.getElementById("featuredProducts");
  if (!container) return;

  if (!productos.length) {
    mostrarEstadoVacio(
      container,
      "Todavía no hay productos activos para mostrar.",
      "🫙",
    );
    return;
  }

  container.innerHTML = productos
    .slice(0, 4)
    .map((producto) => {
      const disponible = Number(producto.cantidadDisponible || 0) > 0;
      const rating = Number(producto.calificacionPromedio || 0).toFixed(1);
      const reviews = Number(producto.totalResenas || 0);

      return `
        <div class="product-card animate-fade-up">
          <img
            src="${producto.imagenUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500"}"
            alt="${escapeHtml(producto.nombre)}"
            class="product-img"
            onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'"
          />
          <div class="product-info">
            <h3 class="product-name">${escapeHtml(producto.nombre)}</h3>
            <div class="product-producer">${escapeHtml(producto.productorNombre || "Productor verificado")}</div>
            <div class="product-price">${formatearPrecio(producto.precio)}/kg</div>
            <div class="product-meta">
              <div class="product-rating">★ ${rating} <span style="color: var(--text-muted); font-weight: normal">(${reviews})</span></div>
              <div class="product-badge">${disponible ? "Disponible" : "Sin stock"}</div>
            </div>
            <a href="catalogo.html" class="btn btn-primary product-btn">Pedir ahora</a>
          </div>
        </div>`;
    })
    .join("");
}

function ensureHeroContent() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const badge = hero.querySelector('.hero-badge');
  const title = hero.querySelector('.hero-title');
  const sub = hero.querySelector('.hero-sub');
  const btns = document.getElementById('heroBtns');

  if (badge && !badge.textContent.trim()) badge.textContent = '🌿 AgroMarket · Urabá';
  if (title && !title.textContent.trim()) title.textContent = 'Del campo directamente a tu mesa.';
  if (sub && !sub.textContent.trim()) sub.textContent = 'Frutas frescas de productores locales.';
  if (btns && !btns.children.length) {
    btns.innerHTML = '<a href="catalogo.html" class="btn btn-primary btn-lg">Ver catálogo →</a><a href="registro.html" class="btn btn-secondary btn-lg">Soy productor</a>';
  }
}

function renderFallbackHome(message = "No se pudo conectar al catálogo en este momento.") {
  const featuredProducts = document.getElementById("featuredProducts");
  const metricsFallback = document.getElementById("homeMetricsFallback");
  const fallbackProducts = [
    {
      nombre: "Banano Premium",
      productorNombre: "Productor local",
      precio: 4200,
      cantidadDisponible: 120,
      calificacionPromedio: 4.8,
      totalResenas: 24,
      imagenUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500",
    },
    {
      nombre: "Mango Tommy",
      productorNombre: "Cosecha verificada",
      precio: 5600,
      cantidadDisponible: 95,
      calificacionPromedio: 4.7,
      totalResenas: 18,
      imagenUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500",
    },
    {
      nombre: "Piña Oro",
      productorNombre: "Productores aliados",
      precio: 3800,
      cantidadDisponible: 60,
      calificacionPromedio: 4.9,
      totalResenas: 31,
      imagenUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500",
    },
  ];

  if (featuredProducts) {
    renderFeaturedProducts(fallbackProducts);
    featuredProducts.insertAdjacentHTML(
      "beforeend",
      `<div class="featured-fallback" style="grid-column:1 / -1;margin-top:12px;padding:14px 16px;border-radius:12px;background:#f8fafc;border:1px dashed #cbd5e1;color:#475569;font-weight:600;">
        ${message}
      </div>`,
    );
  }

  if (metricsFallback) {
    metricsFallback.innerHTML = `
      <div style="grid-column:1 / -1;padding:14px 16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;font-weight:600;">
        ${message}
      </div>`;
  }

  renderMetric("metricProductos", String(fallbackProducts.length));
  renderMetric("metricProductores", "3");
  renderMetric("metricPrecio", formatearPrecio(4600));
  renderMetric("metricCalificacion", "4.8★");

  const heroBadge = document.querySelector(".hero-badge");
  if (heroBadge) {
    heroBadge.textContent = "🌿 Catálogo disponible · modo sin conexión";
  }

  const floatCardTitle = document.querySelector(".float-card-1-title");
  const floatCardSub = document.querySelector(".float-card-1-sub");
  const floatCardValue = document.querySelector(".float-card-2-val");
  const floatCardDesc = document.querySelector(".float-card-2-sub");

  if (floatCardTitle) floatCardTitle.textContent = "🛒 Catálogo local";
  if (floatCardSub) floatCardSub.textContent = "Productos destacados cargados desde fallback";
  if (floatCardValue) floatCardValue.textContent = "4.8★";
  if (floatCardDesc) floatCardDesc.textContent = "La página sigue visible aunque el API no responda";
  makeVisible(animatedElements);
}

async function cargarHome() {
  const featuredProducts = document.getElementById("featuredProducts");
  const metricsFallback = document.getElementById("homeMetricsFallback");

  if (featuredProducts)
    mostrarSpinner(featuredProducts, "Cargando productos destacados...");
  if (metricsFallback)
    mostrarSpinner(metricsFallback, "Cargando panorama general...");

  try {
    const response = await api.getProductos({ page: 0, size: 100 });
    const productos = response?.content || response || [];

    renderFeaturedProducts(productos);

    const activos = productos.filter(
      (producto) => Number(producto.cantidadDisponible || 0) > 0,
    );
    const productores = new Set(
      productos.map((producto) => producto.productorNombre).filter(Boolean),
    );
    const precioPromedio = productos.length
      ? productos.reduce(
          (sum, producto) => sum + Number(producto.precio || 0),
          0,
        ) / productos.length
      : 0;
    const promedioResenas = productos.length
      ? productos.reduce(
          (sum, producto) => sum + Number(producto.calificacionPromedio || 0),
          0,
        ) / productos.length
      : 0;

    renderMetric("metricProductos", String(productos.length));
    renderMetric("metricProductores", String(productores.size));
    renderMetric("metricPrecio", formatearPrecio(precioPromedio));
    renderMetric(
      "metricCalificacion",
      promedioResenas ? `${promedioResenas.toFixed(1)}★` : "—",
    );

    const heroBadge = document.querySelector(".hero-badge");
    if (heroBadge) {
      heroBadge.textContent = `🌿 Catálogo vivo · ${activos.length} productos disponibles`;
    }

    const floatCardTitle = document.querySelector(".float-card-1-title");
    const floatCardSub = document.querySelector(".float-card-1-sub");
    const floatCardValue = document.querySelector(".float-card-2-val");
    const floatCardDesc = document.querySelector(".float-card-2-sub");

    if (floatCardTitle) floatCardTitle.textContent = "🛒 Catálogo activo";
    if (floatCardSub)
      floatCardSub.textContent = `${activos.length} productos listos para compra`;
    if (floatCardValue)
      floatCardValue.textContent = promedioResenas
        ? `${promedioResenas.toFixed(1)}★`
        : "—";
    if (floatCardDesc) floatCardDesc.textContent = "Promedio real del catálogo";

    if (metricsFallback) metricsFallback.innerHTML = "";
  } catch (error) {
    renderFallbackHome(
      error?.message || "No se pudieron cargar los productos destacados.",
    );
  }
  // Ensure hero shows reasonable defaults even when data is missing
  ensureHeroContent();
}

document.addEventListener("DOMContentLoaded", () => {
  setupAnimations();
  cargarHome();
});
