import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from '@/i18n/locales/es';
import en from '@/i18n/locales/en';
import pt from '@/i18n/locales/pt';
import fr from '@/i18n/locales/fr';
import de from '@/i18n/locales/de';
import zh from '@/i18n/locales/zh';
import ar from '@/i18n/locales/ar';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt },
      fr: { translation: fr },
      de: { translation: de },
      zh: { translation: zh },
      ar: { translation: ar },
    },
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  });

export default i18n;


