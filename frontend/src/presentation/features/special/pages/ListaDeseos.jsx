import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useToast } from "@/app/hooks/useToast";
import api from "@/infrastructure/http/api";
import Icon from "@/presentation/shared/components/Icon";

export default function ListaDeseos() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      setItems(await api.get("/lista-deseos"));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const remove = async (productId) => {
    try {
      await api.delete(`/lista-deseos/${productId}`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <SpecialSystemShell activeKey="deseos">
      <div className="special-heading">
        <div>
          <h1>Mi lista de deseos ({items.length})</h1>
          <p>Productos guardados en tu cuenta.</p>
        </div>
        <button
          type="button"
          className="special-secondary-action"
          onClick={() => navigate("/catalogo")}
        >
          Ver catálogo
        </button>
      </div>
      {loading ? <p>Cargando lista...</p> : null}
      {!loading && !items.length ? <p>No tienes productos guardados.</p> : null}
      <section className="wish-grid">
        {items.map((item) => (
          <article className="wish-card" key={item.id}>
            <div className="wish-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                "Producto"
              )}
            </div>
            <button
              className="wish-remove"
              onClick={() => remove(item.productId)}
            >
              <Icon name="heart" size={24} />
            </button>
            <h3>{item.name}</h3>
            <strong>{item.price} COP</strong>
          </article>
        ))}
      </section>
    </SpecialSystemShell>
  );
}
