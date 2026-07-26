import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Play, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { optimizeImage, imageSrcSet } from '../utils/optimizeImage';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { formatBlogDate } from '../utils/blog';
import { FALLBACK_VIDEO_THUMB, formatVideoDuration } from '../utils/video';
import type { VideoListItem } from '../types/video';

type VideoCardVariant = 'grid' | 'compact';

const posterHeight = (width: number) => Math.round(width * 1.25);
const compactHeight = (width: number) => Math.round(width * 0.75);

export default function VideoCard({
  video,
  index = 0,
  variant = 'grid',
}: {
  video: VideoListItem;
  index?: number;
  variant?: VideoCardVariant;
}) {
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();
  const thumb = video.thumbnail_url || FALLBACK_VIDEO_THUMB;
  const duration = formatVideoDuration(video.duration_seconds);
  const categoryLabel = video.category
    ? t(`videos.categories.${video.category}`, video.category)
    : t('videos.cardLabel', 'Video');
  const loading = index < 2 ? 'eager' : 'lazy';

  if (variant === 'compact') {
    return (
      <Link to={lp(`/videos/${video.slug}`)} className="group block">
        <article className="flex gap-3 rounded-2xl border border-stone-100 bg-white p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
          <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-36">
            <img
              src={optimizeImage(thumb, { width: 420, height: 315, resize: 'cover' })}
              srcSet={imageSrcSet(thumb, [260, 420, 620], { heightForWidth: compactHeight, resize: 'cover' })}
              sizes="(max-width: 640px) 8rem, 9rem"
              alt={video.title}
              width="420"
              height="315"
              loading={loading}
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-stone-950/70 to-transparent" />
            <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-stone-950 shadow-sm">
              <Play className="h-4 w-4 fill-current" />
            </span>
            {duration && (
              <span className="absolute bottom-2 right-2 rounded-full bg-stone-950/82 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                {duration}
              </span>
            )}
          </div>
          <div className="min-w-0 flex flex-1 flex-col py-0.5 pr-1">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
              <Video className="h-3 w-3" />
              <span className="truncate">{categoryLabel}</span>
            </div>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-amber-700">
              {video.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500">{video.excerpt}</p>
            <div className="mt-auto flex items-center gap-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
              <CalendarDays className="h-3 w-3" />
              <span>{video.published_at ? formatBlogDate(video.published_at, lang) : t('videos.latest', 'Latest')}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={lp(`/videos/${video.slug}`)} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={optimizeImage(thumb, { width: 900, height: 1125, resize: 'cover' })}
            srcSet={imageSrcSet(thumb, [480, 720, 960], { heightForWidth: posterHeight, resize: 'cover' })}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            alt={video.title}
            width="900"
            height="1125"
            loading={loading}
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-stone-950/72 via-stone-950/28 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-white/94 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-900 shadow-sm backdrop-blur">
            <Video className="h-3.5 w-3.5 text-amber-600" />
            <span className="truncate">{categoryLabel}</span>
          </span>
          {duration && (
            <span className="absolute bottom-4 right-4 rounded-full bg-stone-950/82 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
              {duration}
            </span>
          )}
          <div
            className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-stone-950 shadow-lg transition-transform duration-300 group-hover:scale-110"
            aria-label={t('videos.cardLabel', 'Video')}
          >
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
