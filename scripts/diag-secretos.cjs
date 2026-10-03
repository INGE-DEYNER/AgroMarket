/*
 * Comprueba qué secretos ve el contenedor, sin imprimir ningún valor.
 *
 *   node scripts/diag-secretos.cjs
 *
 * Compara el .env de la raiz con el entorno real del contenedor. Sirve para
 * distinguir "la variable no esta en el .env" de "esta pero Docker no la
 * pasa", que son fallos distintos con causas distintas.
 */
const fs = require("fs");
const { execFileSync } = require("child_process");

const VARS = [
  "JWT_SECRET",
  "APP_SECURITY_ID_ENCRYPTION_KEY",
  "MYSQL_PASSWORD",
  "MERCADOPAGO_ACCESS_TOKEN",
  "CLOUDINARY_API_KEY",
  "BREVO_API_KEY",
];

const p = (s) => console.log(s);

p("=== 1. Que define el .env de la raiz ===");
const raiz = fs.existsSync(".env")
  ? fs.readFileSync(".env", "utf8").split(/\r?\n/)
  : [];
for (const v of VARS) {
  const l = raiz.find((x) => x.trim().startsWith(v + "="));
  const valor = l ? l.slice(l.indexOf("=") + 1).trim() : null;
  if (valor === null) {
    p("  AUSENTE  " + v);
  } else if (valor === "") {
    p("  VACIA    " + v);
  } else {
    p("  ok(" + String(valor.length).padStart(4) + ") " + v);
  }
}

p("");
p("=== 2. Que ve realmente el contenedor ===");
let salida = "";
try {
  salida = execFileSync("docker", ["exec", "asafrut-backend", "printenv"], {
    encoding: "utf8",
    timeout: 20000,
  });
} catch (ex) {
  p("  no se pudo leer del contenedor: " + ex.message);
  process.exit(0);
}
const dentro = salida.split(/\r?\n/);

const describe = (valor) => {
  if (valor === null) return "AUSENTE";
  if (valor === "") return "VACIA   (llega vacia)";
  return "ok(" + String(valor.length).padStart(4) + ")";
};

for (const v of VARS) {
  const l = dentro.find((x) => x.startsWith(v + "="));
  const valor = l === undefined ? null : l.slice(v.length + 1);
  p("  " + describe(valor) + " " + v);
}

p("");
p("=== 3. Coincide lo del .env con lo del contenedor? ===");
for (const v of VARS) {
  const a = raiz.find((x) => x.trim().startsWith(v + "="));
  const b = dentro.find((x) => x.startsWith(v + "="));
  const va = a ? a.slice(a.indexOf("=") + 1).trim() : null;
  const vb = b ? b.slice(v.length + 1) : null;
  if (va === null || vb === null) {
    p("  " + v.padEnd(34) + " -> solo en uno de los dos");
  } else if (va === vb) {
    p("  " + v.padEnd(34) + " -> coinciden (" + va.length + ")");
  } else {
    p("  " + v.padEnd(34) + " -> DIFEREN: env=" + va.length
      + "  contenedor=" + vb.length);
  }
}