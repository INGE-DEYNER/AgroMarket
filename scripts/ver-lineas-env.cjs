/*
 * Diagostico del .env: cuantas veces aparece cada variable y con que formato.
 * No imprime ningun valor, solo la longitud y si lleva comillas.
 *
 *   node scripts/ver-lineas-env.cjs
 */
const fs = require("fs");
const path = require("path");

const RUTA = path.resolve(__dirname, "..", ".env");
const VARS = ["JWT_SECRET", "APP_SECURITY_ID_ENCRYPTION_KEY",
  "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_ROOT_PASSWORD"];

const lineas = fs.readFileSync(RUTA, "utf8").split(/\r?\n/);

for (const v of VARS) {
  const encontradas = lineas
    .map((l, i) => ({ l, i }))
    .filter((x) => x.l.trim().startsWith(v + "="));
  if (encontradas.length === 0) {
    console.log("  " + v.padEnd(32) + " NO APARECE");
    continue;
  }
  for (const { l, i } of encontradas) {
    const bruto = l.slice(l.indexOf("=") + 1).trim();
    const limpio = bruto.replace(/^["']/, "").replace(/["']$/, "");
    const comillas = bruto !== limpio ? "entrecomillado" : "sin comillas";
    console.log("  " + v.padEnd(32) + " L" + (i + 1)
      + "  " + limpio.length + " chars  " + comillas
      + (encontradas.length > 1 ? "   <-- DUPLICADA" : ""));
  }
}