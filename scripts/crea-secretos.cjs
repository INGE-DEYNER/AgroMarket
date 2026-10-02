/*
 * Genera los secretos que la aplicación exige en producción y los deja en el
 * .env (que NO está versionado).
 *
 *   node scripts/crea-secretos.cjs          -> rellena lo que falte
 *   node scripts/crea-secretos.cjs --ver    -> solo informa presencia
 *   node scripts/crea-secretos.cjs          -> regenera los dos
 *
 * No imprime ningún valor: solo qué variables tocó. Los secretos van a .env
 * porque el repositorio es público.
 *
 * Longitudes: JWT_SECRET son 72 caracteres porque HS512 exige 64 bytes.
 * APP_SECURITY_ID_ENCRYPTION_KEY son 44 caracteres porque es
 * crypto.randomBytes(32).toString("base64"): 32 bytes en Base64 ocupa 44
 * caracteres, y el decodificador de IdEncryptionUtil solo acepta 16, 24 o 32
 * bytes. Una clave de 44 caracteres que NO sea Base64 válido hace que el
 * arranque falle con "debe ser Base64 de 16, 24 o 32 bytes".
 *
 * Solo para JWT y MySQL se usan alfanuméricos: un valor con +, / o = puede ser
 * mal interpretado por el parser del .env de Docker Compose y acabar llegando
 * recortado al contenedor. Pasó con una clave de 75 caracteres que llegó
 * como 25. La clave de cifrado sí necesita Base64, así que se entrecomilla en
 * el .env para que llegue entera.
 */
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

/*
 * Rutas.
 *
 * RUTA_ENV: el .env va junto al docker-compose.yml, que ahora está en la raiz
 * del repositorio (antes vivia un nivel por encima). Se resuelve con
 * __dirname y no con una ruta relativa al directorio actual: si no, el script
 * escribiria el .env dentro de scripts/ al ejecutarse desde ahi, y Docker
 * Compose no lo veria nunca.
 */
const RUTA_ENV = path.join(path.resolve(__dirname, ".."), ".env");

const CLAVES = [
  // minimo = lo que exige de verdad la aplicacion para cada clave.
  //   JWT: HS512 necesita 64 bytes.
  //   Cifrado: 16, 24 o 32 bytes en Base64, o sea 24, 32 o 44 caracteres.
  ["JWT_SECRET", 72, "clave de firma del JWT (72 caracteres: HS512 pide 64 bytes)", "alfanumerico", 64],
  ["APP_SECURITY_ID_ENCRYPTION_KEY", 32, "cifrado de ids (Base64 de 32 bytes = 44 caracteres)", "base64", 44],
];

/*
 * MySQL y Mongo NO van en CLAVES a proposito.
 *
 * Sus contrasenas SOLO se leen al crear el volumen. Si el script generara una
 * nueva, el backend dejaria de poder conectarse con el volumen ya existente,
 * porque seguiria usando la que se le dio al inicializarlo.
 *
 * Tampoco se escribe una contrasena conocida: la que usa el volumen de
 * desarrollo estaria en el repositorio, que es justo el fallo que este
 * trabajo corrige. Si faltan, el script lo dice y explica como elegir una,
 * en vez de inventar una. Para copiarlas del contenedor: define-mysql.cjs.
 */
const NO_GENERADAS = [
  ["MYSQL_USER", "usuario de MySQL"],
  ["MYSQL_PASSWORD", "contraseña de MySQL"],
  ["MYSQL_ROOT_PASSWORD", "contraseña root de MySQL"],
  ["MONGO_ROOT_USER", "usuario de MongoDB"],
  ["MONGO_ROOT_PASSWORD", "contraseña root de MongoDB"],
];

const alfanumerico = (chars) => {
  const alfabeto =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(chars);
  let out = "";
  for (let i = 0; i < chars; i += 1) {
    out += alfabeto[bytes[i] % alfabeto.length];
  }
  return out;
};

/**
 * Devuelve la línea de .env lista para escribir, con comillas si hace falta.
 * Base64 puede acabar en "=" o contener "+" y "/", que el parser de Compose
 * interpreta de forma distinta, así que se entrecomilla siempre.
 */
