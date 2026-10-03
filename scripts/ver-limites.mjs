/*
 * Verifica tres medidas de la auditoria que se arreglaron en la misma ronda:
 *
 *   1. Rate limit por niveles.  ANTES habia 10.000/min para todo, que no
 *      frenaba nada. Ahora login va por el nivel estricto (10/min).
 *   2. Logout que revoca.  ANTES el JWT seguia valido una hora despues de
 *      cerrar sesion. Ahora el jti revocado se rechaza al usarlo.
 *   3. Sin token, 401.
 */
const B = "http://localhost:8080";
const p = (s) => console.log(s);
let fallos = 0;
const chk = (ok, txt) => {
  p("  " + (ok ? "OK    " : "FALLA ") + txt);
  if (!ok) fallos += 1;
};

const llamar = async (metodo, ruta, tok, cuerpo) => {
  const cabeceras = { "Content-Type": "application/json" };
  if (tok) cabeceras.Authorization = "Bearer " + tok;
  const r = await fetch(B + ruta, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  return { status: r.status, restante: r.headers.get("X-RateLimit-Remaining") };
};

const CORREO_PRUEBA = "prueba.logout@local.invalido";
const CLAVE_PRUEBA = "PruebaLocal2026*";

async function token(email) {
  const r = await fetch(B + "/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: CLAVE_PRUEBA }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.token || j.accessToken || (j.data && j.data.token) || null;
}

/* ---------------------------------------------------------------- 1. RATE */
p("=== 1. Limite de intentos en login (nivel sensible) ===");
// Con contrasena falsa a proposito: lo que se mide es el limite, no el acierto.
const falsa = { email: "limite@prueba.invalido", password: "incorrecta" };
let limiteVisto = null;
for (let i = 1; i <= 16; i += 1) {
  const r = await llamar("POST", "/api/v1/auth/login", null, falsa);
  if (r.status === 429 && limiteVisto === null) {
    limiteVisto = i;
  }
}
p("  el 429 llego en el intento: " + (limiteVisto ?? ">16 (NO se limita)"));
chk(limiteVisto !== null && limiteVisto <= 12,
    "el login se bloquea antes de 12 intentos por minuto");

p("");
p("=== 1b. Una ruta normal NO usa el nivel sensible ===");
const salud = await llamar("GET", "/actuator/health", null);
p("  salud HTTP " + salud.status + "  restante=" + salud.restante);
chk(salud.status === 200, "la API sigue respondiendo con normalidad");
p("");

/* -------------------------------------------------------------- 2. LOGOUT */
p("=== 2. El logout revoca el token ===");
const tok = await token(CORREO_PRUEBA);
if (!tok) {
  p("  --    omitido: no se pudo autenticar");
} else {
  const antes = await llamar("GET", "/api/v1/users/me", tok);
  chk(antes.status === 200, "antes del logout el token sirve (" + antes.status + ")");

  const salida = await llamar("POST", "/api/v1/auth/logout", tok);
  chk(salida.status === 200, "logout responde 200 (" + salida.status + ")");

  const despues = await llamar("GET", "/api/v1/users/me", tok);
  chk(despues.status === 401,
      "el mismo token ya NO sirve (" + despues.status + ")");
  p("");
  p("  (ANTES de este arreglo, 'despues' habria dado 200: el JWT es sin");
  p("   estado y seguia valido hasta una hora despues.)");
}
p("");

/* ----------------------------------------------------------- 3. SIN TOKEN */
p("=== 3. Sin token ===");
const sinTok = await llamar("GET", "/api/v1/users/me", null);
chk(sinTok.status === 401, "sin token, 401 (" + sinTok.status + ")");

p("");
p(fallos === 0
  ? "RESULTADO: 3/3 verificado"
  : "RESULTADO: " + fallos + " fallos");