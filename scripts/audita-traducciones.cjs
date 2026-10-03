/*
 * Comprueba si los 7 archivos de traduccion estan realmente traducidos o si son
 * el de español renombrado.
 *
 *   node scripts/audita-traducciones.cjs
 *
 * MOTIVO: en i18n/index.js solo se registraban "es" y "en", pero existen 7
 * archivos .json. Si ademas estan marcados como "no disponible" en el selector,
 * la pregunta es si esos archivos sirven de algo o si son relleno. Este script
 * lo responde con numeros en vez de con una sensacion.
 *
 * METODO: se aplana cada objeto a pares clave/valor y se cuentan los valores que
 * son IDENTICOS al del español. Si un idioma no esta traducido, casi todos sus
 * textos coinciden con el español.
 */
const fs = require("fs");
const path = require("path");

const DIR = path.resolve(__dirname, "..", "frontend", "src", "i18n", "locales");
const BASE = "es";
const IDIOMAS = ["es", "en", "pt", "fr", "de", "zh", "ar"];

// Aplana {a:{b:"x"}} a {"a.b":"x"}. Solo cadenas: los arrays y objetos sueltos no
// son texto traducible.
function aplanar(obj, prefijo = "", salida = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const clave = prefijo ? prefijo + "." + k : k;
    if (typeof v === "string") salida[clave] = v;
    else if (v && typeof v === "object" && !Array.isArray(v)) aplanar(v, clave, salida);
  }
  return salida;
}

const es = aplanar(JSON.parse(fs.readFileSync(path.join(DIR, BASE + ".json"), "utf8")));

console.log("=== Las traducciones estan traducidas de verdad? ===");
console.log("");
console.log("  idioma  claves   iguales a es   sin traducir");
console.log("  ------  ------  --------------  ------------");

const resumen = {};

const faltanPorSeccion = {};

/* Ejemplos de claves que faltan, para ver si son pantallas visibles o texto
   de mas abajo. Se toman del PRIMER idioma incompleto: las secciones son las
   mismas en todos, asi que no cambia el diagnostico. */
let ejemplos = [];

for (const idioma of IDIOMAS) {
  const plano = aplanar(JSON.parse(fs.readFileSync(path.join(DIR, idioma + ".json"), "utf8")));
  const claves = Object.keys(plano);

  let iguales = 0;
  for (const k of claves) if (es[k] !== undefined && es[k] === plano[k]) iguales++;

  // Que claves del espanol no existen en este idioma, agrupadas por seccion de
  // primer nivel. Sin esto solo se ve "304 faltan" sin saber donde.
  const faltan = Object.keys(es).filter(function (k) { return plano[k] === undefined; });
  faltan.forEach(function (k) {
    const seccion = k.split(".")[0];
    faltanPorSeccion[seccion] = (faltanPorSeccion[seccion] || 0) + 1;
  });
  if (!ejemplos.length && idioma !== BASE && faltan.length) ejemplos = faltan.slice(0, 25);
  resumen[idioma] = { total: claves.length, faltan: faltan.length };

  const sinTraducir = claves.length ? Math.round((iguales / claves.length) * 100) : 0;
  resumen[idioma] = { claves: claves.length, sinTraducir: sinTraducir, esLaBase: idioma === BASE };

  console.log(
    "  " + idioma.padEnd(6) + "  " + String(claves.length).padStart(6) +
    "  " + String(iguales).padStart(14) + "  " +
    String(sinTraducir + (idioma === BASE ? " (es la base)" : " %")).padStart(12),
  );
}

console.log("");
console.log("  Un porcentaje alto en un idioma distinto de es significa que ese");
console.log("  archivo es español sin traducir: habilitarlo seria PEOR que dejarlo");
console.log("  marcado como 'proximamente', porque el usuario veria español");
console.log("  creyendo que es la traduccion.");

const decision = IDIOMAS.filter(function (i) { return i !== BASE && resumen[i].sinTraducir > 60; });
if (decision.length) {
  console.log("");
  console.log("  SIN TRADUCIR de verdad: " + decision.join(", "));
  console.log("  No habilitarlos hasta traducirlos.");
} else {
  console.log("");
  console.log("  Todos los idiomas estan traducidos. Se pueden habilitar.");
}

console.log("");
console.log("=== Claves que faltan, por seccion (respecto a es) ===");
console.log("");
const secciones = Object.keys(faltanPorSeccion).sort(
  (a, b) => faltanPorSeccion[b] - faltanPorSeccion[a],
);
for (const s of secciones) {
  console.log("  " + String(faltanPorSeccion[s]).padStart(4) + "  " + s);
}

/* Muestra el texto espanol de algunas claves que faltan, para poder judging
   si son pantallas visibles o texto interno. */
console.log("");
console.log("=== Ejemplos de lo que falta (el texto en espanol) ===");
console.log("");
for (const k of ejemplos) {
  console.log("  " + k);
  console.log("      " + es[k]);
}