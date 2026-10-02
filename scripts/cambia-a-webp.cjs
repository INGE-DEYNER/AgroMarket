/*
 * Cambia los import de imagenes de .png/.jpg a .webp.
 *
 *   node scripts/cambia-a-webp.cjs [--simular]
 *
 * POR QUE HACE FALTA: el optimizador genera los .webp, pero el codigo sigue
 * importando los .png. Si no se cambian, Vite sigue empaquetando los PNG y el
 * bundle pesa lo mismo que antes: los WebP-generated se quedan en disco sin
 * que nadie los use.
 *
 * Solo toca lineas de import. No se cambia ningun "src=" estatico, ni CSS, ni
 * HTML: aqui solo hay 13 imports en 7 archivos.
 *
 * --simular muestra lo que haria sin escribir, para revisar antes de aplicar.
 */
const fs = require("fs");
const path = require("path");

const FRONT = path.resolve(__dirname, "..", "frontend");
const SRC = path.join(FRONT, "src");
const SIMULAR = process.argv.includes("--simular");

// Solo .png y .jpg: los .svg ya son vectoriales y se pesan poco.
const RE = /(from\s+["'][^"']+?)\.(png|jpe?g)(["'])/g;

const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules") walk(rel, acc);
    } else if (/\.(jsx?|tsx?)$/.test(e.name)) {
      acc.push(rel);
    }
  }
  return acc;
};

let archivosTocados = 0;
let importsTocados = 0;
const detalle = [];

for (const archivo of walk(SRC)) {
  const antes = fs.readFileSync(archivo, "utf8");
  // Se comprueba que el .webp exista de verdad. Si no, el import quedaria
  // apuntando a un archivo inexistente y Vite fallaria al compilar.
  const candidatos = [...antes.matchAll(RE)].map((m) => m[0]);

  let despues = antes;
  let enEsteArchivo = 0;

  for (const original of candidatos) {
    const base = original.replace(/^from\s+["']/, "").replace(/["']$/, "");
    const webp = base.replace(/\.(png|jpe?g)$/i, ".webp");
    // Se comprueba que el .webp exista de verdad. Si no, el import quedaria
    // apuntando a un archivo inexistente y Vite fallaria al compilar.
    const sinAlias = webp.replace(/^@\//, "");
    const existe = fs.existsSync(path.resolve(SRC, sinAlias))
      || fs.existsSync(path.resolve(FRONT, sinAlias));
    if (!existe) continue;
    // OJO con los grupos de captura: en /\.(png|jpe?g)["']/ el grupo $1 es la
    // COMILLA, no la extension. Con un regex de dos grupos y ".webp$1" salia
    // "archivo.webppng", que no existe y rompe la compilacion de Vite.
    const nuevo = original.replace(/\.(png|jpe?g)["']/i, '.webp"');
    despues = despues.replace(original, nuevo);
    enEsteArchivo += 1;
  }

  if (enEsteArchivo > 0) {
    importsTocados += enEsteArchivo;
    archivosTocados += 1;
    detalle.push("  " + path.relative(FRONT, archivo) + "  (" + enEsteArchivo + ")");
    if (!SIMULAR) fs.writeFileSync(archivo, despues, "utf8");
  }
}

console.log(SIMULAR
  ? "=== SIMULACION (no se escribio nada) ==="
  : "=== Imports cambiados a WebP ===");
console.log("");
for (const l of detalle) console.log(l);
console.log("");
console.log("  " + importsTocados + " imports en " + archivosTocados + " archivos");
console.log(SIMULAR
  ? "  Quita --simular para aplicarlo de verdad."
  : "  Reinicia Vite para que recoja los cambios.");
