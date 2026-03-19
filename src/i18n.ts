import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { zh } from './locales/zh';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { it } from './locales/it';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      zh,
      es,
      fr,
      de,
      it
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
