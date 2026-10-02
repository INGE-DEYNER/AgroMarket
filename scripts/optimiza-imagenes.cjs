/*
 * Lanza el optimizador de imagenes dentro de su contenedor.
 *
 *   node scripts/optimiza-imagenes.cjs
 *
 * POR QUE UN SCRIPT Y NO UN COMANDO: el repositorio esta en una ruta con
 * espacios ("Deyner Chaverra"), y docker run -v "C:\...\con espacios:/repo"
 * falla con "invalid reference format" desde cmd.exe. Con execFileSync la
 * ruta viaja como un argumento de Node, sin que ninguna shell la toque.
 */
const { execFileSync } = require("child_process");
const path = require("path");

/*
 * La ruta que se monta NO es la del repositorio, sino la que devuelve
 * monta-repo.cjs.
 *
 * Docker Desktop en Windows no monta de forma fiable un bind mount cuya ruta
 * tenga ESPACIOS, y este repositorio esta en "D:\...\Deyner Chaverra\...".
 * Con la ruta directa pasaba una de dos cosas, y las dos en silencio:
 *   "invalid reference format", o el contenedor con /repo VACIO.
 *
 * El sintoma del segundo caso es el peligroso: el script no encontraba
 * ninguna imagen, imprimia "0 imagenes convertidas" y salia con codigo 0.
 * Parecia un exito.
 */
const prefijo = execFileSync(
  process.execPath,
  [path.join(__dirname, "monta-repo.cjs")],
  { encoding: "utf8", timeout: 60000 },
).trim();

const args = [
  "run", "--rm",
  "-v", prefijo + ":/repo",
  "optimiza-imagenes",
  // El Dockerfile deja CMD ["node", "/opt/optimiza-imagenes.mjs"]. Al pasar
  // argumentos, sustituyen ese CMD, y "/repo" a secas se intentaba ejecutar
  // como programa. Hay que volver a decir QUE ejecutar y DONDE esta el
  // repositorio.
  "node", "/opt/optimiza-imagenes.mjs", "/repo",
];

console.log("  ejecutando el optimizador de imagenes");
console.log("  monta: " + prefijo + ":/repo");
console.log("  (convierte 59 imagenes a WebP y genera los iconos)");
console.log("");

/*
 * Antes de convertir, se comprueba que el contenedor VE las imagenes.
 *
 * El sintoma de un montaje mal resuelto es silencioso: el script recorre
 * directorios que no existen, no encuentra nada, imprime "0 imagenes
 * convertidas" y termina con codigo 0. Parece que funciono.
 */
{
  const { execFileSync: exec } = require("child_process");
  const chequeo = exec("docker", ["run", "--rm", "-v", prefijo + ":/repo",
    "optimiza-imagenes", "sh", "-c",
    "ls /repo/frontend/src/assets/home 2>/dev/null | head -3; echo TOTAL:$(ls /repo/frontend/src/assets 2>/dev/null | wc -l)"],
  { encoding: "utf8", timeout: 60000, stdio: ["ignore", "pipe", "pipe"] });
  console.log("  el contenedor ve: " + chequeo.trim().split(/\r?\n/).join(" / "));
  if (!chequeo.includes("TOTAL:0")) {
    console.log("  las imagenes son visibles. Convirtiendo...");
  } else {
    console.log("");
    console.log("  EL CONTENEDOR NO VE LAS IMAGENES. Revisa el montaje -v.");
    process.exit(1);
  }
  console.log("");
}

try {
  const salida = execFileSync("docker", args, {
    encoding: "utf8",
    timeout: 30 * 60 * 1000,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  process.stdout.write(salida);
  console.log("");
  console.log("  conversion terminada");
} catch (ex) {
  if (ex.stdout) process.stdout.write(ex.stdout);
  if (ex.stderr) process.stderr.write(ex.stderr);
  console.log("");
  console.log("  fallo: " + (ex.message || "").slice(0, 300));
  process.exit(1);
}