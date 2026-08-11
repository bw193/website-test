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
    if (i18n.language.split('-')[0] === code) {
      await i18n.changeLanguage(code);
    }
  }
};

/**
 * Resolves once the language for the CURRENT url is usable.
 *
 * i18n.init() only seeds `en`, so on a /de/ route every t() call falls back to
 * English until the de bundle lands. Combined with createRoot clearing the
 * prerendered (correctly-localized) markup, that produced a visible
 * German → English → German flash on 5 of the 6 locales. main.tsx awaits this
 * before the first render; it resolves synchronously for English.
 */
export const initialLanguageReady: Promise<void> = loadLanguage(i18n.language).catch(() => {
  // A failed locale chunk must not block the app — English is already loaded
  // and fallbackLng will cover it.
});

// Load on language change
i18n.on('languageChanged', loadLanguage);

export default i18n;
