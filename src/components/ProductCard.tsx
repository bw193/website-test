import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { optimizeImage, imageSrcSet } from '../utils/optimizeImage';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { productDetailPath } from '../utils/productRoutes';
import { catalogCategoryPath } from '../utils/catalogCategory';
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
  buyerSummary?: string;
  displayTitleOverride?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  description,
  image,
  category,
  priceRange,
  msrp,
  displayTitleOverride,
}) => {
  const { t } = useTranslation();
  const { lp, lang } = useLocalizedPath();
  const translate = useProductTranslator(lang);
  const formatPrice = (val?: string) => {
    if (!val) return '';
    return val.startsWith('$') ? val : `$${val}`;
  };

  const productUrl = lp(productDetailPath({ id, title, category }, lang));
  const d = translate({ id, title, description });
  const translatedTitle = d.title ?? title;
  const displayTitle = displayTitleOverride || (lang === 'en' ? polishEnglishProductTitle(translatedTitle) : translatedTitle);
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
  const quoteParams = new URLSearchParams({
    product: displayTitle,
    model: modelNumber,
  });
  const quoteUrl = `${lp('/rfq')}?${quoteParams.toString()}`;

  return (
    <article className="group flex h-full flex-col">
      <Link
        to={productUrl}
        aria-label={`${t('products.viewDetails')}: ${displayTitle}`}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-stone-100"
      >
        <img
          src={optimizeImage(image, { width: 400 }) || PRODUCT_IMAGE_PLACEHOLDER}
          srcSet={imageSrcSet(image, [300, 400, 600])}
          onError={handleImageError}
          alt={displayTitle}
          className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
          width="400"
          height="400"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          {category ? (
            <Link
              to={lp(catalogCategoryPath(category))}
              className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 hover:text-amber-800"
            >
              {t(`products.categories.${category}`, category)}
            </Link>
          ) : (
            <span />
          )}
          {modelNumber && (
            <span className="truncate text-[11px] font-medium tracking-wide text-stone-400">
              {modelNumber}
            </span>
          )}
        </div>

        <h3 className="font-serif text-[1.35rem] leading-snug text-stone-900 transition-colors group-hover:text-amber-800">
          <Link to={productUrl} className="line-clamp-2">
            {displayTitle}
          </Link>
        </h3>

        <div className="mt-auto pt-4">
          {(priceRange || msrp) && (
            <div className="mb-4">
              {priceRange && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    {t('products.priceRangeLabel', 'Indicative factory range')}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-stone-900">
                    {formatPrice(priceRange)}
                  </p>
                </>
              )}
              {msrp && (
                <p className="mt-0.5 text-xs text-stone-400">
                  {t('products.msrp')}: {formatPrice(msrp)}
                </p>
              )}
            </div>
          )}
          <Link to={quoteUrl} className="btn-primary w-full whitespace-nowrap">
            {t('blog.ctaQuote', 'Contact Sales')}
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
