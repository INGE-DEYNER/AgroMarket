import { useState } from "react";
import SpecialSystemShell from "@/presentation/features/special/components/SpecialSystemShell";
import { useTranslation } from "react-i18next";

const INITIAL=[{id:1,brand:"VISA",title:"Visa terminada en 4567",name:"Juan Pérez",date:"07/26",main:true},{id:2,brand:"MASTERCARD",title:"Mastercard terminada en 1234",name:"Juan Pérez",date:"08/27",main:false},{id:3,brand:"PSE",title:"PSE - Cuenta Bancolombia",name:"juanperez@email.com",date:"",main:false}];

export default function MetodosPagoGuardados(){
 const { t } = useTranslation();
 const [items,setItems]=useState(INITIAL); const [adding,setAdding]=useState(false);
 return <SpecialSystemShell activeKey="pagos-guardados">
  <div className="special-heading"><div><h1>Métodos de pago</h1><p>Administra los medios de pago guardados en tu cuenta.</p></div><button className="special-primary-action" onClick={()=>setAdding(true)}>+ Agregar método</button></div>
  <section className="payment-list">{items.map(item=><article className="payment-card" key={item.id}><div className="payment-brand">{item.brand}</div><div><h3>{item.title}</h3><span>{item.name}</span>{item.date&&<span>{item.date}</span>}</div>{item.main&&<span className="special-badge success">Principal</span>}<button className="payment-menu" onClick={()=>setItems(items.filter(x=>x.id!==item.id))}>⋮</button></article>)}</section>
  <div className="secure-note">⌾ <span>Tu información de pago está segura y encriptada.</span></div>
  {adding&&<div className="special-modal-backdrop"><div className="special-modal"><h2>Agregar método de pago</h2><input placeholder="Tipo de tarjeta o método" /><input placeholder="Últimos cuatro dígitos" /><input placeholder="Titular" /><div className="special-modal-actions"><button onClick={()=>setAdding(false)}>Cancelar</button><button className="special-primary-action" onClick={()=>setAdding(false)}>Guardar método</button></div></div></div>}
 </SpecialSystemShell>;
}
