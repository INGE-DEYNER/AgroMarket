import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GROUPS = {
  Hoy: [["Aguacate Hass","1kg","$8.500 COP","🥑"],["Cacao en grano","500g","$14.900 COP","🫘"],["Café Excelso","500g","$18.500 COP","☕"],["Miel de abejas","500ml","$16.000 COP","🍯"]],
  Ayer: [["Plátano Dominico","1kg","$2.700 COP","🍌"],["Yuca fresca","1kg","$3.100 COP","🥔"],["Tomate Chonto","1kg","$4.200 COP","🍅"],["Pimentón","1kg","$5.800 COP","🫑"]],
};

export default function HistorialNavegacion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [groups,setGroups]=useState(GROUPS);
  return <SpecialSystemShell activeKey="historial">
    <div className="special-heading"><div><h1>{t("special.navigationHistory", "Historial de navegación")}</h1><p>{t("special.navigationHistorySub", "Revisa los productos que has visitado recientemente.")}</p></div><button className="special-link-button" onClick={()=>setGroups({})}>{t("special.clearHistory", "Limpiar historial")}</button></div>
    {Object.entries(groups).map(([day,items])=><section className="history-section" key={day}><h2>{day}</h2><div className="history-grid">{items.map(p=><article className="history-card" key={p[0]}><div aria-hidden="true"><Icon name="package" size={26} /></div><strong>{p[0]}</strong><span>{p[1]}</span><b>{p[2]}</b></article>)}</div></section>)}
    {!Object.keys(groups).length && <div className="special-empty">{t("special.emptyHistory", "Tu historial está vacío.")}</div>}
    <button type="button" className="special-secondary-action" onClick={()=>navigate("/catalogo")}>{t("special.viewFullHistory", "Ver historial completo")}</button>
  </SpecialSystemShell>;
}
