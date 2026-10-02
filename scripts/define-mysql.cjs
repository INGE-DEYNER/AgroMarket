/*
 * Define en el .env las variables de MySQL leyendo su valor ACTUAL del
 * contenedor, sin escribir ningun secreto en el repositorio ni imprimirlo.
 *
 *   node scripts/define-mysql.cjs
 *
 * POR QUE NO SE GENERAN: MySQL solo lee la contrasena al crear el volumen. Si
 * se pusiera una nueva en el .env, el backend dejaria de conectarse con el
 * volumen ya existente. Y escribir una contrasena en un archivo versionado es
 * justo el fallo que este trabajo corrige.
 *
 * Que hace: lee MYSQL_USER, MYSQL_PASSWORD y MYSQL_ROOT_PASSWORD de
 * printenv del contenedor y los copia al .env. Asi ambos coinciden y nadie
 * tiene que teclear una contrasena a mano ni dejarla escrita en un script.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RUTA_ENV = path.resolve(__dirname, "..", ".env");
const VARS = ["MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_ROOT_PASSWORD"];

let dentro;
try {
  dentro = execFileSync("docker", ["exec", "asafrut-mysql", "printenv"], {
    encoding: "utf8",
    timeout: 20000,
  });
} catch (ex) {
  console.log("no se pudo leer del contenedor asafrut-mysql: " + ex.message);
  process.exit(1);
}

const valorDe = (nombre) => {
  const l = dentro.split(/\r?\n/).find((x) => x.startsWith(nombre + "="));
  return l === undefined ? null : l.slice(nombre.length + 1);
};

const lineas = fs.existsSync(RUTA_ENV)
  ? fs.readFileSync(RUTA_ENV, "utf8").split(/\r?\n/)
  : [];

// Se quitan las definiciones previas para no dejar duplicados.
const sinMysql = lineas.filter((l) => {
  const t = l.trim();
  return !VARS.some((v) => t.startsWith(v + "="));
});

const nuevas = ["", "# --- credenciales de MySQL ---"];
let faltan = 0;
for (const v of VARS) {
  const valor = valorDe(v);
  if (!valor) {
    faltan += 1;
    console.log("  " + v + ": no esta en el contenedor");
    continue;
  }
  nuevas.push(v + "=" + valor);
  // Solo la longitud: el valor no sale de aqui.
  console.log("  " + v + " (" + valor.length + " chars) copiado del contenedor");
}

if (faltan === 0) {
  fs.writeFileSync(RUTA_ENV, [...sinMysql, ...nuevas].join("\n"), "utf8");
  console.log("");
  console.log("  .env actualizado. Recrea el backend para que tome los valores:");
  console.log("    docker compose up -d --force-recreate asafrut-backend");
} else {
  console.log("");
  console.log("  No se escribio nada: faltan variables en el contenedor.");
}