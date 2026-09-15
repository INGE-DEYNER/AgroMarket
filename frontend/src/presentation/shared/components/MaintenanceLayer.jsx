import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";
import { useAuth } from "@/app/hooks/useAuth";

const BYPASS_KEY = "am_maintenance_bypass";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin1234";

/**
 * Aviso global de "Modo Mantenimiento".
 *
 * - El backend expone GET /api/v1/config/system (público); esta capa sondea
 *   cada 15 s y al enfocar la ventana, así el aviso aparece AUTOMÁTICAMENTE
 *   en todos los navegadores cuando el admin lo activa.
 * - En la esquina inferior derecha hay un acceso con user/password
 *   (admin / admin1234). Solo desbloquea ESTE navegador (sessionStorage);
 *   los demás usuarios siguen viendo el aviso.
 * - El admin autenticado (rol ADMIN) y la ruta /admin nunca se bloquean,
 *   para que pueda seguir trabajando mientras dure el mantenimiento.
 */
export default function MaintenanceLayer() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const [maintenance, setMaintenance] = useState(false);
  const [ready, setReady] = useState(false);
  const [bypass, setBypass] = useState(
    () => sessionStorage.getItem(BYPASS_KEY) === "1",
  );
  const [showLogin, setShowLogin] = useState(false);
  const [cred, setCred] = useState({ user: "", pass: "" });
  const [loginError, setLoginError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/config/system");
      const data = res?.data || res;
      setMaintenance(Boolean(data?.mantenimiento));
    } catch {
      /* backend caído: no bloquear la app */
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15000);
    const onChanged = () => void refresh();
    window.addEventListener("agromarket:maintenance-changed", onChanged);
    window.addEventListener("focus", onChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener("agromarket:maintenance-changed", onChanged);
      window.removeEventListener("focus", onChanged);
    };
  }, [refresh]);

  const isAdmin =
    String(user?.role || "").toUpperCase() === "ADMIN" ||
    String(user?.rol || "").toUpperCase() === "ADMIN";
  const isOnAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const visible = ready && maintenance && !bypass && !isAdmin && !isOnAdminRoute;

  if (!visible) return null;

  const submit = (event) => {
    event.preventDefault();
    if (
      cred.user.trim().toLowerCase() === ADMIN_USER &&
      cred.pass === ADMIN_PASS
    ) {
      sessionStorage.setItem(BYPASS_KEY, "1");
      setBypass(true);
      setLoginError("");
    } else {
      setLoginError(
        t("maintenance.error", "Usuario o contraseña incorrectos."),
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("maintenance.title", "Sitio en mantenimiento")}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000,
        background:
          "radial-gradient(1200px 600px at 50% 20%, #0f5132 0%, #062d18 55%, #03180c 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Contenido central */}
      <div style={{ textAlign: "center", color: "#eef7f0", maxWidth: "560px" }}>
        <div style={{ fontSize: "64px", marginBottom: "10px" }}>🛠️</div>
        <h1 style={{ margin: 0, fontSize: "clamp(24px, 5vw, 38px)" }}>
          {t("maintenance.title", "AgroMarket está en mantenimiento")}
        </h1>
        <p
          style={{
            margin: "14px auto 0",
            lineHeight: 1.7,
            color: "rgba(238,247,240,.85)",
            fontSize: "1.02rem",
          }}
        >
          {t(
            "maintenance.sub",
            "Estamos mejorando la plataforma para ofrecerte frescura sin interrupciones. Volveremos muy pronto.",
          )}
        </p>
        <p
          style={{
            margin: "22px 0 0",
            fontSize: ".85rem",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "rgba(238,247,240,.6)",
          }}
        >
          {t("maintenance.badge", "Modo mantenimiento activo")}
        </p>
      </div>

      {/* Acceso administrativo (esquina inferior derecha) */}
      <div
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          width: "270px",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 18px 50px rgba(0,0,0,.45)",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={() => setShowLogin((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            padding: "11px 14px",
            background: "#0a5a27",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: ".82rem",
          }}
        >
          <span>🔐 {t("maintenance.adminLogin", "Acceso administrativo")}</span>
          <span aria-hidden="true">{showLogin ? "▾" : "▸"}</span>
        </button>

        {showLogin && (
          <form
            onSubmit={submit}
            style={{ padding: "14px", display: "grid", gap: "10px" }}
          >
            <label
              style={{
                fontSize: ".75rem",
                fontWeight: 700,
                color: "#334155",
                textAlign: "left",
              }}
            >
              {t("maintenance.user", "Usuario")}
              <input
                type="text"
                value={cred.user}
                onChange={(e) =>
                  setCred((c) => ({ ...c, user: e.target.value }))
                }
                autoComplete="username"
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5d0",
                  background: "#fff",
                  color: "#111827",
                  fontSize: ".85rem",
                  boxSizing: "border-box",
                  marginTop: "5px",
                }}
              />
            </label>
            <label
              style={{
                fontSize: ".75rem",
                fontWeight: 700,
                color: "#334155",
                textAlign: "left",
              }}
            >
              {t("maintenance.password", "Contraseña")}
              <input
                type="password"
                value={cred.pass}
                onChange={(e) =>
                  setCred((c) => ({ ...c, pass: e.target.value }))
                }
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5d0",
                  background: "#fff",
                  color: "#111827",
                  fontSize: ".85rem",
                  boxSizing: "border-box",
                  marginTop: "5px",
                }}
              />
            </label>
            {loginError && (
              <p style={{ margin: 0, color: "#dc2626", fontSize: ".75rem" }}>
                {loginError}
              </p>
            )}
            <button
              type="submit"
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: "#11823b",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: ".85rem",
              }}
            >
              {t("maintenance.login", "Entrar")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
