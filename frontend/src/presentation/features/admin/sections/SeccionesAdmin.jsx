import { useParams } from "react-router-dom";
import { seccionDesdeRuta } from "@/application/security/rutasAdmin";
import SeccionDashboard from "./SeccionDashboard";
import SeccionUsuarios from "./SeccionUsuarios";
import SeccionMensajeria from "./SeccionMensajeria";
import SeccionPedidos from "./SeccionPedidos";
import SeccionProductores from "./SeccionProductores";
import SeccionProductos from "./SeccionProductos";
import SeccionResenas from "./SeccionResenas";
import SeccionPagos from "./SeccionPagos";
import SeccionFinanzas from "./SeccionFinanzas";
import SeccionLogistica from "./SeccionLogistica";
import SeccionCupones from "./SeccionCupones";
import SeccionSoporte from "./SeccionSoporte";
import SeccionAuditoria from "./SeccionAuditoria";
import SeccionConfiguracion from "./SeccionConfiguracion";
import SeccionPerfil from "./SeccionPerfil";

/**
 * Monta la sección que corresponde a la ruta actual.
 *
 * Con el Outlet solo se monta la activa: las demás no llegan a evaluarse, así
 * que cambiar de sección no puede reproporcional el layout ni disparar
 * peticiones de otras vistas.
 *
 * La ruta lleva identificadores ofuscados en las secciones sensibles
 * (ver application/security/rutasAdmin.js), de ahí que el parámetro haya que
 * traducirse con seccionDesdeRuta antes de buscar el componente.
 */
const COMPONENTES = {
  dashboard: SeccionDashboard,
  usuarios: SeccionUsuarios,
  mensajeria: SeccionMensajeria,
  pedidos: SeccionPedidos,
  productores: SeccionProductores,
  productos: SeccionProductos,
  resenas: SeccionResenas,
  pagos: SeccionPagos,
  finanzas: SeccionFinanzas,
  logistica: SeccionLogistica,
  cupones: SeccionCupones,
  soporte: SeccionSoporte,
  auditoria: SeccionAuditoria,
  configuracion: SeccionConfiguracion,
  perfil: SeccionPerfil,
};

export default function SeccionesAdmin() {
  const { seccion: seccionRuta } = useParams();
  const seccion = seccionDesdeRuta(`/admin/${seccionRuta ?? ""}`) ?? seccionRuta;
  const Componente = COMPONENTES[seccion] ?? SeccionDashboard;
  return <Componente />;
}
