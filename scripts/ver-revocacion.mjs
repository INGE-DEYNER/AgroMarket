/*
 * Mide solo la revocacion del token al hacer logout.
 *
 *   node scripts/ver-revocacion.mjs
 *
 * Va aparte de scripts/ver-limites.mjs a proposito: la prueba de limites
 * agota el cupo de login por IP (10 por minuto) y, si se midieran juntas, el
 * login de esta comprobacion caeria en un 429 y el script diria "omitido"
 * sin haber medido nada.
 */
const B = "http://localhost:8080";
const CORREO = process.argv[2] || "prueba.logout@local.invalido";
const CLAVE = process.argv[3] || "PruebaLocal2026*";

let fallos = 0;
const p = (s) => console.log(s);
const chk = (cond, texto) => {
  p((cond ? "  OK    " : "  FALLA ") + texto);
  if (!cond) fallos += 1;
};

const llamar = async (metodo, ruta, tok) => {
  const cabeceras = { "Content-Type": "application/json" };
  if (tok) cabeceras.Authorization = "Bearer " + tok;
  const r = await fetch(B + ruta, { method: metodo, headers: cabeceras });
  return { status: r.status };
};

p("=== Revocacion del token en el logout ===");
p("  usuario: " + CORREO);
p("");

const r = await fetch(B + "/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: CORREO, password: CLAVE }),
});

if (!r.ok) {
  p("  login: HTTP " + r.status);
  if (r.status === 429) {
    p("");
    p("  El limite por IP esta activo. Espera un minuto y repite.");
  }
  p("");
  p("RESULTADO: no medido (sin token)");
  process.exit(1);
}

const j = await r.json();
const tok = j.token || j.accessToken || (j.data && j.data.token) || null;
if (!tok) {
  p("  el login respondio 200 pero sin token en el cuerpo");
  p("RESULTADO: no medido");
  process.exit(1);
}
p("  login: HTTP 200, token recibido (" + tok.length + " chars)");
p("");

const antes = await llamar("GET", "/api/v1/users/me", tok);
chk(antes.status === 200, "antes del logout el token sirve (" + antes.status + ")");

const salida = await llamar("POST", "/api/v1/auth/logout", tok);
chk(salida.status === 200, "logout responde 200 (" + salida.status + ")");

const despues = await llamar("GET", "/api/v1/users/me", tok);
chk(despues.status === 401,
    "el mismo token ya NO sirve tras el logout (" + despues.status + ")");

p("");
if (despues.status === 401) {
  p("  Antes de este arreglo 'despues' habria dado 200: el JWT es sin");
  p("  estado y seguia valido hasta una hora despues.");
}
p("");
p(fallos === 0 ? "RESULTADO: 3/3 verificado" : "RESULTADO: " + fallos + " fallos");
process.exit(fallos === 0 ? 0 : 1);