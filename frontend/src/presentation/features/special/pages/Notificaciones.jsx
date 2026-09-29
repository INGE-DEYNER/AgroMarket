import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import NotificacionesCentro from "@/presentation/features/special/components/NotificacionesCentro";

/*
 * PÁGINA LEGADA de notificaciones: /especial/notificaciones.
 *
 * El contenido vive ahora en NotificacionesCentro, que se reutiliza dentro de
 * Configuración → Notificaciones en los tres paneles. Esta página se conserva
 * para los enlaces antiguos y para las páginas públicas (ayuda, devoluciones),
 * que usan SpecialSystemShell y no el shell de los paneles.
 *
 * El enlace "ver todas las notificaciones" de la campana ya NO apunta aquí:
 * va a <base del rol>/configuracion/notificaciones.
 */
export default function Notificaciones() {
  return (
    <SpecialSystemShell activeKey="notificaciones">
      <NotificacionesCentro />
    </SpecialSystemShell>
  );
}
