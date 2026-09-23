import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import Icon from "@/presentation/shared/components/Icon";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";
import {
  TIPO_NOTIFICACION,
  tiempoRelativo,
} from "@/infrastructure/normalizar";

/*
 * CENTRO DE NOTIFICACIONES 100% REAL:
 * - GET  /notifications/user/{userId}  -> lista real desde MongoDB
 * - PATCH /notifications/{id}/read     -> marca notificaciones como leídas
 * - Sondeo cada 20 s + botón "Marcar todas como leídas".
 * Las notificaciones se generan cuando el productor cambia el estado de un
 * pedido y cuando llega un pedido nuevo (ver OrderUseCase en el backend).
 */
export default function Notificaciones() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [filter, setFilter] = useState("Todas");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get(`/notifications/user/${user.id}`);
      const list = Array.isArray(data) ? data : data?.content || [];
      setItems(list);
      setError("");
    } catch (err) {
      setError(
        err?.message ||
          t(
            "notificationsPage.error",
            "No se pudieron cargar las notificaciones.",
          ),
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 20000);
    return () => clearInterval(interval);
  }, [load]);

  const marcarTodas = async () => {
    const noLeidas = items.filter((n) => !n.read);
    if (noLeidas.length === 0) return;
    try {
      await Promise.all(
        noLeidas.map((n) => api.patch(`/notifications/${n.id}/read`)),
      );
      void load();
    } catch (err) {
      setError(
        err?.message ||
          "No se pudieron marcar las notificaciones como leídas.",
      );
    }
  };

  const unread = items.filter((n) => !n.read).length;

  const visible = useMemo(() => {
    if (filter === "Todas") return items;
    if (filter.startsWith("No leídas")) return items.filter((n) => !n.read);
    return items.filter(
      (n) => (TIPO_NOTIFICACION[n.type]?.label || "Sistema") === filter,
    );
  }, [filter, items]);

  const iconoDe = (n) => TIPO_NOTIFICACION[n.type]?.icon || "bell";

  return <SpecialSystemShell activeKey="notificaciones">
    <div className="special-heading">
      <div>
        <h1>{t("special.notifications", "Notificaciones")}</h1>
        <p>{t("special.notificationsSub", "Mantente al día con pedidos, pagos, mensajes y promociones.")}</p>
      </div>
      <button className="special-link-button" onClick={marcarTodas}>
        {t("notificationsPage.markAllRead", "Marcar todas como leídas")}
        {unread > 0 ? ` (${unread})` : ""}
      </button>
    </div>
    <div className="special-tabs">
      {[
        "Todas",
        `No leídas (${unread})`,
        "Pedidos",
        "Pagos",
        "Mensajes",
        "Inventario",
      ].map((tab) => (
        <button
          key={tab}
          className={filter === tab ? "active" : ""}
          onClick={() => setFilter(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
    {!user ? (
      <section className="special-list">
        <article className="special-notification">
          <div className="special-notification-icon"><Icon name="lock" size={22} /></div>
          <div className="special-notification-content">
            <h3>{t("notificationsPage.loginRequired", "Inicia sesión para ver tus notificaciones.")}</h3>
            <p><Link to="/login">{t("nav.login", "Iniciar sesión")}</Link></p>
          </div>
        </article>
      </section>
    ) : loading ? (
      <section className="special-list">
        <article className="special-notification">
          <div className="special-notification-icon"><Icon name="clock" size={22} /></div>
          <div className="special-notification-content">
            <h3>{t("notificationsPage.loading", "Cargando notificaciones...")}</h3>
          </div>
        </article>
      </section>
    ) : error ? (
      <section className="special-list">
        <article className="special-notification">
          <div className="special-notification-icon"><Icon name="alert" size={22} /></div>
          <div className="special-notification-content">
            <h3>{error}</h3>
            <p>
              <button
                type="button"
                className="special-link-button"
                onClick={() => void load()}
              >
                {t("special.viewAllNotifications", "Ver todas las notificaciones")}
              </button>
            </p>
          </div>
        </article>
      </section>
    ) : visible.length === 0 ? (
      <section className="special-list">
        <article className="special-notification">
          <div className="special-notification-icon"><Icon name="bell" size={22} /></div>
          <div className="special-notification-content">
            <h3>{t("notificationsPage.empty", "No tienes notificaciones todavía.")}</h3>
          </div>
        </article>
      </section>
    ) : (
      <section className="special-list">
        {visible.map((n) => (
          <article className="special-notification" key={n.id}>
            <div className="special-notification-icon"><Icon name={iconoDe(n)} size={22} /></div>
            <div className="special-notification-content">
              <h3>
                {(TIPO_NOTIFICACION[n.type]?.label || "Sistema") + " · "}
                {n.content}
                {!n.read && <span className="special-dot" />}
              </h3>
              <small>{tiempoRelativo(n.createdAt)}</small>
            </div>
          </article>
        ))}
      </section>
    )}
    <button
      type="button"
      className="special-secondary-action"
      onClick={() => {
        setFilter("Todas");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {t("special.viewAllNotifications", "Ver todas las notificaciones")}
    </button>
  </SpecialSystemShell>;
}
