/*
 * Busca la primera excepcion real en un archivo de log, ignorando las lineas
 * de "at ..." que solo son el rastro de la pila.
 *
 *   node scripts/ver-error-log.cjs <log>
 *
 * Existe porque el error de arranque de Spring empieza unas 40 lineas antes
 * del "Caused by", y leer el log a mano lleva a mirar el sintoma equivocado.
 */
const fs = require("fs");

const ruta = process.argv[2] || "";
if (!ruta || !fs.existsSync(ruta)) {
  console.log("uso: ver-error-log.cjs <archivo-de-log>");
  process.exit(1);
}

const lineas = fs.readFileSync(ruta, "utf8").split(/\r?\n/);

// Una linea de excepcion tiene texto Y no es una pila.
//
// OJO: Spring escribe el error con dos formatos distintos. Cuando el fallo es
// al LEER la configuracion (un YAML roto, por ejemplo), no pone "Caused by":
// escribe "while setting bean property" o un error de SnakeYAML sin esa marca.
// Por eso aqui se busca cualquier linea de error, no solo "Caused by".
const esExcepcion = (l) => {
  const t = l.trim();
  if (t.length === 0) return false;
  if (/^\s+at\s/.test(l)) return false;
  return /(Exception|Error|error|Caused by|APPLICATION FAILED|Description:|Action:|yaml|Scanner)/.test(t);
};

const encontradas = lineas
  .map((l, i) => ({ l, i }))
  .filter((x) => esExcepcion(x.l));

if (encontradas.length === 0) {
  console.log("sin excepciones en " + ruta);
  // Si tampoco hay nada, se muestran las primeras lineas: el fallo puede estar
  // en un formato que este script no reconoce.
  console.log("primeras 12 lineas del log:");
  lineas.slice(0, 12).forEach((l, i) => console.log("  L" + (i + 1) + ": " + l.slice(0, 200)));
  process.exit(0);
}

// Se imprime la primera excepcion y las siguientes que sigan a la cadena.
const primera = encontradas[0].i;
console.log("=== primera excepcion (linea " + (primera + 1) + ") ===");
for (const { l, i } of encontradas) {
  if (i < primera || i > primera + 8) continue;
  console.log("  L" + (i + 1) + ": " + l.trim().slice(0, 220));
}