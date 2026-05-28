import api from "./api.js";

const SESSION_KEYS = [
  "token",
  "rol",
  "nombre",
  "userId",
  "correo",
  "fotoPerfil",
];

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
  localStorage.clear();
}

function redirectToLogin() {
  window.location.href = "login.html";
}

function guardarSesion(authResponse) {
  const source =
    authResponse?.data && typeof authResponse.data === "object"
      ? authResponse.data
      : authResponse;
  if (!source) return;

  const rolNormalizado = normalizarRol(
    source.rol || source.role || source.tipo,
  );
  if (source.token) {
    localStorage.setItem("token", source.token);
  }
  localStorage.setItem("rol", rolNormalizado);
  if (source.nombre) {
    localStorage.setItem("nombre", source.nombre);
  }
  if (source.userId !== undefined && source.userId !== null) {
    localStorage.setItem("userId", String(source.userId));
  }
  if (source.correo) {
    localStorage.setItem("correo", source.correo);
  }
  if (source.fotoPerfil) {
    localStorage.setItem("fotoPerfil", source.fotoPerfil);
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
  const fotoPerfil = localStorage.getItem("fotoPerfil");

  return {
    id: userId ? Number(userId) : null,
    nombre: nombre || "Usuario",
    correo: correo || "",
    rol: normalizarRol(rol),
    fotoPerfil: fotoPerfil || "",
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

function getProfilePhoto() {
  return localStorage.getItem("fotoPerfil") || "";
}

function getDisplayName() {
  return getUsuario()?.nombre || "Usuario";
}

function getInitials(nombre = "") {
  return String(nombre)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function hasRole(rolesPermitidos = []) {
  const usuario = getUsuario();
  if (!usuario) return false;
  if (!rolesPermitidos.length) return true;
  return rolesPermitidos.map(normalizarRol).includes(usuario.rol);
}

function requireRole(rolesPermitidos = []) {
  const usuario = getUsuario();
  if (!usuario) {
    redirectToLogin();
    return null;
  }

  if (rolesPermitidos.length > 0 && !hasRole(rolesPermitidos)) {
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
        fotoPerfil:
          perfil.fotoPerfil || perfil.avatarUrl || stored?.fotoPerfil || "",
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
  getProfilePhoto,
  getDisplayName,
  getInitials,
  hasRole,
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
  getProfilePhoto,
  getDisplayName,
  getInitials,
  hasRole,
};

export default Auth;
