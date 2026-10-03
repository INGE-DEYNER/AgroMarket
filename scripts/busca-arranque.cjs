/*
 * Busca la causa de un arranque fallido en los logs de Docker.
 *
 *   node busca-arranque.cjs <archivo.log>
 *
 * Docker escribe en UTF-16 cuando su salida se redirige desde cmd, y el
 * volcado de goroutines de buildkit/boot pestena la causa real: lo que
 * importa son las lineas de excepcion de Spring.
 */
const fs = require("fs");

const f = process.argv[2] || "lg3.txt";
if (!fs.existsSync(f)) {
  console.log("(no existe: " + f + ")");
  process.exit(0);
}
const buf = fs.readFileSync(f);
let txt = buf.toString("utf8");
if (txt.includes("\u0000")) txt = buf.toString("utf16le");

const lineas = txt.split(/\r?\n/);
const patrones = [
  /APPLICATION FAILED TO START/,
  /^\s*Description:/,
  /^\s*Action:/,
  /Caused by:/,
  /BeanCreationException/,
  /UnsatisfiedDependency/,
  /NoSuchBeanDefinition/,
  /IllegalStateException/,
  /^\s*Reason:/,
  /^\s*Parameter \d+/,
];
const out = lineas.filter((l) => patrones.some((p) => p.test(l)));

if (out.length === 0) {
  console.log("sin linea de excepcion de Spring.");
  console.log("ultimas 8 lineas:");
  console.log(lineas.slice(-8).join("\n"));
} else {
  console.log("excepcion (" + out.length + " lineas):");
  console.log(out.slice(0, 20).join("\n"));
}