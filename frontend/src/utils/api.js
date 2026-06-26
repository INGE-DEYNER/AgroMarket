/**
 * api.js — Utilidad central de peticiones HTTP para AgroMarket
 */

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

/** Decodifica el JWT y devuelve true si ya expiró — sin llamar al servidor */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now(); // exp en segundos, Date.now() en ms
  } catch {
    return true; // Si no se puede decodificar, tratar como expirado
  }
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('agromarket_cart');
}

async function request(method, path, body) {
  const token = localStorage.getItem('token');

  // Verificación client-side ANTES de cualquier fetch — elimina el flash
  // Cuando el token expira, el usuario ve /login directamente sin flicker
  if (token && isTokenExpired(token)) {
    clearSession();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw Object.assign(
      new Error('Sesión expirada. Por favor inicia sesión nuevamente.'),
      { status: 401 }
    );
  }

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let requestBody;
  if (body !== undefined) {
    if (body instanceof FormData) {
      requestBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    ...(requestBody !== undefined ? { body: requestBody } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    // 401 del servidor (token inválido por rotación de key, etc.) — misma acción
    if (res.status === 401) {
      const isAuthEndpoint = path.startsWith('/auth/');
      const isOnLoginPage = window.location.pathname === '/login';
      if (!isAuthEndpoint && !isOnLoginPage) {
        clearSession();
        window.location.href = '/login';
      }
    }
    throw Object.assign(new Error(err.message || `HTTP ${res.status}`), { status: res.status });
  }
  return res.status === 204 ? null : res.json();
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;
export { API_BASE };
