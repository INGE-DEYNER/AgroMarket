/**
 * Caché local para traducciones automáticas.
 * 
 * Las traducciones se guardan en localStorage para evitar
 * llamadas repetidas a la API y funcionar offline.
 */

const CACHE_PREFIX = 'translation_cache_';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 días

/**
 * Genera una clave de caché para una traducción.
 */
function getCacheKey(text, source, target) {
  const hash = btoa(unescape(encodeURIComponent(`${text}-${source}-${target}`)));
  return `${CACHE_PREFIX}${hash}`;
}

/**
 * Obtiene una traducción de la caché.
 */
export function getCachedTranslation(text, source, target) {
  try {
    const key = getCacheKey(text, source, target);
    const cached = localStorage.getItem(key);

    if (cached) {
      const { translation, timestamp } = JSON.parse(cached);
      
      // Verificar si la caché ha expirado
      if (Date.now() - timestamp < CACHE_DURATION) {
        return translation;
      }
    }
  } catch (error) {
    console.warn('Error leyendo caché de traducción:', error);
  }

  return null;
}

/**
 * Guarda una traducción en la caché.
 */
export function setCachedTranslation(text, source, target, translation) {
  try {
    const key = getCacheKey(text, source, target);
    const data = {
      translation,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Error guardando traducción en caché:', error);
  }
}

/**
 * Limpia la caché de traducciones.
 */
export function clearTranslationCache() {
  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(CACHE_PREFIX)
    );
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error limpiando caché de traducción:', error);
  }
}

/**
 * Obtiene estadísticas de la caché.
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(CACHE_PREFIX)
    );
    return {
      count: keys.length,
      size: keys.reduce((acc, key) => acc + (localStorage.getItem(key)?.length || 0), 0),
    };
  } catch (error) {
    return { count: 0, size: 0 };
  }
}
