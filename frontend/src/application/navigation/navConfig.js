/*
 * Configuración de navegación por rol.
 *
 * Es la ÚNICA diferencia entre los tres paneles: el DashboardShell es el
 * mismo para todos y solo recibe esta lista. Si un rol necesita una entrada
 * nueva, se añade aquí y no tocando el shell.
 *
 * Cada ítem: { id, label, i18n, icon, group?, groupI18n?, badge? }
 *   id        → segmento de la ruta: /admin/<id>
 *   i18n      → clave de traducción de la etiqueta
 *   label     → texto en español, usado como fallback si la clave no existe
 *   icon      → nombre canónico del componente Icon (SVG inline real)
 *   group     → encabezado del grupo (español, fallback)
 *   groupI18n → clave de traducción del encabezado
 *   badge     → valor dinámico (pedidos pendientes, facturas, etc.)
 *
 * POR QUÉ HAY DOS CAMPOS Y NO SÓLO LA CLAVE
 *
 * "label" a secas salía en español al cambiar a inglés, y el menú se quedaba
 * medio traducido. Ahora cada texto lleva su clave y el shell lo resuelve con
 * t(clave, fallback): si mañana falta una traducción, el ítem se ve en
 * español en vez de mostrar la clave cruda ("paneles.nav.admin.usuarios").
 */

export const NAV_ADMIN = {
  rol: "admin",
  etiquetaRol: "Administrador",
  rolI18n: "paneles.nav.roles.admin",
  base: "/admin",
  secciones: [
    {
      id: "dashboard",
      label: "Dashboard",
      i18n: "paneles.nav.admin.dashboard",
      icon: "home",
      group: "Panel de control",
      groupI18n: "paneles.nav.grupos.control",
    },
    { id: "usuarios", label: "Usuarios", i18n: "paneles.nav.admin.usuarios", icon: "users" },
    { id: "mensajeria", label: "Mensajería", i18n: "paneles.nav.mensajeria", icon: "message" },
    { id: "productos", label: "Productos", i18n: "paneles.nav.productos", icon: "box" },
    { id: "pedidos", label: "Pedidos", i18n: "paneles.nav.admin.pedidos", icon: "package" },
    { id: "productores", label: "Productores", i18n: "paneles.nav.admin.productores", icon: "leaf" },
    { id: "pagos", label: "Pagos", i18n: "paneles.nav.admin.pagos", icon: "card" },
    { id: "finanzas", label: "Reportes", i18n: "paneles.nav.admin.reportes", icon: "barChart" },
    { id: "logistica", label: "Logística", i18n: "paneles.nav.admin.logistica", icon: "truck" },
    { id: "cupones", label: "Cupones", i18n: "paneles.nav.admin.cupones", icon: "tag", group: "Operación", groupI18n: "paneles.nav.grupos.operacion" },
    { id: "resenas", label: "Reseñas", i18n: "paneles.nav.admin.resenas", icon: "star" },
    { id: "soporte", label: "Soporte", i18n: "paneles.nav.admin.soporte", icon: "help" },
    { id: "auditoria", label: "Auditoría", i18n: "paneles.nav.admin.auditoria", icon: "shield" },
    {
      id: "configuracion",
      label: "Configuración",
      i18n: "paneles.config.titulo",
      icon: "settings",
      group: "Sistema",
      groupI18n: "paneles.nav.grupos.sistema",
    },
  ],
};

export const NAV_PRODUCTOR = {
  rol: "productor",
  etiquetaRol: "Productor / Vendedor",
  rolI18n: "paneles.nav.roles.productor",
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
      i18n: "paneles.nav.productor.resumen",
      icon: "home",
      group: "Gestión del negocio",
      groupI18n: "paneles.nav.grupos.negocio",
    },
    { id: "misProductos", label: "Productos", i18n: "paneles.nav.productos", icon: "box" },
    { id: "pedidosRec", label: "Pedidos y ventas", i18n: "paneles.nav.productor.pedidosVentas", icon: "package" },
    { id: "mensajeria", label: "Mensajes", i18n: "paneles.nav.productor.mensajes", icon: "message" },
    { id: "resenas", label: "Reseñas", i18n: "paneles.nav.admin.resenas", icon: "star" },
    { id: "finca", label: "Información de la finca", i18n: "paneles.nav.productor.finca", icon: "leaf" },
    { id: "finanzas", label: "Finanzas / pagos", i18n: "paneles.nav.productor.finanzas", icon: "card" },
    { id: "rfq", label: "Oportunidades", i18n: "paneles.nav.rfq", icon: "lightbulb" },
    { id: "seguimiento", label: "Despachos", i18n: "paneles.nav.productor.despachos", icon: "truck", group: "Operación", groupI18n: "paneles.nav.grupos.operacion" },
    {
      id: "configuracion",
      label: "Configuración",
      i18n: "paneles.config.titulo",
      icon: "settings",
      group: "Sistema",
      groupI18n: "paneles.nav.grupos.sistema",
    },
  ],
  // "perfil" no se lista aquí: el shell la dibuja siempre en el pie fijo,
  // junto a "Cerrar sesión", para que nunca quede fuera de la vista.
};

