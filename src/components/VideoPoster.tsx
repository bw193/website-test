import React, { useEffect, useRef, useState } from 'react';
import { imageSrcSet, optimizeImage } from '../utils/optimizeImage';
import { FALLBACK_VIDEO_THUMB } from '../utils/video';

type Fit = 'cover' | 'contain';
type Aspect = 'video' | 'portrait';

interface VideoPosterProps {
  src: string | null | undefined;
  alt: string;
  /**
   * Frame proportions. The admin tool renders 4:5 posters for uploads and
   * YouTube Shorts come as vertical stills, so cards default to `portrait`;
   * the player facade is always `video` (16:9).
   */
  aspect?: Aspect;
  /** Candidate widths for the responsive srcset. */
  widths?: number[];
  sizes?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  /**
   * Fill the nearest positioned ancestor instead of reserving an aspect box —
   * for callers that own the frame (the player facade, split cards).
   */
  fill?: boolean;
  /** Applied to the outer frame. */
  className?: string;
  /** Applied to the main poster image (hover transforms live here). */
  imgClassName?: string;
  /** Overlays (play button, badges, scrims) rendered above the poster. */
  children?: React.ReactNode;
}

const ASPECT_CLASS: Record<Aspect, string> = {
  video: 'aspect-video',
  portrait: 'aspect-[4/5]',
};
const ASPECT_RATIO: Record<Aspect, number> = {
  video: 16 / 9,
  portrait: 4 / 5,
};

/**
 * Poster frame shared by every video surface (cards, spotlight, player
 * facade). Thumbnails arrive in several shapes — 4:5 generated posters,
 * vertical Shorts stills, 16:9 YouTube frames — so once the image has loaded
 * its ratio is compared with the frame's: a close match fills the frame,
 * anything else sits letterboxed over a blurred copy of itself (the treatment
 * YouTube gives Shorts in a landscape player) instead of being cropped to a
 * sliver.
 *
 * The backdrop reuses the exact src/srcset/sizes of the main image so the
 * browser makes one request, not two.
 */
export default function VideoPoster({
  src,
  alt,
  aspect = 'portrait',
  widths = [420, 640, 960],
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  loading = 'lazy',
  fetchPriority,
  fill = false,
  className = '',
  imgClassName = '',
  children,
}: VideoPosterProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [fit, setFit] = useState<Fit>('cover');

  const url = !failed && src ? src : FALLBACK_VIDEO_THUMB;
  const primary = optimizeImage(url, { width: widths[widths.length - 1] });
  const srcSet = imageSrcSet(url, widths);

  const measure = (img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const frame = frameRef.current;
    const frameRatio =
      fill && frame && frame.clientWidth && frame.clientHeight
        ? frame.clientWidth / frame.clientHeight
        : ASPECT_RATIO[aspect];
    const relative = img.naturalWidth / img.naturalHeight / frameRatio;
    setFit(relative > 0.7 && relative < 1.45 ? 'cover' : 'contain');
  };

  // A cached image can finish before React attaches onLoad, so re-check after mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) measure(img);
  }, [url, aspect, fill]);

  const letterboxed = fit === 'contain';

  return (
    <div
      ref={frameRef}
      className={`${fill ? 'absolute inset-0' : `relative ${ASPECT_CLASS[aspect]}`} overflow-hidden bg-stone-900 ${className}`.trim()}
    >
      {letterboxed && (
        <img
          src={primary}
          srcSet={srcSet || undefined}
          sizes={srcSet ? sizes : undefined}
          alt=""
          aria-hidden="true"
          loading={loading}
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl saturate-125"
        />
      )}
      <img
        ref={imgRef}
        src={primary}
        srcSet={srcSet || undefined}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={loading}
        // React 18 only forwards this as the lowercase HTML attribute without warning.
        {...(fetchPriority ? ({ fetchpriority: fetchPriority } as Record<string, string>) : {})}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={(event) => measure(event.currentTarget)}
        onError={() => setFailed(true)}
        className={`relative h-full w-full ${letterboxed ? 'object-contain' : 'object-cover'} ${imgClassName}`.trim()}
      />
      {children}
    </div>
  );
}
