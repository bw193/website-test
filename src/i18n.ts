import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';

const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];

const localeLoaders: Record<string, () => Promise<{ [key: string]: any }>> = {
  zh: () => import('./locales/zh').then(m => m.zh),
  es: () => import('./locales/es').then(m => m.es),
  fr: () => import('./locales/fr').then(m => m.fr),
  de: () => import('./locales/de').then(m => m.de),
  it: () => import('./locales/it').then(m => m.it),
};

// Detect language from URL path (e.g., /zh/products → zh)
function detectLangFromUrl(): string {
  const firstSegment = window.location.pathname.split('/')[1];
  return SUPPORTED_LANGUAGES.includes(firstSegment) ? firstSegment : 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
    },
    lng: detectLangFromUrl(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Lazy-load non-English language bundles
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
