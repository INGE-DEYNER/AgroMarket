/*
 * Busca caracteres fuera del rango habitual en un archivo.
 *
 *   node scripts/ver-caracteres.cjs <archivo>
 *
 * Sirve para detectar que se colaron ideogramas chinos o cualquier otro
 * caracterise raro en un archivo de codigo o de configuracion: no compilan y
 * el error que aparece no senala el sitio. Paso de verdad: en un workflow
 * aparecio "yDc<n>" en un comentario.
 */
const fs = require("fs");

const ruta = process.argv[2];
if (!ruta) {
  console.log("uso: ver-caracteres.cjs <archivo>");
  process.exit(1);
}

const texto = fs.readFileSync(ruta, "utf8");
const lineas = texto.split(/\r?\n/);

// Rangos permitidos: ASCII, alfabetos accentuados, signos de puntuacion
// habituales y los simbolos que aparecen en YAML (.env, claves).
const permitido = (c) =>
  (c >= "\x20" && c <= "\x7e") ||       // ASCII imprimible
  c === "\t" ||
  (c >= "\u00a1" && c <= "\u00ff") ||   // acentuados y enye
  "ºª«»…–—‘’“”·€".includes(c);

let malos = 0;
lineas.forEach((linea, i) => {
  [...linea].forEach((c, j) => {
    if (!permitido(c)) {
      malos += 1;
      console.log("  L" + (i + 1) + " col" + (j + 1)
        + ": " + JSON.stringify(c)
        + "  U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
    }
  });
});

console.log(malos === 0
  ? "  OK: solo caracteres normales en " + ruta
  : "  " + malos + " caracter(es) raro(s) en " + ruta);
process.exit(malos === 0 ? 0 : 1);