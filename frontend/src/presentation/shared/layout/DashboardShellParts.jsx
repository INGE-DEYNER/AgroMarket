import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Icon from "@/presentation/shared/components/Icon";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import ThemeToggle from "@/presentation/shared/components/ThemeToggle";
import PanelNotificaciones from "@/presentation/shared/components/PanelNotificaciones";
import { useAuth } from "@/app/hooks/useAuth";
import { useFontScale } from "@/app/contexts/FontScaleContext";

/** Lista de secciones agrupada. El encabezado se dibuja una sola vez. */
export function NavItems({ nav, badges, onNavegar }) {
  const primera = nav.secciones[0]?.id;
  const salida = [];
  let grupoActual = null;

  nav.secciones.forEach((seccion) => {
    if (seccion.group && seccion.group !== grupoActual) {
      grupoActual = seccion.group;
      salida.push(
        <div key={`label-${seccion.group}`} className="ds-nav__label">
          {seccion.group}
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
        <span className="ds-nav__item-label">{seccion.label}</span>
        {badges[seccion.id] ? (
          <span className="ds-nav__badge">{badges[seccion.id]}</span>
        ) : null}
      </NavLink>,
    );
  });

  return salida;
}

/** Barra superior única: marca, control de fuente, avisos, idioma, tema, usuario. */
export function Topbar({ nav, iniciales, nombreCompleto, sidebarOpen, onOpenSidebar, t }) {
  const { user } = useAuth();
  const { fontScale, increase, decrease, reset, canIncrease, canDecrease } =
    useFontScale();

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
        {/* Los límites (0.85–1.25) los acota el provider: por encima el
            sidebar deja de caber en pantallas bajas y el pie se cortaría. */}
        <div
          className="ds-font-scale"
          role="group"
          aria-label={t("common.fontSize", "Tamaño del texto")}
        >
          <button
            type="button"
            onClick={decrease}
            disabled={!canDecrease}
            aria-label={t("common.fontSmaller", "Reducir tamaño del texto")}
            title={t("common.fontSmaller", "Reducir tamaño del texto")}
          >
            A−
          </button>
          <output aria-live="polite">{Math.round(fontScale * 100)}%</output>
          <button
            type="button"
            onClick={increase}
            disabled={!canIncrease}
            aria-label={t("common.fontBigger", "Aumentar tamaño del texto")}
            title={t("common.fontBigger", "Aumentar tamaño del texto")}
          >
            A+
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={fontScale === 1}
            aria-label={t("common.fontReset", "Restablecer tamaño del texto")}
            title={t("common.fontReset", "Restablecer tamaño del texto")}
          >
            <Icon name="undo" size={13} />
          </button>
        </div>

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
export function Placeholder({ children, cargando = false }) {
  return (
    <div className="ds-placeholder" role={cargando ? "status" : undefined}>
      {cargando ? "Cargando…" : children}
    </div>
  );
}
