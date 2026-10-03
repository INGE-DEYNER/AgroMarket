import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import CartDrawer from "@/presentation/shared/components/CartDrawer";
import api, { API_BASE } from "@/infrastructure/http/api";
import { useMensajeriaStream } from "@/application/messaging/useMessaging";
import {
  normalizarMensaje,
  normalizarPedido,
} from "@/infrastructure/normalizar";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import { NAV_COMPRADOR } from "@/application/navigation/navConfig";
import DashboardShell from "@/presentation/shared/layout/DashboardShell";
import CompradorShell from "@/presentation/features/order/components/CompradorShell";
import SeccionesComprador from "@/presentation/features/order/sections/SeccionesComprador";
import "@/presentation/styles/catalogo.css";
/*
 * Sin este import, TODAS las reglas de .buyer-dashboard de comprador.css
 * (ocultar secciones, tarjeta activa, cabeceras compactas, .perfil-*) nunca
 * se aplicaban a este componente: solo se cargaban cuando BuyerShell los
 * importaba. Por eso las 9 secciones quedaban apiladas (sin SPA) y con las
 * fuentes por defecto. Debe ir DESPUÉS de styles.css, que se carga en
 * main.jsx.
 */
import "@/presentation/styles/comprador.css";
import "@/presentation/styles/envios.css";
import "@/presentation/styles/mensajeria.css";
import "@/presentation/styles/resenas.css";
import Icon from "@/presentation/shared/components/Icon";

const CATEGORIES = [
  { label: "Todos", emoji: "", value: "" },
  { label: "Frutas", emoji: "", value: "Frutas" },
  { label: "Verduras", emoji: "", value: "Verduras" },
  { label: "Tubérculos", emoji: "", value: "Tubérculos" },
  { label: "Granos", emoji: "", value: "Granos" },
  { label: "Otros", emoji: "", value: "Otros" },
];

/*
 * NO hay lista fija de productos para reseñar. Antes se usaba una constante
 * `REVIEW_PRODUCTOS` con nombres inventados ("Banano Urabá", "Piña Manzana"…)
 * que además rompía el envío: el backend exige `productId` numérico y recibía
 * un texto, así que la reseña nunca se guardaba. Ahora el selector usa el
 * catálogo real que ya carga el dashboard.
 */

