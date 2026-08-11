import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Film, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Reveal from './Reveal';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { formatBlogDate } from '../utils/blog';
import {
  FALLBACK_VIDEO_THUMB,
  formatVideoDuration,
  getVideoPlayback,
  planAmbientClip,
  type AmbientClipPlan,
} from '../utils/video';
import { imageSrcSet, optimizeImage } from '../utils/optimizeImage';
import type { VideoListItem } from '../types/video';

const POSTER_WIDTHS = [640, 1024, 1600];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Metered or slow connections get the poster, not several megabytes of video. */
function connectionAllowsAmbient(): boolean {
  if (typeof navigator === 'undefined') return true;
  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  return !(conn.effectiveType && /2g|^3g$/.test(conn.effectiveType));
}

/**
 * Home page "featured video" band — the editor-picked video (site_settings
 * `home_featured_video`) plays as a muted, looping cinematic backdrop behind the
 * section copy.
 *
 * Nothing is requested until the band approaches the viewport. It then autoplays
 * muted (the browser-safe autoplay path), using a short excerpt for long films.
 * Reduced-motion and data-saver visitors still get the poster unless they opt in.
 * Playback pauses whenever the band leaves the viewport, and the controls always
 * offer pause + mute (WCAG 2.2.2).
 */
export default function FeaturedVideo({ video }: { video: VideoListItem }) {
  const { t } = useTranslation();
  const { lp, lang } = useLocalizedPath();

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const [inView, setInView] = useState(false);
  // Set once the loop has cleared the gates (or the visitor asked for it
  // explicitly) — until then the <video> isn't mounted and no bytes move.
  const [clip, setClip] = useState<AmbientClipPlan | null>(null);
  const [ambientBlocked, setAmbientBlocked] = useState(false);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  const playback = getVideoPlayback(video);
  // Only self-hosted files can be a backdrop. A YouTube/Vimeo embed would mean
  // loading a third-party player with its own chrome behind the copy.
  const canAmbient = playback.kind === 'video';

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '200px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Arm the backdrop immediately when the band is approached. File-size checks
  // used to turn large editor-selected videos into a static poster, which made
  // the homepage video appear broken. Loading remains bounded by viewport,
  // reduced-motion, data-saver, and excerpting gates.
  useEffect(() => {
    if (!canAmbient || !inView || clip || ambientBlocked) return;
    if (prefersReducedMotion() || !connectionAllowsAmbient()) {
      setAmbientBlocked(true);
      return;
    }
    setClip(
      planAmbientClip(null, video.duration_seconds) ?? { start: 0, seconds: 0, full: true, bytes: null }
    );
  }, [canAmbient, inView, clip, ambientBlocked, video.duration_seconds]);

  /**
   * Seeking (and swapping src) rejects any pending play() with AbortError, which
   * is routine here because every loop wrap is a seek — treating that as a pause
   * would strand the backdrop on its first frame. Only a policy refusal is real.
   */
  const attemptPlay = (el: HTMLVideoElement) => {
    el.play().catch((err: unknown) => {
      if ((err as DOMException | undefined)?.name === 'NotAllowedError') setUserPaused(true);
    });
  };

  // Keep playback tied to visibility so an off-screen clip never decodes.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !clip) return;
    if (inView && !userPaused) {
      attemptPlay(el);
    } else {
      el.pause();
    }
  }, [inView, userPaused, clip]);

  const clipEnd = clip && !clip.full && clip.seconds > 0 ? clip.start + clip.seconds : null;

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    // Wrap inside the excerpt so the browser never ranges past the window it
    // already buffered. `loop` can't do this — it always restarts at zero. The
    // margin has to exceed one timeupdate tick (~250ms) or playback reaches the
    // fragment end first and we fall through to the `ended` path.
    if (clipEnd !== null && el.currentTime >= clipEnd - 0.3) {
      el.currentTime = clip!.start;
      return;
    }
    const bar = progressRef.current;
    if (!bar) return;
    const start = clip?.start ?? 0;
    const span = clipEnd !== null ? clip!.seconds : el.duration;
    if (!span || !Number.isFinite(span)) return;
    // scaleX on the compositor — no layout, no React re-render per tick.
    bar.style.transform = `scaleX(${Math.min(Math.max((el.currentTime - start) / span, 0), 1)})`;
  };

  const togglePlayback = () => {
    if (!clip) {
      // Poster mode: the visitor is explicitly opting in, so the reduced-motion
      // and connection gates no longer apply — but still excerpt long files.
      setAmbientBlocked(false);
      setUserPaused(false);
      setClip(
        planAmbientClip(null, video.duration_seconds) ?? { start: 0, seconds: 0, full: true, bytes: null }
      );
      return;
    }
    setUserPaused((paused) => !paused);
  };

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    const next = !muted;
    el.muted = next;
    setMuted(next);
    if (!next && el.paused) el.play().catch(() => setUserPaused(true));
  };

  const poster = video.thumbnail_url || FALLBACK_VIDEO_THUMB;
  const duration = formatVideoDuration(video.duration_seconds);
  const categoryLabel = video.category
    ? t(`videos.categories.${video.category}`, video.category)
    : t('videos.cardLabel', 'Video');
  const showingVideo = ambientPlaying && !userPaused;

  return (
    <section
      ref={sectionRef}
      id="featured-video"
      aria-labelledby="featured-video-title"
      className="relative isolate flex min-h-[34rem] items-center overflow-hidden bg-stone-950 py-20 text-white sm:py-24 lg:min-h-[42rem]"
    >
      {/* ── Backdrop: poster underneath, clip fading in over it ─────────── */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <img
          src={optimizeImage(poster, { width: 1600 })}
          srcSet={imageSrcSet(poster, POSTER_WIDTHS)}
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover transition-opacity duration-1000 ${
            showingVideo ? 'opacity-0' : 'fv-kenburns opacity-100'
          }`}
        />
        {clip && (
          <video
            ref={videoRef}
            // The media fragment makes the browser range-request just this window
            // instead of streaming from byte zero.
            src={clipEnd !== null ? `${playback.src}#t=${clip.start.toFixed(2)},${clipEnd.toFixed(2)}` : playback.src}
            autoPlay
            muted={muted}
            loop={clipEnd === null}
            playsInline
            preload="auto"
            tabIndex={-1}
            onPlaying={() => setAmbientPlaying(true)}
            onPause={() => setAmbientPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              // Backstop: the browser stops at the fragment end if a timeupdate
              // tick straddled the wrap point.
              const el = videoRef.current;
              if (!el || clipEnd === null) return;
              el.currentTime = clip.start;
              attemptPlay(el);
            }}
            onSeeked={() => {
              // A wrap seek cancels the in-flight play(); pick it back up.
              const el = videoRef.current;
              if (el && el.paused && inView && !userPaused) attemptPlay(el);
            }}
            // These clips are shot in dim bathrooms and read as near-black under
            // the scrims; a light grade lifts them without touching the poster.
            className={`absolute inset-0 h-full w-full object-cover brightness-110 contrast-[1.04] saturate-110 transition-opacity duration-1000 ${
              showingVideo ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Legibility scrims — heavy on the copy side. On wide screens the right
            half clears completely so the footage is actually visible; on narrow
            ones the copy spans the band, so the wash has to carry further. */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/60 lg:via-stone-950/70 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/35" />
      </div>

      {/* ── Copy ────────────────────────────────────────────────────────── */}
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
        <div className="max-w-2xl">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300 backdrop-blur-sm">
              {showingVideo ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {t('home.featuredVideo.nowPlaying', 'Now Playing')}
                </>
              ) : (
                <>
                  <Film className="h-3.5 w-3.5" />
                  {t('home.featuredVideo.subtitle', 'Featured Film')}
                </>
              )}
            </span>
          </Reveal>

          <Reveal
            as="h2"
            id="featured-video-title"
            delay={60}
            className="mt-6 font-serif text-4xl leading-[1.08] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl"
          >
            {t('home.featuredVideo.title', 'See Our Mirrors in Motion')}
          </Reveal>

          <Reveal as="p" delay={120} className="mt-6 max-w-xl text-lg font-light leading-relaxed text-stone-200">
            {t('home.featuredVideo.desc', 'One click into the factory floor.')}
          </Reveal>

          <Reveal delay={180} className="mt-9 border-l-2 border-amber-500/70 pl-5">
            <h3 className="font-serif text-2xl leading-snug text-white">{video.title}</h3>
            {video.excerpt && (
              <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-stone-300">{video.excerpt}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-300">
              <span className="text-amber-300">{categoryLabel}</span>
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

          <Reveal delay={240} className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to={lp(`/videos/${video.slug}`)}
              className="group inline-flex items-center gap-2.5 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              <Play className="h-4 w-4 fill-current transition-transform duration-300 group-hover:scale-110" />
              {t('home.featuredVideo.watch', 'Watch full video')}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to={lp('/videos')}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-white/45 hover:bg-white/10"
            >
              {t('home.featuredVideo.viewAll', 'All videos')}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* ── HUD: playback controls + live progress ──────────────────────── */}
      {canAmbient && (
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-end gap-2 px-6 pb-5 sm:px-10 lg:px-14">
            <button
              type="button"
              onClick={togglePlayback}
              aria-pressed={showingVideo}
              aria-label={
                showingVideo
                  ? (t('home.featuredVideo.pauseAria', 'Pause the background video') as string)
                  : (t('home.featuredVideo.playAria', {
                      title: video.title,
                      defaultValue: 'Play video: {{title}}',
                    }) as string)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-stone-950/50 text-white backdrop-blur transition-colors duration-300 hover:border-amber-400/70 hover:bg-amber-400 hover:text-stone-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {showingVideo ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              disabled={!clip}
              aria-pressed={!muted}
              aria-label={
                muted
                  ? (t('home.featuredVideo.soundOn', 'Turn on sound') as string)
                  : (t('home.featuredVideo.soundOff', 'Mute the video') as string)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-stone-950/50 text-white backdrop-blur transition-colors duration-300 hover:border-amber-400/70 hover:bg-amber-400 hover:text-stone-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:bg-stone-950/50 disabled:hover:text-white"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
          <div className="h-[3px] w-full bg-white/10">
            <div
              ref={progressRef}
              className="h-full origin-left scale-x-0 bg-amber-400 transition-transform duration-200 ease-linear"
            />
          </div>
        </div>
      )}
    </section>
  );
}
