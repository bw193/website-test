import { m, useReducedMotion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2, ChevronRight, ArrowUpRight, Send, ShieldCheck, Truck, Clock, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Markdown from '../components/Markdown';
import SEO from '../components/SEO';
import ProductGallery from '../components/ProductGallery';
import './ProductDetail.css';
import { resolveProductSeo, normalizeSpecs, type ProductSeoMetadata } from '../utils/productSeo';
import VideoCard from '../components/VideoCard';
import { optimizeImage } from '../utils/optimizeImage';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialProduct } from '../utils/prerenderData';
import { parseProductParam } from '../utils/slug';
import { findProductRoute, productDetailPath, productAlternatePaths, productMatchesDetailPath } from '../utils/productRoutes';
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
  return <h2 className="pdp-section-heading font-serif">{children}</h2>;
}

export default function ProductDetail() {
  const { id: routeParam, productCategory } = useParams<{ id: string; productCategory: string }>();
  const location = useLocation();
  const { lang, lp } = useLocalizedPath();
  const { slug: routeSlug, legacyId } = parseProductParam(routeParam);
  const routeKey = `${lang}/${productCategory || ''}/${routeParam || ''}`;
  const initialProduct = readInitialProduct<Product>(location.pathname);
  const knownId = findProductRoute(location.pathname)?.id || legacyId || initialProduct?.id;
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [resolvedRouteKey, setResolvedRouteKey] = useState(routeKey);
  const [loading, setLoading] = useState(initialProduct === null);
  const reduceMotion = useReducedMotion();
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
    setProduct(initialProduct);
    setLoading(initialProduct === null);
    setResolvedRouteKey(routeKey);
    const fetchProduct = async () => {
      if (!routeSlug && !legacyId) return;
      try {
        const { supabase } = await import('../supabase');
        // Resolve translated routes to IDs before querying; new products also
        // support title lookup until a build refreshes the route index.
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
          resolved = (data as Product[] | null)?.find((p) => productMatchesDetailPath(p, location.pathname)) ?? null;
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
  }, [routeKey, knownId]);

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

  if (loading || resolvedRouteKey !== routeKey) {
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
          path={location.pathname.replace(/^\/[a-z]{2}/, '').replace(/\/+$/, '')}
          noindex
          alternateLanguages={[]}
        />
        <div className="text-center py-24 text-stone-500 text-xl">
          {t('productDetail.notFound', 'Product not found.')}
        </div>
      </>
    );
  }

  const productPath = productDetailPath(product, lang);
  const canonicalPathname = lp(productPath);
  if (location.pathname !== canonicalPathname) {
    return <Navigate to={`${canonicalPathname}${location.search}${location.hash}`} replace />;
  }

  // Display copy stays independent of the localized URL index.
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

  const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(event.currentTarget.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    target.focus({ preventScroll: true });
  };

  const fadeInUp = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.65 } }
  };

  const staggerContainer = {
    hidden: { opacity: reduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.08 }
    }
  };

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
    <div lang={lang} className="product-detail min-h-screen">
      <SEO
        title={seoTitle}
        description={richDescription}
        path={productPath}
        alternatePaths={productAlternatePaths(product)}
        ogImage={product.images?.[0]}
        ogType="product"
        schema={productSchema}
      />

      {/* The hero carries only what a buyer needs to decide: gallery, identity,
          price basis and the quote action. Specs, long-form details, solutions
          and videos each get their own full-width band below, instead of being
          stacked inside this column. */}
      <section className="pdp-hero">
        <div className="pdp-container">
        <m.nav
          aria-label="Breadcrumb"
          initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="pdp-breadcrumb"
        >
          <Link to={lp('/')} className="hover:text-amber-600 transition-colors">{t('navbar.home')}</Link>
          <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-stone-300 sm:mx-2 sm:h-4 sm:w-4" />
          <Link to={lp('/products')} className="hover:text-amber-600 transition-colors">{t('productDetail.backToCatalog')}</Link>
          {product.category && (
            <>
              <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-stone-300 sm:mx-2 sm:h-4 sm:w-4" />
              <Link
                to={lp(catalogCategoryPath(product.category))}
                className="hover:text-amber-600 transition-colors"
              >
                {t(`products.categories.${product.category}`, product.category)}
              </Link>
            </>
          )}
          <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-stone-300 sm:mx-2 sm:h-4 sm:w-4" />
          <span aria-current="page">{display.title}</span>
        </m.nav>

        <div className="pdp-hero-grid">
          <ProductGallery key={product.id + ':' + lang} images={product.images} title={display.title} />

          {/* Right Column: identity, price basis and the quote action */}
          <m.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="pdp-hero-copy"
          >
            <m.div variants={fadeInUp} className="pdp-product-meta">
              {product.category && (
                <Link
                  to={lp(catalogCategoryPath(product.category))}
                  className="pdp-category"
                >
                  {t(`products.categories.${product.category}`, product.category)}
                </Link>
              )}
              {productReference && (
                <span className="pdp-reference">
                  {t('productDetail.productReference', 'Product reference')}:{' '}
                  <span className="text-stone-600">{productReference}</span>
                </span>
              )}
            </m.div>

            <m.h1 variants={fadeInUp} className="pdp-title font-serif">
              {pageHeading}
            </m.h1>

            <m.p data-seo-description="" variants={fadeInUp} className="pdp-description">
              {richDescription}
            </m.p>
            {!hasDetails && !useBuyerSummary && originalDescription !== richDescription ? (
              <m.p variants={fadeInUp} className="pdp-description">
                {originalDescription}
              </m.p>
            ) : null}

            {(product.price_range || product.msrp) && (
              <m.div variants={fadeInUp} className="pdp-price">
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  {product.price_range && (
                    <div>
                      <p className="pdp-price-label">
                        {t('products.priceRangeLabel', 'Indicative factory range')}
                      </p>
                      <p className="pdp-price-value">
                        {formatPrice(product.price_range)}
                      </p>
                    </div>
                  )}
                  {product.msrp && (
                    <p className="pdp-msrp">
                      {t('products.msrp')}:{' '}
                      <span className="line-through decoration-stone-300">{formatPrice(product.msrp)}</span>
                    </p>
                  )}
                </div>
                {product.price_range && (
                  <p className="pdp-price-note">
                    {t('products.priceQualifier', 'Final pricing depends on quantity and specifications')}
                  </p>
                )}
              </m.div>
            )}

            <m.div variants={fadeInUp} className="pdp-quote-actions">
              <div className="pdp-action-buttons">
                <a href="#product-rfq" onClick={jumpTo} className="btn-primary">
                  {t('productDetail.factoryQuoteCta', 'Get factory quote')}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                {specs.length > 0 && (
                  <a href="#product-specs" onClick={jumpTo} className="btn-secondary">
                    {t('productDetail.specifications')}
                  </a>
                )}
              </div>
              <p className="pdp-quote-note">
                {t('productDetail.quoteBasis', 'Specification-based pricing · Ask about MOQ, samples and production lead time.')}
              </p>
            </m.div>

          </m.div>

        </div>
        <m.ul variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="pdp-trust-row">
          {trustPoints.map(({ Icon, label }) => <li key={label}><span className="pdp-trust-icon"><Icon size={21} aria-hidden="true" /></span><span>{label}</span></li>)}
        </m.ul>
        </div>
      </section>

      <nav className="pdp-section-nav" aria-label={t('productDetail.productDetails')}>
        <div className="pdp-container">
          <div className="pdp-section-links">
            {hasDetails && <a href="#product-description" onClick={jumpTo}>{t('productDetail.productDetails')}</a>}
            {specs.length > 0 && <a href="#product-specs" onClick={jumpTo}>{t('productDetail.specifications')}</a>}
            {relatedVideos.length > 0 && <a href="#product-videos" onClick={jumpTo}>{t('productDetail.relatedVideos')}</a>}
          </div>
          <a className="pdp-nav-quote" href="#product-rfq" onClick={jumpTo}>{t('productDetail.factoryQuoteCta')}<ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </nav>

      {/* ── Specifications + long-form details ── */}
      {(specs.length > 0 || hasDetails) && (
        <section className="pdp-information">
          <div className="pdp-container">
            {/* A lone block keeps a readable measure rather than stretching a
                key/value list or a paragraph across the full container. */}
            <div className={`pdp-info-grid ${splitInfoBand ? 'is-split' : ''}`}>
              {specs.length > 0 && (
                <m.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  id="product-specs" tabIndex={-1} className="pdp-spec-sheet pdp-anchor"
                >
                  <SectionHeading>{t('productDetail.specifications')}</SectionHeading>
                  <dl className="pdp-specs">
                    {specs.map((spec) => (
                      <div
                        key={spec.key}
                        className="pdp-spec-row"
                      >
                        <dt>{spec.key}</dt>
                        <dd>{spec.value.split(/([/,;])/).map((part, index) => <React.Fragment key={index}>{part}{/^[/,;]$/.test(part) && <wbr />}</React.Fragment>)}</dd>
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
                  id="product-description" tabIndex={-1} className="pdp-details pdp-anchor"
                >
                  <SectionHeading>{t('productDetail.productDetails')}</SectionHeading>
                  {!useBuyerSummary && originalDescription !== richDescription && <p className="pdp-details-intro">{originalDescription}</p>}
                  <Markdown className="pdp-prose prose prose-amber prose-stone max-w-none">
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
        tabIndex={-1}
        className="pdp-rfq pdp-anchor"
        aria-labelledby="product-rfq-title"
      >
        <div className="pdp-container">
          <div className="pdp-rfq-grid">
            <div className="pdp-rfq-copy">
              <p className="pdp-eyebrow">
                {solutionsUi.quoteEyebrow}
              </p>
              <h2 id="product-rfq-title" className="pdp-rfq-heading font-serif">
                {t('productDetail.requestQuote')}
              </h2>
              <p className="pdp-rfq-intro">
                {t(
                  'productDetail.rfqIntro',
                  'Tell us the quantity and specifications you need. We will confirm factory pricing, MOQ, sample options and production lead time within 24 hours.'
                )}
              </p>
              <ul className="pdp-quote-includes">
                {quoteIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-stone-200">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pdp-quoting-product">
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
                  <p className="pdp-quoting-label">
                    {t('productDetail.quotingFor', 'Contacting sales about')}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">{display.title}</p>
                </div>
              </div>
            </div>

            <div className="pdp-rfq-form-wrap">
              <div className="pdp-rfq-form">
              {rfqStatus === 'success' ? (
                <m.div
                  initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.95 }}
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
        <div className="pdp-related pdp-container">
          {relatedSolutions.length > 0 && (
            <m.section
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <SectionHeading>{solutionsUi.relatedSolutions}</SectionHeading>
              <ul className="pdp-related-grid">
                {relatedSolutions.map((solution, index) => (
                  <li key={solution.slug}>
                    <Link
                      to={lp(`/solutions/${solution.slug}`)}
                      className="pdp-related-card"
                    >
                      <span className="pdp-related-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}<ArrowUpRight size={22} /></span>
                      <span className="pdp-related-title font-serif">
                        {solution.shortTitle || solution.h1}
                      </span>
                      <span className="pdp-related-description">{solution.blurb}</span>
                      <span className="pdp-related-action">
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
            <m.section id="product-videos" tabIndex={-1} className="pdp-videos pdp-anchor"
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
          className="pdp-mobile-quote fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(28,25,23,0.12)] backdrop-blur lg:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          role="region"
          aria-label={t('productDetail.mobileQuoteLabel', 'Factory quote shortcut')}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900">{t('productDetail.mobileFactoryPricing', 'Factory pricing')}</p>
              <p className="truncate text-xs text-stone-500">{t('productDetail.mobileQuoteMeta', 'MOQ · Samples · Lead time')}</p>
            </div>
            <a href="#product-rfq" onClick={jumpTo} className="btn-primary shrink-0 px-5 py-2.5">
              {t('productDetail.factoryQuoteCta', 'Get factory quote')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
