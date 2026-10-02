/*
 * Prueba el ciclo de respaldo y restauracion de MySQL sin tocar los datos
 * reales de AgroMarket.
 *
 *   node scripts/probar-respaldo.mjs
 *
 * Se trabaja sobre dos bases nuevas (origen y destino) dentro del MISMO MySQL,
 * con el mismo mysqldump y las mismas opciones que usa scripts/backup.sh. Las
 * bases de prueba se borran al terminar.
 *
 * Por que desde Node y no desde backup.sh: backup.sh es bash con docker exec y
 * en Windows no corre de forma nativa. Probarlo exigiria un contenedor con el
 * socket de Docker montado, y Docker Desktop en Windows no lo resuelve desde
 * un contenedor Linux.
 *
 * Que se comprueba:
 *   1. mysqldump con las opciones de backup.sh produce un .sql.gz con datos.
 *   2. El dump se restaura en una base vacia sin errores.
 *   3. Los conteos y el contenido coinciden entre origen y destino.
 * El paso 3 es el que importa: un mysqldump que "sale bien" puede estar vacio
 * o truncado, y solo se nota al contar filas.
 */
import { execFileSync } from "node:child_process";
import { gunzipSync, gzipSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const CONT = "asafrut-mysql";
const USUARIO = "agromarket";
const CLAVE = "agromarket";

/*
 * El .gz de prueba se deja en la raiz del proyecto, junto al compose.
 * fileURLToPath y no import.meta.url a pelo: en Windows la URL empieza por
 * "/C:/..." y hay que quitar la barra inicial antes de resolver la ruta.
 */
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/*
 * Root SOLO se usa para crear y borrar las bases de prueba: el usuario de la
 * aplicacion tiene GRANT ALL unicamente sobre agromarket.*, que es el minimo
 * privilegio correcto, y por eso no puede crear bases.
 *
 * Su contrasena NO se escribe en este archivo, sino que se lee del contenedor
 * con printenv. Ponerla aqui seria publicarla en el repositorio, que es justo
 * el fallo que este trabajo corrige.
 */
const RAIZ_USUARIO = "root";
const RAIZ_CLAVE = (() => {
  try {
    return execFileSync("docker", ["exec", CONT, "printenv", "MYSQL_ROOT_PASSWORD"], {
      encoding: "utf8",
      timeout: 15000,
    }).trim();
  } catch {
    return "";
  }
})();

const BASE_ORIGEN = "prueba_respaldo_origen";
const BASE_DESTINO = "prueba_respaldo_destino";

let fallos = 0;
const p = (s) => console.log(s);
const ok = (t) => p("  OK    " + t);
const falla = (t) => { p("  FALLA " + t); fallos = 1; };

/*
 * mysql dentro del contenedor.
 *
 * OJO con dos cosas:
 * - Cuando db viene vacio hay que OMITIR el argumento, no pasar "". Con "" en
 *   su sitio mysql lo toma como nombre de base, imprime su ayuda y sale con 1.
 * - El error de MySQL llega por stdout, no por stderr (stderr solo trae el
 *   aviso de "password on the command line"). Por eso los errores se reportan
 *   leyendo stdout.
 */
const correrMysql = (usuario, clave, db, sql) => {
  const args = ["exec", "-i", CONT, "mysql",
    "-u" + usuario, "-p" + clave, "-N", "-B"];
  if (db) args.push(db);
  args.push("-e", sql);
  return execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
};

const mysql = (db, sql) => correrMysql(USUARIO, CLAVE, db, sql);
const mysqlRoot = (db, sql) => correrMysql(RAIZ_USUARIO, RAIZ_CLAVE, db, sql);

/*
 * Crea una base de prueba y le da permisos al usuario de la aplicacion.
 *
 * Se usa root solo para esto: "agromarket" tiene GRANT ALL solo sobre
 * agromarket.*, que es el minimo privilegio correcto y por eso no puede crear
 * bases. El resto del script (mysqldump, restore, consultas) sigue yendo con
 * el usuario de la aplicacion, que es quien lo usara en produccion.
 */
const crearBase = (base) => {
  mysqlRoot("", "CREATE DATABASE IF NOT EXISTS " + base + ";");
  mysqlRoot("", "GRANT ALL PRIVILEGES ON " + base + ".* TO '"
    + USUARIO + "'@'%'; FLUSH PRIVILEGES;");
};

// Mismas opciones que backup_mysql() en backup.sh.
const mysqldump = (db) =>
  execFileSync(
    "docker",
    ["exec", CONT, "mysqldump", "-u" + USUARIO, "-p" + CLAVE,
      "--single-transaction", "--quick", "--routines", "--triggers", "--events", db],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
  );

const dormir = () =>
  execFileSync("powershell", ["-NoProfile", "-Command", "Start-Sleep -Seconds 2"]);

// mysqladmin ping devuelve 0 aunque el usuario aun no exista, asi que hay que
// probar una consulta de verdad antes de dar la base por lista.
const esperar = () => {
  for (let i = 0; i < 60; i += 1) {
    try {
      mysql("", "SELECT 1;");
      return true;
    } catch {
      dormir();
    }
  }
  return false;
};

const limpiar = () => {
  for (const b of [BASE_ORIGEN, BASE_DESTINO]) {
    try { mysqlRoot("", "DROP DATABASE IF EXISTS " + b + ";"); } catch { /* ya no existe */ }
  }
  console.log("");
  p("  bases de prueba eliminadas");
};

p("=== Ciclo de respaldo y restauracion de MySQL ===");
p("  contenedor: " + CONT);
p("");

if (!esperar()) {
  p("  MySQL no responde");
  process.exit(1);
}

if (!RAIZ_CLAVE) {
  p("  No se pudo leer MYSQL_ROOT_PASSWORD del contenedor.");
  p("  Se necesita para crear las bases de prueba, porque el usuario de la");
  p("  aplicacion no tiene permiso para crearlas.");
  p("  Se lee del contenedor a proposito, para no escribirla en el");
  p("  repositorio. Si el contenedor no expone la variable, revisa que");
  p("  docker-compose.yml la declare en el servicio de MySQL.");
  process.exit(1);
}

limpiar();
try {
  // --- datos de origen, en base propia ---
  crearBase(BASE_ORIGEN);
  mysql(BASE_ORIGEN, [
    "CREATE TABLE productos (id INT PRIMARY KEY, nombre VARCHAR(50), precio DECIMAL(10,2));",
    "INSERT INTO productos (id,nombre,precio) VALUES",
    "(1,'tomate',2500.00),(2,'papa',1800.50),(3,'cebolla',1200.00),",
    "(4,'zanahoria',950.75),(5,'lechuga',1400.25),(6,'zanahoria',1100.00);",
    "CREATE TABLE pedidos (id INT PRIMARY KEY, total DECIMAL(10,2));",
    "INSERT INTO pedidos (id,total) VALUES (1,5000.00),(2,3750.25),(3,1100.00);",
  ].join("\n"));

  const cProductos = mysql(BASE_ORIGEN, "SELECT COUNT(*) FROM productos;");
  const cPedidos = mysql(BASE_ORIGEN, "SELECT COUNT(*) FROM pedidos;");
  const cSuma = mysql(BASE_ORIGEN, "SELECT SUM(precio) FROM productos;");
  p("  origen: " + cProductos + " productos, " + cPedidos +
    " pedidos, suma " + cSuma);
  p("");

  // --- 1. mysqldump ---
  p("1/3  mysqldump (mismas opciones que backup.sh)");
  let sql;
  try {
    sql = mysqldump(BASE_ORIGEN);
  } catch (ex) {
    falla("mysqldump fallo: " + (ex.stderr || ex.message).toString().slice(0, 300));
    process.exit(1);
  }
  if (sql.length > 0) ok("el dump se genero (" + sql.length + " bytes)");
  else { falla("el dump salio vacio"); process.exit(1); }

  if (sql.includes("CREATE TABLE")) ok("el dump contiene el esquema");
  else falla("el dump no contiene los CREATE TABLE");
  if (sql.includes("INSERT INTO")) ok("el dump contiene los datos");
  else falla("el dump no contiene los INSERT");

  // Se comprueba el .gz igual que lo dejaria backup.sh, no solo el texto.
  const carpeta = path.join(RAIZ, "backups");
  mkdirSync(carpeta, { recursive: true });
  const archivo = path.join(carpeta, "prueba-ciclo.sql.gz");
  const gz = gzipSync(Buffer.from(sql, "utf8"), { level: 9 });
  writeFileSync(archivo, gz);
  ok("el .sql.gz se escribio (" + gz.length + " bytes)");
  if (gunzipSync(gz).toString("utf8").length === sql.length) {
    ok("el .gz se descomprime igual que el original");
  } else {
    falla("el .gz no se descomprime igual que el original");
  }
  p("");

  // --- 2. restauracion en base vacia ---
  p("2/3  restauracion en una base vacia");
  crearBase(BASE_DESTINO);
  try {
    execFileSync(
      "docker",
      ["exec", "-i", CONT, "mysql", "-u" + USUARIO, "-p" + CLAVE, BASE_DESTINO],
      { input: sql, stdio: ["pipe", "pipe", "pipe"] },
    );
    ok("la restauracion termino sin errores");
  } catch (ex) {
    falla("la restauracion dio error: " +
      (ex.stderr || ex.message).toString().slice(0, 300));
  }
  p("");

  // --- 3. comparacion: esto es lo que prueba que el backup sirve ---
  p("3/3  comparando origen y destino");
  const dProductos = mysql(BASE_DESTINO, "SELECT COUNT(*) FROM productos;");
  const dPedidos = mysql(BASE_DESTINO, "SELECT COUNT(*) FROM pedidos;");
  const dSuma = mysql(BASE_DESTINO, "SELECT SUM(precio) FROM productos;");
  p("  destino: " + dProductos + " productos, " + dPedidos +
    " pedidos, suma " + dSuma);

  if (dProductos === cProductos) ok("conteo de productos coincide (" + dProductos + ")");
  else falla("productos: origen=" + cProductos + " destino=" + dProductos);
  if (dPedidos === cPedidos) ok("conteo de pedidos coincide (" + dPedidos + ")");
  else falla("pedidos: origen=" + cPedidos + " destino=" + dPedidos);
  if (dSuma === cSuma) ok("la suma de precios coincide (" + dSuma + ")");
  else falla("suma: origen=" + cSuma + " destino=" + dSuma);

  // Y el contenido, no solo los numeros.
  const oFilas = mysql(BASE_ORIGEN, "SELECT id,nombre,precio FROM productos ORDER BY id;");
  const dFilas = mysql(BASE_DESTINO, "SELECT id,nombre,precio FROM productos ORDER BY id;");
  if (oFilas === dFilas) ok("las filas restauradas son identicas, dato por dato");
  else falla("las filas difieren");

  p("");
  p("  (La copia de prueba queda en " + archivo + ")");
  console.log("");
  if (fallos === 0) p("RESULTADO: el ciclo de respaldo y restauracion funciona");
  else p("RESULTADO: hay fallos, el backup NO es de fiar");
} finally {
  limpiar();
  process.exit(fallos);
}