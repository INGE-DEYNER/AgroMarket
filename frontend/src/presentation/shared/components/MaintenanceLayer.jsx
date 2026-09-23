import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";

const BYPASS_KEY = "am_maintenance_bypass";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin1234";
const SITE_URL = "www.agro-market.app";

/* Quita emojis al inicio de un texto traducido (el ícono ya se dibuja aparte) */
const stripEmoji = (s) =>
  String(s || "").replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, "");

/* Partículas (polen / semillas) con valores deterministas, sin Math.random */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 8) % 100,
  size: 4 + ((i * 5) % 9),
  delay: -((i * 1.7) % 16),
  duration: 12 + ((i * 3) % 10),
  drift: (i % 2 ? 1 : -1) * (18 + ((i * 7) % 40)),
}));

const CSS = `
.mt-root{
  --mt-deep:#03180c; --mt-forest:#062d18; --mt-leaf:#2fbf5f;
  --mt-lime:#c4f26b; --mt-sun:#ffc857; --mt-cream:#eef7f0;
  position:fixed; inset:0; z-index:2147483000; overflow-y:auto; overflow-x:hidden;
  display:flex; align-items:center; justify-content:center; padding:24px;
  color:var(--mt-cream); background:var(--mt-deep);
  font-family:inherit;
}
/* Aurora viva de fondo */
.mt-aurora{position:fixed; inset:-20%; pointer-events:none; filter:blur(60px); opacity:.9;
  background:
    radial-gradient(40% 35% at 25% 30%, rgba(47,191,95,.40), transparent 70%),
    radial-gradient(35% 30% at 78% 22%, rgba(255,200,87,.20), transparent 70%),
    radial-gradient(45% 40% at 60% 85%, rgba(17,130,59,.45), transparent 70%),
    linear-gradient(180deg,#0b3d22 0%, #062d18 50%, #03180c 100%);
  animation:mt-aurora 18s ease-in-out infinite alternate;}
@keyframes mt-aurora{
  0%{transform:translate3d(-3%,-2%,0) scale(1)}
  100%{transform:translate3d(3%,3%,0) scale(1.12)}
}
/* Surcos de cultivo en perspectiva */
.mt-rows{position:fixed; left:0; right:0; bottom:0; height:38%; pointer-events:none; opacity:.35;
  background:repeating-linear-gradient(90deg, rgba(196,242,107,.10) 0 2px, transparent 2px 64px);
  -webkit-mask-image:linear-gradient(to top,#000,transparent);
          mask-image:linear-gradient(to top,#000,transparent);
  transform:perspective(500px) rotateX(58deg); transform-origin:bottom;}
/* Polen flotante */
.mt-p{position:fixed; bottom:-20px; border-radius:50%; pointer-events:none;
  background:radial-gradient(circle,#e8ffb0 0%, rgba(196,242,107,0) 70%);
  animation:mt-float linear infinite; opacity:0;}
@keyframes mt-float{
  0%{transform:translate3d(0,0,0); opacity:0}
  12%{opacity:.9}
  85%{opacity:.6}
  100%{transform:translate3d(var(--dx),-108vh,0); opacity:0}
}
.mt-main{position:relative; z-index:2; width:100%; max-width:600px; text-align:center;
  padding:8px 0 96px; animation:mt-enter .9s cubic-bezier(.2,.8,.2,1) both;}
@keyframes mt-enter{from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:none}}

/* Brote animado: el elemento memorable */
.mt-sprout{width:170px; height:170px; margin:0 auto 6px; display:block; overflow:visible}
.mt-sun{transform-origin:85px 62px; animation:mt-sun 6s ease-in-out infinite}
@keyframes mt-sun{0%,100%{opacity:.55; transform:scale(.92)} 50%{opacity:1; transform:scale(1.08)}}
.mt-stem{stroke-dasharray:100; stroke-dashoffset:100; animation:mt-stem 7s ease-in-out infinite}
@keyframes mt-stem{0%,6%{stroke-dashoffset:100} 38%,88%{stroke-dashoffset:0} 100%{stroke-dashoffset:0; opacity:0}}
.mt-leaf{transform-box:fill-box; transform:scale(0); opacity:0}
.mt-leaf-l{transform-origin:100% 100%; animation:mt-leaf 7s ease-in-out infinite; animation-delay:0s}
.mt-leaf-r{transform-origin:0% 100%; animation:mt-leaf 7s ease-in-out infinite; animation-delay:.35s}
.mt-leaf-t{transform-origin:50% 100%; animation:mt-leaf 7s ease-in-out infinite; animation-delay:.7s}
@keyframes mt-leaf{
  0%,34%{transform:scale(0) rotate(-8deg); opacity:0}
  52%{transform:scale(1.1) rotate(3deg); opacity:1}
  60%,88%{transform:scale(1) rotate(0); opacity:1}
  100%{transform:scale(1); opacity:0}
}
.mt-sway{transform-origin:85px 138px; animation:mt-sway 4.5s ease-in-out infinite}
@keyframes mt-sway{0%,100%{transform:rotate(-2.2deg)} 50%{transform:rotate(2.2deg)}}

.mt-title{margin:14px 0 0; font-size:clamp(28px,6vw,46px); line-height:1.1; font-weight:800; letter-spacing:-.02em;
  background:linear-gradient(100deg,#ffffff 20%, #d9ffb0 50%, #ffffff 80%); background-size:220% 100%;
  -webkit-background-clip:text; background-clip:text; color:transparent;
  animation:mt-shine 6s linear infinite}
@keyframes mt-shine{from{background-position:120% 0} to{background-position:-120% 0}}
.mt-sub{margin:18px auto 0; max-width:48ch; line-height:1.75; font-size:1.05rem; color:rgba(238,247,240,.88)}
.mt-note{margin:10px auto 0; max-width:48ch; line-height:1.6; font-size:.95rem; color:rgba(238,247,240,.62)}

.mt-pill{display:inline-flex; align-items:center; gap:10px; margin-top:26px; padding:9px 18px;
  border-radius:999px; font-size:.86rem; font-weight:600; letter-spacing:.02em;
  background:rgba(255,255,255,.07); border:1px solid rgba(196,242,107,.28);
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px)}
.mt-dot{position:relative; width:9px; height:9px; border-radius:50%; background:var(--mt-lime)}
.mt-dot::after{content:""; position:absolute; inset:0; border-radius:50%; background:var(--mt-lime);
  animation:mt-ping 1.8s ease-out infinite}
@keyframes mt-ping{0%{transform:scale(1); opacity:.7} 100%{transform:scale(3.2); opacity:0}}

.mt-bar{position:relative; width:min(320px,80%); height:6px; margin:22px auto 0; border-radius:999px;
  background:rgba(255,255,255,.10); overflow:hidden}
.mt-bar::before{content:""; position:absolute; top:0; bottom:0; width:40%; border-radius:999px;
  background:linear-gradient(90deg, transparent, var(--mt-lime), var(--mt-leaf), transparent);
  animation:mt-bar 2.2s ease-in-out infinite}
@keyframes mt-bar{0%{left:-45%} 100%{left:105%}}

.mt-site{margin:20px 0 0; font-size:.9rem; color:rgba(238,247,240,.7)}
.mt-site strong{color:var(--mt-lime); font-weight:700}

/* Firma del desarrollador */
.mt-credit{margin:34px auto 0; padding-top:18px; max-width:300px; border-top:1px solid rgba(238,247,240,.14);
  display:flex; flex-direction:column; align-items:center; gap:3px}
.mt-by{font-size:.78rem; color:rgba(238,247,240,.55)}
.mt-name{font-size:1.08rem; font-weight:700; color:#fff; letter-spacing:.01em}
.mt-role{font-size:.8rem; color:var(--mt-sun); font-weight:600}

/* Acceso administrativo */
.mt-admin{position:fixed; right:18px; bottom:18px; z-index:5; width:270px; background:#fff;
  border-radius:14px; box-shadow:0 18px 50px rgba(0,0,0,.45); overflow:hidden}
.mt-admin-btn{width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding:11px 14px; background:#0a5a27; color:#fff; border:none; cursor:pointer; font-weight:700; font-size:.82rem;
  font-family:inherit; transition:background .2s}
.mt-admin-btn:hover{background:#0d6d2f}
.mt-form{padding:14px; display:grid; gap:10px; animation:mt-open .25s ease-out both}
@keyframes mt-open{from{opacity:0; transform:translateY(-6px)} to{opacity:1; transform:none}}
.mt-label{font-size:.75rem; font-weight:700; color:#334155; text-align:left}
.mt-input{width:100%; padding:9px 11px; margin-top:5px; box-sizing:border-box; border-radius:8px;
  border:1px solid #cbd5d0; background:#fff; color:#111827; font-size:.85rem; font-family:inherit}
.mt-submit{padding:10px 12px; border-radius:8px; border:none; background:#11823b; color:#fff;
  font-weight:800; cursor:pointer; font-size:.85rem; font-family:inherit; transition:background .2s}
.mt-submit:hover{background:#0e6f32}
.mt-err{margin:0; color:#dc2626; font-size:.75rem}
.mt-admin-btn:focus-visible,.mt-submit:focus-visible,.mt-input:focus-visible{outline:3px solid var(--mt-sun); outline-offset:2px}

@media (max-width:640px){
  .mt-root{align-items:flex-start; padding:20px 16px}
  .mt-main{padding:28px 0 110px}
  .mt-sprout{width:140px; height:140px}
  .mt-admin{left:14px; right:14px; bottom:14px; width:auto}
}
@media (prefers-reduced-motion:reduce){
  .mt-root *, .mt-root *::before, .mt-root *::after{animation:none !important}
  .mt-stem{stroke-dashoffset:0}
  .mt-leaf{transform:scale(1); opacity:1}
  .mt-p{display:none}
}
`;

