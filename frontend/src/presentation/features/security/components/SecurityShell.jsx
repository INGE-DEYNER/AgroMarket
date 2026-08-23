import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";
import "@/presentation/styles/security-system.css";

const NAV = [
  ["roles", "Roles y permisos", "◈"],
  ["acceso", "Control de acceso", "⌁"],
  ["2fa", "2FA / TOTP", "⌑"],
  ["seguridad", "Seguridad de cuenta", "⚿"],
  ["estados", "Estados especiales", "!"],
  ["matriz", "Matriz de permisos", "▦"],
  ["auditoria", "Auditoría y actividad", "◷"],
  ["privacidad", "Privacidad y datos", "◉"],
  ["confianza", "Sellos de confianza", "✓"],
];

export default function SecurityShell({ activeKey, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = `${(user?.nombre || "J").charAt(0)}${(user?.apellido || "P").charAt(0)}`.toUpperCase();

  return (
    <div className="security-shell">
      <header className="security-topbar">
        <button className="security-menu" onClick={() => setOpen(true)} aria-label="Abrir menú">☰</button>
        <Link to="/home" className="security-brand">
          <img src="/logo-asafrut.jpg" alt="AgroMarket" />
          <span><strong>AgroMarket</strong><small>Seguridad y confianza</small></span>
        </Link>
        <div className="security-top-status"><span className="status-online">●</span> Sistema operativo</div>
        <Link to="/dashboard-comprador" className="security-back">Volver al panel</Link>
      </header>

      <div className={`security-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />
      <div className="security-layout">
        <aside className={`security-sidebar${open ? " open" : ""}`}>
          <div className="security-user">
            <div className="security-avatar">{initials}</div>
            <div><strong>{user?.nombre || "Juan Pérez"} {user?.apellido || ""}</strong><small>{user?.correo || user?.email || "usuario@agromarket.co"}</small></div>
          </div>
          <div className="security-label">SEGURIDAD</div>
          {NAV.map(([key,label,icon]) => (
            <button key={key} className={`security-nav${activeKey===key ? " active" : ""}`} onClick={() => {setOpen(false); navigate(`/seguridad/${key}`);}}>
              <span>{icon}</span>{label}
            </button>
          ))}
          <button className="security-logout" onClick={async()=>{await logout();navigate("/login");}}>Cerrar sesión</button>
        </aside>
        <main className="security-main">
          <div className="security-breadcrumb">Inicio <span>›</span> Seguridad <span>›</span> {NAV.find(x=>x[0]===activeKey)?.[1]}</div>
          {children}
        </main>
      </div>
    </div>
  );
}
