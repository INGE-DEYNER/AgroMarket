/**
 * Hook para traducción automática con fallback a API gratuita.
 * 
 * Este hook extiende el sistema i18n existente para agregar traducción
 * automática usando LibreTranslate (100% gratuito) cuando una clave
 * de traducción no existe en los archivos locales.
 * 
 * Flujo:
 * 1. Busca la traducción en los archivos locales (es.json, en.json, etc.)
 * 2. Si no existe, busca en la caché local
 * 3. Si no está en caché, traduce automáticamente vía LibreTranslate
 * 4. Guarda la traducción en caché para uso futuro
 */

import { useTranslation } from 'react-i18next';
import { translateText } from '@/infrastructure/translation/translationApi';
import { getCachedTranslation, setCachedTranslation } from '@/infrastructure/translation/translationCache';

export function useAutoTranslation() {
  const { t, i18n } = useTranslation();

  /**
   * Traduce una clave con fallback automático.
   * 
   * @param key Clave de traducción
   * @param defaultValue Valor por defecto si no existe traducción
   * @param options Opciones de interpolación
   * @returns Texto traducido
   */
  const autoT = async (key, defaultValue, options = {}) => {
    // 1. Intentar obtener la traducción local
    const localTranslation = t(key, { ...options, defaultValue: undefined });
    
    // Si existe traducción local, usarla
    if (localTranslation && localTranslation !== key) {
      return localTranslation;
    }

    // 2. Si no hay valor por defecto, retornar la clave
    if (!defaultValue) {
      return key;
    }

    // 3. Obtener el idioma actual
    const currentLang = i18n.resolvedLanguage || i18n.language || 'es';
    
    // Si el idioma es español (idioma base), retornar el valor por defecto
    if (currentLang.startsWith('es')) {
      return defaultValue;
    }

    // 4. Buscar en caché
    const cached = getCachedTranslation(defaultValue, 'es', currentLang.split('-')[0]);
    if (cached) {
      return cached;
    }

    // 5. Traducir automáticamente
    try {
      const translated = await translateText(defaultValue, 'es', currentLang.split('-')[0]);
      
      // Guardar en caché
      if (translated && translated !== defaultValue) {
        setCachedTranslation(defaultValue, 'es', currentLang.split('-')[0], translated);
      }
      
      return translated;
    } catch (error) {
      console.warn('Error en traducción automática:', error);
      return defaultValue;
    }
  };

  /**
   * Versión síncrona que usa caché local (no hace llamadas API).
   * Útil para renderizado inicial.
   */
  const autoTSync = (key, defaultValue, options = {}) => {
    // 1. Intentar obtener la traducción local
    const localTranslation = t(key, { ...options, defaultValue: undefined });
    
    if (localTranslation && localTranslation !== key) {
      return localTranslation;
    }

    if (!defaultValue) {
      return key;
    }

    const currentLang = i18n.resolvedLanguage || i18n.language || 'es';
    
    if (currentLang.startsWith('es')) {
      return defaultValue;
    }

    // 2. Buscar en caché síncronamente
    const cached = getCachedTranslation(defaultValue, 'es', currentLang.split('-')[0]);
    if (cached) {
      return cached;
    }

    // 3. Si no está en caché, retornar el valor por defecto
    //    (la traducción asíncrona se ejecutará después)
    return defaultValue;
  };

  return {
    autoT,
    autoTSync,
    t,
    i18n,
  };
}

export default useAutoTranslation;
