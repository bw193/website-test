import { m, AnimatePresence } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Send, ShieldCheck, Truck, Clock, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Markdown from '../components/Markdown';
import SEO from '../components/SEO';
import { resolveProductSeo, normalizeSpecs, type ProductSeoMetadata } from '../utils/productSeo';
import VideoCard from '../components/VideoCard';
import { optimizeImage, imageSrcSet } from '../utils/optimizeImage';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialProduct } from '../utils/prerenderData';
import { toSlug, parseProductParam } from '../utils/slug';
import { catalogCategoryPath } from '../utils/catalogCategory';
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
  seo?: ProductSeoMetadata;
  images: string[];
  is_active?: boolean;
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-start gap-3 font-serif text-2xl leading-tight text-stone-900 sm:text-3xl">
      {/* items-start, not center: these headings wrap on narrow screens and a
          centred bar then floats away from the first line. */}
      <span className="mt-0.5 h-7 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
      {children}
    </h2>
  );
}

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
            .eq('is_active', true)
            .maybeSingle();
          if (error) throw error;
          resolved = (data as Product) ?? null;
        } else {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true);
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
      <>
        <SEO
          title={t('productDetail.notFound', 'Product not found.')}
          path={`/products/${routeSlug || routeParam || ''}`}
          noindex
          alternateLanguages={[]}
        />
        <div className="text-center py-24 text-stone-500 text-xl">
          {t('productDetail.notFound', 'Product not found.')}
        </div>
      </>
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
  const productReference = useBuyerSummary && looksLikeModelReference(originalDescription)
    ? originalDescription
    : null;
  const solutionsUi = getSeoSolutionsUi(lang);
  const relatedSolutions = recommendSolutionsForProduct(product).map((page) =>
    localizeSeoLandingPage(page, lang)
  );
  const specs = normalizeSpecs(display.specifications);
  const hasDetails = Boolean(display.details);
  // Specs and long-form details share one band below the hero. When both exist
  // they sit side by side; a lone block spans the full width instead.
  const splitInfoBand = specs.length > 0 && hasDetails;
  const trustPoints = [
    { Icon: ShieldCheck, label: t('productDetail.premiumQuality', 'Premium quality') },
    { Icon: Truck, label: t('productDetail.globalShipping', 'Global shipping') },
    { Icon: Clock, label: t('productDetail.fastTurnaround', 'Fast turnaround') },
    { Icon: CheckCircle2, label: t('productDetail.oemAvailable', 'OEM/ODM available') },
  ];
  const quoteIncludes = [
    t('rfq.quoteIncludesMoq', 'MOQ and unit-price basis'),
    t('rfq.quoteIncludesLeadTime', 'Sample and production lead times'),
    t('rfq.quoteIncludesOptions', 'Customization and target-market compliance options'),
  ];

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
  const { title: seoTitle, description: richDescription, h1: pageHeading } = resolveProductSeo(display, lang, {
    descriptionTemplate: t('productDetail.descTemplate', 'Premium {title} by BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — OEM/ODM LED, smart, vanity, and bath mirrors. Contact sales for bulk pricing.'),
    titleSuffix: t('productDetail.brandSuffix', '| BOLEN Mirror'),
  });

  const productSchema = product ? [
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": pageHeading,
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
    <div className="bg-[#FAF9F6] min-h-screen pb-24 lg:pb-0">
      <SEO
        title={seoTitle}
        description={richDescription}
        path={productPath}
        ogImage={product.images?.[0]}
        ogType="product"
        schema={productSchema}
      />

      {/* The hero carries only what a buyer needs to decide: gallery, identity,
          price basis and the quote action. Specs, long-form details, solutions
          and videos each get their own full-width band below, instead of being
          stacked inside this column. */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 lg:pt-10 lg:pb-20">
        <m.nav
          aria-label="Breadcrumb"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hide-scrollbar flex items-center overflow-x-auto whitespace-nowrap text-xs font-medium text-stone-500 sm:text-sm"
        >
          <Link to={lp('/')} className="hover:text-amber-600 transition-colors">{t('navbar.home')}</Link>
          <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-stone-300 sm:mx-2 sm:h-4 sm:w-4" />
          <Link to={lp('/products')} className="hover:text-amber-600 transition-colors">{t('productDetail.backToCatalog')}</Link>
          {product.category && (
            <>
              <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-stone-300 sm:mx-2 sm:h-4 sm:w-4" />
              <Link
                to={lp(catalogCategoryPath(product.category))}
                className="hover:text-amber-600 transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {t(`products.categories.${product.category}`, product.category)}
              </Link>
            </>
          )}
          <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-stone-300 sm:mx-2 sm:h-4 sm:w-4" />
          <span className="text-stone-900 truncate max-w-[140px] sm:max-w-none">{display.title}</span>
        </m.nav>

        <div className="mt-6 lg:mt-10 lg:grid lg:grid-cols-2 lg:gap-x-14 xl:gap-x-20">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col lg:col-start-1 lg:row-start-1">
            <m.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gradient-to-br from-stone-50 via-white to-stone-100 border border-stone-200 group"
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
                  {/* object-contain, matching ProductCard: a square crop would
                      cut the top off arch and full-length mirrors. */}
                  <img
                    src={optimizeImage(product.images[currentImageIndex], { width: 900 }) || PRODUCT_IMAGE_PLACEHOLDER}
                    srcSet={imageSrcSet(product.images[currentImageIndex], [600, 900, 1200])}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    onError={handleImageError}
                    alt={display.title}
                    className="h-full w-full object-contain object-center p-5 sm:p-8"
                    width="900"
                    height="900"
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
                  <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-stone-950/70 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </span>
                </>
              )}
            </m.div>
            
            {/* Thumbnails — a swipeable rail on phones, a grid from sm up. */}
            {product.images.length > 1 && (
              <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hide-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0"
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-current={currentImageIndex === idx || undefined}
                    className={`relative aspect-square w-[4.5rem] shrink-0 rounded-xl overflow-hidden bg-white transition-all duration-200 sm:w-auto ${
                      currentImageIndex === idx 
                        ? 'ring-2 ring-amber-500 ring-offset-2' 
                        : 'border border-stone-200 opacity-70 hover:opacity-100 hover:border-amber-300 hover:shadow-md'
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
                      className="w-full h-full object-contain p-1"
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

          {/* Right Column: identity, price basis and the quote action */}
          <m.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-8 lg:col-start-2 lg:mt-0"
          >
            <m.div variants={fadeInUp} className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {product.category && (
                <Link
                  to={lp(catalogCategoryPath(product.category))}
                  className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 ring-1 ring-inset ring-amber-200 transition-colors hover:bg-amber-100"
                >
                  {t(`products.categories.${product.category}`, product.category)}
                </Link>
              )}
              {productReference && (
                <span className="text-xs font-medium tracking-wide text-stone-400">
                  {t('productDetail.productReference', 'Product reference')}:{' '}
                  <span className="text-stone-600">{productReference}</span>
                </span>
              )}
            </m.div>

            <m.h1 variants={fadeInUp} className="mt-4 font-serif text-3xl tracking-tight text-stone-900 sm:text-4xl lg:text-[2.75rem] leading-[1.15]">
              {pageHeading}
            </m.h1>

            <m.p data-seo-description="" variants={fadeInUp} className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">
              {richDescription}
            </m.p>
            {!useBuyerSummary && originalDescription !== richDescription ? (
              <m.p variants={fadeInUp} className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">
                {originalDescription}
              </m.p>
            ) : null}

            {(product.price_range || product.msrp) && (
              <m.div variants={fadeInUp} className="mt-7 rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  {product.price_range && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        {t('products.priceRangeLabel', 'Indicative factory range')}
                      </p>
                      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-stone-900 sm:text-4xl">
                        {formatPrice(product.price_range)}
                      </p>
                    </div>
                  )}
                  {product.msrp && (
                    <p className="pb-1.5 text-sm text-stone-500">
                      {t('products.msrp')}:{' '}
                      <span className="line-through decoration-stone-300">{formatPrice(product.msrp)}</span>
                    </p>
                  )}
                </div>
                {product.price_range && (
                  <p className="mt-4 border-t border-stone-200 pt-3 text-xs leading-relaxed text-stone-500">
                    {t('products.priceQualifier', 'Final pricing depends on quantity and specifications')}
                  </p>
                )}
              </m.div>
            )}

            <m.div variants={fadeInUp} className="mt-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="#product-rfq" className="btn-primary px-7 py-4 text-base sm:flex-1">
                  {t('productDetail.factoryQuoteCta', 'Get factory quote')}
                  <Send className="h-4 w-4" aria-hidden="true" />
                </a>
                {specs.length > 0 && (
                  <a href="#product-specs" className="btn-secondary px-6 py-4 text-base">
                    {t('productDetail.specifications')}
                  </a>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                {t('productDetail.quoteBasis', 'Specification-based pricing · Ask about MOQ, samples and production lead time.')}
              </p>
            </m.div>

            {/* Value Props */}
            <m.ul variants={fadeInUp} className="mt-8 grid grid-cols-2 gap-3 border-t border-stone-200 pt-7">
              {trustPoints.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 rounded-xl bg-stone-50 px-3 py-2.5 text-stone-700">
                  <Icon className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <span className="text-[13px] font-medium leading-snug">{label}</span>
                </li>
              ))}
            </m.ul>
          </m.div>

        </div>
        </div>
      </section>

      {/* ── Specifications + long-form details ── */}
      {(specs.length > 0 || hasDetails) && (
        <section id="product-specs" className="scroll-mt-20 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            {/* A lone block keeps a readable measure rather than stretching a
                key/value list or a paragraph across the full container. */}
            <div className={splitInfoBand ? 'lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16' : 'max-w-3xl'}>
              {specs.length > 0 && (
                <m.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className={splitInfoBand ? 'lg:col-span-5 lg:order-2 lg:sticky lg:top-24 lg:self-start' : ''}
                >
                  <SectionHeading>{t('productDetail.specifications')}</SectionHeading>
                  <dl className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                    {specs.map((spec, idx) => (
                      <div
                        key={spec.key}
                        className={`flex items-baseline justify-between gap-6 px-5 py-3.5 sm:px-6 ${
                          idx % 2 === 0 ? 'bg-stone-50/60' : 'bg-white'
                        }`}
                      >
                        <dt className="text-sm text-stone-500">{spec.key}</dt>
                        <dd className="text-right text-sm font-semibold text-stone-900">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </m.div>
              )}

              {hasDetails && (
                <m.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className={splitInfoBand ? 'mt-12 lg:col-span-7 lg:order-1 lg:mt-0' : 'mt-14'}
                >
                  <SectionHeading>{t('productDetail.productDetails')}</SectionHeading>
                  <Markdown className="prose prose-amber prose-stone mt-6 max-w-none rounded-2xl border border-stone-200 bg-white p-6 leading-relaxed text-stone-600 sm:p-8">
                    {display.details}
                  </Markdown>
                </m.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Quote band. Given the page's full width the form can sit beside the
             reasons to send it, instead of being squeezed into a column. ── */}
      <section
        id="product-rfq"
        className="scroll-mt-20 bg-stone-900"
        aria-labelledby="product-rfq-title"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
                {solutionsUi.quoteEyebrow}
              </p>
              <h2 id="product-rfq-title" className="mt-3 font-serif text-3xl leading-tight text-white sm:text-4xl">
                {t('productDetail.requestQuote')}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-stone-300">
                {t(
                  'productDetail.rfqIntro',
                  'Tell us the quantity and specifications you need. We will confirm factory pricing, MOQ, sample options and production lead time within 24 hours.'
                )}
              </p>
              <ul className="mt-8 space-y-3">
                {quoteIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-stone-200">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <img
                  src={optimizeImage(product.images[0], { width: 120 }) || PRODUCT_IMAGE_PLACEHOLDER}
                  onError={handleImageError}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1"
                  width="120"
                  height="120"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                    {t('productDetail.quotingFor', 'Contacting sales about')}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">{display.title}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:col-span-7 lg:mt-0">
              <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-stone-950/40 sm:p-8">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related solutions and videos, now with room for real cards ── */}
      {(relatedSolutions.length > 0 || relatedVideos.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-14 lg:space-y-20">
          {relatedSolutions.length > 0 && (
            <m.section
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <SectionHeading>{solutionsUi.relatedSolutions}</SectionHeading>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedSolutions.map((solution) => (
                  <li key={solution.slug}>
                    <Link
                      to={lp(`/solutions/${solution.slug}`)}
                      className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                    >
                      <span className="font-serif text-lg leading-snug text-stone-900 transition-colors group-hover:text-amber-800">
                        {solution.shortTitle || solution.h1}
                      </span>
                      <span className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{solution.blurb}</span>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                        {solutionsUi.exploreSolution}
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </m.section>
          )}

          {relatedVideos.length > 0 && (
            <m.section
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading>{t('productDetail.relatedVideos', 'Related videos')}</SectionHeading>
                <Link to={lp('/videos')} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
                  {t('videos.viewAll', 'View all')}
                </Link>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedVideos.map((video, index) => (
                  <VideoCard key={video.id} video={video} index={index + 4} />
                ))}
              </div>
            </m.section>
          )}
        </div>
      )}

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
