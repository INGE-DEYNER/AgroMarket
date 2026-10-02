/*
 * Deja un usuario de prueba verificado en la base local, para poder probar el
 * login y la revocacion de token sin depender del correo ni de un alta real.
 *
 *   node scripts/usuario-prueba.mjs
 *
 * Se registra por la API (igual que un usuario de verdad) y luego se marca
 * como verificado con un UPDATE, porque el correo de prueba no existe y el
 * token de verificacion no se puede recibir.
 *
 * La contrasena es fija y solo sirve en local. El script se niega a correr si
 * el contenedor de MySQL no se llama como el de desarrollo.
 */
import { execFileSync } from "node:child_process";

const B = "http://localhost:8080";
const CORREO = "prueba.logout@local.invalido";
const CONTRASENA = "PruebaLocal2026*";

// Si esto no fuera el MySQL de desarrollo, insertar un usuario seria una
// catastrophe. Se comprueba el nombre del contenedor antes de tocar nada.
const contenedores = execFileSync("docker", ["ps", "--format", "{{.Names}}"], {
  encoding: "utf8",
});
if (!contenedores.split(/\r?\n/).includes("asafrut-mysql")) {
  console.log("El contenedor asafrut-mysql no esta en marcha.");
  console.log("No se inserta nada.");
  process.exit(1);
}
console.log("MySQL local encontrado. Se registrara " + CORREO);

// 1. Registro por la API. Si ya existe responde 409 y se sigue adelante.
const reg = await fetch(B + "/api/v1/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Usuario",
    lastName: "DePrueba",
    email: CORREO,
    password: CONTRASENA,
    phone: "3000000000",
    role: "BUYER",
  }),
});
console.log("  registro: HTTP " + reg.status);

// 2. Verificacion directa. El correo de prueba no existe, asi que el token que
//    manda Brevo nunca llega. users.email_verified es NOT NULL, y el backend
//    exige ademas que el usuario este activo.
const sql =
  "UPDATE users SET email_verified = b'1', active = b'1' " +
  "WHERE email = '" + CORREO + "'; SELECT ROW_COUNT() AS filas;";
try {
  const salida = execFileSync(
    "docker",
    ["exec", "asafrut-mysql", "mysql", "-uagromarket", "-pagromarket",
      "agromarket", "-N", "-B", "-e", sql],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
  console.log("  filas marcadas: " + (salida || "0"));
} catch (ex) {
  console.log("  no se pudo marcar como verificado: " + (ex.stderr || ex.message));
}

// 3. Login de comprobacion.
const res = await fetch(B + "/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: CORREO, password: CONTRASENA }),
});
console.log("  login: HTTP " + res.status);
if (res.ok) {
  console.log("");
  console.log("Listo. Ya puedes medir el logout con scripts/ver-limites.mjs");
} else {
  console.log("  respuesta: " + (await res.text()).slice(0, 200));
  console.log("");
  console.log("Si falla, comprueba que el hash de la contrasena lo genere el");
  console.log("mismo PasswordEncoder que usa la aplicacion (BCrypt).");
}