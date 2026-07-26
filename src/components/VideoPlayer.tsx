import React from 'react';
import { PlayCircle } from 'lucide-react';
import { getVideoPlayback } from '../utils/video';
import type { LocalizedVideoPost, VideoListItem } from '../types/video';

type PlayerVideo = Pick<
  LocalizedVideoPost | VideoListItem,
  'title' | 'source_type' | 'video_url' | 'embed_url' | 'thumbnail_url'
>;

export default function VideoPlayer({ video, className = '' }: { video: PlayerVideo; className?: string }) {
  const playback = getVideoPlayback(video);

  return (
    <div className={`relative aspect-video overflow-hidden bg-stone-950 ${className}`}>
      {playback.kind === 'embed' ? (
        <iframe
          src={playback.src}
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
          preload="metadata"
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
