/*
 * Inventario de assets del frontend: peso por archivo y busqueda de formatos
 * modernos.
 *
 *   node scripts/inv-assets.cjs
 *
 * POR QUE: un PNG de 714 KB en el logo del navbar se descarga en CADA pagina.
 * Con un catalogo de 40 productos y 6 imagenes por pagina, eso decide si la
 * tienda carga o no en datos moviles. Y no se ve al abrir el codigo: hay que
 * mirar los bytes.
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..", "frontend");
const CARPETAS = ["src/assets", "public", "src/assets/home"];

const p = console.log;

/** Weight of every image in the frontend, largest first. */
const imagenes = [];
const recorrer = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules") continue;
      recorrer(rel);
      continue;
    }
    if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(e.name)) {
      imagenes.push({
        rel: path.relative(RAIZ, rel).replace(/\\/g, "/"),
        bytes: fs.statSync(rel).size,
      });
    }
  }
};
recorrer(path.join(RAIZ, "src", "assets"));
recorrer(path.join(RAIZ, "public"));
imagenes.sort((a, b) => b.bytes - a.bytes);

p("=== imagenes mas pesadas ===");
for (const i of imagenes.slice(0, 18)) {
  const kb = (i.bytes / 1024).toFixed(0);
  const marca = i.bytes > 300 * 1024 ? "  <-- PESADA" : "";
  console.log("  " + kb.padStart(7) + " KB  " + i.rel + marca);
}

const total = imagenes.reduce((s, i) => s + i.bytes, 0);
console.log("");
console.log("  total de imagenes: " + imagenes.length
  + "  (" + (total / 1024 / 1024).toFixed(2) + " MB)");

p("");
p("=== formatos modernos presentes ===");
for (const fmt of ["webp", "avif"]) {
  const n = imagenes.filter((i) => i.rel.toLowerCase().endsWith("." + fmt)).length;
  console.log("  ." + fmt.padEnd(6) + n + " archivos");
}

p("");
p("=== imagenes grandes usadas en la home (LCP) ===");
const home = imagenes.filter((i) => i.rel.includes("assets/home"));
for (const i of home) {
  console.log("  " + (i.bytes / 1024).toFixed(0).padStart(6) + " KB  " + i.rel);
}

/* ---------------------------------------------------------------- CSS */

p("");
p("=== hojas de estilo ===");
const css = [];
const recorrerCss = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules") continue;
      recorrerCss(rel);
      continue;
    }
    if (e.name.endsWith(".css")) {
      css.push({
        rel: path.relative(RAIZ, rel).replace(/\\/g, "/"),
        bytes: fs.statSync(rel).size,
      });
    }
  }
};
recorrerCss(path.join(RAIZ, "src"));
css.sort((a, b) => b.bytes - a.bytes);
for (const c of css.slice(0, 12)) {
  console.log("  " + (c.bytes / 1024).toFixed(1).padStart(7) + " KB  " + c.rel);
}
/* ---------------------------------------------------------------- TOUCH */

/*
 * Area tactil.
 *
 * Se buscan los botones y enlaces con altura declarada menor de 44px. La
 * guia (WCAG 2.5.5 y las de Apple/Google) pide 44px como minimo en el dedo.
 * Con un navbar de 40px, el fallo de tocar el boton equivocado es constante.
 */
p("");
p("=== areas tactiles menores de 44px (por CSS) ===");

const cssFiles = [];
const buscarCss = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) buscarCss(rel);
    else if (e.name.endsWith(".css")) cssFiles.push(rel);
  }
};
buscarCss(path.join(RAIZ, "src"));

let pequenos = 0;
for (const f of cssFiles) {
  const texto = fs.readFileSync(f, "utf8");
  // Botones/enlaces con altura o alto menor de 44px.
  const re = /(btn|button|enlace|nav-link|link|cta|chip|badge|social)[^{]*\{[^}]*?(?:min-)?height:\s*(\d{1,2})px/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const alto = Number(m[2]);
    if (alto < 44) {
      pequenos += 1;
      const rel = path.relative(RAIZ, f).replace(/\\/g, "/");
      if (pequenos <= 14) {
        console.log("  " + rel + "  " + alto + "px  ->  " + m[0].split("{")[0].trim().slice(0, 44));
      }
    }
  }
}
console.log("");
console.log("  selectores con altura < 44px: " + pequenos
  + (pequenos > 14 ? " (se muestran los primeros 14)" : ""));

p("");
p("=== conteos rapidos ===");
const cuentaEn = (re, carpeta) => {
  let n = 0;
  const rec = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      const rel = path.join(d, e.name);
      if (e.isDirectory()) rec(rel);
      else if (e.name.endsWith(".jsx")) {
        n += (fs.readFileSync(rel, "utf8").match(re) || []).length;
      }
    }
  };
  rec(carpeta);
  return n;
};
const SRC = path.join(RAIZ, "src");
console.log("  <h1> en todo el src:        "
  + cuentaEn(/<h1[ >]/g, SRC));
console.log("  loading=\"lazy\":            "
  + cuentaEn(/loading="lazy"/g, SRC));
console.log("  <img sin alt:              "
  + cuentaEn(/<img(?![^>]*\balt=)[^>]*>/g, SRC));
console.log("  aria-label en botones:     "
  + cuentaEn(/aria-label=/g, SRC));
console.log("  type=\"email\":              "
  + cuentaEn(/type="email"/g, SRC));
console.log("  required:                  " + cuentaEn(/\brequired\b/g, SRC));
console.log("  prefers-reduced-motion:    "
  + cssFiles.reduce((s, f) =>
    s + (fs.readFileSync(f, "utf8").match(/prefers-reduced-motion/g) || []).length, 0)
  + " bloques");
console.log("  focus-visible / :focus:    "
  + cssFiles.reduce((s, f) =>
    s + (fs.readFileSync(f, "utf8").match(/:focus-visible|:focus\b/g) || []).length, 0)
  + " reglas");

console.log("");
console.log("=== CSS ===");

/* ---------------------------------------------------------------- DIST */

p("");
p("=== dist/ (lo que se sirve en produccion) ===");
const dist = path.join(RAIZ, "dist");
if (!fs.existsSync(dist)) {
  console.log("  no hay dist; ejecuta npx vite build");
  process.exit(0);
}

const salida = [];
const recorrerDist = (dir, prefijo) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      recorrerDist(rel, prefijo + e.name + "/");
    } else {
      salida.push({
        rel: prefijo + e.name,
        bytes: fs.statSync(rel).size,
      });
    }
  }
};
recorrerDist(dist, "");

const porTipo = {};
for (const f of salida) {
  const ext = (f.rel.match(/\.([a-z0-9]+)$/i) || [, "?"])[1].toLowerCase();
  porTipo[ext] = (porTipo[ext] || 0) + f.bytes;
}

const totalDist = salida.reduce((s, f) => s + f.bytes, 0);
console.log("  " + (totalDist / 1024 / 1024).toFixed(2) + " MB en "
  + salida.length + " archivos");
console.log("");
for (const [ext, bytes] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
  console.log("  ." + ext.padEnd(6)
    + (bytes / 1024 / 1024).toFixed(2).padStart(8) + " MB");
}

p("");
p("=== los 10 archivos mas pesados de dist/ ===");
salida.sort((a, b) => b.bytes - a.bytes);
for (const f of salida.slice(0, 10)) {
  console.log("  " + (f.bytes / 1024).toFixed(0).padStart(7) + " KB  " + f.rel);
}