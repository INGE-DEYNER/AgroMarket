import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import DivisaSwitcher from "@/presentation/shared/components/DivisaSwitcher";
import ThemeToggle from "@/presentation/shared/components/ThemeToggle";
import CartDrawer from "@/presentation/shared/components/CartDrawer";
import useAutoTranslateAll from "@/app/hooks/useAutoTranslateAll";
import "@/presentation/styles/comprador.css";

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    orders: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M9 7h6M9 11h6M9 15h4" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    message: (
      <>
        <path d="M4 5h16v11H8l-4 4z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6" />
        <circle cx="10" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </>
    ),
    heart: (
      <path d="M20.8 8.9c0 5-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.9A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.7Z" />
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 3v18" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.5h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h2.5V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.home}</svg>;
}

const NAV_ITEMS = [
  {
    key: "resumen",
    label: "Resumen",
    icon: "home",
    route: "/dashboard-comprador?section=resumen",
  },
  {
    key: "misPedidos",
    label: "Mis pedidos",
    icon: "orders",
    route: "/pedidos",
  },
  { key: "seguimiento", label: "Envíos", icon: "truck", route: "/envios" },
  {
    key: "mensajeria",
    label: "Mensajes",
    icon: "message",
    route: "/mensajeria",
  },
  { key: "resenas", label: "Reseñas", icon: "star", route: "/resenas" },
  {
    key: "direcciones",
    label: "Direcciones",
    icon: "pin",
    route: "/perfil?tab=personal",
  },
  {
    key: "pagos",
    label: "Pagos guardados",
    icon: "cart",
    route: "/perfil?tab=tarjetas",
  },
  {
    key: "configuracion",
    label: "Configuración",
    icon: "settings",
    route: "/perfil?tab=preferencias",
  },
];

export default function BuyerShell({
  activeKey = "resumen",
  onNavigate,
  children,
}) {
  useAutoTranslateAll();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const initials =
    `${(user?.nombre || "J").charAt(0)}${(user?.apellido || "P").charAt(0)}`.toUpperCase();

  const go = (item) => {
    setSidebarOpen(false);
    if (onNavigate) {
      onNavigate(item.key);
      return;
    }
    navigate(item.route);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(
      query ? `/catalogo?search=${encodeURIComponent(query)}` : "/catalogo",
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="buyer-shell">
      <div
        className={`buyer-sidebar-overlay${sidebarOpen ? " is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <header className="buyer-topbar">
        <button
          type="button"
          className="buyer-menu-button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú del comprador"
        >
          <Icon name="menu" />
        </button>

        <Link
          to="/home"
          className="buyer-brand"
          aria-label="AgroMarket, inicio"
        >
          <img src="/logo-asafrut.jpg" alt="AgroMarket" />
          <span>
            <strong>AgroMarket</strong>
            <small>{t("nav.brandTagline", "Del campo de Urabá y Colombia a tu mesa")}</small>
          </span>
        </Link>

        <form className="buyer-search" onSubmit={submitSearch} role="search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("catalog.searchPlaceholder", "Buscar productos…")}
            aria-label={t("catalog.searchAria", "Buscar productos")}
          />
          <button type="submit" aria-label="Buscar">
            <Icon name="search" size={17} />
          </button>
        </form>

        <div className="buyer-top-actions">
          <LanguageSwitcher />
          <DivisaSwitcher />
          <span className="buyer-location">
            <Icon name="pin" size={15} /> Urabá, Colombia
          </span>
          <ThemeToggle />
          <button
            type="button"
            className="buyer-cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito. ${count} productos`}
          >
            <Icon name="cart" />
            {count > 0 && <span>{count}</span>}
          </button>
          <button
            type="button"
            className="buyer-avatar"
            onClick={() => navigate("/perfil")}
            aria-label="Abrir perfil"
          >
            {user?.fotoUrl ? (
              <img src={user.fotoUrl} alt={user.nombre || "Perfil"} />
            ) : (
              initials
            )}
          </button>
        </div>
      </header>

      <div className="buyer-body">
        <aside className={`buyer-sidebar${sidebarOpen ? " is-open" : ""}`}>
          <div className="buyer-sidebar-profile">
            <div className="buyer-sidebar-avatar">{initials}</div>
            <div>
              <strong>{user?.nombre || "Comprador"}</strong>
              <span>{user?.email || "Cuenta personal"}</span>
            </div>
          </div>

          <div className="buyer-sidebar-label">Mi cuenta</div>
          <nav
            className="buyer-sidebar-nav"
            aria-label="Navegación del comprador"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`buyer-sidebar-link${activeKey === item.key ? " active" : ""}`}
                onClick={() => go(item)}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="buyer-sidebar-spacer" />
          <button
            type="button"
            className="buyer-sidebar-link buyer-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" size={17} />
            <span>Cerrar sesión</span>
          </button>
        </aside>

        <main className="buyer-main">{children}</main>
      </div>

      <nav className="buyer-mobile-nav" aria-label="Navegación móvil">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeKey === item.key ? "active" : ""}
            onClick={() => go(item)}
          >
            <Icon name={item.icon} size={17} />
            <span>{item.label === "Mis pedidos" ? "Pedidos" : item.label}</span>
          </button>
        ))}
      </nav>


      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
