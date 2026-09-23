import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import DivisaSwitcher from "@/presentation/shared/components/DivisaSwitcher";
import ThemeToggle from "@/presentation/shared/components/ThemeToggle";
import CartDrawer from "@/presentation/shared/components/CartDrawer";
import Icon from "@/presentation/shared/components/Icon";
import "@/presentation/styles/special-system.css";

/* Iconos de navegación = nombres canónicos del componente Icon (SVG real). */
const ITEMS = [
  ["notificaciones", "Notificaciones", "bell"],
  ["direcciones", "Direcciones", "mapPin"],
  ["cupones", "Cupones y promociones", "tag"],
  ["deseos", "Lista de deseos", "heart"],
  ["historial", "Historial", "history"],
  ["ayuda-detallada", "Centro de ayuda", "help"],
  ["devoluciones", "Devoluciones", "undo"],
  ["pagos-guardados", "Pagos guardados", "card"],
  ["modo-oscuro", "Modo oscuro", "moon"],
];

export default function SpecialSystemShell({ activeKey, children }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const initials =
    `${(user?.nombre || "J").charAt(0)}${(user?.apellido || "P").charAt(0)}`.toUpperCase();

  const go = (key) => {
    setSidebarOpen(false);
    navigate(`/especial/${key}`);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const value = search.trim();
    navigate(
      value ? `/catalogo?search=${encodeURIComponent(value)}` : "/catalogo",
    );
  };

  const handleLogout = async () => {
    // AuthContext.logout() redirige al home 0.3 s después de limpiar sesión.
    await logout();
  };

  return (
    <div className="special-shell">
      <div
        className={`special-overlay${sidebarOpen ? " is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <header className="special-topbar">
        <button
          type="button"
          className="special-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label={t("common.openMenu", "Abrir menú")}
        >
          <Icon name="menu" size={20} />
        </button>

        <Link to="/home" className="special-brand">
          <img src="/agromarket/logo.png" alt="AgroMarket" />
          <span>
            <strong>AgroMarket</strong>
            <small>{t("nav.brandTagline", "Del campo de Urabá y Colombia a tu mesa")}</small>
          </span>
        </Link>

        <form className="special-search" onSubmit={submitSearch} role="search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("catalog.searchPlaceholder", "Buscar productos…")}
            aria-label={t("catalog.searchAria", "Buscar productos")}
          />
          <button type="submit" aria-label={t("catalog.searchAria", "Buscar productos")}>
            <Icon name="search" size={16} />
          </button>
        </form>

        <div className="special-actions">
          <LanguageSwitcher />
          <DivisaSwitcher />
          <span className="special-location">
            <Icon name="mapPin" size={15} />
            Urabá, Colombia
          </span>
          <ThemeToggle />
          <button
            type="button"
            className="special-cart"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito. ${count || 0} productos`}
          >
            <Icon name="cart" size={18} /> <b>{count || 0}</b>
          </button>
        </div>
      </header>

      <div className="special-body">
        <aside className={`special-sidebar${sidebarOpen ? " is-open" : ""}`}>
          <div className="special-user">
            <div className="special-avatar">{initials}</div>
            <div>
              <strong>
                {user?.nombre || "Juan Pérez"} {user?.apellido || ""}
              </strong>
              <span>
                {user?.correo || user?.email || "juanperez@email.com"}
              </span>
            </div>
          </div>

          <nav aria-label="Funciones especiales">
            <Link className="special-home-link" to="/dashboard-comprador">
              <Icon name="arrowLeft" size={14} /> Volver al panel
            </Link>
            {ITEMS.map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                className={`special-nav-item${activeKey === key ? " active" : ""}`}
                onClick={() => go(key)}
              >
                <span className="special-nav-icon" aria-hidden="true">
                  <Icon name={icon} size={17} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="special-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" size={15} />
            Cerrar sesión
          </button>
        </aside>

        <main className="special-main">
          <div className="special-breadcrumb">
            Inicio <span>›</span>{" "}
            {ITEMS.find((item) => item[0] === activeKey)?.[1] ||
              "Funciones especiales"}
          </div>
          {children}
        </main>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
