import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, ShieldCheck, Truck, Factory, Lightbulb, Users, Clock, CheckCircle2, ChevronRight, ChevronLeft, Settings, Palette, DollarSign } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import FeaturedVideo from '../components/FeaturedVideo';
import { optimizeImage } from '../utils/optimizeImage';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialHomeData, type FactoryGalleryItem } from '../utils/prerenderData';
import { parseFeaturedVideoSlug, toVideoListItem, VIDEO_LIST_COLUMNS } from '../utils/video';
import { buildVideoObjectSchema } from '../utils/videoSchema';
import { runWhenIdle } from '../utils/idle';
import type { VideoListItem, VideoPost } from '../types/video';
import { getLocalizedSeoLandingPages, getSeoSolutionsUi } from '../data/seoLandingI18n';
import { HOME_SOLUTION_SLUGS } from '../data/seoLandingPages';

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
const DEFAULT_CATEGORIES = [
  "New Arrival",
  "Hot Sale",
  "Led Lighted Mirror",
  "Bathroom Mirror without led",
  "Full Length Dressing Mirror",
  "Irregular Mirror",
];

const CERTS = [
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/au.png", alt: "SAA Australia certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/CE(1)(1).jpg", alt: "CE European conformity certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/IP44.jpg", alt: "IP44 water and dust resistance rating" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UKCA.jpg", alt: "UKCA United Kingdom conformity certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UL2.jpg", alt: "UL safety certification" },
  { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/ctce.png", alt: "CCC China compulsory certification" },
];

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
    initialData?.categories && initialData.categories.length > 0 ? initialData.categories : DEFAULT_CATEGORIES
  );
  const [factoryGallery, setFactoryGallery] = useState<FactoryGalleryItem[]>(
    initialData?.factoryGallery ?? []
  );
  const [featuredVideo, setFeaturedVideo] = useState<VideoListItem | null>(initialData?.featuredVideo ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const normalizeCategory = (cat: string | undefined | null) => {
    if (!cat) return '';
    return cat.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

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

    const refreshEditorContent = async () => {
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
      }
    };

    if (initialData) {
      const cancelIdle = runWhenIdle(refreshEditorContent, 2500);
      return () => {
        cancelled = true;
        cancelIdle();
      };
    }

    refreshEditorContent();
    return () => { cancelled = true; };
  }, [lang]);

  const featuredProducts = allProducts
    .filter(p => selectedCategory ? normalizeCategory(p.category) === normalizeCategory(selectedCategory) : true)
    .slice(0, 6);

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
            "email": "bolen2@cnjxctm.com",
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
              className={`w-full h-auto block ${animateSlides ? 'hero-fade' : ''}`}
              src={heroImgSrc(currentBgIndex)}
              srcSet={heroImgSrcSet(currentBgIndex)}
              sizes="100vw"
              width={heroW}
              height={heroH}
              alt="BOLEN LED bathroom mirror manufacturing showcase"
              referrerPolicy="no-referrer"
              fetchPriority="high"
              decoding="async"
            />
          )}
        </div>

        {heroBgs.length > 1 && (
          <>
            <button
              onClick={prevBg}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextBg}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            {/* Sit low in the frame: at sm:bottom-20 the dots landed on top of
                the certification badges baked into the banner artwork, which
                was hidden while the hero carried a heavy scrim and obvious once
                it didn't. */}
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroBgs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setAnimateSlides(true); setCurrentBgIndex(idx); }}
                  className="p-3"
                  aria-label={`Go to image ${idx + 1}`}
                ><span className={`block w-2.5 h-2.5 rounded-full transition-all ${idx === currentBgIndex ? 'bg-amber-400 w-8' : 'bg-white/50 hover:bg-white/80'}`} /></button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Value proposition band.
          Sits BELOW the banner rather than on top of it: the hero images are
          finished marketing artwork with their own headline and certification
          badges, so an overlay both fights that composition and needs a scrim
          heavy enough to smother the photo. Keeping it separate means the
          banner renders at full fidelity while the page still gets a visible,
          keyword-bearing h1 and the RFQ call to action — the hero previously
          had only an sr-only h1 and no CTA, and this translated copy
          (home.heroTitle1/2, home.heroDesc) sat unused in all six locales.
          The <img> markup, and therefore the LCP element and its preload, is
          untouched. */}
      {/* band-aurora paints a slow drifting amber wash via ::before, so the
          section needs a stacking context and clipped overflow. */}
      <div className="band-aurora relative isolate overflow-hidden bg-gradient-to-b from-stone-100 to-[#FAF9F6] text-stone-900">
        {/* pb is larger than pt because the stats card below overlaps this band
            by -mt-8/-mt-10 and would otherwise crowd the buttons. */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14 sm:pt-8 sm:pb-16 lg:pt-6 lg:pb-14">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 lg:items-center">
            {/* Kicker and h1 are one unit — keeping the kicker outside the grid
                left it pinned to the top while the h1 dropped to meet the right
                column, opening a dead gap between them. */}
            <div>
              <Reveal as="p" className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                {t('home.heroKicker')}
              </Reveal>
              <Reveal as="h1" delay={90} className="mt-2 font-serif text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.08]">
                {t('home.heroTitle1')}
                <span className="block italic text-sheen">{t('home.heroTitle2')}</span>
              </Reveal>
            </div>
            <div className="lg:border-l lg:border-stone-300/70 lg:pl-10">
              <Reveal as="p" delay={180} className="text-sm text-stone-600 font-light">
                {/* heroDesc contains <1>BOLEN</1>, so it must go through Trans
                    rather than t() or the markup renders as literal text. */}
                <Trans i18nKey="home.heroDesc" components={[<span key="0" />, <strong key="1" className="font-medium text-stone-900" />]} />
              </Reveal>
              <Reveal delay={270} className="mt-4 flex flex-wrap gap-3">
                <Link to={lp('/rfq')} className="btn-primary">
                  {t('home.heroPrimaryCta')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to={lp('/products')} className="btn-secondary">
                  {t('home.heroSecondaryCta')}
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-8 sm:-mt-10 z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-stone-100 py-3 px-2 sm:py-5 sm:px-6 lg:py-6 lg:px-8 flex overflow-x-auto sm:grid sm:grid-cols-4 sm:overflow-visible gap-0 sm:gap-4 lg:gap-6"
        >
          {[
            { icon: Factory, value: "46,800 m²", label: t('home.stats.sqMeters') },
            { icon: Users, value: "200+", label: t('home.stats.artisans') },
            { icon: Lightbulb, value: "200+", label: t('home.stats.styles') },
            { icon: Globe, value: "Global", label: t('home.stats.global') }
          ].map((stat, idx) => (
            <Reveal key={idx} delay={idx * 100} className="flex-1 min-w-0 flex flex-col items-center text-center group">
              <div className="hidden sm:flex h-10 w-10 rounded-full bg-stone-50 group-hover:bg-amber-50 items-center justify-center mb-2 transition-colors duration-300">
                <stat.icon className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-base sm:text-2xl font-bold text-stone-900 mb-0.5 font-serif whitespace-nowrap">{stat.value}</p>
              <p className="text-[10px] sm:text-[11px] text-stone-500 uppercase tracking-wide sm:tracking-wider font-semibold leading-tight">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Featured Collections (Versatile & Custom — products) */}
      <div className="py-24 bg-stone-50 text-stone-900 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <Reveal className="max-w-2xl">
              <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.collections.subtitle')}</span>
              <h2 className="text-4xl font-serif sm:text-5xl mb-4">{t('home.collections.title')}</h2>
              <p className="text-lg text-stone-600 font-light">
                {t('home.collections.desc')}
              </p>
            </Reveal>
            <Reveal delay={150}>
              <Link to={lp('/products')} className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors group">
                {t('home.collections.viewAll')} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>
          </div>

          {/* Category Filter */}
          <Reveal className="flex flex-wrap gap-2 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-stone-900 text-white shadow-md scale-105'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {t('products.allCategories', 'All Categories')}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-stone-900 text-white shadow-md scale-105'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {category}
              </button>
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
                <Reveal key={product.id} delay={idx * 80}>
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
      </div>

      {/* Featured Video — editor-picked video (site_settings.home_featured_video).
          Click-to-play facade: nothing but the poster loads until asked. */}
      <section className="border-y border-stone-200 bg-white py-16 sm:py-20" aria-labelledby="sourcing-solutions-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">{solutionsUi.homeEyebrow}</p>
              <h2 id="sourcing-solutions-title" className="mt-3 font-serif text-4xl text-stone-950 sm:text-5xl">
                {solutionsUi.homeHeading}
              </h2>
              <p className="mt-5 leading-7 text-stone-600">
                {solutionsUi.homeIntro}
              </p>
            </div>
            <Link to={lp('/solutions')} className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              {solutionsUi.navLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {HOME_SOLUTION_SLUGS.map((slug) => solutionPages.find((page) => page.slug === slug))
                .filter((page): page is NonNullable<typeof page> => Boolean(page))
                .map((page) => (
                <Link
                  key={page.slug}
                  to={lp(`/solutions/${page.slug}`)}
                  className="group rounded-2xl border border-stone-200 bg-[#FAF9F6] p-6 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg"
                >
                  <h3 className="text-lg font-medium text-stone-900 group-hover:text-amber-800">{page.shortTitle || page.h1}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{page.blurb || page.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                    {solutionsUi.homeExplore} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

      {featuredVideo && <FeaturedVideo video={featuredVideo} />}

      {/* Manufacturing Advantage — 3 bullets (replaces former 4-step Process) */}
      <div className="py-24 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.advantage.subtitle')}</span>
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4">{t('home.advantage.title')}</h2>
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
                className="bg-stone-50 p-8 rounded-2xl border border-stone-200 hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3">{t(`home.advantage.features.${item.key}.title`)}</h3>
                <p className="text-stone-600 leading-relaxed text-sm">{t(`home.advantage.features.${item.key}.desc`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Factory Showcase — editor-managed gallery (site_settings.factory_gallery).
          Lazy/responsive imgs, explicit dims => no LCP/CLS hit. */}
      {factoryGallery.length > 0 && (
        <section
          id="factory-showcase"
          aria-labelledby="factory-showcase-title"
          className="py-24 bg-stone-50 border-t border-stone-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
                {t('home.factoryShowcase.subtitle')}
              </span>
              <h2 id="factory-showcase-title" className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4">
                {t('home.factoryShowcase.title')}
              </h2>
              <p className="text-lg text-stone-600 font-light leading-relaxed">
                {t('home.factoryShowcase.desc')}
              </p>
            </Reveal>

            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              aria-label={t('home.factoryShowcase.title') as string}
            >
              {factoryGallery.map((item, idx) => (
                <Reveal as="li" key={`${item.url}-${idx}`} delay={(idx % 3) * 80}>
                  <figure className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
                      <img
                        src={optimizeImage(item.url, { width: 800 })}
                        srcSet={[400, 800, 1200].map((w) => `${optimizeImage(item.url, { width: w })} ${w}w`).join(', ')}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        width={800}
                        height={600}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {item.caption && (
                      <figcaption className="px-5 py-4 text-sm text-stone-700 font-medium leading-snug border-t border-stone-100">
                        {item.caption}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Manufacturing Process — new 6-step block */}
      <div className="py-24 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.manufacturingProcess.subtitle')}</span>
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4">{t('home.manufacturingProcess.title')}</h2>
            <p className="text-lg text-stone-600 font-light">{t('home.manufacturingProcess.desc')}</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(['s1','s2','s3','s4','s5','s6'] as const).map((key, idx) => (
              <Reveal key={key} delay={(idx % 3) * 100} className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                    <span className="text-base font-serif font-bold text-amber-700">{String(idx + 1).padStart(2, '0')}</span>
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
      </div>

      {/* Why Partner With Bolen */}
      <div className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl leading-tight">
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
                delay={i * 80}
                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
      </div>

      {/* Global Reach (About) */}
      <div id="about" className="py-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl leading-tight mb-6">
              {t('home.about.title1')} <span className="italic text-amber-700">{t('home.about.title2')}</span>
            </h2>
            <p className="text-lg text-stone-600 font-light leading-relaxed">
              {t('home.about.desc1')}
            </p>
          </Reveal>

          <Reveal delay={150} className="relative w-full">
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
      <div className="py-16 bg-white border-t border-stone-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.certificates.subtitle')}</span>
          <h2 className="text-3xl font-serif text-stone-900">{t('home.certificates.title')}</h2>
        </div>

        <div className="relative w-full overflow-hidden flex group">
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
              <div key={`cert-1-${idx}`} className="mx-8 flex-none w-48 h-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <img src={cert.url} alt={cert.alt} className="max-w-full max-h-full object-contain" width="192" height="128" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </div>
            ))}
            {/* Duplicate set for seamless scrolling */}
            {CERTS.map((cert, idx) => (
              <div key={`cert-2-${idx}`} className="mx-8 flex-none w-48 h-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <img src={cert.url} alt={cert.alt} className="max-w-full max-h-full object-contain" width="192" height="128" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-stone-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          {/* Decorative — the CTA copy sits on top, so this carries no meaning
              for screen readers. Was a random picsum.photos placeholder. */}
          <img src={optimizeImage(CTA_BACKDROP, { width: 1600 })} alt="" aria-hidden="true" className="w-full h-full object-cover opacity-20" width="1200" height="400" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-stone-900/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal as="h2" className="text-4xl font-serif text-white sm:text-5xl mb-6">
            {t('home.cta.title')}
          </Reveal>
          <Reveal as="p" delay={100} className="text-xl text-stone-300 font-light mb-10">
            {t('home.cta.desc')}
          </Reveal>
          <Reveal delay={150} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={lp('/products')} className="btn-primary px-8 py-4 text-base">
              {t('home.cta.viewCatalog')}
            </Link>
            <Link to={lp('/rfq')} className="btn-secondary-on-dark px-8 py-4 text-base">
              {t('home.cta.contactSales')}
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
