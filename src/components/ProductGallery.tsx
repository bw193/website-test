import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Maximize2, RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { PRODUCT_DETAIL_COPY } from '../data/productDetailCopy';
import { optimizeImage } from '../utils/optimizeImage';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const { lang } = useLocalizedPath();
  const { t } = useTranslation();
  const copy = PRODUCT_DETAIL_COPY[lang];
  const photos = images.filter(Boolean);
  const [selected, setSelected] = useState(0);
  const [displayed, setDisplayed] = useState({ index: 0, source: photos[0] || '', revision: 0 });
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbnails = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.min(selected, Math.max(0, photos.length - 1));
  const selectedSource = photos[selectedIndex] || '';
  const pending = selectedSource !== displayed.source;

  // Leave the current photograph visible until the next one has decoded.
  useEffect(() => {
    if (!selectedSource) return;
    let cancelled = false;
    setFailed(false);
    const photo = new Image();
    photo.src = optimizeImage(selectedSource, { width: 1200 });
    photo.decode().then(() => {
      if (!cancelled) setDisplayed({ index: selectedIndex, source: selectedSource, revision: attempt });
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [selectedSource, selectedIndex, attempt]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expanded]);

  useEffect(() => {
    const rail = thumbnails.current;
    const button = rail?.querySelector<HTMLButtonElement>(`[data-image-index="${selectedIndex}"]`);
    if (!rail || !button) return;
    const left = button.offsetLeft - rail.offsetLeft;
    if (left < rail.scrollLeft) rail.scrollLeft = left;
    else if (left + button.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = left + button.offsetWidth - rail.clientWidth;
  }, [selectedIndex]);

  const move = (direction: number) => {
    if (photos.length > 1) setSelected((current) => (current + direction + photos.length) % photos.length);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Tab' && dialog.current?.open) {
      const controls = Array.from(dialog.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
      return;
    }
    if (photos.length < 2 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? photos.length - 1 : (selectedIndex + (event.key === 'ArrowRight' ? 1 : -1) + photos.length) % photos.length;
    setSelected(next);
    if (thumbnails.current?.contains(event.target as Node)) {
      thumbnails.current.querySelector<HTMLButtonElement>(`[data-image-index="${next}"]`)?.focus({ preventScroll: true });
    }
  };
  const imageLabel = t('productDetail.galleryView', { title, index: displayed.index + 1, defaultValue: '{{title}} — view {{index}}' });
  const counter = <span className="pdp-gallery-count" aria-hidden="true"><strong>{String(displayed.index + 1).padStart(2, '0')}</strong><span />{String(Math.max(1, photos.length)).padStart(2, '0')}</span>;
  const status = failed ? (
    <div className="pdp-gallery-status is-error" role="status">
      <span>{copy.error}</span>
      <button type="button" onClick={() => setAttempt(value => value + 1)}><RotateCcw size={15} aria-hidden="true" />{copy.retry}</button>
    </div>
  ) : pending ? <span className="pdp-gallery-status" role="status"><Loader2 size={18} className="pdp-loader" aria-hidden="true" /><span className="sr-only">{copy.loading}</span></span> : null;

  return (
    <div className="pdp-gallery" onKeyDown={onKeyDown} role="region" aria-label={copy.gallery}>
      <div className="pdp-gallery-stage" aria-busy={pending && !failed}>
        <button type="button" className="pdp-image-open" disabled={!displayed.source || failed && !pending} aria-label={`${copy.enlarge}: ${title}`} onClick={() => { dialog.current?.showModal(); setExpanded(true); }}>
          <img key={`${displayed.source}:${displayed.revision}`} src={optimizeImage(displayed.source, { width: 1200 }) || PRODUCT_IMAGE_PLACEHOLDER} alt={imageLabel} width="1200" height="1200" {...({ fetchpriority: 'high' } as Record<string, string>)} decoding="async" onError={handleImageError} />
          {displayed.source && <span className="pdp-zoom-label"><Maximize2 size={17} aria-hidden="true" />{copy.enlarge}</span>}
        </button>
        {status}
      </div>
      <div className="pdp-gallery-bottom">
        {photos.length > 1 ? (
          <div className="pdp-thumbnails" ref={thumbnails} role="group" aria-label={copy.gallery}>
            {photos.map((photo, index) => <button key={`${photo}:${index}`} type="button" data-image-index={index} aria-pressed={selectedIndex === index} aria-label={t('productDetail.galleryView', { title, index: index + 1, defaultValue: '{{title}} — view {{index}}' })} onClick={() => setSelected(index)}>
              <img src={optimizeImage(photo, { width: 160 })} alt="" width="160" height="160" loading="lazy" decoding="async" onError={handleImageError} />
            </button>)}
          </div>
        ) : <span className="pdp-gallery-caption">{copy.gallery}</span>}
        <div className="pdp-gallery-controls">
          {photos.length > 1 && <button type="button" className="pdp-round-button" onClick={() => move(-1)} aria-label={t('productDetail.previousImage')}><ArrowLeft size={18} aria-hidden="true" /></button>}
          {counter}
          {photos.length > 1 && <button type="button" className="pdp-round-button" onClick={() => move(1)} aria-label={t('productDetail.nextImage')}><ArrowRight size={18} aria-hidden="true" /></button>}
        </div>
      </div>
      <dialog ref={dialog} className="pdp-lightbox" aria-label={`${copy.gallery}: ${title}`} onClose={() => setExpanded(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="pdp-lightbox-header"><p>{title}</p><button type="button" className="pdp-round-button" autoFocus aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={22} aria-hidden="true" /></button></div>
        {expanded && <img key={displayed.source} className="pdp-lightbox-image" src={optimizeImage(displayed.source, { width: 1200 }) || PRODUCT_IMAGE_PLACEHOLDER} alt={imageLabel} width="1200" height="1200" onError={handleImageError} />}
        <div className="pdp-lightbox-controls">
          {photos.length > 1 && <button type="button" className="pdp-round-button" onClick={() => move(-1)} aria-label={t('productDetail.previousImage')}><ArrowLeft size={21} aria-hidden="true" /></button>}
          {counter}
          {photos.length > 1 && <button type="button" className="pdp-round-button" onClick={() => move(1)} aria-label={t('productDetail.nextImage')}><ArrowRight size={21} aria-hidden="true" /></button>}
        </div>
        {expanded && status}
      </dialog>
    </div>
  );
}
