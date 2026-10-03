import { NavLink, useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/presentation/shared/components/Icon";
import NotificacionesCentro from "@/presentation/features/special/components/NotificacionesCentro";
import Apariencia from "@/presentation/features/special/components/Apariencia";
import { CONFIG_POR_ROL } from "@/application/navigation/navConfig";

/*
 * CONFIGURACIÓN de los tres paneles.
 *
 * Antes estas opciones vivían sueltas en SpecialSystemShell, en rutas
 * /especial/* fuera de los dashboards: al pulsarlas se salía del panel y se
 * perdía la navegación. Aquí son subsecciones del propio panel, con su
 * propia URL (/<base>/configuracion/<id>), así que son deep-links, el botón
 * "atrás" funciona y el shell no se desmonta.
 *
 * La lista sale de CONFIG_POR_ROL porque no todos los roles usan lo mismo: el
 * comprador tiene lista de deseos y el administrador no.
 */
const RUTAS_ESPECIALES = {
  notificaciones: NotificacionesCentro,
  apariencia: Apariencia,
};

export default function SeccionConfiguracion({ rol, base }) {
  const { t } = useTranslation();
  const { sub } = useParams();
  const items = CONFIG_POR_ROL[rol] || [];

  // Sin subseccion en la URL se abre la primera, que es Notificaciones: es la
  // que enlaza la campana y la que la gente busca al entrar en Configuración.
  if (!sub) {
    return <Navigate to={`${base}/configuracion/notificaciones`} replace />;
  }

  const actual = items.find((i) => i.id === sub) || items[0];
  const Contenido = RUTAS_ESPECIALES[actual.id];

  return (
    <div className="ds-page">
      <div className="ds-page__head">
        <div>
          <h1>{t("paneles.config.titulo", "Configuración")}</h1>
          <p>
            {t(
              "paneles.config.sub",
              "Ajusta tus notificaciones, tus datos y el aspecto de la plataforma.",
            )}
          </p>
        </div>
      </div>

      {/*
        Subnavegación. Se marca activa por ruta, como el sidebar principal:
        sin estado propio, de modo que recargar o compartir la URL deja la
        subsección correcta.
      */}
      <nav className="ds-config-nav" aria-label={t("paneles.config.titulo", "Configuración")}>
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={`${base}/configuracion/${item.id}`}
            end
            className={({ isActive }) =>
              "ds-config-nav__item" + (isActive ? " active" : "")
            }
          >
            <Icon name={item.icon} size={16} />
            <span>{t(item.i18n, item.label)}</span>
          </NavLink>
        ))}
      </nav>

      {/*
        Las subsecciones que aún no tienen página propia (historial,
        direcciones, cupones...) se muestran dentro del shell en lugar de
        sacar al usuario del panel. Cuando cada una tenga su implementación,
        se sustituye por un <Navigate> a su ruta.
      */}
      {Contenido ? (
        <Contenido />
      ) : (
        <div className="ds-placeholder">
          <h2>{t(actual.i18n, actual.label)}</h2>
          <p>
            {t(
              "paneles.config.proximamente",
              "Esta sección se está completando. El enlace funciona y te mantiene dentro del panel.",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
