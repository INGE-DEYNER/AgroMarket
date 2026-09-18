import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import api from "@/infrastructure/http/api";

export default function MetodosPagoGuardados() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    api.get("/tarjetas").then((data) => {
      if (active) setItems(data);
    }).catch((failure) => {
      if (active) setError(failure.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [reload]);
  const refresh = () => {
    setError("");
    setLoading(true);
    setReload((value) => value + 1);
  };
  const mutate = async (id, action) => {
    if (busy) return;
    if (action === "remove" && !window.confirm("¿Eliminar esta tarjeta?")) return;
    setBusy(true);
    setError("");
    try {
      if (action === "remove") await api.delete(`/tarjetas/${id}`);
      else await api.patch(`/tarjetas/${id}/default`);
      refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <SpecialSystemShell activeKey="pagos-guardados">
      <div className="special-heading">
        <div>
          <h1>Métodos de pago</h1>
          <p>Administra tus métodos tokenizados desde tu cuenta.</p>
        </div>
        <button
          className="special-primary-action"
          onClick={() => navigate("/perfil?tab=tarjetas")}
        >
          Administrar métodos
        </button>
      </div>
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" disabled={loading || busy} onClick={refresh}>Reintentar</button>
        </div>
      )}
      {loading ? <p role="status">Cargando métodos...</p> : null}
      <section className="payment-list" aria-busy={loading || busy}>
        {!loading && !error && !items.length ? (
          <article className="payment-card">
            <div>
              <h3>No hay tarjetas tokenizadas</h3>
              <span>
                Agrega una tarjeta desde el checkout seguro de Mercado Pago.
              </span>
            </div>
          </article>
        ) : null}
        {items.map((item) => (
          <article className="payment-card" key={item.id}>
            <div className="payment-brand">{item.cardType}</div>
            <div>
              <h3>Tarjeta terminada en {item.lastFourDigits}</h3>
              {item.isDefault && (
                <span className="special-badge success">Principal</span>
              )}
            </div>
            {!item.isDefault && (
              <button type="button" disabled={busy || loading} onClick={() => mutate(item.id, "default")}>
                Marcar principal
              </button>
            )}
            <button type="button" className="payment-menu" disabled={busy || loading} onClick={() => mutate(item.id, "remove")}>
              Eliminar
            </button>
          </article>
        ))}
      </section>
      <div className="secure-note">
        ⌾{" "}
        <span>
          Las tarjetas deben ser tokenizadas por la pasarela de pago; no se
          guardan números completos.
        </span>
      </div>
    </SpecialSystemShell>
  );
}
