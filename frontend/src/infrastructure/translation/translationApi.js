/**
 * Cliente para la API de traducción automática (LibreTranslate).
 *
 * Este servicio permite traducir texto de forma automática usando
 * instancias públicas gratuitas de LibreTranslate.
 *
 * La API es 100% gratuita y no requiere API key para uso básico.
 *
 * Instancias públicas disponibles:
 * - https://translate.terraprint.co
 * - https://lt.vern.cc
 * - https://translate.fedilab.app
 * - https://trans.zillyhuhn.com
 */

/**
 * Proveedores de traducción 100% gratuitos y SIN API key, en orden de prioridad:
 *
 * 1. Google Translate (endpoint libre client=gtx) — muy confiable
 * 2. MyMemory API — gratuito, sin key (límite ~5000 chars por pedido)
 * 3. Instancias públicas de LibreTranslate — pueden estar caídas, último recurso
 */

const GOOGLE_GTX_URL =
  "https://translate.googleapis.com/translate_a/single?client=gtx";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

const LIBRETRANSLATE_INSTANCES = [
  "https://translate.terraprint.co",
  "https://lt.vern.cc",
  "https://translate.fedilab.app",
  "https://trans.zillyhuhn.com",
];

const MAX_CHARS = 4500;

/**
 * Traduce un texto. Intenta en este orden:
 * 1) Google Translate (gtx)
 * 2) MyMemory
 * 3) Instancias LibreTranslate
 *
 * Devuelve el texto traducido, o el texto original si todo falla.
 */
export async function translateText(text, source = "auto", target = "en") {
  if (!text || typeof text !== "string") return text;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return text;
  if (trimmed.length > MAX_CHARS) return text;

  // 1) Google Translate
  const fromGoogle = await translateViaGoogle(trimmed, source, target);
  if (fromGoogle && fromGoogle !== trimmed) return fromGoogle;

  // 2) MyMemory
  const fromMyMemory = await translateViaMyMemory(trimmed, source, target);
  if (fromMyMemory && fromMyMemory !== trimmed) return fromMyMemory;

  // 3) LibreTranslate
  const fromLibre = await translateViaLibreTranslate(trimmed, source, target);
  if (fromLibre && fromLibre !== trimmed) return fromLibre;

  return text;
}

async function translateViaGoogle(text, source, target) {
  try {
    const url = `${GOOGLE_GTX_URL}&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text.slice(0, MAX_CHARS))}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
      return data[0]
        .map((seg) => (Array.isArray(seg) ? seg[0] : ""))
        .join("")
        .trim() || null;
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.warn("GoogleTranslate falló:", error.message);
    return null;
  }
}

async function translateViaMyMemory(text, source, target) {
  try {
    const langPair = `${normalizeLang(source)}|${normalizeLang(target)}`;
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text.slice(0, 4500))}&langpair=${encodeURIComponent(langPair)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (!translated) return null;
      // MyMemory devuelve "NO QUERY SPECIFIED" / vacíos en fallos
      if (/NO QUERY|QUALITY|^QUERY/.test(translated)) return null;
      return translated.trim() || null;
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.warn("MyMemory falló:", error.message);
    return null;
  }
}

async function translateViaLibreTranslate(text, source, target) {
  for (let i = 0; i < LIBRETRANSLATE_INSTANCES.length; i++) {
    const instance = LIBRETRANSLATE_INSTANCES[i];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${instance}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text.slice(0, 4500),
          source,
          target,
          format: "text",
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.translatedText) return data.translatedText;
    } catch (error) {
      console.warn(`LibreTranslate ${instance} falló:`, error.message);
    }
  }
  return null;
}

function normalizeLang(code) {
  const safe = String(code || "auto").split("-")[0].toLowerCase();
  return safe === "auto" ? "en" : safe;
}

/**
 * Traduce varios textos de una vez.
 */
export async function translateBatch(texts, source = "auto", target = "en") {
  const results = await Promise.all(
    texts.map((text) => translateText(text, source, target)),
  );
  return results;
}

/**
 * Detecta el idioma de un texto usando Google Translate.
 * Devuelve el código ISO del idioma detectado (ej. "es", "en", "pt").
 */
export async function detectLanguage(text) {
  if (!text || typeof text !== "string") return "es";
  try {
    const url = `${GOOGLE_GTX_URL}&sl=auto&tl=es&dt=t&q=${encodeURIComponent(text.slice(0, 500))}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return "es";
      const data = await res.json();
      const detected = data?.[2]; // el tercer elemento de gtx es el idioma detectado
      if (detected && typeof detected === "string") {
        return detected.split("-")[0].toLowerCase();
      }
      return "es";
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.warn("detectLanguage falló:", error.message);
    return "es";
  }
}
