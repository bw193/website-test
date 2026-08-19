import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';

const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];

export const ADMIN_LANG_STORAGE_KEY = 'bolen-admin-lang';
export const ADMIN_UI_LANGUAGES = ['en', 'zh'] as const;
export type AdminUiLanguage = (typeof ADMIN_UI_LANGUAGES)[number];

const localeLoaders: Record<string, () => Promise<{ [key: string]: any }>> = {
  zh: () => import('./locales/zh').then(m => m.zh),
  es: () => import('./locales/es').then(m => m.es),
  fr: () => import('./locales/fr').then(m => m.fr),
  de: () => import('./locales/de').then(m => m.de),
  it: () => import('./locales/it').then(m => m.it),
};

export function getStoredAdminLang(): AdminUiLanguage | null {
  try {
    const code = localStorage.getItem(ADMIN_LANG_STORAGE_KEY)?.split('-')[0];
    if (code === 'en' || code === 'zh') return code;
  } catch {
    // Private mode / blocked storage
  }
  return null;
}

// Detect language from URL path (e.g., /zh/products → zh).
// Admin routes have no language prefix, so honor the staff language persisted
// by the employee-portal switcher instead of forcing English.
function detectInitialLanguage(): string {
  const firstSegment = window.location.pathname.split('/')[1];
  if (SUPPORTED_LANGUAGES.includes(firstSegment)) return firstSegment;
  if (firstSegment === 'admin') {
    return getStoredAdminLang() || 'zh';
  }
  return 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
    },
    lng: detectInitialLanguage(),
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
 * Loads a locale bundle if needed, then switches i18n to it.
 * Used by the employee portal so Chinese is available before the first t() paint.
 */
export async function ensureLanguage(lng: string) {
  const code = lng.split('-')[0];
  if (code !== 'en' && localeLoaders[code] && !i18n.hasResourceBundle(code, 'translation')) {
    const resources = await localeLoaders[code]();
    i18n.addResourceBundle(code, 'translation', resources.translation, true, true);
  }
  if (i18n.language.split('-')[0] !== code) {
    await i18n.changeLanguage(code);
  }
}

export async function setAdminLanguage(lng: AdminUiLanguage) {
  try {
    localStorage.setItem(ADMIN_LANG_STORAGE_KEY, lng);
  } catch {
    // Private mode / blocked storage
  }
  await ensureLanguage(lng);
}

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
