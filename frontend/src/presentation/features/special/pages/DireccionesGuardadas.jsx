import { useEffect, useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useTranslation } from "react-i18next";
import api from "@/infrastructure/http/api";

const empty = { title: "", address: "", city: "", phone: "", main: false };
export default function DireccionesGuardadas() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = async () => {
    try {
      const data = await api.get("/direcciones");
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const save = async () => {
    try {
      if (editing.id) await api.put(`/direcciones/${editing.id}`, editing);
      else await api.post("/direcciones", editing);
      setEditing(null);
      await load();
    } catch (error) {
      window.alert(error.message);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("¿Eliminar dirección?")) return;
    try {
      await api.delete(`/direcciones/${id}`);
      await load();
    } catch (error) {
      window.alert(error.message);
    }
  };
  return (
    <SpecialSystemShell activeKey="direcciones">
      <div className="special-heading">
        <div>
          <h1>{t("special.addresses", "Mis direcciones")}</h1>
          <p>Direcciones almacenadas en tu cuenta.</p>
        </div>
        <button
          className="special-primary-action"
          onClick={() => setEditing({ ...empty })}
        >
          + Agregar dirección
        </button>
      </div>
      <section className="special-address-list">
        {items.map((item) => (
          <article className="special-address-card" key={item.id}>
            <div className="special-address-icon">⌖</div>
            <div className="special-address-data">
              <div className="special-row-title">
                <h3>{item.title}</h3>
                {item.main && (
                  <span className="special-badge success">Principal</span>
                )}
              </div>
              <p>{item.address}</p>
              <small>{item.city}</small>
              <small>Tel: {item.phone}</small>
            </div>
            <div className="special-card-actions">
              <button onClick={() => setEditing(item)}>Editar</button>
              <button onClick={() => remove(item.id)}>Eliminar</button>
            </div>
          </article>
        ))}
      </section>
      {editing && (
        <div className="special-modal-backdrop">
          <div className="special-modal">
            <h2>{editing.id ? "Editar dirección" : "Agregar dirección"}</h2>
            {["title", "address", "city", "phone"].map((field) => (
              <input
                key={field}
                value={editing[field]}
                onChange={(e) =>
                  setEditing({ ...editing, [field]: e.target.value })
                }
                placeholder={field}
              />
            ))}
            <label>
              <input
                type="checkbox"
                checked={editing.main}
                onChange={(e) =>
                  setEditing({ ...editing, main: e.target.checked })
                }
              />{" "}
              Principal
            </label>
            <div className="special-modal-actions">
              <button onClick={() => setEditing(null)}>Cancelar</button>
              <button className="special-primary-action" onClick={save}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </SpecialSystemShell>
  );
}
