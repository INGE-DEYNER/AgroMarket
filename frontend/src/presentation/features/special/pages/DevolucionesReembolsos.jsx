import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useToast } from "@/app/hooks/useToast";
import { useTranslation } from "react-i18next";

const RETURNS=[{order:"#AM-000112",date:"20 May 2024",status:"En proceso",product:"Cacao en grano 500g",qty:1,reason:"Producto dañado",detail:"En revisión"},{order:"#AM-000098",date:"10 May 2024",status:"Completada",product:"Miel de abejas 500ml",qty:2,reason:"No era lo que esperaba",detail:"$32.000 COP"}];

export default function DevolucionesReembolsos(){
 const { t } = useTranslation();
 const toast=useToast();
 const [tab,setTab]=useState(t("special.allReturns", "Todas (2)")); const [items,setItems]=useState(RETURNS);
 const visible=tab==="Todas (2)"?items:items.filter(x=>tab.startsWith("En proceso")?x.status==="En proceso":tab.startsWith("Completadas")?x.status==="Completada":false);
 return <SpecialSystemShell activeKey="devoluciones">
  <div className="special-heading"><div><h1>Mis devoluciones</h1><p>Consulta el estado de tus solicitudes de devolución y reembolso.</p></div></div>
  <div className="special-tabs">{["Todas (2)","En proceso (1)","Completadas (1)","Rechazadas (0)"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
  <section className="return-list">{visible.map(item=><article className="return-card" key={item.order}><div className="return-top"><div><strong>Pedido {item.order}</strong><span>Solicitado el {item.date}</span></div><span className={`special-badge ${item.status==="Completada"?"success":"warning"}`}>{item.status}</span></div><div className="return-body"><div><strong>{item.product}</strong><span>Cantidad: {item.qty}</span><span>Motivo: {item.reason}</span></div><div><small>{item.status==="Completada"?"Reembolso":"Estado"}</small><strong>{item.detail}</strong><button type="button" onClick={()=>toast.info(`Detalle de ${item.order}: ${item.detail}`,2500)}>Ver detalles</button></div></div></article>)}</section>
  <button className="special-primary-action" onClick={()=>setItems([...items,{order:"#AM-NUEVO",date:"Hoy",status:"En proceso",product:"Nueva solicitud",qty:1,reason:"Pendiente de información",detail:"En revisión"}])}>Solicitar nueva devolución</button>
 </SpecialSystemShell>;
}