export default function DashboardComprador() {
  const { t, i18n } = useTranslation();
  const extractArray = useCallback((res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (res.data.content && Array.isArray(res.data.content)) {
        return res.data.content;
      }
    }
    if (res.content && Array.isArray(res.content)) return res.content;
    return [];
  }, []);
  const { user, setUser, formatPrice } = useAuth();
  const navigate = useNavigate();

  /*
   * SECCIONES COMO RUTAS ANIDADAS.
   *
   * Antes la sección activa vivía en un estado local y la URL solo se leía al
   * montar: el enlace no era compartible y el botón "atrás" no funcionaba entre
   * secciones. Con dos fuentes de verdad había que sincronizarlas, y de ahí
   * salían los fallos (ya pasó en Productor y Admin). Ahora la ruta es la
   * única fuente: se lee con useParams y se navega con showSection.
   */
  const { seccion: seccionActual } = useParams();
  const activeSection = seccionActual ?? "resumen";

  const showSection = useCallback(
    (key) => navigate(`/dashboard-comprador/${key}`),
    [navigate],
  );

  // Chat/Mensajeria state
  const [contactos, setContactos] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const chatRef = useRef(null);

  // Pedidos & Catalog state
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);

  // Catalog state
  const { addToCart, count } = useCart();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [filtroTipoCatalog, setFiltroTipoCatalog] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [soloPromo, setSoloPromo] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Debounced search logic for catalog
  useEffect(() => {
    const handler = setTimeout(() => {
      setCatalogSearch(catalogSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [catalogSearchQuery]);

  // Shipments state
  const [shipments, setShipments] = useState([]);
  const [historialEnvios, setHistorialEnvios] = useState([]);
  const [expandedShipmentId, setExpandedShipmentId] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rProducto, setRProducto] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [reviewErrors, setReviewErrors] = useState({});

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

  // Invoices and Payment states
  const [facturas, setFacturas] = useState([]);
  const [checkoutPedido, setCheckoutPedido] = useState(null);
  const [metodoPago, setMetodoPago] = useState("PSE");
  const [pagoModalOpen, setPagoModalOpen] = useState(false);

  const getGroupedPedidos = (itemsList) => {
    const groups = {};
    itemsList.forEach((p) => {
      if (p.checkoutId) {
        if (!groups[p.checkoutId]) {
          groups[p.checkoutId] = {
            id: p.id,
            isGrouped: true,
            checkoutId: p.checkoutId,
            compradorNombre: p.compradorNombre,
            items: [],
            total: 0,
            estado: p.estado,
            fechaCreacion: p.fechaCreacion,
            originalPedidos: [],
          };
        }
        groups[p.checkoutId].items.push(p);
        groups[p.checkoutId].total += Number(p.total || 0);
        groups[p.checkoutId].originalPedidos.push(p);
        if (p.estado?.toLowerCase() === "pendiente") {
          groups[p.checkoutId].estado = p.estado;
        }
      } else {
        const singleKey = `SINGLE-${p.id}`;
        groups[singleKey] = {
          ...p,
          isGrouped: false,
          items: [p],
          originalPedidos: [p],
        };
      }
    });
    return Object.values(groups);
  };

  const getGroupedFacturas = (invoiceList) => {
    const groups = {};
    invoiceList.forEach((f) => {
      if (f.checkoutId) {
        if (!groups[f.checkoutId]) {
          groups[f.checkoutId] = {
            id: f.id,
            isGrouped: true,
            checkoutId: f.checkoutId,
            numeroFactura: `FAC-${f.checkoutId}`,
            pedidoId: f.pedidoId,
            subtotal: 0,
            impuesto: 0,
            total: 0,
            fechaEmision: f.fechaEmision,
            estado: f.estado,
            originalFacturas: [],
          };
        }
        groups[f.checkoutId].subtotal += Number(f.subtotal || 0);
        groups[f.checkoutId].impuesto += Number(f.impuesto || 0);
        groups[f.checkoutId].total += Number(f.total || 0);
        groups[f.checkoutId].originalFacturas.push(f);
      } else {
        const singleKey = `SINGLE-${f.id}`;
        groups[singleKey] = {
          ...f,
          isGrouped: false,
          originalFacturas: [f],
        };
      }
    });
    return Object.values(groups);
  };

  const descargarPdfGroup = (groupedFactura) => {
    if (
      groupedFactura.originalFacturas &&
      groupedFactura.originalFacturas.length > 0
    ) {
      descargarPdf(groupedFactura.originalFacturas[0].id);
    }
  };

  // RFQ (Licitaciones) states
  const [rfqs, setRfqs] = useState([]);
  const [rfqForm, setRfqForm] = useState({
    tipoFruta: "BANANO",
    cantidadRequerida: "",
    descripcion: "",
    fechaLimite: "",
  });
  const [rfqMsg, setRfqMsg] = useState({ type: "", text: "" });

  const loadFacturas = useCallback(async () => {
    try {
      const data = await api.get("/facturas/mis-facturas");
      const list = extractArray(data).map((f) => ({
        ...f,
        numeroFactura: f.invoiceNumber || `FAC-${f.id}`,
        pedidoId: f.orderId ?? f.id,
        subtotal: Number(f.subtotal || 0),
        impuesto: Number(f.tax || 0),
        total: Number(f.total || 0),
        fechaEmision: f.issueDate || null,
        estado: f.estado || "Pagada",
      }));
      setFacturas(list);
    } catch (err) {
      console.error("Error loadFacturas:", err);
      setFacturas([]);
    }
  }, [extractArray]);

  const descargarPdf = (facturaId) => {
    const token = localStorage.getItem("token");
    // URL real del backend: /api/v1/facturas/{id}/pdf (alias -> /invoices/{id}/pdf)
    const url = `${API_BASE}/facturas/${facturaId}/pdf`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `factura-${facturaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert("Error al descargar el PDF: " + err.message));
  };

  const currentDate = new Date().toLocaleDateString(i18n.language || "es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const loadPedidos = useCallback(async () => {
    try {
      const data = await api.get("/pedidos/mis-pedidos");
      setPedidos(extractArray(data).map(normalizarPedido));
    } catch (err) {
      console.error("Error loadPedidos:", err);
      setPedidos([]);
    }
  }, [extractArray, user?.id]);

  // Initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPedidos();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPedidos]);

  // Carga de contactos de mensajería.
  //
  // IMPORTANTE: esta constante se declara ANTES de los efectos que la
  // referencian dentro de su array de dependencias. Los arrays de
  // dependencias se evalúan de forma síncrona durante el render, así que
  // declararla más abajo lanzaba
  // "ReferenceError: Cannot access 'loadContactos' before initialization"
  // (TDZ) y el dashboard del comprador no montaba nunca.
  const loadContactos = useCallback(async () => {
    try {
      /*
       * `mis-conversaciones` y no `contactos`: este último devuelve el
       * catálogo completo de usuarios del rol contrario, así que el usuario
       * veía en su bandeja a productores y compradores con los que nunca
       * había escrito. La bandeja debe mostrar solo conversaciones reales.
       *
       * Si el usuario no tiene ninguna, se recurre a `contactos` para que un
       * comprador nuevo pueda iniciar la primera conversación escribiendo a un
       * productor (o al revés).
       */
      let data = await api.get("/mensajes/mis-conversaciones");
      if (!extractArray(data).length) {
        data = await api.get("/mensajes/contactos");
      }
      const list = extractArray(data).map((c) => ({
        ...c,
        id: c.id || c.usuarioId,
      }));
      setContactos(list);
    } catch (err) {
      console.error("Error loadContactos:", err);
      setContactos([]);
    }
  }, [extractArray, setContactos]);

  // TIEMPO REAL: sondea contactos y conversación activa.
  // Solo mientras la sección de mensajería está visible.
  useEffect(() => {
    if (activeSection !== "mensajeria") return undefined;
    const contactosTimer = setInterval(() => void loadContactos(), 10000);
    return () => clearInterval(contactosTimer);
  }, [loadContactos, activeSection]);

  useEffect(() => {
    if (activeSection !== "mensajeria") return undefined;
    if (!selectedContact) return undefined;
    const conversacionTimer = setInterval(async () => {
      try {
        const data = await api.get(
          `/mensajes/conversacion/${selectedContact.id}`,
        );
        setMessages(
          extractArray(data).map((m) => normalizarMensaje(m, user?.id)),
        );
      } catch {
        /* silencioso: la siguiente iteración reintenta */
      }
    }, 3500);
    return () => clearInterval(conversacionTimer);
  }, [selectedContact, user, extractArray]);

  /*
   * TIEMPO REAL (SSE): el backend empuja el mensaje y se agrega al instante a
   * la conversación abierta. El sondeo de arriba queda como respaldo por si el
   * canal se cae. Solo se emiten mensajes permitidos por las reglas de
   * comunicación (Comprador ↔ Productor y Administración → usuario).
   */
  const handleMensajeTiempoReal = useCallback(
    (evento) => {
      if (evento?.event !== "message" || !evento.data) return;

      const nuevo = evento.data;
      const esMio = String(nuevo.senderId) === String(user?.id);
      const otro = esMio ? nuevo.recipientId : nuevo.senderId;

      if (!selectedContact || String(selectedContact.id) !== String(otro)) {
        if (!esMio) void loadContactos();
        return;
      }

      setMessages((prev) => {
        if (
          nuevo.id != null &&
          prev.some((m) => String(m.id) === String(nuevo.id))
        ) {
          return prev;
        }
        return [...prev, normalizarMensaje(nuevo, user?.id)];
      });
    },
    [loadContactos, selectedContact, user?.id],
  );

  useMensajeriaStream({
    enabled: Boolean(user),
    onEvent: handleMensajeTiempoReal,
  });

  const loadRfqs = useCallback(async () => {
    try {
      const data = await api.get(`/rfq/buyer/${user.id}`);
      setRfqs(extractArray(data));
    } catch (err) {
      console.error("Error loadRfqs:", err);
      setRfqs([]);
    }
  }, [extractArray]);

  const crearRfq = async (e) => {
    e.preventDefault();
    setRfqMsg({ type: "", text: "" });
    if (!rfqForm.cantidadRequerida || !rfqForm.fechaLimite) {
      setRfqMsg({
        type: "error",
        text: "Por favor complete todos los campos obligatorios.",
      });
      return;
    }
    try {
      await api.post(`/rfq?buyerId=${user.id}`, {
        fruitType: rfqForm.tipoFruta,
        requiredQuantity: parseFloat(rfqForm.cantidadRequerida),
        descripcion: rfqForm.descripcion,
        deadline: new Date(rfqForm.fechaLimite).toISOString(),
      });
      setRfqMsg({
        type: "success",
        text: "Licitación publicada exitosamente.",
      });
      setRfqForm({
        tipoFruta: "BANANO",
        cantidadRequerida: "",
        descripcion: "",
        fechaLimite: "",
      });
      loadRfqs();
    } catch (err) {
      setRfqMsg({
        type: "error",
        text: err.message || "Error al publicar la licitación.",
      });
    }
  };

  const aceptarOfertaRfq = async (requestForQuoteId, ofertaId) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea aceptar esta oferta? Se generará un pedido automático con los datos propuestos.",
      )
    )
      return;
    try {
      await api.patch(
        `/rfq/${requestForQuoteId}/offers/${ofertaId}/accept?buyerId=${user.id}`,
      );
      alert(
        "Oferta aceptada correctamente. Se ha generado un pedido en estado pendiente.",
      );
      loadRfqs();
      loadPedidos();
    } catch (err) {
      alert("Error al aceptar la oferta: " + err.message);
    }
  };

  // Catalog loading
  const loadCatalogProducts = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const data = await api.get("/productos?size=100");
      const list = extractArray(data).map((p) => {
        const promoPrice =
          p.promotionPrice != null ? Number(p.promotionPrice) : null;
        const hasPromo =
          Boolean(p.onPromotion) && promoPrice != null && promoPrice > 0;
        const price = Number(p.price ?? p.precio ?? 0);
        const wholesalePrice =
          p.wholesalePrice != null ? Number(p.wholesalePrice) : null;
        const minWholesale =
          p.minimumWholesaleQuantity != null
            ? Number(p.minimumWholesaleQuantity)
            : null;

        return {
          ...p,
          id: p.id,
          nombre: p.name || p.nombre || "Producto sin nombre",
          descripcion: p.description || p.descripcion || "",
          precio: hasPromo && promoPrice < price ? promoPrice : price,
          precioPromocion: hasPromo ? promoPrice : null,
          enPromocion: hasPromo,
          stock: Number(
            p.availableQuantity ?? p.stock ?? p.cantidadDisponible ?? 0,
          ),
          imagenUrl: p.imageUrl || p.imagenUrl || null,
          tipoFruta: p.fruitType ?? p.tipoFruta ?? null,
          calificacion:
            p.averageRating > 0 ? Number(p.averageRating).toFixed(1) : null,
          productorNombre:
            p.producer?.name ||
            p.producer?.firstName ||
            p.productorNombre ||
            p.productor ||
            p.nombreProductor ||
            null,
          productorVerificado: p.producer?.verified ?? p.productorVerificado ?? false,
          precioMayorista: wholesalePrice,
          cantidadMinimaMayorista: minWholesale,
        };
      });
      setCatalogProducts(list);
    } catch (err) {
      console.error("Error loadCatalogProducts:", err);
      setCatalogProducts([]);
    } finally {
      setCatalogLoading(false);
    }
  }, [extractArray]);

  // Shipments loading
  const loadEnvios = useCallback(async () => {
    try {
      const data = await api.get("/envios");
      const list = extractArray(data);
      // El backend devuelve el enum `ShippingState` en inglés ("DELIVERED"),
      // no "Entregado". Comparar contra la etiqueta en español hacía que el
      // filtro no descartara nada: los envíos entregados seguían apareciendo
      // como activos.
      const entregado = (e) =>
        String(e.estado || e.status || "").toUpperCase() === "DELIVERED";
      setShipments(list.filter((e) => !entregado(e)));
      setHistorialEnvios(list);
    } catch (err) {
      console.error("Error loadEnvios:", err);
      setShipments([]);
      setHistorialEnvios([]);
    }
  }, [extractArray]);

  // Messaging select & send
  const selectContact = async (contacto) => {
    setSelectedContact(contacto);
    try {
      const data = await api.get(`/mensajes/conversacion/${contacto.id}`);
      /*
       * ANTES: `{ ...m, mio: m.remitenteId === user?.id }`.
       *
       * El backend devuelve `content` y `senderId` (MessageResponse), no
       * `remitenteId`. Como `m.texto` y `m.contenido` quedaban undefined, la
       * burbuja pintaba solo la hora y el texto del mensaje era invisible.
       * `normalizarMensaje` traduce los tres nombres y calcula `mio`.
       */
      setMessages(
        extractArray(data).map((m) => normalizarMensaje(m, user?.id)),
      );
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

  /*
   * CARGA DINÁMICA POR SECCIÓN.
   *
   * Antes se cargaba todo al montar el dashboard. Ahora cada sección pide
   * únicamente lo que necesita, y solo la primera vez que se abre.
   */
  const seccionesCargadas = useRef(new Set());

  useEffect(() => {
    const marca = activeSection;
    if (seccionesCargadas.current.has(marca)) return undefined;
    seccionesCargadas.current.add(marca);

    const timer = setTimeout(() => {
      switch (marca) {
        case "resumen":
        case "catalogo":
          void loadCatalogProducts();
          break;
        case "seguimiento":
          void loadEnvios();
          break;
        case "mensajeria":
          void loadContactos();
          break;
        case "misFacturas":
          void loadFacturas();
          break;
        case "rfq":
          void loadRfqs();
          break;
        default:
          break;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [
    activeSection,
    loadCatalogProducts,
    loadEnvios,
    loadContactos,
    loadFacturas,
    loadRfqs,
  ]);

  // Datos del formulario de perfil (la sección está siempre visible).
  useEffect(() => {
    if (!user) return undefined;

    const timer = setTimeout(() => {
      setPerfilForm({
        nombre: user.nombre || "",
        telefono: user.telefono || "",
      });
      setPerfilMsg({ type: "", text: "" });
      setPwMsg({ type: "", text: "" });
    }, 0);

    return () => clearTimeout(timer);
  }, [user]);

  const publicarResena = async () => {
    const errs = {};
    if (!rProducto) errs.producto = "Selecciona un producto.";
    if (!rating) errs.rating = "Selecciona una calificación.";
    if (!comentario.trim()) errs.comentario = "Escribe un comentario.";
    setReviewErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      // Find corresponding product if possible
      const cleanProdName = rProducto.replace(
        /[\uD800-\uDBFF][\uDC00-\uDFFF]\s*/g,
        "",
      ); // strip emoji
      const matchProduct = catalogProducts.find((p) =>
        p.nombre.toLowerCase().includes(cleanProdName.toLowerCase()),
      );
      if (!matchProduct?.id) {
        setReviewErrors({
          producto: "No se encontró el producto seleccionado en el catálogo.",
        });
        return;
      }

      const requestPayload = {
        productoId: matchProduct.id,
        calificacion: rating,
        comentario: comentario,
      };

      const nueva = await api.post("/resenas", requestPayload);
      setReviews((prev) => [nueva, ...prev]);
      setReviewModalOpen(false);
      setRProducto("");
      setRating(0);
      setComentario("");
    } catch (err) {
      alert(
        t("resenas.errorPublish", "Error al publicar reseña: ") +
          (err.message || "Inténtalo de nuevo."),
      );
    }
  };

  const contactProductor = async (productorNombre) => {
    if (!productorNombre) return;
    showSection("mensajeria");

    // Attempt to locate real user ID of this producer in the lookup list
    try {
      const data = await api.get("/mensajes/contactos");
      const list = extractArray(data);
      const found = list.find((c) =>
        c.nombre?.toLowerCase().includes(productorNombre.toLowerCase()),
      );

      if (!found?.id) {
        console.error(
          "No se encontró el productor en los contactos del backend.",
        );
        return;
      }

      setContactos(list);
      selectContact(found);
    } catch (err) {
      console.error("Error al localizar productor en mensajería:", err);
    }
  };

  // Profile Update actions
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
      // El backend espera los nombres en inglés (`UpdateProfileRequest`).
      // Mandar `{nombre, telefono}` lo descartaba en silencio: el formulario
      // mostraba "guardado" pero nada cambiaba en la base de datos.
      const res = await api.put("/usuarios/me", {
        firstName: perfilForm.nombre.trim(),
        phone: perfilForm.telefono.trim(),
      });
      const updatedUser = res.data || res;
      setUser({
        ...user,
        nombre: updatedUser.firstName || perfilForm.nombre,
        telefono: updatedUser.phone || perfilForm.telefono,
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

  // Filters & helpers

  const pedidosFiltrados = filtroEstado
    ? pedidos.filter(
        (p) => p.estado?.toLowerCase() === filtroEstado.toLowerCase(),
      )
    : pedidos;

  const catalogFiltered = catalogProducts.filter((p) => {
    const matchSearch =
      !catalogSearch ||
      p.nombre?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.tipoFruta?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchTipo =
      !filtroTipoCatalog ||
      (filtroTipoCatalog === "Frutas" &&
        ["PASSION_FRUIT"].includes(p.tipoFruta)) ||
      (filtroTipoCatalog === "Otros" && p.tipoFruta === "OTHER") ||
      (filtroTipoCatalog === "Verduras" && false) ||
      (filtroTipoCatalog === "Tubérculos" && false) ||
      (filtroTipoCatalog === "Granos" && false);
    const matchMin = !minPrice || Number(p.precio) >= Number(minPrice);
    const matchMax = !maxPrice || Number(p.precio) <= Number(maxPrice);
    const matchPromo = !soloPromo || p.enPromocion === true;
    return matchSearch && matchTipo && matchMin && matchMax && matchPromo;
  });

  const nombreUsuario = user?.nombre || "María";

  const badgeClass = (estado) => {
    const e = estado?.toLowerCase();
    if (e === "pendiente") return "badge-status status-pending";
    if (e === "enviado") return "badge-status status-shipped";
    if (e === "entregado") return "badge-status status-delivered";
    return "badge-status";
  };

  const openFactura = (pedido) => {
    setFacturaData(pedido);
    setModalFactura(true);
  };

  const progressColor = (estado) => {
    const e = estado?.toUpperCase();
    if (e === "ENTREGADO" || e === "DELIVERED") return "var(--primary)";
    if (e === "EN_CAMINO" || e === "EN_TRANSITO" || e === "EN TRÁNSITO")
      return "var(--blue)";
    return "var(--gold)";
  };

  // Metrics calculation
  const totalInvestment = pedidos.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0,
  );
  const reviewsDejadasCount = reviews.filter(
    (r) => r.compradorNombre === user?.nombre,
  ).length;
  const uniqueProducersCount = new Set(
    pedidos.map((p) => p.productor || p.nombreProductor).filter(Boolean),
  ).size;

  /*
   * Estado que consumen las secciones, expuesto por contexto.
   *
   * Antes pasaba por el ámbito del componente, imposible de mantener con el
   * Outlet: las secciones se montan por ruta y ya no son hijas del padre. Este
   * objeto es el único punto de unión; si una sección necesita un campo
   * nuevo, se añade aquí.
   */
  const estadoComprador = {
    // Catálogo
    CATEGORIES, catalogFiltered, catalogLoading, catalogSearch,
    catalogSearchQuery, setCatalogSearch, setCatalogSearchQuery,
    filtroTipoCatalog, setFiltroTipoCatalog, minPrice, setMinPrice,
    maxPrice, setMaxPrice, soloPromo, setSoloPromo, count,
    // Pedidos
    pedidos, getGroupedPedidos, badgeClass, filtroEstado, setFiltroEstado,
    pedidosFiltrados, setCheckoutPedido, setPagoModalOpen, openFactura,
    // Facturas
    facturas, getGroupedFacturas, descargarPdfGroup,
    // Envíos
    shipments, historialEnvios, progressColor, expandedShipmentId,
    setExpandedShipmentId,
    // Mensajería
    contactos, selectedContact, selectContact, messages, msgInput,
    setMsgInput, sendMessage, chatRef,
    // Reseñas
    reviews, setReviewModalOpen, comentario,
    // RFQ
    rfqs, rfqForm, setRfqForm, rfqMsg, crearRfq, aceptarOfertaRfq,
    // Perfil
    perfilForm, setPerfilForm, perfilMsg, pwForm, setPwForm, pwMsg,
    showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword,
    handleUpdatePerfil, handleUpdatePassword,
    // Acciones compartidas
    addToCart, setCartOpen, setSelectedProduct, contactProductor, showSection,
    // Derivados del resumen
    nombreUsuario, currentDate, totalInvestment, reviewsDejadasCount,
    uniqueProducersCount,
  };


  return (
    /*
     * El shell es el MISMO para los tres paneles: aqui solo se pasa la
     * navegación del rol. Ver DashboardShell.jsx.
     */
    <DashboardShell
      nav={NAV_COMPRADOR}
      badges={{
        misPedidos: pedidos.length,
        misFacturas: facturas.length,
      }}
    >
      <div className="buyer-dashboard">
        {/*
         * El shell comun de los tres paneles vive en DashboardShell; aqui
         * solo se expone el estado a las secciones por contexto. Cada
         * seccion se monta por ruta y lo lee con useCompradorData().
         *
         * Los modales de abajo tambien van dentro del shell: se posicionan
         * con position:fixed, asi que el contenedor no les afecta.
         */}
        <CompradorShell valor={estadoComprador}>
          <SeccionesComprador />
        </CompradorShell>
      </div>

      {/* MODAL PROCESAR PAGO (PSE/TARJETA/EFECTIVO) */}
      {pagoModalOpen && checkoutPedido && (
        <div className="modal-overlay open" id="modalPago">
          <div className="modal" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <span className="modal-title"> Completar Pago en Línea</span>
              <button
                className="modal-close"
                onClick={() => {
                  setPagoModalOpen(false);
                  loadPedidos();
                  showSection("misPedidos");
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <h4
                style={{
                  marginBottom: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                }}
              >
                Resumen del Pedido
              </h4>
              <div
                className="cell-soft"
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "0.85rem",
                }}
              >
                <p>
                  <strong>Pedido #:</strong> {checkoutPedido.id}
                </p>
                <p>
                  <strong>Total a pagar:</strong>{" "}
                  {formatPrice(checkoutPedido.total || 0)}
                </p>
                <p>
                  <strong>Estado:</strong> Pendiente de Pago
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label
                  className="form-label"
                  style={{
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Método de Pago
                </label>
                <select
                  className="form-select"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)",
                  }}
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="PSE">
                    PSE (Débito Cuenta de Ahorros/Corriente)
                  </option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="EFECTIVO">
                    Efectivo (Corresponsal Bancario)
                  </option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px", fontWeight: "600" }}
                onClick={async () => {
                  try {
                    const ordersToPay = checkoutPedido.isGrouped
                      ? checkoutPedido.originalPedidos
                      : [checkoutPedido];

                    // Mapeo de método de pago del frontend al enum del backend
                    const metodoBackend =
                      metodoPago === "TARJETA_CREDITO"
                        ? "CREDIT_CARD"
                        : metodoPago === "PSE"
                          ? "PSE"
                          : metodoPago === "EFECTIVO"
                            ? "CASH"
                            : "MERCADO_PAGO";

                    let lastCheckoutUrl = null;

                    for (const ped of ordersToPay) {
                      const initRes = await api.post("/pagos/iniciar", {
                        orderId: ped.id,
                        buyerId: user?.id,
                        paymentMethod: metodoBackend,
                      });
                      const data = initRes.data || initRes;
                      if (data?.checkoutUrl) {
                        lastCheckoutUrl = data.checkoutUrl;
                      }
                    }

                    setPagoModalOpen(false);

                    // Flujo REAL: redirigir a la pasarela de MercadoPago
                    if (lastCheckoutUrl) {
                      window.location.href = lastCheckoutUrl;
                      return;
                    }

                    alert(
                      "No se pudo iniciar el pago en la pasarela. Inténtalo de nuevo.",
                    );
                  } catch (err) {
                    alert("Error al iniciar el pago: " + (err.message || err));
                  }
                }}
              >
                Proceder a Pagar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FACTURA */}
      {modalFactura && (
        <div className="modal-overlay open" id="modalFactura">
          <div className="modal" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <span className="modal-title">
                {t(
                  "pedidos.invoiceDetailTitle",
                  "Detalle de Factura Electrónica",
                )}
              </span>
              <button
                className="modal-close"
                onClick={() => setModalFactura(false)}
              >
                ✕
              </button>
            </div>
            <div id="facturaContent">
              {facturaData && (
                <div style={{ padding: "24px" }}>
                  <p>
                    <strong>ID de Pedido:</strong>{" "}
                    {facturaData.checkoutId || `#${facturaData.id}`}
                  </p>
                  <div
                    style={{
                      margin: "12px 0",
                      borderTop: "1px solid var(--am-border, #e2e8f0)",
                      borderBottom: "1px solid var(--am-border, #e2e8f0)",
                      padding: "10px 0",
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: "6px" }}>
                      Detalle de Productos:
                    </strong>
                    {facturaData.isGrouped ? (
                      facturaData.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.9rem",
                            marginBottom: "4px",
                          }}
                        >
                          <span>
                            • {item.productoNombre || item.producto} (x
                            {item.cantidad} kg)
                          </span>
                          <span>{formatPrice(item.total)}</span>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.9rem",
                        }}
                      >
                        <span>
                          • {facturaData.productoNombre || facturaData.producto}{" "}
                          (x{facturaData.cantidad} kg)
                        </span>
                        <span>{formatPrice(facturaData.total)}</span>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                      fontSize: "1.05rem",
                      marginTop: "10px",
                    }}
                  >
                    <span>Total General:</span>
                    <span style={{ color: "var(--primary)" }}>
                      {formatPrice(facturaData.total)}
                    </span>
                  </div>
                  <p style={{ marginTop: "12px", fontSize: "0.9rem" }}>
                    <strong>
                      {t("pedidos.invoiceDetail.status", "Estado:")}
                    </strong>{" "}
                    <span className={badgeClass(facturaData.estado)}>
                      {t(
                        "pedidos.status." + facturaData.estado?.toLowerCase(),
                        facturaData.estado,
                      )}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setModalFactura(false)}
              >
                {t("pedidos.close", "Cerrar")}
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const pedidos = facturaData?.isGrouped
                      ? facturaData.items
                      : facturaData?.originalPedidos &&
                          facturaData.originalPedidos.length > 0
                        ? facturaData.originalPedidos
                        : [{ id: facturaData?.pedidoId ?? facturaData?.id }];

                    let enviados = 0;
                    let sinFactura = 0;
                    for (const ped of pedidos) {
                      const pedidoId = ped.id ?? ped.pedidoId;
                      if (!pedidoId) continue;
                      try {
                        const invRes = await api.get(
                          `/facturas/pedido/${pedidoId}`,
                        );
                        // La API devuelve un objeto factura (o 404); normalizar.
                        const data = invRes?.data || invRes;
                        const factura = Array.isArray(data)
                          ? data[0]
                          : data?.id
                            ? data
                            : null;
                        if (!factura?.id) {
                          sinFactura += 1;
                          continue;
                        }
                        const res = await api.post(
                          `/facturas/${factura.id}/enviar`,
                        );
                        enviados += res?.email ? 1 : 0;
                      } catch (err) {
                        // 404 = el pedido aún no tiene factura emitida:
                        // intentamos generarla on-demand y reintentamos.
                        if (err?.status !== 404) throw err;
                        try {
                          await api.post(`/facturas/generate/${pedidoId}`);
                          const trasGenerar = await api.get(
                            `/facturas/pedido/${pedidoId}`,
                          );
                          const dataGen = trasGenerar?.data || trasGenerar;
                          const facturaGen = Array.isArray(dataGen)
                            ? dataGen[0]
                            : dataGen?.id
                              ? dataGen
                              : null;
                          if (!facturaGen?.id) {
                            sinFactura += 1;
                            continue;
                          }
                          const res = await api.post(
                            `/facturas/${facturaGen.id}/enviar`,
                          );
                          enviados += res?.email ? 1 : 0;
                        } catch (err2) {
                          if (err2?.status === 404) {
                            sinFactura += 1;
                          } else {
                            throw err2;
                          }
                        }
                      }
                    }

                    if (enviados > 0) {
                      alert(
                        `Factura(s) enviada(s) al correo ${user?.email || "registrado"} (${enviados} enviada(s)).`,
                      );
                      setModalFactura(false);
                    } else if (sinFactura > 0) {
                      alert(
                        "No se encontro una factura emitida para este pedido. Genera el pago desde MercadoPago o intentalo de nuevo mas tarde.",
                      );
                    } else {
                      alert(
                        "No hay pedidos con datos suficientes para facturar.",
                      );
                    }
                  } catch (err) {
                    alert(
                      "No se pudo enviar la factura: " +
                        (err.message || "Intentalo de nuevo."),
                    );
                  }
                }}
              >
                {t("pedidos.sendPdf", " Enviar PDF")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA RESEÑA */}
      {reviewModalOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <span className="modal-title">Nueva Reseña de Producto</span>
              <button
                className="modal-close"
                onClick={() => setReviewModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Producto *</label>
              <select
                className="form-select"
                value={rProducto}
                onChange={(e) => setRProducto(e.target.value)}
              >
                <option value="">Selecciona un producto...</option>
                {catalogProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {reviewErrors.producto && (
                <span
                  className="form-error"
                  style={{ color: "var(--red)", fontSize: "0.75rem" }}
                >
                  {reviewErrors.producto}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Calificación *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    onClick={() => setRating(v)}
                    onMouseOver={() => setHoverRating(v)}
                    onMouseOut={() => setHoverRating(0)}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.8rem",
                      color:
                        v <= (hoverRating || rating)
                          ? "var(--gold)"
                          : "var(--border-light)",
                    }}
                  >
                    <Icon name="star" size={16} />
                  </span>
                ))}
              </div>
              {reviewErrors.rating && (
                <span
                  className="form-error"
                  style={{ color: "var(--red)", fontSize: "0.75rem" }}
                >
                  {reviewErrors.rating}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Comentario *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Describe tu experiencia con el producto..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border-light)",
                  borderRadius: "6px",
                }}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              ></textarea>
              {reviewErrors.comentario && (
                <span
                  className="form-error"
                  style={{ color: "var(--red)", fontSize: "0.75rem" }}
                >
                  {reviewErrors.comentario}
                </span>
              )}
            </div>

            <div
              className="modal-footer"
              style={{ display: "flex", gap: "12px" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setReviewModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={publicarResena}>
                {" "}
                Publicar reseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div
          className="modal-overlay open"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="modal"
            style={{
              maxWidth: "600px",
              width: "90%",
              padding: 0,
              overflow: "hidden",
              borderRadius: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "relative", height: "280px" }}>
              <img
                src={
                  selectedProduct.imagenUrl ||
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500"
                }
                alt={selectedProduct.nombre}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  border: "none",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                }}
              >
                ✕
              </button>
              {selectedProduct.enPromocion && (
                <span
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    background: "var(--red)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                  }}
                >
                  % PROMO
                </span>
              )}
            </div>

            <div style={{ padding: "24px" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                {selectedProduct.tipoFruta || selectedProduct.tipo}
              </span>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  margin: "4px 0 12px 0",
                  color: "var(--text-dark)",
                }}
              >
                {selectedProduct.nombre}
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ color: "var(--gold)", fontSize: "1rem" }}>
                  <Icon name="star" size={16} /><Icon name="star" size={16} /><Icon name="star" size={16} /><Icon name="star" size={16} /><Icon name="star" size={16} />
                </div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                  (4.8 de calificación)
                </span>
                <span
                  className={`catalog-card-badge${selectedProduct.stock <= 0 ? " out" : ""}`}
                  style={{
                    background:
                      selectedProduct.stock > 0
                        ? "var(--green-bg)"
                        : "var(--red-bg)",
                    color:
                      selectedProduct.stock > 0
                        ? "var(--primary)"
                        : "var(--red)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  {selectedProduct.stock > 0
                    ? `Stock: ${selectedProduct.stock} kg`
                    : "Agotado"}
                </span>
              </div>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                  marginBottom: "20px",
                }}
              >
                {selectedProduct.descripcion ||
                  "Fruta tropical fresca cosechada directamente en las fincas de Urabá, Antioquia. ASAFRUT garantiza el origen y la calidad del producto."}
              </p>

              {/* PRICES */}
              <div
                className="cell-soft"
                style={{
                  border: "1px solid var(--am-border)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--am-text-muted, #64748b)" }}>
                    Precio por menor:
                  </span>
                  <span
                    style={{
                      fontWeight: "700",
                      color: "var(--am-text, #1e293b)",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedProduct.enPromocion &&
                    selectedProduct.precioPromocion ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "var(--am-text-muted, #94a3b8)",
                            fontSize: "0.9rem",
                            marginRight: "8px",
                          }}
                        >
                          {formatPrice(selectedProduct.precio)}
                        </span>
                        <span style={{ color: "var(--red)" }}>
                          {formatPrice(selectedProduct.precioPromocion)}
                        </span>
                      </>
                    ) : (
                      formatPrice(selectedProduct.precio)
                    )}
                    <small
                      style={{
                        fontWeight: "400",
                        fontSize: "0.8rem",
                        color: "var(--am-text-muted, #64748b)",
                      }}
                    >
                      {" "}
                      /kg
                    </small>
                  </span>
                </div>

                {selectedProduct.cantidadMinimaMayorista &&
                  selectedProduct.precioMayorista && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px dashed var(--am-border, #cbd5e1)",
                        paddingTop: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", color: "var(--am-text-muted, #64748b)" }}>
                        Precio por mayor (≥
                        {selectedProduct.cantidadMinimaMayorista}kg):
                      </span>
                      <span
                        style={{
                          fontWeight: "800",
                          color: "var(--primary)",
                          fontSize: "1.1rem",
                        }}
                      >
                        {formatPrice(selectedProduct.precioMayorista)}
                        <small
                          style={{
                            fontWeight: "400",
                            fontSize: "0.8rem",
                            color: "var(--am-text-muted, #64748b)",
                          }}
                        >
                          {" "}
                          /kg
                        </small>
                      </span>
                    </div>
                  )}
              </div>

              {/* PRODUCER DETAILS */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    Productor
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "var(--text-dark)",
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {selectedProduct.productorNombre ||
                      selectedProduct.productor ||
                      selectedProduct.nombreProductor ||
                      "Productor ASAFRUT"}
                    {selectedProduct.productorVerificado && (
                      <span
                        style={{
                          padding: "1px 5px",
                          borderRadius: "4px",
                          fontSize: "0.6rem",
                          fontWeight: "700",
                          border: "1px solid var(--am-green)",
                        }}
                      >
                        Gold Supplier
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    contactProductor(
                      selectedProduct.productorNombre ||
                        selectedProduct.productor ||
                        selectedProduct.nombreProductor,
                    )
                  }
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  Chat
                </button>
              </div>

              {/* BUTTONS */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() =>
                    contactProductor(
                      selectedProduct.productorNombre ||
                        selectedProduct.productor ||
                        selectedProduct.nombreProductor,
                    )
                  }
                >
                  Contactar Productor
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stock <= 0}
                >
                  {t("catalog.addToCart", "Agregar al carrito")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </DashboardShell>
  );
}
