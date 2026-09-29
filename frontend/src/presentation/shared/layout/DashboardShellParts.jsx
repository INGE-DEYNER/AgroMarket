import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Icon from "@/presentation/shared/components/Icon";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import ThemeToggle from "@/presentation/shared/components/ThemeToggle";
import PanelNotificaciones from "@/presentation/shared/components/PanelNotificaciones";
import { useAuth } from "@/app/hooks/useAuth";

/**
 * Lista de secciones agrupada. El encabezado se dibuja una sola vez.
 *
 * Las etiquetas y los encabezados de grupo llegan como `i18n` + `label`
 * (ver application/navigation/navConfig.js) y se resuelven aquí con
 * t(clave, fallback). El fallback en español es deliberado: si falta una
 * traducción, el ítem se lee en español y no muestra la clave cruda.
 */
export function NavItems({ nav, badges, onNavegar, t }) {
  const primera = nav.secciones[0]?.id;
  const salida = [];
  let grupoActual = null;

  nav.secciones.forEach((seccion) => {
    if (seccion.group && seccion.group !== grupoActual) {
      grupoActual = seccion.group;
      salida.push(
        <div key={`label-${seccion.group}`} className="ds-nav__label">
          {t(seccion.groupI18n, seccion.group)}
        </div>,
      );
    }
    salida.push(
      <NavLink
        key={seccion.id}
        to={`${nav.base}/${seccion.id}`}
        end={seccion.id === primera}
        className="ds-nav__item"
        onClick={onNavegar}
      >
        <span className="ds-nav__icon" aria-hidden="true">
          <Icon name={seccion.icon} size={18} />
        </span>
        <span className="ds-nav__item-label">
          {t(seccion.i18n, seccion.label)}
        </span>
        {badges[seccion.id] ? (
          <span className="ds-nav__badge">{badges[seccion.id]}</span>
        ) : null}
      </NavLink>,
    );
  });

  return salida;
}

/**
 * Barra superior única: marca, notificaciones, idioma, tema y usuario.
 * El tamaño del texto NO está aquí: lo controla el navegador y, como ajuste,
 * vive en Configuración → Apariencia.
 */
export function Topbar({ nav, iniciales, nombreCompleto, sidebarOpen, onOpenSidebar, t }) {
  const { user } = useAuth();

  return (
    <header className="ds-topbar">
      <button
        type="button"
        className="ds-sidebar-toggle"
        onClick={onOpenSidebar}
        aria-label={t("common.openMenu", "Abrir menú")}
        aria-expanded={sidebarOpen}
      >
        <Icon name="menu" size={18} />
      </button>

      <Link to="/home" className="ds-topbar__brand">
        <img src="/agromarket/logo.png" alt="AgroMarket" />
        <span>
          <strong>AgroMarket</strong>
          <small>
            {t("nav.brandTagline", "Del campo de Urabá y Colombia a tu mesa")}
          </small>
        </span>
      </Link>

      <div className="ds-topbar__actions">
        {/*
          * SIN control de tamaño de texto en la barra.
          *
          * El navegador ya lo ofrece (Ctrl + / Ctrl -), y tener tambien un
          * A- / A+ propio duplicaba el control y añadia un estado mas que
          * persistir. La funcionalidad NO se borra: sigue en FontScaleProvider
          * y se expone en Configuración → Apariencia, que es donde vive un
          * ajuste de este tipo.
          */}

        <PanelNotificaciones
          userId={user?.id}
          rutaVerTodas={`${nav.base}/configuracion/notificaciones`}
        />

        <LanguageSwitcher />
        <ThemeToggle />

        <div className="ds-topbar__user">
          <div className="ds-topbar__user-avatar" aria-hidden="true">
            {iniciales}
          </div>
          <span className="ds-topbar__user-text">
            <strong>{nombreCompleto || "Usuario"}</strong>
            <small>{nav.etiquetaRol}</small>
          </span>
        </div>
      </div>
    </header>
  );
}

/** Contenedor estándar de página: mismas proporciones en toda sección. */
export function PageContainer({ titulo, descripcion, acciones, children }) {
  return (
    <div className="ds-page">
      {(titulo || acciones) && (
        <div className="ds-page__head">
          <div>
            {titulo && <h1>{titulo}</h1>}
            {descripcion && <p>{descripcion}</p>}
          </div>
          {acciones}
        </div>
      )}
      {children}
    </div>
  );
}

/** Estado vacío o de carga con altura fija: evita saltos de layout. */
export function Placeholder({ children, cargando = false, t }) {
  return (
    <div className="ds-placeholder" role={cargando ? "status" : undefined}>
      {cargando ? t("common.loading", "Cargando…") : children}
    </div>
  );
}
