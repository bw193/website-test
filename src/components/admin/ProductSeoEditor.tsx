import { useEffect, useState } from 'react';
import { Globe2, Loader2, RotateCcw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n, { loadLanguageResources } from '../../i18n';
import { loadProductTranslations, overlayProduct } from '../../utils/productI18n';
import { polishEnglishProductTitle } from '../../utils/productCopy';
import {
  PRODUCT_SEO_LANGUAGES,
  getProductSeoLengthRecommendation,
  resolveProductSeo,
  type ProductSeoField,
  type ProductSeoFields,
  type ProductSeoLanguage,
  type ProductSeoMetadata,
} from '../../utils/productSeo';
import { productDetailPath } from '../../utils/productRoutes';

const LANGUAGE_NAMES: Record<ProductSeoLanguage, string> = {
  en: 'English', zh: '中文', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano',
};
const SEO_FIELDS: ProductSeoField[] = ['title', 'description', 'h1'];

interface Props {
  product: Pick<ProductSeoFields, 'title' | 'description' | 'details'> & { id?: string; category?: string };
  value: ProductSeoMetadata;
  onChange: (value: ProductSeoMetadata) => void;
  disabled?: boolean;
}

export default function ProductSeoEditor({ product, value, onChange, disabled = false }: Props) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<ProductSeoLanguage>('en');
  const [readyLanguage, setReadyLanguage] = useState<ProductSeoLanguage>('en');
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    Promise.all([loadLanguageResources(language), loadProductTranslations(language)])
      .then(() => { if (!cancelled) setReadyLanguage(language); })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, [language, retry]);

  const translated = overlayProduct(product, language);
  const display = {
    ...translated,
    title: language === 'en' ? polishEnglishProductTitle(translated.title) : translated.title,
  };
  const languageT = i18n.getFixedT(language);
  const fallback = {
    titleSuffix: languageT('productDetail.brandSuffix'),
    descriptionTemplate: languageT('productDetail.descTemplate'),
  };
  const defaults = resolveProductSeo(display, language, fallback);
  const effective = resolveProductSeo({ ...display, seo: value }, language, fallback);
  const overrides = value?.[language] || {};
  const ready = readyLanguage === language && !loadError;
  const productUrl = `https://bolenmirror.com/${language}${productDetailPath(product, language)}/`;

  const updateField = (field: ProductSeoField, text: string) => {
    onChange({ ...value, [language]: { ...overrides, [field]: text } });
  };
  const restoreDefaults = () => {
    const next = { ...value };
    delete next[language];
    onChange(next);
  };

  return (
    <section aria-labelledby="product-seo-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 bg-stone-50/50 px-6 py-5">
        <h2 id="product-seo-heading" className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <Search className="h-4 w-4 text-amber-600" aria-hidden="true" />
          {t('admin.productForm.seo.heading')}
        </h2>
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-stone-400" aria-hidden="true" />
          <label htmlFor="product-seo-language" className="text-sm text-stone-600">
            {t('admin.productForm.seo.language')}
          </label>
          <select
            id="product-seo-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as ProductSeoLanguage)}
            disabled={disabled}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500"
          >
            {PRODUCT_SEO_LANGUAGES.map((lang) => <option key={lang} value={lang}>{LANGUAGE_NAMES[lang]}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <p className="text-sm leading-relaxed text-stone-500">{t('admin.productForm.seo.help')}</p>
        {!ready ? (
          <div role={loadError ? 'alert' : 'status'} className="flex items-center gap-2 py-8 text-sm text-stone-600">
            {loadError ? (
              <>
                {t('admin.productForm.seo.loadError')}
                <button type="button" onClick={() => setRetry((count) => count + 1)} className="font-medium underline">
                  {t('admin.productForm.seo.retry')}
                </button>
              </>
            ) : <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t('admin.productForm.seo.loading')}</>}
          </div>
        ) : (
          <>
            {SEO_FIELDS.map((field) => {
              const text = overrides[field] ?? defaults[field];
              const custom = Boolean(overrides[field]?.trim());
              const fieldId = `product-seo-${field}`;
              const recommendation = getProductSeoLengthRecommendation(field, language);
              return (
                <div key={`${language}-${field}`}>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor={fieldId} className="text-sm font-medium text-stone-700">
                      {t(`admin.productForm.seo.${field}`)}
                    </label>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${custom ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                      {t(`admin.productForm.seo.${custom ? 'custom' : 'automatic'}`)}
                    </span>
                  </div>
                  <textarea
                    id={fieldId}
                    lang={language}
                    value={text}
                    onChange={(event) => updateField(field, event.target.value)}
                    rows={field === 'description' ? 3 : 2}
                    disabled={disabled}
                    aria-describedby={`${fieldId}-help`}
                    className="block w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm leading-relaxed text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 disabled:opacity-60"
                  />
                  <div id={`${fieldId}-help`} className="mt-1.5 flex flex-wrap justify-between gap-2 text-xs leading-relaxed text-stone-500">
                    <span>{t(`admin.productForm.seo.${field}Help`)}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="whitespace-nowrap">{t('admin.productForm.seo.characterCount', { count: Array.from(text).length })}</span>
                      <span className="whitespace-nowrap rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                        {t('admin.productForm.seo.recommendedLength', { ...recommendation })}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}

            <p className="text-xs leading-relaxed text-stone-500">{t('admin.productForm.seo.lengthGuidance')}</p>

            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4" aria-label={t('admin.productForm.seo.preview')}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">{t('admin.productForm.seo.preview')}</p>
              <p className="break-all text-xs text-stone-500">{product.title ? productUrl : 'bolenmirror.com'}</p>
              <p lang={language} data-seo-preview="title" className="mt-1 break-words text-lg leading-snug text-blue-800">{effective.title}</p>
              <p lang={language} data-seo-preview="description" className="mt-2 break-words text-sm leading-relaxed text-stone-600">{effective.description}</p>
              <p className="mt-3 border-t border-stone-200 pt-3 text-sm text-stone-600">
                <span className="font-medium">H1: </span><span lang={language} data-seo-preview="h1">{effective.h1}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={restoreDefaults}
              disabled={disabled || Object.keys(overrides).length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />{t('admin.productForm.seo.restore')}
            </button>
          </>
        )}
        <p className="text-xs leading-relaxed text-stone-500">{t('admin.productForm.seo.publishHelp')}</p>
      </div>
    </section>
  );
}
