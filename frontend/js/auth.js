import api from "./api.js";

const SESSION_KEYS = ["token", "rol", "nombre", "userId", "correo"];

function normalizarRol(rol) {
  const value = String(rol || "").toUpperCase();
  if (value === "ADMINISTRADOR" || value === "ADMIN") return "admin";
  if (value === "PRODUCTOR") return "productor";
  if (value === "COMPRADOR") return "comprador";
  return String(rol || "").toLowerCase();
}

function resolveDashboardRoute(rol) {
  const normalized = normalizarRol(rol);
  const routes = {
    admin: "admin.html",
    productor: "dashboard-productor.html",
    comprador: "dashboard-comprador.html",
  };
  return routes[normalized] || "home.html";
}

function clearSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}

function redirectToLogin() {
  window.location.href = "login.html";
}

function guardarSesion(authResponse) {
  if (!authResponse) return;
  const rolNormalizado = normalizarRol(
    authResponse.rol || authResponse.role || authResponse.tipo,
  );
  localStorage.setItem("token", authResponse.token);
  localStorage.setItem("rol", rolNormalizado);
  if (authResponse.nombre) {
    localStorage.setItem("nombre", authResponse.nombre);
  }
  if (authResponse.userId !== undefined && authResponse.userId !== null) {
    localStorage.setItem("userId", String(authResponse.userId));
  }
  if (authResponse.correo) {
    localStorage.setItem("correo", authResponse.correo);
  }
}

function getToken() {
  return localStorage.getItem("token");
}

function getUsuario() {
  const token = getToken();
  if (!token) return null;

  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre");
  const userId = localStorage.getItem("userId");
  const correo = localStorage.getItem("correo");

  return {
    id: userId ? Number(userId) : null,
    nombre: nombre || "Usuario",
    correo: correo || "",
    rol: normalizarRol(rol),
  };
}

function isLoggedIn() {
  return Boolean(getToken());
}

function getRole() {
  return localStorage.getItem("rol") || null;
}

function cerrarSesion() {
  clearSession();
  redirectToLogin();
}

function logout() {
  cerrarSesion();
}

function requireRole(rolesPermitidos = []) {
  const usuario = getUsuario();
  if (!usuario) {
    redirectToLogin();
    return null;
  }

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
    redirectToLogin();
    return null;
  }

  return usuario;
}

async function loadPerfil({ force = false } = {}) {
  if (!isLoggedIn()) return null;

  const stored = getUsuario();
  if (stored && stored.nombre && !force) {
    return stored;
  }

  try {
    const perfil = await api.getPerfil();
    if (perfil) {
      guardarSesion({
        token: getToken(),
        rol: perfil.rol || stored?.rol,
        nombre: perfil.nombre || stored?.nombre,
        userId: perfil.id || perfil.userId || stored?.id || "",
        correo: perfil.correo || stored?.correo || "",
      });
    }
    return getUsuario();
  } catch (error) {
    if (error?.status === 401) {
      clearSession();
      redirectToLogin();
      return null;
    }
    return stored;
  }
}

function limpiarSesionSiAuthFalla() {
  clearSession();
  redirectToLogin();
}

function inicializarSesionDesdeBackend(authResponse) {
  guardarSesion(authResponse);
}

const Auth = {
  guardarSesion,
  getToken,
  getUsuario,
  getUser: getUsuario,
  isLoggedIn,
  getRole,
  cerrarSesion,
  logout,
  requireRole,
  limpiarSesionSiAuthFalla,
  normalizarRol,
  inicializarSesionDesdeBackend,
  resolveDashboardRoute,
  clearSession,
  loadPerfil,
};

window.Auth = Auth;

export {
  guardarSesion,
  getToken,
  getUsuario,
  isLoggedIn,
  getRole,
  cerrarSesion,
  logout,
  requireRole,
  limpiarSesionSiAuthFalla,
  normalizarRol,
  inicializarSesionDesdeBackend,
  resolveDashboardRoute,
  clearSession,
  loadPerfil,
};

export default Auth;
