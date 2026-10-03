/*
 * Comprueba que un token revocado SIGUE revocado despues de reiniciar el
 * contenedor.
 *
 *   node scripts/ver-revocacion-reinicio.mjs
 *
 * POR QUE ESTA SEPARADA DE ver-revocacion.mjs: con la lista en memoria, el
 * token revocado volvia a valer en cuanto se reiniciaba el backend, y la
 * prueba basica (200 antes, 401 despues del logout) pasaba igual. Solo
 * reiniciando se ve si la revocacion esta guardada de verdad.
 *
 * QUE HACE, en orden:
 *   1. Login y logout: deja un token revocado.
 *   2. Reinicia el contenedor.
 *   3. Usa ese MISMO token otra vez.
 * Si la revocacion es de verdad persistente, responde 401. Si esta en memoria,
 * responde 200 y el token ha revivido.
 */
import { execFileSync } from "node:child_process";

const B = "http://localhost:8080";
const CORREO = "prueba.logout@local.invalido";
const CLAVE = "PruebaLocal2026*";

let fallos = 0;
const p = (s) => console.log(s);
const chk = (cond, texto) => {
  p((cond ? "  OK    " : "  FALLA ") + texto);
  if (!cond) fallos += 1;
};

const docker = (args) =>
  execFileSync("docker", args, {
    encoding: "utf8",
    timeout: 30 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });

const usar = async (token) => {
  const r = await fetch(B + "/api/v1/users/me", {
    headers: { Authorization: "Bearer " + token },
  });
  return r.status;
};

const esperarSalud = async () => {
  for (let i = 0; i < 90; i += 1) {
    try {
      const r = await fetch(B + "/actuator/health");
      if (r.ok) return true;
    } catch {
      // El contenedor aun no escucha: es normal nada mas arrancar.
    }
    execFileSync("powershell", [
      "-NoProfile", "-Command", "Start-Sleep -Seconds 2",
    ]);
  }
  return false;
};

p("=== La revocacion sobrevive a un reinicio ===");
p("");

// 1. Login
const r = await fetch(B + "/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: CORREO, password: CLAVE }),
});
if (!r.ok) {
  p("  login: HTTP " + r.status);
  if (r.status === 429) p("  El limite por IP esta activo; espera un minuto.");
  process.exit(1);
}
const token = (await r.json()).token;
p("  login: 200, token de " + token.length + " chars");

chk((await usar(token)) === 200, "el token sirve antes de nada (200)");

// 2. Logout
const salida = await fetch(B + "/api/v1/auth/logout", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
});
chk(salida.status === 200, "logout responde 200");
chk((await usar(token)) === 401, "tras el logout el token ya no sirve (401)");

p("");
p("  reiniciando el contenedor (esto es lo que hacia perder la lista en memoria)...");

// 3. Reinicio. NO se toca ningun volumen: solo el contenedor.
docker(["restart", "asafrut-backend"]);

if (!await esperarSalud()) {
  p("  el backend no volvio a responder tras el reinicio");
  process.exit(1);
}
p("  el backend volvio a responder");
p("");

// 4. El mismo token, con el contenedor nuevo.
const despues = await usar(token);
p("  GET /api/v1/users/me con el token de antes del reinicio -> HTTP " + despues);
chk(despues === 401,
    "el token revocado SIGUE revocado tras el reinicio (" + despres + ")");

p("");
if (despues === 401) {
  p("  Con la lista en memoria, aqui habria dado 200: el token revivia al");
  p("  reiniciar el contenedor.");
} else if (despues === 200) {
  p("  ALERTA: la revocacion no sobrevive al reinicio. El token ha revivido.");
}
p("");
p(fallos === 0
  ? "RESULTADO: 4/4 verificado, la revocacion es persistente"
  : "RESULTADO: " + fallos + " fallos");
process.exit(fallos === 0 ? 0 : 1);