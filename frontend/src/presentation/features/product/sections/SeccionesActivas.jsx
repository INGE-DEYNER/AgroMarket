import { useParams } from "react-router-dom";
import { NAV_PRODUCTOR } from "@/application/navigation/navConfig";
import SeccionResumen from "./SeccionResumen";
import SeccionMisProductos from "./SeccionMisProductos";
import SeccionPedidosRec from "./SeccionPedidosRec";
import SeccionSeguimiento from "./SeccionSeguimiento";
import SeccionMensajeria from "./SeccionMensajeria";
import SeccionResenas from "./SeccionResenas";
import SeccionFinca from "./SeccionFinca";
import SeccionFinanzas from "./SeccionFinanzas";
import SeccionConfiguracion from "./SeccionConfiguracion";
import SeccionPerfil from "./SeccionPerfil";
import SeccionRfq from "./SeccionRfq";
import SeccionConfiguracionRol from "@/presentation/shared/layout/SeccionConfiguracionRol";

/**
 * Monta la sección que corresponde a la ruta actual.
 *
 * Antes todas las secciones vivían en el mismo archivo y se mostraban según
 * `activeSection === "x"`. Con el Outlet solo se monta la activa: el resto no
 * llega a evaluarse, así que cambiar de sección no puede desproporcionar el
 * layout ni disparar peticiones de otras vistas.
 *
 * El mapa es explícito a propósito: si navConfig declara una sección sin
 * entrada aquí, se ve al momento en vez de quedar en blanco.
 */
const SECCIONES = {
  resumen: SeccionResumen,
  misProductos: SeccionMisProductos,
  pedidosRec: SeccionPedidosRec,
  seguimiento: SeccionSeguimiento,
  mensajeria: SeccionMensajeria,
  resenas: SeccionResenas,
  finca: SeccionFinca,
  finanzas: SeccionFinanzas,
  configuracion: SeccionConfiguracion,
  perfil: SeccionPerfil,
  rfq: SeccionRfq,
};

export default function SeccionesActivas() {
  const { seccion, sub } = useParams();

  // Ver SeccionesAdmin.jsx: la subseccion de Configuracion la resuelve su
  // propia ruta, no este mapa.
  if (sub) {
    return (
      <SeccionConfiguracionRol rol="productor" base="/dashboard-productor" />
    );
  }

  const Componente = SECCIONES[seccion] || SECCIONES.resumen;

  // Aviso en desarrollo si navConfig y este mapa se desincronizan.
  if (import.meta.env.DEV) {
    const declaradas = NAV_PRODUCTOR.secciones.map((s) => s.id);
    const faltantes = declaradas.filter((id) => !SECCIONES[id]);
    if (faltantes.length) {
      console.warn(
        `[productor] navConfig declara secciones sin componente: ${faltantes.join(", ")}`,
      );
    }
  }

  return <Componente />;
}
