import React, { useState } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VideoPoster from './VideoPoster';
import { optimizeImage } from '../utils/optimizeImage';
import { buildPlaybackEmbedSrc, formatVideoDuration, getVideoPlayback } from '../utils/video';
import type { LocalizedVideoPost, VideoListItem } from '../types/video';

type PlayerVideo = Pick<
  LocalizedVideoPost | VideoListItem,
  'title' | 'source_type' | 'video_url' | 'embed_url' | 'thumbnail_url'
> & { duration_seconds?: number | null };

interface VideoPlayerProps {
  video: PlayerVideo;
  className?: string;
  /**
   * Mount the real player straight away instead of the poster facade. Only for
   * callers that already received a click (e.g. a "Play film" button) — the
   * user gesture is what lets unmuted autoplay through.
   */
  autoPlay?: boolean;
  /** The poster is the LCP candidate on watch pages; raise its fetch priority. */
  priority?: boolean;
  onPlay?: () => void;
}

const POSTER_WIDTHS = [640, 1024, 1600];

// Origins the YouTube / Vimeo players hit on load. Warmed on hover/focus of the
// facade so the connection cost is paid before the click, not after it.
const EMBED_ORIGINS: Record<string, string[]> = {
  youtube: ['https://www.youtube-nocookie.com', 'https://www.google.com'],
  vimeo: ['https://player.vimeo.com', 'https://i.vimeocdn.com', 'https://f.vimeocdn.com'],
};
const warmed = new Set<string>();

function warmConnections(src: string) {
  if (typeof document === 'undefined') return;
  const provider = /vimeo\.com/i.test(src) ? 'vimeo' : /youtube(-nocookie)?\.com/i.test(src) ? 'youtube' : '';
  for (const origin of EMBED_ORIGINS[provider] || []) {
    if (warmed.has(origin)) continue;
    warmed.add(origin);
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    document.head.appendChild(link);
  }
}

/**
 * Watch-page player. Renders a poster facade first — a YouTube iframe alone is
 * ~500 KB of script, so nothing third-party loads until the visitor presses
 * play. The click swaps in the iframe (privacy-enhanced host, autoplay=1) or a
 * native <video> for self-hosted files. Structured data on the page carries
 * the VideoObject, so crawlers don't depend on the player being mounted.
 */
export default function VideoPlayer({ video, className = '', autoPlay = false, priority = false, onPlay }: VideoPlayerProps) {
  const { t } = useTranslation();
  const playback = getVideoPlayback(video);
  const [activated, setActivated] = useState(autoPlay);
  const duration = formatVideoDuration(video.duration_seconds);

  const activate = () => {
    if (activated) return;
    setActivated(true);
    onPlay?.();
  };

  const playLabel = t('videos.playLabel', { title: video.title, defaultValue: 'Play video: {{title}}' }) as string;

  return (
    <div className={`relative aspect-video overflow-hidden bg-stone-950 ${className}`.trim()}>
      {playback.kind === 'missing' ? (
        <VideoPoster fill aspect="video" src={video.thumbnail_url} alt="" loading="eager" imgClassName="opacity-40">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <VideoOff className="h-10 w-10 text-white/70" aria-hidden="true" />
            <p className="text-sm font-medium text-white/85">
              {t('videos.unavailable', 'This video is temporarily unavailable.')}
            </p>
          </div>
        </VideoPoster>
      ) : !activated ? (
        <VideoPoster
          fill
          aspect="video"
          src={video.thumbnail_url}
          alt=""
          loading="eager"
          fetchPriority={priority ? 'high' : undefined}
          widths={POSTER_WIDTHS}
          sizes="(max-width: 1280px) 100vw, 1152px"
          className="group"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/5 to-stone-950/25 transition-opacity duration-500 group-hover:opacity-80"
          />
          <button
            type="button"
            onClick={activate}
            onPointerEnter={() => playback.kind === 'embed' && warmConnections(playback.src)}
            onFocus={() => playback.kind === 'embed' && warmConnections(playback.src)}
            aria-label={playLabel}
            className="absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-amber-400/80"
          >
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-stone-950 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-400 sm:h-20 sm:w-20"
            >
              <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
            </span>
          </button>
          {duration && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-stone-950/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur"
            >
              {duration}
            </span>
          )}
        </VideoPoster>
      ) : playback.kind === 'embed' ? (
        <iframe
          src={buildPlaybackEmbedSrc(playback.src, { autoplay: true })}
          title={video.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <>
          {/* Product clips are often shot vertically; a blurred still fills the
              pillarbox instead of flat black bars. */}
          {video.thumbnail_url && (
            <img
              src={optimizeImage(video.thumbnail_url, { width: 96, quality: 40 })}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
              referrerPolicy="no-referrer"
            />
          )}
          <video
            className="absolute inset-0 h-full w-full object-contain"
            src={playback.src}
            poster={video.thumbnail_url || undefined}
            controls
            autoPlay
            playsInline
            preload="auto"
          />
        </>
      )}
    </div>
  );
}
