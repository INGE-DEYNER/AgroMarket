import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";

/**
 * Redirige las URL antiguas de los paneles a las rutas limpias por sección.
 *
 * Antes la sección se elegía con query string:
 *   /dashboard-productor?section=mensajeria
 * Ahora es una ruta real:
 *   /dashboard-productor/mensajeria
 *
 * Se usa `replace` para que el enlace antiguo no se quede en el historial:
 * si no, el botón "atrás" del navegador devolvería a la URL vieja y
 * redirigiría otra vez, creando un bucle en la navegación.
 */
const PREFIJOS = {
  PRODUCTOR: "/dashboard-productor",
  PRODUCER: "/dashboard-productor",
  COMPRADOR: "/dashboard-comprador",
  COMPRADOR_EMPRESA: "/dashboard-comprador",
  BUYER: "/dashboard-comprador",
  BUYER_COMPANY: "/dashboard-comprador",
  ADMIN: "/admin",
};

/** Las páginas que iban en /especial/* ahora cuelgan de Configuración. */
const ESPECIAL_A_CONFIG = {
  notificaciones: "notificaciones",
  historial: "historial",
  direcciones: "direcciones",
  "cupones": "cupones",
  "lista-deseos": "lista-deseos",
  ayuda: "ayuda",
  devoluciones: "devoluciones",
  pagos: "pagos",
  "modo-oscuro": "apariencia",
};

export default function LegacyRedirect({ soloEspecial }) {
  const location = useLocation();
  const { seccion } = useParams();
  const { user } = useAuth();

  // /especial/<pagina> -> /<rol>/configuracion/<subseccion>
  if (soloEspecial && seccion) {
    const destino = ESPECIAL_A_CONFIG[seccion];
    const prefijo = PREFIJOS[user?.rol] || "/dashboard-comprador";
    if (destino) {
      return <Navigate to={`${prefijo}/configuracion/${destino}`} replace />;
    }
    return <Navigate to={`${prefijo}/configuracion`} replace />;
  }

  // /<panel>?section=xxx -> /<panel>/xxx
  const params = new URLSearchParams(location.search);
  const seccionLegacy = params.get("section");
  const prefijo = PREFIJOS[user?.rol];
  if (seccionLegacy && prefijo) {
    return <Navigate to={`${prefijo}/${seccionLegacy}`} replace />;
  }

  if (prefijo) return <Navigate to={`${prefijo}/resumen`} replace />;
  return <Navigate to="/login" replace />;
}
