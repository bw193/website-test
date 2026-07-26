import React from 'react';
import { PlayCircle } from 'lucide-react';
import { getVideoPlayback, withAutoplay } from '../utils/video';
import type { LocalizedVideoPost, VideoListItem } from '../types/video';

type PlayerVideo = Pick<
  LocalizedVideoPost | VideoListItem,
  'title' | 'source_type' | 'video_url' | 'embed_url' | 'thumbnail_url'
>;

export default function VideoPlayer({
  video,
  className = '',
  autoPlay = false,
  aspectRatio,
  onVideoMetadata,
}: {
  video: PlayerVideo;
  className?: string;
  /** Only pass from a click-to-play facade — the player then starts on mount. */
  autoPlay?: boolean;
  /** CSS aspect-ratio for the frame, e.g. "9 / 16". Defaults to 16:9. */
  aspectRatio?: string;
  /** Intrinsic size of a direct/uploaded file, once the browser reports it. */
  onVideoMetadata?: (width: number, height: number) => void;
}) {
  const playback = getVideoPlayback(video);

  return (
    <div
      className={`relative overflow-hidden bg-stone-950 ${aspectRatio ? '' : 'aspect-video'} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {playback.kind === 'embed' ? (
        <iframe
          src={autoPlay ? withAutoplay(playback.src) : playback.src}
          title={video.title}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : playback.kind === 'video' ? (
        <video
          className="h-full w-full bg-black object-contain"
          src={playback.src}
          poster={video.thumbnail_url || undefined}
          controls
          autoPlay={autoPlay}
          playsInline
          preload={autoPlay ? 'auto' : 'metadata'}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            if (el.videoWidth && el.videoHeight) onVideoMetadata?.(el.videoWidth, el.videoHeight);
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          {video.thumbnail_url && (
            <img src={video.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          )}
          <PlayCircle className="relative h-14 w-14 text-white/80" />
        </div>
      )}
    </div>
  );
}
