import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useNavigate } from "react-router-dom";

const GROUPS = {
  Hoy: [["Aguacate Hass","1kg","$8.500 COP","🥑"],["Cacao en grano","500g","$14.900 COP","🫘"],["Café Excelso","500g","$18.500 COP","☕"],["Miel de abejas","500ml","$16.000 COP","🍯"]],
  Ayer: [["Plátano Dominico","1kg","$2.700 COP","🍌"],["Yuca fresca","1kg","$3.100 COP","🥔"],["Tomate Chonto","1kg","$4.200 COP","🍅"],["Pimentón","1kg","$5.800 COP","🫑"]],
};

export default function HistorialNavegacion() {
  const navigate = useNavigate();
  const [groups,setGroups]=useState(GROUPS);
  return <SpecialSystemShell activeKey="historial">
    <div className="special-heading"><div><h1>Historial de navegación</h1><p>Revisa los productos que has consultado recientemente.</p></div><button className="special-link-button" onClick={()=>setGroups({})}>Limpiar historial</button></div>
    {Object.entries(groups).map(([day,items])=><section className="history-section" key={day}><h2>{day}</h2><div className="history-grid">{items.map(p=><article className="history-card" key={p[0]}><div>{p[3]}</div><strong>{p[0]}</strong><span>{p[1]}</span><b>{p[2]}</b></article>)}</div></section>)}
    {!Object.keys(groups).length && <div className="special-empty">Tu historial está vacío.</div>}
    <button type="button" className="special-secondary-action" onClick={()=>navigate("/catalogo")}>Ver historial completo</button>
  </SpecialSystemShell>;
}
