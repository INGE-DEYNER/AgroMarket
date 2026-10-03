import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const COUPONS = [
  { code: "BIENVENIDO10", value: "10% DTO.", text: "10% de descuento en tu primera compra", min: "$50.000 COP", until: "31 May 2024", tone: "green" },
  { code: "FRUTAS15", value: "$15.000 DTO.", text: "$15.000 COP de descuento", min: "$100.000 COP", until: "15 Jun 2024", tone: "orange" },
  { code: "ENVIOGRATIS", value: "ENVÍO GRATIS", text: "Envío gratis en compras superiores a $80.000 COP", min: "$80.000 COP", until: "30 Jun 2024", tone: "green" },
];

export default function CuponesPromociones() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(t("special.availableCoupons", "Disponibles (3)"));
  return <SpecialSystemShell activeKey="cupones">
    <div className="special-heading"><div><h1>{t("special.coupons", "Cupones y promociones")}</h1><p>{t("special.couponsSub", "Aprovecha descuentos exclusivos en tus compras.")}</p></div></div>
    <div className="special-tabs">{[t("special.availableCoupons", "Disponibles (3)"), t("special.usedCoupons", "Usados"), t("special.expiredCoupos", "Vencidos")].map((x) => <button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
    {tab === t("special.availableCoupons", "Disponibles (3)") ? <section className="coupon-list">{COUPONS.map(c => <article className={`coupon-card ${c.tone}`} key={c.code}><div className="coupon-value">{c.value}</div><div className="coupon-info"><strong>{c.code}</strong><p>{c.text}</p><small>{t("special.minPurchase", "Mínimo de compra")}: {c.min}</small></div><div className="coupon-valid"><span>{t("special.validUntil", "Válido hasta")}</span><strong>{c.until}</strong><button type="button" onClick={()=>window.alert(`Cupón ${c.code}: ${c.text}`)}>{t("special.viewDetails", "Ver detalles")}</button></div></article>)}</section> : <div className="special-empty">{t("special.noCoupons", "No hay cupones para la categoría seleccionada.")}</div>}
    <button type="button" className="special-secondary-action" onClick={()=>navigate("/terminos")}>{t("special.viewCouponTerms", "Ver términos y condiciones de cupones")}</button>
  </SpecialSystemShell>;
}
