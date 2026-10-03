/*
 * Borra los testimonios inventados de los archivos de traduccion.
 *
 *   node scripts/quita-testimonios-falsos.cjs [--simular]
 *
 * QUE PASABA: la seccion home.testimonials traia tres citas attributidas a
 * compradores y productores, con nombres implícitos de personas y una cifra
 * concreta ("mis ingresos aumentaron un 40%"). No son de nadie: son inventadas.
 *
 * En una cooperativa agricola eso es el peor sitio posible para una frase
 * inventada. Un cliente que lee "antes vendia a intermediarios que me pagaban
 * muy poco, ahora vendo directo y mis ingresos aumentaron un 40%" da por hecho
 * que hay un agricultor de verdad detras, con nombre y con finca. Y si el
 * incremento no ocurre, la culpa la tiene el(productor) imaginario, no el sitio.
 *
 * ADEMAS no los usaba ningun componente. Eran claves muertas... con citas
 * falsas. El peligro no era que se vieran hoy: era que el siguiente que montara
 * un modulo de testimonios los enchufara tal cual y publicara declaraciones
 * falsas en nombre de ASAFRUT.
 *
 * Si algun dia se quiere esa seccion, tiene que salir de la API de resenas
 * (/api/v1/reviews), que ya existe y tiene datos de verdad.
 */
const fs = require("fs");
const path = require("path");

const DIR = path.resolve(__dirname, "..", "frontend", "src", "i18n", "locales");
const SIMULAR = process.argv.includes("--simular");

let quitados = 0;

for (const archivo of fs.readdirSync(DIR)) {
  if (!archivo.endsWith(".json")) continue;

  const completa = path.join(DIR, archivo);
  const json = JSON.parse(fs.readFileSync(completa, "utf8"));

  if (!json.home || !json.home.testimonials) continue;

  const citas = Object.keys(json.home.testimonials)
    .filter((k) => /^t\d+$/.test(k)).length;

  delete json.home.testimonials;
  quitados++;

  console.log("  " + archivo.padEnd(9) + "  quitadas " + citas + " citas inventadas");

  if (!SIMULAR) {
    fs.writeFileSync(completa, JSON.stringify(json, null, 2) + "\n", "utf8");
  }
}

console.log("");
console.log(SIMULAR
  ? "  Simulacion: no se escribio nada. Quita --simular para aplicarlo."
  : "  " + quitados + " archivos limpiados.");
console.log("");
console.log("  Para un bloque de testimonios de verdad, los datos vienen de");
console.log("  GET /api/v1/reviews, no de un archivo de traduccion.");