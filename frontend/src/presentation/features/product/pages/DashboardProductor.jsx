/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import api, { API_BASE } from "@/infrastructure/http/api";
import { useMensajeriaStream } from "@/application/messaging/useMessaging";
// formatearHora se fue con la sección de Mensajería, que es la única que lo
// usaba. Sigue exportado en normalizar.js para cuando haga falta.
import {
  normalizarMensaje,
  normalizarPedido,
} from "@/infrastructure/normalizar";
import "@/presentation/styles/envios.css";
import "@/presentation/styles/mensajeria.css";
import "@/presentation/styles/productor.css";
import DashboardShell from "@/presentation/shared/layout/DashboardShell";
import { NAV_PRODUCTOR } from "@/application/navigation/navConfig";
import ProductorShell from "@/presentation/features/product/components/ProductorShell";
import SeccionesActivas from "@/presentation/features/product/sections/SeccionesActivas";

const TIPOS = [
  "Banano",
  "Piña",
  "Mango",
  "Maracuyá",
  "Guanábana",
  "Naranja",
  "Coco",
  "Limón",
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
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  /*
   * NAVEGACIÓN POR SECCIONES (SPA).
   *
   * Antes la sección activa era un estado local y TODAS las secciones seguían
   * montadas en el DOM, cada una con su condición `activeSection === "x"`.
   * Por eso el layout cambiaba de proporciones al navegar, el menú no
   * cambiaba la URL y el botón "atrás" no hacía nada.
   *
   * Ahora la sección la determina la ruta (/dashboard-productor/<id>). Se
   * navega en vez de cambiar estado, así que el enlace es compartible, el
   * historial funciona y solo se monta la vista pedida.
   *
   * `seccionActual` es la lectura de esa ruta. La consumen los efectos que
   * necesitan saber qué vista está abierta (carga diferida por sección y
   * sondeo de mensajería).
   *
   * El estado de "menú abierto" ya no vive aquí: el shell común lo lleva y lo
   * cierra en cada clic del menú.
   */
  const { seccion: seccionActual = "resumen" } = useParams();
  const showSection = useCallback(
    (key) => navigate(`/dashboard-productor/${key}`),
    [navigate],
  );

  // La URL antigua (?section=xxx) se redirige desde App.jsx con un
  // <Navigate replace>, no desde aquí: hacerlo en un efecto dejaría la
  // sección visible un instante antes de saltar.

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RFQ (Licitaciones) states
  const [activeRfqs, setActiveRfqs] = useState([]);
  const [biddingRfq, setBiddingRfq] = useState(null);
  const [bidForm, setBidForm] = useState({
    productId: "",
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

  const [resenasProductor, setResenasProductor] = useState([]);

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

  /**
   * Calificación real del productor, derivada de sus productos.
   *
   * La columna `users.average_rating` se eliminó porque nunca se escribía
   * (quedaba siempre en 0). El promedio y el total de reseñas de cada
   * producto SÍ los calcula el backend desde la tabla `reviews`
   * (`ProductUseCase#toResult`), así que aquí se agregan ponderando cada
   * producto por su número de reseñas.
   *
   * Devuelve `null` cuando el productor aún no tiene reseñas, para que la
   * interfaz muestre "Sin reseñas" en vez de un número inventado.
   */
  const reputacion = useMemo(() => {
    let sumaPonderada = 0;
    let totalReseñas = 0;

    for (const p of productos) {
      const promedio = Number(p?.averageRating);
      const reseñas = Number(p?.totalReviews);

      if (!Number.isFinite(promedio) || promedio <= 0) continue;
      if (!Number.isFinite(reseñas) || reseñas <= 0) continue;

      sumaPonderada += promedio * reseñas;
      totalReseñas += reseñas;
    }

    if (totalReseñas === 0) return null;
    return { promedio: sumaPonderada / totalReseñas, total: totalReseñas };
  }, [productos]);

  const calificacionProductor = reputacion
    ? reputacion.promedio.toFixed(1)
    : "—";

  const loadProductos = useCallback(async () => {
    try {
      const data = await api.get("/productos/mis-productos");
      const ENUM_TO_TIPO = {
        PASSION_FRUIT: "Maracuyá",
      };
      const items = extractArray(data).map((p) => {
        const rawType = p.fruitType || p.tipoFruta || p.tipo || "";
        const mappedType = ENUM_TO_TIPO[rawType] || rawType || "Banano";
        return {
          ...p,
          nombre: p.name || p.nombre || "Producto sin nombre",
          precio: Number(p.price ?? p.precio ?? 0),
          stock: Number(
            p.availableQuantity ?? p.stock ?? p.cantidadDisponible ?? 0,
          ),
          tipo: mappedType,
          descripcion: p.description || p.descripcion || "",
          imagenUrl: p.imageUrl || p.imagenUrl || "",
          cantidadMinimaMayorista:
            p.minimumWholesaleQuantity ?? p.cantidadMinimaMayorista ?? "",
          precioMayorista: p.wholesalePrice ?? p.precioMayorista ?? "",
        };
      });
      setProductos(items);
    } catch (err) {
      console.error("Error loadProductos:", err);
      setProductos([]);
    }
  }, [extractArray]);

  const loadPedidos = useCallback(async () => {
    try {
      const data = await api.get("/pedidos/mis-pedidos");
      setPedidos(extractArray(data).map(normalizarPedido));
    } catch (err) {
      console.error("Error loadPedidos:", err);
      setPedidos([]);
    }
  }, [extractArray]);

  // Initialization
  useEffect(() => {
    void loadProductos();
    void loadPedidos();
  }, [loadProductos, loadPedidos]);

  const loadActiveRfqs = useCallback(async () => {
    try {
      const data = await api.get("/rfq/active");
      setActiveRfqs(extractArray(data));
    } catch (err) {
      console.error("Error loadActiveRfqs:", err);
      setActiveRfqs([]);
    }
  }, [extractArray]);

  const enviarBid = async (e) => {
    e.preventDefault();
    setBidMsg({ type: "", text: "" });
    if (!bidForm.productId || !bidForm.precioPropuesto) {
      setBidMsg({
        type: "error",
        text: "Por favor complete todos los campos obligatorios.",
      });
      return;
    }
    try {
      await api.post(
        `/rfq/${biddingRfq.id}/offers?producerId=${user.id}&productId=${bidForm.productId}`,
        {
          proposedPrice: parseFloat(bidForm.precioPropuesto),
          comments: bidForm.comentarios,
        },
      );
      setBidMsg({ type: "success", text: "Cotización enviada exitosamente." });
      setBidForm({ productId: "", precioPropuesto: "", comentarios: "" });
      setTimeout(() => {
        setBiddingRfq(null);
        void loadActiveRfqs();
      }, 1500);
    } catch (err) {
      setBidMsg({
        type: "error",
        text: err.message || "Error al enviar la cotización.",
      });
    }
  };

  // Shipments loading
  const loadEnvios = useCallback(async () => {
    try {
      const data = await api.get("/envios");
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
      void loadEnvios();
    } catch (err) {
      alert("Error al actualizar despacho: " + err.message);
    }
  };

  // Messaging contacts and messages
  const loadContactos = useCallback(async () => {
    try {
      /*
       * `mis-conversaciones` y no `contactos`: este último devuelve el
       * catálogo completo de usuarios del rol contrario, así que el productor
       * veía en su bandeja a compradores con los que nunca había escrito.
       * La bandeja debe mostrar solo conversaciones reales.
       *
       * Si el usuario no tiene ninguna, se recurre a `contactos` para que un
       * productor recién registrado pueda iniciar la primera conversación con
       * un comprador.
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
  }, [extractArray]);

  const loadResenasProductor = useCallback(async () => {
    try {
      const data = await api.get("/resenas");
      const items = extractArray(data);
      const producerId = user?.id;
      setResenasProductor(
        items.filter((r) => {
          const reviewProducerId =
            r.productorId ??
            r.productor?.id ??
            r.product?.productorId ??
            r.producto?.productorId;
          return (
            producerId != null &&
            reviewProducerId != null &&
            String(reviewProducerId) === String(producerId)
          );
        }),
      );
    } catch (err) {
      console.error("Error loadResenasProductor:", err);
      setResenasProductor([]);
    }
  }, [extractArray, user]);

  /*
   * CARGA DINÁMICA POR SECCIÓN.
   *
   * Antes se cargaba todo al montar el dashboard, así que abrir "Mensajería"
   * disparaba también las peticiones de envíos, RFQ y reseñas. Ahora cada
   * sección pide solo lo que necesita, y la primera vez que se abre.
   */
  const seccionesCargadas = useRef(new Set());

  useEffect(() => {
    const cargar = async () => {
      switch (seccionActual) {
        case "resumen":
        case "misProductos":
          await loadProductos();
          break;
        case "pedidosRec":
          await loadActiveRfqs();
          break;
        case "seguimiento":
          await loadEnvios();
          break;
        case "mensajeria":
          await loadContactos();
          break;
        case "resenas":
          await loadResenasProductor();
          break;
        default:
          break;
      }
    };

    // Se evita repetir la petición si ya se cargó en esta sesión de navegación.
    const marca = seccionActual;
    if (seccionesCargadas.current.has(marca)) return undefined;
    seccionesCargadas.current.add(marca);

    const timer = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(timer);
  }, [
    seccionActual,
    loadProductos,
    loadActiveRfqs,
    loadEnvios,
    loadContactos,
    loadResenasProductor,
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

  const selectContact = async (contacto) => {
    setSelectedContact(contacto);
    try {
      const data = await api.get(`/mensajes/conversacion/${contacto.id}`);
      const list = extractArray(data).map((m) =>
        normalizarMensaje(m, user?.id),
      );
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

  // TIEMPO REAL: sondea contactos y conversación activa.
  // Solo mientras la sección de mensajería está visible: si no, el polling
  // seguiría gastando batería y peticiones en segundo plano.
  useEffect(() => {
    if (seccionActual !== "mensajeria") return undefined;
    const contactosTimer = setInterval(() => void loadContactos(), 10000);
    return () => clearInterval(contactosTimer);
  }, [loadContactos, seccionActual]);

  useEffect(() => {
    if (seccionActual !== "mensajeria") return undefined;
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
  }, [selectedContact, user, extractArray, seccionActual]);

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
      // El backend espera los nombres en inglés (`UpdateProfileRequest`).
      // Mandar `{nombre, telefono}` lo descartaba en silencio: el perfil
      // aparecía guardado pero nada cambiaba en la base de datos.
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

  // Products Modal
  const openProductoModal = (prod = null) => {
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    if (prod) {
      const ENUM_TO_TIPO = {
        PASSION_FRUIT: "Maracuyá",
      };
      const rawType = prod.fruitType || prod.tipoFruta || prod.tipo || "";
      const mappedType = ENUM_TO_TIPO[rawType] || rawType || "Banano";
      const img = prod.imageUrl || prod.imagenUrl || "";
      setEditId(prod.id);
      setForm({
        nombre: prod.name || prod.nombre || "",
        tipo: mappedType,
        precio: prod.price ?? prod.precio ?? "",
        stock:
          prod.availableQuantity ?? prod.stock ?? prod.cantidadDisponible ?? "",
        descripcion: prod.description || prod.descripcion || "",
        imagenUrl: img,
        cantidadMinimaMayorista:
          (prod.minimumWholesaleQuantity ?? prod.cantidadMinimaMayorista) !=
          null
            ? (prod.minimumWholesaleQuantity ?? prod.cantidadMinimaMayorista)
            : "",
        precioMayorista:
          (prod.wholesalePrice ?? prod.precioMayorista) != null
            ? (prod.wholesalePrice ?? prod.precioMayorista)
            : "",
      });
      if (img) {
        const resolvedUrl = img.startsWith("http")
          ? img
          : `${API_BASE.replace("/api", "")}${img}`;
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
    // Prevenir múltiples envíos
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const mapTipoToEnum = (tipo) => {
        const mapping = {
          Maracuyá: "PASSION_FRUIT",
        };
        return mapping[tipo] || "OTHER";
      };

      const payload = {
        name: form.nombre,
        fruitType: mapTipoToEnum(form.tipo),
        price: Number(form.precio),
        availableQuantity: Number(form.stock),
        description: form.descripcion,
        imageUrl: form.imagenUrl || "",
        minimumWholesaleQuantity:
          form.cantidadMinimaMayorista &&
          !Number.isNaN(Number(form.cantidadMinimaMayorista))
            ? Number(form.cantidadMinimaMayorista)
            : null,
        wholesalePrice:
          form.precioMayorista && !Number.isNaN(Number(form.precioMayorista))
            ? Number(form.precioMayorista)
            : null,
      };

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
        formData.append("file", selectedImageFile);
        formData.append("ownerId", productId);
        formData.append("type", "PRODUCT");
        try {
          const imageRes = await api.post(`/images`, formData);
          if (imageRes && imageRes.url) {
            const updatedPayload = { ...payload, imageUrl: imageRes.url };
            await api.put(`/productos/${productId}`, updatedPayload);
          }
        } catch (imgErr) {
          console.error("Error subiendo imagen:", imgErr);
          alert(
            "El producto se guardó, pero hubo un error al subir la imagen.",
          );
        }
      }

      closeProductoModal();
      loadProductos();
    } catch (err) {
      alert(
        t("dashboardProductor.errorSave", "Error al guardar: ") +
          (err.message || "Inténtalo de nuevo."),
      );
    } finally {
      setIsSubmitting(false);
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
  /*
   * Estado que consumen las secciones, expuesto por contexto.
   *
   * El shell y los modales siguen montados en este archivo; las secciones ya
   * no. Antes lo recibian por el ambito del componente, lo cual ya no es
   * posible: se montan por ruta y no son hijas de este componente. Este
   * objeto es el unico punto de union. Si una seccion necesita un campo
   * nuevo, se anade aqui y no en otro sitio.
   */
  const estadoProductor = {
    // Datos
    productos,
    pedidos,
    shipments,
    activeRfqs,
    contactos,
    selectedContact,
    messages,
    msgInput,
    setMsgInput,
    resenasProductor,
    // Derivados
    iniciales,
    reputacion,
    calificacionProductor,
    badgeClass,
    // Acciones
    showSection,
    loadPedidos,
    openProductoModal,
    eliminarProducto,
    openUpdateShipment,
    selectContact,
    sendMessage,
    enviarBid,
    handleUpdatePerfil,
    handleUpdatePassword,
    // Formulario de perfil
    perfilForm,
    setPerfilForm,
    perfilMsg,
    setPerfilMsg,
    pwForm,
    setPwForm,
    pwMsg,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    // RFQ
    biddingRfq,
    setBiddingRfq,
    bidForm,
    setBidForm,
    bidMsg,
    setBidMsg,
    // Refs
    chatRef,
  };


  return (
    <DashboardShell
      nav={NAV_PRODUCTOR}
      badges={{ pedidosRec: pedidos.length }}
    >
      <ProductorShell valor={estadoProductor}>
        {/*
         * Este contenedor conserva el alcance `.producer-dashboard ...` de
         * productor.css y de dashboards-tipografia.css. Sin el, unas treinta
         * reglas (tipografia de las tablas, tarjetas de metrica, tintes del
         * modo oscuro) se quedarian sin aplicar, porque el shell dibuja su
         * propio contenedor .ds-main y no es del Productor.
         */}
        <div className="producer-dashboard">
          <SeccionesActivas />
        </div>
      </ProductorShell>

      {/* Modales: position fixed, viven fuera del flujo del shell. */}
      {/* ---------------------------------------------------------------- */}

      {/* MODAL PRODUCTO */}
      {modalOpen && (
        <div className="modal-overlay open" id="modalProducto">
          <div
            className="modal"
            style={{
              maxWidth: "600px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <span className="modal-title">
                {editId
                  ? t("dashboardProductor.editProduct", "Editar producto")
                  : t(
                      "dashboardProductor.publishNewProduct",
                      "Publicar nuevo producto",
                    )}
              </span>
              <button className="modal-close" onClick={closeProductoModal}>
                ✕
              </button>
            </div>
            <div
              className="modal-body-scrollable"
              style={{ flex: 1, overflowY: "auto", padding: "20px" }}
            >
              <div className="form-group">
                <label className="form-label">
                  {t("dashboardProductor.productName", "Nombre del producto")}
                </label>
                <input
                  className="form-input"
                  id="pNombre"
                  placeholder={t(
                    "dashboardProductor.placeholderName",
                    "Ej. Banano Urabá",
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
                    onChange={(e) =>
                      setForm({ ...form, precio: e.target.value })
                    }
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
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
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
                    Cant. Mínima Mayorista (kg)
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
                  {t("dashboardProductor.description", "Descripción")}
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
                        ✕
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
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-light)",
                      }}
                    >
                      JPG, PNG. Máx 5MB.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                flexShrink: 0,
                display: "flex",
                gap: "12px",
                padding: "20px",
                borderTop: "1px solid var(--border-light, #e2e8f0)",
                background: "#fff",
              }}
            >
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={closeProductoModal}
              >
                {t("dashboardProductor.cancel", "Cancelar")}
              </button>
              <button
                className="btn btn-primary publicar-btn"
                style={{ flex: 2 }}
                onClick={guardarProducto}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-spinner">
                    {t("dashboardProductor.saving", "Guardando...")}
                  </span>
                ) : (
                  t("dashboardProductor.save", "Publicar Producto")
                )}
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
              <span className="modal-title">Actualizar Envío / Despacho</span>
              <button
                className="modal-close"
                onClick={() => setUpdateShipmentModalOpen(false)}
              >
                ✕
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
                <label className="form-label">Número de Guía</label>
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
                <label className="form-label">Estado del Envío</label>
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
                  <option value="En tránsito">En tránsito</option>
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
    </DashboardShell>
  );
}
