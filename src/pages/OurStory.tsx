import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  Building2,
  Check,
  ClipboardList,
  Cog,
  Factory,
  Handshake,
  Info,
  PackageCheck,
  Play,
  Ruler,
  ShieldCheck,
  Truck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import VideoPlayer from '../components/VideoPlayer';
import { hasSupabaseConfig } from '../supabaseConfig';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { imageSrcSet, optimizeImage } from '../utils/optimizeImage';
import { parseFeaturedVideoSlug, toVideoListItem, VIDEO_LIST_COLUMNS } from '../utils/video';
import { buildStorySchema, STORY_COMPANY } from '../utils/storySchema';
import type { FactoryGalleryItem } from '../utils/prerenderData';
import type { VideoListItem, VideoPost } from '../types/video';

const STORAGE = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public';

const FALLBACK_GALLERY: FactoryGalleryItem[] = [
  {
    url: `${STORAGE}/product-images/site-assets/factory/1783993292006-xx5h5wp.jpg`,
    alt: 'Exterior of the BOLEN mirror factory in Jiaxing',
    caption: 'Factory',
  },
  {
    url: `${STORAGE}/product-images/site-assets/factory/1783993628976-7k63tu7.jpg`,
    alt: 'BOLEN research and development office building',
    caption: 'R&D office',
  },
  {
    url: `${STORAGE}/product-images/site-assets/factory/1781488046745-8cu9cp3.jpg`,
    alt: 'Mirror production machinery inside the BOLEN factory',
    caption: 'Machinery',
  },
  {
    url: `${STORAGE}/product-images/site-assets/factory/1781488060099-nqszgrq.jpg`,
    alt: 'Mirror inventory prepared for production',
    caption: 'Mirror inventory',
  },
  {
    url: `${STORAGE}/product-images/site-assets/factory/1781487853038-khnb1yn.jpg`,
    alt: 'BOLEN mirror assembly line',
    caption: 'Assembly line',
  },
  {
    url: `${STORAGE}/product-images/site-assets/factory/1783993424750-1mr3q2t.jpg`,
    alt: 'BOLEN mirror production line',
    caption: 'Production line',
  },
  {
    url: `${STORAGE}/product-images/site-assets/factory/1783995671948-dtkebxh.jpg`,
    alt: 'Finished mirror warehouse',
    caption: 'Warehouse',
  },
  {
    url: `${STORAGE}/product-images/site-assets/factory/1783995731015-93qn9wa.jpg`,
    alt: 'Packed mirrors being loaded for shipping',
    caption: 'Loading & shipping',
  },
];

const FALLBACK_VIDEO: VideoListItem = {
  id: 'story-factory-film',
  slug: 'focused-on-led-mirror-manufacturing-over-21-years-of-industry-expertise',
  source_type: 'upload',
  video_url: `${STORAGE}/product-videos/videos/1783923690429-bcbuyr8.mp4`,
  embed_url: null,
  thumbnail_url: `${STORAGE}/product-videos/thumbnails/1783923690429-u3i4oc0.jpg`,
  category: 'Factory',
  tags: ['factory', 'manufacturing'],
  duration_seconds: null,
  published_at: null,
  title: 'BOLEN Professional Mirror Manufacturer (Jiaxing Chengtai Mirror)',
  excerpt: 'A closer look at BOLEN mirror manufacturing in Jiaxing.',
};

const CERTIFICATES = [
  { url: `${STORAGE}/comp%20image/au.png`, label: 'SAA' },
  { url: `${STORAGE}/comp%20image/CE(1)(1).jpg`, label: 'CE' },
  { url: `${STORAGE}/comp%20image/IP44.jpg`, label: 'IP44' },
  { url: `${STORAGE}/comp%20image/UKCA.jpg`, label: 'UKCA' },
  { url: `${STORAGE}/comp%20image/UL2.jpg`, label: 'UL' },
  { url: `${STORAGE}/comp%20image/ctce.png`, label: 'CCC' },
] as const;

type ProcessKey = 'brief' | 'specification' | 'manufacturing' | 'inspection' | 'packaging' | 'logistics';

