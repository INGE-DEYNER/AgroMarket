/**
 * api.js
 * Cliente HTTP central de AgroMarket.
 */

const rawApiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const API_BASE = rawApiUrl.replace(/\/+$/, "");

const PUBLIC_PATHS = [
  "/auth",
  "/public",
  "/divisas",
  "/productos",
  "/resenas",
  "/actuator",
];

function getPathname(path) {
  if (!path) {
    return "/";
  }

  return path.split("?")[0].replace(/\/+$/, "") || "/";
}

function isPublicEndpoint(path) {
  const pathname = getPathname(path);

  return PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`),
  );
}

function decodeJwtPayload(token) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("JWT inválido");
  }

  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(""),
  );

  return JSON.parse(json);
}

function isTokenExpired(token) {
  try {
    const payload = decodeJwtPayload(token);

    if (!payload.exp) {
      return false;
    }

    return Number(payload.exp) * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("agromarket_cart");
}

async function request(method, path, body) {
  const publicEndpoint = isPublicEndpoint(path);

  const token = localStorage.getItem("token");

  if (token && !publicEndpoint && isTokenExpired(token)) {
    clearSession();

    throw Object.assign(
      new Error("Sesión expirada. Por favor inicia sesión nuevamente."),
      {
        status: 401,
        isAuthenticationError: true,
      },
    );
  }

  const headers = {};

  /*
   * Los endpoints públicos no reciben JWT.
   */
  if (token && !publicEndpoint) {
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

  let response;

  try {
    const options = {
      method,
      headers,
    };

    if (requestBody !== undefined) {
      options.body = requestBody;
    }

    if (!publicEndpoint) {
      options.credentials = "include";
    }

    response = await fetch(`${API_BASE}${path}`, options);

    window.dispatchEvent(new CustomEvent("agromarket:network-ok"));
  } catch (error) {
    window.dispatchEvent(new CustomEvent("agromarket:network-error"));

    throw Object.assign(
      new Error(
        "Sin conexión. Verifica que el backend y el frontend estén ejecutándose.",
      ),
      {
        status: 0,
        isNetworkError: true,
        cause: error,
      },
    );
  }

  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message ||
          data.mensaje ||
          data.error ||
          `HTTP ${response.status}`
        : data || `HTTP ${response.status}`;

    throw Object.assign(new Error(message), {
      status: response.status,
      campos: data?.campos || null,
      fieldErrors: data?.fieldErrors || null,
      response: {
        status: response.status,
        data,
      },
    });
  }

  return data;
}

const api = {
  get: (path) => request("GET", path),

  post: (path, body) => request("POST", path, body),

  put: (path, body) => request("PUT", path, body),

  patch: (path, body) => request("PATCH", path, body),

  delete: (path) => request("DELETE", path),
};

export default api;

export { API_BASE };
