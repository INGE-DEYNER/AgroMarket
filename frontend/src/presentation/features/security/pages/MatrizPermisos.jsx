import { useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";
import Icon from "@/presentation/shared/components/Icon";

const rows=[["Dashboard",1,1,1],["Usuarios",1,0,0],["Productos",1,1,"Ver"],["Pedidos",1,1,1],["Pagos",1,1,1],["Reportes",1,1,0],["Configuración",1,1,0],["Soporte",1,1,1]];
const cell = (c) => c === 1 ? <Icon name="check" size={16} /> : c === 0 ? <Icon name="x" size={16} /> : c;
export default function MatrizPermisos(){
 const [filter,setFilter]=useState("");
 return <SecurityShell activeKey="matriz"><div className="security-heading"><div><h1>Matriz de permisos</h1><p>Vista consolidada de capacidades por rol.</p></div><input className="table-search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Buscar permiso..." /></div><section className="security-card permission-matrix"><table><thead><tr><th>Recurso</th><th>ADMIN</th><th>PRODUCTOR</th><th>COMPRADOR</th></tr></thead><tbody>{rows.filter(r=>r[0].toLowerCase().includes(filter.toLowerCase())).map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i} className={c===1?"allow":""}>{i===0?c:cell(c)}</td>)}</tr>)}</tbody></table></section></SecurityShell>;
}
