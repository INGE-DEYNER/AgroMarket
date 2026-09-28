/**
 * Rutas ofuscadas del panel de administración.
 *
 * QUÉ HACE
 * Las secciones sensibles del panel no se exponen con su nombre real
 * (/admin/usuarios). Se direccionan con un identificador de 16 caracteres
 * derivados con HMAC-SHA256: /admin/f2589683424e1c60.
 *
 * QUÉ NO HACE (importante)
 * Esto NO es cifrado ni control de acceso. El identificador viaja dentro del
 * bundle JavaScript, así que cualquiera que abra las herramientas de
 * desarrollo puede ver el mapa completo. Su única utilidad es:
 *   - no revelar nombres de funciones internas en la barra de direcciones,
 *     en los marcadores, en el historial y en los registros del servidor;
 *   - impedir que se enumeren a mano escribiendo /admin/<nombre>.
 *
 * La seguridad real la aplica el SERVIDOR, que es donde importa:
 *   - ProtectedRoute con roles={["ADMIN"]} en App.jsx
 *   - SecurityConfig: /api/v1/admins/** exige hasRole("ADMIN")
 *   - @PreAuthorize("hasRole('ADMIN')") en los métodos de administración
 * Intentar cualquiera de estas URLs sin sesión de administrador falla igual,
 * se use el identificador legible o el ofuscado.
 *
 * CÓMO SE REGENERAN
 *   node frontend/gen-slugs.mjs
 * y se copia el resultado en SLUG_A_SECCION.
 */

/** Identificador ofuscado -> clave de sección usada por Admin.jsx. */
const SLUG_A_SECCION = {
  "f2589683424e1c60": "usuarios",
  "8408190cd3c0a1f7": "pagos",
  "8fd716031e2d6f40": "auditoria",
  "1fc25984810bae3a": "configuracion",
  "a058cef7a1a4439e": "finanzas",
  "8b575d6d2523aba8": "logistica",
};

/**
 * Secciones cuyo identificador va ofuscado. El resto (productos, pedidos,
 *.catalogo...) conserva su nombre legible: no aportan nada sensible y una URL
 * legible es mucho más usable.
 */
const SECCIONES_OFUSCADAS = new Set(Object.keys(SLUG_A_SECCION));

/** Base de las rutas del panel. */
const BASE_ADMIN = "/admin";

/** Ruta pública de una sección: ofuscada si corresponde, legible si no. */
export function rutaDeSeccion(seccion) {
  if (!seccion) return BASE_ADMIN;
  if (!SECCIONES_OFUSCADAS.has(seccion)) {
    return `${BASE_ADMIN}/${seccion}`;
  }

  const entrada = Object.entries(SLUG_A_SECCION).find(([, clave]) => clave === seccion);
  return entrada ? `${BASE_ADMIN}/${entrada[0]}` : BASE_ADMIN;
}

/**
 * Resuelve una URL del panel a su sección.
 * Acepta tanto la forma ofuscada como la legible, para no romper marcadores
 * ni enlaces guardados antes de este cambio.
 */
export function seccionDesdeRuta(ruta) {
  if (!ruta) return null;

  const limpio = ruta.split("?")[0].replace(/\/+$/, "");
  const partes = limpio.split("/").filter(Boolean);

  if (partes[0] !== "admin") return null;
  if (partes.length < 2) return null;

  const token = partes[1];
  if (SLUG_A_SECCION[token]) return SLUG_A_SECCION[token];
  return token;
}

/** Indica si una sección debe mostrarse con identificador ofuscado. */
export function esSeccionOfuscada(seccion) {
  return SECCIONES_OFUSCADAS.has(seccion);
}
