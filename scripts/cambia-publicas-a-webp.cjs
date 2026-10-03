/*
 * Cambia las referencias a imagenes PUBLICAS de .png/.jpg a .webp.
 *
 *   node scripts/cambia-publicas-a-webp.cjs [--simular]
 *
 * POR QUE ES DISTINTO de cambia-a-webp.cjs: aquellos son imports de modulo,
 * que Vite resuelve y empaqueta. Estos son src="/ruta" en JSX, que el
 * navegador pide tal cual. Cambiar la extension a mano en 10 archivos es
 * exactamente el tipo de trabajo que se queda a medias.
 *
 * Solo toca rutas que TIENEN un .webp generado al lado. Si no existe, se deja
 * la original: un src a un archivo inexistente sale roto en produccion.
 */
const fs = require("fs");
const path = require("path");

const FRONT = path.resolve(__dirname, "..", "frontend");
const PUBLIC = path.join(FRONT, "public");
const SRC = path.join(FRONT, "src");
const SIMULAR = process.argv.includes("--simular");

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

// src="/algo.png" o '/algo.png'. SeCaptura el valor entre comillas.
const RE = /(["'])(\/(?!\/)[^"']+?)\.(png|jpe?g)\1/g;

let cambios = 0;
const detalle = [];

for (const archivo of [...walk(SRC)]) {
  const antes = fs.readFileSync(archivo, "utf8");
  let enEste = 0;

  const despues = antes.replace(RE, (todo, comilla, ruta) => {
    // Solo se cambia si el WebP existe de verdad en public/.
    if (!fs.existsSync(path.join(PUBLIC, ruta + ".webp"))) {
      return todo;
    }
    enEste += 1;
    return comilla + ruta + ".webp" + comilla;
  });

  if (enEste > 0) {
    cambios += enEste;
    detalle.push("  " + path.relative(FRONT, archivo) + "  (" + enEste + ")");
    if (!SIMULAR) fs.writeFileSync(archivo, despues, "utf8");
  }
}

console.log(SIMULAR
  ? "=== SIMULACION (no se escribio nada) ==="
  : "=== Referencias publicas cambiadas a WebP ===");
console.log("");
for (const l of detalle) console.log(l);
console.log("");
console.log("  " + cambios + " referencias en " + detalle.length + " archivos");
console.log(SIMULAR
  ? "  Quita --simular para aplicarlo."
  : "  Los .png/.jpg originales se conservan; se pueden borrar luego.");