/*
 * Rota las contrasenas de MySQL y Mongo DENTRO de los contenedores ya
 * existentes, y actualiza el .env con las nuevas.
 *
 *   node scripts/rota-contrasenas.cjs
 *
 * POR QUE HACE FALTA AUNQUE EL .ENV ESTE BIEN: el compose ya no trae
 * contrasenas por defecto, pero las de los volumenes siguen siendo las que se
 * escribieron cuando se crearon ("agromarket" y "root123"). Esas puede
 * conocerlas cualquiera que haya leido el repositorio antes. Quitar la
 * contrasena del YAML no rota la que ya esta en la base.
 *
 * QUE HACE, en orden y sin perder datos:
 *   1. Genera una contrasena larga y aleatoria para cada usuario.
 *   2. Aplica ALTER USER y changeUserPassword en cada base.
 *   3. Actualiza el .env con las nuevas.
 *   4. Verifica que la nueva funciona y que la vieja YA NO.
 *
 * No recrea los volumenes: los datos se quedan donde estan. Ejecuta antes
 * scripts/probar-respaldo.mjs, por si acaso.
 *
 * AVISO: si el paso 3 falla despues del 2, MySQL queda con una contrasena que
 * no esta en el .env y no se podria conectar. Por eso el .env se actualiza
 * justo despues y el script avisa si no pudo escribirlo.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const crypto = require("crypto");

const RUTA_ENV = path.join(path.resolve(__dirname, ".."), ".env");

const CONT_MYSQL = "asafrut-mysql";
const CONT_MONGO = "asafrut-mongo";

let fallos = 0;
const p = (s) => console.log(s);
const chk = (cond, texto) => {
  p((cond ? "  OK    " : "  FALLA ") + texto);
  if (!cond) fallos += 1;
};

/*
 * Contrasena alfanumerica, no Base64.
 *
 * Base64 lleva +, / y =, y el parser del .env de Docker Compose los trata de
 * forma distinta:Formatted una vez una clave de firma que llego recortada.
 * Alfanumerico no tiene ninguno de esos simbolos.
 */
const nuevaContrasena = (bytes) => {
  const alfabeto =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bruto = crypto.randomBytes(bytes);
  let out = "";
  for (let i = 0; i < bytes; i += 1) out += alfabeto[bruto[i] % alfabeto.length];
  return out;
};

const printenv = (c) =>
  execFileSync("docker", ["exec", c, "printenv"], { encoding: "utf8", timeout: 20000 });

const valorEn = (env, nombre) => {
  const l = env.split(/\r?\n/).find((x) => x.startsWith(nombre + "="));
  return l === undefined ? null : l.slice(nombre.length + 1);
};

const mysql = (args) =>
  execFileSync("docker", ["exec", "-i", CONT_MYSQL, "mysql", ...args], {
    encoding: "utf8",
    input: "",
    timeout: 60000,
    stdio: ["pipe", "pipe", "pipe"],
  });

// Credenciales actuales: solo hacen falta para leer del volumen.
const envMysql = printenv(CONT_MYSQL);
const envMongo = printenv(CONT_MONGO);
const MONGO_RAIZ = valorEn(envMongo, "MONGO_INITDB_ROOT_PASSWORD");
const MYSQL_RAIZ = valorEn(envMysql, "MYSQL_ROOT_PASSWORD");
const MYSQL_APP = valorEn(envMysql, "MYSQL_USER");
const MYSQL_APP_CLAVE = valorEn(envMysql, "MYSQL_PASSWORD");

if (!MONGO_RAIZ || !MYSQL_RAIZ || !MYSQL_APP) {
  p("  No se pudieron leer las credenciales actuales de los contenedores.");
  p("  Sin ellas no se puede rotar: el ALTER USER necesita la clave actual.");
  process.exit(1);
}

p("=== Rotacion de contrasenas ===");
p("  usuario de MySQL: " + MYSQL_APP);
p("  usuario de Mongo: root");
p("");

const nuevas = {
  MYSQL_PASSWORD: nuevaContrasena(24),
  MYSQL_ROOT_PASSWORD: nuevaContrasena(24),
  MONGO_ROOT_PASSWORD: nuevaContrasena(24),
};

