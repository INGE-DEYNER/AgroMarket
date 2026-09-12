import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useTranslation } from "react-i18next";

const INITIAL = [
  { id: 1, title: "Casa", address: "Calle 10 # 20 - 30, Apartadó", city: "Urabá, Antioquia, Colombia", phone: "+57 300 123 4567", main: true },
  { id: 2, title: "Trabajo", address: "Cra 43 # 25 - 10, Oficina 301", city: "Apartadó, Antioquia, Colombia", phone: "+57 300 987 6543", main: false },
  { id: 3, title: "Finca", address: "Vereda El Reposo, Finca Los Mangos", city: "Carepa, Antioquia, Colombia", phone: "+57 300 555 1234", main: false },
];

export default function DireccionesGuardadas() {
  const { t } = useTranslation();
  const [items, setItems] = useState(INITIAL);
  const [editing, setEditing] = useState(null);
  const remove = (id) => setItems(items.filter((item) => item.id !== id));
  return <SpecialSystemShell activeKey="direcciones">
    <div className="special-heading"><div><h1>{t("special.addresses", "Mis direcciones")}</h1><p>{t("special.addressesSub", "Administra tus direcciones de entrega.")}</p></div><button className="special-primary-action" onClick={() => setEditing({ title: "", address: "", city: "", phone: "", main: false })}>{t("special.addAddress", "+ Agregar dirección")}</button></div>
    <section className="special-address-list">
      {items.map((item) => <article className="special-address-card" key={item.id}>
        <div className="special-address-icon">⌖</div><div className="special-address-data"><div className="special-row-title"><h3>{item.title}</h3>{item.main && <span className="special-badge success">{t("special.mainAddress", "Principal")}</span>}</div><p>{item.address}</p><small>{item.city}</small><small>{t("special.phone", "Tel")}: {item.phone}</small></div>
        <div className="special-card-actions"><button onClick={() => setEditing(item)}>{t("special.edit", "Editar")}</button><button onClick={() => remove(item.id)}>{t("special.delete", "Eliminar")}</button></div>
      </article>)}
    </section>
    {editing && <div className="special-modal-backdrop"><div className="special-modal"><h2>{editing.id ? t("special.editAddress", "Editar dirección") : t("special.addNewAddress", "Agregar dirección")}</h2><input value={editing.title} onChange={(e) => setEditing({...editing,title:e.target.value})} placeholder={t("special.addressName", "Nombre de la dirección")} /><input value={editing.address} onChange={(e) => setEditing({...editing,address:e.target.value})} placeholder={t("special.address", "Dirección")} /><input value={editing.city} onChange={(e) => setEditing({...editing,city:e.target.value})} placeholder={t("special.city", "Ciudad / departamento")} /><input value={editing.phone} onChange={(e) => setEditing({...editing,phone:e.target.value})} placeholder={t("special.phone", "Teléfono")} /><label><input type="checkbox" checked={editing.main} onChange={(e) => setEditing({...editing,main:e.target.checked})} /> {t("special.mainAddressLabel", "Dirección principal")}</label><div className="special-modal-actions"><button onClick={() => setEditing(null)}>{t("special.cancel", "Cancelar")}</button><button className="special-primary-action" onClick={() => { setItems(editing.id ? items.map(x => x.id === editing.id ? editing : x) : [...items, {...editing,id:Date.now()}]); setEditing(null); }}>{t("special.save", "Guardar")}</button></div></div></div>}
  </SpecialSystemShell>;
}
