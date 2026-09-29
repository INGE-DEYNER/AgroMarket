/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/contexts/ToastContext";
import { descargarCsv, marcaTemporal } from "@/application/support/exportar";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import api, { API_BASE } from "@/infrastructure/http/api";
import ThemeToggle from "@/presentation/shared/components/ThemeToggle";
import Icon from "@/presentation/shared/components/Icon";
import PanelNotificaciones from "@/presentation/shared/components/PanelNotificaciones";
import { rutaDeSeccion, seccionDesdeRuta } from "@/application/security/rutasAdmin";
import AdminShell from "@/presentation/features/admin/components/AdminShell";
import SeccionesAdmin from "@/presentation/features/admin/sections/SeccionesAdmin";
import "@/presentation/styles/admin.css";

/*
 * La navegación por secciones ya no necesita resolver ids del DOM: cada
 * <section> recibe la clase "active" según `activeSection`, así que la clave
 * del menú y la clave del render son la misma.
 *
 * Además, las secciones sensibles se direccionan con un identificador
 * ofuscado (/admin/f2589683424e1c60 en vez de /admin/usuarios). Ver
 * src/application/security/rutasAdmin.js para el alcance real de esto.
 */

export default function Admin() {
  const { t } = useTranslation();
  const { user, setUser, logout, formatPrice } = useAuth();
  const navigate = useNavigate();
  // Avisos en pantalla en vez de window.alert()/confirm(), que congelan la
  // interfaz y no respetan el tema oscuro.
  const toast = useToast();


  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * SECCIONES COMO RUTAS ANIDADAS.
   *
   * Declararlas como rutas hermanas no funciona: en React Router gana la
   * coincidencia más específica y el panel padre no llega a montarse. Van
   * como hijas de /admin, con un index que redirige al resumen.
   *
   * La sección activa sale de la ruta con useParams, y no de un estado propio.
   * Con dos fuentes de verdad (estado y URL) había que sincronizarlas con un
   * efecto, y de ahí salían los fallos. La URL es la única fuente.
   *
   * El parámetro de la ruta es el identificador de la sección, que en las
   * sensibles va ofuscado (ver application/security/rutasAdmin.js), así que
   * se traduce con seccionDesdeRuta antes de compararlo.
   */
  const { seccion: seccionRuta } = useParams();
  const activeSection = seccionDesdeRuta(`/admin/${seccionRuta ?? ""}`) ?? seccionRuta ?? "dashboard";


  /*
   * NAVEGACIÓN POR SECCIONES (SPA).
   *
   * La sección activa la determina la ruta, no un estado local. Antes había dos
   * fuentes de verdad (el estado y la URL) y había que sincronizarlas con un
   * efecto, que es exactamente donde aparecieron los fallos. Con la ruta como
   * única fuente desaparece esa posibilidad: se lee con useParams y se navega
   * con rutaDeSeccion, que mantiene los identificadores ofuscados de las
   * secciones sensibles.
   */
  const showSection = useCallback(
    (key) => navigate(rutaDeSeccion(key)),
    [navigate],
  );

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

  // Perfil: los formularios se sincronizan con el usuario en cuanto hay sesión.
  useEffect(() => {
    if (!user) {
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
  }, [user]);

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
      // El backend espera los nombres en inglés (`UpdateProfileRequest`);
      // mandar `{nombre, telefono}` lo descartaba en silencio.
      const res = await api.put("/usuarios/me", {
        firstName: perfilForm.nombre.trim(),
        phone: perfilForm.telefono.trim(),
      });
      const actualizado = res.data || res;
      setUser({
        ...user,
        nombre: actualizado.firstName || perfilForm.nombre,
        telefono: actualizado.phone || perfilForm.telefono,
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
      // `ChangePasswordRequest` espera `currentPassword` / `newPassword`.
      await api.put("/usuarios/me/contrasena", {
        currentPassword: pwForm.contrasenaActual,
        newPassword: pwForm.nuevaContrasena,
      });
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
  const [mantenimientoMode, setMantenimientoMode] = useState(false);

  // Admin messaging state - para enviar mensajes a usuarios
  const [mensajeUsuarios, setMensajeUsuarios] = useState([]);
  const [mensajeForm, setMensajeForm] = useState({
    usuarioId: "",
    tipo: "NEW_MESSAGE",
    contenido: "",
  });
  const [mensajeMsg, setMensajeMsg] = useState({ type: "", text: "" });
  const [searchMensajeUsuarios, setSearchMensajeUsuarios] = useState("");
  const [searchMensajeInput, setSearchMensajeInput] = useState("");
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  // Modo mantenimiento: la fuente de verdad es el backend (app_config),
  // compartida por TODOS los navegadores. Reemplaza el localStorage previo,
  // que solo afectaba al navegador del admin.
  useEffect(() => {
    let mounted = true;
    api
      .get("/config/system")
      .then((res) => {
        const data = res?.data || res;
        if (mounted) setMantenimientoMode(Boolean(data?.mantenimiento));
      })
      .catch((err) => console.error("Error cargando mantenimiento:", err));
    return () => {
      mounted = false;
    };
  }, []);

  // El contador de la campana lo lleva ahora PanelNotificaciones, que
  // consulta el endpoint al abrirse. Aquí ya no hace falta sondear cada
  // 30 s: el componente carga bajo demanda y marca al leer.

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
      const data = await api.get("/pagos/escrow");
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

  useEffect(() => {
    void loadPagosFideicomiso();
  }, [loadPagosFideicomiso]);

  const loadTodosCupones = useCallback(async () => {
    try {
      const res = await api.get("/cupones/todos");
      setTodosCupones(extractArray(res));
    } catch (err) {
      console.error("Error loadTodosCupones:", err);
    }
  }, [extractArray]);

  // Debounced search for messaging users
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchMensajeUsuarios(searchMensajeInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchMensajeInput]);

  // Contactos del chat de mensajería (solo cuando esa vista está abierta).
  useEffect(() => {
    let mounted = true;
    const loadMensajeUsuarios = async () => {
      try {
        const res = await api.get(
          `/admin/usuarios?page=0&size=100&search=${searchMensajeUsuarios}`,
        );
        const data = res.data || res;
        if (mounted) {
          setMensajeUsuarios(Array.isArray(data) ? data : data?.content || []);
        }
      } catch (err) {
        console.error("Error loading users for messaging:", err);
      }
    };
    void loadMensajeUsuarios();
    return () => {
      mounted = false;
    };
  }, [searchMensajeUsuarios]);

  // Send message to user
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    setMensajeMsg({ type: "", text: "" });

    if (!mensajeForm.usuarioId) {
      setMensajeMsg({ type: "error", text: "Debe seleccionar un usuario." });
      return;
    }
    if (!mensajeForm.contenido.trim()) {
      setMensajeMsg({
        type: "error",
        text: "El mensaje no puede estar vacío.",
      });
      return;
    }

    setEnviandoMensaje(true);
    try {
      await api.post("/notifications", {
        recipientId: Number(mensajeForm.usuarioId),
        type: mensajeForm.tipo,
        content: mensajeForm.contenido.trim(),
      });
      setMensajeMsg({
        type: "success",
        text: "Mensaje enviado exitosamente al usuario.",
      });
      setMensajeForm({ usuarioId: "", tipo: "NEW_MESSAGE", contenido: "" });
    } catch (err) {
      setMensajeMsg({
        type: "error",
        text: err.message || "Error al enviar el mensaje.",
      });
    } finally {
      setEnviandoMensaje(false);
    }
  };

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
      const data = await api.get("/admin/dashboard");
      setFinanzasData({
        totalIngresos: Number(data?.ingresos || 0),
        totalFideicomiso: 0,
        transaccionesPorMetodo: {},
        montoPorMetodo: {},
        transaccionesPorEstado: {},
        montoPorEstado: {},
        totalTransacciones: Number(data?.pedidosTotales || 0),
        ingresosPorMes: data?.ingresosPorMes || [],
      });
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
      const shipments = await api.get("/envios");
      const list = Array.isArray(shipments)
        ? shipments
        : shipments?.content || [];
      const enviosPorEstado = list.reduce((counts, shipment) => {
        const estado = shipment.estado || shipment.state || "SIN_ESTADO";
        counts[estado] = (counts[estado] || 0) + 1;
        return counts;
      }, {});
      const enviosPorTransportista = list.reduce((counts, shipment) => {
        const transportista =
          shipment.transportista || shipment.carrier || "SIN_TRANSPORTISTA";
        counts[transportista] = (counts[transportista] || 0) + 1;
        return counts;
      }, {});
      setLogisticaData({
        totalEnvios: list.length,
        enviosPorEstado,
        enviosPorTransportista,
      });
    } catch (err) {
      console.error("Error loading logistica:", err);
      setErrorLogistica(err.message || "Error al cargar reporte de logística.");
    } finally {
      setLoadingLogistica(false);
    }
  }, []);

  // Paginación y búsqueda de usuarios: solo aplican a su propia sección.
  useEffect(() => {
    if (activeSection !== "usuarios") return undefined;
    void loadUsuarios();
    return undefined;
  }, [
    activeSection,
    pageUsuarios,
    searchUsuarios,
    loadUsuarios,
  ]);

  // Paginación y búsqueda de productos: solo aplican a su propia sección.
  useEffect(() => {
    if (activeSection !== "productos") return undefined;
    void loadProductos();
    return undefined;
  }, [activeSection, pageProductos, searchProductos, loadProductos]);

  /*
   * CARGA DINÁMICA POR SECCIÓN.
   *
   * El dashboard muestra una sola vista a la vez, así que se pide únicamente
   * lo que esa vista necesita, y solo la primera vez que se abre. Antes se
   * disparaban las seis peticiones nada más montar.
   *
   * Este bloque va DESPUÉS de las declaraciones de loadFinanzas,
   * loadLogistica y loadTodosCupones: referenciarlas antes de su
   * declaración `const` las deja en zona muerta temporal y React lanza
   * "Cannot access before initialization", dejando la página en blanco.
   */
  const seccionesCargadas = useRef(new Set());

  useEffect(() => {
    const marca = activeSection;
    if (seccionesCargadas.current.has(marca)) return undefined;
    seccionesCargadas.current.add(marca);

    const timer = setTimeout(() => {
      switch (marca) {
        case "finanzas":
          void loadFinanzas();
          break;
        case "logistica":
          void loadLogistica();
          break;
        case "cupones":
          void loadTodosCupones();
          break;
        default:
          break;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [activeSection, loadFinanzas, loadLogistica, loadTodosCupones]);

  // Los totales del encabezado se necesitan desde el inicio.
  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const liberarPago = async (pagoId) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea liberar estos fondos al productor?",
      )
    )
      return;
    try {
      await api.patch(`/pagos/${pagoId}/release`);
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
      await api.patch(`/pagos/${pagoId}/refund`);
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

  /*
   * Respaldo del reporte: si el backend no responde con el PDF (404 de un
   * backend desplegado antiguo, 500 real, etc.), se genera un reporte
   * imprimible con los datos que ya están cargados en el panel.
   */
  const generarReporteImprimible = () => {
    const d = dashboardData || {};
    const esc = (v) =>
      String(v == null ? "—" : v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;");
    const kpis = [
      ["Usuarios totales", d.usuariosTotales],
      ["Productores activos", d.productores],
      ["Productos publicados", d.productosPublicados],
      ["Pedidos totales", d.pedidosTotales],
      [
        "Ingresos confirmados",
        d.ingresos != null ? formatPrice(d.ingresos) : null,
      ],
      ["Ventas de hoy", d.ventasHoy != null ? formatPrice(d.ventasHoy) : null],
      ["Nuevos usuarios (30 días)", d.nuevosUsuarios],
      ["Nuevos productores (30 días)", d.nuevosProductores],
    ];
    const estados = [
      ["Entregados", d.pedidosEntregados ?? 0],
      ["En camino (enviados)", d.pedidosEnCamino ?? 0],
      ["Pendientes", d.pedidosPendientes ?? 0],
      ["Cancelados", d.pedidosCancelados ?? 0],
    ];
    const top = Array.isArray(d.topProductores) ? d.topProductores : [];
    const meses = Array.isArray(d.ingresosPorMes) ? d.ingresosPorMes : [];

    const fila = (a, b) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`;
    const topFilas = top.length
      ? top
          .map(
            (t, i) =>
              `<tr><td>${i + 1}</td><td>${esc(t.nombre)}</td><td>${t.pedidos}</td><td>$ ${esc(t.totalVentas)}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="4">Sin datos</td></tr>`;
    const mesFilas = meses.length
      ? meses
          .map(
            (m) =>
              `<tr><td>${esc(m.etiqueta)}</td><td>$ ${esc(m.total)}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="2">Sin datos</td></tr>`;

    const win = window.open("", "_blank", "width=920,height=760");
    if (!win) {
      alert(
        "El navegador bloqueó la ventana del reporte. Habilita las ventanas emergentes para este sitio e intenta de nuevo.",
      );
      return;
    }
    win.document.write(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Reporte AgroMarket</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#111827;margin:36px;}
  h1{color:#0a5a27;margin:0 0 4px;font-size:24px;}
  h2{color:#11823b;font-size:15px;margin:22px 0 8px;border-bottom:2px solid #e2e8f0;padding-bottom:4px;}
  .meta{color:#667280;font-size:12px;margin-bottom:18px;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{background:#e8f5e9;color:#0a5a27;text-align:left;padding:7px 9px;border:1px solid #d9e5dc;}
  td{padding:6px 9px;border:1px solid #d9e5dc;}
  @media print{button{display:none}}
</style></head><body>
<h1>AgroMarket · ASAFRUT</h1>
<div class="meta">Reporte general de la plataforma — ${new Date().toLocaleString("es-CO")}</div>
<h2>1. Indicadores generales</h2>
<table><tbody>${kpis.map(([k, v]) => fila(k, v)).join("")}</tbody></table>
<h2>2. Pedidos por estado</h2>
<table><tbody>${estados.map(([k, v]) => fila(k, v)).join("")}</tbody></table>
<h2>3. Top productores</h2>
<table><thead><tr><th>#</th><th>Productor</th><th>Pedidos</th><th>Total ventas</th></tr></thead><tbody>${topFilas}</tbody></table>
<h2>4. Ingresos por mes (últimos 6)</h2>
<table><thead><tr><th>Mes</th><th>Ingresos</th></tr></thead><tbody>${mesFilas}</tbody></table>
<p style="margin-top:24px;color:#667280;font-size:11px;">Reporte generado desde el panel de administración de AgroMarket.</p>
<button onclick="window.print()" style="padding:10px 16px;background:#11823b;color:#fff;border:0;border-radius:8px;font-weight:700;cursor:pointer;">Imprimir / Guardar PDF</button>
</body></html>`);
    win.document.close();
    win.focus();
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem("token");
      toast.info(t("admin.generatingReportAlert", "Generando reporte PDF..."));

      const res = await fetch(`${API_BASE}/admin/reportes/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        /*
         * Antes se abría un window.confirm() para ofrecer el reporte
         * imprimible. Es bloqueante y corta el render de React. Ahora se avisa
         * y se genera el imprimible directamente: es lo mismo de útil sin
         * congelar la pantalla.
         */
        toast.warning(
          `El servidor respondió ${res.status}. Se genera el reporte imprimible con los datos del panel.`,
        );
        generarReporteImprimible();
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte-mensual.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Reporte mensual descargado (reporte-mensual.pdf).");
    } catch (err) {
      toast.error(
        err?.isNetworkError
          ? `Sin conexión con el backend. ${err.message}`
          : `No se pudo descargar el PDF. Se genera el reporte imprimible.`,
      );
      generarReporteImprimible();
    }
  };

  /**
   * Exporta la tabla de pedidos a CSV.
   *
   * Se genera en el navegador con los datos que la tabla ya tiene cargados,
   * así que no depende de un endpoint ni de una segunda petición.
   */
  const exportarPedidos = () => {
    if (adminPedidos.length === 0) {
      toast.warning("No hay pedidos para exportar todavía.");
      return;
    }

    const columnas = ["Pedido", "Cliente", "Total", "Estado", "Fecha"];
    const filas = adminPedidos.map((p) => [
      p.id ?? p.codigo ?? "",
      p.cliente ?? p.comprador?.nombre ?? p.buyerName ?? "",
      p.total ?? p.totalAmount ?? p.amount ?? "",
      p.estado ?? p.status ?? "",
      p.fecha ?? p.createdAt ?? "",
    ]);

    try {
      descargarCsv(`pedidos-${marcaTemporal()}`, columnas, filas);
      toast.success(
        `Se exportaron ${filas.length} pedido${filas.length === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      toast.error(error.message || "No se pudo generar el archivo.");
    }
  };

  /*
   * Tickets de soporte.
   *
   * Antes solo se leían del resumen del dashboard, que no los trae, así que la
   * tabla de soporte salía siempre vacía. Ahora se piden a su endpoint real
   * (GET /mensajes/tickets), que para un administrador devuelve todos.
   */
  const [tickets, setTickets] = useState([]);

  const loadTickets = useCallback(async () => {
    try {
      const res = await api.get("/mensajes/tickets");
      setTickets(extractArray(res));
    } catch (err) {
      console.error("Error loadTickets:", err);
      setTickets([]);
    }
  }, [extractArray]);

  // Se cargan al montar (el contador del resumen los necesita siempre) y de
  // nuevo cada vez que se abre la vista de Soporte.
  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  /** Exporta los tickets de soporte a CSV. */
  const exportarTickets = () => {
    if (adminTickets.length === 0) {
      toast.warning("No hay tickets para exportar todavía.");
      return;
    }

    const columnas = ["Ticket", "Asunto", "Usuario", "Estado", "Mensajes"];
    const filas = adminTickets.map((t) => [
      t.id ?? "",
      t.subject ?? "",
      t.creatorUsername ?? "",
      t.status ?? "",
      Array.isArray(t.messages) ? t.messages.length : 0,
    ]);

    try {
      descargarCsv(`tickets-${marcaTemporal()}`, columnas, filas);
      toast.success(
        `Se exportaron ${filas.length} ticket${filas.length === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      toast.error(error.message || "No se pudo generar el archivo.");
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

  /**
   * Formatea la fecha de un ticket. El backend la devuelve como
   * LocalDateTime ISO ("2026-09-28T14:32:10"); se muestra en formato
   * colombiano corto y, si no se puede interpretar, se devuelve tal cual
   * para no dejar la celda vacía.
   */
  const formatearFechaTicket = (valor) => {
    if (!valor) return "—";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return String(valor);
    return fecha.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const adminPedidos = getDashboardCollection(
    "pedidos",
    "ultimosPedidos",
    "recentOrders",
    "ordenes",
  );
  const adminTickets = tickets.length
    ? tickets
    : getDashboardCollection("tickets", "ticketsSoporte", "soporte");
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
  /*
   * Estado que consumen las secciones, expuesto por contexto.
   *
   * Antes pasaba por el ámbito del componente, imposible de mantener con el
   * Outlet: las secciones se montan por ruta y ya no son hijas del padre. Este
   * objeto es el único punto de unión; si una sección necesita un campo
   * nuevo, se añade aquí.
   */
  const estadoAdmin = {
    // Dashboard
    dashboardData, dashboardUsuarios, dashboardProductores, dashboardPedidos,
    dashboardProductos, dashboardTickets, dashboardVentasHoy,
    dashboardNuevosUsuarios, dashboardNuevosProductores,
    // Usuarios
    usuariosFiltrados, usuariosPendientes, pageUsuarios, setPageUsuarios,
    totalElementsUsuarios, totalPagesUsuarios, searchUsuariosInput,
    setSearchUsuariosInput, handleAprobarUsuario, handleRechazarUsuario,
    toggleUsuarioActivo, toggleVerificarProductor,
    // Productos
    productos, pageProductos, setPageProductos, totalElementsProductos,
    totalPagesProductos, searchProductosInput, setSearchProductosInput,
    eliminarProducto,
    // Productores
    productores,
    // Mensajería
    mensajeUsuarios, searchMensajeInput, setSearchMensajeInput,
    mensajeForm, setMensajeForm, mensajeMsg, enviandoMensaje, handleEnviarMensaje,
    // Pedidos
    adminPedidos, loadAll, exportarPedidos,
    // Pagos
    pagosFideicomiso, liberarPago, reembolsarPago,
    // Finanzas / Logística
    finanzasData, loadingFinanzas, errorFinanzas,
    logisticaData, loadingLogistica, errorLogistica,
    // Cupones
    todosCupones, nuevoCupon, setNuevoCupon, handleCrearCupon, handleEliminarCupon,
    // Soporte
    adminTickets, formatearFechaTicket, exportarTickets,
    // Reseñas
    resenas, moderarResena,
    // Configuración
    mantenimientoMode, setMantenimientoMode,
    // Perfil
    perfilForm, setPerfilForm, perfilMsg, pwForm, setPwForm, pwMsg,
    showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword,
    handleUpdatePerfil, handleUpdatePassword,
    // Navegación
    showSection,
  };



  return (
    <div className="app-layout admin-dashboard">
      {/* Overlay para sidebar móvil */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/*
         * Logo: enlace a la portada pública.
         *
         * Importante: es un <Link> de React Router, NO el botón de "Cerrar
         * sesión". Navegar a "/" no desmonta el Proveedor de autenticación ni
         * limpia la sesión, así que el administrador sigue conectado y puede
         * volver al panel desde la portada sin volver a iniciar sesión.
         */}
        <Link
          to="/"
          className="sidebar-logo"
          aria-label="Ir a la portada de AgroMarket"
        >
          <img
            src="/agromarket/logo.png"
            alt="AgroMarket"
            width="30"
            height="30"
            loading="eager"
          />
          <span className="sidebar-logo__texto">
            <strong>AgroMarket</strong>
            <small>Panel de administración</small>
          </span>
        </Link>

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
          ["dashboard", t("admin.nav.dashboard", "Dashboard"), "home"],
          ["usuarios", t("admin.nav.users", "Usuarios"), "users"],
          ["mensajeria", t("admin.nav.messaging", "Mensajería"), "message"],
          ["productos", t("admin.nav.products", "Productos"), "package"],
          ["pedidos", t("admin.nav.orders", "Pedidos"), "box"],
          ["productores", t("admin.nav.producers", "Productores"), "leaf"],
          ["pagos", t("admin.nav.payments", "Pagos"), "card"],
          ["finanzas", t("admin.nav.reports", "Reportes"), "calendar"],
          ["logistica", t("admin.nav.logistics", "Logística"), "truck"],
          ["cupones", t("admin.nav.coupons", "Cupones"), "ticket"],
          ["resenas", t("admin.nav.reviews", "Reseñas"), "star"],
          ["configuracion", t("admin.nav.settings", "Configuración"), "settings"],
          ["soporte", t("admin.nav.support", "Soporte"), "info"],
          ["auditoria", t("admin.nav.audit", "Auditoría"), "shield"],
        ].map(([section, label, icon]) => (
          <NavLink
            key={section}
            to={rutaDeSeccion(section)}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sidebar-icon" aria-hidden="true">
              <Icon name={icon} size={17} />
            </span>
            {label}
            {section === "pedidos" && adminPedidos.length > 0 && (
              <span className="sidebar-badge">{adminPedidos.length}</span>
            )}
          </NavLink>
        ))}

        <div className="sidebar-divider"></div>
        {/*
         * "Mi Perfil" se abre DENTRO del panel (sección sec-perfil) en vez de
         * navegar a /perfil y dejar el dashboard. Antes era un <Link>, así que
         * salía del panel y el usuario perdía el contexto.
         */}
        <button
          type="button"
          className={`sidebar-link${activeSection === "perfil" ? " active" : ""}`}
          onClick={() => {
            showSection("perfil");
            setSidebarOpen(false);
          }}
        >
          <span className="sidebar-icon" aria-hidden="true">
            ◎
          </span>
          {t("profile.title", "Mi Perfil")}
        </button>

        <a
          href="#"
          className="sidebar-link"
          style={{ marginTop: "auto", color: "var(--red)" }}
          onClick={async (e) => {
            e.preventDefault();
            // AuthContext.logout() redirige al home 0.3 s después de limpiar
            // la sesión (comportamiento global para todos los roles).
            await logout();
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
            {t("admin.searchPlaceholder", "Buscar en AgroMarket...")}{" "}
            <span>⌕</span>
          </div>
          <div className="admin-top-actions">
            <PanelNotificaciones userId={user?.id} />
            <span className="admin-user-avatar">
              {(user?.nombre || "A").slice(0, 1).toUpperCase()}
            </span>
            <span className="admin-user-name">
              {user?.nombre || "Admin"}
              <small>Administrador</small>
            </span>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/*
         * El encabezado y las tarjetas de métricas SOLO existen en el
         * Dashboard. Antes vivían sueltos en el <main>, fuera de cualquier
         * .section, por lo que se renderizaban siempre y aparecían también
         * en Mensajería, Usuarios o Mi Perfil: el contenido de una sección se
         * colaba en las demás.
         */}
        {activeSection === "dashboard" && (
          <>

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
          </>
        )}

          {/*
           * Solo el resumen (Dashboard) usa dos columnas: "Top Productores" e
           * "Ingresos 6 Meses" van en la lateral. El resto de secciones
           * (Usuarios, Mensajería, Pedidos...) necesitan TODO el ancho; con la
           * rejilla 2fr/1fr quedaban encerradas en la columna estrecha y sus
           * formularios salían recortados.
           */}
          <div className="admin-content">
            <AdminShell valor={estadoAdmin}>
              <SeccionesAdmin />
            </AdminShell>
          </div>
        </main>
    </div>
  );
}