const PROCESS_META: Array<{ key: ProcessKey; icon: LucideIcon; imageIndex: number }> = [
  { key: 'brief', icon: ClipboardList, imageIndex: 1 },
  { key: 'specification', icon: Ruler, imageIndex: 2 },
  { key: 'manufacturing', icon: Cog, imageIndex: 4 },
  { key: 'inspection', icon: ShieldCheck, imageIndex: 5 },
  { key: 'packaging', icon: PackageCheck, imageIndex: 6 },
  { key: 'logistics', icon: Truck, imageIndex: 7 },
];

const PROCESS_FALLBACK: Record<ProcessKey, { label: string; title: string; description: string; checks: [string, string, string] }> = {
  brief: {
    label: 'Brief',
    title: 'Start with the requirement, not the template.',
    description: 'We align on use case, target market, volume, timing, and commercial priorities before a specification is fixed.',
    checks: ['Application and market', 'Target quantity and timing', 'Commercial priorities'],
  },
  specification: {
    label: 'Specification',
    title: 'Turn the brief into a buildable specification.',
    description: 'Dimensions, finish, lighting, controls, smart functions, packaging, and branding are confirmed for the selected model.',
    checks: ['Dimensions and finish', 'Lighting and controls', 'Branding and packaging'],
  },
  manufacturing: {
    label: 'Manufacturing',
    title: 'Coordinate the making under one roof.',
    description: 'Glass work, frame preparation, lighting integration, assembly, and finishing are coordinated through the factory workflow.',
    checks: ['Material preparation', 'Lighting integration', 'Assembly and finishing'],
  },
  inspection: {
    label: 'Inspection',
    title: 'Check what the customer will actually receive.',
    description: 'Appearance, functions, workmanship, and packing readiness are reviewed against the confirmed product requirement.',
    checks: ['Finish and edge', 'Lighting and controls', 'Packing readiness'],
  },
  packaging: {
    label: 'Packaging',
    title: 'Prepare the product for its route to market.',
    description: 'Packing is matched to the product and order, including private-label presentation where it has been specified.',
    checks: ['Product protection', 'Labels and inserts', 'Private-label details'],
  },
  logistics: {
    label: 'Logistics',
    title: 'Close the loop with shipment coordination.',
    description: 'The team coordinates packing completion, shipment scheduling, and the handover of confirmed order documentation.',
    checks: ['Shipment schedule', 'Loading coordination', 'Order documentation'],
  },
};

function safeGallery(raw: string | null | undefined): FactoryGalleryItem[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const seen = new Set<string>();
    const cleaned = parsed
      .filter((item): item is { url: string; alt?: string; caption?: string } => item && typeof item.url === 'string')
      .map((item) => ({
        url: item.url.trim(),
        alt: typeof item.alt === 'string' && item.alt.trim() ? item.alt.trim() : 'BOLEN mirror factory production line',
        caption: typeof item.caption === 'string' && item.caption.trim() ? item.caption.trim() : undefined,
      }))
      .filter((item) => item.url && !seen.has(item.url) && seen.add(item.url));
    return cleaned.length ? cleaned : null;
  } catch {
    return null;
  }
}

