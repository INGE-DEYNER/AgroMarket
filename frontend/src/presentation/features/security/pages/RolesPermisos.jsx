import { useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";

const ROLES=[
 ["ADMIN","Administrador","Acceso completo a la plataforma","16 permisos","Crítico"],
 ["PRODUCTOR","Productor / Vendedor","Gestiona productos, ventas y finca","12 permisos","Alto"],
 ["COMPRADOR","Comprador","Compra productos y administra su cuenta","8 permisos","Normal"],
];
export default function RolesPermisos(){
 const [role,setRole]=useState("ADMIN"); const [editing,setEditing]=useState(false);
 const selected=ROLES.find(x=>x[0]===role);
 const perms=["Ver dashboard","Gestionar usuarios","Gestionar productos","Gestionar pedidos","Gestionar pagos","Gestionar reportes","Gestionar soporte","Gestionar configuración"];
 return <SecurityShell activeKey="roles">
  <div className="security-heading"><div><h1>Sistema de roles y permisos</h1><p>Define qué puede consultar y ejecutar cada tipo de usuario.</p></div><span className="security-badge safe">RBAC activo</span></div>
  <div className="role-grid">{ROLES.map(r=><button className={`role-card ${role===r[0]?"active":""}`} onClick={()=>setRole(r[0])} key={r[0]}><span className="role-code">{r[0]}</span><strong>{r[1]}</strong><p>{r[2]}</p><small>{r[3]} · Nivel {r[4]}</small></button>)}</div>
  <section className="security-card"><div className="card-heading"><div><h2>Permisos de {selected[1]}</h2><p>Permisos asignados al rol seleccionado.</p></div><button type="button" onClick={()=>setEditing(v=>!v)}>{editing?"Guardar permisos":"Editar permisos"}</button></div><div className="permission-list">{perms.map((p,i)=><label key={p}><input type="checkbox" checked={i < (role==="ADMIN"?8:role==="PRODUCTOR"?5:3)} readOnly={!editing} />{p}</label>)}</div></section>
 </SecurityShell>;
}
