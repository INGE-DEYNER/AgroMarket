import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";
import { NavItems, Topbar } from "./DashboardShellParts";
import "@/presentation/styles/dashboard-shell.css";

export { PageContainer, Placeholder } from "./DashboardShellParts";

/**
 * Shell ÚNICO de los tres paneles.
 *
 * Antes cada dashboard reimplementaba su propio topbar y sidebar
 * (Admin.jsx, DashboardProductor.jsx, DashboardComprador.jsx, más
 * BuyerShell, SpecialSystemShell y SecurityShell), con tamaños, tokens y
 * clases distintas. Eso producía los menús desproporcionados, los topbars
 * recortados —usaban márgenes negativos para salirse del flujo— y el
 * sidebar sin pie fijo, que cortaba "Cerrar sesión".
 *
 * Aquí la única diferencia entre roles es el array `nav` que recibe
 * `navConfig.js`. El resaltado del ítem activo es por ruta (NavLink aporta
 * aria-current="page"), no por estado: así el botón "atrás" del navegador y
 * los enlaces pegados en la barra de direcciones funcionan sin código extra.
 */
export default function DashboardShell({ nav, children, badges = {} }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * El menú lateral se cierra en el clic del ítem, no en un efecto que
   * reacciona a la ruta. Hacerlo en un efecto provocaba un render en cascada
   * (regla react-hooks/set-state-in-effect) y, además, se disparaba también
   * al entrar por URL directa o por el botón "atrás".
   */
  const cerrarSidebar = useCallback(() => setSidebarOpen(false), []);

  const iniciales =
    `${(user?.nombre || "U").charAt(0)}${(user?.apellido || "S").charAt(0)}`.toUpperCase();

  const nombreCompleto = [user?.nombre, user?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  const cerrarSesion = useCallback(async () => {
    // AuthContext.logout() limpia la sesión y redirige al home.
    await logout();
  }, [logout]);

  return (
    <div className="ds-shell">
      <Topbar
        nav={nav}
        iniciales={iniciales}
        nombreCompleto={nombreCompleto}
        sidebarOpen={sidebarOpen}
        onOpenSidebar={() => setSidebarOpen(true)}
        t={t}
      />

      <div className="ds-body">
        <button
          type="button"
          className={`ds-overlay${sidebarOpen ? " is-open" : ""}`}
          onClick={cerrarSidebar}
          aria-label={t("common.closeMenu", "Cerrar menú")}
          tabIndex={sidebarOpen ? 0 : -1}
        />

        <aside className={`ds-sidebar${sidebarOpen ? " is-open" : ""}`}>
          <div className="ds-sidebar__profile">
            <div className="ds-sidebar__avatar" aria-hidden="true">
              {iniciales}
            </div>
            <span className="ds-sidebar__profile-text">
              <strong>{nombreCompleto || t("common.user", "Usuario")}</strong>
              <small>{t(nav.rolI18n, nav.etiquetaRol)}</small>
            </span>
          </div>

          <nav
            className="ds-nav"
            aria-label={t("paneles.nav.menuDe", { role: t(nav.rolI18n, nav.etiquetaRol) })}
          >
            <NavItems
              nav={nav}
              badges={badges}
              onNavegar={cerrarSidebar}
              t={t}
            />
          </nav>

          {/* Zona fija al pie: el nav es el único elemento con scroll, así
              que Mi perfil y Cerrar sesión nunca se cortan. */}
          <div className="ds-sidebar__footer">
            <NavLink
              to={`${nav.base}/perfil`}
              className="ds-nav__item"
              onClick={cerrarSidebar}
            >
              <span className="ds-nav__icon" aria-hidden="true">
                <Icon name="user" size={18} />
              </span>
              <span className="ds-nav__item-label">
                {t("profile.title", "Mi perfil")}
              </span>
            </NavLink>

            <button
              type="button"
              className="ds-nav__item ds-nav__item--danger"
              onClick={cerrarSesion}
            >
              <span className="ds-nav__icon" aria-hidden="true">
                <Icon name="logout" size={18} />
              </span>
              <span className="ds-nav__item-label">
                {t("nav.logout", "Cerrar sesión")}
              </span>
            </button>
          </div>
        </aside>

        <main className="ds-main">{children}</main>
      </div>
    </div>
  );
}
