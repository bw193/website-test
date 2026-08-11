import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

export default function Footer() {
  const { lp } = useLocalizedPath();
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png"
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
              Jiaxing Chengtai Mirror Co., Ltd.<br/>
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
                <a href="mailto:bolen2@cnjxctm.com" className="hover:text-white transition-colors">bolen2@cnjxctm.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+8618058603602" className="hover:text-white transition-colors">+86 18058603602</a>
              </li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Jiaxing, Zhejiang, China</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-amber-500">{t('footer.quickLinks', 'Quick Links')}</h3>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li><Link to={lp('/products')} className="hover:text-white transition-colors">{t('navbar.catalog', 'Product Catalog')}</Link></li>
              <li><Link to={lp('/our-story')} className="hover:text-white transition-colors">{t('navbar.ourStory', 'Our Story')}</Link></li>
              <li><Link to={lp('/blog')} className="hover:text-white transition-colors">{t('navbar.blog', 'Journal')}</Link></li>
              <li><Link to={lp('/videos')} className="hover:text-white transition-colors">{t('navbar.videos', 'Videos')}</Link></li>
              <li><Link to={lp('/rfq')} className="hover:text-white transition-colors">{t('blog.ctaQuote', 'Request a quote')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-500">
          <p>
            &copy; {new Date().getFullYear()} Jiaxing Chengtai Mirror Co., Ltd. (Brand: BOLEN). {t('footer.rights', 'All rights reserved.')}
          </p>
          {/* Moved out of the public header, where it sat beside the nav links
              and gave an internal staff entry point the same prominence as the
              RFQ call to action. */}
          <Link to="/admin/login" className="text-stone-600 hover:text-stone-400 transition-colors">
            {t('navbar.employeeLogin')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
