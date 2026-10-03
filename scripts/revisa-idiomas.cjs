/*
 * Comprueba que no se active un idioma que este incompleto.
 *
 *   node scripts/revisa-idiomas.cjs
 *
 * Sale con codigo 1 si encuentra un problema, para la CI.
 *
 * POR QUE: los idiomas incompletos estan en el repositorio, pero NO se
 * cargan. supportedLngs en i18n/index.js solo declara los que se usan de verdad.
 * Ese desacople es correcto, pero es invisible: nada avisa si alguien anade un
 * idioma a supportedLngs sin comprobar que esta completo.
 *
 * Y el resultado seria malo de ver. No seria "falta un texto": las claves que
 * faltan son las de la portada (home.categories.*, home.footerUi.*,
 * nav.*, paneles.*). Un visitante que eligiera ese idioma tendria la cabecera
 * y los botones en su idioma, y los nombres de las categorias y todo el pie en
 * espanol. Eso no se lee como traduccion pendiente: se lee como aplicacion rota.
 *
 * Decision de ASAFRUT (Opcion A): la plataforma se publica en espanol e ingles.
 * Los otros cinco archivos se conservan como borrador.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "frontend", "src");
const I18N = path.join(SRC, "i18n", "index.js");
const LOCALES = path.join(SRC, "i18n", "locales");

/* Decision de negocio: lo que se publica. */
const PUBLICADOS = ["es", "en"];

function aplanar(obj, prefijo = "", salida = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const clave = prefijo ? prefijo + "." + k : k;
    if (typeof v === "string") salida[clave] = v;
    else if (v && typeof v === "object" && !Array.isArray(v)) aplanar(v, clave, salida);
  }
  return salida;
}

const i18n = fs.readFileSync(I18N, "utf8");
const m = /supportedLngs:\s*\[([^\]]*)\]/.exec(i18n);
const declarados = m
  ? m[1].split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean)
  : [];

const es = aplanar(JSON.parse(fs.readFileSync(path.join(LOCALES, "es.json"), "utf8")));
const total = Object.keys(es).length;

console.log("=== Idiomas ===");
console.log("");
console.log("  " + PUBLICADOS.join(", ") + " se publican.");
console.log("  supportedLngs declara: " + (declarados.join(", ") || "(nada)"));
console.log("");

const problemas = [];

for (const codigo of declarados) {
  const f = path.join(LOCALES, codigo + ".json");
  if (!fs.existsSync(f)) {
    problemas.push(codigo + " esta en supportedLngs pero no hay " + codigo + ".json");
    continue;
  }

  const plano = aplanar(JSON.parse(fs.readFileSync(f, "utf8")));
  const faltan = Object.keys(es).filter((k) => plano[k] === undefined);

  if (faltan.length) {
    problemas.push(
      codigo + " esta en supportedLngs pero le faltan " + faltan.length +
        " de " + total + " claves. Saldrian en espanol mezcladas con " +
        codigo + ": se lee como aplicacion rota.",
    );
  } else {
    console.log("  " + codigo + ": " + Object.keys(plano).length + " claves  OK");
  }
}

// El selector de idioma no debe ofrecer como disponible un idioma que no se
// carga. El usuario lo elige, i18next cae al espanol y no entiende por que.
const switcher = path.join(SRC, "presentation", "shared", "components", "LanguageSwitcher.jsx");
if (fs.existsSync(switcher)) {
  const txt = fs.readFileSync(switcher, "utf8");
  const disponibles = [...txt.matchAll(/code:\s*"([a-z]{2})"[\s\S]{0,120}?available:\s*true/g)].map(
    (x) => x[1],
  );
  for (const d of disponibles) {
    if (!declarados.includes(d)) {
      problemas.push(
        "LanguageSwitcher ofrece " + d + " pero supportedLngs no lo carga: " +
          "el usuario lo elige y no pasa nada.",
      );
    }
  }
}

console.log("");
if (problemas.length) {
  for (const p of problemas) console.log("  MAL: " + p);
  console.log("");
  process.exit(1);
}

const borradores = fs
  .readdirSync(LOCALES)
  .filter((f) => f.endsWith(".json") && !PUBLICADOS.includes(path.basename(f, ".json")));

if (borradores.length) {
  console.log("  Borrador, NO se cargan: " + borradores.map((b) => path.basename(b, ".json")).join(", "));
  console.log("  Decision Opcion A. Ver locales/README.md.");
}
console.log("");
console.log("  Todo correcto.");