export default function OurStory() {
  const { t } = useTranslation();
  const { lang, lp } = useLocalizedPath();
  const [gallery, setGallery] = useState<FactoryGalleryItem[]>(FALLBACK_GALLERY);
  const [featuredVideo, setFeaturedVideo] = useState<VideoListItem>(FALLBACK_VIDEO);
  const [productCount, setProductCount] = useState(78);
  const [videoCount, setVideoCount] = useState(13);
  const [activeProcess, setActiveProcess] = useState<ProcessKey>('inspection');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [activeChapter, setActiveChapter] = useState('company');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const processTabsRef = useRef<HTMLDivElement | null>(null);
  const processTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback }) as string;
  const localizedNumber = useMemo(() => new Intl.NumberFormat(lang), [lang]);

  const chapters = [
    { id: 'company', label: tx('ourStoryPage.chapters.company', 'Company'), icon: Building2 },
    { id: 'factory', label: tx('ourStoryPage.chapters.factory', 'Factory'), icon: Factory },
    { id: 'making', label: tx('ourStoryPage.chapters.making', 'Making'), icon: Cog },
    { id: 'quality', label: tx('ourStoryPage.chapters.quality', 'Quality'), icon: BadgeCheck },
    { id: 'partnership', label: tx('ourStoryPage.chapters.partnership', 'Partnership'), icon: Handshake },
  ];

  const processes = PROCESS_META.map((meta) => {
    const fallback = PROCESS_FALLBACK[meta.key];
    const root = `ourStoryPage.process.steps.${meta.key}`;
    return {
      ...meta,
      label: tx(`${root}.label`, fallback.label),
      title: tx(`${root}.title`, fallback.title),
      description: tx(`${root}.description`, fallback.description),
      checks: [
        tx(`${root}.check1`, fallback.checks[0]),
        tx(`${root}.check2`, fallback.checks[1]),
        tx(`${root}.check3`, fallback.checks[2]),
      ],
    };
  });

  const selectedProcess = processes.find((step) => step.key === activeProcess) ?? processes[3];
  const processImage = gallery[selectedProcess.imageIndex % gallery.length] ?? gallery[0];
  const activeGallery = gallery[activeGalleryIndex] ?? gallery[0];

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    let cancelled = false;

    const refreshStoryData = async () => {
      try {
        const { supabase } = await import('../supabase');
        const [settingsResult, productsResult, videosResult] = await Promise.all([
          supabase.from('site_settings').select('key, value').in('key', ['factory_gallery', 'home_featured_video']),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('videos').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        ]);

        if (cancelled) return;
        if (typeof productsResult.count === 'number') setProductCount(productsResult.count);
        if (typeof videosResult.count === 'number') setVideoCount(videosResult.count);

        if (!settingsResult.error && settingsResult.data) {
          const galleryValue = settingsResult.data.find((row) => row.key === 'factory_gallery')?.value;
          const liveGallery = safeGallery(galleryValue);
          if (liveGallery) setGallery(liveGallery);

          const videoSetting = settingsResult.data.find((row) => row.key === 'home_featured_video')?.value;
          const slug = parseFeaturedVideoSlug(videoSetting);
          if (slug) {
            const { data } = await supabase
              .from('videos')
              .select(VIDEO_LIST_COLUMNS)
              .eq('slug', slug)
              .eq('status', 'published')
              .maybeSingle();
            if (!cancelled && data) setFeaturedVideo(toVideoListItem(data as VideoPost, lang));
          }
        }
      } catch {
        // The verified fallback snapshot keeps the page complete offline.
      }
    };

    void refreshStoryData();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    setActiveGalleryIndex((index) => Math.min(index, Math.max(0, gallery.length - 1)));
  }, [gallery.length]);

  useEffect(() => {
    const index = processes.findIndex((step) => step.key === activeProcess);
    const tab = processTabRefs.current[index];
    const list = processTabsRef.current;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - (list.clientWidth - tab.clientWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activeProcess, lang]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = chapters
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveChapter(visible.target.id);
      },
      { rootMargin: '-20% 0px -58% 0px', threshold: [0, 0.15, 0.35, 0.6] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const chooseProcess = (index: number, focus = false) => {
    const nextIndex = (index + processes.length) % processes.length;
    setActiveProcess(processes[nextIndex].key);
    if (focus) processTabRefs.current[nextIndex]?.focus();
  };

  const moveGallery = (delta: number) => {
    setActiveGalleryIndex((index) => (index + delta + gallery.length) % gallery.length);
  };

  const storyTitle = t('seo.storyTitle') as string;
  const storyDescription = t('seo.storyDesc') as string;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-amber-200 selection:text-stone-950">
      <SEO
        title={storyTitle}
        description={storyDescription}
        path="/our-story"
        schema={buildStorySchema(lang, storyTitle, storyDescription)}
      />

      <section className="bg-[#F3EFE7] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:py-8" aria-labelledby="story-hero-title">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative h-[300px] overflow-hidden rounded-[1.5rem] bg-stone-800 sm:h-[390px] lg:min-h-[590px]">
            <img
              src={optimizeImage(gallery[0]?.url, { width: 1600, height: 850, resize: 'cover', quality: 85 })}
              srcSet={imageSrcSet(gallery[0]?.url, [768, 1200, 1600], {
                heightForWidth: (width) => Math.round(width * 0.54),
                quality: 85,
                resize: 'cover',
              })}
              sizes="(min-width: 1280px) 1280px, 100vw"
              alt={gallery[0]?.alt || 'BOLEN mirror factory in Jiaxing'}
              className="h-full w-full object-cover object-center"
              width="1600"
              height="850"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/24 via-transparent to-stone-950/10" />
          </div>

          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-4 -mt-16 rounded-[1.25rem] border border-white/80 bg-[#FAF9F6]/95 p-6 shadow-[0_24px_70px_rgba(28,25,23,0.16)] backdrop-blur-sm sm:mx-8 sm:p-9 lg:absolute lg:left-10 lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-[520px] lg:-translate-y-1/2 lg:p-12"
          >
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              {tx('ourStoryPage.hero.kicker', 'Jiaxing Chengtai Mirror Co., Ltd.')}
            </p>
            <h1 id="story-hero-title" className="font-serif text-[2.65rem] leading-[0.98] tracking-tight text-stone-950 sm:text-5xl lg:text-[3.6rem]">
              {tx('ourStoryPage.hero.titleLine1', 'Built here.')}{' '}
              <span className="block italic text-stone-500">{tx('ourStoryPage.hero.titleLine2', 'Trusted beyond.')}</span>
            </h1>
            <p className="mt-6 max-w-md text-[0.98rem] leading-7 text-stone-600">
              {tx(
                'ourStoryPage.hero.description',
                'Since 2005, BOLEN has turned buyer requirements into mirrors made, checked, packed, and prepared for markets around the world from our Jiaxing facility.'
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => scrollToSection('making')} className="btn-primary min-h-11">
                {tx('ourStoryPage.hero.tourCta', 'Take the factory tour')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollToSection('company')} className="btn-secondary min-h-11">
                {tx('ourStoryPage.hero.factsCta', 'Our company facts')}
              </button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-5 text-xs font-medium text-stone-500">
              <span>{tx('ourStoryPage.hero.city', 'Jiaxing')}</span>
              <span aria-hidden="true">·</span>
              <span>{localizedNumber.format(STORY_COMPANY.facilitySquareMeters)} {tx('ourStoryPage.hero.facilitySuffix', 'm² facility')}</span>
              <span aria-hidden="true">·</span>
              <span>{localizedNumber.format(productCount)} {tx('ourStoryPage.hero.productsSuffix', 'live products')}</span>
            </div>
          </m.div>
        </div>
      </section>

      <div className="border-b border-stone-200 bg-[#FAF9F6] lg:hidden">
        <nav
          aria-label={tx('ourStoryPage.accessibility.chapterNavigation', 'Story chapters')}
          className="hide-scrollbar mx-auto flex max-w-7xl snap-x gap-2 overflow-x-auto px-4 py-4 sm:px-6"
        >
          {chapters.map((chapter, index) => {
            const Icon = chapter.icon;
            const active = activeChapter === chapter.id;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => scrollToSection(chapter.id)}
                aria-current={active ? 'step' : undefined}
                className={`flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  active ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-xs tabular-nums text-stone-400">{String(index + 1).padStart(2, '0')}</span>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {chapter.label}
              </button>
            );
          })}
        </nav>
      </div>

      <section id="story-journal" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <nav
              aria-label={tx('ourStoryPage.accessibility.chapterNavigation', 'Story chapters')}
              className="sticky top-28"
            >
              <ol className="space-y-2">
                {chapters.map((chapter, index) => {
                  const active = activeChapter === chapter.id;
                  return (
                    <li key={chapter.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(chapter.id)}
                        aria-current={active ? 'step' : undefined}
                        className={`group relative flex min-h-[4.6rem] w-full items-center gap-4 border-l-2 pl-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-4 ${
                          active ? 'border-amber-500 text-stone-950' : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700'
                        }`}
                      >
                        <span className={`text-xs font-semibold tabular-nums ${active ? 'text-amber-700' : ''}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-semibold">{chapter.label}</span>
                        {active && <span className="absolute -left-[5px] h-2 w-2 rounded-full bg-amber-500 ring-4 ring-[#FAF9F6]" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 space-y-24 sm:space-y-28">
            <section id="company" data-story-section className="scroll-mt-24" aria-labelledby="company-title">
              <Reveal className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr] xl:items-end">
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {tx('ourStoryPage.company.eyebrow', 'Company / Verified profile')}
                  </p>
                  <h2 id="company-title" className="font-serif text-4xl leading-[1.04] tracking-tight text-stone-950 sm:text-5xl">
                    {tx('ourStoryPage.company.titleLine1', 'A manufacturing story')}{' '}
                    <span className="italic text-stone-500">{tx('ourStoryPage.company.titleLine2', 'with a clear address.')}</span>
                  </h2>
                </div>
                <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                  {tx(
                    'ourStoryPage.company.description',
                    'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) was established in 2005. Our team develops and manufactures LED, smart, vanity, bath, and decorative mirrors for OEM and ODM programs from Jiaxing, Zhejiang.'
                  )}
                </p>
              </Reveal>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    icon: Building2,
                    value: String(STORY_COMPANY.foundedYear),
                    label: tx('ourStoryPage.company.foundedLabel', 'Established'),
                    note: tx('ourStoryPage.company.foundedNote', 'Company founding year'),
                  },
                  {
                    icon: Factory,
                    value: `${localizedNumber.format(STORY_COMPANY.facilitySquareMeters)} m²`,
                    label: tx('ourStoryPage.company.facilityLabel', 'Production footprint'),
                    note: tx('ourStoryPage.company.facilityNote', 'Jiaxing manufacturing facility'),
                  },
                  {
                    icon: Users,
                    value: `${localizedNumber.format(STORY_COMPANY.minimumEmployees)}+`,
                    label: tx('ourStoryPage.company.teamLabel', 'Skilled specialists'),
                    note: tx('ourStoryPage.company.teamNote', 'Production and support team'),
                  },
                  {
                    icon: Boxes,
                    value: localizedNumber.format(productCount),
                    label: tx('ourStoryPage.company.catalogLabel', 'Live catalog'),
                    note: tx('ourStoryPage.company.catalogNote', 'Products currently published'),
                  },
                ].map((fact, index) => {
                  const Icon = fact.icon;
                  return (
                    <Reveal key={fact.label} delay={index * 70} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                      <div className="mb-7 flex items-center justify-between">
                        <Icon className="h-5 w-5 text-amber-700" aria-hidden="true" />
                        <span className="h-px w-10 bg-stone-200" />
                      </div>
                      <p className="font-serif text-4xl tracking-tight text-stone-950">{fact.value}</p>
                      <p className="mt-3 text-sm font-semibold text-stone-800">{fact.label}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">{fact.note}</p>
                    </Reveal>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-100/70 px-5 py-4 text-xs leading-5 text-stone-500 sm:flex-row sm:items-center">
                <span className="font-semibold uppercase tracking-[0.14em] text-stone-700">
                  {tx('ourStoryPage.company.snapshotLabel', 'Live company snapshot')}
                </span>
                <span>{tx('ourStoryPage.company.snapshotNote', 'Catalog and media counts refresh from the website database.')}</span>
              </div>
            </section>

            <section id="making" data-story-section className="scroll-mt-24" aria-labelledby="making-title">
              <Reveal className="mb-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {tx('ourStoryPage.process.eyebrow', 'Making / From brief to shipment')}
                  </p>
                  <h2 id="making-title" className="font-serif text-4xl leading-[1.04] tracking-tight text-stone-950 sm:text-5xl">
                    {tx('ourStoryPage.process.titleLine1', 'One order.')}{' '}
                    <span className="italic text-stone-500">{tx('ourStoryPage.process.titleLine2', 'Six visible stages.')}</span>
                  </h2>
                </div>
                <p className="max-w-2xl text-base leading-7 text-stone-600">
                  {tx(
                    'ourStoryPage.process.description',
                    'Select a stage to see how requirements move through specification, manufacturing, inspection, packing, and logistics.'
                  )}
                </p>
              </Reveal>

              <div
                ref={processTabsRef}
                role="tablist"
                aria-label={tx('ourStoryPage.accessibility.processTabs', 'Manufacturing stages')}
                className="hide-scrollbar flex snap-x overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-sm"
              >
                {processes.map((step, index) => {
                  const Icon = step.icon;
                  const active = activeProcess === step.key;
                  return (
                    <button
                      key={step.key}
                      ref={(node) => { processTabRefs.current[index] = node; }}
                      id={`process-tab-${step.key}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls={`process-panel-${step.key}`}
                      tabIndex={active ? 0 : -1}
                      onClick={() => chooseProcess(index)}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowRight') { event.preventDefault(); chooseProcess(index + 1, true); }
                        if (event.key === 'ArrowLeft') { event.preventDefault(); chooseProcess(index - 1, true); }
                        if (event.key === 'Home') { event.preventDefault(); chooseProcess(0, true); }
                        if (event.key === 'End') { event.preventDefault(); chooseProcess(processes.length - 1, true); }
                      }}
                      className={`relative flex min-h-14 min-w-[9rem] flex-1 snap-start items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 ${
                        active ? 'bg-amber-50 text-amber-800' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      {step.label}
                      {active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}
              </div>

              <m.div
                key={selectedProcess.key}
                id={`process-panel-${selectedProcess.key}`}
                role="tabpanel"
                aria-labelledby={`process-tab-${selectedProcess.key}`}
                aria-label={tx('ourStoryPage.accessibility.processPanel', 'Selected manufacturing stage')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.22 }}
                className="mt-7 grid min-h-[520px] overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm md:grid-cols-[0.42fr_0.58fr]"
              >
                <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
                  <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    {React.createElement(selectedProcess.icon, { className: 'h-5 w-5', 'aria-hidden': true })}
                  </span>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    {selectedProcess.label}
                  </p>
                  <h3 className="font-serif text-3xl leading-[1.08] tracking-tight text-stone-950 sm:text-4xl">
                    {selectedProcess.title}
                  </h3>
                  <p className="mt-5 text-[0.95rem] leading-7 text-stone-600">{selectedProcess.description}</p>
                  <ul className="mt-8 space-y-4">
                    {selectedProcess.checks.map((check) => (
                      <li key={check} className="flex items-center gap-3 text-sm font-medium text-stone-700">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-amber-700">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative min-h-[300px] bg-stone-200 md:min-h-full">
                  <img
                    src={optimizeImage(processImage.url, { width: 1100, height: 800, resize: 'cover' })}
                    srcSet={imageSrcSet(processImage.url, [640, 900, 1200], {
                      heightForWidth: (width) => Math.round(width * 0.73),
                      resize: 'cover',
                    })}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    alt={processImage.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    width="1100"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/35 via-transparent to-transparent" />
                  <p className="absolute bottom-5 left-5 rounded-full bg-stone-950/75 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                    {processImage.caption || processImage.alt}
                  </p>
                </div>
              </m.div>
            </section>

            <section id="factory" data-story-section className="scroll-mt-24" aria-labelledby="factory-title">
              <Reveal className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {tx('ourStoryPage.gallery.eyebrow', 'Factory / Editor-managed views')}
                  </p>
                  <h2 id="factory-title" className="font-serif text-4xl tracking-tight text-stone-950 sm:text-5xl">
                    {tx('ourStoryPage.gallery.title', 'Inside the Jiaxing facility')}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                  {tx('ourStoryPage.gallery.description', 'Select a current factory view—from R&D and machinery to assembly, warehouse, and loading.')}
                </p>
              </Reveal>

              <div aria-label={tx('ourStoryPage.accessibility.factoryGallery', 'Factory image gallery')}>
                <div className="grid gap-4 lg:grid-cols-[1.22fr_0.78fr]">
                  <m.figure
                    key={activeGallery.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-stone-200"
                  >
                    <img
                      src={optimizeImage(activeGallery.url, { width: 1200, height: 675, resize: 'cover' })}
                      srcSet={imageSrcSet(activeGallery.url, [640, 900, 1200], {
                        heightForWidth: (width) => Math.round(width * 0.5625),
                        resize: 'cover',
                      })}
                      sizes="(min-width: 1024px) 62vw, 100vw"
                      alt={activeGallery.alt}
                      className="h-full w-full object-cover"
                      width="1200"
                      height="675"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-stone-950/80 to-transparent p-5 pt-16 text-white">
                      <figcaption className="max-w-md text-sm font-medium">{activeGallery.caption || activeGallery.alt}</figcaption>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveGallery(-1)}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-stone-950/50 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-white"
                          aria-label={tx('ourStoryPage.gallery.previous', 'Previous factory image')}
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGallery(1)}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-stone-950/50 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-white"
                          aria-label={tx('ourStoryPage.gallery.next', 'Next factory image')}
                        >
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </m.figure>

                  <div className="hide-scrollbar grid auto-cols-[8.5rem] grid-flow-col gap-3 overflow-x-auto pb-1 lg:grid-flow-row lg:grid-cols-2 lg:overflow-visible lg:pb-0">
                    {gallery.slice(0, 6).map((item, index) => {
                      const active = index === activeGalleryIndex;
                      return (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => setActiveGalleryIndex(index)}
                          aria-pressed={active}
                          aria-label={`${tx('ourStoryPage.gallery.selectImage', 'Show image')} ${index + 1}: ${item.caption || item.alt}`}
                          className={`group relative aspect-[4/3] min-w-0 overflow-hidden rounded-xl border-2 bg-stone-200 text-left transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                            active ? 'border-amber-500 shadow-md' : 'border-transparent hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={optimizeImage(item.url, { width: 420, height: 315, resize: 'cover' })}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            width="420"
                            height="315"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/85 to-transparent px-3 pb-2 pt-8 text-xs font-semibold text-white">
                            {item.caption || item.alt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="sr-only" aria-live="polite">
                  {tx('ourStoryPage.gallery.activeImage', 'Selected factory image')}: {activeGallery.caption || activeGallery.alt}
                </p>
              </div>
            </section>

            <section className="scroll-mt-24" aria-labelledby="film-title">
              <div className="relative min-h-[410px] overflow-hidden rounded-[1.25rem] bg-stone-950 sm:min-h-[360px]">
                {videoPlaying ? (
                  <>
                    <VideoPlayer video={featuredVideo} autoPlay className="absolute inset-0 h-full w-full [&>video]:h-full" />
                    <button
                      type="button"
                      onClick={() => setVideoPlaying(false)}
                      className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-stone-950/75 text-white backdrop-blur-sm hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Close video player"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <img
                      src={optimizeImage(featuredVideo.thumbnail_url, { width: 1400, height: 520, resize: 'cover', quality: 85 })}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover opacity-65"
                      width="1400"
                      height="520"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/75 to-stone-950/20" />
                    <div className="relative z-[1] flex min-h-[410px] max-w-xl flex-col justify-center p-7 text-white sm:min-h-[360px] sm:p-10">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                        {tx('ourStoryPage.film.eyebrow', 'Featured film / Factory floor')}
                      </p>
                      <h2 id="film-title" className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-[2.7rem]">
                        {tx('ourStoryPage.film.title', 'BOLEN Professional Mirror Manufacturer')}
                      </h2>
                      <p className="mt-5 max-w-lg text-sm leading-6 text-stone-300 sm:text-base">
                        {tx('ourStoryPage.film.description', 'Watch the current editor-selected factory film for a closer view of the people, equipment, and production environment.')}
                      </p>
                      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={() => setVideoPlaying(true)} className="btn-primary min-h-11">
                          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                          {tx('ourStoryPage.film.watchFilm', 'Watch factory film')}
                        </button>
                        <Link to={lp('/videos')} className="btn-secondary-on-dark min-h-11">
                          {tx('ourStoryPage.film.allVideos', 'View all videos')} ({localizedNumber.format(videoCount)})
                        </Link>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoPlaying(true)}
                      className="absolute right-[13%] top-1/2 z-[2] hidden h-20 w-20 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/15 text-white backdrop-blur-md transition-transform hover:scale-105 hover:bg-white hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-white md:flex"
                      aria-label={tx('ourStoryPage.film.play', 'Play factory film')}
                    >
                      <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </section>

            <section id="quality" data-story-section className="scroll-mt-24" aria-labelledby="quality-title">
              <div className="overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:p-10">
                  <Reveal>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                      {tx('ourStoryPage.quality.eyebrow', 'Quality / Documentation')}
                    </p>
                    <h2 id="quality-title" className="font-serif text-4xl leading-[1.05] tracking-tight text-stone-950">
                      {tx('ourStoryPage.quality.titleLine1', 'Proof belongs')}{' '}
                      <span className="italic text-stone-500">{tx('ourStoryPage.quality.titleLine2', 'to the model.')}</span>
                    </h2>
                    <p className="mt-5 text-sm leading-6 text-stone-600 sm:text-base">
                      {tx('ourStoryPage.quality.description', 'Available conformity marks, ratings, and supporting documents are reviewed for the selected product and destination market.')}
                    </p>
                  </Reveal>

                  <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      {tx('ourStoryPage.quality.documentsLabel', 'Documentation examples shown on this website')}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {CERTIFICATES.map((certificate, index) => (
                        <Reveal key={certificate.label} delay={index * 55} as="figure" className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
                          <img
                            src={optimizeImage(certificate.url, { width: 220, height: 110, resize: 'contain' })}
                            alt={`${certificate.label} document graphic`}
                            className="h-12 w-full object-contain mix-blend-multiply"
                            width="220"
                            height="110"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                          />
                          <figcaption className="mt-3 text-xs font-semibold text-stone-700">{certificate.label}</figcaption>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-stone-200 bg-stone-100/70 px-7 py-4 text-xs leading-5 text-stone-600 sm:px-9 lg:px-10">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                  <p>{tx('ourStoryPage.quality.scopeNote', 'Coverage varies by model and destination market. Documentation is confirmed during quotation.')}</p>
                </div>
              </div>
            </section>

            <section id="partnership" data-story-section className="scroll-mt-24" aria-labelledby="partnership-title">
              <div className="relative overflow-hidden rounded-[1.25rem] bg-stone-950 px-7 py-14 text-white sm:px-10 sm:py-16 lg:px-14">
                <img
                  src={optimizeImage(gallery[7]?.url || gallery[0].url, { width: 1400, height: 500, resize: 'cover' })}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover opacity-20"
                  width="1400"
                  height="500"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-stone-950/55" />
                <div className="relative z-[1] grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                      {tx('ourStoryPage.partnership.eyebrow', 'Partnership / Your next brief')}
                    </p>
                    <h2 id="partnership-title" className="font-serif text-4xl leading-[1.03] tracking-tight sm:text-5xl">
                      {tx('ourStoryPage.partnership.titleLine1', 'Let’s build what')}{' '}
                      <span className="italic text-stone-400">{tx('ourStoryPage.partnership.titleLine2', 'comes next.')}</span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300">
                      {tx('ourStoryPage.partnership.description', 'Share your target market, product idea, quantity, and timing. Our team can help turn that brief into a practical quotation and specification.')}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-300">
                      <a href={`mailto:${STORY_COMPANY.email}`} className="underline decoration-stone-600 underline-offset-4 hover:text-white">
                        {tx('ourStoryPage.partnership.emailLabel', 'Email')}: {STORY_COMPANY.email}
                      </a>
                      <a href={`tel:${STORY_COMPANY.phone.replace(/\s/g, '')}`} className="underline decoration-stone-600 underline-offset-4 hover:text-white">
                        {tx('ourStoryPage.partnership.phoneLabel', 'Phone')}: {STORY_COMPANY.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <Link to={lp('/rfq')} className="btn-primary min-h-12 px-8">
                      {tx('ourStoryPage.partnership.primaryCta', 'Start a project')}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link to={lp('/products')} className="btn-secondary-on-dark min-h-12 px-8">
                      {tx('ourStoryPage.partnership.secondaryCta', 'Browse products')}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
