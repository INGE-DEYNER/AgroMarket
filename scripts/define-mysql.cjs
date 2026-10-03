/*
 * Define en el .env las credenciales de MySQL y MongoDB leyendo su valor
 * ACTUAL de los contenedores, sin escribir ningun secreto en el repositorio
 * ni imprimirlo.
 *
 *   node scripts/define-mysql.cjs
 *
 * POR QUE NO SE GENERAN: MySQL y Mongo solo leen la contrasena al crear el
 * volumen. Si se pusiera una nueva en el .env, el backend dejaria de
 * conectarse con el volumen ya existente. Y escribir una contrasena en un
 * archivo versionado es justo el fallo que este trabajo corrige.
 *
 * Que hace: lee las variables de printenv de cada contenedor y las copia al
 * .env. Asi ambos coinciden y nadie tiene que teclear una contrasena a mano ni
 * dejarla escrita en un script.
 *
 * OJO con Mongo: dentro del contenedor la contrasena no se llama
 * MONGO_ROOT_PASSWORD sino MONGO_INITDB_ROOT_PASSWORD (y el usuario es
 * MONGO_INITDB_ROOT_USERNAME). De ahi la conversion de nombres.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RUTA_ENV = path.join(path.resolve(__dirname, ".."), ".env");

const DE_DONDE = [
  {
    contenedor: "asafrut-mysql",
    vars: ["MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_ROOT_PASSWORD"],
  },
  {
    contenedor: "asafrut-mongo",
    vars: [
      ["MONGO_ROOT_USER", "MONGO_INITDB_ROOT_USERNAME"],
      ["MONGO_ROOT_PASSWORD", "MONGO_INITDB_ROOT_PASSWORD"],
    ],
  },
];

const printenv = (contenedor) =>
  execFileSync("docker", ["exec", contenedor, "printenv"], {
    encoding: "utf8",
    timeout: 20000,
  });

const lineas = fs.existsSync(RUTA_ENV)
  ? fs.readFileSync(RUTA_ENV, "utf8").split(/\r?\n/)
  : [];

// Todas las variables del .env que se van a tocar, para quitar las
// definiciones previas y no dejar duplicados.
const todas = DE_DONDE.flatMap((d) =>
  d.vars.map((v) => (Array.isArray(v) ? v[0] : v)));

const sinBases = lineas.filter((l) => {
  const t = l.trim();
  return !todas.some((v) => t.startsWith(v + "="));
});

const nuevas = ["", "# --- credenciales de las bases de datos ---"];
let faltan = 0;

for (const { contenedor, vars } of DE_DONDE) {
  let dentro;
  try {
    dentro = printenv(contenedor);
  } catch (ex) {
    console.log("no se pudo leer de " + contenedor + ": " + ex.message);
    faltan += 1;
    continue;
  }
  for (const par of vars) {
    const par2 = Array.isArray(par) ? par : [par, par];
    const enEnv = par2[0];
    const enContenedor = par2[1];
    const encontrada = dentro.split(/\r?\n/)
      .find((x) => x.startsWith(enContenedor + "="));
    const valor = encontrada === undefined
      ? null
      : encontrada.slice(enContenedor.length + 1);
    if (!valor) {
      faltan += 1;
      console.log("  " + enEnv + ": no esta definida en " + contenedor);
      continue;
    }
    nuevas.push(enEnv + "=" + valor);
    // Solo la longitud: el valor no sale de aqui.
    console.log("  " + enEnv + " (" + valor.length + " chars)");
  }
}

if (faltan === 0) {
  fs.writeFileSync(RUTA_ENV, [...sinBases, ...nuevas].join("\n"), "utf8");
  console.log("");
  console.log("  .env actualizado. Recrea los contenedores para que las tomen:");
  console.log("    docker compose up -d --force-recreate");
} else {
  console.log("");
  console.log("  No se escribio nada: faltan " + faltan + " valores.");
}