import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { getSeoSolutionsUi } from '../data/seoLandingI18n';
import { INSIGHTS_PATH } from '../data/insights';

const LOGO_URL =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { lang, lp } = useLocalizedPath();
  const solutionsUi = getSeoSolutionsUi(lang);
  const navRef = React.useRef<HTMLElement>(null);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'zh', label: '中文', short: '中文' },
    { code: 'es', label: 'Español', short: 'ES' },
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'de', label: 'Deutsch', short: 'DE' },
    { code: 'it', label: 'Italiano', short: 'IT' }
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  const changeLanguage = (code: string) => {
    // Replace current language prefix in URL with new language
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    navigate(`/${code}${pathWithoutLang || '/'}`);
    setLangMenuOpen(false);
  };

  // Both menus are dismissible by Escape and by clicking outside. Previously
  // neither was: on a phone the language panel could only be closed by tapping
  // the globe again or navigating away.
  React.useEffect(() => {
    const closeAll = () => {
      setIsOpen(false);
      setLangMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) closeAll();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  // Stop the page scrolling behind the open mobile panel.
  React.useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Close both menus on navigation so they never persist across routes.
  React.useEffect(() => {
    setIsOpen(false);
    setLangMenuOpen(false);
  }, [location.pathname]);

  // Drives both the visual you-are-here cue and aria-current. The mobile panel
  // used to hardcode the active styling on Home, so every route claimed to be
  // the homepage.
  const isActive = (path: string) => {
    const current = location.pathname.replace(/\/$/, '');
    const target = lp(path).replace(/\/$/, '');
    if (path === '/products') {
      return current === target || current.startsWith(`${target}/category/`);
    }
    return current === target;
  };

  const navLinks = [
    { path: '/', label: t('navbar.home') },
    { path: '/products', label: t('navbar.catalog') },
    { path: '/solutions', label: solutionsUi.navLabel },
    { path: INSIGHTS_PATH, label: t('navbar.blog') },
    { path: '/videos', label: t('navbar.videos', 'Videos') },
    { path: '/our-story', label: t('navbar.ourStory') },
  ];

  const languageMenu = (
    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5" role="menu" aria-label="Language selection">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => changeLanguage(l.code)}
          role="menuitem"
          className={`block w-full text-left px-4 py-2 text-sm ${
            currentLang.code === l.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-stone-700 hover:bg-stone-50'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  return (
    <nav ref={navRef} className="bg-white shadow-sm sticky top-0 z-50" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={lp('/')} className="flex-shrink-0 flex items-center gap-2">
              <img src={LOGO_URL} alt="" aria-hidden="true" className="h-8 w-8 object-contain" width="32" height="32" />
              <span className="font-bold text-xl text-stone-900 tracking-wide">BOLEN</span>
            </Link>
            {/* Desktop nav switches on at lg (1024px), not sm (640px): six links
                plus the language switcher need ~830px in English and more in
                de/es/fr, so at sm the row used to wrap out of the h-16 bar. */}
            <div className="hidden lg:ml-10 lg:flex lg:items-center lg:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={lp(link.path)}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-stone-900 border-amber-600'
                      : 'text-stone-500 hover:text-stone-900 border-transparent hover:border-amber-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* The RFQ link is the site's only conversion action — it used to be
                styled identically to every other nav link (and to Employee
                Login), so the header carried no CTA at all. */}
            <Link
              to={lp('/rfq')}
              className="inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 whitespace-nowrap"
            >
              {t('productDetail.requestQuote')}
            </Link>
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="text-stone-500 hover:text-amber-600 flex items-center gap-1 text-sm font-medium transition-colors"
                title="Change Language"
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
                aria-label={t('navbar.changeLanguage', 'Change language')}
              >
                <Globe className="h-4 w-4" />
                {currentLang.short}
              </button>

              {langMenuOpen && languageMenu}
            </div>
          </div>
          <div className="-mr-2 flex items-center lg:hidden gap-2">
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2 text-stone-400 hover:text-amber-600 flex items-center gap-1"
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
                aria-label={t('navbar.changeLanguage', 'Change language')}
              >
                <Globe className="h-5 w-5" />
                <span className="text-xs font-medium">{currentLang.short}</span>
              </button>

              {langMenuOpen && languageMenu}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-600"
            >
              <span className="sr-only">{t('navbar.openMenu', 'Open main menu')}</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={lp(link.path)}
                onClick={() => setIsOpen(false)}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-amber-50 border-amber-600 text-amber-700'
                    : 'border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 pt-3">
              <Link
                to={lp('/rfq')}
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-amber-500 px-4 py-3 text-base font-semibold text-stone-950 hover:bg-amber-400"
              >
                {t('productDetail.requestQuote')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
