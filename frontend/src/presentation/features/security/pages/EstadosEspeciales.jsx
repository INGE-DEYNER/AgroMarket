import { useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";
import { useNavigate } from "react-router-dom";

const STATES=[
 ["403","Acceso denegado","No tienes permisos suficientes para acceder a este recurso.","Volver al inicio"],
 ["419","Sesión expirada","Tu sesión ha expirado por seguridad. Inicia sesión nuevamente.","Iniciar sesión"],
 ["423","Cuenta bloqueada","Tu cuenta está temporalmente bloqueada. Contacta al soporte si necesitas ayuda.","Contactar soporte"],
 ["451","Cuenta suspendida","El acceso a esta cuenta se encuentra restringido. Revisa la información enviada por soporte.","Ver soporte"],
 ["503","Mantenimiento","AgroMarket está temporalmente en mantenimiento. Intenta nuevamente más tarde.","Reintentar"],
 ["404","Recurso no encontrado","La página o recurso que buscas no existe o fue movido.","Ir al inicio"],
];
export default function EstadosEspeciales(){
 const navigate=useNavigate();
 const [selected,setSelected]=useState("403"); const item=STATES.find(x=>x[0]===selected);
 return <SecurityShell activeKey="estados">
  <div className="security-heading"><div><h1>Estados especiales</h1><p>Paneles de respuesta para estados de seguridad, sesión y disponibilidad.</p></div></div>
  <div className="state-selector">{STATES.map(s=><button className={selected===s[0]?"active":""} onClick={()=>setSelected(s[0])} key={s[0]}>{s[0]}</button>)}</div>
  <section className={`special-state state-${selected}`}><div className="state-code">{item[0]}</div><div><h2>{item[1]}</h2><p>{item[2]}</p><button type="button" onClick={()=>{
 if(selected==="419"){navigate("/login");return;}
 if(selected==="404"){navigate("/home");return;}
 if(selected==="423" || selected==="451"){navigate("/ayuda");return;}
 if(selected==="503"){window.location.reload();return;}
 navigate(-1);
}}>{item[3]}</button></div></section>
  <div className="status-mapping"><strong>Mapeo frontend</strong><span>403 → Acceso denegado</span><span>419 → Sesión expirada</span><span>423 → Cuenta bloqueada</span><span>451 → Cuenta suspendida</span><span>503 → Mantenimiento</span><span>404 → Recurso no encontrado</span></div>
 </SecurityShell>;
}
