import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/presentation/features/order/hooks/useCart";
import LanguageSwitcher from "@/presentation/shared/components/LanguageSwitcher";
import DivisaSwitcher from "@/presentation/shared/components/DivisaSwitcher";
import ThemeToggle from "@/presentation/shared/components/ThemeToggle";
import CartDrawer from "@/presentation/shared/components/CartDrawer";
import "@/presentation/styles/special-system.css";

const ITEMS = [
  ["notificaciones", "Notificaciones", "bell"],
  ["direcciones", "Direcciones", "pin"],
  ["cupones", "Cupones y promociones", "tag"],
  ["deseos", "Lista de deseos", "heart"],
  ["historial", "Historial", "history"],
  ["ayuda-detallada", "Centro de ayuda", "help"],
  ["devoluciones", "Devoluciones", "return"],
  ["pagos-guardados", "Pagos guardados", "card"],
  ["modo-oscuro", "Modo oscuro", "theme"],
];

function SpecialIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    tag: (
      <>
        <path d="M20 13 13 20 4 11V4h7l9 9Z" />
        <path d="M8 8h.01" />
      </>
    ),
    heart: (
      <path d="M20.8 8.9c0 5-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.9A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.7Z" />
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 1 1 4.2 1.6c-.9.9-1.9 1.2-1.9 2.6" />
        <path d="M12 17h.01" />
      </>
    ),
    return: (
      <>
        <path d="M9 7H4v5" />
        <path d="M4 12a8 8 0 1 0 2-5" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    theme: (
      <>
        <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
      </>
    ),
  };
  return <svg {...common}>{icons[name] || icons.help}</svg>;
}

export default function SpecialSystemShell({ activeKey, children }) {
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
    await logout();
    navigate("/");
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
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <Link to="/home" className="special-brand">
          <img src="/logo-asafrut.jpg" alt="AgroMarket" />
          <span>
            <strong>AgroMarket</strong>
            <small>Del campo de Urabá y Colombia a tu mesa</small>
          </span>
        </Link>

        <form className="special-search" onSubmit={submitSearch} role="search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos, categorías o productores..."
            aria-label="Buscar"
          />
          <button type="submit" aria-label="Buscar">
            ⌕
          </button>
        </form>

        <div className="special-actions">
          <LanguageSwitcher />
          <DivisaSwitcher />
          <span className="special-location">
            <SpecialIcon name="pin" />
            Urabá, Colombia
          </span>
          <ThemeToggle />
          <button
            type="button"
            className="special-cart"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito. ${count || 0} productos`}
          >
            <SpecialIcon name="card" /> <b>{count || 0}</b>
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
              ← Volver al panel
            </Link>
            {ITEMS.map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                className={`special-nav-item${activeKey === key ? " active" : ""}`}
                onClick={() => go(key)}
              >
                <span className="special-nav-icon">
                  <SpecialIcon name={icon} />
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
