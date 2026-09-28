import { readFileSync, writeFileSync, mkdtempSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/*
 * El cotizador es una función pura, pero el módulo importa la API con el
 * alias "@/" que solo Vite sabe resolver. Para probarlo fuera de Vite se
 * copia el archivo a una carpeta temporal, se cambia ese import por un stub
 * y se ejecuta desde ahí. El archivo real no se toca.
 */
const raiz = join(dirname(fileURLToPath(import.meta.url)), "src");
const temporal = mkdtempSync(join(tmpdir(), "cotizador-"));

const destinoApi = join(temporal, "api.js");
writeFileSync(
  destinoApi,
  "export default { async get() { throw new Error('sin red'); } };\n",
);

const origen = join(raiz, "application", "support", "cotizadorEnvio.js");
const destino = join(temporal, "cotizadorEnvio.js");
writeFileSync(
  destino,
  readFileSync(origen, "utf8").replace(
    /from "@\/infrastructure\/http\/api"/,
    `from "${pathToFileURL(destinoApi).href}"`,
  ),
);

const { cotizarEnvio } = await import(pathToFileURL(destino).href);

rmSync(temporal, { recursive: true, force: true });

// La fórmula debe coincidir con la del backend (OrderUseCase).
// Chigorodó (origen) -> Chigorodó debe dar 0 km.
// Distancias reales verificadas contra la fórmula de Haversine con origen en
// Chigorodó (7.6667, -76.6811). El cálculo no es una estimación a ojo.
const casos = [
  ["Chigorodó", 0, "Urabá", 1],
  ["Apartadó", 25, "Urabá", 1],
  ["Turbo", 48, "Urabá", 1],
  ["Medellín", 199, "Antioquia", 2],
  ["Bogotá", 437, "Bogotá y Sabana", 3],
];

let fallos = 0;
for (const [ciudad, kmEsperado, zonaEsperada, diasEsperado] of casos) {
  const r = cotizarEnvio(ciudad);
  const okZona = r.zona === zonaEsperada;
  const okDias = r.dias === diasEsperado;
  // Tolerancia de 1 km por el redondeo al entero más cercano.
  const okDist = Math.abs(r.km - kmEsperado) <= 1;
  if (!okZona || !okDias || !okDist) fallos += 1;
  console.log(
    `${okZona && okDias && okDist ? "OK  " : "FALLA"} ${ciudad.padEnd(12)} ` +
      `${String(r.km).padStart(4)} km  ${r.zona}  ${r.dias}d  ` +
      `costo=$${r.costo}`,
  );
}

// Ciudad desconocida: debe devolver null, nunca un precio inventado.
const desconocida = cotizarEnvio("Ciudad Inventada Xyz");
console.log(
  desconocida.costo === null && desconocida.conocido === false
    ? "OK   ciudad desconocida -> costo null (no inventa precio)"
    : "FALLA ciudad desconocida devolvio un precio",
);
if (!(desconocida.costo === null)) fallos += 1;

// Acentos y mayúsculas deben resolverse igual.
const conAcento = cotizarEnvio("  CHIGORODÓ  ");
console.log(
  conAcento.conocido && conAcento.km === 0
    ? "OK   normaliza acentos y espacios"
    : "FALLA no normalizo acentos",
);
if (!conAcento.conocido) fallos += 1;

// El total debe growing con la distancia (envío por km, no fijo).
const cerca = cotizarEnvio("Apartadó");
const lejos = cotizarEnvio("Bogotá");
console.log(
  lejos.costo > cerca.costo
    ? "OK   el costo crece con la distancia (no es precio fijo)"
    : "FALLA el costo no depende de la distancia",
);
if (!(lejos.costo > cerca.costo)) fallos += 1;

console.log(
  fallos === 0
    ? `\nTODAS LAS PRUEBAS PASARON (${casos.length + 3})`
    : `\n${fallos} PRUEBAS FALLARON`,
);
process.exit(fallos === 0 ? 0 : 1);
