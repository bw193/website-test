import React from 'react';
import { VideoOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VideoPoster from './VideoPoster';
import { optimizeImage } from '../utils/optimizeImage';
import { toMediaPath } from '../utils/media';
import { buildPlaybackEmbedSrc, getVideoPlayback, videoMimeType } from '../utils/video';
import type { LocalizedVideoPost, VideoListItem } from '../types/video';

type PlayerVideo = Pick<
  LocalizedVideoPost | VideoListItem,
  'title' | 'source_type' | 'video_url' | 'embed_url' | 'thumbnail_url'
> & { duration_seconds?: number | null };

interface VideoPlayerProps {
  video: PlayerVideo;
  className?: string;
  /**
   * Autoplay immediately when mounted from an explicit user gesture (e.g. a
   * "Play film" button).
   */
  autoPlay?: boolean;
  /** The poster is the LCP candidate on watch pages; raise its fetch priority. */
  priority?: boolean;
  onPlay?: () => void;
}

const POSTER_WIDTHS = [640, 1024, 1600];

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
 * Watch-page player. Always renders a crawlable `<video>` or `<iframe>` in the
 * DOM so Googlebot Video can verify and index playback on every watch page:
 * - Self-hosted MP4/WebM/MOV clips mount `<video controls preload="metadata">`
 *   addressed through same-origin `/media/...` (no X-Robots-Tag: none).
 * - YouTube/Vimeo embeds paint the local responsive poster immediately for LCP
 *   while mounting `<iframe loading="lazy" src="...">` directly in the DOM.
 */
export default function VideoPlayer({
  video,
  className = '',
  autoPlay = false,
  priority = false,
  onPlay,
}: VideoPlayerProps) {
  const { t } = useTranslation();
  const playback = getVideoPlayback(video);
  const mediaSrc = playback.kind === 'video' ? toMediaPath(playback.src) : '';
  const posterPath = toMediaPath(video.thumbnail_url) || undefined;
  const mimeType = playback.kind === 'video' ? videoMimeType(playback.src) : '';

  return (
    <div
      className={`relative aspect-video overflow-hidden bg-stone-950 ${className}`.trim()}
      onPointerEnter={() => playback.kind === 'embed' && warmConnections(playback.src)}
      onFocus={() => playback.kind === 'embed' && warmConnections(playback.src)}
    >
      {playback.kind === 'missing' ? (
        <VideoPoster fill aspect="video" src={video.thumbnail_url} alt="" loading="eager" imgClassName="opacity-40">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <VideoOff className="h-10 w-10 text-white/70" aria-hidden="true" />
            <p className="text-sm font-medium text-white/85">
              {t('videos.unavailable', 'This video is temporarily unavailable.')}
            </p>
          </div>
        </VideoPoster>
      ) : playback.kind === 'video' ? (
        <>
          {/* Product clips are often shot vertically; a blurred still fills the
              pillarbox instead of flat black bars. */}
          {video.thumbnail_url && (
            <img
              src={optimizeImage(video.thumbnail_url, { width: 96, quality: 40 })}
              alt=""
              aria-hidden="true"
              loading={priority ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
              referrerPolicy="no-referrer"
            />
          )}
          <video
            className="relative z-10 h-full w-full object-contain"
            src={mediaSrc}
            poster={posterPath}
            controls
            autoPlay={autoPlay}
            playsInline
            preload={autoPlay ? 'auto' : 'metadata'}
            onPlay={onPlay}
          >
            {mimeType && <source src={mediaSrc} type={mimeType} />}
          </video>
        </>
      ) : (
        <>
          <VideoPoster
            fill
            aspect="video"
            src={video.thumbnail_url}
            alt=""
            loading="eager"
            fetchPriority={priority ? 'high' : undefined}
            widths={POSTER_WIDTHS}
            sizes="(max-width: 1280px) 100vw, 1152px"
          />
          <iframe
            src={buildPlaybackEmbedSrc(playback.src, { autoplay: autoPlay })}
            title={video.title}
            loading={autoPlay ? undefined : 'lazy'}
            className="absolute inset-0 z-10 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </>
      )}
    </div>
  );
}
