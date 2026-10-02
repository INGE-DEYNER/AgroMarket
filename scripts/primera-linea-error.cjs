/*
 * Busca la primera linea de error real en un archivo de texto, ignorando la
 * mayusculas y las minusculas, y saltando el ruido de la pila.
 *
 *   node scripts/primera-linea-error.cjs <archivo>
 *
 * Existe porque el fallo de buildkit no dice "ERROR" ni "BUILD FAILURE" en
 * ningun sitio: empieza con un volcado de pila en Go, y la linea que explica
 * el motivo esta unas 40 lineas mas abajo, entre el ruido. Buscar a ojocostaba
 * varios intentos.
 */
const fs = require("fs");

const ruta = process.argv[2];
if (!ruta || !fs.existsSync(ruta)) {
  console.log("no existe: " + ruta);
  process.exit(1);
}

const lineas = fs.readFileSync(ruta, "utf8").split(/\r?\n/);

// Palabras que delatan un fallo real de build o de ejecucion.
const SENALES = [
  "failed to", "cannot ", "could not", "unable to", "no such file",
  "denied", "refused", "timed out", "timeout", "killed", "out of memory",
  "exited with", "not found", "invalid", "unexpected",
];

// Se ignoran las lineas de pila: no explican nada por si solas.
const esPila = (l) => /^\s*(at |github\.com|golang\.org|runtime|0x[0-9a-f]|\/usr\/|\/root\/)/.test(l);

let encontradas = [];
lineas.forEach((l, i) => {
  const t = l.trim().toLowerCase();
  if (!t || esPila(l)) return;
  if (SENALES.some((s) => t.includes(s))) encontradas.push({ l, i });
});

if (encontradas.length === 0) {
  console.log("  ninguna linea de error encontrada en " + ruta);
  // Si tampoco hay nada, se muestran las ultimas lineas no vacias.
  console.log("");
  console.log("  --- ultimas lineas no vacias ---");
  lineas.map((l, i) => ({ l, i })).filter((x) => x.l.trim()).slice(-10)
    .forEach((x) => console.log("  L" + (x.i + 1) + ": " + x.l.slice(0, 200)));
  process.exit(0);
}

console.log("  " + encontradas.length + " lineas suspectas. Las 8 primeras:");
console.log("");
for (const { l, i } of encontradas.slice(0, 8)) {
  console.log("  L" + (i + 1) + ": " + l.slice(0, 220));
}