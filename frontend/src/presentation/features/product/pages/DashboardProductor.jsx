import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import api, { API_BASE } from "@/infrastructure/http/api";
import "@/presentation/styles/envios.css";
import "@/presentation/styles/mensajeria.css";

const TIPOS = [
  "Banano",
  "PiÃ±a",
  "Mango",
  "MaracuyÃ¡",
  "GuanÃ¡bana",
  "Naranja",
  "Coco",
  "LimÃ³n",
];

export default function DashboardProductor() {
  const { t } = useTranslation();
  const extractArray = useCallback((res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (res.data.content && Array.isArray(res.data.content))
        return res.data.content;
    }
    if (res.content && Array.isArray(res.content)) return res.content;
    return [];
  }, []);
  const { user, setUser, logout, formatPrice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation state
  const [activeSection, setActiveSection] = useState("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sec = params.get("section");
    if (sec) {
      setActiveSection(sec);
    }
  }, [location.search]);

  // Product and sales state
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "Banano",
    precio: "",
    stock: "",
    descripcion: "",
    imagenUrl: "",
    cantidadMinimaMayorista: "",
    precioMayorista: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  // RFQ (Licitaciones) states
  const [activeRfqs, setActiveRfqs] = useState([]);
  const [biddingRfq, setBiddingRfq] = useState(null);
  const [bidForm, setBidForm] = useState({
    precioPropuesto: "",
    comentarios: "",
  });
  const [bidMsg, setBidMsg] = useState({ type: "", text: "" });

  // Shipments (Despachos) state
  const [shipments, setShipments] = useState([]);
  const [updateShipmentModalOpen, setUpdateShipmentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [updateShipmentForm, setUpdateShipmentForm] = useState({
    transportista: "",
    guia: "",
    fechaEstimadaEntrega: "",
    estado: "",
  });

  // Chat/Mensajeria state
  const [contactos, setContactos] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const chatRef = useRef(null);

  // Profile Form state
  const [perfilForm, setPerfilForm] = useState({ nombre: "", telefono: "" });
  const [pwForm, setPwForm] = useState({
    contrasenaActual: "",
    nuevaContrasena: "",
  });
  const [perfilMsg, setPerfilMsg] = useState({ type: "", text: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const iniciales =
    (user?.nombre || "LP").charAt(0).toUpperCase() +
    (user?.apellido || "P").charAt(0).toUpperCase();

  const loadProductos = useCallback(async () => {
    try {
      const data = await api.get("/productos/mis-productos");
      const items = extractArray(data).map((p) => ({
        ...p,
        tipo: p.tipo || p.tipoFruta || "Banano",
        stock: p.stock !== undefined ? p.stock : p.cantidadDisponible,
      }));
      setProductos(items);
    } catch (err) {
      console.error("Error loadProductos:", err);
      setProductos([]);
    }
  }, [extractArray]);

  const loadPedidos = useCallback(async () => {
    try {
      const data = await api.get("/pedidos/mis-pedidos");
      setPedidos(extractArray(data));
    } catch (err) {
      console.error("Error loadPedidos:", err);
      setPedidos([]);
    }
  }, [extractArray]);

  // Initialization
  useEffect(() => {
    loadProductos();
    loadPedidos();
  }, [loadProductos, loadPedidos]);

  const loadActiveRfqs = useCallback(async () => {
    try {
      const data = await api.get("/rfq/activas");
      setActiveRfqs(extractArray(data));
    } catch (err) {
      console.error("Error loadActiveRfqs:", err);
      setActiveRfqs([]);
    }
  }, [extractArray]);

  const enviarBid = async (e) => {
    e.preventDefault();
    setBidMsg({ type: "", text: "" });
    if (!bidForm.precioPropuesto) {
      setBidMsg({
        type: "error",
        text: "Por favor complete todos los campos obligatorios.",
      });
      return;
    }
    try {
      await api.post(`/rfq/${biddingRfq.id}/ofertar`, {
        precioPropuesto: parseFloat(bidForm.precioPropuesto),
        comentarios: bidForm.comentarios,
      });
      setBidMsg({ type: "success", text: "CotizaciÃ³n enviada exitosamente." });
      setBidForm({ precioPropuesto: "", comentarios: "" });
      setTimeout(() => {
        setBiddingRfq(null);
        loadActiveRfqs();
      }, 1500);
    } catch (err) {
      setBidMsg({
        type: "error",
        text: err.message || "Error al enviar la cotizaciÃ³n.",
      });
    }
  };

  // Shipments loading
  const loadEnvios = useCallback(async () => {
    try {
      const data = await api.get("/envios/mis-despachos");
      setShipments(extractArray(data));
    } catch (err) {
      console.error("Error loadEnvios:", err);
      setShipments([]);
    }
  }, [extractArray]);

  const openUpdateShipment = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateShipmentForm({
      transportista: shipment.transportista || "",
      guia: shipment.guia || "",
      fechaEstimadaEntrega: shipment.fechaEstimadaEntrega || "",
      estado: shipment.estado || "Pendiente",
    });
    setUpdateShipmentModalOpen(true);
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/envios/${selectedShipment.id}`, updateShipmentForm);
      setUpdateShipmentModalOpen(false);
      loadEnvios();
    } catch (err) {
      alert("Error al actualizar despacho: " + err.message);
    }
  };

  // Messaging contacts and messages
  const loadContactos = useCallback(async () => {
    try {
      const data = await api.get("/mensajes/contactos");
      const list = extractArray(data).map((c) => ({
        ...c,
        id: c.id || c.usuarioId,
      }));
      setContactos(list);
    } catch (err) {
      console.error("Error loadContactos:", err);
      setContactos([]);
    }
  }, [extractArray]);

  // Section Loading triggers
  useEffect(() => {
    if (activeSection === "seguimiento") {
      loadEnvios();
    } else if (activeSection === "mensajeria") {
      loadContactos();
    } else if (activeSection === "rfq") {
      loadActiveRfqs();
    } else if (activeSection === "perfil" && user) {
      setPerfilForm({
        nombre: user.nombre || "",
        telefono: user.telefono || "",
      });
      setPerfilMsg({ type: "", text: "" });
      setPwMsg({ type: "", text: "" });
    }
  }, [activeSection, user, loadEnvios, loadContactos, loadActiveRfqs]);

  const selectContact = async (contacto) => {
    setSelectedContact(contacto);
    try {
      const data = await api.get(`/mensajes/conversacion/${contacto.id}`);
      const list = extractArray(data).map((m) => ({
        ...m,
        mio: m.remitenteId === user?.id,
      }));
      setMessages(list);
    } catch (err) {
      console.error("Error loadMessages:", err);
      setMessages([]);
    }
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !selectedContact) return;
    const msg = {
      id: Date.now(),
      texto: msgInput,
      mio: true,
      hora: new Date().toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, msg]);
    const textToSend = msgInput;
    setMsgInput("");
    try {
      await api.post("/mensajes", {
        destinatarioId: selectedContact.id,
        contenido: textToSend,
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  };

  // Profile updating
  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    setPerfilMsg({ type: "", text: "" });
    if (!perfilForm.nombre.trim() || !perfilForm.telefono.trim()) {
      setPerfilMsg({
        type: "error",
        text: "Todos los campos son obligatorios.",
      });
      return;
    }
    try {
      const res = await api.put("/usuarios/me", perfilForm);
      const updatedUser = res.data || res;
      setUser({
        ...user,
        nombre: updatedUser.nombre || perfilForm.nombre,
        telefono: updatedUser.telefono || perfilForm.telefono,
      });
      setPerfilMsg({
        type: "success",
        text: "Perfil actualizado correctamente.",
      });
    } catch (err) {
      setPerfilMsg({
        type: "error",
        text: err.message || "Error al actualizar perfil.",
      });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (!pwForm.contrasenaActual || !pwForm.nuevaContrasena) {
      setPwMsg({ type: "error", text: "Ambas contraseÃ±as son obligatorias." });
      return;
    }
    try {
      await api.put("/usuarios/me/contrasena", pwForm);
      setPwMsg({
        type: "success",
        text: "ContraseÃ±a actualizada correctamente.",
      });
      setPwForm({ contrasenaActual: "", nuevaContrasena: "" });
    } catch (err) {
      setPwMsg({
        type: "error",
        text:
          err.message ||
          "Debe tener al menos 1 mayÃºscula, 1 nÃºmero y 1 carÃ¡cter especial (mÃ­nimo 8 caracteres).",
      });
    }
  };

  // Products Modal
  const openProductoModal = (prod = null) => {
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    if (prod) {
      setEditId(prod.id);
      setForm({
        nombre: prod.nombre,
        tipo: prod.tipo || prod.tipoFruta || "Banano",
        precio: prod.precio,
        stock: prod.stock !== undefined ? prod.stock : prod.cantidadDisponible,
        descripcion: prod.descripcion || "",
        imagenUrl: prod.imagenUrl || "",
        cantidadMinimaMayorista:
          prod.cantidadMinimaMayorista !== undefined &&
          prod.cantidadMinimaMayorista !== null
            ? prod.cantidadMinimaMayorista
            : "",
        precioMayorista:
          prod.precioMayorista !== undefined && prod.precioMayorista !== null
            ? prod.precioMayorista
            : "",
      });
      if (prod.imagenUrl) {
        // Resolve absolute url for display if relative
        const resolvedUrl = prod.imagenUrl.startsWith("http")
          ? prod.imagenUrl
          : `${API_BASE.replace("/api", "")}${prod.imagenUrl}`;
        setImagePreviewUrl(resolvedUrl);
      }
    } else {
      setEditId(null);
      setForm({
        nombre: "",
        tipo: "Banano",
        precio: "",
        stock: "",
        descripcion: "",
        imagenUrl: "",
        cantidadMinimaMayorista: "",
        precioMayorista: "",
      });
    }
    setModalOpen(true);
  };

  const closeProductoModal = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setModalOpen(false);
  };

  const guardarProducto = async () => {
    const mapTipoToEnum = (tipo) => {
      const mapping = {
        Banano: "BANANO",
        "PiÃ±a": "PINA",
        Mango: "MANGO",
        "MaracuyÃ¡": "MARACUYA",
        "GuanÃ¡bana": "GUANABANA",
        Naranja: "NARANJA",
        Coco: "COCO",
        "LimÃ³n": "LIMON",
      };
      return mapping[tipo] || "BANANO";
    };

    const payload = {
      nombre: form.nombre,
      tipoFruta: mapTipoToEnum(form.tipo),
      precio: Number(form.precio),
      cantidadDisponible: Number(form.stock),
      descripcion: form.descripcion,
      imagenUrl: form.imagenUrl || "",
      cantidadMinimaMayorista: form.cantidadMinimaMayorista
        ? Number(form.cantidadMinimaMayorista)
        : null,
      precioMayorista: form.precioMayorista
        ? Number(form.precioMayorista)
        : null,
    };

    try {
      let res;
      if (editId) {
        res = await api.put(`/productos/${editId}`, payload);
      } else {
        res = await api.post("/productos", payload);
      }

      const savedProduct = res?.data || res;
      const productId = savedProduct?.id || editId;

      // Upload selected image file if present
      if (productId && selectedImageFile) {
        const formData = new FormData();
        formData.append("imagen", selectedImageFile);
        await api.post(`/productos/${productId}/imagen`, formData);
      }

      closeProductoModal();
      loadProductos();
    } catch (err) {
      alert(
        t("dashboardProductor.errorSave", "Error al guardar: ") +
          (err.message || "IntÃ©ntalo de nuevo."),
      );
    }
  };

  const eliminarProducto = async (id) => {
    if (
      !window.confirm(
        t("dashboardProductor.confirmDelete", "Â¿Eliminar este producto?"),
      )
    )
      return;
    try {
      await api.delete(`/productos/${id}`);
      loadProductos();
    } catch (err) {
      alert(
        t("dashboardProductor.errorDelete", "Error al eliminar: ") +
          err.message,
      );
    }
  };

  const badgeClass = (estado) => {
    const e = estado?.toLowerCase();
    if (e === "pendiente") return "badge-status status-pending";
    if (e === "enviado") return "badge-status status-shipped";
    if (e === "entregado") return "badge-status status-delivered";
    return "badge-status";
  };

  return (
    <div className="app-layout">
      {/* Overlay para sidebar mÃ³vil */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div
          className="sidebar-user"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setSidebarOpen(false);
            navigate("/perfil");
          }}
        >
          <div
            className="avatar avatar-green"
            style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}
          >
            {iniciales}
          </div>
          <div className="sidebar-user-info">
            <span className="name">{user?.nombre || "Luis Palacios"}</span>
            <span className="role">
              {t("dashboardProductor.producerRole", "Productor ASAFRUT")}
              {user?.verificado && (
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: "6px",
                    background: "#385723",
                    color: "#fff",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                  }}
                >
                  Verificado
                </span>
              )}
            </span>
            <div className="rating"> {user?.calificacion || "4.9"}</div>
          </div>
        </div>

        <div className="sidebar-label">
          {t("dashboardProductor.nav.title", "GestiÃ³n Comercial")}
        </div>
        <a
          href="#"
          className={`sidebar-link${activeSection === "resumen" ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveSection("resumen");
            setSidebarOpen(false);
          }}
        >
          <span className="icon"></span>{" "}
          {t("dashboardProductor.nav.summary", "Panel General")}
        </a>
        <a
          href="#"
          className={`sidebar-link${activeSection === "misProductos" ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveSection("misProductos");
            setSidebarOpen(false);
          }}
        >
          <span className="icon"></span>{" "}
          {t("dashboardProductor.nav.inventory", "Inventario")}
        </a>
        <a
          href="#"
          className={`sidebar-link${activeSection === "pedidosRec" ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveSection("pedidosRec");
            setSidebarOpen(false);
          }}
        >
          <span className="icon"></span>{" "}
          {t("dashboardProductor.nav.sales", "Ventas")}{" "}
          <span className="badge-count">{pedidos.length}</span>
        </a>
        <a
          href="#"
          className={`sidebar-link${activeSection === "rfq" ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveSection("rfq");
            setSidebarOpen(false);
          }}
        >
          <span className="icon"></span> Oportunidades Comerciales
        </a>

        <div className="sidebar-divider"></div>
        <div className="sidebar-label">
          {t("dashboardProductor.logistics.title", "LogÃ­stica")}
        </div>
        <a
          href="#"
          className={`sidebar-link${activeSection === "seguimiento" ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveSection("seguimiento");
            setSidebarOpen(false);
          }}
        >
          <span className="icon"></span>{" "}
          {t("dashboardProductor.logistics.dispatch", "Despachos")}
        </a>
        <a
          href="#"
          className={`sidebar-link${activeSection === "mensajeria" ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveSection("mensajeria");
            setSidebarOpen(false);
          }}
        >
          <span className="icon"></span>{" "}
          {t("dashboardProductor.logistics.messaging", "MensajerÃ­a")}
        </a>
        <Link
          to="/perfil"
          className="sidebar-link"
          onClick={() => setSidebarOpen(false)}
        >
          <span className="icon"></span> {t("profile.title", "Mi Perfil")}
        </Link>

        <a
          href="#"
          className="sidebar-link"
          style={{ marginTop: "auto", color: "var(--red)" }}
          onClick={async (e) => {
            e.preventDefault();
            setSidebarOpen(false);
            await logout();
            navigate("/login");
          }}
        >
          <span className="icon"></span>{" "}
          {t("dashboardProductor.logistics.logout", "Cerrar sesiÃ³n")}
        </a>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menÃº de navegaciÃ³n"
          >
            â˜° MenÃº
          </button>
          <LanguageSwitcher />
        </div>

        {/* â”€â”€â”€ RESUMEN â”€â”€â”€ */}
        {activeSection === "resumen" && (
          <div className="section active" id="sec-resumen">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>
                  {t(
                    "dashboardProductor.welcome",
                    "Â¡Excelente dÃ­a, {{name}}!",
                    { name: user?.nombre || "Luis" },
                  )}
                </h1>
                <p>
                  {t(
                    "dashboardProductor.sub",
                    "Tu cosecha estÃ¡ teniendo un gran rendimiento este mes en UrabÃ¡.",
                  )}
                </p>
              </div>
              <button className="btn-cta" onClick={() => openProductoModal()}>
                {t("dashboardProductor.publishProduct", "Publicar Producto +")}
              </button>
            </div>

            {!user?.verificado && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)",
                  border: "1px solid #ffe8a1",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span style={{ fontSize: "1.5rem" }}></span>
                  <div>
                    <strong style={{ color: "#856404", display: "block" }}>
                      Tu cuenta de productor aÃºn no estÃ¡ verificada
                    </strong>
                    <span style={{ color: "#856404", fontSize: "0.85rem" }}>
                      Completa tu informaciÃ³n personal y cuenta bancaria para
                      ser aprobado por el administrador.
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/perfil")}
                  style={{
                    background: "#856404",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                  }}
                >
                  Verificar Perfil
                </button>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card color-1">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">
                  {t(
                    "dashboardProductor.stats.activeProducts",
                    "Productos Activos",
                  )}
                </div>
                <div className="stat-value">
                  {String(productos.length).padStart(2, "0")}
                </div>
              </div>
              <div className="stat-card color-2">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">
                  {t("dashboardProductor.stats.monthlySales", "Ventas del Mes")}
                </div>
                <div className="stat-value">
                  {String(pedidos.length).padStart(2, "0")}
                </div>
              </div>
              <div className="stat-card color-3">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">
                  {t(
                    "dashboardProductor.stats.totalEarnings",
                    "Ingresos Totales",
                  )}
                </div>
                <div className="stat-value">
                  {formatPrice(
                    pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0),
                  )}
                </div>
              </div>
              <div className="stat-card color-4">
                <span className="stat-icon-lg"></span>
                <div className="stat-label">
                  {t("dashboardProductor.stats.rating", "CalificaciÃ³n")}
                </div>
                <div className="stat-value">{user?.calificacion || "4.9"}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "24px",
              }}
            >
              <div className="card-table">
                <div className="table-header">
                  <h3 className="card-title">
                    {" "}
                    {t("dashboardProductor.recentSales", "Ãšltimas ventas")}
                  </h3>
                </div>
                <div className="table-wrap">
                  <table className="table-responsive">
                    <thead>
                      <tr>
                        <th>{t("dashboardProductor.order", "Pedido")}</th>
                        <th>{t("dashboardProductor.buyer", "Comprador")}</th>
                        <th>{t("dashboardProductor.total", "Total")}</th>
                        <th>{t("dashboardProductor.status", "Estado")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td data-label="Pedido">#{p.id}</td>
                          <td data-label="Comprador">
                            {p.comprador || p.nombreComprador || "â€”"}
                          </td>
                          <td data-label="Total">{formatPrice(p.total)}</td>
                          <td data-label="Estado">
                            <span className={badgeClass(p.estado)}>
                              {t(
                                "pedidos.status." + p.estado?.toLowerCase(),
                                p.estado,
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€â”€ INVENTARIO â”€â”€â”€ */}
        {activeSection === "misProductos" && (
          <div className="section active" id="sec-misProductos">
            <div className="dash-header">
              <h1>{t("dashboardProductor.nav.inventory", "Mi Inventario")}</h1>
              <button className="btn-cta" onClick={() => openProductoModal()}>
                {t("dashboardProductor.newProduct", "+ Nuevo Producto")}
              </button>
            </div>
            <div className="card-table">
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>{t("dashboardProductor.product", "Producto")}</th>
                      <th>{t("dashboardProductor.type", "Tipo")}</th>
                      <th>{t("dashboardProductor.pricePerKg", "Precio/kg")}</th>
                      <th>{t("dashboardProductor.stock", "Stock")}</th>
                      <th>{t("dashboardProductor.status", "Estado")}</th>
                      <th>{t("dashboardProductor.actions", "Acciones")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Producto">{p.nombre}</td>
                        <td data-label="Tipo">{p.tipo}</td>
                        <td data-label="Precio/kg">{formatPrice(p.precio)}</td>
                        <td data-label="Stock">{p.stock} kg</td>
                        <td data-label="Estado">
                          <span className="badge-status status-shipped">
                            {t("dashboardProductor.active", "Activo")}
                          </span>
                        </td>
                        <td data-label="Acciones">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openProductoModal(p)}
                          >
                            {t("dashboardProductor.edit", "Editar")}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: "var(--red)", marginLeft: "6px" }}
                            onClick={() => eliminarProducto(p.id)}
                          ></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€â”€ VENTAS â”€â”€â”€ */}
        {activeSection === "pedidosRec" && (
          <div className="section active" id="sec-pedidosRec">
            <div className="dash-header">
              <h1>{t("dashboardProductor.nav.sales", "GestiÃ³n de Ventas")}</h1>
            </div>
            <div className="card-table">
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>{t("pedidos.id", "ID")}</th>
                      <th>{t("pedidos.product", "Producto")}</th>
                      <th>{t("dashboardProductor.buyer", "Comprador")}</th>
                      <th>{t("dashboardProductor.quantityHeader", "Cant.")}</th>
                      <th>{t("pedidos.total", "Total")}</th>
                      <th>{t("pedidos.statusHeader", "Estado")}</th>
                      <th>{t("pedidos.actions", "Acciones")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id}>
                        <td data-label="ID">#{p.id}</td>
                        <td data-label="Producto">
                          {p.productoNombre ||
                            p.producto ||
                            p.nombreProducto ||
                            "â€”"}
                        </td>
                        <td data-label="Comprador">
                          {p.comprador || p.nombreComprador || "â€”"}
                        </td>
                        <td data-label="Cant.">{p.cantidad} kg</td>
                        <td data-label="Total">{formatPrice(p.total)}</td>
                        <td data-label="Estado">
                          <span className={badgeClass(p.estado)}>
                            {t(
                              "pedidos.status." + p.estado?.toLowerCase(),
                              p.estado,
                            )}
                          </span>
                        </td>
                        <td data-label="Acciones">
                          <select
                            className="form-select"
                            style={{ width: "140px" }}
                            onChange={async (e) => {
                              try {
                                await api.put(`/pedidos/${p.id}/estado`, {
                                  estado: e.target.value,
                                });
                                loadPedidos();
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                          >
                            <option>
                              {t(
                                "dashboardProductor.changeState",
                                "Cambiar estado",
                              )}
                            </option>
                            <option value="Aceptado">Aceptar</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€â”€ DESPACHOS (PRODUCTOR ENVIOS) â”€â”€â”€ */}
        {activeSection === "seguimiento" && (
          <div className="section active">
            <div className="dash-header">
              <h1>GestiÃ³n de Despachos</h1>
              <p>
                Monitorea y actualiza la informaciÃ³n de entrega de tus productos
                vendidos
              </p>
            </div>

            <div className="card-table" style={{ marginTop: "20px" }}>
              <div className="table-wrap">
                <table className="table-responsive">
                  <thead>
                    <tr>
                      <th>Pedido ID</th>
                      <th>Producto</th>
                      <th>Destino</th>
                      <th>Transportista</th>
                      <th>GuÃ­a de EnvÃ­o</th>
                      <th>Fecha Estimada</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id}>
                        <td data-label="Pedido ID">#{s.pedidoId || s.id}</td>
                        <td data-label="Producto">{s.producto || "â€”"}</td>
                        <td data-label="Destino">
                          {s.direccionDestino || "â€”"}
                        </td>
                        <td data-label="Transportista">
                          {s.transportista || "â€”"}
                        </td>
                        <td data-label="GuÃ­a">{s.guia || "â€”"}</td>
                        <td data-label="Fecha Estimada">
                          {s.fechaEstimadaEntrega || "â€”"}
                        </td>
                        <td data-label="Estado">
                          <span className={badgeClass(s.estado)}>
                            {s.estado}
                          </span>
                        </td>
                        <td data-label="Acciones">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openUpdateShipment(s)}
                          >
                            Actualizar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€â”€ MENSAJERIA â”€â”€â”€ */}
        {activeSection === "mensajeria" && (
          <div className="section active">
            <div
              className="chat-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                background: "var(--card-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: "12px",
                overflow: "hidden",
                height: "600px",
              }}
            >
              {/* CONTACTS */}
              <div
                className="chat-contacts"
                style={{
                  borderRight: "1px solid var(--border-light)",
                  overflowY: "auto",
                }}
              >
                {contactos.length === 0 ? (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No tienes contactos activos.
                  </div>
                ) : (
                  contactos.map((c) => (
                    <div
                      key={c.id}
                      className={`contact-item${selectedContact?.id === c.id ? " active" : ""}`}
                      onClick={() => selectContact(c)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--border-light)",
                        background:
                          selectedContact?.id === c.id
                            ? "var(--primary-bg)"
                            : "transparent",
                      }}
                    >
                      <div className="avatar avatar-blue">
                        {c.nombre?.charAt(0).toUpperCase() || "C"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                          {c.nombre}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {t("auth." + c.rol?.toLowerCase(), c.rol)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* WINDOW */}
              <div
                className="chat-window"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  className="chat-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <div className="avatar avatar-blue">
                    {selectedContact?.nombre?.charAt(0).toUpperCase() || "--"}
                  </div>
                  <div>
                    <div className="chat-name" style={{ fontWeight: "700" }}>
                      {selectedContact?.nombre || "Selecciona un contacto"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {selectedContact?.rol || ""}
                    </div>
                  </div>
                </div>

                <div
                  className="chat-messages"
                  ref={chatRef}
                  style={{
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {!selectedContact ? (
                    <div
                      style={{
                        margin: "auto",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <div style={{ fontSize: "2.5rem" }}></div>
                      <div>
                        Selecciona un contacto para iniciar la conversaciÃ³n.
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ margin: "auto", color: "var(--text-muted)" }}>
                      No hay mensajes aÃºn. Â¡SÃ© el primero en escribir!
                    </div>
                  ) : (
                    messages.map((m) => {
                      const esMio = m.mio || m.remitenteId === user?.id;
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            justifyContent: esMio ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "70%",
                              background: esMio
                                ? "var(--primary)"
                                : "var(--card-bg)",
                              color: esMio ? "#fff" : "inherit",
                              padding: "10px 14px",
                              borderRadius: esMio
                                ? "16px 16px 4px 16px"
                                : "16px 16px 16px 4px",
                              border: esMio
                                ? "none"
                                : "1px solid var(--border-light)",
                            }}
                          >
                            <div>{m.texto || m.contenido}</div>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                opacity: 0.7,
                                marginTop: "4px",
                                textAlign: "right",
                              }}
                            >
                              {m.hora ||
                                new Date(m.fechaEnvio).toLocaleTimeString(
                                  "es-CO",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div
                  className="chat-input-bar"
                  style={{
                    padding: "16px",
                    borderTop: "1px solid var(--border-light)",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <input
                    className="chat-input"
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                    }}
                    placeholder="Escribe un mensaje..."
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    disabled={!selectedContact}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={!selectedContact}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€â”€ MI PERFIL & AJUSTES â”€â”€â”€ */}
        {activeSection === "perfil" && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>Ajustes de Mi Perfil</h1>
                <p>
                  Administra tu informaciÃ³n de agricultor y credenciales de
                  acceso
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginTop: "24px",
              }}
            >
              {/* Profile Details Form */}
              <div
                className="card-table"
                style={{
                  padding: "24px",
                  borderRadius: "12px",
                  background: "var(--card-bg)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "1.1rem",
                    borderBottom: "1px solid var(--border-light)",
                    paddingBottom: "8px",
                  }}
                >
                  Datos Personales
                </h3>
                {perfilMsg.text && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      marginBottom: "16px",
                      fontSize: "0.85rem",
                      background:
                        perfilMsg.type === "success"
                          ? "var(--green-bg)"
                          : "var(--red-bg)",
                      color:
                        perfilMsg.type === "success"
                          ? "var(--primary)"
                          : "var(--red)",
                    }}
                  >
                    {perfilMsg.text}
                  </div>
                )}
                <form onSubmit={handleUpdatePerfil}>
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Nombre del Productor</label>
                    <input
                      className="form-input"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "6px",
                      }}
                      value={perfilForm.nombre}
                      onChange={(e) =>
                        setPerfilForm({ ...perfilForm, nombre: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">TelÃ©fono de Contacto</label>
                    <input
                      className="form-input"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "6px",
                      }}
                      value={perfilForm.telefono}
                      onChange={(e) =>
                        setPerfilForm({
                          ...perfilForm,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">
                      Correo ASAFRUT (No editable)
                    </label>
                    <input
                      className="form-input"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "6px",
                        background: "var(--border-light)",
                        cursor: "not-allowed",
                      }}
                      value={user?.email || ""}
                      readOnly
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    style={{ width: "100%" }}
                  >
                    Guardar Cambios
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div
                className="card-table"
                style={{
                  padding: "24px",
                  borderRadius: "12px",
                  background: "var(--card-bg)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "1.1rem",
                    borderBottom: "1px solid var(--border-light)",
                    paddingBottom: "8px",
                  }}
                >
                  Seguridad de la Cuenta
                </h3>
                {pwMsg.text && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      marginBottom: "16px",
                      fontSize: "0.85rem",
                      background:
                        pwMsg.type === "success"
                          ? "var(--green-bg)"
                          : "var(--red-bg)",
                      color:
                        pwMsg.type === "success"
                          ? "var(--primary)"
                          : "var(--red)",
                    }}
                  >
                    {pwMsg.text}
                  </div>
                )}
                <form onSubmit={handleUpdatePassword}>
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">ContraseÃ±a Actual</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="form-input"
                        type={showCurrentPassword ? "text" : "password"}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 12px",
                          border: "1px solid var(--border-light)",
                          borderRadius: "6px",
                        }}
                        value={pwForm.contrasenaActual}
                        onChange={(e) =>
                          setPwForm({
                            ...pwForm,
                            contrasenaActual: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showCurrentPassword ? (
                          // Eye-off SVG
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="#6b7280"
                          >
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                          </svg>
                        ) : (
                          // Eye SVG
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="#6b7280"
                          >
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Nueva ContraseÃ±a</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="form-input"
                        type={showNewPassword ? "text" : "password"}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 12px",
                          border: "1px solid var(--border-light)",
                          borderRadius: "6px",
                        }}
                        value={pwForm.nuevaContrasena}
                        onChange={(e) =>
                          setPwForm({
                            ...pwForm,
                            nuevaContrasena: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showNewPassword ? (
                          // Eye-off SVG
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="#6b7280"
                          >
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                          </svg>
                        ) : (
                          // Eye SVG
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="#6b7280"
                          >
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    style={{ width: "100%" }}
                  >
                    Cambiar ContraseÃ±a
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€â”€ RFQ OPPORTUNITIES (LICITACIONES) â”€â”€â”€ */}
        {activeSection === "rfq" && (
          <div className="section active">
            <div className="dash-header">
              <div className="dash-welcome">
                <h1>Licitaciones / Oportunidades Comerciales</h1>
                <p>
                  Encuentra solicitudes de compra al por mayor y envÃ­a tus
                  cotizaciones de forma segura
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: biddingRfq ? "1fr 1fr" : "1fr",
                gap: "24px",
                marginTop: "24px",
              }}
            >
              {/* Active RFQ List */}
              <div
                className="card-table"
                style={{
                  padding: "24px",
                  borderRadius: "12px",
                  background: "var(--card-bg)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "1.1rem",
                    borderBottom: "1px solid var(--border-light)",
                    paddingBottom: "8px",
                  }}
                >
                  Licitaciones Disponibles
                </h3>
                {activeRfqs.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 0",
                      color: "var(--text-muted)",
                    }}
                  >
                    No hay licitaciones activas en este momento.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {activeRfqs.map((rfq) => {
                      const yaOferto = rfq.ofertas?.find(
                        (of) => of.productorId === user?.id,
                      );
                      return (
                        <div
                          key={rfq.id}
                          style={{
                            background: "#f8fafc",
                            padding: "16px",
                            borderRadius: "10px",
                            border: "1px solid var(--border-light)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "1rem",
                                color: "var(--primary)",
                              }}
                            >
                              {rfq.tipoFruta} - {rfq.cantidadRequerida} kg
                            </span>
                            <div
                              style={{ fontSize: "0.8rem", margin: "4px 0" }}
                            >
                              Comprador: <strong>{rfq.compradorNombre}</strong>
                            </div>
                            <p
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                                margin: "4px 0",
                              }}
                            >
                              {rfq.descripcion}
                            </p>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              Vence:{" "}
                              {new Date(rfq.fechaLimite).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            {yaOferto ? (
                              <div
                                style={{
                                  color: "var(--primary)",
                                  fontWeight: "600",
                                  fontSize: "0.85rem",
                                  textAlign: "right",
                                }}
                              >
                                Ofertado:{" "}
                                {formatPrice(yaOferto.precioPropuesto)}/kg
                              </div>
                            ) : (
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setBiddingRfq(rfq);
                                  setBidMsg({ type: "", text: "" });
                                }}
                              >
                                Cotizar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bidding Panel */}
              {biddingRfq && (
                <div
                  className="card-table"
                  style={{
                    padding: "24px",
                    borderRadius: "12px",
                    background: "var(--card-bg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      borderBottom: "1px solid var(--border-light)",
                      paddingBottom: "8px",
                    }}
                  >
                    <h3 style={{ fontSize: "1.1rem" }}>
                      Enviar CotizaciÃ³n para RFQ #{biddingRfq.id}
                    </h3>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                      onClick={() => setBiddingRfq(null)}
                    >
                      âœ•
                    </button>
                  </div>
                  {bidMsg.text && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "6px",
                        marginBottom: "16px",
                        fontSize: "0.85rem",
                        background:
                          bidMsg.type === "success"
                            ? "var(--green-bg)"
                            : "var(--red-bg)",
                        color:
                          bidMsg.type === "success"
                            ? "var(--primary)"
                            : "var(--red)",
                      }}
                    >
                      {bidMsg.text}
                    </div>
                  )}
                  <form onSubmit={enviarBid}>
                    <div
                      className="form-group"
                      style={{ marginBottom: "16px" }}
                    >
                      <label className="form-label">
                        Detalles de la Solicitud
                      </label>
                      <div
                        style={{
                          background: "#f8fafc",
                          padding: "12px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                        }}
                      >
                        <p>
                          <strong>Fruta solicitada:</strong>{" "}
                          {biddingRfq.tipoFruta}
                        </p>
                        <p>
                          <strong>Cantidad requerida:</strong>{" "}
                          {biddingRfq.cantidadRequerida} kg
                        </p>
                      </div>
                    </div>
                    <div
                      className="form-group"
                      style={{ marginBottom: "16px" }}
                    >
                      <label className="form-label">
                        Precio Propuesto por kg (COP) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid var(--border-light)",
                          borderRadius: "6px",
                        }}
                        value={bidForm.precioPropuesto}
                        onChange={(e) =>
                          setBidForm({
                            ...bidForm,
                            precioPropuesto: e.target.value,
                          })
                        }
                        placeholder="Ej: 2200"
                      />
                    </div>
                    <div
                      className="form-group"
                      style={{ marginBottom: "20px" }}
                    >
                      <label className="form-label">
                        Comentarios / Condiciones de Entrega
                      </label>
                      <textarea
                        rows="3"
                        className="form-textarea"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid var(--border-light)",
                          borderRadius: "6px",
                        }}
                        value={bidForm.comentarios}
                        onChange={(e) =>
                          setBidForm({
                            ...bidForm,
                            comentarios: e.target.value,
                          })
                        }
                        placeholder="Ej: Despacho inmediato, calidad premium certificada."
                      ></textarea>
                    </div>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      style={{ width: "100%" }}
                    >
                      Enviar CotizaciÃ³n
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL PRODUCTO */}
      {modalOpen && (
        <div className="modal-overlay open" id="modalProducto">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editId
                  ? t("dashboardProductor.editProduct", "Editar producto")
                  : t(
                      "dashboardProductor.publishNewProduct",
                      "Publicar nuevo producto",
                    )}
              </span>
              <button className="modal-close" onClick={closeProductoModal}>
                âœ•
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("dashboardProductor.productName", "Nombre del producto")}
              </label>
              <input
                className="form-input"
                id="pNombre"
                placeholder={t(
                  "dashboardProductor.placeholderName",
                  "Ej. Banano UrabÃ¡",
                )}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("dashboardProductor.productType", "Tipo de fruta")}
              </label>
              <select
                className="form-select"
                id="pTipo"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                {TIPOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  {t("dashboardProductor.productPrice", "Precio/kg (COP)")}
                </label>
                <input
                  className="form-input"
                  id="pPrecio"
                  type="number"
                  placeholder="$ 0"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t(
                    "dashboardProductor.productStock",
                    "Stock disponible (kg)",
                  )}
                </label>
                <input
                  className="form-input"
                  id="pStock"
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>

            <div
              className="form-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                margin: "0 0 16px 0",
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Cant. MÃ­nima Mayorista (kg)
                </label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Ej: 100"
                  value={form.cantidadMinimaMayorista}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cantidadMinimaMayorista: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Precio Mayorista (COP)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Ej: 2400"
                  value={form.precioMayorista}
                  onChange={(e) =>
                    setForm({ ...form, precioMayorista: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("dashboardProductor.description", "DescripciÃ³n")}
              </label>
              <textarea
                className="form-textarea"
                id="pDesc"
                rows="3"
                placeholder={t(
                  "dashboardProductor.placeholderDesc",
                  "Describe la calidad, procedencia...",
                )}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              ></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">
                {t("dashboardProductor.image", "Imagen del Producto")}
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                {imagePreviewUrl ? (
                  <div
                    style={{
                      position: "relative",
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt="Vista previa"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setImagePreviewUrl("");
                        setForm((prev) => ({ ...prev, imagenUrl: "" }));
                      }}
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        background: "rgba(255, 0, 0, 0.8)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      âœ•
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      border: "2px dashed var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-light)",
                      fontSize: "1.5rem",
                    }}
                  ></div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() =>
                      document.getElementById("product-image-input").click()
                    }
                  >
                    {imagePreviewUrl
                      ? t("dashboardProductor.changeImage", "Cambiar imagen")
                      : t(
                          "dashboardProductor.selectImage",
                          "Seleccionar imagen",
                        )}
                  </button>
                  <input
                    id="product-image-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedImageFile(file);
                        setImagePreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-light)" }}
                  >
                    JPG, PNG. MÃ¡x 5MB.
                  </span>
                </div>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{ display: "flex", gap: "12px", marginTop: "24px" }}
            >
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={closeProductoModal}
              >
                {t("dashboardProductor.cancel", "Cancelar")}
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={guardarProducto}
              >
                {t("dashboardProductor.save", "Guardar producto")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UPDATE DESPACHO */}
      {updateShipmentModalOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <span className="modal-title">Actualizar EnvÃ­o / Despacho</span>
              <button
                className="modal-close"
                onClick={() => setUpdateShipmentModalOpen(false)}
              >
                âœ•
              </button>
            </div>
            <form onSubmit={handleUpdateShipment}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Empresa Transportista</label>
                <input
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px",
                  }}
                  placeholder="Ej. Servientrega, Envia"
                  value={updateShipmentForm.transportista}
                  onChange={(e) =>
                    setUpdateShipmentForm({
                      ...updateShipmentForm,
                      transportista: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">NÃºmero de GuÃ­a</label>
                <input
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px",
                  }}
                  placeholder="Ej. 1029384756"
                  value={updateShipmentForm.guia}
                  onChange={(e) =>
                    setUpdateShipmentForm({
                      ...updateShipmentForm,
                      guia: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Fecha Estimada de Entrega</label>
                <input
                  className="form-input"
                  type="date"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px",
                  }}
                  value={updateShipmentForm.fechaEstimadaEntrega}
                  onChange={(e) =>
                    setUpdateShipmentForm({
                      ...updateShipmentForm,
                      fechaEstimadaEntrega: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Estado del EnvÃ­o</label>
                <select
                  className="form-select"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px",
                  }}
                  value={updateShipmentForm.estado}
                  onChange={(e) =>
                    setUpdateShipmentForm({
                      ...updateShipmentForm,
                      estado: e.target.value,
                    })
                  }
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Preparando">Preparando</option>
                  <option value="En trÃ¡nsito">En trÃ¡nsito</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
              <div
                className="modal-footer"
                style={{ display: "flex", gap: "12px" }}
              >
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setUpdateShipmentModalOpen(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit">
                  Actualizar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



