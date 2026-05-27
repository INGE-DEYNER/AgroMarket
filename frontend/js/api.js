const BASE_URL = "http://localhost:8080/api";

class AgroMarketAPI {
  _getToken() {
    return localStorage.getItem("agro_token");
  }

  _getUser() {
    return JSON.parse(localStorage.getItem("agro_user") || "null");
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

  async _fetch(method, path, body = null, auth = true) {
    const options = { method, headers: this._headers(auth) };
    if (body !== null && body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
      if (
        response.status === 401 &&
        window.Auth &&
        typeof window.Auth.logout === "function"
      ) {
        window.Auth.logout();
      }
      throw {
        status: response.status,
        message: payload?.message || "Error",
        data: payload?.data || null,
      };
    }

    return payload?.data;
  }

  login(correo, contrasena) {
    return this._fetch("POST", "/auth/login", { correo, contrasena }, false);
  }

  registro(payload) {
    return this._fetch("POST", "/auth/registro", payload, false);
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

  actualizarMe(body) {
    return this._fetch("PUT", "/usuarios/me", body);
  }

  getDashboard() {
    return this._fetch("GET", "/admin/dashboard");
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
