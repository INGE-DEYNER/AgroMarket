import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/app/hooks/useToast";
import { useTranslation } from "react-i18next";

const INITIAL = [
  ["Aguacate Hass","1kg","$8.500 COP","$3.000 COP","🥑"],["Banano Cavendish","1kg","$2.900 COP","$2.500 COP","🍌"],["Cacao en grano","500g","$14.900 COP","$3.000 COP","🫘"],["Piña MD2","1und","$6.200 COP","$3.000 COP","🍍"],["Plátano Dominico","1kg","$2.700 COP","$2.500 COP","🍌"],
];

export default function ListaDeseos() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [items,setItems]=useState(INITIAL);
  return <SpecialSystemShell activeKey="deseos">
    <div className="special-heading"><div><h1>{t("special.wishlistTitle", "Mi lista de deseos ({{count}})", { count: items.length })}</h1><p>{t("special.wishlistSub", "Guarda productos para comprarlos después.")}</p></div><button type="button" className="special-secondary-action" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);toast.success(t("special.linkCopied", "Enlace de la lista copiado."),2000);}catch{toast.info(t("special.copyManually", "Copia manualmente la URL de esta página."),2500);}}}>{t("special.shareList", "Compartir lista")}</button></div>
    <section className="wish-grid">{items.map((p,i)=><article className="wish-card" key={`${p[0]}-${i}`}><div className="wish-image">{p[4]}</div><button className="wish-remove" onClick={()=>setItems(items.filter((_,idx)=>idx!==i))}>♡</button><h3>{p[0]}</h3><span>{p[1]}</span><strong>{p[2]}</strong><small>{t("special.shipping", "Envío")}: {p[3]}</small></article>)}</section>
    <button type="button" className="special-secondary-action" onClick={()=>navigate("/catalogo")}>{t("special.viewAllProducts", "Ver todos los productos")}</button>
  </SpecialSystemShell>;
}
