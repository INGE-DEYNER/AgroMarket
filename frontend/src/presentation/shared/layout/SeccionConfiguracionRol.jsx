import SeccionConfiguracion from "@/presentation/shared/layout/SeccionConfiguracion";

/*
 * Puente entre la sección de Configuración compartida y el contexto de datos
 * de cada rol.
 *
 * La subsección vive en presentation/shared/layout y es la misma para los
 * tres paneles; lo único que cambia es { rol, base }. Este archivo existe solo
 * para no repetir ese par tres veces, y para dejar un sitio donde colgar lo
 * que sí sea específico de un rol.
 *
 * Sin `key`: la sección lee la subsección de useParams(), así que no hace
 * falta remontarla en cada navegación, y remontarla perdería el scroll.
 */
export default function SeccionConfiguracionRol({ rol, base }) {
  return <SeccionConfiguracion rol={rol} base={base} />;
}
