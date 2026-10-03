/*
 * Impide que ddl-auto: update vuelva a aparecer en produccion.
 *
 *   node scripts/revisa-esquema.cjs
 *
 * Sale con codigo 1 si lo encuentra, para poder engancharlo a la CI.
 *
 * POR QUE: update en produccion deja que cada despliegue cambie la base de
 * datos. Es un cambio de esquema que nadie ha revisado, que ocurre en el
 * momento de mayor presion y del que no queda copia ni historial. Ya se
 * cambio a validate en application-prod.yml; esto es para que no vuelva por
 * descuido, que es como suelen volver estas cosas.
 *
 * En dev si se admite update: al crear un campo nuevo interesa que no obligue
 * a escribir el SQL a mano. Por eso el script solo mira application-prod.yml.
 */
const fs = require("fs");
const path = require("path");

const PROD = path.resolve(
  __dirname,
  "..",
  "agroMarket",
  "src",
  "main",
  "resources",
  "application-prod.yml",
);
const MIGRACIONES = path.join(
  path.dirname(PROD),
  "db",
  "migration",
);

console.log("=== Esquema de la base de datos ===");
console.log("");

const problemas = [];

if (!fs.existsSync(PROD)) {
  console.log("  No se encuentra application-prod.yml.");
  process.exit(1);
}

const yml = fs.readFileSync(PROD, "utf8");

// Se busca update dentro del bloque jpa. Un "update" suelto en un comentario no
// cuenta, asi que se ignoran las lineas comentadas.
const lineas = yml.split(/\r?\n/).filter((l) => !/^\s*#/.test(l));

const nivel = (l) => {
  const m = l.match(/^(\s*)/);
  return m ? m[1].length : 0;
};

let enJpa = false;
for (const linea of lineas) {
  const n = nivel(linea);
  if (/^\s*jpa:\s*$/.test(linea)) enJpa = true;
  else if (enJpa && n === 0) enJpa = false;

  if (enJpa && /ddl-auto:\s*update\b/.test(linea)) {
    problemas.push("application-prod.yml lleva ddl-auto: update en produccion");
  }
}

if (/ddl-auto:\s*validate/.test(lineas.join("\n"))) {
  console.log("  produccion: ddl-auto validate  OK");
} else {
  problemas.push("application-prod.yml no dice ddl-auto: validate");
}

// El esquema debe estar versionado, si no no hay con que trabajar.
const v1 = path.join(MIGRACIONES, "V1__esquema-inicial.sql");
if (fs.existsSync(v1)) {
  const tablas = (fs.readFileSync(v1, "utf8").match(/CREATE TABLE/g) || []).length;
  console.log("  esquema versionado:            " + tablas + " tablas");
} else {
  problemas.push("falta db/migration/V1__esquema-inicial.sql");
}

// Flyway tiene que estar con baseline-on-migrate. Sin eso, al desplegar contra
// una base que ya tiene el esquema, intenta aplicar V1 encima y la aplicacion
// no arranca con "Table 'x' already exists".
const base = fs.readFileSync(
  path.resolve(__dirname, "..", "agroMarket", "src", "main", "resources", "application.yml"),
  "utf8",
);

if (/baseline-on-migrate:\s*true/.test(base)) {
  console.log("  flyway baseline-on-migrate:     activo  OK");
} else {
  problemas.push(
    "application.yml no tiene flyway.baseline-on-migrate: true: al desplegar " +
      "contra una base existente, Flyway aplicara V1 encima y no arrancara",
  );
}
/* ------------------------------------------------------------------
   VARIABLES DEL .env QUE NO LLEGAN AL CONTENEDOR
   ------------------------------------------------------------------
   Poner la variable en el .env NO basta: Docker Compose solo le pasa al
   contenedor las que estan escritas en la lista "environment" del servicio.

   El bug real: APP_SUPPORT_EMAIL estaba en el .env, correctamente, y Spring
   seguia leyendo ${APP_SUPPORT_EMAIL:} vacio porque nadie la habia escrito en
   docker-compose.yml. Sin este aviso, en produccion los reportes se habrían
   guardado sin avisar a nadie y no habria habido forma de enterarse.
   ------------------------------------------------------------------ */

const ENV = path.resolve(__dirname, "..", ".env");
const COMPOSE = path.resolve(__dirname, "..", "docker-compose.yml");

const clavesDeEnv = (archivo) => {
  if (!fs.existsSync(archivo)) return [];
  return fs
    .readFileSync(archivo, "utf8")
    .split(/\r?\n/)
    .map((l) => /^\s*([A-Z0-9_]+)\s*=/.exec(l))
    .filter(Boolean)
    .map((m) => m[1]);
};

/* Variables que no tienen que estar en el compose: las de los contenedores de
   MySQL y Mongo, las de build de Docker, y las del frontend. */
const NO_MIRAR = new Set([
  "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_ROOT_PASSWORD", "MYSQL_DATABASE",
  "MYSQL_PORT_HOST", "MONGO_ROOT_USER", "MONGO_ROOT_PASSWORD",
  "MONGO_DATABASE", "MONGO_PORT_HOST", "SPRING_PROFILES_ACTIVE",
  "VITE_API_BASE_URL", "VITE_SOCKET_SERVER_URL", "VITE_NODE_ENV",
  "VITE_APP_NAME", "VITE_APP_VERSION", "SITE_URL",
  "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD",
  "ALLOWED_ORIGINS", "SOCKET_PORT", "SPRING_BACKEND_URL", "SHIPPING_COST",
  "ID_ENCRYPTION_KEY",
]);

if (fs.existsSync(ENV) && fs.existsSync(COMPOSE)) {
  const compose = fs.readFileSync(COMPOSE, "utf8");
  const ausentes = clavesDeEnv(ENV).filter(
    (k) => !NO_MIRAR.has(k) && compose.indexOf(k) === -1,
  );

  if (ausentes.length) {
    for (const k of ausentes) {
      problemas.push(
        k + " esta en el .env pero docker-compose.yml no se la pasa al " +
          "contenedor: la aplicacion seguira viendo el valor por defecto, " +
          "o vacio. Estar en el .env no basta.",
      );
    }
    console.log("");
    console.log("  MAL: " + ausentes.length + " variable(s) del .env no llegan al contenedor.");
  } else {
    console.log("  variables del .env llegan al contenedor  OK");
  }
}

console.log("");
if (problemas.length) {
  for (const p of problemas) console.log("  MAL: " + p);
  console.log("");
  console.log("  Ver db/migration/README.md.");
  process.exit(1);
}

console.log("  Todo correcto.");
console.log("");
console.log("  Flyway con baseline-on-migrate: el esquema existente queda registrado");
console.log("  como v1 y las migraciones nuevas si se aplican. Ver el README.");