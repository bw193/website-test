import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, ChevronRight, Clock, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Markdown from '../components/Markdown';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import VideoCard, { videoCategoryPath } from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';
import VideoShare from '../components/VideoShare';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialVideoPost } from '../utils/prerenderData';
import { formatBlogDate } from '../utils/blog';
import {
  formatVideoDuration,
  getVideoPlayback,
  localizeVideo,
  recommendProductsForVideo,
  toIsoDuration,
  toVideoListItem,
  videoMimeType,
  VIDEO_LIST_COLUMNS,
} from '../utils/video';
import { buildVideoBreadcrumbSchema, buildVideoObjectSchema, videoDetailUrl } from '../utils/videoSchema';
import { runWhenIdle } from '../utils/idle';
import type { LocalizedVideoPost, ProductRecommendationInput, VideoListItem, VideoPost } from '../types/video';

const UP_NEXT_COUNT = 4;

/** Same-topic clips first, then the newest — what a buyer is likeliest to want next. */
function pickUpNext(current: LocalizedVideoPost, all: VideoPost[], lang: string): VideoListItem[] {
  return all
    .filter((item) => item.slug !== current.slug)
    .map((item) => toVideoListItem(item, lang))
    .sort(
      (a, b) =>
        Number(Boolean(b.category && b.category === current.category)) -
        Number(Boolean(a.category && a.category === current.category))
    )
    .slice(0, UP_NEXT_COUNT);
}

