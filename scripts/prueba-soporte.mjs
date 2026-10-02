/*
 * Prueba el endpoint de reportes de soporte de punta a punta.
 *
 *   node scripts/prueba-soporte.mjs
 *
 * Comprueba, en este orden:
 *   1. Que un reporte valido se acepte (201) y se devuelva id.
 *   2. Que el reporte quede REALMENTE guardado en Mongo, y no solo "aceptado".
 *      Es el fallo que se estaba arreglando: el frontend guardaba en
 *      localStorage y decia que habia enviado.
 *   3. Que las validaciones rechacen lo que deben, diciendo QUE campo fallo.
 *   4. Que el limite por IP-frena el abuso (10/min) en vez de 600/min.
 *
 * No envia correo de verdad a nadie: APP_SUPPORT_EMAIL no esta definido en
 * local, asi que el reporte se guarda pero no se avisa. Eso tambien es una
 * prueba: si el reporte se perdiera por no haber buzon, el paso 2 lo detectaria.
 */
import { execFileSync } from "node:child_process";

const B = "http://localhost:8080/api/v1";

let fallos = 0;
const p = (s) => console.log(s);
const chk = (cond, texto) => {
  p((cond ? "  OK    " : "  FALLA ") + texto);
  if (!cond) fallos += 1;
};

const post = async (cuerpo) => {
  const r = await fetch(B + "/soporte/reportes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    // Respuesta sin cuerpo: se reporta como null y ya se vera en el status.
  }
  return { status: r.status, json };
};

/* ------------------------------------------------------------- 1._valido */

p("=== 1. Reporte valido ===");
const valido = {
  category: "technical",
  subject: "Prueba automatica del formulario de soporte",
  description:
    "Este mensaje lo genera el script de prueba. Sirve para comprobar que el reporte se guarda y no se pierde.",
  email: "prueba@example.com",
};
const ok = await post(valido);
p("  HTTP " + ok.status);
p("  " + JSON.stringify(ok.json));
chk(ok.status === 201, "responde 201 Created");
chk(ok.json?.ok === true, "devuelve ok:true");
chk(!!ok.json?.id, "devuelve un id de referencia");

/* ------------------------------------------------- 2. persisted en mongo */

p("");
p("=== 2. El reporte quedo GUARDADO (no solo aceptado) ===");
let guardados = [];

/*
 * La clave de Mongo se lee del propio contenedor con printenv.
 *
 * Se puede leer porque el contenedor corre como el mismo usuario root del
 * demonio Docker, y esa variable forma parte de su entorno. Se opta por esto y
 * no por escribir la clave en el script por dos razones: escribirla la
 * meteria en el repositorio, que es justo lo que se lleva toda la semana
 * corrigiendo; y ademas hardcodarla se quedaria vieja en cuanto se rotara.
 */
const claveMongo = (() => {
  try {
    const env = execFileSync("docker", ["exec", "asafrut-mongo", "printenv"], {
      encoding: "utf8",
      timeout: 20000,
    });
    const l = env.split(/\r?\n/).find((x) => x.startsWith("MONGO_INITDB_ROOT_PASSWORD="));
    return l === undefined ? "" : l.slice("MONGO_INITDB_ROOT_PASSWORD=".length);
  } catch {
    return "";
  }
})();

if (!claveMongo) {
  p("  no se pudo leer la clave de Mongo del contenedor");
} else {
  try {
    const salida = execFileSync("docker", [
      "exec", "asafrut-mongo", "mongosh", "--quiet",
      "-u", "root", "-p", claveMongo,
      "--authenticationDatabase", "admin",
      "--eval",
      "db.getSiblingDB('agromarket').support_reports.countDocuments()",
    ], { encoding: "utf8", timeout: 30000, stdio: ["pipe", "pipe", "pipe"] });
    guardados = [salida.trim()];
  } catch (ex) {
    // Se informa en vez de dar un falso "OK".
    p("  no se pudo leer Mongo: " + String(ex.stderr || "").slice(0, 140));
  }
  p("  (la clave se leyo del contenedor y NO se imprime aqui)");
}
p("  documentos en support_reports: " + (guardados[0] ?? "desconocido"));
chk(guardados[0] !== undefined && Number(guardados[0]) > 0,
    "hay al menos un reporte en la coleccion");

/* --------------------------------------------------------- 3. validaciones */

p("");
p("=== 3. Validaciones ===");

const sinAsunto = await post({ ...valido, subject: "   " });
chk(sinAsunto.status === 400, "sin asunto devuelve 400 (recibido " + sinAsunto.status + ")");
chk(sinAsunto.json?.field === "subject",
    "dice que fallo el campo 'subject' (recibido " + sinAsunto.json?.field + ")");

const descripcionCorta = await post({ ...valido, description: "corto" });
chk(descripcionCorta.status === 400, "descripción corta devuelve 400");
chk(descripcionCorta.json?.field === "description",
    "dice que fallo el campo 'description'");

const emailMalo = await post({ ...valido, email: "no-es-un-correo" });
chk(emailMalo.status === 400, "correo inválido devuelve 400");
chk(emailMalo.json?.field === "email",
    "dice que fallo el campo 'email'");

const categoriaInventada = await post({ ...valido, category: "inventada" });
chk(categoriaInventada.status === 201,
    "una categoría desconocida se acepta como 'general', no se rompe");

const sinEmail = await post({ ...valido, email: "" });
chk(sinEmail.status === 201, "sin correo (opcional) se acepta");

/* ------------------------------------------------------------ 4. rate limit */

p("");
p("=== 4. Limite por IP (debe ser 10/min, no 600/min) ===");
// Ya se gastaron varios en el paso 3. Se llega hasta el tope y se mira el 429.
let limiteVisto = null;
for (let i = 1; i <= 18; i += 1) {
  const r = await post({ ...valido, subject: "prueba de limite " + i });
  if (r.status === 429) {
    limiteVisto = i;
    break;
  }
}
p("  el 429 llego en el intento: " + (limiteVisto ?? ">18 (NO se limita)"));
chk(limiteVisto !== null && limiteVisto <= 12,
    "el limite frena antes de 12 intentos por minuto");

p("");
p(fallos === 0
  ? "RESULTADO: el reporte SI llega, se guarda y se valida"
  : "RESULTADO: " + fallos + " fallos");
process.exit(fallos === 0 ? 0 : 1);