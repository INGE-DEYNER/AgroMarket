/*
 * Cuenta lineas de archivos y lista los assets de public/.
 *
 *   node scripts/inv-frontend.cjs
 *
 * Sirve para saber el tamano de un archivo antes de decidir que partes leer:
 * Home.jsx tiene mas de 600 lineas y leerlo entero a ciegas desperdicia.
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..", "frontend");

const cuenta = (rel) => {
  const p = path.join(RAIZ, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8").split(/\r?\n/).length;
};

const INTERESAN = [
  "index.html",
  "src/presentation/features/home/pages/Home.jsx",
  "src/presentation/shared/components/Footer.jsx",
  "src/presentation/shared/components/Navbar.jsx",
  "src/presentation/features/help/pages/Ayuda.jsx",
  "src/presentation/shared/components/LoadingScreen.jsx",
  "src/presentation/shared/components/NetworkError.jsx",
  "src/presentation/shared/components/StakeholderCarousel.jsx",
  "src/presentation/shared/components/PublicLayout.jsx",
  "src/index.css",
  "src/main.jsx",
];

const p = console.log;

p("=== lineas por archivo ===");
for (const rel of INTERESAN) {
  const n = cuenta(rel);
  console.log("  " + String(n === null ? "NO EXISTE" : n).padStart(6)
    + "  " + rel);
}

console.log("");
console.log("=== assets de public/ ===");
const publicDir = path.join(RAIZ, "public");
const recorrer = (dir, prefijo) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      recorrer(rel, prefijo + e.name + "/");
    } else {
      const kb = (fs.statSync(rel).size / 1024).toFixed(1);
      console.log("  " + kb.padStart(9) + " KB  " + prefijo + e.name);
    }
  }
};
recorrer(publicDir, "");

console.log("");
console.log("=== SEO: sitemap / robots ===");
for (const f of ["public/sitemap.xml", "public/robots.txt", "public/_redirects",
  "public/_headers", "wrangler.toml"]) {
  console.log("  " + (fs.existsSync(path.join(RAIZ, f)) ? "SI" : "NO") + "  " + f);
}