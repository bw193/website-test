import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { optimizeImage, imageSrcSet } from '../utils/optimizeImage';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { toSlug } from '../utils/slug';
import { useProductTranslator } from '../utils/productI18n';
import { polishEnglishProductTitle } from '../utils/productCopy';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
  priceRange?: string;
  msrp?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, description, image, category, priceRange, msrp }) => {
  const { t } = useTranslation();
  const { lp, lang } = useLocalizedPath();
  const translate = useProductTranslator(lang);
  const formatPrice = (val?: string) => {
    if (!val) return '';
    return val.startsWith('$') ? val : `$${val}`;
  };

  // Slug stays derived from the English title (prop); only display is localized.
  const productUrl = lp(`/products/${toSlug(title)}`);
  const d = translate({ id, title, description });
  const translatedTitle = d.title ?? title;
  const displayTitle = lang === 'en' ? polishEnglishProductTitle(translatedTitle) : translatedTitle;
  const displayDescription = d.description ?? description;
  const sourceDescription = description?.trim() || '';
  // Most legacy rows store the model code in `description`. Keep that value
  // visible and pass it into the RFQ, but do not present it as if it were buyer
  // copy. The database value remains untouched.
  const embeddedModel =
    sourceDescription.match(/[a-z]{2,}[a-z0-9._/\-]*\d[a-z0-9._/\-]*/i)?.[0] || '';
  const isModelLikeDescription =
    (Boolean(embeddedModel) && sourceDescription.length <= 60) ||
    (sourceDescription.length <= 30 &&
      sourceDescription.split(/\s+/).length <= 3 &&
      /^(?=.*\d)[a-z0-9][a-z0-9._/\- ]+$/i.test(sourceDescription));
  const modelNumber = isModelLikeDescription ? embeddedModel || sourceDescription : '';
  const localizedDescriptionLength = displayDescription?.trim().length || 0;
  const hasBuyerDescription =
    localizedDescriptionLength >= 60 ||
    (localizedDescriptionLength >= 30 && !isModelLikeDescription);
  const buyerDescription = hasBuyerDescription
    ? displayDescription.trim()
    : t(
        'home.collections.oem.desc',
        'Custom sizes, materials, functions, branding, and packaging are available for OEM/ODM orders.'
      );
  const quoteParams = new URLSearchParams({
    product: displayTitle,
    model: modelNumber,
  });
  const quoteUrl = `${lp('/rfq')}?${quoteParams.toString()}`;

  return (
    <article className="group bg-white rounded-2xl flex flex-col h-full overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 relative">

        {/* Image links to details, while the separate RFQ action stays directly actionable. */}
        <Link
          to={productUrl}
          aria-label={`${t('products.viewDetails')}: ${displayTitle}`}
          className="relative block aspect-square overflow-hidden bg-stone-100"
        >
          <img
            src={optimizeImage(image, { width: 400 }) || PRODUCT_IMAGE_PLACEHOLDER}
            srcSet={imageSrcSet(image, [300, 400, 600])}
            onError={handleImageError}
            alt={displayTitle}
            className="w-full h-full object-center object-contain transition-transform duration-700 group-hover:scale-105"
            width="400"
            height="500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/0 to-stone-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Quick View Button (appears on hover) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-white/90 backdrop-blur-sm text-stone-900 text-sm font-medium px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
              {t('products.viewDetails')} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Content Container */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            {category && (
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">
                {t(`products.categories.${category}`, category)}
              </span>
            )}
            {modelNumber && (
              <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                {modelNumber}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-stone-900 leading-tight mb-2 line-clamp-2">
            <Link to={productUrl} className="hover:text-amber-600 transition-colors">
              {displayTitle}
            </Link>
          </h3>

          <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
            {buyerDescription}
          </p>
          
          {(priceRange || msrp) && (
            <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
              <div>
                {priceRange && (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                      {t('products.priceRangeLabel', 'Indicative factory range')}
                    </p>
                    <div className="text-xl font-extrabold text-stone-900">
                      {formatPrice(priceRange)}
                    </div>
                  </>
                )}
                {msrp && (
                  <div className="text-xs text-stone-400 line-through mt-0.5">
                    {t('products.msrp')}: {formatPrice(msrp)}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-100 pt-4">
            <Link
              to={productUrl}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-3 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-900"
            >
              {t('products.viewDetails')}
            </Link>
            <Link
              to={quoteUrl}
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-3 py-2.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-400"
            >
              {t('blog.ctaQuote', 'Request a quote')}
            </Link>
          </div>
        </div>
    </article>
  );
};

export default ProductCard;
