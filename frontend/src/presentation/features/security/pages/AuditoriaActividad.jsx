import { useMemo, useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";

const LOGS=[["22 Ago 2026 · 16:32","LOGIN","COMPRADOR","Inicio de sesión exitoso","192.168.1.20","Éxito"],["22 Ago 2026 · 15:41","LOGIN_2FA","COMPRADOR","Segundo factor validado","192.168.1.20","Éxito"],["22 Ago 2026 · 14:05","UPDATE_PROFILE","COMPRADOR","Actualización de perfil","192.168.1.20","Éxito"],["21 Ago 2026 · 21:14","LOGIN","ADMIN","Credenciales inválidas","181.52.10.4","Fallido"]];
export default function AuditoriaActividad(){
 const [q,setQ]=useState(""); const data=useMemo(()=>LOGS.filter(x=>x.join(" ").toLowerCase().includes(q.toLowerCase())),[q]);
 return <SecurityShell activeKey="auditoria"><div className="security-heading"><div><h1>Auditoría y actividad</h1><p>Registro trazable de eventos de seguridad y acciones relevantes.</p></div><input className="table-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar evento..." /></div><section className="security-card permission-matrix"><table><thead><tr><th>Fecha</th><th>Evento</th><th>Rol</th><th>Descripción</th><th>IP</th><th>Resultado</th></tr></thead><tbody>{data.map(r=><tr key={r.join("-")}>{r.map((c,i)=><td key={i}>{c}</td>)}</tr>)}</tbody></table></section><div className="audit-note">Los eventos de autenticación 2FA y login deben conservarse para trazabilidad. El backend actual registra eventos como LOGIN y LOGIN_2FA.</div></SecurityShell>;
}
