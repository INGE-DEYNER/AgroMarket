import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useToast } from "@/app/hooks/useToast";
import api from "@/infrastructure/http/api";

function normalizeOrders(data) {
  const orders = Array.isArray(data) ? data : data?.content || [];
  return orders.map((order) => ({
    id: order.id,
    order: order.id ? `#AM-${String(order.id).padStart(6, "0")}` : "Pedido",
    date: order.createdAt || order.fechaCreacion || null,
    status: order.state || order.estado || "PENDING",
    total: order.total || order.totalAmount || 0,
  }));
}

export default function DevolucionesReembolsos() {
  const toast = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("TODOS");
  const [returns, setReturns] = useState([]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setOrders(normalizeOrders(await api.get("/pedidos/mis-pedidos")));
      const savedReturns = await api.get("/devoluciones");
      setReturns(Array.isArray(savedReturns) ? savedReturns : []);
    } catch (error) {
      toast.error(error.message || "No se pudieron cargar tus pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const visibleOrders = useMemo(() => {
    if (tab === "TODOS") return orders;
    return orders.filter((item) => item.status === tab);
  }, [orders, tab]);

  const cancelOrder = async (orderId) => {
    try {
      await api.patch(`/pedidos/${orderId}/cancel`);
      toast.success(
        "Pedido cancelado. El reembolso depende del estado del pago.",
      );
      await loadOrders();
    } catch (error) {
      toast.error(error.message || "Este pedido no puede cancelarse.");
    }
  };

  const requestReturn = async (orderId) => {
    const reason = window.prompt("Indica el motivo de la devolución:");
    if (!reason?.trim()) return;
    try {
      await api.post("/devoluciones", { orderId, reason: reason.trim() });
      toast.success("Solicitud de devolución enviada.");
      await loadOrders();
    } catch (error) {
      toast.error(error.message || "No se pudo crear la solicitud.");
    }
  };

  return (
    <SpecialSystemShell activeKey="devoluciones">
      <div className="special-heading">
        <div>
          <h1>Pedidos y solicitudes</h1>
          <p>
            Consulta pedidos reales y cancela únicamente los que aún están
            pendientes.
          </p>
        </div>
        <button
          className="special-primary-action"
          onClick={() => navigate("/pedidos")}
        >
          Ver mis pedidos
        </button>
      </div>
      <div className="special-tabs">
        {["TODOS", "PENDING", "CANCELLED", "DELIVERED"].map((value) => (
          <button
            className={tab === value ? "active" : ""}
            onClick={() => setTab(value)}
            key={value}
          >
            {value === "TODOS" ? "Todos" : value}
          </button>
        ))}
      </div>
      <section className="return-list">
        {loading ? <p>Cargando pedidos...</p> : null}
        {!loading && visibleOrders.length === 0 ? (
          <p>No hay pedidos para mostrar.</p>
        ) : null}
        {visibleOrders.map((item) => (
          <article className="return-card" key={item.id}>
            <div className="return-top">
              <div>
                <strong>Pedido {item.order}</strong>
                <span>
                  {item.date
                    ? new Date(item.date).toLocaleDateString("es-CO")
                    : "Sin fecha"}
                </span>
              </div>
              <span className="special-badge warning">{item.status}</span>
            </div>
            <div className="return-body">
              <div>
                <strong>Total</strong>
                <span>{item.total}</span>
              </div>
              {item.status === "PENDING" ? (
                <button type="button" onClick={() => cancelOrder(item.id)}>
                  Cancelar pedido
                </button>
              ) : item.status === "DELIVERED" ? (
                <button type="button" onClick={() => requestReturn(item.id)}>
                  Solicitar devolución
                </button>
              ) : (
                <span>
                  La devolución requiere un flujo de reembolso autorizado.
                </span>
              )}
            </div>
          </article>
        ))}
      </section>
      {returns.length ? (
        <section className="return-list">
          <h2>Solicitudes enviadas</h2>
          {returns.map((item) => (
            <article className="return-card" key={item.id}>
              <strong>Pedido #{item.orderId}</strong>
              <span>
                {item.status}: {item.reason}
              </span>
            </article>
          ))}
        </section>
      ) : null}
    </SpecialSystemShell>
  );
}
