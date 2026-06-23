import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Play, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { optimizeImage, imageSrcSet } from '../utils/optimizeImage';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { formatBlogDate } from '../utils/blog';
import { formatVideoDuration } from '../utils/video';
import type { VideoListItem } from '../types/video';

const FALLBACK_THUMB =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

export default function VideoCard({ video, index = 0 }: { video: VideoListItem; index?: number }) {
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();
  const thumb = video.thumbnail_url || FALLBACK_THUMB;
  const duration = formatVideoDuration(video.duration_seconds);
  const categoryLabel = video.category
    ? t(`videos.categories.${video.category}`, video.category)
    : t('videos.cardLabel', 'Video');

  return (
    <Link to={lp(`/videos/${video.slug}`)} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-video overflow-hidden bg-stone-900">
          <img
            src={optimizeImage(thumb, { width: 700 })}
            srcSet={imageSrcSet(thumb, [400, 700, 1000])}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            alt={video.title}
            width="700"
            height="394"
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/10 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-900 backdrop-blur">
            <Video className="h-3.5 w-3.5 text-amber-600" />
            {categoryLabel}
          </span>
          {duration && (
            <span className="absolute bottom-4 right-4 rounded-md bg-stone-950/80 px-2 py-1 text-xs font-semibold text-white">
              {duration}
            </span>
          )}
          <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-stone-950 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-bold leading-tight text-stone-900 transition-colors group-hover:text-amber-700">
            {video.title}
          </h3>
          <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500">{video.excerpt}</p>
          <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-xs font-medium uppercase tracking-wider text-stone-400">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{video.published_at ? formatBlogDate(video.published_at, lang) : t('videos.latest', 'Latest')}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
