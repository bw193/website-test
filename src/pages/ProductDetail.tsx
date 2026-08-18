import { m, AnimatePresence } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Send, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Markdown from '../components/Markdown';
import SEO from '../components/SEO';
import { buildProductDescription, buildProductSeoTitle, normalizeSpecs } from '../utils/productSeo';
import VideoCard from '../components/VideoCard';
import { optimizeImage } from '../utils/optimizeImage';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialProduct } from '../utils/prerenderData';
import { toSlug, parseProductParam } from '../utils/slug';
import { useProductTranslator } from '../utils/productI18n';
import { recommendVideosForProduct, toVideoListItem } from '../utils/video';
import type { VideoListItem, VideoPost } from '../types/video';
import { trackEvent } from '../utils/analytics';
import { polishEnglishProductTitle } from '../utils/productCopy';
import { recommendSolutionsForProduct } from '../data/seoLandingPages';
import { getSeoSolutionsUi, localizeSeoLandingPage } from '../data/seoLandingI18n';

interface Product {
  id: string;
  title: string;
  description: string;
  details?: string;
  images: string[];
  category?: string;
  price_range?: string;
  msrp?: string;
  specifications?: Array<{ key: string; value: string }> | Record<string, string>;
}

const MODEL_REFERENCE_PATTERN = /^(?:model\s*(?:no\.?|number)?\s*[:#-]?\s*)?[a-z0-9][a-z0-9 ._/-]{1,24}$/i;

const normalizeDescription = (value?: string) => (value || '').trim().replace(/\s+/g, ' ');

const looksLikeModelReference = (value?: string) => {
  const normalized = normalizeDescription(value);
  return normalized.length > 0 && MODEL_REFERENCE_PATTERN.test(normalized);
};

const needsBuyerSummary = (value?: string) => {
  const normalized = normalizeDescription(value);
  return normalized.length < 60 || looksLikeModelReference(normalized);
};

interface RFQForm {
  customerName: string;
  customerEmail: string;
  message: string;
}

const VIDEO_LIST_COLUMNS =
  'id, slug, source_type, video_url, embed_url, thumbnail_url, category, tags, duration_seconds, published_at, title, excerpt';

export default function ProductDetail() {
  const { id: routeParam } = useParams<{ id: string }>();
  const { lang, lp } = useLocalizedPath();
  // URLs are now "/products/<slug>"; "<slug>-<uuid>" (and bare uuid) still resolve.
  const { slug: routeSlug, legacyId } = parseProductParam(routeParam);
  const initialProduct = readInitialProduct<Product>({ slug: routeSlug, id: legacyId });
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(initialProduct === null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rfqStatus, setRfqStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [relatedVideos, setRelatedVideos] = useState<VideoListItem[]>([]);
  const [hasReachedProductRfq, setHasReachedProductRfq] = useState(false);
  const { t } = useTranslation();
  const translate = useProductTranslator(lang);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RFQForm>();

  useEffect(() => {
    if (rfqStatus === 'success') successHeadingRef.current?.focus();
  }, [rfqStatus]);

  // Keep the mobile quote bar visible while buyers review the product, then
  // retire it once the actual form is on screen so it never covers form/footer
  // content.
  useEffect(() => {
    setHasReachedProductRfq(false);
    if (!product || typeof IntersectionObserver === 'undefined') return;

    const target = document.getElementById('product-rfq');
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setHasReachedProductRfq(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(target);
    return () => observer.disconnect();
  }, [product?.id]);

  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      if (!routeSlug && !legacyId) return;
      try {
        const { supabase } = await import('../supabase');
        // Fast path: a legacy URL gives the id outright, and a prerendered
        // direct visit already knows it from the data island. Otherwise the
        // slug must be matched against title-derived slugs (no slug column).
        const knownId = legacyId || initialProduct?.id;
        let resolved: Product | null = null;
        if (knownId) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', knownId)
            .single();
          if (error) throw error;
          resolved = (data as Product) ?? null;
        } else {
          const { data, error } = await supabase.from('products').select('*');
          if (error) throw error;
          resolved = (data as Product[] | null)?.find((p) => toSlug(p.title) === routeSlug) ?? null;
        }
        if (!cancelled) setProduct(resolved);
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [routeSlug, legacyId]);

  useEffect(() => {
    if (!product) return;
    let active = true;
    const fetchRelatedVideos = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase
          .from('videos')
          .select(VIDEO_LIST_COLUMNS)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(24);
        if (error) throw error;
        if (active && data) {
          const videos = (data as VideoPost[]).map((video) => toVideoListItem(video, lang));
          setRelatedVideos(recommendVideosForProduct(product, videos, 3));
        }
      } catch (error) {
        console.error('Error fetching related videos', error);
      }
    };
    fetchRelatedVideos();
    return () => {
      active = false;
    };
  }, [product?.id, lang]);

  const onSubmitRFQ = async (data: RFQForm) => {
    if (!product) return;
    setRfqStatus('submitting');
    try {
      const { supabase } = await import('../supabase');
      const { error } = await supabase
        .from('rfqs')
        .insert({
          product_id: product.id,
          product_name: product.title,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          message: data.message
        });
      
      if (error) throw error;

      trackEvent('generate_lead', {
        form_location: 'product_detail',
        product_id: product.id,
        product_name: product.title,
      });
      setRfqStatus('success');
      reset();
    } catch (error) {
      console.error("Error submitting RFQ", error);
      trackEvent('rfq_submit_error', {
        form_location: 'product_detail',
        product_id: product.id,
      });
      setRfqStatus('error');
    }
  };

  const formatPrice = (val?: string) => {
    if (!val) return '';
    return val.startsWith('$') ? val : `$${val}`;
  };

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 animate-pulse">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-stone-100">
                <div className="aspect-square bg-stone-200 rounded-2xl mb-6"></div>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-24 h-24 bg-stone-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
                <div className="w-24 h-6 bg-stone-200 rounded-md mb-4"></div>
                <div className="w-3/4 h-10 bg-stone-200 rounded-md mb-6"></div>
                <div className="w-full h-24 bg-stone-200 rounded-md mb-8"></div>
                <div className="w-1/3 h-8 bg-stone-200 rounded-md mb-12"></div>
                <div className="w-full h-48 bg-stone-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-stone-500 text-xl">
        {t('productDetail.notFound', 'Product not found.')}
      </div>
    );
  }

  // Localized copy for display + SEO. `product` (English) still drives the
  // slug/canonical/lookup so URLs stay identical across languages.
  const translatedProduct = translate(product);
  const display = {
    ...translatedProduct,
    title: lang === 'en'
      ? polishEnglishProductTitle(translatedProduct.title ?? product.title)
      : translatedProduct.title ?? product.title,
  };
  const originalDescription = normalizeDescription(display.description);
  const useBuyerSummary = needsBuyerSummary(originalDescription);
  const visibleDescription = useBuyerSummary
    ? t(
        'productDetail.buyerSummary',
        'Factory-direct mirrors for wholesale and OEM/ODM projects. Pricing is prepared to your specifications—ask about MOQ, sample options, custom sizes and functions, certification needs, and production lead time.'
      )
    : originalDescription;
  const productReference = useBuyerSummary && looksLikeModelReference(originalDescription)
    ? originalDescription
    : null;
  const solutionsUi = getSeoSolutionsUi(lang);
  const relatedSolutions = recommendSolutionsForProduct(product).map((page) =>
    localizeSeoLandingPage(page, lang)
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const productPath = product ? `/products/${toSlug(product.title)}` : '/products';
  // Trailing slash to match Cloudflare Pages directory-style URLs and the
  // canonical/sitemap; prerender-static.ts uses the same shape so Helmet
  // adopts the existing JSON-LD tag instead of appending a duplicate.
  const productFullUrl = product ? `https://bolenmirror.com/${lang}${productPath}/` : '';

  const parsePriceRange = (range?: string): { low: number; high: number } => {
    const nums = range?.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (nums.length === 0) return { low: 0, high: 0 };
    if (nums.length === 1) return { low: nums[0], high: nums[0] };
    return { low: Math.min(...nums), high: Math.max(...nums) };
  };
  const { low: lowPrice, high: highPrice } = parsePriceRange(product?.price_range);

  // Shared with scripts/prerender-static.ts via src/utils/productSeo.ts so the
  // values Helmet writes on mount match what was baked into the static HTML.
  const richDescription = buildProductDescription(
    display,
    t('productDetail.descTemplate', 'Premium {title} by BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — OEM/ODM LED, smart, vanity, and bath mirrors. Request a quote for bulk pricing.')
  );

  const seoTitle = buildProductSeoTitle(display.title, t('productDetail.brandSuffix', '| BOLEN Mirror'));

  const productSchema = product ? [
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": display.title,
      "image": product.images,
      "description": richDescription,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": "BOLEN"
      },
      ...(normalizeSpecs(display.specifications).length
        ? {
            "additionalProperty": normalizeSpecs(display.specifications).map((s) => ({
              "@type": "PropertyValue",
              "name": s.key,
              "value": s.value
            }))
          }
        : {}),
      "offers": {
        "@type": "AggregateOffer",
        "url": productFullUrl,
        "priceCurrency": "USD",
        "lowPrice": lowPrice,
        "highPrice": highPrice,
        "offerCount": 1
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": t('navbar.home'), "item": `https://bolenmirror.com/${lang}/` },
        { "@type": "ListItem", "position": 2, "name": t('navbar.catalog'), "item": `https://bolenmirror.com/${lang}/products/` },
        { "@type": "ListItem", "position": 3, "name": display.title, "item": productFullUrl }
      ]
    }
  ] : undefined;

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-12 pb-28 lg:pb-12">
      <SEO
        title={seoTitle}
        description={richDescription}
        path={productPath}
        ogImage={product.images?.[0]}
        ogType="product"
        schema={productSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <m.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center text-sm font-medium text-stone-500"
        >
          <Link to={lp('/')} className="hover:text-amber-600 transition-colors">{t('navbar.home')}</Link>
          <ChevronRight className="mx-2 h-4 w-4 text-stone-300" />
          <Link to={lp('/products')} className="hover:text-amber-600 transition-colors">{t('productDetail.backToCatalog')}</Link>
          <ChevronRight className="mx-2 h-4 w-4 text-stone-300" />
          <span className="text-stone-900 truncate max-w-[200px] sm:max-w-none">{display.title}</span>
        </m.div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Left Column: Image Gallery (Sticky) */}
          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-200 group"
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <img
                    src={optimizeImage(product.images[currentImageIndex], { width: 800 }) || PRODUCT_IMAGE_PLACEHOLDER}
                    onError={handleImageError}
                    alt={display.title}
                    className="h-full w-full object-cover object-center"
                    width="800"
                    height="800"
                    referrerPolicy="no-referrer"
                    decoding="async"
                  />
                </m.div>
              </AnimatePresence>
              
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white text-stone-800 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all duration-300 hover:scale-110"
                    aria-label={t('productDetail.previousImage', 'Previous image')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white text-stone-800 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all duration-300 hover:scale-110"
                    aria-label={t('productDetail.nextImage', 'Next image')}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </m.div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 grid grid-cols-5 gap-3"
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
                      currentImageIndex === idx 
                        ? 'ring-2 ring-amber-500 ring-offset-2 scale-95' 
                        : 'border border-stone-200 hover:border-amber-300 hover:shadow-md'
                    }`}
                  >
                    <img
                      src={img}
                      alt={t('productDetail.galleryView', {
                        title: display.title,
                        index: idx + 1,
                        defaultValue: '{{title}} — view {{index}}',
                      })}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                      width="160"
                      height="160"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </m.div>
            )}
          </div>

          {/* Right Column: Product Info & RFQ */}
          <m.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-10 px-4 sm:px-0 lg:mt-0"
          >
            {product.category && (
              <m.p variants={fadeInUp} className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">
                {t(`products.categories.${product.category}`, product.category)}
              </m.p>
            )}
            <m.h1 variants={fadeInUp} className="text-3xl font-serif tracking-tight text-stone-900 sm:text-4xl lg:text-5xl leading-tight">
              {display.title}
            </m.h1>
            
            {(product.price_range || product.msrp) && (
              <m.div variants={fadeInUp} className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
                {product.price_range && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                      {t('products.priceRangeLabel', 'Indicative factory range')}
                    </p>
                    <div className="text-3xl font-bold text-stone-900">{formatPrice(product.price_range)}</div>
                  </div>
                )}
                {product.msrp && <div className="text-lg text-stone-500 line-through decoration-stone-300">{t('products.msrp')}: {formatPrice(product.msrp)}</div>}
                {product.price_range && (
                  <p className="basis-full text-xs text-stone-500">
                    {t('products.priceQualifier', 'Final pricing depends on quantity and specifications')}
                  </p>
                )}
              </m.div>
            )}

            <m.div variants={fadeInUp} className="mt-6">
              <a href="#product-rfq" className="btn-primary w-full sm:w-auto px-7 py-3.5 text-base">
                {t('productDetail.factoryQuoteCta', 'Get factory quote')}
                <Send className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                {t('productDetail.quoteBasis', 'Specification-based pricing · Ask about MOQ, samples and production lead time.')}
              </p>
            </m.div>

            <m.div variants={fadeInUp} className="mt-8">
              <h3 className="sr-only">{t('productDetail.description', 'Description')}</h3>
              <p className="text-lg text-stone-600 leading-relaxed font-light">{visibleDescription}</p>
              {productReference && (
                <p className="mt-3 text-sm font-medium text-stone-500">
                  {t('productDetail.productReference', 'Product reference')}: <span className="text-stone-700">{productReference}</span>
                </p>
              )}
            </m.div>

            {/* Value Props */}
            <m.div variants={fadeInUp} className="mt-8 grid grid-cols-2 gap-4 py-6 border-y border-stone-200">
              <div className="flex items-center gap-3 text-stone-700">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">{t('productDetail.premiumQuality', 'Premium quality')}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <Truck className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">{t('productDetail.globalShipping', 'Global shipping')}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">{t('productDetail.fastTurnaround', 'Fast turnaround')}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">{t('productDetail.oemAvailable', 'OEM/ODM available')}</span>
              </div>
            </m.div>

            {/* Keep the quote action close to the buying decision. Product
                specifications, long-form details and videos remain below. */}
            <m.section
              id="product-rfq"
              variants={fadeInUp}
              className="scroll-mt-24 mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl shadow-stone-200/50 relative overflow-hidden"
              aria-labelledby="product-rfq-title"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -z-10 opacity-50"></div>
              <h2 id="product-rfq-title" className="text-2xl font-bold text-stone-900 mb-3">{t('productDetail.requestQuote')}</h2>
              <p className="text-stone-500 mb-8 text-sm leading-relaxed max-w-md">
                {t(
                  'productDetail.rfqIntro',
                  'Tell us the quantity and specifications you need. We will confirm factory pricing, MOQ, sample options and production lead time within 24 hours.'
                )}
              </p>

              {rfqStatus === 'success' ? (
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center text-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h3
                    ref={successHeadingRef}
                    tabIndex={-1}
                    className="text-xl font-bold text-green-900 mb-2 focus:outline-none"
                  >
                    {t('productDetail.successTitle', 'Inquiry sent successfully!')}
                  </h3>
                  <p className="text-green-700">{t('productDetail.rfqSuccess')}</p>
                  <button
                    type="button"
                    onClick={() => setRfqStatus('idle')}
                    className="mt-6 text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-4"
                  >
                    {t('productDetail.sendAnother', 'Send another inquiry')}
                  </button>
                </m.div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmitRFQ)}
                  data-rfq-form="product_detail"
                  className="space-y-5 relative z-10"
                  aria-busy={rfqStatus === 'submitting'}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.companyName')}</label>
                      <input
                        type="text"
                        id="customerName"
                        placeholder="Your Company Ltd."
                        autoComplete="organization"
                        {...register('customerName', { required: t('rfq.errors.nameRequired', 'Name is required') })}
                        aria-invalid={errors.customerName ? true : undefined}
                        aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                        className="block w-full rounded-xl border border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none sm:text-sm p-3 transition-colors"
                      />
                      {errors.customerName && (
                        <p id="customerName-error" role="alert" className="mt-1 text-sm text-red-600 font-medium">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.email')}</label>
                      <input
                        type="email"
                        id="customerEmail"
                        placeholder="sales@company.com"
                        autoComplete="email"
                        {...register('customerEmail', {
                          required: t('rfq.errors.emailRequired', 'Email is required'),
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i, message: t('rfq.errors.invalidEmail', 'Invalid email address') }
                        })}
                        aria-invalid={errors.customerEmail ? true : undefined}
                        aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
                        className="block w-full rounded-xl border border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none sm:text-sm p-3 transition-colors"
                      />
                      {errors.customerEmail && (
                        <p id="customerEmail-error" role="alert" className="mt-1 text-sm text-red-600 font-medium">
                          {errors.customerEmail.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.inquiryDetails')}</label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder={t('productDetail.inquiryPlaceholder', {
                        title: display.title,
                        defaultValue: "I'm interested in {{title}}. Please quote the estimated quantity and include MOQ, sample options and production lead time.",
                      })}
                      {...register('message', { required: t('rfq.errors.messageRequired', 'Message is required') })}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className="block w-full rounded-xl border border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none sm:text-sm p-3 transition-colors resize-none"
                    />
                    {errors.message && (
                      <p id="message-error" role="alert" className="mt-1 text-sm text-red-600 font-medium">
                        {errors.message.message}
                      </p>
                    )}
                  </div>
                  {rfqStatus === 'error' && (
                    <div role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                      {t('productDetail.rfqError')}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={rfqStatus === 'submitting'}
                    className="btn-primary w-full py-4 text-base"
                  >
                    {rfqStatus === 'submitting' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        <span>{t('productDetail.submitting')}</span>
                      </>
                    ) : (
                      <>
                        {t('productDetail.submitRfq')}
                        <Send className="w-4 h-4 ml-2" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </m.section>

            {display.specifications && (Array.isArray(display.specifications) ? display.specifications.length > 0 : Object.keys(display.specifications).length > 0) && (
              <m.div variants={fadeInUp} className="mt-10">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                  {t('productDetail.specifications')}
                </h3>
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                  <ul className="divide-y divide-stone-100">
                    {(Array.isArray(display.specifications)
                      ? display.specifications
                      : Object.entries(display.specifications).map(([key, value]) => ({ key, value }))
                    ).map((spec, idx) => (
                      <li key={spec.key} className={`flex px-6 py-4 ${idx % 2 === 0 ? 'bg-stone-50/50' : 'bg-white'}`}>
                        <span className="w-1/3 font-medium text-stone-900">{spec.key}</span>
                        <span className="w-2/3 text-stone-600">{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </m.div>
            )}

            {display.details && (
              <m.div variants={fadeInUp} className="mt-10">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                  {t('productDetail.productDetails')}
                </h3>
                <Markdown className="prose prose-amber prose-stone max-w-none text-stone-600 leading-relaxed bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  {display.details}
                </Markdown>
              </m.div>
            )}

            {relatedSolutions.length > 0 && (
              <m.div variants={fadeInUp} className="mt-10">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                  {solutionsUi.relatedSolutions}
                </h3>
                <ul className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
                  {relatedSolutions.map((solution) => (
                    <li key={solution.slug}>
                      <Link
                        to={lp(`/solutions/${solution.slug}`)}
                        className="flex items-start justify-between gap-3 text-stone-900 hover:text-amber-800"
                      >
                        <span>
                          <span className="block font-medium">{solution.shortTitle || solution.h1}</span>
                          <span className="mt-1 block text-sm leading-6 text-stone-600">{solution.blurb}</span>
                        </span>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-stone-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </m.div>
            )}

            {relatedVideos.length > 0 && (
              <m.div variants={fadeInUp} className="mt-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                    {t('productDetail.relatedVideos', 'Related videos')}
                  </h3>
                  <Link to={lp('/videos')} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
                    {t('videos.viewAll', 'View all')}
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {relatedVideos.map((video, index) => (
                    <VideoCard key={video.id} video={video} index={index + 4} variant="compact" />
                  ))}
                </div>
              </m.div>
            )}

          </m.div>
        </div>
      </div>

      {!hasReachedProductRfq && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(28,25,23,0.12)] backdrop-blur lg:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          role="region"
          aria-label={t('productDetail.mobileQuoteLabel', 'Factory quote shortcut')}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900">{t('productDetail.mobileFactoryPricing', 'Factory pricing')}</p>
              <p className="truncate text-xs text-stone-500">{t('productDetail.mobileQuoteMeta', 'MOQ · Samples · Lead time')}</p>
            </div>
            <a href="#product-rfq" className="btn-primary shrink-0 px-5 py-2.5">
              {t('productDetail.factoryQuoteCta', 'Get factory quote')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
