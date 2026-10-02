/*
 * Encuentra en frontend/public los archivos que NADIE referencia ya.
 *
 *   node scripts/limpia-publicos.cjs          (solo informa)
 *   node scripts/limpia-publicos.cjs --borrar (los elimina)
 *
 * POR QUE HACE FALTA: Vite copia public/ entero a dist/, referred o no. Al
 * pasar los .png a .webp, el codigo dejo de apuntar a los .png, pero los .png
 * se quedaron en public/ y por tanto en dist/: 714 KB del logo y 841 KB del
 * retrato del desarrollador, 1,5 MB que se descargan en cada visita a una pagina
 * que no los usa... o, peor, se sirven sin que nadie los pida.
 *
 * PRECAUCION: no se toca robots.txt, sitemap.xml, _redirects, _headers,
 * site.webmanifest ni los .txt/.xml de configuracion. Se busca la referencia
 * en TODO src/ y en los .htmlpublicos, pero un archivo puede referenciarse
 * desde codigo que este fuera del arbol de fuentes.
 */
const fs = require("fs");
const path = require("path");

const FRONT = path.resolve(__dirname, "..", "frontend");
const PUBLIC = path.join(FRONT, "public");
const SRC = path.join(FRONT, "src");
const BORRAR = process.argv.includes("--borrar");

/* Archivos que se.Copy por configuracion, no por referencia en codigo. */
const NUNCA_BORRAR = new Set([
  "robots.txt",
  "sitemap.xml",
  "_redirects",
  "_headers",
  "site.webmanifest",
  "favicon.svg",
  "favicon.ico",
  ".nojekyll",
  /* Sprite de iconos. Nadie lo referencia todavia, pero son 5 KB y borrarlo
     dejaria el proyecto sin fuente de los iconos. */
  "icons.svg",
]);

const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walk(rel, acc);
    else acc.push(rel);
  }
  return acc;
};

/* Todo el texto donde puede aparecer una referencia. */
const fuentes = [];
for (const f of walk(SRC)) {
  if (/\.(jsx?|tsx?|css|html|json)$/.test(f)) {
    fuentes.push(fs.readFileSync(f, "utf8"));
  }
}
const indexHtml = path.join(FRONT, "index.html");
if (fs.existsSync(indexHtml)) fuentes.push(fs.readFileSync(indexHtml, "utf8"));

/* Tambien hay que leer los archivos de configuracion de public/. El manifest es
   el caso peligroso: referencia /icons/favicon-512.png, ese archivo no aparece
   en ningun .jsx ni en el index.html, y sin esta linea el script lo proponia
   para borrar. Borrarlo habria dejado la app sin icono al instalarla en el
   movil, y el fallo no se ve hasta que alguien la instala. */
for (const cfg of fs.readdirSync(PUBLIC)) {
  if (/\.(webmanifest|json|txt|xml)$/.test(cfg)) {
    fuentes.push(fs.readFileSync(path.join(PUBLIC, cfg), "utf8"));
  }
}

const todo = fuentes.join("\n");

const sueltos = [];
let bytes = 0;

for (const abs of walk(PUBLIC)) {
  const rel = path.relative(PUBLIC, abs).split(path.sep).join("/");

  if (NUNCA_BORRAR.has(path.basename(rel))) continue;

  // Se busca la ruta con y sin la carpeta inicial, por si algun codigo la
  // escribe completa desde la raiz.
  const conCarpeta = "/" + rel;
  const nombre = path.basename(rel);

  const referenciado =
    todo.indexOf(conCarpeta) !== -1 ||
    /\/_escaped|\{\s*\.\s*\//.test("") ||
    todo.indexOf(nombre) !== -1;

  if (!referenciado) {
    const tam = fs.statSync(abs).size;
    sueltos.push({ abs: abs, rel: rel, tam: tam });
    bytes += tam;
  }
}

const kb = (n) => (n / 1024).toFixed(0) + " KB";

console.log(BORRAR
  ? "=== Borrando archivos publicos sin referencia ==="
  : "=== Archivos publicos que ya no referencia nadie ===");
console.log("");

if (!sueltos.length) {
  console.log("  Ninguno.");
} else {
  sueltos
    .sort((a, b) => b.tam - a.tam)
    .forEach((f) => console.log("  " + kb(f.tam).padStart(8) + "  public/" + f.rel));
  console.log("");
  console.log("  " + sueltos.length + " archivos, " + kb(bytes) + " que se irian de dist/.");
  console.log("");
  console.log(BORRAR
    ? "  Borrados."
    : "  Anade --borrar para eliminarlos. Revisa antes la lista.");
}

if (BORRAR) {
  sueltos.forEach((f) => {
    try {
      fs.unlinkSync(f.abs);
    } catch (e) {
      console.log("  no se pudo borrar " + f.rel + ": " + e.message);
    }
  });
}