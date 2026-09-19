import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import es from "@/i18n/locales/es.json";
import en from "@/i18n/locales/en.json";

const resources = {
  es: {
    translation: es,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    // Idioma inicial
    fallbackLng: "es",

    // Idiomas realmente soportados: español e inglés.
    // El resto de idiomas están marcados como "Próximamente" en el selector.
    supportedLngs: ["es", "en"],

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
  document.documentElement.dir = "ltr";
});

export default i18n;
