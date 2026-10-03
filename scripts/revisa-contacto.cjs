/*
 * Busca datos de contacto y URLs que se quedaron como relleno.
 *
 *   node scripts/revisa-contacto.cjs
 *
 * Sale con codigo 1 si encuentra uno, para poder engancharlo a la CI.
 *
 * Que busca:
 *  - wa.me/#### escrito a mano. Debe pasar por contacto.js. Si alguien pega
 *    un numero suelto en un componente, este script lo encuentra.
 *  - Enlaces tel: y mailto: con el dato metido en el HTML en vez de sacarlo de
 *    contacto.js. Cuando se relleno el numero de WhatsApp, seguia habiendo una
 *    copia mia en el pie con el mismo numero, y las dos se desincronizarian en
 *    cuanto cambiara una.
 *  - Numeros de ejemplo morphedos. 573001234567 sale en la documentacion de
 *    i18next como ejemplo.
 *  - URLs con doble barra, tipo facebook.com//ASAFRUT67.
 *  - target="_blank" sin rel="noopener".
 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "frontend", "src");

const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules") walk(rel, acc);
    } else if (/\.(jsx?|tsx?|css)$/.test(e.name)) {
      acc.push(rel);
    }
  }
  return acc;
};

/* Numero de ejemplo de la documentacion de i18next. */
const EJEMPLO_I18NEXT = "573001234567";

/* Las pruebas no deben dispararse contra los comentarios del propio codigo:
   ahi es donde se documenta el formato que hay que rellenar. */
const esComentario = (linea) => /^\s*(\/\/|\/\*|\*)/.test(linea);

const problemas = [];

for (const archivo of walk(SRC)) {
  const lineas = fs.readFileSync(archivo, "utf8").split(/\r?\n/);

  lineas.forEach((linea, i) => {
    const n = i + 1;
    const rel = path.relative(path.dirname(path.dirname(SRC)), archivo);

    // wa.me escrito a mano fuera de contacto.js
    if (/wa\.me\//.test(linea) && archivo.indexOf("contacto.js") === -1) {
      problemas.push([rel, n, "wa.me escrito a mano (pasa por config/contacto.js)", linea.trim()]);
    }

    // Numero de ejemplo. Se ignoran los comentarios, que es donde se documenta
    // el formato que hay que rellenar, y contacto.js, que es justamente el
    // archivo que explica que numero hay que poner ahi.
    if (
      linea.indexOf(EJEMPLO_I18NEXT) !== -1 &&
      !esComentario(linea) &&
      archivo.indexOf("contacto.js") === -1
    ) {
      problemas.push([rel, n, "numero de ejemplo de la doc de i18next", linea.trim()]);
    }

    // Enlace tel: con el numero escrito dentro. Tiene que salir de contacto.js.
    if (/(href|href=)\s*[=]?\s*["'{`]\s*tel:/.test(linea) && archivo.indexOf("contacto.js") === -1) {
      problemas.push([rel, n, 'enlace tel: con el numero escrito a mano (usa CONTACTO.telefono)', linea.trim()]);
    }

    // Enlace mailto: con el correo escrito dentro, por el mismo motivo.
    // El $ queda fuera a proposito: mailto:${CONTACTO.email} es la forma
    // CORRECTA de hacerlo (una plantilla), no un correo escrito a mano.
    if (/mailto:[^"'`{\s$]/.test(linea) && archivo.indexOf("contacto.js") === -1) {
      problemas.push([rel, n, 'enlace mailto: con el correo escrito a mano (usa CONTACTO.email)', linea.trim()]);
    }

    // Doble barra en una URL
    const doble = /https?:\/\/[^"'\s]*\/\//.exec(linea);
    if (doble) {
      problemas.push([rel, n, "doble barra en la URL: " + doble[0], linea.trim()]);
    }

    // target="_blank" sin noopener: la ventana nueva recibe window.opener y la
    // pagina de destino puede redirigir la nuestra con window.opener.location.
    //
    // Solo cuenta para <a href> a un sitio de fuera. Un <Link to> de React
    // Router es interno y abre una pestana del mismo origen: no hay tabnabbing
    // que evitar, asi que no se avisa de eso.
    if (/target="_blank"/.test(linea) && !/noopener/.test(linea) && !esComentario(linea)) {
      const ventana = lineas.slice(i, i + 4).join(" ");
      if (!/noopener/.test(ventana) && /<a[\s\S]{0,200}href=/.test(ventana) && !/to="/.test(linea)) {
        problemas.push([rel, n, 'target="_blank" sin rel="noopener"', linea.trim()]);
      }
    }
  });
}

console.log("=== Datos de contacto sin configurar ===");
console.log("");

if (!problemas.length) {
  console.log("  Ninguno. Todo el contacto pasa por config/contacto.js.");
} else {
  for (const [archivo, n, motivo, texto] of problemas) {
    console.log("  " + archivo + ":" + n);
    console.log("    " + motivo);
    console.log("    " + texto);
    console.log("");
  }
  console.log("  " + problemas.length + " problemas.");
  console.log("");
  console.log("  Todo el contacto debe salir de");
  console.log("  frontend/src/infrastructure/config/contacto.js. Si falta un dato");
  console.log("  real (WhatsApp o correo), se pone ahi y los enlaces aparecen solos.");
}

process.exit(problemas.length ? 1 : 0);