export const NAV_COMPRADOR = {
  rol: "comprador",
  etiquetaRol: "Comprador",
  rolI18n: "paneles.nav.roles.comprador",
  base: "/dashboard-comprador",
  secciones: [
    { id: "resumen", label: "Resumen", i18n: "paneles.nav.comprador.resumen", icon: "home", group: "Navegación", groupI18n: "paneles.nav.grupos.navegacion" },
    { id: "catalogo", label: "Explorar catálogo", i18n: "paneles.nav.comprador.catalogo", icon: "box" },
    { id: "misPedidos", label: "Mis pedidos", i18n: "paneles.nav.comprador.misPedidos", icon: "package" },
    { id: "misFacturas", label: "Mis facturas", i18n: "paneles.nav.comprador.misFacturas", icon: "fileText" },
    { id: "rfq", label: "Licitaciones B2B (RFQ)", i18n: "paneles.nav.comprador.rfq", icon: "lightbulb" },
    { id: "seguimiento", label: "Seguimiento", i18n: "paneles.nav.comprador.seguimiento", icon: "truck", group: "Servicios", groupI18n: "paneles.nav.grupos.servicios" },
    { id: "mensajeria", label: "Mensajería", i18n: "paneles.nav.mensajeria", icon: "message" },
    { id: "resenas", label: "Mis reseñas", i18n: "paneles.nav.comprador.misResenas", icon: "star" },
    /*
     * "configuracion" NO se lista aquí: el panel del comprador no tiene
     * todavía esa sección, así que el enlace caía en el resumen sin avisar.
     * Se reincorpora cuando exista, junto con sus subsecciones.
     */
  ],
};

/*
 * Subsecciones de Configuración. Se muestran según lo que el rol usa de
 * verdad: el administrador no tiene lista de deseos ni historial de compra,
 * así que no le aparecen.
 */
export const CONFIG_COMUN = [
  { id: "notificaciones", label: "Notificaciones", i18n: "paneles.config.notificaciones", icon: "bell" },
  { id: "historial", label: "Historial", i18n: "paneles.config.historial", icon: "history" },
  { id: "direcciones", label: "Direcciones", i18n: "paneles.config.direcciones", icon: "mapPin" },
  { id: "cupones", label: "Cupones y promociones", i18n: "paneles.config.cupones", icon: "tag" },
  { id: "ayuda", label: "Centro de ayuda", i18n: "paneles.config.ayuda", icon: "help" },
  { id: "devoluciones", label: "Devoluciones", i18n: "paneles.config.devoluciones", icon: "undo" },
  { id: "pagos-guardados", label: "Pagos guardados", i18n: "paneles.config.pagosGuardados", icon: "card" },
  { id: "apariencia", label: "Apariencia", i18n: "paneles.config.apariencia", icon: "sliders" },
];

export const CONFIG_POR_ROL = {
  // El modo mantenimiento es exclusivo del administrador: bloquea la tienda a
  // los clientes, así que no tiene sentido ofrecerlo al productor o al
  // comprador. Por eso vive en la lista de Admin y no en la común.
  admin: [
    ...CONFIG_COMUN,
    { id: "sistema", label: "Sistema", i18n: "paneles.config.sistema", icon: "shield" },
  ],
  productor: CONFIG_COMUN,
  comprador: [
    ...CONFIG_COMUN.slice(0, 4),
    { id: "deseos", label: "Lista de deseos", i18n: "paneles.config.deseos", icon: "heart" },
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
