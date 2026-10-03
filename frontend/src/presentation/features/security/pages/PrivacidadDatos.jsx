import { useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";
import { useToast } from "@/app/hooks/useToast";

export default function PrivacidadDatos(){
 const toast=useToast();
 const [prefs,setPrefs]=useState({marketing:false,analytics:true,essential:true});
 return <SecurityShell activeKey="privacidad"><div className="security-heading"><div><h1>Privacidad y protección de datos</h1><p>Controla el uso de tus datos y consulta las opciones de privacidad de AgroMarket.</p></div></div><section className="security-card"><h2>Preferencias de privacidad</h2>{[["essential","Datos esenciales para operar la cuenta","Necesarios para autenticación, pedidos y seguridad."],["analytics","Analítica de uso","Ayuda a mejorar la experiencia y detectar problemas."],["marketing","Comunicaciones comerciales","Permite recibir promociones y novedades."]].map(([k,t,d])=><label className="privacy-row" key={k}><div><strong>{t}</strong><small>{d}</small></div><input type="checkbox" checked={prefs[k]} disabled={k==="essential"} onChange={e=>setPrefs({...prefs,[k]:e.target.checked})}/></label>)}<div className="privacy-actions">
<button type="button" onClick={()=>{
 const data={preferencias:prefs,exportadoEn:new Date().toISOString()};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob); const a=document.createElement("a");
 a.href=url; a.download="agromarket-datos-personales.json"; a.click(); URL.revokeObjectURL(url);
 toast.success("Tus datos fueron preparados para descarga.",2500);
}}>Descargar mis datos</button>
<button type="button" onClick={()=>{
 if(window.confirm("¿Confirmas la solicitud de eliminación de cuenta?")) toast.warning("Solicitud registrada para revisión.",3000);
}}>Solicitar eliminación de cuenta</button>
</div></section><section className="security-card legal-copy"><h2>Protección</h2><p>La información sensible debe transmitirse y almacenarse aplicando los controles de seguridad definidos por la plataforma. Consulta la Política de privacidad y los términos antes de modificar tus preferencias.</p></section></SecurityShell>;
}