export default function VideoDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();

  const initial = readInitialVideoPost(slug);
  const [video, setVideo] = useState<LocalizedVideoPost | null>(initial);
  const [loading, setLoading] = useState(initial === null);
  const [relatedProducts, setRelatedProducts] = useState<ProductRecommendationInput[]>([]);
  const [upNext, setUpNext] = useState<VideoListItem[]>([]);

  useEffect(() => {
    let active = true;
    const initialVideo = readInitialVideoPost(slug);
    setVideo(initialVideo);
    setRelatedProducts([]);
    setUpNext([]);
    setLoading(initialVideo === null);

    const refreshVideo = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data } = await supabase
          .from('videos')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();
        const current = data ? localizeVideo(data as VideoPost, lang) : initialVideo;
        if (active) setVideo(current);
        if (!current) return;

        const [{ data: products }, { data: videoList }] = await Promise.all([
          supabase
            .from('products')
            .select('id, title, description, images, category, price_range, msrp')
            .order('created_at', { ascending: false }),
          supabase
            .from('videos')
            .select(VIDEO_LIST_COLUMNS)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(24),
        ]);
        if (!active) return;
        if (products) setRelatedProducts(recommendProductsForVideo(current, products as ProductRecommendationInput[], 4));
        if (videoList) setUpNext(pickUpNext(current, videoList as VideoPost[], lang));
      } catch (e) {
        console.error('Error fetching video', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (initialVideo) {
      const cancel = runWhenIdle(refreshVideo, 1500);
      return () => {
        active = false;
        cancel();
      };
    }

    refreshVideo();
    return () => {
      active = false;
    };
  }, [slug, lang]);

  if (loading && !video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-500" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] px-4 text-center">
        <SEO
          title={t('videos.notFound', 'Video not found')}
          description={t('videos.notFoundDescription', 'The requested BOLEN video could not be found.')}
          path={`/videos/${slug}`}
          noindex
          alternateLanguages={[]}
        />
        <p className="font-serif text-3xl text-stone-900">{t('videos.notFound', 'Video not found')}</p>
        <Link to={lp('/videos')} className="mt-5 text-sm font-semibold text-amber-800 hover:underline">
          {t('videos.backToVideos', 'Back to videos')}
        </Link>
      </div>
    );
  }

  const seoTitle = video.seo_title || `${video.title} | BOLEN Mirror Videos`;
  const seoDesc = video.seo_description || video.excerpt;
  const canonical = videoDetailUrl(lang, video.slug);
  const playback = getVideoPlayback(video);
  const ogVideo =
    playback.kind === 'video'
      ? { url: playback.src, type: videoMimeType(playback.src) || 'video/mp4' }
      : playback.kind === 'embed'
        ? { url: playback.src, type: 'text/html' }
        : undefined;
  const duration = formatVideoDuration(video.duration_seconds);
  const date = video.published_at ? formatBlogDate(video.published_at, lang) : '';
  const categoryLabel = video.category ? t(`videos.categories.${video.category}`, video.category) : '';

  return (
    <article className="bg-[#FAF9F6] text-stone-800 selection:bg-amber-200/60 selection:text-stone-900">
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/videos/${video.slug}`}
        ogType="video.other"
        ogImage={video.thumbnail_url || undefined}
        ogVideo={ogVideo}
        schema={[buildVideoObjectSchema(video, lang), buildVideoBreadcrumbSchema(video, lang)]}
      />

      {/* ── Cinema band ─────────────────────────────────────────────────── */}
      <section className="bg-stone-950 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-white/55">
            <Link to={lp('/')} className="shrink-0 whitespace-nowrap transition-colors hover:text-white">
              {t('navbar.home')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <Link to={lp('/videos')} className="shrink-0 whitespace-nowrap transition-colors hover:text-white">
              {t('navbar.videos', 'Videos')}
            </Link>
            {categoryLabel && video.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <Link
                  to={videoCategoryPath(lp, video.category)}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-white"
                >
                  {categoryLabel}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate text-white/85" aria-current="page">
              {video.title}
            </span>
          </nav>

          <div className="mt-6 overflow-hidden rounded-2xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 sm:rounded-3xl">
            <VideoPlayer video={video} priority />
          </div>
        </div>
      </section>

      {/* ── Title, body and sidebar ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
          <div className="min-w-0">
            <header>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                {categoryLabel && video.category && (
                  <Link
                    to={videoCategoryPath(lp, video.category)}
                    className="font-semibold text-amber-700 transition-colors hover:text-amber-800"
                  >
                    {categoryLabel}
                  </Link>
                )}
                {date && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    <time dateTime={video.published_at || undefined}>{date}</time>
                  </span>
                )}
                {duration && video.duration_seconds && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">{t('videos.duration', 'Duration')}: </span>
                    <time dateTime={toIsoDuration(video.duration_seconds)}>{duration}</time>
                  </span>
                )}
              </div>
              <h1 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-[2.75rem]">
                {video.title}
              </h1>
              {video.excerpt && <p className="mt-5 text-lg leading-8 text-stone-700">{video.excerpt}</p>}
              <VideoShare url={canonical} title={video.title} className="mt-7" />
            </header>

            {video.body && (
              <Markdown
                className="prose prose-stone prose-lg mt-12 max-w-none border-t border-stone-200 pt-10
                  prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-stone-900
                  prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-3xl
                  prose-h3:text-2xl
                  prose-p:leading-relaxed prose-p:text-stone-700
                  prose-a:font-medium prose-a:text-amber-800 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-stone-900
                  prose-blockquote:border-l-2 prose-blockquote:border-amber-500 prose-blockquote:bg-stone-100/60 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-stone-700
                  prose-img:rounded-2xl prose-img:shadow-sm
                  prose-li:text-stone-700 prose-li:marker:text-amber-600"
              >
                {video.body}
              </Markdown>
            )}

            {video.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-6">
                <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('videos.tagsLabel', 'Topics')}
                </span>
                {video.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
            <div className="relative isolate overflow-hidden rounded-3xl bg-stone-900 p-7 text-white shadow-lg">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_100%_0%,rgba(245,158,11,0.24),transparent_70%)]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                {t('videos.sidebarKicker', 'Specify this mirror')}
              </p>
              <h2 className="mt-3 font-serif text-2xl leading-snug">{t('videos.ctaTitle', 'Need this mirror for your line?')}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {t(
                  'videos.ctaDesc',
                  'Send the clip or product reference to BOLEN and our team can quote OEM/ODM options, packaging, and lead time.'
                )}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link to={lp('/rfq')} className="btn-primary w-full">
                  {t('videos.ctaQuote', 'Contact Sales')}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to={lp('/products')} className="btn-secondary-on-dark w-full">
                  {t('videos.ctaCatalog', 'Browse products')}
                </Link>
              </div>
            </div>

            {upNext.length > 0 && (
              <section aria-labelledby="up-next-heading">
                <div className="flex items-end justify-between gap-4 border-b border-stone-200 pb-3">
                  <h2 id="up-next-heading" className="font-serif text-xl text-stone-900">
                    {t('videos.upNext', 'Up next')}
                  </h2>
                  <Link
                    to={lp('/videos')}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 transition-colors hover:text-amber-800"
                  >
                    {t('videos.viewAll', 'View all')}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <ul className="mt-5 space-y-5">
                  {upNext.map((item, index) => (
                    <li key={item.id}>
                      <VideoCard video={item} index={index + 3} variant="compact" />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* ── Products seen in the clip ───────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-200 bg-white" aria-labelledby="video-products-heading">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-600">
                  <span aria-hidden="true" className="h-px w-8 bg-amber-500/70" />
                  {t('videos.relatedProductsKicker', 'From the catalog')}
                </p>
                <h2 id="video-products-heading" className="mt-3 font-serif text-3xl text-stone-900 md:text-4xl">
                  {t('videos.relatedProducts', 'Products in this video')}
                </h2>
              </div>
              <Link
                to={lp('/products')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 transition-colors hover:text-amber-800"
              >
                {t('videos.ctaCatalog', 'Browse products')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description || ''}
                  image={product.images?.[0] || ''}
                  category={product.category || undefined}
                  priceRange={product.price_range || undefined}
                  msrp={product.msrp || undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Back to the library ─────────────────────────────────────────── */}
      <section className="border-t border-stone-200 bg-[#FAF9F6]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">
              {t('videos.closing.title', 'Seen a mirror you want to specify?')}
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-stone-600">
              {t(
                'videos.closing.desc',
                'Send us the video or product reference. We reply with OEM/ODM options, MOQ, packaging and lead time — and can film a custom demo of your specification.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Link to={lp('/rfq')} className="btn-primary">
              {t('videos.ctaQuote', 'Contact Sales')}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to={lp('/videos')} className="btn-secondary">
              {t('videos.backToVideos', 'Back to videos')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
