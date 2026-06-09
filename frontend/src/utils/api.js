// File: frontend/src/utils/api.js

const API_BASE = window.__AGROMARKET_API_BASE__ || "/api";
const REQUESTED_WITH_HEADER = "XMLHttpRequest";

const _cache = new Map();

function _cacheSet(key, value, ttlMs) {
  const expires = Date.now() + ttlMs;
  _cache.set(key, { value, expires });
}

function _cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    _cache.delete(key);
    return null;
  }
  return entry.value;
}

export function getAuthToken() {
  return localStorage.getItem("am_token");
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("am_token", token);
  } else {
    localStorage.removeItem("am_token");
  }
}

export async function request(
  path,
  { method = "GET", params, body, headers = {}, cacheMs = 0, signal } = {},
) {
  const url = new URL(API_BASE + path, window.location.origin);
  if (params)
    Object.keys(params).forEach((k) => url.searchParams.append(k, params[k]));

  if (method === "GET" && cacheMs > 0) {
    const cached = _cacheGet(url.toString());
    if (cached) return cached;
  }

  const auth = getAuthToken();
  const baseHeaders = Object.assign(
    { "X-Requested-With": REQUESTED_WITH_HEADER },
    headers,
  );
  if (auth) baseHeaders["Authorization"] = "Bearer " + auth;

  const opts = { method, headers: baseHeaders, signal };
  if (body) {
    if (body instanceof FormData) {
      opts.body = body;
    } else {
      opts.body = JSON.stringify(body);
      opts.headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url.toString(), opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let json = null;
    try {
      json = JSON.parse(text || "{}");
    } catch (e) {
      json = { mensaje: text };
    }
    const err = new Error(json.mensaje || res.statusText || "Error");
    err.status = res.status;
    err.body = json;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  const result = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (method === "GET" && cacheMs > 0)
    _cacheSet(url.toString(), result, cacheMs);
  return result;
}

export function get(path, options = {}) {
  return request(path, Object.assign({ method: "GET" }, options));
}
export function post(path, body, options = {}) {
  return request(path, Object.assign({ method: "POST", body }, options));
}
export function put(path, body, options = {}) {
  return request(path, Object.assign({ method: "PUT", body }, options));
}
export function del(path, options = {}) {
  return request(path, Object.assign({ method: "DELETE" }, options));
}

export function uploadWithProgress(urlPath, file, onProgress, fieldName = "imagen") {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = getAuthToken();
    xhr.open("POST", API_BASE + urlPath, true);
    if (token) xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("X-Requested-With", REQUESTED_WITH_HEADER);
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable && onProgress)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error("Upload failed: " + xhr.status));
      }
    };
    xhr.onerror = function () {
      reject(new Error("Network error"));
    };
    const form = new FormData();
    form.append(fieldName, file);
    xhr.send(form);
  });
}

function isFormDataLike(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function isFileLike(value) {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  );
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function extractPayload(payload) {
  if (!payload || typeof payload !== "object") return payload;
  if (Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data;
  }
  return payload;
}

function extractMessage(payload, fallback) {
  if (!payload || typeof payload !== "object") return fallback;
  return (
    payload.mensaje ||
    payload.message ||
    payload.error ||
    payload.detail ||
    payload.description ||
    fallback
  );
}

function readJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
}

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

class AgroMarketAPI {
  _getToken() {
    return getAuthToken() || localStorage.getItem("token");
  }

  _getUser() {
    const rol = localStorage.getItem("rol");
    const nombre = localStorage.getItem("nombre");
    const fotoPerfil = localStorage.getItem("fotoPerfil");
    if (!rol) return null;
    return { rol, nombre, fotoPerfil };
  }

