import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { optimizeImage } from '../utils/optimizeImage';
import type { FactoryGalleryItem } from '../utils/prerenderData';
import Reveal from './Reveal';

const PHOTO_WIDTHS = [480, 800, 1200, 1600];
const PHOTO_SIZES = '(min-width: 1280px) 746px, (min-width: 1024px) 61vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

function FactoryPhoto({ item, direction, progress }: {
  item: FactoryGalleryItem;
  direction: 1 | -1;
  progress: number;
}) {
  const { t } = useTranslation();
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [previousPhoto, setPreviousPhoto] = useState<{ url: string; src: string } | null>(null);
  const failed = failedUrl === item.url;

  const handleLoad = async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    // Decode before starting the fade; a slow request keeps the last complete
    // photograph visible. An image superseded by another selection is ignored.
    try { await image.decode(); } catch { /* The load event already succeeded. */ }
    if (!image.isConnected) return;
    setFailedUrl(null);
    setReadyUrl(item.url);
    const photo = { url: item.url, src: image.currentSrc || image.src };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPreviousPhoto((previous) => !previous || reduce ? photo : previous);
  };

  return (
    <div
      className="factory-photo-viewport relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-200 sm:aspect-[8/5]"
      style={{ '--factory-photo-offset': `${direction * 18}px` } as React.CSSProperties}
      aria-busy={!failed && readyUrl !== item.url}
    >
      <div className="factory-photo-surface absolute inset-0">
        {previousPhoto && previousPhoto.url !== item.url && (
          <img
            src={previousPhoto.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <img
          key={item.url}
          src={optimizeImage(item.url, { width: 1000 })}
          srcSet={PHOTO_WIDTHS.map((width) => `${optimizeImage(item.url, { width })} ${width}w`).join(', ')}
          sizes={PHOTO_SIZES}
          width={1200}
          height={750}
          alt={item.alt}
          aria-hidden={failed || undefined}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={() => setFailedUrl(item.url)}
          onAnimationEnd={(event) => {
            if (event.animationName === 'factoryPhotoIn') {
              setPreviousPhoto({ url: item.url, src: event.currentTarget.currentSrc || event.currentTarget.src });
            }
          }}
          className={`factory-photo-current absolute inset-0 h-full w-full object-cover ${readyUrl === item.url ? 'is-ready' : ''}`}
        />
      </div>
      {failed && (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-200 px-6 text-center text-sm text-stone-600">
          <ImageOff aria-hidden="true" className="h-6 w-6" />
          {t('home.factoryShowcase.imageUnavailable')}
        </div>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
        <div className="factory-photo-progress h-full origin-left bg-amber-500" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}

export default function FactoryShowcase({ items }: { items: FactoryGalleryItem[] }) {
  const { t } = useTranslation();
  const { lp } = useLocalizedPath();
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Keep the selected photograph when editor-managed images are reordered;
  // fall back to the first photo if that photograph has been removed.
  const activeIndex = Math.max(0, items.findIndex((item) => item.url === selectedUrl));
  const activeItem = items[activeIndex];

  useEffect(() => {
    const rail = thumbnailsRef.current;
    const thumbnail = thumbnailRefs.current[activeIndex];
    if (!rail || !thumbnail) return;

    const keepSelectionVisible = () => {
      const left = thumbnail.offsetLeft;
      if (left < rail.scrollLeft || left + thumbnail.offsetWidth > rail.scrollLeft + rail.clientWidth) {
        rail.scrollTo({
          left: left - (rail.clientWidth - thumbnail.offsetWidth) / 2,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
      }
    };

    keepSelectionVisible();
    const observer = new ResizeObserver(keepSelectionVisible);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [activeIndex, items.length]);

  const selectImage = (index: number, movement?: 1 | -1) => {
    if (!items[index] || items[index].url === activeItem?.url) return;
    setDirection(movement ?? (index > activeIndex ? 1 : -1));
    setSelectedUrl(items[index].url);
  };

  const handleThumbnailKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextIndex = activeIndex;
    switch (event.key) {
      case 'ArrowRight': nextIndex = (activeIndex + 1) % items.length; break;
      case 'ArrowLeft': nextIndex = (activeIndex - 1 + items.length) % items.length; break;
      case 'Home': nextIndex = 0; break;
      case 'End': nextIndex = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectImage(nextIndex, event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : undefined);
    thumbnailRefs.current[nextIndex]?.focus({ preventScroll: true });
  };

  if (!activeItem) return null;

  return (
    <section
      id="factory-showcase"
      aria-labelledby="factory-showcase-title"
      className="scroll-mt-20 border-t border-stone-200/60 bg-[#F5F3EF] py-14 text-stone-900 sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-[0.9fr_1.65fr] lg:gap-12 lg:px-8 xl:gap-16">
        <Reveal className="factory-intro lg:pt-10">
          <p className="factory-intro-step flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            <span aria-hidden="true" className="factory-intro-line h-px w-8 origin-left bg-amber-600/70" />
            {t('home.factoryShowcase.subtitle')}
          </p>
          <h2
            id="factory-showcase-title"
            className="factory-intro-step mt-5 max-w-xl text-balance font-serif text-4xl leading-[1.12] tracking-[-0.035em] sm:text-5xl lg:text-[3.15rem]"
            style={{ '--factory-enter-delay': '90ms' } as React.CSSProperties}
          >
            {t('home.factoryShowcase.title')}
          </h2>
          <p className="factory-intro-step mt-5 max-w-lg text-base leading-7 text-stone-600 lg:mt-6" style={{ '--factory-enter-delay': '180ms' } as React.CSSProperties}>
            {t('home.factoryShowcase.desc')}
          </p>
          <Link
            to={lp('/our-story')}
            className="factory-intro-step factory-story-link group relative mt-6 inline-flex min-h-11 items-center gap-4 border-b border-stone-400/70 pb-1 text-sm font-semibold text-stone-800 transition-colors hover:border-amber-600 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[#F5F3EF] lg:mt-8"
            style={{ '--factory-enter-delay': '270ms' } as React.CSSProperties}
          >
            {t('home.factoryShowcase.visit')}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
          </Link>
        </Reveal>

        <Reveal delay={160} className="factory-gallery flex min-w-0 flex-col">
          {items.length > 1 && (
            <div
              ref={thumbnailsRef}
              role="tablist"
              aria-label={t('home.factoryShowcase.subtitle')}
              onKeyDown={handleThumbnailKeyDown}
              className="relative order-2 flex gap-2 overflow-x-auto pb-2 pt-2 hide-scrollbar"
            >
              {items.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  ref={(element) => { thumbnailRefs.current[index] = element; }}
                  id={`factory-photo-tab-${index}`}
                  type="button"
                  role="tab"
                  tabIndex={index === activeIndex ? 0 : -1}
                  aria-selected={index === activeIndex}
                  aria-controls="factory-gallery-panel"
                  aria-label={`${t('home.factoryShowcase.selectImage')} ${index + 1}: ${item.caption || item.alt}`}
                  onClick={() => selectImage(index)}
                  style={{ '--factory-thumb-order': Math.min(index, 8) } as React.CSSProperties}
                  className={`factory-thumb aspect-[4/3] w-[4.5rem] shrink-0 overflow-hidden rounded-lg border-2 p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-900 sm:w-[calc((100%_-_4rem)/9)] sm:min-w-[60px] ${index === activeIndex ? 'border-amber-600' : 'border-transparent hover:border-stone-400'}`}
                >
                  <img
                    src={optimizeImage(item.url, { width: 200 })}
                    alt={item.alt}
                    width={200}
                    height={150}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-[4px] object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <figure
            id="factory-gallery-panel"
            role={items.length > 1 ? 'tabpanel' : undefined}
            aria-labelledby={items.length > 1 ? `factory-photo-tab-${activeIndex}` : 'factory-showcase-title'}
            tabIndex={items.length > 1 ? 0 : undefined}
            className="order-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[#F5F3EF]"
          >
            <FactoryPhoto item={activeItem} direction={direction} progress={(activeIndex + 1) / items.length} />
            <figcaption className="flex min-h-[76px] items-center justify-between gap-4 py-3">
              <div aria-live="polite" aria-atomic="true" className="flex min-w-0 items-center gap-3 sm:gap-4">
                <span key={`number-${activeItem.url}`} className="factory-caption-in shrink-0 border-r border-stone-300 pr-3 text-xs font-medium tabular-nums sm:pr-4">
                  <span className="text-amber-700">{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className="text-stone-500"> / {String(items.length).padStart(2, '0')}</span>
                </span>
                <span key={`caption-${activeItem.url}`} className="factory-caption-in text-sm font-medium leading-5 text-stone-800">{activeItem.caption || activeItem.alt}</span>
              </div>
              {items.length > 1 && (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => selectImage((activeIndex - 1 + items.length) % items.length, -1)}
                    aria-label={t('home.factoryShowcase.prev')}
                    aria-controls="factory-gallery-panel"
                    className="factory-nav factory-nav-prev inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:border-stone-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectImage((activeIndex + 1) % items.length, 1)}
                    aria-label={t('home.factoryShowcase.next')}
                    aria-controls="factory-gallery-panel"
                    className="factory-nav factory-nav-next inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              )}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
