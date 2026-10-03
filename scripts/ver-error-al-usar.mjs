/*
 * Repite una comprobacion y captura el error del servidor en ese momento.
 *
 *   node scripts/ver-error-al-usar.mjs
 *
 * POR QUE: ver-revocacion.mjs ve un 500 pero no dice por que. El log del
 * servidor si lo dice, pero para leerlo hay que capturarlo DESPUES de la
 * peticion que falla, no antes. Aqui se lanza la peticion y se leen los logs
 * generados en medio.
 */
// OJO: este archivo es .mjs, asi que necesita import y no require. Con
// require mas un "await" al nivel superior, Node no sabe si el archivo es
// CommonJS o ES module y falla con ERR_AMBIGUOUS_MODULE_SYNTAX.
import { execFileSync } from "node:child_process";

const B = "http://localhost:8080";
const CORREO = "prueba.logout@local.invalido";
const CLAVE = "PruebaLocal2026*";

const logs = (desde) =>
  execFileSync("docker", ["logs", "asafrut-backend", "--since", desde], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });

const dormir = (ms) =>
  execFileSync("powershell", ["-NoProfile", "-Command", "Start-Sleep -Milliseconds " + ms]);

// Login
const r = await fetch(B + "/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: CORREO, password: CLAVE }),
});
if (!r.ok) {
  console.log("login fallo: HTTP " + r.status);
  process.exit(1);
}
const token = (await r.json()).token;
console.log("login: 200, token de " + token.length + " chars");

// Marca de tiempo para leer solo los logs de ESTA peticion.
dormir(1500);
const desde = "3s";

const res = await fetch(B + "/api/v1/users/me", {
  headers: { Authorization: "Bearer " + token },
});
const cuerpo = await res.text();
console.log("GET /api/v1/users/me -> HTTP " + res.status);
if (res.status >= 400) {
  console.log("  respuesta: " + cuerpo.slice(0, 300));
}

dormir(1500);
const texto = logs(desde);

// Se buscan las lineas de error, ignorando el ruido de acceso.
const lineas = texto.split(/\r?\n/).filter((l) =>
  !/TraceabilityFilter|Request processed/.test(l) &&
  l.trim().length > 0);

console.log("");
console.log("=== primeras lineas del error (la cabecera, no la pila) ===");

/*
 * La cabecera va ANTES que el "Caused by" y es la que dice que pasa de
 * verdad. Mostrando solo el final de la pila se leen quince lineas de Tomcat
 * y no aparece el motivo. Por eso se filtra la cola de "at ..." y se imprime
 * lo que queda, que es la cabecera y las causas.
 */
const sinPila = lineas.filter((l) => !/^\s+at\s/.test(l));
sinPila.slice(0, 25).forEach((l) => console.log("  " + l.slice(0, 250)));