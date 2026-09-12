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

const FALLBACK_INSTANCES = [
  "https://translate.terraprint.co",
  "https://lt.vern.cc",
  "https://translate.fedilab.app",
  "https://trans.zillyhuhn.com",
];

let currentInstanceIndex = 0;

/**
 * Traduce un texto usando la API de LibreTranslate.
 * Si la instancia actual falla, intenta con la siguiente.
 */
export async function translateText(text, source = "auto", target = "en") {
  if (!text || typeof text !== "string") {
    return text;
  }

  // Intentar con cada instancia hasta que una funcione
  for (let i = 0; i < FALLBACK_INSTANCES.length; i++) {
    const instance =
      FALLBACK_INSTANCES[
        (currentInstanceIndex + i) % FALLBACK_INSTANCES.length
      ];

    try {
      const response = await fetch(`${instance}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: source,
          target: target,
          format: "text",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar la instancia actual para futuras peticiones
        currentInstanceIndex =
          (currentInstanceIndex + i) % FALLBACK_INSTANCES.length;
        return data.translatedText || text;
      }
    } catch (error) {
      console.warn(`Instancia ${instance} falló:`, error.message);
    }
  }

  // Si todas las instancias fallan, devolver el texto original
  console.error("Todas las instancias de LibreTranslate fallaron");
  return text;
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
 * Detecta el idioma de un texto.
 */
export async function detectLanguage(text) {
  for (let i = 0; i < FALLBACK_INSTANCES.length; i++) {
    const instance =
      FALLBACK_INSTANCES[
        (currentInstanceIndex + i) % FALLBACK_INSTANCES.length
      ];

    try {
      const response = await fetch(`${instance}/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.language || "es";
      }
    } catch (error) {
      console.warn(`Instancia ${instance} falló:`, error.message);
    }
  }

  return "es";
}
