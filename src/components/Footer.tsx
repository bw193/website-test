import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { getLocalizedSeoLandingPages, getSeoSolutionsUi } from '../data/seoLandingI18n';
import { INSIGHTS_PATH } from '../data/insights';
import { CATALOG_CATEGORIES, catalogCategoryPath, uniqueCategorySlugs } from '../utils/catalogCategory';
import { localizedProductPathname } from '../utils/productRoutes';
import { toMediaPath } from '../utils/media';

const FOOTER_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
] as const;

export default function Footer() {
  const { lp, lang } = useLocalizedPath();
  const location = useLocation();
  const solutionsUi = getSeoSolutionsUi(lang);
  const { t } = useTranslation();
  const footerSolutions = getLocalizedSeoLandingPages(lang).filter((page) =>
    ['led-bathroom-mirror-manufacturer', 'oem-odm-mirror-manufacturing', 'hotel-bathroom-mirrors'].includes(page.slug)
  );

  const languageHref = (code: string) => {
    const productPath = localizedProductPathname(location.pathname, code);
    if (productPath) return `${productPath}${location.search}${location.hash}`;
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    const suffix = !pathWithoutLang || pathWithoutLang === '/'
      ? '/'
      : pathWithoutLang.endsWith('/')
        ? pathWithoutLang
        : `${pathWithoutLang}/`;
    return `/${code}${suffix}${location.search}${location.hash}`;
  };

  return (
    <footer className="border-t border-stone-800/80 bg-stone-950 text-white">
      <div className="max-w-7xl mx-auto pt-14 pb-20 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={toMediaPath('https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png')}
                alt=""
                aria-hidden="true"
                className="h-8 w-8 object-contain"
                width="32"
                height="32"
                loading="lazy"
              />
              <span className="font-bold text-xl text-white tracking-wide">BOLEN</span>
            </div>
            <p className="text-stone-400 text-sm">
              {t('home.companyName', 'Jiaxing Chengtai Mirror Co., Ltd.')}<br/>
              {t(
                'footer.description',
                'Premium mirror manufacturer and exporter. Supplying high-quality, modern vanity mirrors to businesses worldwide.'
              )}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-amber-500">{t('footer.contact', 'Contact')}</h3>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:sales@bolenmirror.com" className="hover:text-white transition-colors">sales@bolenmirror.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+8618058603602" className="hover:text-white transition-colors">+86 18058603602</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {t(
                    'footer.address',
                    'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China'
                  )}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-amber-500">{t('navbar.catalog', 'Product Catalog')}</h3>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li><Link to={lp('/products')} className="hover:text-white transition-colors">{t('products.allCategories', 'All Categories')}</Link></li>
              {/* The live, build-time category list — not DEFAULT_PRODUCT_CATEGORIES,
                  which linked every page to the removed "New Arrival" category
                  (a soft 404) and omitted "Mirror Cabinet". */}
              {uniqueCategorySlugs(CATALOG_CATEGORIES).map(({ name, slug }) => (
                <li key={slug}>
                  <Link to={lp(catalogCategoryPath(name))} className="hover:text-white transition-colors">
                    {t(`products.categories.${name}`, name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-amber-500">{t('footer.quickLinks', 'Quick Links')}</h3>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li><Link to={lp('/solutions')} className="hover:text-white transition-colors">{solutionsUi.footerLabel}</Link></li>
              {footerSolutions.map((page) => (
                <li key={page.slug}>
                  <Link to={lp(`/solutions/${page.slug}`)} className="hover:text-white transition-colors">
                    {page.footerAnchor || page.shortTitle || page.h1}
                  </Link>
                </li>
              ))}
              <li><Link to={lp('/our-story')} className="hover:text-white transition-colors">{t('navbar.ourStory', 'Our Story')}</Link></li>
              <li><Link to={lp(INSIGHTS_PATH)} className="hover:text-white transition-colors">{t('navbar.blog', 'Insights')}</Link></li>
              <li><Link to={lp('/videos')} className="hover:text-white transition-colors">{t('navbar.videos', 'Videos')}</Link></li>
              <li><Link to={lp('/rfq')} className="hover:text-white transition-colors">{t('blog.ctaQuote', 'Contact Sales')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-stone-800/90 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-500 sm:pr-40">
          <p>
            &copy; {new Date().getFullYear()} {t('home.companyName', 'Jiaxing Chengtai Mirror Co., Ltd.')} (BOLEN). {t('footer.rights', 'All rights reserved.')}
          </p>
          {/* Moved out of the public header, where it sat beside the nav links
              and gave an internal staff entry point the same prominence as the
              RFQ call to action. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <nav aria-label={t('footer.languagesLabel', 'Languages')} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {FOOTER_LANGUAGES.map((item) => (
                <Link
                  key={item.code}
                  to={languageHref(item.code)}
                  hrefLang={item.code}
                  className={
                    item.code === lang
                      ? 'text-stone-300 font-medium'
                      : 'text-stone-500 hover:text-white transition-colors'
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <span className="text-stone-700" aria-hidden="true">|</span>
            <Link to={lp('/privacy-policy')} className="text-stone-500 hover:text-white transition-colors">
              {t('footer.privacy', 'Privacy Policy')}
            </Link>
            <Link to={lp('/terms-and-conditions')} className="text-stone-500 hover:text-white transition-colors">
              {t('footer.terms', 'Terms and Conditions')}
            </Link>
            <Link to="/admin/login" rel="nofollow" className="text-stone-600 hover:text-stone-400 transition-colors">
              {t('navbar.employeeLogin')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
