import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VideoPoster from './VideoPoster';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { formatBlogDate } from '../utils/blog';
import { formatVideoDuration } from '../utils/video';
import type { VideoListItem } from '../types/video';

type VideoCardVariant = 'grid' | 'compact';

export function videoCategoryPath(lp: (path: string) => string, category: string): string {
  return `${lp('/videos')}?category=${encodeURIComponent(category)}`;
}

/**
 * Card for the video library grid (and the compact "Up next" list on watch
 * pages). Editorial styling in line with ProductCard / BlogCard: a rounded
 * 4:5 poster, amber category line, serif title — no card chrome.
 */
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
  const href = lp(`/videos/${video.slug}`);
  const duration = formatVideoDuration(video.duration_seconds);
  const date = video.published_at ? formatBlogDate(video.published_at, lang) : '';
  const categoryLabel = video.category
    ? t(`videos.categories.${video.category}`, video.category)
    : t('videos.cardLabel', 'Video');
  const watchLabel = t('videos.watchLabel', { title: video.title, defaultValue: 'Watch: {{title}}' }) as string;
  const loading = index < 4 ? 'eager' : 'lazy';

  if (variant === 'compact') {
    return (
      <article className="group">
        <Link
          to={href}
          className="-m-2 flex gap-4 rounded-xl p-2 transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <VideoPoster
            src={video.thumbnail_url}
            alt=""
            loading={loading}
            widths={[200, 400]}
            sizes="6rem"
            className="w-20 shrink-0 rounded-lg ring-1 ring-stone-900/5 sm:w-24"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          >
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-950 shadow transition-colors duration-300 group-hover:bg-amber-400">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
            </span>
            {duration && (
              <span
                aria-hidden="true"
                className="absolute bottom-1.5 right-1.5 rounded bg-stone-950/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white"
              >
                {duration}
              </span>
            )}
          </VideoPoster>
          <div className="min-w-0 flex-1 py-0.5">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">{categoryLabel}</p>
            <h3 className="mt-1 line-clamp-3 text-sm font-semibold leading-snug text-stone-900 transition-colors group-hover:text-amber-800">
              {video.title}
            </h3>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-stone-500">
              {date && <time dateTime={video.published_at || undefined}>{date}</time>}
              {duration && (
                <>
                  {date && <span aria-hidden="true">·</span>}
                  <span className="sr-only">{t('videos.duration', 'Duration')}: </span>
                  <span>{duration}</span>
                </>
              )}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col">
      <Link
        to={href}
        aria-label={watchLabel}
        className="relative block overflow-hidden rounded-2xl ring-1 ring-stone-900/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6]"
      >
        <VideoPoster
          src={video.thumbnail_url}
          alt=""
          loading={loading}
          widths={[420, 640, 960]}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/0 to-stone-950/0 opacity-90 transition-opacity duration-500 group-hover:opacity-100"
          />
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-stone-950 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-400">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </span>
          {duration && (
            <span
              aria-hidden="true"
              className="absolute bottom-3 right-3 rounded-md bg-stone-950/80 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur"
            >
              {duration}
            </span>
          )}
        </VideoPoster>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          {video.category ? (
            <Link
              to={videoCategoryPath(lp, video.category)}
              className="truncate text-amber-700 transition-colors hover:text-amber-800"
            >
              {categoryLabel}
            </Link>
          ) : (
            <span className="truncate text-amber-700">{categoryLabel}</span>
          )}
          {date && (
            <>
              <span aria-hidden="true" className="text-stone-300">
                ·
              </span>
              <time dateTime={video.published_at || undefined} className="shrink-0 font-medium tracking-wider text-stone-500">
                {date}
              </time>
            </>
          )}
        </div>
        <h3 className="mt-2 font-serif text-[1.2rem] leading-snug text-stone-900 transition-colors group-hover:text-amber-800">
          <Link to={href} className="line-clamp-2 focus:outline-none focus-visible:underline">
            {video.title}
          </Link>
        </h3>
        {video.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{video.excerpt}</p>}
      </div>
    </article>
  );
}
