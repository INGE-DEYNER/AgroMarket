import { useMemo, useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useTranslation } from "react-i18next";

const DATA = [
  { type: "Pedidos", title: "Tu pedido #AM-000123 está en camino", text: "Tu pedido de Aguacate Hass será entregado el 28 May 2024.", time: "Hace 2 horas", unread: true, icon: "🚚" },
  { type: "Sistema", title: "Nuevo mensaje de Finca El Paraíso", text: "Tienes un nuevo mensaje sobre tu pedido #AM-000122.", time: "Hace 5 horas", unread: true, icon: "💬" },
  { type: "Pedidos", title: "Pago confirmado", text: "Hemos confirmado tu pago por $29.700 COP.", time: "Hace 1 día", unread: false, icon: "✓" },
  { type: "Promociones", title: "¡Oferta especial para ti!", text: "Aprovecha 10% de descuento en frutas tropicales.", time: "Hace 2 días", unread: false, icon: "🏷" },
];

export default function Notificaciones() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("Todas");
  const [items, setItems] = useState(DATA);
  const visible = useMemo(() => filter === "Todas" ? items : items.filter((item) => filter === "No leídas (5)" ? item.unread : item.type === filter), [filter, items]);

  return <SpecialSystemShell activeKey="notificaciones">
    <div className="special-heading"><div><h1>{t("special.notifications", "Notificaciones")}</h1><p>{t("special.notificationsSub", "Mantente al día con pedidos, pagos, mensajes y promociones.")}</p></div><button className="special-link-button" onClick={() => setItems(items.map((item) => ({ ...item, unread: false })))}>{t("special.markAllRead", "Marcar todas como leídas")}</button></div>
    <div className="special-tabs">
      {["Todas", "No leídas (5)", "Pedidos", "Envíos", "Promociones", "Sistema"].map((tab) => <button key={tab} className={filter === tab ? "active" : ""} onClick={() => setFilter(tab)}>{tab}</button>)}
    </div>
    <section className="special-list">
      {visible.map((item) => <article className="special-notification" key={item.title}>
        <div className="special-notification-icon">{item.icon}</div><div className="special-notification-content"><h3>{item.title} {item.unread && <span className="special-dot" />}</h3><p>{item.text}</p><small>{item.time}</small></div>
      </article>)}
    </section>
    <button type="button" className="special-secondary-action" onClick={()=>{setFilter("Todas");window.scrollTo({top:0,behavior:"smooth"});}}>{t("special.viewAllNotifications", "Ver todas las notificaciones")}</button>
  </SpecialSystemShell>;
}
