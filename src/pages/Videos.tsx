import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Factory, MonitorPlay, Search, SearchX, Video as VideoIcon, Wrench, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import VideoCard from '../components/VideoCard';
import VideoSpotlight from '../components/VideoSpotlight';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialVideoList } from '../utils/prerenderData';
import { optimizeImage } from '../utils/optimizeImage';
import { FALLBACK_VIDEO_THUMB, toVideoListItem, VIDEO_LIST_COLUMNS } from '../utils/video';
import { buildVideoIndexSchema } from '../utils/videoSchema';
import { runWhenIdle } from '../utils/idle';
import type { VideoListItem, VideoPost } from '../types/video';

const CATEGORY_PARAM = 'category';

/**
 * Editorial guide cards under the grid. Each maps to the first matching
 * category present in the library (filtering the grid in place); when none is
 * published yet the card links to the closest evergreen page instead, so the
 * internal links never dead-end.
 */
const GUIDE_CARDS = [
  {
    key: 'demos',
    icon: MonitorPlay,
    categories: ['Product Demo', 'Smart Features', 'Technology'],
    fallback: '/products',
    title: 'Product demos',
    desc: 'LED colour modes, stepless dimming, anti-fog, touch sensors and smart features shown on real production units — not renders.',
    cta: 'Watch product demos',
  },
  {
    key: 'factory',
    icon: Factory,
    categories: ['Factory Tour', 'Quality Control'],
    fallback: '/our-story',
    title: 'Factory & quality control',
    desc: 'Glass cutting, LED assembly, IP44 testing and packing inside the 46,800 m² Jiaxing plant that ships your order.',
    cta: 'See the factory',
  },
  {
    key: 'install',
    icon: Wrench,
    categories: ['Installation'],
    fallback: '/solutions',
    title: 'Installation & specifications',
    desc: 'Mounting, wiring and handling details that help installers, retailers and project buyers plan ahead.',
    cta: 'Installation videos',
  },
] as const;

function CategoryPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6] ${
        active
          ? 'border-stone-900 bg-stone-900 text-white'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900'
      }`}
    >
      {label}
      {typeof count === 'number' && (
        <span className={`text-xs tabular-nums ${active ? 'text-stone-300' : 'text-stone-400'}`}>{count}</span>
      )}
    </button>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-stone-200" />
          <div className="mt-4 h-3 w-24 rounded bg-stone-200" />
          <div className="mt-3 h-6 w-3/4 rounded bg-stone-200" />
          <div className="mt-3 h-4 w-full rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

export default function Videos() {
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = readInitialVideoList();
  const [videos, setVideos] = useState<VideoListItem[]>(initial ?? []);
  const [loading, setLoading] = useState(initial === null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    const refreshVideos = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase
          .from('videos')
          .select(VIDEO_LIST_COLUMNS)
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (error) throw error;
        if (active && data) setVideos((data as VideoPost[]).map((video) => toVideoListItem(video, lang)));
      } catch (e) {
        console.error('Error fetching videos', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (initial) {
      const cancel = runWhenIdle(refreshVideos, 2500);
      return () => {
        active = false;
        cancel();
      };
    }

    refreshVideos();
    return () => {
      active = false;
    };
  }, [lang]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    videos.forEach((video) => {
      if (video.category) counts.set(video.category, (counts.get(video.category) || 0) + 1);
    });
    return counts;
  }, [videos]);
  const categories = useMemo(() => Array.from(categoryCounts.keys()), [categoryCounts]);

  const requestedCategory = searchParams.get(CATEGORY_PARAM);
  const activeCat = requestedCategory && categories.includes(requestedCategory) ? requestedCategory : null;
  const setCategory = (category: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (category) next.set(CATEGORY_PARAM, category);
    else next.delete(CATEGORY_PARAM);
    setSearchParams(next, { replace: true });
  };
  const applyCategoryAndScroll = (category: string) => {
    setCategory(category);
    document.getElementById('video-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = Boolean(activeCat || normalizedQuery);
  const filtered = useMemo(
    () =>
      videos.filter((video) => {
        if (activeCat && video.category !== activeCat) return false;
        if (!normalizedQuery) return true;
        return `${video.title} ${video.excerpt} ${video.category || ''} ${video.tags.join(' ')} ${video.search_text || ''}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [videos, activeCat, normalizedQuery]
  );

  const spotlight = videos[0];
  const gridItems = isFiltering ? filtered : videos.slice(1);
  const totalMinutes = Math.round(videos.reduce((sum, video) => sum + (video.duration_seconds || 0), 0) / 60);
  const latestDate = videos.find((video) => video.published_at)?.published_at;

  const titleLead = t('videos.titleLead', 'LED mirror videos:');
  const titleAccent = t('videos.titleAccent', 'product demos, factory tours & installation');
  const heroBackdrop = spotlight?.thumbnail_url || FALLBACK_VIDEO_THUMB;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 selection:bg-amber-200/60 selection:text-stone-900">
      <SEO
        title={t('videos.metaTitle', 'LED Mirror Videos: Product Demos, Factory Tours & Installation | BOLEN')}
        description={t(
          'videos.metaDescription',
          'Watch BOLEN LED mirror videos: smart mirror product demos, 46,800 m² factory tours, quality-control footage and installation guides from a 21-year OEM/ODM mirror manufacturer.'
        )}
        path="/videos"
        ogImage={spotlight?.thumbnail_url || undefined}
        schema={buildVideoIndexSchema(lang, videos)}
      />

      {/* ── Hero: copy + spotlight over a blurred still of the newest clip ── */}
      <section className="relative isolate overflow-hidden bg-stone-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img
            src={optimizeImage(heroBackdrop, { width: 64, quality: 40 })}
            alt=""
            className="h-full w-full scale-125 object-cover opacity-50 blur-3xl saturate-150"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/80 to-stone-950" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_30%,rgba(245,158,11,0.16),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <div>
              <Reveal as="p" className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
                <span aria-hidden="true" className="h-px w-8 bg-amber-500/70" />
                {t('videos.kicker', 'Video library')}
              </Reveal>
              <Reveal as="h1" delay={70} className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                {titleLead}
                {lang === 'zh' ? '' : ' '}
                <span className="italic text-stone-400">{titleAccent}</span>
              </Reveal>
              <Reveal as="p" delay={140} className="mt-6 max-w-xl text-lg font-light leading-relaxed text-stone-300">
                {t(
                  'videos.intro',
                  'See how BOLEN LED, smart, vanity and bathroom mirrors are built, tested and installed — short clips shot in our own Jiaxing factory that answer sourcing questions before you specify a product.'
                )}
              </Reveal>

              <Reveal delay={210} className="mt-8 flex flex-wrap gap-3">
                <Link to={lp('/rfq')} className="btn-primary">
                  {t('videos.heroPrimaryCta', 'Request a quote')}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to={lp('/products')} className="btn-secondary-on-dark">
                  {t('videos.heroSecondaryCta', 'Browse products')}
                </Link>
              </Reveal>

              {videos.length > 0 && (
                <Reveal delay={280}>
                  <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/10 pt-6">
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                        {t('videos.stats.videos', 'Videos')}
                      </dt>
                      <dd className="mt-1 font-serif text-3xl tabular-nums text-white">{videos.length}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                        {t('videos.stats.topics', 'Topics')}
                      </dt>
                      <dd className="mt-1 font-serif text-3xl tabular-nums text-white">{categories.length}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                        {t('videos.stats.runtime', 'Minutes of footage')}
                      </dt>
                      <dd className="mt-1 font-serif text-3xl tabular-nums text-white">{Math.max(totalMinutes, 1)}</dd>
                    </div>
                  </dl>
                  {latestDate && (
                    <p className="mt-4 text-xs text-stone-400">
                      {t('videos.stats.updated', 'Last updated')}{' '}
                      <time dateTime={latestDate} className="text-stone-300">
                        {new Date(latestDate).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                    </p>
                  )}
                </Reveal>
              )}
            </div>

            <div className="lg:pl-4">
              {spotlight ? (
                <Reveal variant="scale" delay={120}>
                  <VideoSpotlight video={spotlight} />
                </Reveal>
              ) : loading ? (
                <div className="min-h-[26rem] animate-pulse rounded-3xl bg-white/10" aria-hidden="true" />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── Library: toolbar + grid ─────────────────────────────────────── */}
      <section id="video-library" className="scroll-mt-24 border-b border-stone-200" aria-labelledby="video-library-heading">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-6 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="video-library-heading" className="font-serif text-3xl text-stone-900 sm:text-4xl">
                {t('videos.libraryHeading', 'All videos')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600" aria-live="polite">
                {videos.length > 0 && (
                  <>
                    <span className="font-medium text-stone-800">
                      {t('videos.resultsCount', {
                        count: isFiltering ? filtered.length : videos.length,
                        defaultValue: '{{count}} videos',
                      })}
                    </span>
                    <span aria-hidden="true"> · </span>
                  </>
                )}
                {t('videos.libraryIntro', 'Filter by topic or search the library.')}
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <label htmlFor="video-search" className="sr-only">
                {t('videos.searchLabel', 'Search videos')}
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                id="video-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('videos.search', 'Search videos...')}
                autoComplete="off"
                className="block w-full rounded-full border border-stone-200 bg-white py-2.5 pl-11 pr-11 text-sm text-stone-900 placeholder-stone-400 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={t('videos.clearSearch', 'Clear search')}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={t('videos.filterLabel', 'Filter videos by topic')}>
              <CategoryPill
                label={t('videos.allVideos', 'All videos')}
                count={videos.length}
                active={activeCat === null}
                onClick={() => setCategory(null)}
              />
              {categories.map((category) => (
                <CategoryPill
                  key={category}
                  label={t(`videos.categories.${category}`, category)}
                  count={categoryCounts.get(category)}
                  active={activeCat === category}
                  onClick={() => setCategory(activeCat === category ? null : category)}
                />
              ))}
            </div>
          )}

          {loading && videos.length === 0 ? (
            <GridSkeleton />
          ) : videos.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-stone-300 px-6 py-20 text-center">
              <VideoIcon className="mx-auto mb-4 h-10 w-10 text-stone-300" aria-hidden="true" />
              <p className="text-lg text-stone-600">{t('videos.empty', 'No videos published yet. Check back soon.')}</p>
            </div>
          ) : gridItems.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-stone-300 px-6 py-16 text-center" role="status">
              <SearchX className="mx-auto mb-4 h-10 w-10 text-stone-300" aria-hidden="true" />
              <p className="text-lg text-stone-700">{t('videos.noResults', 'No videos match your search.')}</p>
              <p className="mt-1 text-sm text-stone-500">
                {t('videos.noResultsHint', 'Try another keyword or clear the filters.')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory(null);
                }}
                className="btn-secondary mt-6"
              >
                {t('videos.clearFilters', 'Clear filters')}
              </button>
            </div>
          ) : (
            <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-live="polite">
              {gridItems.map((video, index) => (
                <li key={video.id}>
                  <VideoCard video={video} index={index} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── What the library covers ─────────────────────────────────────── */}
      <section className="bg-white" aria-labelledby="video-guide-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <Reveal as="p" className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-600">
              <span aria-hidden="true" className="h-px w-8 bg-amber-500/70" />
              {t('videos.guide.kicker', 'Shot in our own factory')}
            </Reveal>
            <Reveal as="h2" id="video-guide-heading" delay={60} className="mt-4 font-serif text-3xl text-stone-900 sm:text-4xl">
              {t('videos.guide.heading', 'What the library covers')}
            </Reveal>
            <Reveal as="p" delay={120} className="mt-4 text-[15px] leading-7 text-stone-600">
              {t(
                'videos.guide.intro',
                'Every clip is filmed on BOLEN production units and inside the 46,800 m² Jiaxing plant — no stock footage — so what you see is what ships.'
              )}
            </Reveal>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {GUIDE_CARDS.map(({ key, icon: Icon, categories: candidates, fallback, title, desc, cta: ctaDefault }, index) => {
              const matched = candidates.find((category) => categoryCounts.has(category));
              const cta = t(`videos.guide.${key}.cta`, ctaDefault);
              return (
                <Reveal key={key} delay={index * 80} className="group flex flex-col border-t border-stone-200 pt-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200/70">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-stone-900">{t(`videos.guide.${key}.title`, title)}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-7 text-stone-600">{t(`videos.guide.${key}.desc`, desc)}</p>
                  {matched ? (
                    <button
                      type="button"
                      onClick={() => applyCategoryAndScroll(matched)}
                      className="mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-stone-900 transition-colors hover:text-amber-800"
                    >
                      {cta}
                      <span className="text-xs font-medium tabular-nums text-stone-400">({categoryCounts.get(matched)})</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      to={lp(fallback)}
                      className="mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-stone-900 transition-colors hover:text-amber-800"
                    >
                      {cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <section className="border-t border-stone-200 bg-[#FAF9F6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl bg-stone-900 px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-14">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_85%_20%,rgba(245,158,11,0.22),transparent_70%)]" />
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl leading-tight sm:text-3xl">
                {t('videos.closing.title', 'Seen a mirror you want to specify?')}
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-stone-300">
                {t(
                  'videos.closing.desc',
                  'Send us the video or product reference. We reply with OEM/ODM options, MOQ, packaging and lead time — and can film a custom demo of your specification.'
                )}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
              <Link to={lp('/rfq')} className="btn-primary">
                {t('videos.ctaQuote', 'Contact Sales')}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to={lp('/products')} className="btn-secondary-on-dark">
                {t('videos.ctaCatalog', 'Browse products')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
