const BASE_URL = "http://localhost:8080/api";

class AgroMarketAPI {
  _getToken() {
    return localStorage.getItem("token");
  }

  _getUser() {
    const rol = localStorage.getItem("rol");
    const nombre = localStorage.getItem("nombre");
    if (!rol) return null;
    return { rol, nombre };
  }

  _headers(auth = true) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = this._getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async request(method, path, { body = null, auth = true, headers = {} } = {}) {
    const options = {
      method,
      headers: {
        ...this._headers(auth),
        "X-Requested-With": "XMLHttpRequest",
        ...headers,
      },
    };
    if (body !== null && body !== undefined) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${BASE_URL}${path}`, options);
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const payload = isJson ? await response.json() : null;

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("rol");
          localStorage.removeItem("nombre");
          localStorage.removeItem("userId");
          localStorage.removeItem("correo");
          window.location.href = "login.html";
        }
        throw {
          status: response.status,
          message:
            payload?.mensaje ||
            payload?.message ||
            "No se pudo completar la solicitud.",
          data: payload?.data || null,
          campos: payload?.campos || null,
        };
      }

      return payload?.data;
    } catch (error) {
      if (error.status !== undefined) {
        throw error;
      }
      throw {
        status: 0,
        message:
          "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
        data: null,
        campos: null,
      };
    }
  }

  _fetch(method, path, body = null, auth = true) {
    return this.request(method, path, { body, auth });
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

  sendVerification(correo) {
    return this._fetch("POST", "/auth/enviar-verificacion", { correo }, false);
  }

  verifyEmail(token) {
    return this._fetch("POST", "/auth/verificar", { token }, false);
  }

  getProductos(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this._fetch("GET", `/productos${suffix}`, null, false);
  }

  getProducto(id) {
    return this._fetch("GET", `/productos/${id}`, null, false);
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

  getMisProductos() {
    return this._fetch("GET", "/productos/mis-productos");
  }

  getPedidos() {
    return this._fetch("GET", "/pedidos");
  }

  crearPedido(productoId, cantidad) {
    return this._fetch("POST", "/pedidos", { productoId, cantidad });
  }

  getMisCompras() {
    return this._fetch("GET", "/pedidos/mis-compras");
  }

  getMisVentas() {
    return this._fetch("GET", "/pedidos/mis-ventas");
  }

  getPedidosAdmin() {
    return this._fetch("GET", "/pedidos");
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

  getFacturas() {
    return this._fetch("GET", "/facturas");
  }

  getMisEnvios() {
    return this._fetch("GET", "/envios/mis-envios");
  }

  getEnvioPorPedido(pedidoId) {
    return this._fetch("GET", `/envios/pedido/${pedidoId}`);
  }

  actualizarEnvio(id, body) {
    return this._fetch("PUT", `/envios/${id}`, body);
  }

  getContactos() {
    return this._fetch("GET", "/mensajes/contactos");
  }

  getConversacion(otroUserId) {
    return this._fetch("GET", `/mensajes/conversacion/${otroUserId}`);
  }

  enviarMensaje(destinatarioId, contenido) {
    return this._fetch("POST", "/mensajes", { destinatarioId, contenido });
  }

  getNoLeidosMensajes() {
    return this._fetch("GET", "/mensajes/no-leidos");
  }

  getResenas(productoId) {
    return this._fetch("GET", `/resenas/producto/${productoId}`, null, false);
  }

  getTodasResenas() {
    return this._fetch("GET", "/resenas", null, false);
  }

  crearResena(body) {
    return this._fetch("POST", "/resenas", body);
  }

  eliminarResena(id) {
    return this._fetch("DELETE", `/resenas/${id}`);
  }

  getNotificaciones() {
    return this._fetch("GET", "/notificaciones");
  }

  getNoLeidas() {
    return this._fetch("GET", "/notificaciones/no-leidas");
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

  getUsuarios() {
    return this._fetch("GET", "/admin/usuarios");
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
