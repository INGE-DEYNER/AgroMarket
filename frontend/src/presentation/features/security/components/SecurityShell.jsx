import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";
import "@/presentation/styles/security-system.css";

/* Iconos = componente Icon (SVG real). Prohibido glifos Unicode de fuente. */
const NAV = [
  ["roles", "Roles y permisos", "users"],
  ["acceso", "Control de acceso", "lock"],
  ["2fa", "2FA / TOTP", "fingerprint"],
  ["seguridad", "Seguridad de cuenta", "shieldCheck"],
  ["estados", "Estados especiales", "alert"],
  ["matriz", "Matriz de permisos", "grid"],
  ["auditoria", "Auditoría y actividad", "history"],
  ["privacidad", "Privacidad y datos", "database"],
  ["confianza", "Sellos de confianza", "award"],
];

export default function SecurityShell({ activeKey, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials =
    `${(user?.nombre || "J").charAt(0)}${(user?.apellido || "P").charAt(0)}`.toUpperCase();

  return (
    <div className="security-shell">
      <header className="security-topbar">
        <button
          className="security-menu"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <Icon name="menu" size={20} />
        </button>
        <Link to="/home" className="security-brand">
          <img src="/agromarket/logo.png" alt="AgroMarket" />
          <span>
            <strong>AgroMarket</strong>
            <small>Seguridad y confianza</small>
          </span>
        </Link>
        <div className="security-top-status">
          <span className="status-online" aria-hidden="true">
            <Icon name="wifi" size={14} />
          </span>{" "}
          Sistema operativo
        </div>
        <Link to="/dashboard-comprador" className="security-back">
          Volver al panel
        </Link>
      </header>

      <div
        className={`security-overlay${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <div className="security-layout">
        <aside className={`security-sidebar${open ? " open" : ""}`}>
          <div className="security-user">
            <div className="security-avatar">{initials}</div>
            <div>
              <strong>
                {user?.nombre || "Juan Pérez"} {user?.apellido || ""}
              </strong>
              <small>
                {user?.correo || user?.email || "usuario@agromarket.co"}
              </small>
            </div>
          </div>
          <div className="security-label">SEGURIDAD</div>
          {NAV.map(([key, label, icon]) => (
            <button
              key={key}
              className={`security-nav${activeKey === key ? " active" : ""}`}
              onClick={() => {
                setOpen(false);
                navigate(`/seguridad/${key}`);
              }}
            >
              <span aria-hidden="true">
                <Icon name={icon} size={17} />
              </span>
              {label}
            </button>
          ))}
          <button
            className="security-logout"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            <Icon name="logout" size={15} />
            Cerrar sesión
          </button>
        </aside>
        <main className="security-main">
          <div className="security-breadcrumb">
            Inicio <span aria-hidden="true">›</span> Seguridad{" "}
            <span aria-hidden="true">›</span>{" "}
            {NAV.find((x) => x[0] === activeKey)?.[1]}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
