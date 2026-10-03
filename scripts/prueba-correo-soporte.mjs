/*
 * Envia UN reporte de prueba de verdad y mira si Brevo lo acepta.
 *
 *   node scripts/prueba-correo-soporte.mjs
 *
 * Es un paso deliberadamente separado de prueba-soporte.mjs, que envia
 * Monte Carlo de reportes y dejaria el buzon inundado. Este manda UNO, con
 * datos que se reconocen como prueba, y se queda mirando que contesto Brevo.
 *
 * Por que existe: con APP_SUPPORT_EMAIL puesto, el aviso de arranque desaparece
 * y parece que todo esta bien. Pero si el REMITENTE no esta verificado en
 * Brevo, la API responde 403 y falla en silencio: el reporte se guarda, el
 * cliente ve "enviado" y el correo no sale. Nada en el arranque lo delata.
 * Un envio de prueba lo demuestra en diez segundos.
 */

const BASE = process.env.API || "http://localhost:8080/api/v1";

const MARCA = Date.now();

const cuerpo = {
  name: "Prueba tecnica",
  email: "prueba@ejemplo.invalid",
  subject: "PRUEBA DE CORREO - no atender (marca " + MARCA + ")",
  description:
    "Este reporte se genero automaticamente para comprobar que el buzon de " +
    "soporte recibe los avisos. No es una incidencia real. Marca: " + MARCA,
  category: "general",
};

console.log("Enviando UN reporte de prueba...");
console.log("  marca:    " + MARCA);
console.log("  asunto:   " + cuerpo.subject);
console.log("");

try {
  const res = await fetch(BASE + "/soporte/reportes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  const texto = await res.text();
  console.log("  HTTP " + res.status);
  console.log("  " + texto);
  console.log("");

  if (res.status === 201) {
    console.log("  El reporte se guardo. Ahora mira el correo.");
    console.log("");
    console.log("  Si no llega a soporte@agro-market.app en un par de minutos,");
    console.log("  el problema NO es el buzon: es que Brevo no tiene verificado");
    console.log("  el remitente. Se comprueba en app.brevo.com, en");
    console.log("  Transaccional > Remitentes, y sale un 403 en el log del backend.");
  } else {
    console.log("  No se guardo. Revisa el log del backend.");
  }
} catch (err) {
  console.log("  No se pudo conectar: " + err.message);
}