const linea = (nombre, bytes, tipo) => {
  if (tipo === "base64") {
    return nombre + '="' + crypto.randomBytes(bytes).toString("base64") + '"';
  }
  return nombre + "=" + alfanumerico(bytes);
};

/**
 * Lee un valor ya presente en el .env.
 *
 * Se quitan las comillas porque la clave de cifrado se escribe entrecomillada
 * (su Base64 puede acabar en "=" y el parser de Compose lo altera). Sin
 * quitarlas, "corta===" mide 47 en lugar de 44 y --ver la daria por mala
 * cuando en realidad es correcta.
 */
const leerActual = (nombre) => {
  if (!fs.existsSync(RUTA_ENV)) return "";
  const linea = fs.readFileSync(RUTA_ENV, "utf8").split(/\r?\n/)
    .find((x) => x.trim().startsWith(nombre + "="));
  if (!linea) return "";
  return linea.slice(linea.indexOf("=") + 1)
    .trim()
    .replace(/^["']/, "")
    .replace(/["']$/, "");
};

if (process.argv[2] === "--ver") {
  let faltan = 0;
  for (const [nombre, , , , minimo] of CLAVES) {
    const valor = leerActual(nombre);
    const ok = valor.length >= minimo;
    if (!ok) faltan += 1;
    console.log("  " + (ok ? "OK    " : "FALTA ") + nombre
      + "  (" + valor.length + "/" + minimo + " chars)");
  }
  for (const [nombre] of NO_GENERADAS) {
    const valor = leerActual(nombre);
    if (!valor) {
      faltan += 1;
      console.log("  FALTA " + nombre + " (no se genera: debe coincidir con el volumen)");
    } else {
      console.log("  OK    " + nombre);
    }
  }
  process.exit(faltan === 0 ? 0 : 1);
}

// Quita las definiciones previas de estas variables: si quedan duplicados,
// Docker Compose se queda con la última y puede no ser la que se lee.
let lineas = fs.existsSync(RUTA_ENV)
  ? fs.readFileSync(RUTA_ENV, "utf8").split(/\r?\n/)
  : [];

const nombres = CLAVES.map(([n]) => n);
lineas = lineas.filter((l) => {
  const t = l.trim();
  return !nombres.some((n) => t.startsWith(n + "="));
});

const nuevas = [
  "",
  "# --- secretos de producción (NO versionar este archivo) ---",
];
for (const [nombre, bytes, nota, tipo] of CLAVES) {
  nuevas.push("# " + nota);
  nuevas.push(linea(nombre, bytes, tipo));
}
lineas.push(...nuevas);

fs.writeFileSync(RUTA_ENV, lineas.join("\r\n"), "utf8");
console.log(
  "  escritas " + CLAVES.length + " variables en .env (valores no mostrados)",
);
console.log("  JWT alfanumerica; clave de cifrado en Base64 y entrecomillada.");
console.log("");

// Aviso de lo que este script NO hace, para que nadie lo asuma.
const faltanBases = NO_GENERADAS.filter(([n]) => !leerActual(n));
if (faltanBases.length > 0) {
  console.log("  FALTA definir a mano en el .env:");
  for (const [n, nota] of faltanBases) {
    console.log("    " + n + "   (" + nota + ")");
  }
  console.log("");
  console.log("  No se generan aqui por dos razones:");
  console.log("    1. MySQL y Mongo solo leen la contrasena al crear el volumen.");
  console.log("       Cambiarla despues deja al backend sin poder conectarse.");
  console.log("    2. Escribir una contrasena aqui la pondria en el repositorio,");
  console.log("       que es el fallo que este script viene a evitar.");
  console.log("  Para copiar las del contenedor, sin mostrarlas:");
  console.log("    node scripts/define-mysql.cjs");
  console.log("  Si prefieres elegirlas tu:");
  console.log("    node -e \"console.log(require('crypto').randomBytes(24).toString('base64url'))\"");
  console.log("");
}

console.log("  Recrea el contenedor para que las tome:");
console.log("    docker compose up -d --force-recreate asafrut-backend");