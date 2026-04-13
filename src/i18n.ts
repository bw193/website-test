import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';

const localeLoaders: Record<string, () => Promise<{ [key: string]: any }>> = {
  zh: () => import('./locales/zh').then(m => m.zh),
  es: () => import('./locales/es').then(m => m.es),
  fr: () => import('./locales/fr').then(m => m.fr),
  de: () => import('./locales/de').then(m => m.de),
  it: () => import('./locales/it').then(m => m.it),
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Load detected language bundle if not English
const loadLanguage = async (lng: string) => {
  const code = lng.split('-')[0];
  if (code !== 'en' && localeLoaders[code] && !i18n.hasResourceBundle(code, 'translation')) {
    const resources = await localeLoaders[code]();
    i18n.addResourceBundle(code, 'translation', resources.translation, true, true);
  }
};

// Load initial language
loadLanguage(i18n.language);

// Load on language change
i18n.on('languageChanged', loadLanguage);

export default i18n;
