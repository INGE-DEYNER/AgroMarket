/**
 * api.js — Utilidad central de peticiones HTTP para AgroMarket
 */

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

const API_BASE = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
/**
 * Decodifica el JWT y devuelve true si ya expiró.
 * No realiza ninguna petición al servidor.
 */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("agromarket_cart");
}

async function request(method, path, body) {
  const token = localStorage.getItem("token");

  /*
   * Verificación client-side antes de realizar el fetch.
   */
  if (token && isTokenExpired(token)) {
    clearSession();

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw Object.assign(
      new Error("Sesión expirada. Por favor inicia sesión nuevamente."),
      { status: 401 },
    );
  }

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const userGeminiKey = localStorage.getItem("user_gemini_key");

  if (userGeminiKey) {
    headers["X-Gemini-Key"] = userGeminiKey;
  }

  let requestBody;

  if (body !== undefined) {
    if (body instanceof FormData) {
      requestBody = body;
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  let res;

  // Define which endpoints should include credentials
  const shouldIncludeCredentials = !(
    path.startsWith("/public/") ||
    path.startsWith("/divisas/") ||
    path.startsWith("/productos/") ||
    path.startsWith("/resenas/") ||
    path.startsWith("/actuator/")
  );

  try {
    const fetchOptions = {
      method,
      headers,
      ...(requestBody !== undefined ? { body: requestBody } : {}),
    };

    if (shouldIncludeCredentials) {
      fetchOptions.credentials = "include";
    }

    res = await fetch(`${API_BASE}${path}`, fetchOptions);

    /*
     * La conexión volvió a funcionar.
     */
    window.dispatchEvent(new CustomEvent("agromarket:network-ok"));
  } catch {
    /*
     * Fallo real de red:
     * - servidor apagado
     * - internet desconectado
     * - CORS/preflight
     * - conexión rechazada
     */
    window.dispatchEvent(new CustomEvent("agromarket:network-error"));

    throw Object.assign(
      new Error("Sin conexión. Verifica tu internet e intenta de nuevo."),
      {
        status: 0,
        isNetworkError: true,
      },
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      message: res.statusText,
    }));

    /*
     * 401 del backend:
     * token inválido, expirado o rechazado.
     * Las rutas públicas (/public/*, /divisas/*, etc.) no deben
     * redirigir al login aunque fallen con 401.
     */
    if (res.status === 401) {
      const isAuthEndpoint = path.startsWith("/auth/");
      const isPublicEndpoint =
        path.startsWith("/public/") ||
        path.startsWith("/divisas/") ||
        path.startsWith("/productos/") ||
        path.startsWith("/resenas/");
      const isOnLoginPage = window.location.pathname === "/login";

      if (!isAuthEndpoint && !isPublicEndpoint && !isOnLoginPage) {
        clearSession();
        window.location.href = "/login";
      }
    }

    throw Object.assign(
      new Error(err.message || err.mensaje || `HTTP ${res.status}`),
      {
        status: res.status,
        campos: err.campos || null,
        fieldErrors: err.fieldErrors || null,
        ...err,
      },
    );
  }

  return res.status === 204 ? null : res.json();
}

const api = {
  get: (path) => request("GET", path),

  post: (path, body) => request("POST", path, body),

  put: (path, body) => request("PUT", path, body),

  delete: (path) => request("DELETE", path),

  patch: (path, body) => request("PATCH", path, body),
};

export default api;

export { API_BASE };
