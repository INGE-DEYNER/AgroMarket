const BASE_URL = "http://localhost:8080/api";
const REQUESTED_WITH_HEADER = "XMLHttpRequest";

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

class AgroMarketAPI {
  _getToken() {
    return localStorage.getItem("token");
  }

  _getUser() {
    const rol = localStorage.getItem("rol");
    const nombre = localStorage.getItem("nombre");
    const fotoPerfil = localStorage.getItem("fotoPerfil");
    if (!rol) return null;
    return { rol, nombre, fotoPerfil };
  }

  _clearSession() {
    localStorage.clear();
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
    return `${BASE_URL}${path}${suffix}`;
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
      xhr.open("POST", `${BASE_URL}/productos/${productoId}/imagen`);
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

  login(correo, contrasena) {
    return this._fetch("POST", "/auth/login", { correo, contrasena }, false);
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

  getFacturas(params = {}) {
    return this.request("GET", "/facturas", { query: params });
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

  getTodasResenas(params = {}) {
    return this.request("GET", "/resenas", { auth: false, query: params });
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

  getDashboard() {
    return this._fetch("GET", "/admin/dashboard");
  }

  getEstadisticasAdmin() {
    return this.getDashboard();
  }

  getUsuarios(params = {}) {
    return this.request("GET", "/admin/usuarios", { query: params });
  }

  habilitarUsuario(id) {
    return this._fetch("PUT", `/usuarios/${id}/habilitar`);
  }

  deshabilitarUsuario(id) {
    return this._fetch("PUT", `/usuarios/${id}/deshabilitar`);
  }
}

const api = new AgroMarketAPI();

window.api = api;

export default api;
