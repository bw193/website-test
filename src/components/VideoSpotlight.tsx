import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VideoPoster from './VideoPoster';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { formatBlogDate } from '../utils/blog';
import { formatVideoDuration } from '../utils/video';
import type { VideoListItem } from '../types/video';

/**
 * Hero feature for the video library — the newest clip as a split card: its
 * poster on one side, title and context on the other. Links to the watch page
 * rather than playing inline so the dedicated URL earns the view.
 */
export default function VideoSpotlight({ video, label }: { video: VideoListItem; label?: string }) {
  const { t } = useTranslation();
  const { lp, lang } = useLocalizedPath();
  const duration = formatVideoDuration(video.duration_seconds);
  const date = video.published_at ? formatBlogDate(video.published_at, lang) : '';
  const categoryLabel = video.category
    ? t(`videos.categories.${video.category}`, video.category)
    : t('videos.cardLabel', 'Video');

  return (
    <Link
      to={lp(`/videos/${video.slug}`)}
      className="group grid overflow-hidden rounded-3xl bg-white/[0.06] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/10 backdrop-blur-sm transition-colors duration-500 hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[26rem]">
        <VideoPoster
          fill
          aspect="portrait"
          src={video.thumbnail_url}
          alt=""
          loading="eager"
          fetchPriority="high"
          widths={[480, 720, 960]}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 24rem"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/0 to-stone-950/20"
          />
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-stone-950 shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-400 sm:h-[4.5rem] sm:w-[4.5rem]">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </span>
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-stone-950/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300 backdrop-blur">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {label || t('videos.spotlightLabel', 'Latest video')}
          </span>
          {duration && (
            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 rounded-md bg-stone-950/75 px-2.5 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur"
            >
              {duration}
            </span>
          )}
        </VideoPoster>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
          <span>{categoryLabel}</span>
          {date && (
            <>
              <span aria-hidden="true" className="text-white/40">
                ·
              </span>
              <time dateTime={video.published_at || undefined} className="text-stone-300">
                {date}
              </time>
            </>
          )}
        </p>
        <h2 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl lg:text-[2.1rem] lg:leading-[1.15]">
          {video.title}
        </h2>
        {video.excerpt && (
          <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-stone-300 sm:line-clamp-4">{video.excerpt}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
          {duration && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {duration}
            </span>
          )}
          {video.tags
            .filter((tag) => tag.length <= 24)
            .slice(0, 3)
            .map((tag) => (
              <span key={tag} className="normal-case tracking-normal text-stone-400">
                #{tag}
              </span>
            ))}
        </div>
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors group-hover:text-amber-300">
          {t('videos.watchNow', 'Watch now')}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
