import api from "./api.js";

const STORAGE_TOKEN = "agro_token";
const STORAGE_USER = "agro_user";

function normalizarRol(rol) {
  const value = String(rol || "").toUpperCase();
  if (value === "ADMINISTRADOR" || value === "ADMIN") return "admin";
  if (value === "PRODUCTOR") return "productor";
  if (value === "COMPRADOR") return "comprador";
  return String(rol || "").toLowerCase();
}

function guardarSesion(authResponse) {
  if (!authResponse) return;
  const usuario = {
    id:
      authResponse.idUsuario ??
      authResponse.userId ??
      authResponse.usuarioId ??
      null,
    nombre:
      authResponse.nombre ||
      authResponse.name ||
      authResponse.usuario ||
      authResponse.correo ||
      "Usuario",
    correo: authResponse.correo,
    rol: normalizarRol(
      authResponse.rol || authResponse.role || authResponse.tipo,
    ),
  };
  localStorage.setItem(STORAGE_TOKEN, authResponse.token);
  localStorage.setItem(STORAGE_USER, JSON.stringify(usuario));
}

function getToken() {
  return localStorage.getItem(STORAGE_TOKEN);
}

function getUsuario() {
  return JSON.parse(localStorage.getItem(STORAGE_USER) || "null");
}

function isLoggedIn() {
  return Boolean(getToken() && getUsuario());
}

function getRole() {
  return getUsuario()?.rol || null;
}

function cerrarSesion() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
  window.location.href = "login.html";
}

function logout() {
  cerrarSesion();
}

function requireRole(rolesPermitidos = []) {
  const usuario = getUsuario();
  if (!usuario) {
    window.location.href = "login.html";
    return null;
  }

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
    window.location.href = "login.html";
    return null;
  }

  return usuario;
}

function limpiarSesionSiAuthFalla() {
  cerrarSesion();
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
};

export default Auth;
