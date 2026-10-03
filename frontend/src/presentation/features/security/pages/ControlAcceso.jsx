import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";
import Icon from "@/presentation/shared/components/Icon";

export default function ControlAcceso(){
 const navigate=useNavigate();
 const [enabled,setEnabled]=useState(true); const [remember,setRemember]=useState(true);
 return <SecurityShell activeKey="acceso">
  <div className="security-heading"><div><h1>Control de acceso</h1><p>Protege el inicio de sesión y controla el acceso a recursos protegidos.</p></div><span className="security-badge safe">Protegido</span></div>
  <section className="security-card login-preview"><div className="login-icon"><Icon name="lock" size={30} /></div><h2>Inicio de sesión seguro</h2><p>AgroMarket valida identidad, sesión y permisos antes de permitir el acceso.</p><div className="security-form"><label>Correo electrónico<input placeholder="usuario@agromarket.co" /></label><label>Contraseña<input type="password" placeholder="••••••••" /></label><label className="check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Mantener sesión iniciada</label><button type="button" onClick={()=>navigate("/login")}>Iniciar sesión</button></div></section>
  <section className="security-card"><h2>Políticas activas</h2><div className="policy-row"><span>Sesión con token válido</span><b>Activo</b></div><div className="policy-row"><span>Redirección cuando la sesión expira</span><b>Activo</b></div><div className="policy-row"><span>Control por rol</span><b>Activo</b></div><div className="policy-row"><span>Recordar dispositivo</span><button onClick={()=>setEnabled(!enabled)}>{enabled?"Activo":"Desactivado"}</button></div></section>
 </SecurityShell>;
}
