import Auth from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const navActions = document.getElementById("navActions");
  const navLinks = document.getElementById("navLinks");
  const heroBtns = document.getElementById("heroBtns");
  if (!navActions) return;

  const renderLoggedOut = () => {
    navActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="position: relative; cursor: pointer; margin-right: 8px;" onclick="window.location.href='login.html'">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <a href="login.html" class="btn btn-secondary">Iniciar sesión</a>
        <a href="registro.html" class="btn btn-primary">Registrarse</a>
      </div>
    `;
  };

  const renderLoggedIn = async () => {
    const user = (await Auth.loadPerfil()) || Auth.getUsuario();
    if (!user) {
      renderLoggedOut();
      return;
    }

    let dashboardLink = "home.html";
    if (user.rol === "admin") dashboardLink = "admin.html";
    else if (user.rol === "productor")
      dashboardLink = "dashboard-productor.html";
    else if (user.rol === "comprador")
      dashboardLink = "dashboard-comprador.html";

    // Generar vista para usuario logueado
    navActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-dark, var(--text));">
          Hola, ${(user.nombre || "Usuario").split(" ")[0]}
        </span>
        
        <a href="${dashboardLink}" class="btn btn-secondary btn-sm" style="padding: 6px 12px;">Mi Panel</a>
        
        <div style="position: relative; cursor: pointer;" onclick="toggleCart()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span id="cart-badge" style="position: absolute; top: -8px; right: -8px; background: #da3633; color: white; border-radius: 50%; font-size: 0.7rem; font-weight: bold; width: 18px; height: 18px; display: none; align-items: center; justify-content: center;"></span>
        </div>
        
        <button onclick="Auth.logout()" class="btn btn-ghost btn-sm" style="padding: 6px; margin-left: 8px;" title="Cerrar sesión">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    `;

    if (window.Cart) {
      window.Cart.updateCartBadge();
    }
  };

  if (Auth.isLoggedIn()) {
    renderLoggedIn();
  } else {
    renderLoggedOut();
  }

  if (navLinks && Auth.isLoggedIn()) {
    const role = Auth.getRole();
    if (role === "comprador") {
      navLinks.innerHTML = `
        <a href="dashboard-comprador.html">Mi Panel</a>
        <a href="catalogo.html">Catálogo</a>
        <a href="pedidos.html">Mis Pedidos</a>
        <a href="mensajeria.html">Mensajes</a>
      `;
    } else if (role === "productor") {
      navLinks.innerHTML = `
        <a href="dashboard-productor.html">Mi Panel</a>
        <a href="dashboard-productor.html">Mis Productos</a>
        <a href="mensajeria.html">Mensajes</a>
      `;
    } else if (role === "admin") {
      navLinks.innerHTML = `
        <a href="admin.html">Mi Panel</a>
        <a href="admin.html">Usuarios</a>
        <a href="admin.html">Reportes</a>
      `;
    }
  }

  if (heroBtns && Auth.isLoggedIn()) {
    const role = Auth.getRole();
    let dashboardLink = "home.html";
    if (role === "admin") dashboardLink = "admin.html";
    else if (role === "productor") dashboardLink = "dashboard-productor.html";
    else if (role === "comprador") dashboardLink = "dashboard-comprador.html";

    heroBtns.innerHTML = `
      <a href="${dashboardLink}" class="btn btn-primary btn-lg">Ir a mi Panel →</a>
      ${role === "comprador" ? '<a href="catalogo.html" class="btn btn-secondary btn-lg">Ver catálogo</a>' : ""}
    `;
  }
});

// Función para abrir el carrito
function toggleCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.classList.toggle("open");
    if (window.renderCartItems) renderCartItems();
  } else {
    window.location.href = "catalogo.html?openCart=true";
  }
}

window.toggleCart = toggleCart;
