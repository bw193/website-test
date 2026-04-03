import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'zh', label: '中文', short: '中文' },
    { code: 'es', label: 'Español', short: 'ES' },
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'de', label: 'Deutsch', short: 'DE' },
    { code: 'it', label: 'Italiano', short: 'IT' }
  ];

  const currentLang = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png" alt="BOLEN Logo" className="h-10 w-auto" />
              <span className="font-bold text-xl text-stone-900 tracking-wide">BOLEN</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="text-stone-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-600 text-sm font-medium">
              {t('navbar.home')}
            </Link>
            <Link to="/products" className="text-stone-500 hover:text-stone-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-600 text-sm font-medium">
              {t('navbar.catalog')}
            </Link>
            <Link to="/our-story" className="text-stone-500 hover:text-stone-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-600 text-sm font-medium">
              {t('navbar.ourStory')}
            </Link>
            <Link to="/rfq" className="text-stone-500 hover:text-stone-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-600 text-sm font-medium">
              {t('productDetail.requestQuote')}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-amber-600 hover:text-amber-800 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-amber-600 text-sm font-medium">
                {t('navbar.adminDashboard')}
              </Link>
            )}
            {user ? (
              <button onClick={() => { logout(); navigate('/'); }} className="text-stone-500 hover:text-stone-900 text-sm font-medium">
                {t('navbar.logout')}
              </button>
            ) : (
              <Link to="/admin/login" className="text-stone-500 hover:text-stone-900 text-sm font-medium">
                {t('navbar.employeeLogin')}
              </Link>
            )}
            <div className="relative">
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)} 
                className="text-stone-500 hover:text-amber-600 flex items-center gap-1 text-sm font-medium transition-colors"
                title="Change Language"
              >
                <Globe className="h-4 w-4" />
                {currentLang.short}
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        currentLang.code === lang.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden gap-2">
            <div className="relative">
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)} 
                className="p-2 text-stone-400 hover:text-amber-600 flex items-center gap-1"
              >
                <Globe className="h-5 w-5" />
                <span className="text-xs font-medium">{currentLang.short}</span>
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        currentLang.code === lang.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-600">
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="bg-amber-50 border-amber-600 text-amber-700 block pl-3 pr-4 py-3 border-l-4 text-base font-medium">{t('navbar.home')}</Link>
            <Link to="/products" onClick={() => setIsOpen(false)} className="border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 block pl-3 pr-4 py-3 border-l-4 text-base font-medium">{t('navbar.catalog')}</Link>
            <Link to="/our-story" onClick={() => setIsOpen(false)} className="border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 block pl-3 pr-4 py-3 border-l-4 text-base font-medium">{t('navbar.ourStory')}</Link>
            <Link to="/rfq" onClick={() => setIsOpen(false)} className="border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 block pl-3 pr-4 py-3 border-l-4 text-base font-medium">{t('productDetail.requestQuote')}</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="border-transparent text-amber-600 hover:bg-amber-50 hover:border-amber-300 block pl-3 pr-4 py-3 border-l-4 text-base font-medium">{t('navbar.adminDashboard')}</Link>
            )}
            {user ? (
              <button onClick={() => { logout(); navigate('/'); setIsOpen(false); }} className="w-full text-left border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 block pl-3 pr-4 py-3 border-l-4 text-base font-medium">
                {t('navbar.logout')}
              </button>
            ) : (
              <Link to="/admin/login" onClick={() => setIsOpen(false)} className="border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 block pl-3 pr-4 py-3 border-l-4 text-base font-medium">
                {t('navbar.employeeLogin')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
