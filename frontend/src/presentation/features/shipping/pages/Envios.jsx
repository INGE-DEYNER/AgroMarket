import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BuyerShell from "@/presentation/features/order/components/BuyerShell";
import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";
import "@/presentation/styles/envios.css";

/*
 * El backend devuelve ShippingResponse con los campos EN INGLES y el estado
 * como el enum ShippingState (ORDER_CONFIRMED, PREPARING, IN_TRANSIT,
 * IN_DELIVERY, DELIVERED, CANCELLED).
 *
 * Esta pagina antes comparaba contra "Entregado" / "En transito" en espanol y
 * leia campos en espanol (origen, transportista, producto). Como el enum nunca
 * coincide, el filtro de la linea 22 no descartaba nada y TODOS los envios se
 * pintaban como "Pendiente", y las columnas de la tabla salian vacias. Se
 * normaliza una sola vez, al cargar.
 */

/** Traduccion, color y progreso por estado del enum. */
const ESTADOS = {
  ORDER_CONFIRMED: { clase: "status-pending", color: "var(--gold)", progreso: 10 },
  PREPARING: { clase: "status-pending", color: "var(--gold)", progreso: 35 },
  IN_TRANSIT: { clase: "status-shipped", color: "var(--blue)", progreso: 65 },
  IN_DELIVERY: { clase: "status-shipped", color: "var(--blue)", progreso: 85 },
  DELIVERED: { clase: "status-delivered", color: "var(--primary)", progreso: 100 },
  CANCELLED: { clase: "status-cancelled", color: "var(--text-muted)", progreso: 0 },
};

/** Acepta tambien etiquetas en espanol por si el servidor las devolviera. */
const ALIAS_ESTADO = {
  ENTREGADO: "DELIVERED",
  ENVIADO: "IN_TRANSIT",
  "EN CAMINO": "IN_TRANSIT",
  "EN REPARTO": "IN_DELIVERY",
  CANCELADO: "CANCELLED",
  PENDIENTE: "ORDER_CONFIRMED",
};

const ESTADOS_FINALES = new Set(["DELIVERED", "CANCELLED"]);

/** Convierte la respuesta del backend a la forma que consume la vista. */
function normalizarEnvio(envio) {
  const bruto = (envio.state ?? envio.estado ?? "").toString().toUpperCase();
  const estado = ESTADOS[bruto] ? bruto : (ALIAS_ESTADO[bruto] ?? "ORDER_CONFIRMED");
  const config = ESTADOS[estado];

  return {
    id: envio.id,
    producto: envio.productName ?? envio.producto ?? envio.product?.name ?? "—",
    origen: envio.origin ?? envio.origen ?? "—",
    destino:
      envio.destinationAddress ?? envio.destino ?? envio.destination ?? "—",
    transportista: envio.carrier ?? envio.transportista ?? null,
    guia: envio.trackingNumber ?? envio.guia ?? null,
    fecha: envio.createdAt
      ? new Date(envio.createdAt).toLocaleDateString("es-CO")
      : (envio.fecha ?? "—"),
    estado,
    progreso: envio.progress ?? envio.progreso ?? config.progreso,
    clase: config.clase,
    color: config.color,
  };
}

export default function Envios() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [envios, setEnvios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const data = await api.get("/envios");
        const lista = Array.isArray(data) ? data : (data?.content ?? []);
        if (vigente) setEnvios(lista.map(normalizarEnvio));
      } catch (err) {
        console.error("Error loadEnvios:", err);
        if (vigente) setEnvios([]);
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, []);

  // Activos = los que aun no llegaron; el resto se lista en el historial.
  const activos = envios.filter((e) => !ESTADOS_FINALES.has(e.estado));

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "productor") {
      return <Navigate to="/dashboard-productor?section=seguimiento" replace />;
    }
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }
  return (
    <BuyerShell activeKey="seguimiento">
      <main className="buyer-page-content">
        <div className="section-header">
          <span className="section-title">
            {t("envios.title", "Seguimiento de Envíos")}
          </span>
        </div>

        {cargando ? (
          <div className="spinner" />
        ) : activos.length === 0 ? (
          <div className="empty-state">
            <p>
              {envios.length === 0
                ? t("envios.noActive", "No hay envíos activos en este momento.")
                : t("envios.allDone", "Todos tus envíos fueron entregados.")}
            </p>
          </div>
        ) : (
          <div id="shipmentsContainer">
            {activos.map((s) => (
              <div key={s.id} className="shipment-card">
                <div className="shipment-header">
                  <div>
                    <div className="shipment-id">
                      {t("envios.id", "ID Envío")} #{s.id}
                    </div>
                    <div className="shipment-route">{s.producto}</div>
                    <div className="shipment-meta">
                      <span>
                        {s.origen} → {s.destino}
                      </span>
                      {s.transportista && <span>{s.transportista}</span>}
                      {s.guia && (
                        <span>
                          {t("envios.tracking", "Guía")}: {s.guia}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge-status ${s.clase}`}>
                    {t("envios.state." + s.estado, s.estado)}
                  </span>
                </div>
                <div className="shipment-progress">
                  <div
                    className="shipment-progress-fill"
                    style={{ width: `${s.progreso}%`, background: s.color }}
                  />
                </div>
                <div className="shipment-progress-label">
                  {s.progreso}% {t("envios.completed", "completado")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORIAL: incluye tambien los ya entregados, que antes se
            filtraban mal porque se comparaba contra "Entregado" en espanol
            contra un enum en ingles. */}
        <div className="shipments-history">
          <h3>{t("envios.historyTitle", "Historial de todos los envíos")}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("envios.id", "ID Envío")}</th>
                  <th>{t("envios.product", "Producto")}</th>
                  <th>{t("envios.route", "Origen → Destino")}</th>
                  <th>{t("envios.carrier", "Transportista")}</th>
                  <th>{t("envios.status", "Estado")}</th>
                  <th>{t("envios.date", "Fecha")}</th>
                </tr>
              </thead>
              <tbody id="tbHistorial">
                {envios.length === 0 ? (
                  <tr>
                    <td colSpan={6}>{t("envios.noActive", "Sin envíos.")}</td>
                  </tr>
                ) : (
                  envios.map((e) => (
                    <tr key={e.id}>
                      <td data-label={t("envios.id", "ID Envío")}>{e.id}</td>
                      <td data-label={t("envios.product", "Producto")}>
                        {e.producto}
                      </td>
                      <td data-label={t("envios.route", "Origen → Destino")}>
                        {e.origen} → {e.destino}
                      </td>
                      <td data-label={t("envios.carrier", "Transportista")}>
                        {e.transportista ?? "—"}
                      </td>
                      <td data-label={t("envios.status", "Estado")}>
                        <span className={`badge-status ${e.clase}`}>
                          {t("envios.state." + e.estado, e.estado)}
                        </span>
                      </td>
                      <td data-label={t("envios.date", "Fecha")}>{e.fecha}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </BuyerShell>
  );
}
