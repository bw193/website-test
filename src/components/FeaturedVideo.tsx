import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Film, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Reveal from './Reveal';
import VideoPlayer from './VideoPlayer';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { formatBlogDate } from '../utils/blog';
import { FALLBACK_VIDEO_THUMB, formatVideoDuration, getVideoPlayback } from '../utils/video';
import { imageSrcSet, optimizeImage } from '../utils/optimizeImage';
import type { VideoListItem } from '../types/video';

const POSTER_WIDTHS = [480, 720, 960];
// Uploads get a 4:5 poster from the thumbnail generator; embed providers hand
// back landscape stills. Used only until the real poster reports its own size.
const DEFAULT_FILE_ASPECT = '4 / 5';
const DEFAULT_EMBED_ASPECT = '16 / 9';

/**
 * Gates the tilt / hover-preview extras: pointer-driven flourishes only make
 * sense on a real mouse, and never when the visitor asked for reduced motion.
 */
function supportsRichHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function savesData(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
}

/**
 * Home page "featured video" band — an editor-picked video (site_settings
 * `home_featured_video`) presented as a click-to-play facade: the poster and a
 * play button are all that load until the visitor actually asks for the video,
 * so the iframe/MP4 never touches the home page's critical path.
 */
export default function FeaturedVideo({ video }: { video: VideoListItem }) {
  const { t } = useTranslation();
  const { lp, lang } = useLocalizedPath();

  const stageRef = useRef<HTMLDivElement | null>(null);
  const tiltFrame = useRef<number | null>(null);
  const pointerPos = useRef<{ x: number; y: number } | null>(null);
  const previewTimer = useRef<number | null>(null);

  const [richHover, setRichHover] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  // Shapes vary across the library (vertical product clips, landscape factory
  // tours), so the frame follows the poster's own ratio and then the file's real
  // one on play. A fixed 16:9 box would letterbox every vertical clip.
  const [posterAspect, setPosterAspect] = useState<string | null>(null);
  const [playerAspect, setPlayerAspect] = useState<string | null>(null);

  useEffect(() => setRichHover(supportsRichHover()), []);

  useEffect(
    () => () => {
      if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
      if (tiltFrame.current !== null) window.cancelAnimationFrame(tiltFrame.current);
    },
    []
  );

  const playback = getVideoPlayback(video);
  // Muted hover preview only works for files we control (uploads/direct MP4s);
  // YouTube/Vimeo embeds would mean loading their player just to hover.
  const canPreview = richHover && playback.kind === 'video' && !savesData();

  const applyTilt = useCallback(() => {
    tiltFrame.current = null;
    const el = stageRef.current;
    const pos = pointerPos.current;
    if (!el || !pos) return;
    el.style.setProperty('--fv-ry', `${(pos.x - 0.5) * 8}deg`);
    el.style.setProperty('--fv-rx', `${(0.5 - pos.y) * 6}deg`);
    el.style.setProperty('--fv-mx', `${pos.x * 100}%`);
    el.style.setProperty('--fv-my', `${pos.y * 100}%`);
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    // Never tilt a playing video — the controls would move under the cursor.
    if (!richHover || playing || !el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerPos.current = {
      x: Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
      y: Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
    };
    // Coalesce to one style write per frame — pointermove can outpace paint.
    if (tiltFrame.current === null) tiltFrame.current = window.requestAnimationFrame(applyTilt);
  };

  const handlePointerEnter = () => {
    if (!canPreview || playing) return;
    previewTimer.current = window.setTimeout(() => setPreview(true), 380);
  };

  const resetTilt = () => {
    if (tiltFrame.current !== null) {
      window.cancelAnimationFrame(tiltFrame.current);
      tiltFrame.current = null;
    }
    pointerPos.current = null;
    const el = stageRef.current;
    if (el) {
      el.style.removeProperty('--fv-rx');
      el.style.removeProperty('--fv-ry');
    }
  };

  const cancelPreview = () => {
    if (previewTimer.current !== null) {
      window.clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
    setPreview(false);
    setPreviewReady(false);
  };

  const handlePointerLeave = () => {
    resetTilt();
    cancelPreview();
  };

  const startPlayback = () => {
    resetTilt();
    cancelPreview();
    setPlaying(true);
  };

  const poster = video.thumbnail_url || FALLBACK_VIDEO_THUMB;
  const fallbackAspect = playback.kind === 'embed' ? DEFAULT_EMBED_ASPECT : DEFAULT_FILE_ASPECT;
  const frameAspect = (playing ? playerAspect : null) || posterAspect || fallbackAspect;
  const duration = formatVideoDuration(video.duration_seconds);
  const categoryLabel = video.category
    ? t(`videos.categories.${video.category}`, video.category)
    : t('videos.cardLabel', 'Video');

  return (
    <section
      id="featured-video"
      aria-labelledby="featured-video-title"
      className="relative overflow-hidden bg-stone-950 py-20 text-white sm:py-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="fv-grid absolute inset-0 opacity-[0.06]" />
        <div className="fv-orb absolute -left-24 top-4 h-72 w-72 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="fv-orb fv-orb-slow absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-stone-300/10 blur-3xl" />
      </div>

      {/* The player track is a definite width: the frame's children are all
          absolutely positioned, so an `auto` track would collapse it. */}
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20 lg:px-8">
        {/* Editorial column */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300 backdrop-blur-sm">
              <Film className="h-3.5 w-3.5" />
              {t('home.featuredVideo.subtitle', 'Featured Film')}
            </span>
          </Reveal>

          <Reveal
            as="h2"
            id="featured-video-title"
            delay={60}
            className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl"
          >
            {t('home.featuredVideo.title', 'See Our Mirrors in Motion')}
          </Reveal>

          <Reveal as="p" delay={120} className="mt-5 max-w-xl text-lg font-light leading-relaxed text-stone-300">
            {t('home.featuredVideo.desc', 'One click into the factory floor.')}
          </Reveal>

          <Reveal delay={180} className="mt-9 border-l-2 border-amber-500/70 pl-5">
            <h3 className="font-serif text-2xl leading-snug text-white">{video.title}</h3>
            {video.excerpt && (
              <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-stone-400">{video.excerpt}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              <span className="text-amber-300/90">{categoryLabel}</span>
              {duration && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {duration}
                </span>
              )}
              {video.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatBlogDate(video.published_at, lang)}
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startPlayback}
              className="group inline-flex items-center gap-2.5 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              <Play className="h-4 w-4 fill-current transition-transform duration-300 group-hover:scale-110" />
              {t('home.featuredVideo.watch', 'Play the video')}
            </button>
            <Link
              to={lp(`/videos/${video.slug}`)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-white/45 hover:bg-white/10"
            >
              {t('home.featuredVideo.details', 'Video details')}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to={lp('/videos')}
              className="group inline-flex items-center gap-1.5 px-2 py-3.5 text-sm font-semibold text-amber-300 transition-colors hover:text-amber-200"
            >
              {t('home.featuredVideo.viewAll', 'All videos')}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Player column */}
        <Reveal delay={100} className="mx-auto w-full max-w-[26rem] lg:mx-0">
          <div
            ref={stageRef}
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            className="fv-stage fv-card group relative"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-amber-500/25 via-transparent to-white/10 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <div
              className="relative overflow-hidden rounded-3xl border border-white/12 bg-stone-900 shadow-2xl shadow-black/60 transition-[aspect-ratio] duration-500 ease-out"
              style={{ aspectRatio: frameAspect }}
            >
              {playing ? (
                <VideoPlayer
                  video={video}
                  autoPlay
                  aspectRatio={frameAspect}
                  onVideoMetadata={(w, h) => setPlayerAspect(`${w} / ${h}`)}
                  className="h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={startPlayback}
                  aria-label={t('home.featuredVideo.playAria', {
                    title: video.title,
                    defaultValue: 'Play video: {{title}}',
                  })}
                  className="absolute inset-0 block w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300"
                >
                  <span className="relative block h-full w-full overflow-hidden bg-stone-900">
                    <img
                      src={optimizeImage(poster, { width: 960 })}
                      srcSet={imageSrcSet(poster, POSTER_WIDTHS)}
                      sizes="(max-width: 1024px) 92vw, 26rem"
                      alt={video.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        // Match the frame to the real poster so nothing is cropped,
                        // whatever shape the editor uploaded.
                        if (img.naturalWidth && img.naturalHeight) {
                          setPosterAspect(`${img.naturalWidth} / ${img.naturalHeight}`);
                        }
                      }}
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    />

                    {/* Muted, silent hover preview — desktop + self-hosted files only. */}
                    {preview && (
                      <video
                        src={playback.src}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                        tabIndex={-1}
                        onCanPlay={() => setPreviewReady(true)}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                          previewReady ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    )}

                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/10 to-stone-950/30"
                    />
                    <span aria-hidden="true" className="fv-spot absolute inset-0" />
                    <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
                      <span className="fv-sheen absolute inset-y-[-20%] left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    </span>

                    <span
                      aria-hidden="true"
                      className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-stone-950/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur"
                    >
                      <Film className="h-3.5 w-3.5 text-amber-400" />
                      {categoryLabel}
                    </span>

                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                      <span className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-amber-400 text-stone-950 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out group-hover:scale-110">
                        <span className="fv-ring absolute inset-0 rounded-full border-2 border-amber-300/70" />
                        <span className="fv-ring fv-ring-delayed absolute inset-0 rounded-full border-2 border-amber-300/50" />
                        <Play className="ml-1 h-7 w-7 fill-current" />
                      </span>
                    </span>

                    <span aria-hidden="true" className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition-colors duration-300 group-hover:bg-amber-400 group-hover:text-stone-950">
                        <Play className="h-3 w-3 fill-current" />
                        {t('home.featuredVideo.playHint', 'Click to play')}
                      </span>
                      {duration && (
                        <span className="rounded-full bg-stone-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                          {duration}
                        </span>
                      )}
                    </span>

                    {/* Playback-tease bar: fills across the card while hovered. */}
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                      <span className="block h-full w-0 bg-amber-400 transition-[width] duration-[1400ms] ease-out group-hover:w-full" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
