/**
 * Diagnóstico integral del frontend AgroMarket.
 *
 * Se ejecuta en desarrollo y verifica:
 * - entorno Vite
 * - API_BASE
 * - navegador / DOM
 * - localStorage
 * - conexión de red
 * - endpoint de health del backend
 * - endpoint público de la API
 * - latencia básica
 *
 * No modifica lógica de negocio ni sesión.
 */

const OK = "[OK]";
const FAIL = "[FAIL]";
const WARN = "[WARN]";

function getBackendRoot() {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return apiBase.replace(/\/api\/?$/, "");
}

function getApiBase() {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

async function checkFetch(name, url, options = {}, skipCredentials = false) {
  const started = performance.now();

  try {
    const fetchOptions = {
      ...options,
    };
    
    // Only include credentials if not explicitly skipped
    if (!skipCredentials) {
      fetchOptions.credentials = "include";
    }

    const response = await fetch(url, fetchOptions);

    const elapsed = Math.round(performance.now() - started);

    return {
      name,
      ok: response.ok,
      status: response.status,
      elapsed,
      detail: response.ok
        ? `HTTP ${response.status} (${elapsed} ms)`
        : `HTTP ${response.status} ${response.statusText} (${elapsed} ms)`,
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - started);

    return {
      name,
      ok: false,
      status: 0,
      elapsed,
      networkError: true,
      detail: `${error?.name || "NetworkError"}: ${error?.message || "sin respuesta"} (${elapsed} ms)`,
    };
  }
}

function printHeader() {
  console.groupCollapsed("==============================================================");
  console.info("       AGROMARKET - FULL FRONTEND DIAGNOSTIC");
  console.info("==============================================================");
  console.info(`Origin      : ${window.location.origin}`);
  console.info(`API Base    : ${getApiBase()}`);
  console.info(`Backend Root: ${getBackendRoot()}`);
}

function printResult(result) {
  console.info(
    `${result.ok ? OK : FAIL} ${result.name} — ${result.detail}`,
  );
}

function printSummary(results) {
  const failed = results.filter((result) => !result.ok);
  const ok = results.length - failed.length;

  console.info("");
  console.info("================ FINAL RESULT ================");
  console.info(`Checks OK   : ${ok}`);
  console.info(`Checks FAIL : ${failed.length}`);

  if (failed.length === 0) {
    console.info("");
    console.info("████████████████████████████████████████████████████████");
    console.info("█                                                      █");
    console.info("█   [OK] FRONTEND CONECTADO AL BACKEND Y LISTO        █");
    console.info("█        PARA TESTEO                                  █");
    console.info("█                                                      █");
    console.info("█   Backend health : OK                               █");
    console.info("█   API pública    : OK                               █");
    console.info("█   CORS/network   : OK                               █");
    console.info("█   Vite config    : OK                               █");
    console.info("█   Runtime/DOM    : OK                               █");
    console.info("█                                                      █");
    console.info("████████████████████████████████████████████████████████");
  } else {
    console.error("");
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("!! [FAIL] FRONTEND REQUIERE ATENCIÓN                !!");
    console.error("!! Revisar los checks marcados [FAIL].             !!");
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  }

  console.info("===============================================");
  console.groupEnd();

  return failed.length === 0;
}

export async function runFrontendDiagnostic() {
  if (!import.meta.env.DEV) {
    return { ok: true, skipped: true, reason: "diagnóstico solo en desarrollo" };
  }

  printHeader();

  const results = [];

  const viteConfigured = Boolean(
    import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim(),
  );

  results.push({
    name: "VITE API CONFIG",
    ok: true,
    detail: viteConfigured
      ? `VITE_API_URL=${import.meta.env.VITE_API_URL}`
      : `VITE_API_URL no definido; usando fallback ${getApiBase()}`,
  });

  results.push({
    name: "DOM / ROOT",
    ok: Boolean(document.getElementById("root")),
    detail: document.getElementById("root")
      ? "#root disponible"
      : "#root no encontrado",
  });

  let storageOk = true;
  try {
    const key = "agromarket:diagnostic";
    localStorage.setItem(key, "ok");
    localStorage.removeItem(key);
  } catch {
    storageOk = false;
  }

  results.push({
    name: "LOCAL STORAGE",
    ok: storageOk,
    detail: storageOk ? "disponible" : "no disponible",
  });

  const backendHealth = await checkFetch(
    "BACKEND HEALTH",
    `${getBackendRoot()}/actuator/health`,
  );
  results.push(backendHealth);

  const publicApi = await checkFetch(
    "PUBLIC API",
    `${getApiBase()}/public/metrics`,
    {},
    true
  );
  results.push(publicApi);

  results.push({
    name: "NETWORK / CORS",
    ok: backendHealth.status !== 0 && publicApi.status !== 0,
    detail:
      backendHealth.status !== 0 && publicApi.status !== 0
        ? "fetch completado; el navegador recibió respuesta del backend"
        : "no fue posible obtener respuesta del backend; revisar servidor/CORS/red",
  });

  results.forEach(printResult);

  const ok = printSummary(results);

  if (!ok) {
    console.warn(
      `${WARN} El frontend no debe marcarse como listo para testeo hasta corregir los checks [FAIL].`,
    );
  }

  return { ok, results };
}
