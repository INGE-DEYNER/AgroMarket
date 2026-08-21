import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/presentation/shared/components/Navbar";
import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/envios.css";

export default function Envios() {
  const { t } = useTranslation();
  const { user } = useAuth();


  const [shipments, setShipments] = useState([]);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/envios");
        const list = Array.isArray(data) ? data : data.content || [];
        setShipments(list.filter((e) => e.estado !== "Entregado"));
        setHistorial(list);
      } catch (err) {
        console.error("Error loadEnvios:", err);
        setShipments([]);
        setHistorial([]);
      }
    })();
  }, []);

  const progressColor = (estado) => {
    if (estado === "Entregado") return "var(--primary)";
    if (estado === "En trÃ¡nsito") return "var(--blue)";
    return "var(--gold)";
  };

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "comprador") {
      return <Navigate to="/dashboard-comprador?section=seguimiento" replace />;
    } else if (role === "productor") {
      return <Navigate to="/dashboard-productor?section=seguimiento" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }
  return (
    <>
      <Navbar />

      <main
        style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <div className="section-header" style={{ marginBottom: "24px" }}>
          <span className="section-title">
            {t("envios.title", "Seguimiento de EnvÃ­os")}
          </span>
        </div>

        {/* ACTIVE SHIPMENTS */}
        <div id="shipmentsContainer">
          {shipments.length === 0 ? (
            <div
              className="empty-state"
              style={{ padding: "40px", textAlign: "center" }}
            >
              <div className="empty-icon"></div>
              <div>
                {t("envios.noActive", "No hay envÃ­os activos en este momento.")}
              </div>
            </div>
          ) : (
            shipments.map((s) => (
              <div
                key={s.id}
                className="shipment-card"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius)",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>
                      {s.producto}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                      }}
                    >
                      {s.origen} â†’ {s.destino} Â· {s.transportista}
                    </div>
                  </div>
                  <span className="badge-status status-shipped">
                    {t("pedidos.status." + s.estado?.toLowerCase(), s.estado)}
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--border-light)",
                    borderRadius: "4px",
                    height: "8px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${s.progreso || 0}%`,
                      background: progressColor(s.estado),
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                  }}
                >
                  {s.progreso || 0}% {t("envios.completed", "completado")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* HISTORY TABLE */}
        <div style={{ marginTop: "32px" }}>
          <h3
            style={{
              fontFamily: "var(--font-title)",
              fontSize: "1.05rem",
              marginBottom: "16px",
            }}
          >
            {t("envios.historyTitle", "Historial de todos los envÃ­os")}
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("envios.id", "ID EnvÃ­o")}</th>
                  <th>{t("envios.product", "Producto")}</th>
                  <th>{t("envios.route", "Origen â†’ Destino")}</th>
                  <th>{t("envios.carrier", "Transportista")}</th>
                  <th>{t("envios.status", "Estado")}</th>
                  <th>{t("envios.date", "Fecha")}</th>
                </tr>
              </thead>
              <tbody id="tbHistorial">
                {historial.map((e) => (
                  <tr key={e.id}>
                    <td data-label={t("envios.id", "ID EnvÃ­o")}>{e.id}</td>
                    <td data-label={t("envios.product", "Producto")}>
                      {e.producto}
                    </td>
                    <td data-label={t("envios.route", "Origen â†’ Destino")}>
                      {e.origen} â†’ {e.destino}
                    </td>
                    <td data-label={t("envios.carrier", "Transportista")}>
                      {e.transportista}
                    </td>
                    <td data-label={t("envios.status", "Estado")}>
                      <span
                        className={`badge-status ${e.estado === "Entregado" ? "status-shipped" : "status-pending"}`}
                      >
                        {t(
                          "pedidos.status." + e.estado?.toLowerCase(),
                          e.estado,
                        )}
                      </span>
                    </td>
                    <td data-label={t("envios.date", "Fecha")}>{e.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}



