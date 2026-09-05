import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, ShieldCheck, Truck, Factory, Lightbulb, Users, ChevronRight, ChevronLeft, Palette, DollarSign, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useForm } from 'react-hook-form';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import FeaturedVideo from '../components/FeaturedVideo';
import FactoryShowcase from '../components/FactoryShowcase';
import { optimizeImage } from '../utils/optimizeImage';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialHomeData, type FactoryGalleryItem } from '../utils/prerenderData';
import { parseFeaturedVideoSlug, toVideoListItem, VIDEO_LIST_COLUMNS } from '../utils/video';
import { buildVideoObjectSchema } from '../utils/videoSchema';
import { runWhenIdle } from '../utils/idle';
import type { VideoListItem, VideoPost } from '../types/video';
import { getLocalizedSeoLandingPages, getSeoSolutionsUi } from '../data/seoLandingI18n';
import { HOME_SOLUTION_SLUGS } from '../data/seoLandingPages';
import { catalogCategoryPath, DEFAULT_PRODUCT_CATEGORIES } from '../utils/catalogCategory';
import { trackEvent } from '../utils/analytics';

const GlobalMap = lazy(() => import('../components/GlobalMap'));
// Lazy so `motion` (used by GlobalMap's animated markers) stays off the home
// critical path — it loads with the map, below the fold, after LCP.
const MotionProvider = lazy(() => import('../components/MotionProvider'));

// Own factory photography for the closing CTA band. Previously a random image
// from picsum.photos, which is a placeholder service — not something that
// should ship behind the primary conversion block on a supplier site.
const CTA_BACKDROP =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory1.jpg';

const DEFAULT_HERO_BGS = [
  "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg",
];

// Responsive hero candidates — kept in lockstep with HERO_WIDTHS in
// scripts/prerender-static.ts so the URLs match the prerendered <img>/preload
// exactly and the browser reuses the already-downloaded hero from cache.
const HERO_WIDTHS = [640, 960, 1280, 1920];
const heroSrcSet = (url: string) =>
  HERO_WIDTHS.map((w) => `${optimizeImage(url, { width: w })} ${w}w`).join(', ');
// Fallback hero aspect ratio (1920×750 = 2.56) used until the build-time probe
// supplies real dimensions; reserving the box prevents layout shift.
const DEFAULT_HERO_W = 1920;
const DEFAULT_HERO_H = 750;

interface HomeInquiryForm {
  customerName: string;
  customerEmail: string;
  message: string;
}

const CERTS = [
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/au.png", alt: "SAA Australia certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/CE(1)(1).jpg", alt: "CE European conformity certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/IP44.jpg", alt: "IP44 water and dust resistance rating" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UKCA.jpg", alt: "UKCA United Kingdom conformity certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UL2.jpg", alt: "UL safety certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/ctce.png", alt: "CCC China compulsory certification" },
];

/**
 * Editorial kicker used above every section heading — the amber hairline gives
 * each band the same entry point, so the page reads as one continuous document
 * rather than stacked blocks.
 */
function SectionKicker({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <span
      className={`flex items-center gap-3 text-amber-600 font-semibold tracking-wider uppercase text-sm mb-3 ${
        centered ? 'justify-center' : ''
      }`}
    >
      <span aria-hidden="true" className="h-px w-8 bg-amber-500/70" />
      {children}
      {centered && <span aria-hidden="true" className="h-px w-8 bg-amber-500/70" />}
    </span>
  );
}

/**
 * Count-up for the stats band. Parses a leading number out of values like
 * "46,800 m²" or "200+" and eases it in when the card scrolls into view;
 * non-numeric values ("Global") render untouched. Reduced-motion visitors get
 * the final value immediately.
 */
function StatValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const match = value.match(/^([\d,]+)([\s\S]*)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ''), 10) : null;
  const suffix = match ? match[2] : '';
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === null || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    setDisplay(`0${suffix}`);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1600;
        const tick = (now: number) => {
          // rAF timestamps use the frame's vsync time, which can precede the
          // `start` captured when the observer fired — clamp or the first
          // frame renders a negative count (e.g. "-97 m²").
          const p = Math.min(Math.max((now - start) / duration, 0), 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(`${Math.round(target * eased).toLocaleString('en-US')}${suffix}`);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <p ref={ref} className={className}>
      {display}
    </p>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { lp, lang } = useLocalizedPath();
  const solutionPages = getLocalizedSeoLandingPages(lang);
  const solutionsUi = getSeoSolutionsUi(lang);
  const initialData = readInitialHomeData<any>();
  const [heroBgs, setHeroBgs] = useState<string[]>(
    initialData?.heroBgs && initialData.heroBgs.length > 0 ? initialData.heroBgs : DEFAULT_HERO_BGS
  );
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  // Only crossfade once the carousel actually advances — the first (LCP) slide
  // must paint with no entrance animation so it isn't delayed.
  const [animateSlides, setAnimateSlides] = useState(false);
  const heroW = initialData?.heroW ?? DEFAULT_HERO_W;
  const heroH = initialData?.heroH ?? DEFAULT_HERO_H;
  // Self-hosted (Cloudflare-CDN) responsive set for the LCP slide, baked at
  // build time. Falls back to the Supabase transform endpoint if unavailable.
  const heroLcp = initialData?.heroLcp;
  const heroImgSrc = (idx: number) =>
    idx === 0 && heroLcp ? heroLcp.src : optimizeImage(heroBgs[idx], { width: 1280 });
  const heroImgSrcSet = (idx: number) =>
    idx === 0 && heroLcp ? heroLcp.srcset : heroSrcSet(heroBgs[idx]);
  const [isLoading, setIsLoading] = useState(initialData === null);
  const [allProducts, setAllProducts] = useState<any[]>(initialData?.products ?? []);
  const [categories, setCategories] = useState<string[]>(
    initialData?.categories && initialData.categories.length > 0 ? initialData.categories : [...DEFAULT_PRODUCT_CATEGORIES]
  );
  const [factoryGallery, setFactoryGallery] = useState<FactoryGalleryItem[]>(
    initialData?.factoryGallery ?? []
  );
  const [featuredVideo, setFeaturedVideo] = useState<VideoListItem | null>(initialData?.featuredVideo ?? null);
  const [homeInquiryStatus, setHomeInquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const homeInquiryStatusRef = useRef<HTMLParagraphElement>(null);
  const {
    register: registerHomeInquiry,
    handleSubmit: handleHomeInquirySubmit,
    reset: resetHomeInquiry,
    formState: { errors: homeInquiryErrors },
  } = useForm<HomeInquiryForm>();

  useEffect(() => {
    if (homeInquiryStatus === 'success' || homeInquiryStatus === 'error') {
      homeInquiryStatusRef.current?.focus();
    }
  }, [homeInquiryStatus]);

  useEffect(() => {
    let cancelled = false;
    const fetchSettings = async () => {
      try {
        const { supabase } = await import('../supabase');
        // Fetch hero background settings
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_bg')
          .single();

        if (data && data.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const filtered = parsed.filter(url => !url.includes('building.jpg'));
              if (filtered.length > 0) {
                if (!cancelled) setHeroBgs(filtered);
              }
            } else if (typeof data.value === 'string' && data.value.length > 0 && !data.value.startsWith('[')) {
              if (!data.value.includes('building.jpg')) {
                if (!cancelled) setHeroBgs([data.value]);
              }
            }
          } catch (e) {
            if (typeof data.value === 'string' && data.value.length > 0) {
              if (!data.value.includes('building.jpg')) {
                if (!cancelled) setHeroBgs([data.value]);
              }
            }
          }
        }

        // Fetch categories
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'categories')
          .single();

        if (!settingsError && settingsData && settingsData.value) {
          try {
            const parsed = JSON.parse(settingsData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (!cancelled) setCategories(parsed);
            }
          } catch (e) {
            console.error("Error parsing categories", e);
          }
        }

        // Fetch all products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!productsError && productsData) {
          if (!cancelled) setAllProducts(productsData);
        }
      } catch (err) {
        // Ignore errors if table doesn't exist or setting not found
        console.error("Could not fetch data:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  // The factory gallery and the featured video are editor-managed and expected
  // to update without a rebuild, so they always refetch — even when the
  // prerender data island has seeded the other home state. Both live below the
  // fold, so on prerendered builds the refresh is deferred to idle time and
  // never competes with the hero for bandwidth.
  useEffect(() => {
    let cancelled = false;
    let refreshInFlight = false;
    let cancelIdle: (() => void) | undefined;

    const refreshEditorContent = async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;
      try {
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['factory_gallery', 'home_featured_video']);
        if (cancelled || error || !data) return;

        const galleryValue = data.find((row) => row.key === 'factory_gallery')?.value;
        if (galleryValue) {
          try {
            const parsed = JSON.parse(galleryValue);
            if (Array.isArray(parsed)) {
              const cleaned: FactoryGalleryItem[] = parsed
                .filter((it: any) => it && typeof it.url === 'string' && it.url.trim() !== '')
                .map((it: any) => ({
                  url: it.url,
                  alt:
                    typeof it.alt === 'string' && it.alt.trim() !== ''
                      ? it.alt
                      : 'BOLEN mirror factory production line',
                  caption: typeof it.caption === 'string' ? it.caption : undefined,
                }));
              if (!cancelled) setFactoryGallery(cleaned);
            }
          } catch (e) {
            console.error('Could not parse factory_gallery:', e);
          }
        }

        const slug = parseFeaturedVideoSlug(data.find((row) => row.key === 'home_featured_video')?.value);
        if (!slug) {
          if (!cancelled) setFeaturedVideo(null);
          return;
        }
        const { data: videoRow, error: videoError } = await supabase
          .from('videos')
          .select(VIDEO_LIST_COLUMNS)
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();
        if (cancelled || videoError) return;
        setFeaturedVideo(videoRow ? toVideoListItem(videoRow as VideoPost, lang) : null);
      } catch (e) {
        console.error('Could not fetch editor-managed home content:', e);
      } finally {
        refreshInFlight = false;
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshEditorContent();
    };

    if (initialData) {
      cancelIdle = runWhenIdle(refreshEditorContent, 2500);
    } else {
      void refreshEditorContent();
    }

    // Editors commonly keep the homepage open in another tab. Refresh the
    // managed content when that tab becomes active so a newly uploaded factory
    // photo appears without a rebuild or a hard reload.
    window.addEventListener('focus', refreshEditorContent);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      cancelled = true;
      cancelIdle?.();
      window.removeEventListener('focus', refreshEditorContent);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [lang]);

  const featuredProducts = allProducts.slice(0, 6);

  useEffect(() => {
    if (heroBgs.length <= 1) return;
    // Auto-advancing the hero is motion the user did not initiate and cannot
    // pause, so honour the OS preference and leave it on the first slide (the
    // prev/next arrows still work).
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const interval = setInterval(() => {
      setAnimateSlides(true);
      setCurrentBgIndex((prev) => (prev + 1) % heroBgs.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroBgs.length, currentBgIndex]);

  const nextBg = () => {
    setAnimateSlides(true);
    setCurrentBgIndex((prev) => (prev + 1) % heroBgs.length);
  };

  const prevBg = () => {
    setAnimateSlides(true);
    setCurrentBgIndex((prev) => (prev - 1 + heroBgs.length) % heroBgs.length);
  };

  const onSubmitHomeInquiry = async (data: HomeInquiryForm) => {
    setHomeInquiryStatus('submitting');
    try {
      const { supabase } = await import('../supabase');
      const { error } = await supabase.from('rfqs').insert([
        {
          product_id: null,
          product_name: 'Homepage Quick Inquiry',
          customer_name: data.customerName.trim(),
          customer_email: data.customerEmail.trim(),
          message: data.message.trim(),
        },
      ]);

      if (error) throw error;

      trackEvent('generate_lead', {
        form_location: 'home_quick_inquiry',
        lead_source: 'homepage',
      });
      resetHomeInquiry();
      setHomeInquiryStatus('success');
    } catch (error) {
      console.error('Error submitting homepage inquiry', error);
      trackEvent('rfq_submit_error', {
        form_location: 'home_quick_inquiry',
      });
      setHomeInquiryStatus('error');
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-stone-800 font-sans overflow-hidden">
      <SEO title={t('seo.homeTitle')} description={t('seo.homeDesc')} schema={[
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
          "url": "https://bolenmirror.com",
          "logo": "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png",
          "description": "Leading LED mirror manufacturer specializing in OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors for global brands.",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+86-18058603602",
            "email": "sales@bolenmirror.com",
            "contactType": "customer service",
            "areaServed": "Worldwide",
            "availableLanguage": ["en", "zh", "es", "fr", "de", "it"]
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town",
            "addressLocality": "Jiaxing",
            "addressRegion": "Zhejiang",
            "addressCountry": "CN"
          },
          "sameAs": []
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "BOLEN Mirror",
          "url": "https://bolenmirror.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://bolenmirror.com/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        ...(factoryGallery.length > 0 ? [{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          "name": "Inside the BOLEN Mirror Factory",
          "description": "Editor-managed photo set of the Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) production facility — LED, smart, vanity, and bath mirror manufacturing.",
          "url": "https://bolenmirror.com/#factory-showcase",
          "image": factoryGallery.map((it) => ({
            "@type": "ImageObject",
            "contentUrl": it.url,
            "url": it.url,
            "description": it.alt,
            ...(it.caption ? { "caption": it.caption } : {}),
          })),
        }] : []),
        // Key order must stay in lockstep with homeSchema() in
        // scripts/prerender-static.ts so Helmet adopts the prerendered
        // <script> tags instead of replacing them on mount.
        ...(featuredVideo ? [buildVideoObjectSchema(featuredVideo, lang)] : [])
      ]} />
      {/* Hero Section */}
      <div className="relative bg-stone-900 overflow-hidden group">
        {/* Image in natural flow to preserve aspect ratio */}
        <div className="relative w-full">
          {heroBgs.length > 0 && (
            <img
              key={currentBgIndex}
              className={`w-full h-auto block ${animateSlides ? 'hero-zoom' : ''}`}
              src={heroImgSrc(currentBgIndex)}
              srcSet={heroImgSrcSet(currentBgIndex)}
              sizes="100vw"
              width={heroW}
              height={heroH}
              alt="BOLEN LED bathroom mirror manufacturing showcase"
              referrerPolicy="no-referrer"
              {...({ fetchpriority: 'high' } as Record<string, string>)}
              decoding="async"
            />
          )}
        </div>

        {heroBgs.length > 1 && (
          <>
            <button
              onClick={prevBg}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextBg}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            {/* Keep pagination above the floating inquiry card while leaving the
                baked-in certification row unobstructed. */}
            <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 backdrop-blur-sm">
              {heroBgs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setAnimateSlides(true); setCurrentBgIndex(idx); }}
                  className="p-2"
                  aria-label={`Go to image ${idx + 1}`}
                ><span className={`block h-2 rounded-full transition-all duration-500 ${idx === currentBgIndex ? 'bg-amber-400 w-7' : 'w-2 bg-white/50 hover:bg-white/80'}`} /></button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hero footer — a compact quick-inquiry card crosses the banner edge,
          while the value copy and stats stay on the open band, so the parts
          share one axis without boxing everything into a single slab. */}
      <div className="relative z-10 isolate bg-gradient-to-b from-stone-100 to-[#FAF9F6] text-stone-900">
        {/* Clip only the animated wash; the inquiry card itself must remain free
            to rise above the section and overlap the hero artwork. */}
        <div className="band-aurora pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" />
        {/* flow-root keeps the card's negative top margin from collapsing
            through to the band, so only the card overlaps the hero. */}
        <div className="relative z-10 mx-auto flow-root max-w-6xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
          <Reveal variant="blur" delay={320} className="relative -mt-8 sm:-mt-10 lg:-mt-12">
            <form
              onSubmit={handleHomeInquirySubmit(onSubmitHomeInquiry)}
              className="mx-auto max-w-5xl rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xl shadow-stone-900/10 sm:p-5 lg:px-8 lg:py-5"
              aria-labelledby="home-quick-inquiry-title"
              noValidate
            >
                {/* Desktop: title rides in the same row as the fields so the
                    header stays one line tall; mobile/tablet keep it centered
                    above the stacked controls. */}
                <div className="grid items-center gap-3 sm:grid-cols-2 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                  <h2 id="home-quick-inquiry-title" className="text-center font-serif text-lg text-stone-900 sm:col-span-2 sm:text-xl lg:col-span-1 lg:max-w-[10rem] lg:text-left lg:text-lg lg:leading-snug xl:max-w-none xl:whitespace-nowrap">
                    {t('home.quickInquiry.title')}
                  </h2>
                  <div>
                    <label htmlFor="home-inquiry-name" className="sr-only">
                      {t('home.quickInquiry.name')}
                    </label>
                    <input
                      id="home-inquiry-name"
                      type="text"
                      autoComplete="name"
                      maxLength={200}
                      placeholder={`${t('home.quickInquiry.name')} *`}
                      aria-invalid={homeInquiryErrors.customerName ? true : undefined}
                      aria-describedby={homeInquiryErrors.customerName ? 'home-inquiry-name-error' : undefined}
                      {...registerHomeInquiry('customerName', {
                        required: t('rfq.errors.nameRequired'),
                        maxLength: 200,
                      })}
                      className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                    {homeInquiryErrors.customerName && (
                      <p id="home-inquiry-name-error" className="mt-1 text-xs text-red-600" role="alert">
                        {homeInquiryErrors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="home-inquiry-email" className="sr-only">
                      {t('home.quickInquiry.email')}
                    </label>
                    <input
                      id="home-inquiry-email"
                      type="email"
                      autoComplete="email"
                      maxLength={320}
                      placeholder={`${t('home.quickInquiry.email')} *`}
                      aria-invalid={homeInquiryErrors.customerEmail ? true : undefined}
                      aria-describedby={homeInquiryErrors.customerEmail ? 'home-inquiry-email-error' : undefined}
                      {...registerHomeInquiry('customerEmail', {
                        required: t('rfq.errors.emailRequired'),
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                          message: t('rfq.errors.invalidEmail'),
                        },
                        maxLength: 320,
                      })}
                      className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                    {homeInquiryErrors.customerEmail && (
                      <p id="home-inquiry-email-error" className="mt-1 text-xs text-red-600" role="alert">
                        {homeInquiryErrors.customerEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label htmlFor="home-inquiry-message" className="sr-only">
                      {t('home.quickInquiry.message')}
                    </label>
                    <input
                      id="home-inquiry-message"
                      type="text"
                      maxLength={10000}
                      placeholder={`${t('home.quickInquiry.message')} *`}
                      aria-invalid={homeInquiryErrors.message ? true : undefined}
                      aria-describedby={homeInquiryErrors.message ? 'home-inquiry-message-error' : undefined}
                      {...registerHomeInquiry('message', {
                        required: t('rfq.errors.messageRequired'),
                        maxLength: 10000,
                      })}
                      className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                    {homeInquiryErrors.message && (
                      <p id="home-inquiry-message-error" className="mt-1 text-xs text-red-600" role="alert">
                        {homeInquiryErrors.message.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={homeInquiryStatus === 'submitting'}
                    className="btn-primary h-12 justify-center px-7 uppercase tracking-wide sm:col-span-2 lg:col-span-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {homeInquiryStatus === 'submitting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : homeInquiryStatus === 'success' ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>
                      {homeInquiryStatus === 'submitting'
                        ? t('home.quickInquiry.sending')
                        : t('home.quickInquiry.send')}
                    </span>
                  </button>
                </div>

                {(homeInquiryStatus === 'success' || homeInquiryStatus === 'error') && (
                  <p
                    ref={homeInquiryStatusRef}
                    tabIndex={-1}
                    role={homeInquiryStatus === 'error' ? 'alert' : 'status'}
                    className={`mt-3 text-center text-sm font-medium focus:outline-none ${
                      homeInquiryStatus === 'success' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {homeInquiryStatus === 'success'
                      ? t('home.quickInquiry.success')
                      : t('home.quickInquiry.error')}
                  </p>
                )}
              </form>
            </Reveal>

            <div className="mt-4 grid gap-5 sm:mt-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10">
              {/* Kicker and h1 are one unit — keeping the kicker outside the grid
                  left it pinned to the top while the h1 dropped to meet the right
                  column, opening a dead gap between them. */}
              <div>
                <Reveal as="p" variant="left" className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                  {t('home.heroKicker')}
                </Reveal>
                <Reveal as="h1" variant="left" delay={90} className="mt-2 font-serif text-3xl sm:text-4xl lg:text-4xl lg:leading-[1.12]">
                  {t('home.heroTitle1')}
                  <span className="block italic text-sheen">{t('home.heroTitle2')}</span>
                </Reveal>
              </div>
              <div className="lg:border-l lg:border-stone-300/70 lg:pl-10">
                <Reveal as="p" variant="right" delay={180} className="text-sm text-stone-600 font-light">
                  {/* heroDesc contains <1>BOLEN</1>, so it must go through Trans
                      rather than t() or the markup renders as literal text. */}
                  <Trans i18nKey="home.heroDesc" components={[<span key="0" />, <strong key="1" className="font-medium text-stone-900" />]} />
                </Reveal>
                <Reveal variant="right" delay={270} className="mt-4 flex flex-wrap gap-3">
                  <Link to={lp('/rfq')} className="btn-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/25">
                    {t('home.heroPrimaryCta')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to={lp('/products')} className="btn-secondary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    {t('home.heroSecondaryCta')}
                  </Link>
                </Reveal>
              </div>
            </div>

            {/* Stats — a hairline spec strip on the open band, not a card. */}
            <div id="home-stats" className="mt-5 grid scroll-mt-24 grid-cols-2 sm:mt-6 lg:grid-cols-4">
              {[
                { icon: Factory, value: "46,800 m²", label: t('home.stats.sqMeters') },
                { icon: Users, value: "200+", label: t('home.stats.artisans') },
                { icon: Lightbulb, value: "200+", label: t('home.stats.styles') },
                { icon: Globe, value: "Global", label: t('home.stats.global') }
              ].map((stat, idx) => (
                <Reveal
                  key={idx}
                  variant="scale"
                  delay={idx * 100}
                  className={`min-w-0 flex flex-col items-center text-center group px-3 py-3.5 sm:px-6 sm:py-4 lg:px-5 ${
                    idx % 2 === 0 ? 'border-r border-stone-100 lg:border-r-0' : ''
                  } ${idx < 2 ? 'border-b border-stone-100 lg:border-b-0' : ''} ${
                    idx > 0 ? 'lg:border-l lg:border-stone-100' : ''
                  }`}
                >
                  <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/80 bg-white transition-all duration-300 group-hover:scale-110 group-hover:border-amber-300 group-hover:bg-amber-50 sm:h-9 sm:w-9">
                    <stat.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-600" />
                  </div>
                  <StatValue
                    value={stat.value}
                    className="text-xl sm:text-2xl font-bold text-stone-900 mb-1 font-serif whitespace-nowrap tabular-nums"
                  />
                  <p className="max-w-[15rem] text-xs sm:text-[13px] text-stone-600 font-medium leading-relaxed">
                    {stat.label}
                  </p>
                </Reveal>
              ))}
            </div>
        </div>
      </div>

      <FactoryShowcase items={factoryGallery} />

      {/* Featured Collections (Versatile & Custom — products) */}
      <section aria-labelledby="home-collections-title" className="py-24 bg-stone-50 text-stone-900 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <Reveal variant="left" className="max-w-2xl">
              <SectionKicker>{t('home.collections.subtitle')}</SectionKicker>
              <h2 id="home-collections-title" className="text-4xl font-serif sm:text-5xl mb-4">{t('home.collections.title')}</h2>
              <p className="text-lg text-stone-600 font-light">
                {t('home.collections.desc')}
              </p>
            </Reveal>
            <Reveal variant="right" delay={150}>
              <Link to={lp('/products')} className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors group">
                {t('home.collections.viewAll')} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>
          </div>

          {/* Category directory — real URLs so crawlers can index each collection. */}
          <Reveal variant="blur" className="flex flex-wrap gap-2 mb-12">
            <Link
              to={lp('/products')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap bg-stone-900 text-white shadow-md hover:shadow-lg"
            >
              {t('products.allCategories', 'All Categories')}
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={lp(catalogCategoryPath(category))}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 hover:-translate-y-0.5 hover:shadow-sm"
              >
                {t(`products.categories.${category}`, category)}
              </Link>
            ))}
          </Reveal>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {featuredProducts.map((product, idx) => (
                <Reveal key={product.id} variant="blur" delay={idx * 80} className="transition-transform duration-500 hover:-translate-y-1.5">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    description={product.description}
                    image={product.images?.[0]}
                    category={product.category}
                    priceRange={product.price_range}
                    msrp={product.msrp}
                  />
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured Video — editor-picked video (site_settings.home_featured_video).
          Click-to-play facade: nothing but the poster loads until asked. */}
      <section className="border-y border-stone-200 bg-white py-16 sm:py-20" aria-labelledby="sourcing-solutions-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal variant="left" className="max-w-3xl">
              <SectionKicker>{solutionsUi.homeEyebrow}</SectionKicker>
              <h2 id="sourcing-solutions-title" className="mt-1 font-serif text-4xl text-stone-950 sm:text-5xl">
                {solutionsUi.homeHeading}
              </h2>
              <p className="mt-5 leading-7 text-stone-600">
                {solutionsUi.homeIntro}
              </p>
            </Reveal>
            <Reveal variant="right" delay={120}>
            <Link to={lp('/solutions')} className="group inline-flex items-center gap-2 text-sm font-semibold text-stone-900 transition-colors hover:text-amber-700">
              {solutionsUi.navLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            </Reveal>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {HOME_SOLUTION_SLUGS.map((slug) => solutionPages.find((page) => page.slug === slug))
                .filter((page): page is NonNullable<typeof page> => Boolean(page))
                .map((page, idx) => (
                <Reveal key={page.slug} delay={(idx % 3) * 90}>
                <Link
                  to={lp(`/solutions/${page.slug}`)}
                  className="group relative block h-full overflow-hidden rounded-2xl border border-stone-200 bg-[#FAF9F6] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-stone-900/5"
                >
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-amber-500 to-amber-300 transition-transform duration-500 group-hover:scale-x-100" />
                  <h3 className="text-lg font-medium text-stone-900 transition-colors group-hover:text-amber-800">{page.shortTitle || page.h1}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{page.blurb || page.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                    {solutionsUi.homeExplore} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

      {featuredVideo && <FeaturedVideo video={featuredVideo} />}

      {/* Manufacturing Advantage — 3 bullets (replaces former 4-step Process) */}
      <section aria-labelledby="home-advantage-title" className="py-24 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <SectionKicker centered>{t('home.advantage.subtitle')}</SectionKicker>
            <h2 id="home-advantage-title" className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4">{t('home.advantage.title')}</h2>
            <p className="text-lg text-stone-600 font-light leading-relaxed">{t('home.advantage.desc')}</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Factory className="w-7 h-7" />, key: 'f1' },
              { icon: <Truck className="w-7 h-7" />, key: 'f2' },
              { icon: <DollarSign className="w-7 h-7" />, key: 'f3' }
            ].map((item, i) => (
              <Reveal
                key={item.key}
                delay={i * 100}
                className="group relative overflow-hidden bg-stone-50 p-8 rounded-2xl border border-stone-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-200 hover:shadow-xl hover:shadow-stone-900/5"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-amber-500 to-amber-300 transition-transform duration-500 group-hover:scale-x-100" />
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/30">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3">{t(`home.advantage.features.${item.key}.title`)}</h3>
                <p className="text-stone-600 leading-relaxed text-sm">{t(`home.advantage.features.${item.key}.desc`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Process — new 6-step block */}
      <section aria-labelledby="home-process-title" className="py-24 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <SectionKicker centered>{t('home.manufacturingProcess.subtitle')}</SectionKicker>
            <h2 id="home-process-title" className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4">{t('home.manufacturingProcess.title')}</h2>
            <p className="text-lg text-stone-600 font-light">{t('home.manufacturingProcess.desc')}</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(['s1','s2','s3','s4','s5','s6'] as const).map((key, idx) => (
              <Reveal key={key} variant="blur" delay={(idx % 3) * 100} className="group relative overflow-hidden bg-white p-8 rounded-2xl border border-stone-200 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-200 hover:shadow-xl hover:shadow-stone-900/5">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-amber-500 to-amber-300 transition-transform duration-500 group-hover:scale-x-100" />
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center transition-all duration-300 group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/30">
                    <span className="text-base font-serif font-bold text-amber-700 transition-colors duration-300 group-hover:text-white">{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-stone-900 mb-2">{t(`home.manufacturingProcess.steps.${key}.title`)}</h3>
                    <p className="text-stone-600 text-sm font-light leading-relaxed">{t(`home.manufacturingProcess.steps.${key}.desc`)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner With Bolen */}
      <section aria-labelledby="home-whyus-title" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 id="home-whyus-title" className="text-4xl font-serif text-stone-900 sm:text-5xl leading-tight">
              {t('home.whyUs.title1')} <span className="italic text-amber-700">{t('home.whyUs.title2')}</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Globe className="w-8 h-8" />, idx: 0 },
              { icon: <DollarSign className="w-8 h-8" />, idx: 1 },
              { icon: <ShieldCheck className="w-8 h-8" />, idx: 2 },
              { icon: <Palette className="w-8 h-8" />, idx: 3 }
            ].map((item, i) => (
              <Reveal
                key={i}
                variant="scale"
                delay={i * 80}
                className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-stone-100 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-200 hover:shadow-xl hover:shadow-stone-900/5"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-amber-500 to-amber-300 transition-transform duration-500 group-hover:scale-x-100" />
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/30">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-4">
                  {(t('home.whyUs.features', { returnObjects: true }) as any[])[item.idx]?.title}
                </h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  {(t('home.whyUs.paragraphs', { returnObjects: true }) as string[])[item.idx]}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach (About) */}
      <div id="about" className="py-24 overflow-hidden bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl leading-tight mb-6">
              {t('home.about.title1')} <span className="italic text-amber-700">{t('home.about.title2')}</span>
            </h2>
            <p className="text-lg text-stone-600 font-light leading-relaxed">
              {t('home.about.desc1')}
            </p>
          </Reveal>

          <Reveal variant="scale" delay={150} className="relative w-full">
            <div className="aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl relative border border-stone-200">
              <Suspense fallback={<div className="w-full h-full bg-stone-200 animate-pulse rounded-3xl" />}>
                <MotionProvider>
                  <GlobalMap />
                </MotionProvider>
              </Suspense>
            </div>

            {/* Decorative element */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-stone-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />
          </Reveal>
        </div>
      </div>

      {/* Certificates Section */}
      <section aria-labelledby="home-certificates-title" className="py-16 bg-white border-t border-stone-100 overflow-hidden">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <SectionKicker centered>{t('home.certificates.subtitle')}</SectionKicker>
          <h2 id="home-certificates-title" className="text-3xl font-serif text-stone-900">{t('home.certificates.title')}</h2>
        </Reveal>

        <div className="relative w-full overflow-hidden flex group marquee-mask">
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite;
              }
              .group:hover .animate-marquee {
                animation-play-state: paused;
              }
            `}
          </style>

          <div className="flex animate-marquee whitespace-nowrap w-max">
            {/* First set of images */}
            {CERTS.map((cert, idx) => (
              <div key={`cert-1-${idx}`} className="mx-8 flex-none w-48 h-32 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300">
                <img src={cert.url} alt={cert.alt} className="max-w-full max-h-full object-contain" width="192" height="128" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </div>
            ))}
            {/* Duplicate set for seamless scrolling */}
            {CERTS.map((cert, idx) => (
              <div key={`cert-2-${idx}`} className="mx-8 flex-none w-48 h-32 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300">
                <img src={cert.url} alt={cert.alt} className="max-w-full max-h-full object-contain" width="192" height="128" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section aria-labelledby="home-cta-title" className="relative bg-stone-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          {/* Decorative — the CTA copy sits on top, so this carries no meaning
              for screen readers. Was a random picsum.photos placeholder. */}
          <img src={optimizeImage(CTA_BACKDROP, { width: 1600 })} alt="" aria-hidden="true" className="cta-drift w-full h-full object-cover opacity-20" width="1200" height="400" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-stone-900/80" />
          {/* Warm glow behind the copy so the band doesn't read as flat dark. */}
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[420px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal variant="blur" className="mb-6 flex justify-center">
            <span aria-hidden="true" className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </Reveal>
          <Reveal as="h2" id="home-cta-title" variant="blur" delay={60} className="text-4xl font-serif text-white sm:text-5xl mb-6">
            {t('home.cta.title')}
          </Reveal>
          <Reveal as="p" variant="blur" delay={140} className="text-xl text-stone-300 font-light mb-10">
            {t('home.cta.desc')}
          </Reveal>
          <Reveal variant="blur" delay={220} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={lp('/products')} className="btn-primary px-8 py-4 text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30">
              {t('home.cta.viewCatalog')}
            </Link>
            <Link to={lp('/rfq')} className="btn-secondary-on-dark px-8 py-4 text-base transition-all duration-300 hover:-translate-y-0.5">
              {t('home.cta.contactSales')}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
