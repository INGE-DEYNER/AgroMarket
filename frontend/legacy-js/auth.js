// File: frontend/js/auth.js
import api, {
  getAuthToken as getApiAuthToken,
  setAuthToken as setApiAuthToken,
} from "./api.js";

const SESSION_KEYS = [
  "am_token",
  "token",
  "am_user",
  "rol",
  "nombre",
  "userId",
  "correo",
  "fotoPerfil",
];

function setSessionToken(token) {
  if (token) {
    setApiAuthToken(token);
    localStorage.setItem("token", token);
    return;
  }
  setApiAuthToken(null);
  localStorage.removeItem("token");
}

function getToken() {
  const token = getApiAuthToken() || localStorage.getItem("token");
  // Keep both token keys in sync while legacy scripts still exist.
  if (token && !getApiAuthToken()) {
    setApiAuthToken(token);
  }
  return token;
}

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
  const source =
    authResponse?.data && typeof authResponse.data === "object"
      ? authResponse.data
      : authResponse;
  if (!source) return;

  const rolNormalizado = normalizarRol(
    source.rol || source.role || source.tipo,
  );
  if (source.token) setSessionToken(source.token);
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

function getCurrentUser() {
  try {
    const stored = JSON.parse(localStorage.getItem("am_user") || "null");
    if (stored) {
      return {
        ...stored,
        rol: normalizarRol(stored.rol || stored.role || stored.tipo),
      };
    }
  } catch (_error) {
    // Ignore invalid JSON and fallback to role-based session keys.
  }

  const user = getUsuario();
  if (!user) return null;

  return {
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    fotoPerfil: user.fotoPerfil,
    userId: user.id,
  };
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem("am_user");
    localStorage.removeItem("nombre");
    localStorage.removeItem("correo");
    localStorage.removeItem("rol");
    localStorage.removeItem("fotoPerfil");
    localStorage.removeItem("userId");
    return;
  }

  const normalizedRole = normalizarRol(user.rol || user.role || "comprador");
  const normalizedUser = {
    ...user,
    rol: normalizedRole,
  };

  localStorage.setItem("am_user", JSON.stringify(normalizedUser));
  localStorage.setItem("rol", normalizedRole);
  localStorage.setItem("nombre", normalizedUser.nombre || "Usuario");
  localStorage.setItem("correo", normalizedUser.correo || "");

  if (normalizedUser.fotoPerfil || normalizedUser.fotoUrl) {
    localStorage.setItem(
      "fotoPerfil",
      normalizedUser.fotoPerfil || normalizedUser.fotoUrl,
    );
  }

  const id = normalizedUser.userId ?? normalizedUser.id;
  if (id !== undefined && id !== null) {
    localStorage.setItem("userId", String(id));
  }
}

function isAuthenticated() {
  return Boolean(getToken());
}

async function login(email, password) {
  const authResponse = await api.login(email, password);
  const source = authResponse?.data ?? authResponse;
  if (source?.twoFactorRequired) {
    return source;
  }
  guardarSesion(source);
  setCurrentUser({
    nombre: source?.nombre,
    correo: source?.correo,
    rol: source?.rol,
    fotoPerfil: source?.fotoPerfil || source?.fotoUrl,
    userId: source?.userId,
  });
  return source;
}

async function register(user) {
  return api.registro(user);
}

function isLoggedIn() {
  return Boolean(getToken());
}

function getRole() {
  const rol = localStorage.getItem("rol");
  return rol ? normalizarRol(rol) : null;
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
  login,
  register,
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
  login,
  register,
  guardarSesion,
  getToken,
  getUsuario,
  getCurrentUser,
  setCurrentUser,
  isAuthenticated,
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
