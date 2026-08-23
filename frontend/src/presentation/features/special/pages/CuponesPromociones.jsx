import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useNavigate } from "react-router-dom";

const COUPONS = [
  { code: "BIENVENIDO10", value: "10% DTO.", text: "10% de descuento en tu primera compra", min: "$50.000 COP", until: "31 May 2024", tone: "green" },
  { code: "FRUTAS15", value: "$15.000 DTO.", text: "$15.000 COP de descuento", min: "$100.000 COP", until: "15 Jun 2024", tone: "orange" },
  { code: "ENVIOGRATIS", value: "ENVÍO GRATIS", text: "Envío gratis en compras superiores a $80.000 COP", min: "$80.000 COP", until: "30 Jun 2024", tone: "green" },
];

export default function CuponesPromociones() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Disponibles (3)");
  return <SpecialSystemShell activeKey="cupones">
    <div className="special-heading"><div><h1>Mis cupones</h1><p>Descuentos y beneficios disponibles para tus compras.</p></div></div>
    <div className="special-tabs">{["Disponibles (3)", "Usados (5)", "Vencidos (2)"].map((x) => <button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
    {tab === "Disponibles (3)" ? <section className="coupon-list">{COUPONS.map(c => <article className={`coupon-card ${c.tone}`} key={c.code}><div className="coupon-value">{c.value}</div><div className="coupon-info"><strong>{c.code}</strong><p>{c.text}</p><small>Mínimo de compra: {c.min}</small></div><div className="coupon-valid"><span>Válido hasta</span><strong>{c.until}</strong><button type="button" onClick={()=>window.alert(`Cupón ${c.code}: ${c.text}`)}>Ver detalles</button></div></article>)}</section> : <div className="special-empty">No hay cupones para la categoría seleccionada.</div>}
    <button type="button" className="special-secondary-action" onClick={()=>navigate("/terminos")}>Ver términos y condiciones de cupones</button>
  </SpecialSystemShell>;
}
