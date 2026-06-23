import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { m } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ArrowUpRight, CalendarDays, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';
import { useCurrentLang, useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialVideoPost } from '../utils/prerenderData';
import { formatBlogDate } from '../utils/blog';
import { localizeVideo, recommendProductsForVideo, toVideoListItem } from '../utils/video';
import { buildVideoBreadcrumbSchema, buildVideoObjectSchema } from '../utils/videoSchema';
import type { LocalizedVideoPost, ProductRecommendationInput, VideoListItem, VideoPost } from '../types/video';

const LIST_COLUMNS =
  'id, slug, source_type, video_url, embed_url, thumbnail_url, category, tags, duration_seconds, published_at, title, excerpt';

export default function VideoDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { lp } = useLocalizedPath();
  const lang = useCurrentLang();
  const { t } = useTranslation();

  const initial = readInitialVideoPost(slug);
  const [video, setVideo] = useState<LocalizedVideoPost | null>(initial);
  const [loading, setLoading] = useState(initial === null);
  const [relatedProducts, setRelatedProducts] = useState<ProductRecommendationInput[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<VideoListItem[]>([]);

  useEffect(() => {
    let active = true;
    const hasInitialVideo = readInitialVideoPost(slug) !== null;
    setLoading(!hasInitialVideo);

    const refreshVideo = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data } = await supabase
          .from('videos')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();
        const current = data ? localizeVideo(data as VideoPost, lang) : initial;
        if (active && current) setVideo(current);

        const [{ data: products }, { data: videoList }] = await Promise.all([
          supabase
            .from('products')
            .select('id, title, description, images, category, price_range, msrp')
            .order('created_at', { ascending: false }),
          supabase
            .from('videos')
            .select(LIST_COLUMNS)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(9),
        ]);

        if (active && current && products) {
          setRelatedProducts(recommendProductsForVideo(current, products as ProductRecommendationInput[], 4));
        }
        if (active && videoList) {
          const items = (videoList as VideoPost[])
            .filter((item) => item.slug !== slug)
            .map((item) => toVideoListItem(item, lang));
          setRelatedVideos(items.slice(0, 3));
        }
      } catch (e) {
        console.error('Error fetching video', e);
      } finally {
        if (active) setLoading(false);
      }
    };

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
        <p className="mb-4 font-serif text-3xl text-stone-900">{t('videos.notFound', 'Video not found')}</p>
        <Link to={lp('/videos')} className="font-medium text-amber-700 hover:underline">
          {t('videos.backToVideos', 'Back to videos')}
        </Link>
      </div>
    );
  }

  const seoTitle = video.seo_title || `${video.title} | BOLEN Mirror Videos`;
  const seoDesc = video.seo_description || video.excerpt;

  return (
    <article className="bg-[#FAF9F6] selection:bg-amber-200/60 selection:text-stone-900">
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/videos/${video.slug}`}
        ogType="video.other"
        ogImage={video.thumbnail_url || undefined}
        schema={[buildVideoObjectSchema(video, lang), buildVideoBreadcrumbSchema(video, lang)]}
      />

      <section className="bg-stone-950 px-4 pb-16 pt-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-medium text-white/55">
            <Link to={lp('/')} className="hover:text-white">
              {t('navbar.home')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={lp('/videos')} className="hover:text-white">
              {t('navbar.videos', 'Videos')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-white/80">{video.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-center">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
            >
              <VideoPlayer video={video} />
            </m.div>
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
            >
              {video.category && (
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-amber-400">
                  {t(`videos.categories.${video.category}`, video.category)}
                </p>
              )}
              <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{video.title}</h1>
              <p className="mt-6 text-lg font-light leading-relaxed text-stone-300">{video.excerpt}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-stone-400">
                {video.published_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatBlogDate(video.published_at, lang)}
                  </span>
                )}
                {video.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 px-3 py-1 text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
            </m.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {video.body ? (
          <div
            className="prose prose-stone prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-stone-900
              prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
              prose-p:font-light prose-p:leading-relaxed prose-p:text-stone-700"
          >
            <ReactMarkdown>{video.body}</ReactMarkdown>
          </div>
        ) : null}

      </div>

      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-200 bg-white/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="mb-10 font-serif text-3xl tracking-tight text-stone-900 md:text-4xl">
              {t('videos.relatedProducts', 'Related products')}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {relatedVideos.length > 0 && (
        <section className="border-t border-stone-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl tracking-tight text-stone-900 md:text-4xl">
                {t('videos.relatedVideos', 'More videos')}
              </h2>
              <Link to={lp('/videos')} className="hidden text-sm font-semibold text-stone-900 hover:text-amber-700 sm:inline-flex">
                {t('videos.viewAll', 'View all')}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {relatedVideos.map((item, index) => (
                <VideoCard key={item.id} video={item} index={index + 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-stone-200 bg-[#FAF9F6]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-stone-900 p-8 text-white md:p-10">
            <h2 className="font-serif text-2xl md:text-3xl">{t('videos.ctaTitle', 'Need this mirror for your line?')}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-300">
              {t(
                'videos.ctaDesc',
                'Send the clip or product reference to BOLEN and our team can quote OEM/ODM options, packaging, and lead time.'
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={lp('/rfq')}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400"
              >
                {t('videos.ctaQuote', 'Request a quote')}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to={lp('/products')}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:bg-white/10"
              >
                {t('videos.ctaCatalog', 'Browse products')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
