import { useParams } from "react-router-dom";
import SeccionResumen from "./SeccionResumen";
import SeccionCatalogo from "./SeccionCatalogo";
import SeccionMisPedidos from "./SeccionMisPedidos";
import SeccionSeguimiento from "./SeccionSeguimiento";
import SeccionMensajeria from "./SeccionMensajeria";
import SeccionResenas from "./SeccionResenas";
import SeccionPerfil from "./SeccionPerfil";
import SeccionMisFacturas from "./SeccionMisFacturas";
import SeccionRfq from "./SeccionRfq";
import SeccionConfiguracionRol from "@/presentation/shared/layout/SeccionConfiguracionRol";

/**
 * Monta la sección que corresponde a la ruta actual.
 *
 * Con el Outlet solo se monta la activa: las demás no llegan a evaluarse, así
 * que cambiar de sección no puede reproporcionar el layout ni disparar
 * peticiones de otras vistas.
 *
 * El mapa es explícito a propósito. Antes había una lista SECCIONES que se
 * usaba para validar la URL; si navConfig declaraba una clave que no estuviera
 * aquí, el panel salía en blanco. Ahora el fallo se ve al momento.
 */
const COMPONENTES = {
  resumen: SeccionResumen,
  catalogo: SeccionCatalogo,
  misPedidos: SeccionMisPedidos,
  misFacturas: SeccionMisFacturas,
  rfq: SeccionRfq,
  seguimiento: SeccionSeguimiento,
  mensajeria: SeccionMensajeria,
  resenas: SeccionResenas,
  perfil: SeccionPerfil,
};

export default function SeccionesComprador() {
  const { seccion, sub } = useParams();

  // Ver SeccionesAdmin.jsx: la subseccion de Configuracion la resuelve su
  // propia ruta, no este mapa.
  if (sub) {
    return (
      <SeccionConfiguracionRol rol="comprador" base="/dashboard-comprador" />
    );
  }

  const Componente = COMPONENTES[seccion] ?? SeccionResumen;
  return <Componente />;
}
