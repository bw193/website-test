import { lazy, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../hooks/useLocalizedPath';

const NotFound = lazy(() => import('../pages/NotFound'));

export default function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const isValidLang = !!lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);

  useEffect(() => {
    if (isValidLang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n, isValidLang]);

  if (!isValidLang) {
    return <NotFound />;
  }

  return <Outlet />;
}