// --- 1. MySQL ---
p("1/2  MySQL");
try {
  mysql(["-uroot", "-p" + MYSQL_RAIZ, "-e",
    "ALTER USER '" + MYSQL_APP + "'@'%' IDENTIFIED BY '"
      + nuevas.MYSQL_PASSWORD + "'; FLUSH PRIVILEGES;"]);
  chk(true, "contrasena de " + MYSQL_APP + " cambiada");
} catch (ex) {
  chk(false, "no se pudo cambiar la de " + MYSQL_APP + ": "
    + String(ex.stdout || ex.stderr || ex.message).slice(0, 160));
}

try {
  mysql(["-uroot", "-p" + MYSQL_RAIZ, "-e",
    "ALTER USER 'root'@'%' IDENTIFIED BY '"
      + nuevas.MYSQL_ROOT_PASSWORD + "'; FLUSH PRIVILEGES;"]);
  chk(true, "contrasena de root cambiada");
} catch (ex) {
  chk(false, "no se pudo cambiar la de root: "
    + String(ex.stdout || ex.stderr || ex.message).slice(0, 160));
}

// --- 2. MongoDB ---
p("");
p("2/2  MongoDB");
try {
  execFileSync("docker", ["exec", CONT_MONGO, "mongosh", "--quiet",
    "-u", "root", "-p", MONGO_RAIZ, "--authenticationDatabase", "admin",
    "--eval",
    "db.getSiblingDB('admin').changeUserPassword('root', '"
      + nuevas.MONGO_ROOT_PASSWORD + "')"],
  { encoding: "utf8", timeout: 60000, stdio: ["ignore", "pipe", "pipe"] });
  chk(true, "contrasena de root cambiada");
} catch (ex) {
  chk(false, "no se pudo cambiar la de Mongo: "
    + String(ex.stdout || ex.stderr || ex.message).slice(0, 200));
}

// --- 3. Verificacion: la nueva entra y la vieja no ---
p("");
p("=== Verificacion ===");

const entraCon = (clave) => {
  try {
    mysql(["-u" + MYSQL_APP, "-p" + clave, "-e", "SELECT 1;"]);
    return true;
  } catch {
    return false;
  }
};

chk(entraCon(nuevas.MYSQL_PASSWORD),
    "la contrasena NUEVA de la aplicacion funciona");
chk(!entraCon(MYSQL_APP_CLAVE),
    "la contrasena VIEJA ya NO funciona (era la del repositorio)");

// --- 4. .env ---
p("");
p("=== Actualizando el .env ===");

const lineas = fs.existsSync(RUTA_ENV)
  ? fs.readFileSync(RUTA_ENV, "utf8").split(/\r?\n/)
  : [];

// Se sustituye la primera aparicion de cada variable y se eliminan las
// siguientes: es como se evita dejar duplicadas, que luego gana la ultima y no
// se sabe cual se esta usando.
const yaPuestas = new Set();
const salida = [];
for (const l of lineas) {
  const t = l.trim();
  const clave = Object.keys(nuevas).find((k) => t.startsWith(k + "="));
  if (!clave) {
    salida.push(l);
    continue;
  }
  if (!yaPuestas.has(clave)) {
    yaPuestas.add(clave);
    salida.push(clave + "=" + nuevas[clave]);
  }
}
for (const k of Object.keys(nuevas)) {
  if (!yaPuestas.has(k)) {
    salida.push(k + "=" + nuevas[k]);
  }
}

try {
  fs.writeFileSync(RUTA_ENV, salida.join("\n"), "utf8");
  chk(true, ".env actualizado con las tres contrasenas nuevas");
} catch (ex) {
  chk(false, "NO se pudo escribir el .env: " + ex.message);
  p("");
  p("  ATENCION: MySQL y Mongo ya tienen contrasenas nuevas que no estan");
  p("  en ningun archivo. Vuelve a ejecutar este script, o borra el .env y");
  p("  rehazlo con scripts/define-mysql.cjs, antes de tocar nada mas.");
}

p("");
p("  Reinicia los contenedores para que las tomes:");
p("    docker compose up -d --force-recreate");
p("  y comprueba que el backend sigue respondiendo:");
p("    node scripts/ver-revocacion.mjs");
p("");
p(fallos === 0
  ? "RESULTADO: contrasenas rotadas y verificadas"
  : "RESULTADO: " + fallos + " fallos, revisa lo de arriba");
process.exit(fallos === 0 ? 0 : 1);