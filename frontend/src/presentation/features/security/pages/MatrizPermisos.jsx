import { useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";

const rows=[["Dashboard","✓","✓","✓"],["Usuarios","✓","—","—"],["Productos","✓","✓","Ver"],["Pedidos","✓","✓","✓"],["Pagos","✓","✓","✓"],["Reportes","✓","✓","—"],["Configuración","✓","✓","—"],["Soporte","✓","✓","✓"]];
export default function MatrizPermisos(){
 const [filter,setFilter]=useState("");
 return <SecurityShell activeKey="matriz"><div className="security-heading"><div><h1>Matriz de permisos</h1><p>Vista consolidada de capacidades por rol.</p></div><input className="table-search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Buscar permiso..." /></div><section className="security-card permission-matrix"><table><thead><tr><th>Recurso</th><th>ADMIN</th><th>PRODUCTOR</th><th>COMPRADOR</th></tr></thead><tbody>{rows.filter(r=>r[0].toLowerCase().includes(filter.toLowerCase())).map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i} className={c==="✓"?"allow":""}>{c}</td>)}</tr>)}</tbody></table></section></SecurityShell>;
}
