import { useLocation } from 'react-router-dom';

export const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function useCurrentLang(): SupportedLanguage {
  const { pathname } = useLocation();
  const firstSegment = pathname.split('/')[1];
  return SUPPORTED_LANGUAGES.includes(firstSegment as SupportedLanguage)
    ? (firstSegment as SupportedLanguage)
    : DEFAULT_LANGUAGE;
}

export function useLocalizedPath() {
  const lang = useCurrentLang();
  const lp = (path: string) => `/${lang}${path.startsWith('/') ? path : '/' + path}`;
  return { lang, lp };
}
