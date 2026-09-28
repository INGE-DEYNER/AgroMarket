import { useProductorData } from "./ProductorContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import { useNavigate } from "react-router-dom";

/*
 * Seccion "Resumen" del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del dashboard.
 * Lo unico que cambia: el estado llega por contexto en vez de por el
 * ambito del padre, y el contenedor ya no lleva la condicion de
 * activeSection porque con el Outlet solo se monta la seccion activa.
 */
export default function SeccionResumen() {
  const { t } = useTranslation();
  const { formatPrice, user } = useAuth();
  const { navigate } = useNavigate();
  const {
    badgeClass,
    calificacionProductor,
    openProductoModal,
    pedidos,
    productos,
    reputacion,
  } = useProductorData();

  return (
<div className={`section`} id="sec-resumen">
  <div className="dash-header">
    <div className="dash-welcome">
      <h1>
        {t(
          "dashboardProductor.welcome",
          "¡Excelente día, {{name}}!",
          { name: user?.nombre || "Luis" },
        )}
      </h1>
      <p>
        {t(
          "dashboardProductor.sub",
          "Tu cosecha está teniendo un gran rendimiento este mes en Urabá.",
        )}
      </p>
    </div>
    <button className="btn-cta" onClick={() => openProductoModal()}>
      {t("dashboardProductor.publishProduct", "Publicar Producto +")}
    </button>
  </div>

  {!user?.verificado && (
    <div
      style={{
        background:
          "linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)",
        border: "1px solid #ffe8a1",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "12px" }}
      >
        <span style={{ fontSize: "1.5rem" }}></span>
        <div>
          <strong style={{ color: "#856404", display: "block" }}>
            Tu cuenta de productor aún no está verificada
          </strong>
          <span style={{ color: "#856404", fontSize: "0.85rem" }}>
            Completa tu información personal y de ubicación para
            ser aprobado por el administrador.
          </span>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/perfil")}
        style={{
          background: "#856404",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
        }}
      >
        Verificar Perfil
      </button>
    </div>
  )}

  <div className="stats-grid">
    <div className="stat-card color-1">
      <span className="stat-icon-lg"></span>
      <div className="stat-label">
        {t(
          "dashboardProductor.stats.activeProducts",
          "Productos Activos",
        )}
      </div>
      <div className="stat-value">
        {String(productos.length).padStart(2, "0")}
      </div>
    </div>
    <div className="stat-card color-2">
      <span className="stat-icon-lg"></span>
      <div className="stat-label">
        {t("dashboardProductor.stats.monthlySales", "Ventas del Mes")}
      </div>
      <div className="stat-value">
        {String(pedidos.length).padStart(2, "0")}
      </div>
    </div>
    <div className="stat-card color-3">
      <span className="stat-icon-lg"></span>
      <div className="stat-label">
        {t(
          "dashboardProductor.stats.totalEarnings",
          "Ingresos Totales",
        )}
      </div>
      <div className="stat-value">
        {formatPrice(
          pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0),
        )}
      </div>
    </div>
    <div className="stat-card color-4">
      <span className="stat-icon-lg"></span>
      <div className="stat-label">
        {t("dashboardProductor.stats.rating", "Calificación")}
      </div>
      <div className="stat-value">
        {calificacionProductor}
        {reputacion && (
          <small style={{ color: "var(--text-dim)" }}>
            {" "}
            ({reputacion.total})
          </small>
        )}
      </div>
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px",
    }}
  >
    <div className="card-table">
      <div className="table-header">
        <h3 className="card-title">
          {" "}
          {t("dashboardProductor.recentSales", "Últimas ventas")}
        </h3>
      </div>
      <div className="table-wrap">
        <table className="table-responsive">
          <thead>
            <tr>
              <th>{t("dashboardProductor.order", "Pedido")}</th>
              <th>{t("dashboardProductor.buyer", "Comprador")}</th>
              <th>{t("dashboardProductor.total", "Total")}</th>
              <th>{t("dashboardProductor.status", "Estado")}</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.slice(0, 5).map((p) => (
              <tr key={p.id}>
                <td data-label="Pedido">#{p.id}</td>
                <td data-label="Comprador">
                  {p.comprador || p.nombreComprador || "—"}
                </td>
                <td data-label="Total">{formatPrice(p.total)}</td>
                <td data-label="Estado">
                  <span className={badgeClass(p.estado)}>
                    {t(
                      "pedidos.status." + p.estado?.toLowerCase(),
                      p.estado,
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
  );
}
