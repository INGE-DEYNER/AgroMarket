import Auth from "./auth.js";
import { escapeHtml } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const navActions = document.getElementById("navActions");
  const navLinks = document.getElementById("navLinks");
  const heroBtns = document.getElementById("heroBtns");
  if (!navActions) return;

  const closeDropdown = () => {
    document.querySelectorAll("[data-profile-menu]").forEach((menu) => {
      menu.hidden = true;
    });
  };

  const renderLoggedOut = () => {
    navActions.replaceChildren();

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "12px";

    const iconButton = document.createElement("button");
    iconButton.type = "button";
    iconButton.setAttribute("aria-label", "Iniciar sesión");
    iconButton.style.cssText =
      "background:transparent;border:0;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-right:8px;";
    iconButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    `;
    iconButton.addEventListener("click", () => {
      window.location.href = "login.html";
    });

    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.className = "btn btn-secondary";
    loginLink.textContent = "Iniciar sesión";

    const registerLink = document.createElement("a");
    registerLink.href = "registro.html";
    registerLink.className = "btn btn-primary";
    registerLink.textContent = "Registrarse";

    wrapper.append(iconButton, loginLink, registerLink);
    navActions.appendChild(wrapper);
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

    navActions.replaceChildren();

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "14px";

    const greeting = document.createElement("span");
    greeting.style.fontWeight = "600";
    greeting.style.fontSize = "0.9rem";
    greeting.style.color = "var(--text-dark, var(--text))";
    greeting.textContent = `Hola, ${(user.nombre || "Usuario").split(" ")[0]}`;

    const panelLink = document.createElement("a");
    panelLink.href = dashboardLink;
    panelLink.className = "btn btn-secondary btn-sm";
    panelLink.style.padding = "6px 12px";
    panelLink.textContent = "Mi Panel";

    const cartButton = document.createElement("button");
    cartButton.type = "button";
    cartButton.setAttribute("aria-label", "Abrir carrito");
    cartButton.style.cssText =
      "position:relative;cursor:pointer;background:transparent;border:0;padding:0;";
    cartButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span id="cart-badge" style="position:absolute;top:-8px;right:-8px;background:#da3633;color:white;border-radius:50%;font-size:0.7rem;font-weight:bold;width:18px;height:18px;display:none;align-items:center;justify-content:center;"></span>
    `;
    cartButton.addEventListener("click", () => toggleCart());

    const profileWrap = document.createElement("div");
    profileWrap.style.position = "relative";

    const profileButton = document.createElement("button");
    profileButton.type = "button";
    profileButton.setAttribute("aria-haspopup", "menu");
    profileButton.setAttribute("aria-expanded", "false");
    profileButton.style.cssText =
      "width:42px;height:42px;border-radius:999px;border:1px solid rgba(45,106,79,.2);background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.08);";

    const photo = user.fotoPerfil || Auth.getProfilePhoto();
    if (photo) {
      const img = document.createElement("img");
      img.src = photo;
      img.alt = `Foto de ${escapeHtml(user.nombre || "usuario")}`;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;";
      profileButton.appendChild(img);
    } else {
      const initials = document.createElement("span");
      initials.textContent = Auth.getInitials(user.nombre || "Usuario");
      initials.style.cssText =
        "display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,#2d6a4f,#40916c);color:#fff;font-weight:800;font-size:0.8rem;";
      profileButton.appendChild(initials);
    }

    const menu = document.createElement("div");
    menu.dataset.profileMenu = "true";
    menu.hidden = true;
    menu.style.cssText =
      "position:absolute;right:0;top:calc(100% + 10px);min-width:220px;background:#fff;border:1px solid rgba(45,106,79,.14);border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.12);padding:10px;z-index:30;";

    const menuHeader = document.createElement("div");
    menuHeader.style.cssText =
      "padding:10px 12px 12px;border-bottom:1px solid rgba(45,106,79,.12);margin-bottom:8px;";

    const nameEl = document.createElement("div");
    nameEl.style.cssText = "font-weight:700;color:var(--text-dark, #123);";
    nameEl.textContent = user.nombre || "Usuario";

    const roleEl = document.createElement("div");
    roleEl.style.cssText =
      "font-size:0.82rem;color:var(--text-muted, #6b7280);margin-top:4px;";
    roleEl.textContent = (user.rol || "comprador").toString();

    menuHeader.append(nameEl, roleEl);

    const menuList = document.createElement("div");
    menuList.style.display = "grid";
    menuList.style.gap = "6px";

    const menuItem = (text, href, bold = false) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      link.style.cssText = `padding:10px 12px;border-radius:12px;text-decoration:none;color:var(--text-dark, #123);font-weight:${bold ? 700 : 500};display:block;`;
      link.addEventListener("mouseenter", () => {
        link.style.background = "rgba(45, 106, 79, 0.08)";
      });
      link.addEventListener("mouseleave", () => {
        link.style.background = "transparent";
      });
      return link;
    };

    menuList.append(
      menuItem("Ver panel", dashboardLink, true),
      menuItem("Mi perfil", "perfil.html"),
    );

    const logoutBtn = document.createElement("button");
    logoutBtn.type = "button";
    logoutBtn.textContent = "Cerrar sesión";
    logoutBtn.style.cssText =
      "margin-top:6px;width:100%;padding:10px 12px;border-radius:12px;border:0;background:#fef2f2;color:#991b1b;font-weight:700;cursor:pointer;text-align:left;";
    logoutBtn.addEventListener("click", () => Auth.logout());

    menu.append(menuHeader, menuList, logoutBtn);

    profileButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = menu.hidden;
      closeDropdown();
      menu.hidden = !shouldOpen;
      profileButton.setAttribute(
        "aria-expanded",
        shouldOpen ? "true" : "false",
      );
    });

    profileWrap.append(profileButton, menu);
    wrapper.append(greeting, panelLink, cartButton, profileWrap);
    navActions.appendChild(wrapper);

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
    const appendLink = (href, text) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      navLinks.appendChild(link);
    };

    navLinks.replaceChildren();
    if (role === "comprador") {
      appendLink("dashboard-comprador.html", "Mi Panel");
      appendLink("catalogo.html", "Catálogo");
      appendLink("pedidos.html", "Mis Pedidos");
      appendLink("mensajeria.html", "Mensajes");
    } else if (role === "productor") {
      appendLink("dashboard-productor.html", "Mi Panel");
      appendLink("dashboard-productor.html", "Mis Productos");
      appendLink("mensajeria.html", "Mensajes");
    } else if (role === "admin") {
      appendLink("admin.html", "Mi Panel");
      appendLink("admin.html", "Usuarios");
      appendLink("admin.html", "Reportes");
    }
  }

  if (heroBtns && Auth.isLoggedIn()) {
    const role = Auth.getRole();
    let dashboardLink = "home.html";
    if (role === "admin") dashboardLink = "admin.html";
    else if (role === "productor") dashboardLink = "dashboard-productor.html";
    else if (role === "comprador") dashboardLink = "dashboard-comprador.html";

    heroBtns.replaceChildren();

    const panelBtn = document.createElement("a");
    panelBtn.href = dashboardLink;
    panelBtn.className = "btn btn-primary btn-lg";
    panelBtn.textContent = "Ir a mi Panel →";

    heroBtns.appendChild(panelBtn);

    if (role === "comprador") {
      const catalogBtn = document.createElement("a");
      catalogBtn.href = "catalogo.html";
      catalogBtn.className = "btn btn-secondary btn-lg";
      catalogBtn.textContent = "Ver catálogo";
      heroBtns.appendChild(catalogBtn);
    }
  }

  document.addEventListener("click", closeDropdown);
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
