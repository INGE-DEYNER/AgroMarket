import { useState } from "react";
import SecurityShell from "@/presentation/features/security/components/SecurityShell";
import Icon from "@/presentation/shared/components/Icon";

export default function DosFactorTOTP(){
 const [enabled,setEnabled]=useState(false); const [step,setStep]=useState(1);
 return <SecurityShell activeKey="2fa">
  <div className="security-heading"><div><h1>Autenticación de dos factores</h1><p>Agrega una segunda capa de seguridad usando códigos TOTP.</p></div><span className={`security-badge ${enabled?"safe":"warning"}`}>{enabled?"Activado":"No activado"}</span></div>
  <section className="security-card twofa"><div className="twofa-visual"><Icon name="shield" size={40} /></div><div><h2>2FA / TOTP</h2><p>Al iniciar sesión, además de tu contraseña se solicitará un código temporal de autenticación.</p><ul><li>Códigos de un solo uso.</li><li>El código cambia periódicamente.</li><li>El segundo factor no sustituye tu contraseña.</li></ul><button className="security-primary" onClick={()=>{setEnabled(!enabled);setStep(enabled?1:2)}}>{enabled?"Desactivar 2FA":"Configurar 2FA"}</button></div></section>
  {step===2&&!enabled&&<section className="security-card setup"><h2>Paso 1 · Vincula tu autenticador</h2><div className="fake-qr"><Icon name="qr" size={72} /><br/><span>AgroMarket</span></div><p>Escanea el código con tu aplicación de autenticación y luego introduce el código de 6 dígitos.</p><input inputMode="numeric" maxLength="6" placeholder="000000" /><button onClick={()=>{setEnabled(true);setStep(1)}}>Verificar y activar</button></section>}
  </SecurityShell>;
}