  _clearSession() {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  _headers(auth = true) {
    const headers = {
      Accept: "application/json",
      "X-Requested-With": REQUESTED_WITH_HEADER,
    };

    if (auth) {
      const token = this._getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  _buildUrl(path, query) {
    const suffix = query ? buildQuery(query) : "";
    return `${API_BASE}${path}${suffix}`;
  }

  async request(
    method,
    path,
    { body = null, auth = true, headers = {}, query = null } = {},
  ) {
    const requestHeaders = {
      ...this._headers(auth),
      ...headers,
    };

    const options = {
      method,
      headers: requestHeaders,
    };

    if (body !== null && body !== undefined) {
      if (isFormDataLike(body) || isFileLike(body)) {
        options.body = body;
        delete options.headers["Content-Type"];
      } else if (typeof body === "string") {
        options.body = body;
      } else {
        options.body = JSON.stringify(body);
        options.headers["Content-Type"] = "application/json";
      }
    }

    try {
      const response = await fetch(this._buildUrl(path, query), options);
      const contentType = response.headers.get("content-type") || "";
      const expectsJson = contentType.includes("application/json");
      const rawText = response.status === 204 ? "" : await response.text();
      const payload = expectsJson ? readJsonSafely(rawText) : rawText || null;

      if (!response.ok) {
        if (response.status === 401 && auth) {
          this._clearSession();
          window.location.href = "login.html";
        }

        throw {
          status: response.status,
          error:
            payload?.error ||
            payload?.message ||
            response.statusText ||
            "Error",
          message: extractMessage(
            payload,
            "No se pudo completar la solicitud.",
          ),
          mensaje: extractMessage(
            payload,
            "No se pudo completar la solicitud.",
          ),
          data: payload?.data ?? null,
          campos: payload?.campos || payload?.fields || null,
          timestamp: payload?.timestamp || null,
        };
      }

      return extractPayload(payload);
    } catch (error) {
      if (error && typeof error.status !== "undefined") {
        throw error;
      }

      throw {
        status: 0,
        error: "Network Error",
        message:
          "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
        mensaje:
          "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
        data: null,
        campos: null,
        timestamp: null,
      };
    }
  }

  _fetch(method, path, body = null, auth = true) {
    return this.request(method, path, { body, auth });
  }

  async uploadProductImage(productoId, file, onProgress = null) {
    if (!file) {
      throw {
        status: 0,
        error: "Validation",
        message: "Debes seleccionar una imagen válida.",
        mensaje: "Debes seleccionar una imagen válida.",
        data: null,
        campos: null,
      };
    }

    const formData = new FormData();
    formData.append("imagen", file, file.name || "imagen");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/productos/${productoId}/imagen`);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("X-Requested-With", REQUESTED_WITH_HEADER);

      const token = this._getToken();
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.responseType = "text";

      xhr.upload.onprogress = (event) => {
        if (typeof onProgress === "function" && event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        const contentType = xhr.getResponseHeader("content-type") || "";
        const responsePayload = contentType.includes("application/json")
          ? readJsonSafely(xhr.responseText)
          : xhr.responseText;

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(extractPayload(responsePayload));
          return;
        }

        if (xhr.status === 401) {
          this._clearSession();
          window.location.href = "login.html";
        }

        reject({
          status: xhr.status,
          error:
            responsePayload?.error ||
            responsePayload?.message ||
            xhr.statusText ||
            "Error",
          message: extractMessage(
            responsePayload,
            "No se pudo subir la imagen.",
          ),
          mensaje: extractMessage(
            responsePayload,
            "No se pudo subir la imagen.",
          ),
          data: responsePayload?.data ?? null,
          campos: responsePayload?.campos || responsePayload?.fields || null,
          timestamp: responsePayload?.timestamp || null,
        });
      };

      xhr.onerror = () => {
        reject({
          status: 0,
          error: "Network Error",
          message: "No se pudo conectar con el servidor.",
          mensaje: "No se pudo conectar con el servidor.",
          data: null,
          campos: null,
        });
      };

      xhr.send(formData);
    });
  }

  subirImagenProducto(productoId, file, onProgress) {
    return this.uploadProductImage(productoId, file, onProgress);
  }

  login(correo, contrasena) {
    return this._fetch("POST", "/auth/login", { correo, contrasena }, false);
  }

  login2FA(tempToken, codigo) {
    return this._fetch("POST", "/auth/login-2fa", { tempToken, codigo }, false);
  }

  initTwoFactorSetup() {
    return this._fetch("POST", "/auth/2fa/setup", {});
  }

  confirmTwoFactorSetup(codigo) {
    return this._fetch("POST", "/auth/2fa/confirm", { codigo });
  }

  disableTwoFactor(codigo) {
    return this._fetch("POST", "/auth/2fa/disable", { codigo });
  }

  getTwoFactorStatus() {
    return this._fetch("GET", "/auth/2fa/status");
  }

  registro(payload) {
    return this._fetch("POST", "/auth/registro", payload, false);
  }

  requestPasswordReset(correo) {
    return this._fetch("POST", "/auth/recuperar-contrasena", { correo }, false);
  }

  confirmPasswordReset(token, nuevaContrasena) {
    return this._fetch(
      "POST",
      "/auth/restablecer-contrasena",
      { token, nuevaContrasena },
      false,
    );
  }

  requestEmailVerification(correo) {
    return this._fetch(
      "POST",
      "/auth/reenviar-verificacion",
      { correo },
      false,
    );
  }

  resendVerification(correo) {
    return this.requestEmailVerification(correo);
  }

  sendVerification(correo) {
    return this._fetch("POST", "/auth/enviar-verificacion", { correo }, false);
  }

  verifyEmail(payloadOrToken) {
    if (typeof payloadOrToken === "string") {
      return this._fetch(
        "POST",
        "/auth/verificar",
        { token: payloadOrToken },
        false,
      );
    }
    return this._fetch("POST", "/auth/verificar-correo", payloadOrToken, false);
  }

  verifyEmailCode(correo, codigo) {
    return this._fetch(
      "POST",
      "/auth/verificar-correo",
      { correo, codigo },
      false,
    );
  }

  getProductos(params = {}) {
    return this.request("GET", "/productos", { auth: false, query: params });
  }

  getProducto(id) {
    return this.request("GET", `/productos/${id}`, { auth: false });
  }

  crearProducto(body) {
    return this._fetch("POST", "/productos", body);
  }

  actualizarProducto(id, body) {
    return this._fetch("PUT", `/productos/${id}`, body);
  }

  eliminarProducto(id) {
    return this._fetch("DELETE", `/productos/${id}`);
  }

  getMisProductos(params = {}) {
    return this.request("GET", "/productos/mis-productos", { query: params });
  }

  getPedidos(params = {}) {
    return this.request("GET", "/pedidos", { query: params });
  }

  crearPedido(productoId, cantidad) {
    return this._fetch("POST", "/pedidos", { productoId, cantidad });
  }

  getMisCompras(params = {}) {
    return this.request("GET", "/pedidos/mis-compras", { query: params });
  }

  getMisVentas(params = {}) {
    return this.request("GET", "/pedidos/mis-ventas", { query: params });
  }

  getPedidosAdmin(params = {}) {
    return this.request("GET", "/pedidos", { query: params });
  }

  avanzarPedido(id) {
    return this._fetch("PUT", `/pedidos/${id}/avanzar`);
  }

  cancelarPedido(id) {
    return this._fetch("PUT", `/pedidos/${id}/cancelar`);
  }

  procesarPago(body) {
    return this._fetch("POST", "/pagos", body);
  }

  getPagoPorPedido(pedidoId) {
    return this._fetch("GET", `/pagos/pedido/${pedidoId}`);
  }

  getFacturaPorPedido(pedidoId) {
    return this._fetch("GET", `/facturas/pedido/${pedidoId}`);
  }

  getMisEnvios(params = {}) {
    return this.request("GET", "/envios/mis-envios", { query: params });
  }

  getEnvioPorPedido(pedidoId) {
    return this._fetch("GET", `/envios/pedido/${pedidoId}`);
  }

  actualizarEnvio(id, body) {
    return this._fetch("PUT", `/envios/${id}`, body);
  }

  getContactos(params = {}) {
    return this.request("GET", "/mensajes/contactos", { query: params });
  }

  getConversacion(otroUserId, params = {}) {
    return this.request("GET", `/mensajes/conversacion/${otroUserId}`, {
      query: params,
    });
  }

  enviarMensaje(destinatarioId, contenido) {
    return this._fetch("POST", "/mensajes", { destinatarioId, contenido });
  }

  getNoLeidosMensajes() {
    return this._fetch("GET", "/mensajes/no-leidos");
  }

  getResenas(productoId, params = {}) {
    return this.request("GET", `/resenas/producto/${productoId}`, {
      auth: false,
      query: params,
    });
  }

  crearResena(body) {
    return this._fetch("POST", "/resenas", body);
  }

  eliminarResena(id) {
    return this._fetch("DELETE", `/resenas/${id}`);
  }

  getNotificaciones(params = {}) {
    return this.request("GET", "/notificaciones", { query: params });
  }

  getNoLeidas(params = {}) {
    return this.request("GET", "/notificaciones/no-leidas", { query: params });
  }

  marcarTodasLeidas() {
    return this._fetch("PUT", "/notificaciones/leer-todas");
  }

  getMe() {
    return this._fetch("GET", "/usuarios/me");
  }

  getPerfil() {
    return this.getMe();
  }

  actualizarMe(body) {
    return this._fetch("PUT", "/usuarios/me", body);
  }

  actualizarPerfil(body) {
    return this.actualizarMe(body);
  }

  actualizarContrasena(body) {
    return this._fetch("PUT", "/usuarios/me/contrasena", body);
  }

  getDashboard() {
    return this._fetch("GET", "/admin/dashboard");
  }

  getEstadisticasAdmin() {
    return this.getDashboard();
  }

  getUsuarios(params = {}) {
    return this.request("GET", "/admin/usuarios", { query: params });
  }

  aprobarUsuario(id) {
    return this._fetch("POST", `/admin/usuarios/${id}/aprobar`);
  }

  habilitarUsuario(id) {
    return this._fetch("PUT", `/usuarios/${id}/habilitar`);
  }

  deshabilitarUsuario(id) {
    return this._fetch("PUT", `/usuarios/${id}/deshabilitar`);
  }
}

const api = new AgroMarketAPI();

export default api;
