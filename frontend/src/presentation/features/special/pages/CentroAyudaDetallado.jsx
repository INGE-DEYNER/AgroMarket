import { useMemo, useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";

const CATS=["Pedidos y compras","Envíos y entregas","Pagos y facturación","Devoluciones y reembolsos","Productos y calidad","Cuenta y seguridad","Productores y vendedores","Cupones y promociones"];
const ARTICLES=[["¿Cómo rastrear mi pedido?","Conoce cómo hacer seguimiento a tu pedido en tiempo real."],["¿Cuánto tarda en llegar mi pedido?","Tiempos de entrega según tu ubicación."],["¿Qué métodos de pago aceptan?","Conoce todos los métodos de pago disponibles."],["¿Cómo realizar una devolución?","Paso a paso para solicitar una devolución o reembolso."]];

export default function CentroAyudaDetallado() {
 const [query,setQuery]=useState(""); const [cat,setCat]=useState(CATS[0]);
 const filtered=useMemo(()=>ARTICLES.filter(a=>`${a[0]} ${a[1]}`.toLowerCase().includes(query.toLowerCase())),[query]);
 return <SpecialSystemShell activeKey="ayuda-detallada">
  <div className="special-heading"><div><h1>Centro de ayuda</h1><p>Encuentra respuestas y guías para usar AgroMarket.</p></div></div>
  <div className="help-search"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar en ayuda..." aria-label="Buscar en ayuda" /></div>
  <div className="help-layout"><aside className="help-categories"><h2>Categorías</h2>{CATS.map(c=><button className={cat===c?"active":""} onClick={()=>setCat(c)} key={c}>{c}</button>)}</aside><section className="help-articles"><h2>Artículos populares</h2>{filtered.map(a=><article key={a[0]}><h3>{a[0]}</h3><p>{a[1]}</p><span>{cat}</span></article>)}{!filtered.length&&<div className="special-empty">No encontramos artículos para tu búsqueda.</div>}</section></div>
  <button type="button" className="special-primary-action" onClick={()=>setQuery("")}>Ver todos los artículos de ayuda</button>
 </SpecialSystemShell>;
}
