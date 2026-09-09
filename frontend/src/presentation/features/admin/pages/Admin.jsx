/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import api, { API_BASE } from "@/infrastructure/http/api";
import "@/presentation/styles/admin.css";

export default function Admin() {
  const { t } = useTranslation();
  const { user, setUser, logout, formatPrice } = useAuth();
  const navigate = useNavigate();
  const getInitialSection = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("section") || "dashboard";
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile forms state
  const [perfilForm, setPerfilForm] = useState({ nombre: "", telefono: "" });
  const [pwForm, setPwForm] = useState({
    contrasenaActual: "",
    nuevaContrasena: "",
  });
  const [perfilMsg, setPerfilMsg] = useState({ type: "", text: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!user || activeSection !== "perfil") {
      return;
    }

    const timer = setTimeout(() => {
      setPerfilForm({
        nombre: user.nombre || "",
        telefono: user.telefono || "",
      });

      setPerfilMsg({
        type: "",
        text: "",
      });

      setPwMsg({
        type: "",
        text: "",
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [user, activeSection]);

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
      setPwMsg({ type: "error", text: "Ambas contraseñas son obligatorias." });
      return;
    }
    try {
      await api.put("/usuarios/me/contrasena", pwForm);
      setPwMsg({
        type: "success",
        text: "Contraseña actualizada correctamente.",
      });
      setPwForm({ contrasenaActual: "", nuevaContrasena: "" });
    } catch (err) {
      setPwMsg({
        type: "error",
        text:
          err.message ||
          "Debe tener al menos 1 mayúscula, 1 número y 1 carácter especial (mínimo 8 caracteres).",
      });
    }
  };
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [pagosFideicomiso, setPagosFideicomiso] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // States for Coupons and Config
  const [todosCupones, setTodosCupones] = useState([]);
  const [nuevoCupon, setNuevoCupon] = useState({
    codigo: "",
    tipo: "ENVIO_GRATIS",
    valor: 0,
    montoMinimo: 0,
    usuarioId: "",
    fechaExpiracion: "",
  });
  const [costoEnvioNacional, setCostoEnvioNacional] = useState(15000);
  const [guardandoEnvio, setGuardandoEnvio] = useState(false);
  const [mantenimientoMode, setMantenimientoMode] = useState(
    localStorage.getItem("mantenimiento_mode") === "true",
  );

  // States for Finanzas and Logística Reports
  const [finanzasData, setFinanzasData] = useState(null);
  const [logisticaData, setLogisticaData] = useState(null);
  const [loadingFinanzas, setLoadingFinanzas] = useState(false);
  const [loadingLogistica, setLoadingLogistica] = useState(false);
  const [errorFinanzas, setErrorFinanzas] = useState("");
  const [errorLogistica, setErrorLogistica] = useState("");

  // Pagination & Search States for Users
  const [searchUsuarios, setSearchUsuarios] = useState("");
  const [searchUsuariosInput, setSearchUsuariosInput] = useState("");
  const [pageUsuarios, setPageUsuarios] = useState(0);
  const [totalPagesUsuarios, setTotalPagesUsuarios] = useState(1);
  const [totalElementsUsuarios, setTotalElementsUsuarios] = useState(0);

  // Pagination & Search States for Products
  const [searchProductos, setSearchProductos] = useState("");
  const [searchProductosInput, setSearchProductosInput] = useState("");
  const [pageProductos, setPageProductos] = useState(0);
  const [totalPagesProductos, setTotalPagesProductos] = useState(1);
  const [totalElementsProductos, setTotalElementsProductos] = useState(0);

  const [usuariosPendientes, setUsuariosPendientes] = useState([]);

  const handleAprobarUsuario = async (userId) => {
    try {
      await api.post(`/admin/aprobar-usuario/${userId}`);
      alert("Usuario aprobado con éxito.");
      void loadAll();
      void loadUsuarios();
    } catch (err) {
      alert("Error al aprobar usuario: " + err.message);
    }
  };

  const handleRechazarUsuario = async (userId) => {
    const motivo = window.prompt("Introduce el motivo del rechazo (opcional):");
    if (motivo === null) return;
    try {
      await api.post(`/admin/rechazar-usuario/${userId}`, { motivo });
      alert("Usuario rechazado con éxito.");
      void loadAll();
      void loadUsuarios();
    } catch (err) {
      alert("Error al rechazar usuario: " + err.message);
    }
  };

  // Cargar el costo de envío real desde el backend (GET /envios/config).
  // Es la fuente de verdad compartida por carrito, checkout, pedidos y pago.
  useEffect(() => {
    let mounted = true;

    api
      .get("/envios/config")
      .then((res) => {
        const data = res?.data || res;
        const valor = Number(data?.costoEnvio);
        if (mounted && Number.isFinite(valor) && valor >= 0) {
          setCostoEnvioNacional(valor);
        }
      })
      .catch((err) =>
        console.error("No se pudo cargar el costo de envío:", err),
      );

    return () => {
      mounted = false;
    };
  }, []);

  const handleGuardarCostoEnvio = async () => {
    if (guardandoEnvio) return;
    setGuardandoEnvio(true);
    try {
      await api.put("/envios/config", {
        costoEnvio: costoEnvioNacional,
      });
      alert(
        "Costo de envío guardado en el servidor. Se aplica a carrito, checkout y pedidos.",
      );
    } catch (err) {
      alert(
        "Error al guardar el costo de envío: " +
          (err.message || "inténtalo de nuevo."),
      );
    } finally {
      setGuardandoEnvio(false);
    }
  };

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

  const loadUsuarios = useCallback(async () => {
    try {
      const res = await api.get(
        `/admin/usuarios?page=${pageUsuarios}&size=20&search=${searchUsuarios}`,
      );
      const data = res.data || res;
      setUsuarios(extractArray(data));
      setTotalPagesUsuarios(data.totalPages || 1);
      setTotalElementsUsuarios(data.totalElements || 0);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }, [extractArray, pageUsuarios, searchUsuarios]);

  const loadProductos = useCallback(async () => {
    try {
      const res = await api.get(
        `/admin/productos?page=${pageProductos}&size=15&search=${searchProductos}`,
      );
      const data = res.data || res;
      setProductos(extractArray(data));
      setTotalPagesProductos(data.totalPages || 1);
      setTotalElementsProductos(data.totalElements || 0);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }, [extractArray, pageProductos, searchProductos]);

  const loadAll = useCallback(async () => {
    try {
      const [r, db, up] = await Promise.all([
        api.get("/resenas").catch(() => []),
        api.get("/admin/dashboard").catch(() => null),
        api.get("/admin/usuarios-pendientes").catch(() => []),
      ]);
      setResenas(extractArray(r));
      if (db) setDashboardData(db.data || db);
      setUsuariosPendientes(extractArray(up));
    } catch (err) {
      console.error("Error cargando datos administrativos:", err);
    }
  }, [extractArray]);

  const loadPagosFideicomiso = useCallback(async () => {
    try {
      const data = await api.get("/admin/pagos/fideicomiso");
      setPagosFideicomiso(extractArray(data));
    } catch (err) {
      console.error("Error loadPagosFideicomiso:", err);
      setPagosFideicomiso([]);
    }
  }, [extractArray]);

  // Debounced search for users
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchUsuarios(searchUsuariosInput);
      setPageUsuarios(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchUsuariosInput]);

  // Debounced search for products
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchProductos(searchProductosInput);
      setPageProductos(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchProductosInput]);

  // Load users when page/search changes
  useEffect(() => {
    if (activeSection === "usuarios") {
      void loadUsuarios();
    }
  }, [pageUsuarios, searchUsuarios, activeSection, loadUsuarios]);

  // Load products when page/search changes
  useEffect(() => {
    if (activeSection === "productos") {
      void loadProductos();
    }
  }, [pageProductos, searchProductos, activeSection, loadProductos]);

  useEffect(() => {
    void loadAll();
    void loadUsuarios();
    void loadProductos();
  }, [loadAll, loadUsuarios, loadProductos]);

  useEffect(() => {
    if (activeSection === "pagos") {
      void loadPagosFideicomiso();
    }
  }, [activeSection, loadPagosFideicomiso]);

  const loadTodosCupones = useCallback(async () => {
    try {
      const res = await api.get("/cupones/todos");
      setTodosCupones(extractArray(res));
    } catch (err) {
      console.error("Error loadTodosCupones:", err);
    }
  }, [extractArray]);

  const handleCrearCupon = async (e) => {
    e.preventDefault();
    if (!nuevoCupon.codigo.trim())
      return alert("El código de cupón es obligatorio.");
    try {
      const payload = {
        codigo: nuevoCupon.codigo.toUpperCase().trim(),
        tipo: nuevoCupon.tipo,
        valor: Number(nuevoCupon.valor) || 0,
        montoMinimo: Number(nuevoCupon.montoMinimo) || 0,
        usuarioId: nuevoCupon.usuarioId ? Number(nuevoCupon.usuarioId) : null,
        usado: false,
        fechaExpiracion: nuevoCupon.fechaExpiracion
          ? `${nuevoCupon.fechaExpiracion}T23:59:59`
          : null,
      };
      await api.post("/cupones", payload);
      alert("Cupón creado con éxito.");
      setNuevoCupon({
        codigo: "",
        tipo: "ENVIO_GRATIS",
        valor: 0,
        montoMinimo: 0,
        usuarioId: "",
        fechaExpiracion: "",
      });
      loadTodosCupones();
    } catch (err) {
      alert("Error al crear cupón: " + err.message);
    }
  };

  const handleEliminarCupon = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este cupón?"))
      return;
    try {
      await api.delete(`/cupones/${id}`);
      alert("Cupón eliminado con éxito.");
      loadTodosCupones();
    } catch (err) {
      alert("Error al eliminar cupón: " + err.message);
    }
  };

  const loadFinanzas = useCallback(async () => {
    setLoadingFinanzas(true);
    setErrorFinanzas("");
    try {
      const res = await api.get("/admin/reportes/finanzas");
      setFinanzasData(res.data || res);
    } catch (err) {
      console.error("Error loading finanzas:", err);
      setErrorFinanzas(err.message || "Error al cargar reporte de finanzas.");
    } finally {
      setLoadingFinanzas(false);
    }
  }, []);

  const loadLogistica = useCallback(async () => {
    setLoadingLogistica(true);
    setErrorLogistica("");
    try {
      const res = await api.get("/admin/reportes/logistica");
      setLogisticaData(res.data || res);
    } catch (err) {
      console.error("Error loading logistica:", err);
      setErrorLogistica(err.message || "Error al cargar reporte de logística.");
    } finally {
      setLoadingLogistica(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "reportes") {
      void loadFinanzas();
    } else if (activeSection === "reportes-logistica") {
      void loadLogistica();
    } else if (activeSection === "cupones") {
      loadTodosCupones();
    }
  }, [activeSection, loadFinanzas, loadLogistica, loadTodosCupones]);

  const liberarPago = async (pagoId) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea liberar estos fondos al productor?",
      )
    )
      return;
    try {
      await api.put(`/admin/pagos/${pagoId}/liberar`);
      alert("Fondos liberados exitosamente.");
      void loadPagosFideicomiso();
    } catch (err) {
      alert("Error al liberar fondos: " + err.message);
    }
  };

  const reembolsarPago = async (pagoId) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea reembolsar estos fondos al comprador?",
      )
    )
      return;
    try {
      await api.put(`/admin/pagos/${pagoId}/reembolsar`);
      alert("Fondos reembolsados exitosamente.");
      void loadPagosFideicomiso();
    } catch (err) {
      alert("Error al reembolsar fondos: " + err.message);
    }
  };

  const toggleVerificarProductor = async (u) => {
    try {
      await api.put(`/admin/productores/${u.id}/verificar`);
      alert("Estado de verificación del productor actualizado.");
      void loadAll();
      void loadUsuarios();
    } catch (err) {
      alert(err.message || "Error al cambiar la verificación del productor.");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/reportes/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al generar el reporte.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte-mensual.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Error al generar el reporte.");
    }
  };

  const usuariosFiltrados = searchUsuarios
    ? usuarios.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchUsuarios.toLowerCase()),
      )
    : usuarios;

  const toggleUsuarioActivo = async (u) => {
    try {
      if (u.activo !== false) {
        await api.put(`/usuarios/${u.id}/deshabilitar`);
      } else {
        await api.put(`/usuarios/${u.id}/habilitar`);
      }
      void loadAll();
      void loadUsuarios();
    } catch (err) {
      alert(err.message || "Error al cambiar estado del usuario.");
    }
  };

  const eliminarProducto = async (id) => {
    if (
      !window.confirm(
        t("dashboardProductor.confirmDelete", "¿Eliminar este producto?"),
      )
    )
      return;
    try {
      await api.delete(`/productos/${id}`);
      void loadAll();
      void loadProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  const moderarResena = async (id, aprobada) => {
    try {
      await api.put(`/resenas/${id}/moderar`, { aprobada });
      void loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const getDashboardCollection = (...keys) => {
    for (const key of keys) {
      const value = dashboardData?.[key];
      if (Array.isArray(value)) return value;
      if (value?.content && Array.isArray(value.content)) return value.content;
    }
    return [];
  };

  const adminPedidos = getDashboardCollection(
    "pedidos",
    "ultimosPedidos",
    "recentOrders",
    "ordenes",
  );
  const adminTickets = getDashboardCollection(
    "tickets",
    "ticketsSoporte",
    "soporte",
  );
  const productores = usuarios.filter((u) =>
    String(u.role || u.rol || "")
      .toUpperCase()
      .includes("PRODUCTOR"),
  );
  const dashboardPedidos =
    dashboardData?.pedidosTotales ??
    dashboardData?.totalPedidos ??
    adminPedidos.length;
  const dashboardProductores =
    dashboardData?.productores ??
    dashboardData?.totalProductores ??
    productores.length;
  const dashboardProductos =
    dashboardData?.productosPublicados ??
    dashboardData?.totalProductos ??
    totalElementsProductos ??
    productos.length;
  const dashboardUsuarios =
    dashboardData?.usuariosTotales ??
    dashboardData?.totalUsuarios ??
    totalElementsUsuarios ??
    usuarios.length;
  const dashboardVentasHoy =
    dashboardData?.ventasHoy ?? dashboardData?.ventasDelDia ?? null;
  const dashboardNuevosUsuarios = dashboardData?.nuevosUsuarios ?? null;
  const dashboardNuevosProductores = dashboardData?.nuevosProductores ?? null;
  const dashboardTickets =
    dashboardData?.ticketsSoporte ??
    dashboardData?.totalTickets ??
    adminTickets.length;

  return (
    <div className="app-layout">
      {/* Overlay para sidebar móvil */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-user">
          <div
            className="avatar avatar-red"
            style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}
          >
            AD
          </div>
          <div className="sidebar-user-info">
            <span className="name">
              {t("admin.roleAdmin", "Administrador")}
            </span>
            <span className="role">
              {t("admin.supportRole", "Soporte AgroMarket")}
            </span>
          </div>
        </div>

        <div className="sidebar-label">
          {t("admin.nav.title", "Panel de Control")}
        </div>
        {[
          ["dashboard", "Dashboard", "▦"],
          ["usuarios", t("admin.nav.users", "Usuarios"), "◉"],
          ["productos", t("admin.nav.products", "Productos"), "□"],
          ["pedidos", "Pedidos", "▤"],
          ["productores", "Productores", "♧"],
          ["pagos", "Pagos", "◈"],
          ["reportes", "Reportes", "◫"],
          ["configuracion", "Configuración", "⚙"],
          ["soporte", "Soporte", "?"],
          ["auditoria", "Auditoría", "◌"],
        ].map(([section, label, icon]) => (
          <a
            key={section}
            href={`#${section}`}
            className={`sidebar-link${activeSection === section ? " active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(section);
              setSidebarOpen(false);
            }}
          >
            <span className="sidebar-icon" aria-hidden="true">
              {icon}
            </span>
            {label}
          </a>
        ))}

        <div className="sidebar-divider"></div>
        <Link
          to="/perfil"
          className="sidebar-link"
          onClick={() => setSidebarOpen(false)}
        >
          <span className="sidebar-icon" aria-hidden="true">
            ◎
          </span>
          {t("profile.title", "Mi Perfil")}
        </Link>

        <a
          href="#"
          className="sidebar-link"
          style={{ marginTop: "auto", color: "var(--red)" }}
          onClick={async (e) => {
            e.preventDefault();
            await logout();
            navigate("/");
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          >
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
          {t("admin.logout", "Cerrar sesión")}
        </a>
      </aside>

      <main className="main-content">
        {/* Top bar with sidebar toggle */}
        <div className="admin-topbar">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            ☰ Menú
          </button>
          <div className="admin-search">
            Buscar en AgroMarket... <span>⌕</span>
          </div>
          <div className="admin-top-actions">
            <span className="admin-bell">
              ♧<b>8</b>
            </span>
            <span className="admin-user-avatar">
              {(user?.nombre || "A").slice(0, 1).toUpperCase()}
            </span>
            <span className="admin-user-name">
              {user?.nombre || "Admin"}
              <small>Administrador</small>
            </span>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="dash-header">
          <div className="dash-welcome">
            <h1>ADMINISTRACIÓN</h1>
            <p>Panel de control y gestión de la plataforma</p>
          </div>
          <button
            className="btn-cta"
            style={{ background: "var(--primary-dark)" }}
            onClick={handleGenerateReport}
          >
            {t("admin.generateReport", "Generar Reporte Mensual")}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card color-1">
            <span className="stat-icon-lg"></span>
            <div className="stat-label">
              {t("admin.stats.totalUsers", "Total Usuarios")}
            </div>
            <div className="stat-value" id="statUsuarios">
              {Number(dashboardUsuarios).toLocaleString("es-CO")}
            </div>
            <div className="stat-trend up">
              {t("admin.stats.trendUsers", "Usuarios registrados")}
            </div>
          </div>
          <div className="stat-card color-2">
            <span className="stat-icon-lg"></span>
            <div className="stat-label">
              {t("admin.stats.globalProducts", "Productos Globales")}
            </div>
            <div className="stat-value" id="statProductos">
              {Number(dashboardProductos).toLocaleString("es-CO")}
            </div>
            <div className="stat-trend">
              {t("admin.stats.trendProducts", "En catálogo")}
            </div>
          </div>
          <div className="stat-card color-3">
            <span className="stat-icon-lg"></span>
            <div className="stat-label">
              {t("admin.stats.totalEarnings", "Ingresos Totales")}
            </div>
            <div className="stat-value">
              {dashboardData?.ingresos !== undefined &&
              dashboardData?.ingresos !== null
                ? formatPrice(dashboardData.ingresos)
                : "—"}
            </div>
            <div className="stat-trend up">
              {t("admin.stats.trendEarnings", "Ingresos confirmados")}
            </div>
          </div>
          <div className="stat-card color-4">
            <span className="stat-icon-lg"></span>
            <div className="stat-label">
              {t("admin.stats.alerts", "Alertas Moderación")}
            </div>
            <div className="stat-value" id="statResenas">
              {resenas.filter((r) => !r.aprobada).length}
            </div>
            <div className="stat-trend down" style={{ color: "orange" }}>
              {t("admin.stats.trendAlerts", "Acción requerida")}
            </div>
          </div>
        </div>

        {activeSection !== "perfil" ? (
          <div
            className="grid-columns"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "24px",
            }}
          >
            <div className="card-table">
              {/* DASHBOARD */}
              {activeSection === "dashboard" && (
                <div
                  className="section active admin-dashboard-section"
                  id="sec-dashboard"
                >
                  <div className="table-header">
                    <div>
                      <h3 className="card-title">
                        ¡Bienvenido, Administrador! 👋
                      </h3>
                      <p className="section-subtitle">
                        Resumen general de la plataforma
                      </p>
                    </div>
                    <span className="date-chip">
                      {new Date().toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="admin-kpi-grid">
                    <div className="admin-kpi">
                      <span>Usuarios totales</span>
                      <strong>
                        {Number(dashboardUsuarios).toLocaleString("es-CO")}
                      </strong>
                      <small>Usuarios registrados</small>
                    </div>
                    <div className="admin-kpi">
                      <span>Productores</span>
                      <strong>
                        {Number(dashboardProductores).toLocaleString("es-CO")}
                      </strong>
                      <small>Productores registrados</small>
                    </div>
                    <div className="admin-kpi">
                      <span>Productos publicados</span>
                      <strong>
                        {Number(dashboardProductos).toLocaleString("es-CO")}
                      </strong>
                      <small>Inventario global</small>
                    </div>
                    <div className="admin-kpi">
                      <span>Pedidos totales</span>
                      <strong>
                        {Number(dashboardPedidos).toLocaleString("es-CO")}
                      </strong>
                      <small>Pedidos registrados</small>
                    </div>
                  </div>
                  <div className="admin-dashboard-grid">
                    <div className="admin-panel">
                      <div className="admin-panel-heading">
                        <h4>Ventas totales</h4>
                        <span>Resumen</span>
                      </div>
                      <div className="admin-big-number">
                        {dashboardData?.ingresos != null
                          ? formatPrice(dashboardData.ingresos)
                          : "—"}
                      </div>
                      <div className="admin-chart-placeholder">
                        {dashboardData?.ingresosPorMes &&
                        dashboardData.ingresosPorMes.length > 0
                          ? // Usar datos reales de ingresos por mes
                            dashboardData.ingresosPorMes.map((mes, index) => {
                              const amount = Number(mes.monto) || 0;
                              // Calcular porcentaje relativo (max 100%)
                              const maxAmount =
                                Math.max(
                                  ...dashboardData.ingresosPorMes.map(
                                    (m) => Number(m.monto) || 0,
                                  ),
                                ) || 1;
                              const percentage = Math.min(
                                (amount / maxAmount) * 100,
                                100,
                              );
                              return (
                                <span
                                  key={index}
                                  style={{ height: `${percentage}%` }}
                                  title={`${mes.mes}: ${formatPrice(amount)}`}
                                />
                              );
                            })
                          : // Fallback a datos de ejemplo si no hay datos reales
                            [38, 52, 46, 61, 56, 72, 68, 84, 78, 91].map(
                              (height, index) => (
                                <span
                                  key={index}
                                  style={{ height: `${height}%` }}
                                />
                              ),
                            )}
                      </div>
                    </div>
                    <div className="admin-panel">
                      <div className="admin-panel-heading">
                        <h4>Pedidos por estado</h4>
                        <span>{dashboardPedidos} total</span>
                      </div>
                      <div className="status-list">
                        <div>
                          <span className="dot dot-green" />
                          Entregados{" "}
                          <strong>
                            {dashboardData?.pedidosEntregados ?? "—"}
                          </strong>
                        </div>
                        <div>
                          <span className="dot dot-blue" />
                          En camino{" "}
                          <strong>
                            {dashboardData?.pedidosEnCamino ?? "—"}
                          </strong>
                        </div>
                        <div>
                          <span className="dot dot-yellow" />
                          Pendientes{" "}
                          <strong>
                            {dashboardData?.pedidosPendientes ?? "—"}
                          </strong>
                        </div>
                        <div>
                          <span className="dot dot-red" />
                          Cancelados{" "}
                          <strong>
                            {dashboardData?.pedidosCancelados ?? "—"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="admin-mini-grid">
                    <div className="admin-mini">
                      <span>Ventas hoy</span>
                      <strong>
                        {dashboardVentasHoy != null
                          ? formatPrice(dashboardVentasHoy)
                          : "—"}
                      </strong>
                    </div>
                    <div className="admin-mini">
                      <span>Nuevos usuarios</span>
                      <strong>{dashboardNuevosUsuarios ?? "—"}</strong>
                    </div>
                    <div className="admin-mini">
                      <span>Nuevos productores</span>
                      <strong>{dashboardNuevosProductores ?? "—"}</strong>
                    </div>
                    <div className="admin-mini">
                      <span>Tickets de soporte</span>
                      <strong>{dashboardTickets}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* USUARIOS */}
              {activeSection === "usuarios" && (
                <div className="section active" id="sec-usuarios">
                  <div className="table-header">
                    <h3 className="card-title">
                      {t("admin.usersManagement", "Gestión de Usuarios")}
                    </h3>
                  </div>

                  {/* PENDING APPROVALS */}
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px dashed var(--border)",
                    }}
                  >
                    <h4
                      style={{
                        color: "var(--gold)",
                        marginBottom: "12px",
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                      }}
                    >
                      Cuentas de Productores Pendientes de Aprobación
                    </h4>
                    {usuariosPendientes.length === 0 ? (
                      <p
                        style={{
                          color: "var(--text-dim)",
                          fontStyle: "italic",
                          fontSize: "0.85rem",
                        }}
                      >
                        No hay solicitudes de aprobación pendientes.
                      </p>
                    ) : (
                      <div
                        className="table-wrap"
                        style={{ marginBottom: "10px" }}
                      >
                        <table
                          className="table-responsive"
                          style={{
                            border: "1px solid var(--gold-border)",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <thead>
                            <tr style={{ background: "var(--gold-bg)" }}>
                              <th>Nombre</th>
                              <th>Correo</th>
                              <th>Ubicación</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usuariosPendientes.map((u) => (
                              <tr key={u.id}>
                                <td data-label="Nombre">
                                  {u.nombre} {u.apellido}
                                </td>
                                <td data-label="Correo">{u.email}</td>
                                <td data-label="Ubicación">
                                  {u.ubicacion || "—"}
                                </td>
                                <td data-label="Acciones">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleAprobarUsuario(u.id)}
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    style={{ marginLeft: "6px" }}
                                    onClick={() => handleRechazarUsuario(u.id)}
                                  >
                                    Rechazar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="table-filters">
                    <div className="search-box">
                      <input
                        type="text"
                        id="searchUsuarios"
                        placeholder={t(
                          "admin.searchUsers",
                          "Buscar por nombre o correo...",
                        )}
                        value={searchUsuariosInput}
                        onChange={(e) => setSearchUsuariosInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>{t("auth.firstName", "Nombre")}</th>
                          <th>{t("auth.email", "Correo")}</th>
                          <th>{t("profile.role", "Rol")}</th>
                          <th>{t("pedidos.statusHeader", "Estado")}</th>
                          <th>{t("pedidos.actions", "Acciones")}</th>
                        </tr>
                      </thead>
                      <tbody id="tbUsuarios">
                        {usuariosFiltrados.map((u) => (
                          <tr key={u.id}>
                            <td data-label={t("auth.firstName", "Nombre")}>
                              {u.nombre} {u.apellido}
                            </td>
                            <td data-label={t("auth.email", "Correo")}>
                              {u.email}
                            </td>
                            <td data-label={t("profile.role", "Rol")}>
                              <span className="badge-status">
                                {t(
                                  "auth." + (u.role || u.rol)?.toLowerCase(),
                                  u.role || u.rol,
                                )}
                              </span>
                            </td>
                            <td
                              data-label={t("pedidos.statusHeader", "Estado")}
                            >
                              <span
                                className={`badge-status ${u.activo !== false ? "status-shipped" : "status-pending"}`}
                              >
                                {u.activo !== false
                                  ? t("admin.active", "Activo")
                                  : t("admin.inactive", "Inactivo")}
                              </span>
                            </td>
                            <td data-label={t("pedidos.actions", "Acciones")}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => toggleUsuarioActivo(u)}
                              >
                                {u.activo !== false
                                  ? t("admin.deactivate", "Desactivar")
                                  : t("admin.activate", "Activar")}
                              </button>
                              {(u.role || u.rol)?.toUpperCase() ===
                                "PRODUCTOR" && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    marginLeft: "6px",
                                    background: u.verificado
                                      ? "#385723"
                                      : "#6b7280",
                                    color: "#fff",
                                  }}
                                  onClick={() => toggleVerificarProductor(u)}
                                >
                                  {u.verificado ? "Verificado" : "Verificar"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls for Users */}
                  {totalPagesUsuarios > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px 24px",
                        borderTop: "1px solid var(--border-light)",
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={pageUsuarios === 0}
                        onClick={() =>
                          setPageUsuarios((p) => Math.max(0, p - 1))
                        }
                      >
                        Anterior
                      </button>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        Página <strong>{pageUsuarios + 1}</strong> de{" "}
                        <strong>{totalPagesUsuarios}</strong> (
                        {totalElementsUsuarios} usuarios)
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={pageUsuarios >= totalPagesUsuarios - 1}
                        onClick={() => setPageUsuarios((p) => p + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PEDIDOS */}
              {activeSection === "pedidos" && (
                <div className="section active" id="sec-pedidos">
                  <div className="table-header">
                    <div>
                      <h3 className="card-title">Gestión de pedidos</h3>
                      <p className="section-subtitle">
                        Seguimiento global de pedidos registrados en el
                        dashboard administrativo.
                      </p>
                    </div>
                    <button className="table-action">Exportar</button>
                  </div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Cliente</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminPedidos.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="empty-cell">
                              El endpoint administrativo actual no expone un
                              listado global de pedidos. Se muestran pedidos
                              aquí cuando /admin/dashboard devuelve una
                              colección de pedidos.
                            </td>
                          </tr>
                        ) : (
                          adminPedidos.map((p, i) => (
                            <tr key={p.id || p.codigo || i}>
                              <td data-label="Pedido">
                                {p.codigo ||
                                  p.numeroPedido ||
                                  p.id ||
                                  `#${i + 1}`}
                              </td>
                              <td data-label="Cliente">
                                {p.cliente ||
                                  p.compradorNombre ||
                                  p.nombreCliente ||
                                  "—"}
                              </td>
                              <td data-label="Total">
                                {p.total != null ? formatPrice(p.total) : "—"}
                              </td>
                              <td data-label="Estado">
                                <span className="badge-status status-shipped">
                                  {p.estado || "—"}
                                </span>
                              </td>
                              <td data-label="Fecha">
                                {p.fecha || p.fechaCreacion || "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTORES */}
              {activeSection === "productores" && (
                <div className="section active" id="sec-productores">
                  <div className="table-header">
                    <div>
                      <h3 className="card-title">Gestión de productores</h3>
                      <p className="section-subtitle">
                        Productores obtenidos desde el listado administrativo de
                        usuarios.
                      </p>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>Productor</th>
                          <th>Correo</th>
                          <th>Ubicación</th>
                          <th>Estado</th>
                          <th>Verificación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productores.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="empty-cell">
                              No hay productores disponibles en el listado
                              administrativo.
                            </td>
                          </tr>
                        ) : (
                          productores.map((u) => (
                            <tr key={u.id}>
                              <td data-label="Productor">
                                {u.nombre} {u.apellido || ""}
                              </td>
                              <td data-label="Correo">
                                {u.email || u.correo || "—"}
                              </td>
                              <td data-label="Ubicación">
                                {u.ubicacion || "—"}
                              </td>
                              <td data-label="Estado">
                                <span
                                  className={`badge-status ${u.activo !== false ? "status-shipped" : "status-pending"}`}
                                >
                                  {u.activo !== false ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                              <td data-label="Verificación">
                                <button
                                  className={`btn btn-sm ${u.verificado ? "btn-secondary" : "btn-primary"}`}
                                  onClick={() => toggleVerificarProductor(u)}
                                >
                                  {u.verificado ? "Verificado" : "Verificar"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTOS */}
              {activeSection === "productos" && (
                <div className="section active" id="sec-productos">
                  <div
                    className="table-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <h3 className="card-title">
                      {t("admin.globalInventory", "Inventario Global")}
                    </h3>
                    <div
                      className="search-box"
                      style={{ maxWidth: "280px", width: "100%", margin: 0 }}
                    >
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchProductosInput}
                        onChange={(e) =>
                          setSearchProductosInput(e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>{t("dashboardProductor.product", "Producto")}</th>
                          <th>{t("pedidos.producer", "Productor")}</th>
                          <th>
                            {t("dashboardProductor.pricePerKg", "Precio/kg")}
                          </th>
                          <th>{t("dashboardProductor.stock", "Stock")}</th>
                          <th>{t("pedidos.actions", "Acciones")}</th>
                        </tr>
                      </thead>
                      <tbody id="tbProductos">
                        {productos.map((p) => (
                          <tr key={p.id}>
                            <td
                              data-label={t(
                                "dashboardProductor.product",
                                "Producto",
                              )}
                            >
                              {p.nombre}
                            </td>
                            <td data-label={t("pedidos.producer", "Productor")}>
                              {p.productor || p.nombreProductor || "—"}
                            </td>
                            <td
                              data-label={t(
                                "dashboardProductor.pricePerKg",
                                "Precio/kg",
                              )}
                            >
                              {formatPrice(p.precio)}
                            </td>
                            <td
                              data-label={t(
                                "dashboardProductor.stock",
                                "Stock",
                              )}
                            >
                              {p.stock} kg
                            </td>
                            <td data-label={t("pedidos.actions", "Acciones")}>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ color: "var(--red)" }}
                                onClick={() => eliminarProducto(p.id)}
                              >
                                {t("admin.delete", "Eliminar")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls for Products */}
                  {totalPagesProductos > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px 24px",
                        borderTop: "1px solid var(--border-light)",
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={pageProductos === 0}
                        onClick={() =>
                          setPageProductos((p) => Math.max(0, p - 1))
                        }
                      >
                        Anterior
                      </button>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        Página <strong>{pageProductos + 1}</strong> de{" "}
                        <strong>{totalPagesProductos}</strong> (
                        {totalElementsProductos} productos)
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={pageProductos >= totalPagesProductos - 1}
                        onClick={() => setPageProductos((p) => p + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* RESEÑAS */}
              {activeSection === "resenas" && (
                <div className="section active" id="sec-resenas">
                  <div className="table-header">
                    <h3 className="card-title">
                      {t("admin.reviewsModeration", "Moderación de Reseñas")}
                    </h3>
                  </div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>{t("admin.user", "Usuario")}</th>
                          <th>
                            {t(
                              "dashboardProductor.stats.rating",
                              "Calificación",
                            )}
                          </th>
                          <th>
                            {t("dashboardProductor.description", "Comentario")}
                          </th>
                          <th>{t("pedidos.statusHeader", "Estado")}</th>
                          <th>{t("pedidos.actions", "Acciones")}</th>
                        </tr>
                      </thead>
                      <tbody id="tbResenas">
                        {resenas.map((r) => (
                          <tr key={r.id}>
                            <td data-label={t("admin.user", "Usuario")}>
                              {r.compradorNombre ||
                                r.usuario ||
                                r.nombreUsuario ||
                                "—"}
                            </td>
                            <td
                              data-label={t(
                                "dashboardProductor.stats.rating",
                                "Calificación",
                              )}
                            >
                              {"★".repeat(r.calificacion || 5)}
                            </td>
                            <td
                              data-label={t(
                                "dashboardProductor.description",
                                "Comentario",
                              )}
                            >
                              {r.comentario}
                            </td>
                            <td
                              data-label={t("pedidos.statusHeader", "Estado")}
                            >
                              <span
                                className={`badge-status ${r.aprobada ? "status-shipped" : "status-pending"}`}
                              >
                                {r.aprobada
                                  ? t("pedidos.status.aprobada", "Aprobada")
                                  : t("pedidos.status.pendiente", "Pendiente")}
                              </span>
                            </td>
                            <td data-label={t("pedidos.actions", "Acciones")}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => moderarResena(r.id, true)}
                              >
                                {t("admin.approve", "Aprobar")}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{
                                  color: "var(--red)",
                                  marginLeft: "6px",
                                }}
                                onClick={() => moderarResena(r.id, false)}
                              >
                                {t("admin.reject", "Rechazar")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* FIDEICOMISO (ESCROW) */}
              {activeSection === "pagos" && (
                <div className="section active" id="sec-pagos">
                  <div className="table-header">
                    <h3 className="card-title">Transacciones en Fideicomiso</h3>
                  </div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>Pago ID</th>
                          <th>Pedido ID</th>
                          <th>Monto</th>
                          <th>Método</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosFideicomiso.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              style={{
                                textAlign: "center",
                                padding: "24px",
                                color: "var(--text-muted)",
                              }}
                            >
                              No hay transacciones retenidas en fideicomiso.
                            </td>
                          </tr>
                        ) : (
                          pagosFideicomiso.map((p) => (
                            <tr key={p.id}>
                              <td data-label="Pago ID">#{p.id}</td>
                              <td data-label="Pedido ID">#{p.pedidoId}</td>
                              <td data-label="Monto">{formatPrice(p.monto)}</td>
                              <td data-label="Método">{p.metodoPago}</td>
                              <td data-label="Estado">
                                <span className="badge-status status-pending">
                                  {p.estado}
                                </span>
                              </td>
                              <td data-label="Acciones">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => liberarPago(p.id)}
                                >
                                  Liberar Fondos
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    color: "var(--red)",
                                    marginLeft: "6px",
                                  }}
                                  onClick={() => reembolsarPago(p.id)}
                                >
                                  Reembolsar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* FINANZAS */}
              {activeSection === "reportes" && (
                <div
                  className="section active"
                  id="sec-finanzas"
                  style={{ padding: "24px" }}
                >
                  <div
                    className="table-header"
                    style={{ marginBottom: "20px" }}
                  >
                    <h3
                      className="card-title"
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--primary-dark)",
                      }}
                    >
                      Reportes y estadísticas Global
                    </h3>
                  </div>

                  {loadingFinanzas ? (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "var(--text-dim)",
                      }}
                    >
                      Cargando datos financieros...
                    </div>
                  ) : errorFinanzas ? (
                    <div style={{ color: "var(--red)", padding: "20px" }}>
                      {errorFinanzas}
                    </div>
                  ) : finanzasData ? (
                    <div>
                      {/* Financial KPI Cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                          marginBottom: "24px",
                        }}
                      >
                        <div
                          style={{
                            background: "var(--green-bg)",
                            padding: "16px",
                            borderRadius: "8px",
                            border: "1px solid var(--primary-light)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "var(--primary-dark)",
                              textTransform: "uppercase",
                            }}
                          >
                            Ingresos Confirmados
                          </span>
                          <h2
                            style={{
                              fontSize: "1.8rem",
                              color: "var(--primary)",
                              margin: "8px 0 0 0",
                            }}
                          >
                            {formatPrice(finanzasData.totalIngresos || 0)}
                          </h2>
                        </div>
                        <div
                          style={{
                            background: "#fef3c7",
                            padding: "16px",
                            borderRadius: "8px",
                            border: "1px solid #f59e0b",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "#b45309",
                              textTransform: "uppercase",
                            }}
                          >
                            Fondos en Fideicomiso
                          </span>
                          <h2
                            style={{
                              fontSize: "1.8rem",
                              color: "#d97706",
                              margin: "8px 0 0 0",
                            }}
                          >
                            {formatPrice(finanzasData.totalFideicomiso || 0)}
                          </h2>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "20px",
                        }}
                      >
                        {/* Payments by Method */}
                        <div>
                          <h4
                            style={{
                              marginBottom: "12px",
                              fontSize: "0.95rem",
                              fontWeight: "bold",
                              color: "var(--text)",
                            }}
                          >
                            Por Método de Pago
                          </h4>
                          <div className="table-wrap">
                            <table
                              className="table-responsive"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <thead>
                                <tr>
                                  <th>Método</th>
                                  <th>Transacciones</th>
                                  <th>Monto Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(
                                  finanzasData.transaccionesPorMetodo || {},
                                ).length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="3"
                                      style={{ textAlign: "center" }}
                                    >
                                      No hay transacciones
                                    </td>
                                  </tr>
                                ) : (
                                  Object.keys(
                                    finanzasData.transaccionesPorMetodo,
                                  ).map((metodo) => (
                                    <tr key={metodo}>
                                      <td
                                        data-label="Método"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        {metodo.replace("_", " ")}
                                      </td>
                                      <td data-label="Transacciones">
                                        {
                                          finanzasData.transaccionesPorMetodo[
                                            metodo
                                          ]
                                        }
                                      </td>
                                      <td data-label="Monto Total">
                                        {formatPrice(
                                          finanzasData.montoPorMetodo[metodo] ||
                                            0,
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Payments by Status */}
                        <div>
                          <h4
                            style={{
                              marginBottom: "12px",
                              fontSize: "0.95rem",
                              fontWeight: "bold",
                              color: "var(--text)",
                            }}
                          >
                            Por Estado de Transacción
                          </h4>
                          <div className="table-wrap">
                            <table
                              className="table-responsive"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <thead>
                                <tr>
                                  <th>Estado</th>
                                  <th>Transacciones</th>
                                  <th>Monto Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(
                                  finanzasData.transaccionesPorEstado || {},
                                ).length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="3"
                                      style={{ textAlign: "center" }}
                                    >
                                      No hay transacciones
                                    </td>
                                  </tr>
                                ) : (
                                  Object.keys(
                                    finanzasData.transaccionesPorEstado,
                                  ).map((estado) => (
                                    <tr key={estado}>
                                      <td
                                        data-label="Estado"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        {estado.replace("_", " ")}
                                      </td>
                                      <td data-label="Transacciones">
                                        {
                                          finanzasData.transaccionesPorEstado[
                                            estado
                                          ]
                                        }
                                      </td>
                                      <td data-label="Monto Total">
                                        {formatPrice(
                                          finanzasData.montoPorEstado[estado] ||
                                            0,
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "20px",
                          fontSize: "0.85rem",
                          color: "var(--text-dim)",
                          textAlign: "right",
                        }}
                      >
                        Total transacciones registradas:{" "}
                        <strong>{finanzasData.totalTransacciones}</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                      Sin datos disponibles.
                    </div>
                  )}
                </div>
              )}

              {/* LOGISTICA */}
              {activeSection === "reportes-logistica" && (
                <div
                  className="section active"
                  id="sec-logistica"
                  style={{ padding: "24px" }}
                >
                  <div
                    className="table-header"
                    style={{ marginBottom: "20px" }}
                  >
                    <h3
                      className="card-title"
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--primary-dark)",
                      }}
                    >
                      Reporte de Logística y Envíos
                    </h3>
                  </div>

                  {loadingLogistica ? (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "var(--text-dim)",
                      }}
                    >
                      Cargando datos logísticos...
                    </div>
                  ) : errorLogistica ? (
                    <div style={{ color: "var(--red)", padding: "20px" }}>
                      {errorLogistica}
                    </div>
                  ) : logisticaData ? (
                    <div>
                      {/* Logistics KPI Cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "12px",
                          marginBottom: "24px",
                        }}
                      >
                        <div
                          style={{
                            background: "var(--green-bg)",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--primary-light)",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              color: "var(--primary-dark)",
                              textTransform: "uppercase",
                            }}
                          >
                            Total Envíos
                          </span>
                          <h2
                            style={{
                              fontSize: "1.6rem",
                              color: "var(--primary)",
                              margin: "4px 0 0 0",
                            }}
                          >
                            {logisticaData.totalEnvios}
                          </h2>
                        </div>
                        <div
                          style={{
                            background: "#e0f2fe",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #38bdf8",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              color: "#0369a1",
                              textTransform: "uppercase",
                            }}
                          >
                            En Camino
                          </span>
                          <h2
                            style={{
                              fontSize: "1.6rem",
                              color: "#0284c7",
                              margin: "4px 0 0 0",
                            }}
                          >
                            {logisticaData.enviosPorEstado?.["EN_CAMINO"] || 0}
                          </h2>
                        </div>
                        <div
                          style={{
                            background: "#dcfce7",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #4ade80",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              color: "#15803d",
                              textTransform: "uppercase",
                            }}
                          >
                            Entregados
                          </span>
                          <h2
                            style={{
                              fontSize: "1.6rem",
                              color: "#16a34a",
                              margin: "4px 0 0 0",
                            }}
                          >
                            {logisticaData.enviosPorEstado?.["ENTREGADO"] || 0}
                          </h2>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "20px",
                        }}
                      >
                        {/* Shipments by Status */}
                        <div>
                          <h4
                            style={{
                              marginBottom: "12px",
                              fontSize: "0.95rem",
                              fontWeight: "bold",
                              color: "var(--text)",
                            }}
                          >
                            Por Estado del Envío
                          </h4>
                          <div className="table-wrap">
                            <table
                              className="table-responsive"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <thead>
                                <tr>
                                  <th>Estado</th>
                                  <th>Envíos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(
                                  logisticaData.enviosPorEstado || {},
                                ).length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="2"
                                      style={{ textAlign: "center" }}
                                    >
                                      No hay envíos registrados
                                    </td>
                                  </tr>
                                ) : (
                                  Object.keys(
                                    logisticaData.enviosPorEstado,
                                  ).map((estado) => (
                                    <tr key={estado}>
                                      <td
                                        data-label="Estado"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        {estado.replace("_", " ")}
                                      </td>
                                      <td data-label="Envíos">
                                        {logisticaData.enviosPorEstado[estado]}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Shipments by Carrier */}
                        <div>
                          <h4
                            style={{
                              marginBottom: "12px",
                              fontSize: "0.95rem",
                              fontWeight: "bold",
                              color: "var(--text)",
                            }}
                          >
                            Distribución por Transportista
                          </h4>
                          <div className="table-wrap">
                            <table
                              className="table-responsive"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <thead>
                                <tr>
                                  <th>Transportista</th>
                                  <th>Envíos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(
                                  logisticaData.enviosPorTransportista || {},
                                ).length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="2"
                                      style={{ textAlign: "center" }}
                                    >
                                      No hay envíos registrados
                                    </td>
                                  </tr>
                                ) : (
                                  Object.keys(
                                    logisticaData.enviosPorTransportista,
                                  ).map((transportista) => (
                                    <tr key={transportista}>
                                      <td
                                        data-label="Transportista"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        {transportista}
                                      </td>
                                      <td data-label="Envíos">
                                        {
                                          logisticaData.enviosPorTransportista[
                                            transportista
                                          ]
                                        }
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                      Sin datos disponibles.
                    </div>
                  )}
                </div>
              )}

              {/* CUPONES */}
              {activeSection === "cupones" && (
                <div className="section active">
                  <div className="table-header">
                    <h3 className="card-title">
                      Gestión de Cupones de Descuento
                    </h3>
                  </div>

                  <form
                    onSubmit={handleCrearCupon}
                    style={{
                      background: "#f8fafc",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      marginBottom: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: "var(--primary-dark)",
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                      }}
                    >
                      Crear Nuevo Cupón
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                      className="form-row"
                    >
                      <div className="form-group">
                        <label
                          className="form-label"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Código *
                        </label>
                        <input
                          className="form-input"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "0.85rem",
                          }}
                          placeholder="DESCUENTO10"
                          value={nuevoCupon.codigo}
                          onChange={(e) =>
                            setNuevoCupon({
                              ...nuevoCupon,
                              codigo: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Tipo *
                        </label>
                        <select
                          className="form-input"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "0.85rem",
                          }}
                          value={nuevoCupon.tipo}
                          onChange={(e) =>
                            setNuevoCupon({
                              ...nuevoCupon,
                              tipo: e.target.value,
                            })
                          }
                        >
                          <option value="ENVIO_GRATIS">Envío Gratis</option>
                          <option value="PORCENTAJE">
                            Porcentaje de Descuento
                          </option>
                          <option value="MONTO_FIJO">Monto Fijo</option>
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                      className="form-row"
                    >
                      <div className="form-group">
                        <label
                          className="form-label"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Valor Descuento / Porcentaje
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "0.85rem",
                          }}
                          value={nuevoCupon.valor}
                          onChange={(e) =>
                            setNuevoCupon({
                              ...nuevoCupon,
                              valor: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Monto Mínimo Compra
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "0.85rem",
                          }}
                          value={nuevoCupon.montoMinimo}
                          onChange={(e) =>
                            setNuevoCupon({
                              ...nuevoCupon,
                              montoMinimo: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                      className="form-row"
                    >
                      <div className="form-group">
                        <label
                          className="form-label"
                          style={{ fontSize: "0.85rem" }}
                        >
                          ID Usuario (Opcional, vacío para global)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "0.85rem",
                          }}
                          placeholder="Opcional"
                          value={nuevoCupon.usuarioId}
                          onChange={(e) =>
                            setNuevoCupon({
                              ...nuevoCupon,
                              usuarioId: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Fecha Expiración (Opcional)
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "0.85rem",
                          }}
                          value={nuevoCupon.fechaExpiracion}
                          onChange={(e) =>
                            setNuevoCupon({
                              ...nuevoCupon,
                              fechaExpiracion: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      type="submit"
                      style={{ alignSelf: "flex-start", marginTop: "6px" }}
                    >
                      Crear Cupón
                    </button>
                  </form>

                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Monto Min.</th>
                          <th>Usuario ID</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todosCupones.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              style={{
                                textAlign: "center",
                                padding: "16px",
                                color: "var(--text-muted)",
                              }}
                            >
                              No hay cupones registrados.
                            </td>
                          </tr>
                        ) : (
                          todosCupones.map((c) => (
                            <tr key={c.id}>
                              <td
                                data-label="Código"
                                style={{ fontWeight: "bold" }}
                              >
                                {c.codigo}
                              </td>
                              <td data-label="Tipo">{c.tipo}</td>
                              <td data-label="Valor">
                                {c.tipo === "PORCENTAJE"
                                  ? `${c.valor}%`
                                  : formatPrice(c.valor)}
                              </td>
                              <td data-label="Monto Min.">
                                {formatPrice(c.montoMinimo || 0)}
                              </td>
                              <td data-label="Usuario ID">
                                {c.usuarioId || "Global"}
                              </td>
                              <td data-label="Acciones">
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminarCupon(c.id)}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SOPORTE */}
              {activeSection === "soporte" && (
                <div className="section active" id="sec-soporte">
                  <div className="table-header">
                    <div>
                      <h3 className="card-title">Tickets de soporte</h3>
                      <p className="section-subtitle">
                        Centro de atención y seguimiento de incidencias.
                      </p>
                    </div>
                    <button className="table-action" type="button">
                      + Nuevo ticket
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table className="table-responsive">
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Asunto</th>
                          <th>Usuario</th>
                          <th>Estado</th>
                          <th>Prioridad</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminTickets.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="empty-cell">
                              El frontend actual no tiene un endpoint de tickets
                              de soporte. Cuando /admin/dashboard devuelva
                              tickets, se renderizarán automáticamente en esta
                              tabla.
                            </td>
                          </tr>
                        ) : (
                          adminTickets.map((ticket, i) => (
                            <tr key={ticket.id || i}>
                              <td data-label="Ticket">
                                {ticket.codigo ||
                                  ticket.numero ||
                                  ticket.id ||
                                  `#T-${i + 1}`}
                              </td>
                              <td data-label="Asunto">
                                {ticket.asunto || ticket.titulo || "—"}
                              </td>
                              <td data-label="Usuario">
                                {ticket.usuario || ticket.nombreUsuario || "—"}
                              </td>
                              <td data-label="Estado">
                                <span className="badge-status status-pending">
                                  {ticket.estado || "—"}
                                </span>
                              </td>
                              <td data-label="Prioridad">
                                <span className="priority-badge">
                                  {ticket.prioridad || "Media"}
                                </span>
                              </td>
                              <td data-label="Fecha">
                                {ticket.fecha || ticket.fechaCreacion || "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AUDITORIA */}
              {activeSection === "auditoria" && (
                <div className="section active" id="sec-auditoria">
                  <div className="table-header">
                    <div>
                      <h3 className="card-title">Auditoría y actividad</h3>
                      <p className="section-subtitle">
                        Vista preparada para eventos administrativos expuestos
                        por el backend.
                      </p>
                    </div>
                  </div>
                  <div className="audit-grid">
                    <div className="audit-card">
                      <span>Usuarios</span>
                      <strong>{dashboardUsuarios}</strong>
                      <small>registros administrativos</small>
                    </div>
                    <div className="audit-card">
                      <span>Productos</span>
                      <strong>{dashboardProductos}</strong>
                      <small>registros del catálogo</small>
                    </div>
                    <div className="audit-card">
                      <span>Pedidos</span>
                      <strong>{dashboardPedidos}</strong>
                      <small>registros conocidos</small>
                    </div>
                    <div className="audit-card">
                      <span>Tickets</span>
                      <strong>{dashboardTickets}</strong>
                      <small>incidencias conocidas</small>
                    </div>
                  </div>
                  <div className="empty-audit">
                    No se inventa un endpoint de auditoría. Esta vista queda
                    preparada para conectar el contrato real cuando el backend
                    lo exponga.
                  </div>
                </div>
              )}

              {/* CONFIGURACION */}
              {activeSection === "configuracion" && (
                <div className="section active">
                  <div className="table-header">
                    <h3 className="card-title">Configuración del Sistema</h3>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    {/* Costo envío */}
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          marginBottom: "12px",
                          color: "var(--primary-dark)",
                          fontSize: "0.95rem",
                          fontWeight: "bold",
                        }}
                      >
                        Costos de Envío
                      </h4>
                      <div className="form-group" style={{ maxWidth: "300px" }}>
                        <label
                          className="form-label"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Costo de Envío Estándar Nacional (COP)
                        </label>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "6px",
                          }}
                        >
                          <input
                            type="number"
                            className="form-input"
                            value={costoEnvioNacional}
                            onChange={(e) =>
                              setCostoEnvioNacional(Number(e.target.value))
                            }
                          />
                          <button
                            className="btn btn-primary"
                            disabled={guardandoEnvio}
                            onClick={handleGuardarCostoEnvio}
                          >
                            {guardandoEnvio ? "Guardando..." : "Guardar"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mantenimiento mode */}
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          marginBottom: "12px",
                          color: "var(--primary-dark)",
                          fontSize: "0.95rem",
                          fontWeight: "bold",
                        }}
                      >
                        Modo Mantenimiento
                      </h4>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginBottom: "12px",
                        }}
                      >
                        Activar el modo de mantenimiento bloquea el acceso de
                        clientes a la tienda, permitiendo únicamente el acceso
                        de administradores.
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={mantenimientoMode}
                          onChange={(e) => {
                            setMantenimientoMode(e.target.checked);
                            localStorage.setItem(
                              "mantenimiento_mode",
                              e.target.checked,
                            );
                            alert(
                              `Modo mantenimiento ${e.target.checked ? "ACTIVADO" : "DESACTIVADO"}.`,
                            );
                          }}
                          id="chkMantenimiento"
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        />
                        <label
                          htmlFor="chkMantenimiento"
                          style={{ fontWeight: "bold", cursor: "pointer" }}
                        >
                          Activar Modo Mantenimiento
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR INFO ADMIN */}
            <div className="side-info">
              <div
                className="card-table"
                style={{ padding: "24px", marginBottom: "24px" }}
              >
                <h3 className="card-title" style={{ marginBottom: "16px" }}>
                  {t("admin.topProducers", "Top Productores")}
                </h3>
                {Array.isArray(dashboardData?.topProductores) &&
                dashboardData.topProductores.length > 0 ? (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {dashboardData.topProductores.map((p, index) => (
                      <li
                        key={p.productorId ?? index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 0",
                          borderBottom: "1px dashed var(--border-light)",
                        }}
                      >
                        <span>
                          <strong>
                            {index + 1}. {p.nombre || "Productor"}
                          </strong>
                          <small
                            style={{
                              display: "block",
                              color: "var(--text-muted)",
                            }}
                          >
                            {p.pedidos} pedidos
                          </small>
                        </span>
                        <strong>{formatPrice(p.totalVentas || 0)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul style={{ listStyle: "none" }}>
                    <li
                      style={{ padding: "8px 0", color: "var(--text-muted)" }}
                    >
                      {t("admin.noData", "No hay datos suficientes")}
                    </li>
                  </ul>
                )}
              </div>

              <div className="card-table" style={{ padding: "24px" }}>
                <h3 className="card-title" style={{ marginBottom: "16px" }}>
                  {t("admin.earningsSixMonths", "Ingresos 6 Meses")}
                </h3>
                {Array.isArray(dashboardData?.ingresosPorMes) &&
                dashboardData.ingresosPorMes.length > 0 ? (
                  <div style={{ width: "100%" }}>
                    {dashboardData.ingresosPorMes.map((m, index) => {
                      const max = Math.max(
                        ...dashboardData.ingresosPorMes.map(
                          (x) => Number(x.total) || 0,
                        ),
                      );
                      const pct =
                        max > 0 ? Math.round((Number(m.total) / max) * 100) : 0;

                      return (
                        <div
                          key={m.mes ?? index}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "70px 1fr auto",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "8px",
                          }}
                        >
                          <small style={{ color: "var(--text-muted)" }}>
                            {m.etiqueta}
                          </small>
                          <div
                            style={{
                              height: "8px",
                              borderRadius: "6px",
                              background: "var(--border-light, #e2e8f0)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                borderRadius: "6px",
                                background: "var(--primary, #10b981)",
                              }}
                            />
                          </div>
                          <small style={{ fontWeight: 600 }}>
                            {formatPrice(m.total || 0)}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="chart-container" style={{ height: "120px" }}>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      {t("admin.noEarningsData", "Sin datos")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
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
                  <label className="form-label">Nombre del Administrador</label>
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
                  <label className="form-label">Teléfono de Soporte</label>
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
                      setPerfilForm({ ...perfilForm, telefono: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">
                    Correo de Soporte (No editable)
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
                  <label className="form-label">Contraseña Actual</label>
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
                        showCurrentPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showCurrentPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Nueva Contraseña</label>
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
                      {showNewPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ width: "100%" }}
                >
                  Cambiar Contraseña
                </button>
              </form>
            </div>
          </div>
        )}
        {/* FIX: El footer NO debe mostrarse dentro del dashboard de Admin.
            El pie global de la app ya se oculta en /admin (AppFooter) y el
            layout del panel no debe renderizar su propio footer. */}
      </main>
    </div>
  );
}