/**
 * Aviso global de "Modo Mantenimiento" — AgroMarket (www.agro-market.app)
 *
 * - El backend expone GET /api/v1/config/system (público); esta capa sondea
 *   cada 15 s y al enfocar la ventana, así el aviso aparece AUTOMÁTICAMENTE
 *   en todos los navegadores cuando el admin lo activa.
 * - En la esquina inferior derecha hay un acceso con user/password.
 *   Solo desbloquea ESTE navegador (sessionStorage).
 * - El admin autenticado (rol ADMIN) y la ruta /admin nunca se bloquean.
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

  const visible =
    ready && maintenance && !bypass && !isAdmin && !isOnAdminRoute;

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

  const title = stripEmoji(
    t("maintenance.title", "AgroMarket está en mantenimiento"),
  );

  return (
    <div
      className="mt-root"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e) => e.key === "Escape" && setShowLogin(false)}
    >
      <style>{CSS}</style>

      {/* Fondo vivo */}
      <div className="mt-aurora" aria-hidden="true" />
      <div className="mt-rows" aria-hidden="true" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="mt-p"
          aria-hidden="true"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--dx": `${p.drift}px`,
          }}
        />
      ))}

      {/* Contenido central */}
      <main className="mt-main">
        <svg
          className="mt-sprout"
          viewBox="0 0 170 170"
          role="img"
          aria-label="Brote creciendo"
        >
          <defs>
            <radialGradient id="mtSun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe08a" stopOpacity=".95" />
              <stop offset="100%" stopColor="#ffc857" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mtLeaf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d5f97f" />
              <stop offset="100%" stopColor="#2fbf5f" />
            </linearGradient>
            <linearGradient id="mtSoil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7a4b2a" />
              <stop offset="100%" stopColor="#3f2614" />
            </linearGradient>
          </defs>

          {/* Sol suave detrás del brote */}
          <circle
            className="mt-sun"
            cx="85"
            cy="62"
            r="58"
            fill="url(#mtSun)"
          />

          {/* Brote */}
          <g className="mt-sway">
            <path
              className="mt-stem"
              pathLength="100"
              d="M85 138 C85 118 84 100 85 78"
              fill="none"
              stroke="#a8e063"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              className="mt-leaf mt-leaf-l"
              d="M84 104 C64 106 48 94 42 74 C64 72 80 82 84 104 Z"
              fill="url(#mtLeaf)"
            />
            <path
              className="mt-leaf mt-leaf-r"
              d="M86 92 C106 94 122 82 128 62 C106 60 90 70 86 92 Z"
              fill="url(#mtLeaf)"
            />
            <path
              className="mt-leaf mt-leaf-t"
              d="M85 80 C74 66 76 48 85 36 C94 48 96 66 85 80 Z"
              fill="url(#mtLeaf)"
            />
          </g>

          {/* Tierra */}
          <path
            d="M36 150 C40 132 62 128 85 128 C108 128 130 132 134 150 Z"
            fill="url(#mtSoil)"
          />
          <ellipse cx="85" cy="150" rx="52" ry="5" fill="#000" opacity=".25" />
        </svg>

        <h1 className="mt-title">{title}</h1>

        <p className="mt-sub">
          {t(
            "maintenance.sub",
            "Estamos sembrando mejoras para que tu próxima compra sea más fresca, rápida y segura. Volvemos muy pronto.",
          )}
        </p>
        <p className="mt-note">
          {t(
            "maintenance.note",
            "Gracias por confiar en el campo colombiano. Tu cosecha te está esperando.",
          )}
        </p>

        <div className="mt-pill" role="status">
          <span className="mt-dot" aria-hidden="true" />
          {stripEmoji(t("maintenance.badge", "Mantenimiento en curso"))}
        </div>

        <div className="mt-bar" aria-hidden="true" />

        <p className="mt-site">
          <strong>{SITE_URL}</strong>
        </p>

        {/* Firma del desarrollador */}
        <div className="mt-credit">
          <span className="mt-by">By:</span>
          <span className="mt-name">Deyner Chaverra</span>
          <span className="mt-role">Software Developer</span>
        </div>
      </main>

      {/* Acceso administrativo (esquina inferior derecha) */}
      <div className="mt-admin">
        <button
          type="button"
          className="mt-admin-btn"
          aria-expanded={showLogin}
          onClick={() => setShowLogin((v) => !v)}
        >
          <span><Icon name="lock" size={16} /> {t("maintenance.adminLogin", "Acceso administrativo")}</span>
          <span aria-hidden="true">{showLogin ? <Icon name="chevronDown" size={14} /> : <Icon name="arrowRight" size={14} />}</span>
        </button>

        {showLogin && (
          <form className="mt-form" onSubmit={submit}>
            <label className="mt-label">
              {t("maintenance.user", "Usuario")}
              <input
                className="mt-input"
                type="text"
                value={cred.user}
                onChange={(e) =>
                  setCred((c) => ({ ...c, user: e.target.value }))
                }
                autoComplete="username"
                autoFocus
              />
            </label>
            <label className="mt-label">
              {t("maintenance.password", "Contraseña")}
              <input
                className="mt-input"
                type="password"
                value={cred.pass}
                onChange={(e) =>
                  setCred((c) => ({ ...c, pass: e.target.value }))
                }
                autoComplete="current-password"
              />
            </label>
            {loginError && (
              <p className="mt-err" role="alert">
                {loginError}
              </p>
            )}
            <button type="submit" className="mt-submit">
              {t("maintenance.login", "Entrar")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
