/*
 * Ultimas lineas de un archivo de texto.
 *
 *   node scripts/tail.cjs <archivo> [lineas]
 *
 * Existe porque "powershell Get-Content -Tail" no funciona cuando el comando
 * lo ejecuta cmd.exe a traves de una capa intermedia, y porque la salida
 * grande satura la consola en vez de mostrar lo que decide.
 */
const fs = require("fs");

const ruta = process.argv[2];
const n = Number(process.argv[3] || 20);

if (!ruta || !fs.existsSync(ruta)) {
  console.log("no existe: " + ruta);
  process.exit(1);
}

const lineas = fs.readFileSync(ruta, "utf8").split(/\r?\n/);
const desde = Math.max(0, lineas.length - n);
console.log("--- " + ruta + " (" + lineas.length + " lineas, mostrando "
  + (lineas.length - desde) + ") ---");
for (let i = desde; i < lineas.length; i += 1) {
  console.log(lineas[i]);
}