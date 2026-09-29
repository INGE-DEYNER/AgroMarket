/*
 * Configuración de navegación por rol.
 *
 * Es la ÚNICA diferencia entre los tres paneles: el DashboardShell es el
 * mismo para todos y solo recibe esta lista. Si un rol necesita una entrada
 * nueva, se añade aquí y no tocando el shell.
 *
 * Cada ítem: { id, label, icon, group?, badge? }
 *   id     → segmento de la ruta: /admin/<id>
 *   icon   → nombre canónico del componente Icon (SVG inline real)
 *   group  → encabezado del grupo; los grupos se dibujan en el orden en que
 *            aparecen por primera vez
 *   badge  → valor dinámico (pedidos pendientes, facturas, etc.)
 */

export const NAV_ADMIN = {
  rol: "admin",
  etiquetaRol: "Administrador",
  base: "/admin",
  secciones: [
    { id: "dashboard", label: "Dashboard", icon: "home", group: "Panel de control" },
    { id: "usuarios", label: "Usuarios", icon: "users" },
    { id: "mensajeria", label: "Mensajería", icon: "message" },
    { id: "productos", label: "Productos", icon: "box" },
    { id: "pedidos", label: "Pedidos", icon: "package" },
    { id: "productores", label: "Productores", icon: "leaf" },
    { id: "pagos", label: "Pagos", icon: "card" },
    { id: "reportes", label: "Reportes", icon: "barChart" },
    { id: "logistica", label: "Logística", icon: "truck" },
    { id: "cupones", label: "Cupones", icon: "tag", group: "Operación" },
    { id: "resenas", label: "Reseñas", icon: "star" },
    { id: "soporte", label: "Soporte", icon: "help" },
    { id: "auditoria", label: "Auditoría", icon: "shield" },
    {
      id: "configuracion",
      label: "Configuración",
      icon: "settings",
      group: "Sistema",
    },
  ],
};

export const NAV_PRODUCTOR = {
  rol: "productor",
  etiquetaRol: "Productor / Vendedor",
  base: "/dashboard-productor",
  /*
   * Los ids son los SEGMENTOS DE RUTA y tienen que coincidir con las claves de
   * SECCIONES en sections/SeccionesActivas.jsx. Antes ponía `productos` y
   * `pedidos`, que no existen: las secciones se llaman `misProductos` y
   * `pedidosRec`, y `finca` faltaba por completo. Con esos ids el menú
   * navegaba a rutas sin sección y caía en el resumen.
   */
  secciones: [
    {
      id: "resumen",
      label: "Panel general",
      icon: "home",
      group: "Gestión del negocio",
    },
    { id: "misProductos", label: "Productos", icon: "box" },
    { id: "pedidosRec", label: "Pedidos y ventas", icon: "package" },
    { id: "mensajeria", label: "Mensajes", icon: "message" },
    { id: "resenas", label: "Reseñas", icon: "star" },
    { id: "finca", label: "Información de la finca", icon: "leaf" },
    { id: "finanzas", label: "Finanzas / pagos", icon: "card" },
    { id: "rfq", label: "Oportunidades", icon: "lightbulb" },
    { id: "seguimiento", label: "Despachos", icon: "truck", group: "Operación" },
    {
      id: "configuracion",
      label: "Configuración",
      icon: "settings",
      group: "Sistema",
    },
  ],
  // "perfil" no se lista aquí: el shell la dibuja siempre en el pie fijo,
  // junto a "Cerrar sesión", para que nunca quede fuera de la vista.
};

export const NAV_COMPRADOR = {
  rol: "comprador",
  etiquetaRol: "Comprador",
  base: "/dashboard-comprador",
  secciones: [
    { id: "resumen", label: "Resumen", icon: "home", group: "Navegación" },
    { id: "catalogo", label: "Explorar catálogo", icon: "box" },
    { id: "misPedidos", label: "Mis pedidos", icon: "package" },
    { id: "misFacturas", label: "Mis facturas", icon: "fileText" },
    { id: "rfq", label: "Licitaciones B2B (RFQ)", icon: "lightbulb" },
    { id: "seguimiento", label: "Seguimiento", icon: "truck", group: "Servicios" },
    { id: "mensajeria", label: "Mensajería", icon: "message" },
    { id: "resenas", label: "Mis reseñas", icon: "star" },
    {
      id: "configuracion",
      label: "Configuración",
      icon: "settings",
      group: "Sistema",
    },
  ],
};

/*
 * Subsecciones de Configuración. Se muestran según lo que el rol usa de
 * verdad: el administrador no tiene lista de deseos ni historial de compra,
 * así que no le aparecen.
 */
export const CONFIG_COMUN = [
  { id: "notificaciones", label: "Notificaciones", icon: "bell" },
  { id: "historial", label: "Historial", icon: "history" },
  { id: "direcciones", label: "Direcciones", icon: "mapPin" },
  { id: "cupones", label: "Cupones y promociones", icon: "tag" },
  { id: "ayuda", label: "Centro de ayuda", icon: "help" },
  { id: "devoluciones", label: "Devoluciones", icon: "undo" },
  { id: "pagos-guardados", label: "Pagos guardados", icon: "card" },
  { id: "apariencia", label: "Apariencia", icon: "sliders" },
];

export const CONFIG_POR_ROL = {
  admin: CONFIG_COMUN,
  productor: CONFIG_COMUN,
  comprador: [
    ...CONFIG_COMUN.slice(0, 4),
    { id: "deseos", label: "Lista de deseos", icon: "heart" },
    ...CONFIG_COMUN.slice(4),
  ],
};

export const NAV_POR_ROL = {
  admin: NAV_ADMIN,
  productor: NAV_PRODUCTOR,
  comprador: NAV_COMPRADOR,
};

/** Sección por defecto de cada rol (la que abre sin ruta explícita). */
export const SECCION_INICIAL = {
  admin: "dashboard",
  productor: "resumen",
  comprador: "resumen",
};

/** Devuelve el ítem de navegación para un id, o undefined. */
export function seccionDe(nav, id) {
  return nav.secciones.find((seccion) => seccion.id === id);
}
