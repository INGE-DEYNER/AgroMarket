import { useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/app/hooks/useToast";

const EVENTS=[["Hoy · 14:32","Inicio de sesión exitoso","Chrome · Windows · Colombia","✓"],["Hoy · 13:51","Contraseña actualizada","Chrome · Windows · Colombia","✓"],["Ayer · 20:12","Sesión cerrada","Android · Colombia","✓"]];
export default function SeguridadCuenta(){
 const navigate=useNavigate(); const toast=useToast();
 const [password,setPassword]=useState(false);
 return <SecurityShell activeKey="seguridad">
  <div className="security-heading"><div><h1>Seguridad de cuenta</h1><p>Administra credenciales, sesiones y actividad reciente.</p></div></div>
  <div className="security-grid-two"><section className="security-card"><h2>Contraseña</h2><p>Se recomienda usar una contraseña única y robusta.</p><button onClick={()=>setPassword(true)}>Cambiar contraseña</button></section><section className="security-card"><h2>Sesiones activas</h2><p>1 sesión activa en este dispositivo.</p><button type="button" onClick={()=>toast.success("Las demás sesiones fueron marcadas para cierre.",2500)}>Cerrar otras sesiones</button></section></div>
  <section className="security-card"><div className="card-heading"><h2>Actividad reciente</h2><button type="button" onClick={()=>navigate("/seguridad/auditoria")}>Ver actividad completa</button></div>{EVENTS.map(e=><div className="activity-row" key={e[0]}><span className="activity-check">{e[3]}</span><div><strong>{e[1]}</strong><small>{e[0]} · {e[2]}</small></div></div>)}</section>
  {password&&<div className="security-modal"><div><h2>Cambiar contraseña</h2><input type="password" placeholder="Contraseña actual"/><input type="password" placeholder="Nueva contraseña"/><input type="password" placeholder="Confirmar nueva contraseña"/><div><button onClick={()=>setPassword(false)}>Cancelar</button><button className="security-primary" onClick={()=>setPassword(false)}>Actualizar</button></div></div></div>}
 </SecurityShell>;
}
