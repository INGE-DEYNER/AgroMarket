/*
 * SeccionResumen — sección del panel.
 *
 * Movimiento puro del JSX que estaba dentro del archivo del panel. Lo
 * único que cambia: el estado llega por contexto en vez de por el ámbito del
 * padre, y el contenedor ya no lleva la condición de activeSection porque
 * con el Outlet solo se monta la sección activa.
 */
import { useCompradorData } from "./CompradorContexto.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import Icon from "@/presentation/shared/components/Icon";

export default function SeccionResumen() {
  const { t } = useTranslation();
  const { formatPrice, user } = useAuth();
  const { badgeClass, currentDate, getGroupedPedidos, nombreUsuario, pedidos, reviewsDejadasCount, setCheckoutPedido, setPagoModalOpen, showSection, totalInvestment, uniqueProducersCount } = useCompradorData();

  return (
<div className="section" id="sec-resumen">
          <div className="dash-header">
            <div className="dash-welcome">
              <h1>
                {t(
                  "dashboardComprador.welcome",
                  "¡Hola de nuevo, {{name}}!",
                  { name: nombreUsuario },
                )}
              </h1>
              <p>
                {currentDate} • 28°C {t("dashboardComprador.sub", "Urabá")}
              </p>
            </div>
            <button
              className="btn-cta"
              onClick={() => showSection("catalogo")}
            >
              {t("dashboardComprador.exploreCatalog", "Explorar catálogo")} <Icon name="arrowRight" size={15} />
            </button>
          </div>

          {!user?.telefono && (
            <div className="buyer-alert">
              <div>
                <strong>{t("paneles.security.improveTitle", "¡Mejora la seguridad de tu cuenta!")}</strong>
                <span>
                  Agrega tu número de teléfono y verifica tu perfil para
                  facilitar el contacto con los productores.
                </span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => showSection("perfil")}
              >
                Configurar Perfil
              </button>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card color-1">
              <span className="stat-icon-lg"></span>
              <div className="stat-label">
                {t(
                  "dashboardComprador.stats.ordersPlaced",
                  "Pedidos Realizados",
                )}
              </div>
              <div className="stat-value">
                {String(pedidos.length).padStart(2, "0")}
              </div>
            </div>
            <div className="stat-card color-2">
              <span className="stat-icon-lg"></span>
              <div className="stat-label">
                {t(
                  "dashboardComprador.stats.totalInvestment",
                  "Inversión Total",
                )}
              </div>
              <div className="stat-value">{formatPrice(totalInvestment)}</div>
            </div>
            <div className="stat-card color-3">
              <span className="stat-icon-lg"></span>
              <div className="stat-label">
                {t("dashboardComprador.stats.reviewsLeft", "Reseñas Dejadas")}
              </div>
              <div className="stat-value">{reviewsDejadasCount}</div>
            </div>
            <div className="stat-card color-4">
              <span className="stat-icon-lg"></span>
              <div className="stat-label">
                {t("dashboardComprador.stats.producers", "Productores")}
              </div>
              <div className="stat-value">{uniqueProducersCount}</div>
            </div>
          </div>

          {/* TABLA RECIENTES */}
          <div className="card-table" style={{ marginBottom: "32px" }}>
            <div className="table-header">
              <h3 className="card-title">
                {" "}
                {t("dashboardComprador.recentOrders", "Pedidos Recientes")}
              </h3>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showSection("misPedidos");
                }}
                style={{ fontSize: "0.8rem", fontWeight: "600" }}
              >
                {t(
                  "dashboardComprador.viewAllOrders",
                  "Ver todos los pedidos",
                )}
              </a>
            </div>
            <div className="table-wrap">
              <table className="table-responsive">
                <thead>
                  <tr>
                    <th>{t("pedidos.id", "ID")}</th>
                    <th>{t("pedidos.product", "Producto")}</th>
                    <th>{t("pedidos.total", "Total")}</th>
                    <th>{t("pedidos.statusHeader", "Estado")}</th>
                    <th>{t("pedidos.actions", "Acciones")}</th>
                  </tr>
                </thead>
                <tbody>
                  {getGroupedPedidos(pedidos)
                    .slice(0, 5)
                    .map((p) => (
                      <tr key={p.checkoutId || p.id}>
                        <td data-label={t("pedidos.id", "ID")}>
                          {p.checkoutId || `#${p.id}`}
                        </td>
                        <td data-label={t("pedidos.product", "Producto")}>
                          {p.items.map((item, idx) => (
                            <div key={item.id || idx}>
                              • {item.productoNombre || item.producto} (
                              {item.cantidad} kg)
                            </div>
                          ))}
                        </td>
                        <td data-label={t("pedidos.total", "Total")}>
                          {formatPrice(p.total)}
                        </td>
                        <td data-label={t("pedidos.statusHeader", "Estado")}>
                          <span className={badgeClass(p.estado)}>
                            {t(
                              "pedidos.status." + p.estado?.toLowerCase(),
                              p.estado,
                            )}
                          </span>
                        </td>
                        <td data-label={t("pedidos.actions", "Acciones")}>
                          {p.estado?.toLowerCase() === "pendiente" && (
                            <button
                              onClick={() => {
                                setCheckoutPedido(p);
                                setPagoModalOpen(true);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ marginRight: "6px" }}
                            >
                              Pagar
                            </button>
                          )}
                          <button
                            onClick={() => showSection("seguimiento")}
                            className="btn btn-secondary btn-sm"
                          >
                            {t("pedidos.track", "Rastrear")}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  );
}
