import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { getCachedTranslation, setCachedTranslation } from "@/infrastructure/translation/translationCache";
import { translateText } from "@/infrastructure/translation/translationApi";

import es from "@/i18n/locales/es";
import en from "@/i18n/locales/en";
import pt from "@/i18n/locales/pt";
import fr from "@/i18n/locales/fr";
import de from "@/i18n/locales/de";
import zh from "@/i18n/locales/zh";
import ar from "@/i18n/locales/ar";

const resources = {
  es: {
    translation: es,
  },
  en: {
    translation: en,
  },
  pt: {
    translation: pt,
  },
  fr: {
    translation: fr,
  },
  de: {
    translation: de,
  },
  zh: {
    translation: zh,
  },
  ar: {
    translation: ar,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    // Idioma inicial
    fallbackLng: "es",

    // Idiomas realmente soportados
    supportedLngs: ["es", "en", "pt", "fr", "de", "zh", "ar"],

    // Convierte es-CO, es-MX, en-US, etc. a es, en, etc.
    load: "languageOnly",

    // Evita problemas con códigos regionales
    cleanCode: true,

    // No mostrar suspense mientras cambia idioma
    react: {
      useSuspense: false,
    },

    interpolation: {
      escapeValue: false,
    },

    // Si una clave de traducción falta en TODOS los idiomas, se intenta
    // traducir por LibreTranslate en tiempo real (100% gratis, con caché).
    // Se desactiva saveMissingPlurals/updateMissing para no romper el render.
    saveMissing: true,
    updateMissing: true,
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      const text = fallbackValue && fallbackValue !== key ? fallbackValue : key;
      // No traducir claves técnicas (IDs, rutas, etc.).
      if (!text || text.length < 2 || /^[a-z0-9_.-]+$/i.test(text) && text === key) {
        return;
      }
      const target = String(Array.isArray(lngs) ? lngs[0] : lngs || "en").split("-")[0].toLowerCase();
      if (target === "es") return;
      (async () => {
        try {
          const cached = getCachedTranslation(text, "es", target);
          if (cached) {
            i18n.addResource(target, "translation", key, cached);
            return;
          }
          const translated = await translateText(text, "es", target);
          if (translated && translated !== text) {
            setCachedTranslation(text, "es", target, translated);
            i18n.addResource(target, "translation", key, translated);
          }
        } catch (e) {
          console.warn("AutoTranslate falló:", e?.message);
        }
      })();
    },

    detection: {
      // Primero recuerda la elección del usuario
      order: ["localStorage", "navigator", "htmlTag"],

      // Guarda automáticamente la selección
      caches: ["localStorage"],

      // Nombre de la clave en localStorage
      lookupLocalStorage: "i18nextLng",
    },
  })
  .then(() => {
    document.documentElement.lang =
      i18n.resolvedLanguage || i18n.language || "es";
  })
  .catch((error) => {
    console.error("Error inicializando i18n:", error);
  });

// Actualiza el atributo lang del HTML cada vez que cambia el idioma
i18n.on("languageChanged", (language) => {
  const normalized = (language || "es").split("-")[0].toLowerCase();
  document.documentElement.lang = normalized;
  document.documentElement.dir = normalized === "ar" ? "rtl" : "ltr";
});

export default i18n;
