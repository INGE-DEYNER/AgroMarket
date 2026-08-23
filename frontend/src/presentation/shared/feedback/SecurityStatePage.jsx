import { Link, useLocation } from "react-router-dom";
import "@/presentation/styles/security-system.css";

const DATA={
 "403":["403","Acceso denegado","No tienes permisos suficientes para acceder a este recurso.","Volver al inicio"],
 "419":["419","Sesión expirada","Tu sesión ha expirado por seguridad. Inicia sesión nuevamente.","Iniciar sesión"],
 "423":["423","Cuenta bloqueada","Tu cuenta está temporalmente bloqueada. Contacta al soporte.","Contactar soporte"],
 "451":["451","Cuenta suspendida","El acceso a esta cuenta se encuentra restringido.","Ver soporte"],
 "503":["503","Mantenimiento","AgroMarket está temporalmente en mantenimiento. Intenta nuevamente más tarde.","Reintentar"],
 "404":["404","Recurso no encontrado","La página o recurso que buscas no existe o fue movido.","Ir al inicio"],
};
export default function SecurityStatePage({code}){
 const location=useLocation(); const key=code || location.pathname.split("/").pop(); const data=DATA[key] || DATA["404"];
 return <main className="standalone-state"><Link to="/home" className="security-brand"><img src="/logo-asafrut.jpg" alt="AgroMarket"/><strong>AgroMarket</strong></Link><div className="standalone-state-card"><div className="state-code">{data[0]}</div><h1>{data[1]}</h1><p>{data[2]}</p><Link to={key==="419"?"/login":"/home"} className="security-primary">{data[3]}</Link></div></main>;
}
