import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { optimizeImage } from '../utils/optimizeImage';
import { usePointerVars } from '../hooks/usePointerVars';
import { capImageAlt } from './ProductCard';

type CertKey = 'saa' | 'ce' | 'ip44' | 'ukca' | 'ul' | 'ccc';

// Market marks first (in the order the export map tags them), then the
// ratings that apply everywhere. w × h are the scans' own pixel sizes, so the
// viewer can lay a sheet out at its proportions before the large image lands.
const CERTS: { key: CertKey; code: string; url: string; w: number; h: number }[] = [
  { key: 'ce', code: 'CE', url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/CE(1)(1).jpg', w: 2479, h: 3504 },
  { key: 'ukca', code: 'UKCA', url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UKCA.jpg', w: 280, h: 360 },
  { key: 'ul', code: 'UL', url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UL2.jpg', w: 285, h: 413 },
  { key: 'saa', code: 'SAA', url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/au.png', w: 1014, h: 720 },
  { key: 'ip44', code: 'IP44', url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/IP44.jpg', w: 280, h: 360 },
  { key: 'ccc', code: 'CCC', url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/ctce.png', w: 599, h: 844 },
];

const order = (i: number) => ({ '--i': String(i) }) as React.CSSProperties;

/**
 * Alt text names the mark, not its market: alt text is SEO copy, which stays
 * clear of China/Jiaxing, and the zh market label for CCC names China. The
 * caption shows the market.
 */
function useCertAlt() {
  const { t } = useTranslation();
  return (cert: (typeof CERTS)[number]) => capImageAlt(`${t('home.certificates.title')}: ${cert.code}`, 100);
}

/** One certificate as a paper sheet that tilts toward the pointer and opens the viewer. */
function Sheet({ cert, index, onOpen }: { cert: (typeof CERTS)[number]; index: number; onOpen: (index: number) => void }) {
  const { t } = useTranslation();
  const alt = useCertAlt();
  const ref = useRef<HTMLButtonElement>(null);
  usePointerVars(ref);
  const market = t(`home.certificates.items.${cert.key}`);
  return (
    <li style={order(index)}>
      <figure>
        <button
          ref={ref}
          type="button"
          onClick={() => onOpen(index)}
          aria-haspopup="dialog"
          aria-label={`${cert.code}, ${market}`}
          className="cert-sheet relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-[3px] bg-white p-1.5 shadow-[0_1px_2px_rgba(28,25,23,0.08),0_14px_24px_-16px_rgba(28,25,23,0.45)] ring-1 ring-stone-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <img
            src={optimizeImage(cert.url, { width: 240 })}
            srcSet={`${optimizeImage(cert.url, { width: 240 })} 1x, ${optimizeImage(cert.url, { width: 480 })} 2x`}
            alt={alt(cert)}
            className="h-full w-full object-contain"
            width="240"
            height="320"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <span aria-hidden="true" className="cert-glint pointer-events-none absolute inset-0" />
          <span aria-hidden="true" className="cert-shine pointer-events-none absolute inset-0" />
        </button>
        <figcaption className="mt-3">
          <span className="block font-serif text-[15px] font-semibold text-stone-900">{cert.code}</span>
          <span className="block text-[12px] leading-4 text-stone-500">{market}</span>
        </figcaption>
      </figure>
    </li>
  );
}

/**
 * The certificate viewer: a modal <dialog> (focus held inside, Esc closes, and
 * focus returns to the sheet afterwards) showing one certificate large, with
 * the arrow keys or buttons stepping through the set and a click on the
 * backdrop closing it.
 */
function CertificateViewer({ index, onClose, onStep }: { index: number | null; onClose: () => void; onStep: (delta: number) => void }) {
  const { t } = useTranslation();
  const alt = useCertAlt();
  const ref = useRef<HTMLDialogElement>(null);
  const cert = index === null ? null : CERTS[index];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  // Keep the page behind still while the viewer is open.
  useEffect(() => {
    if (index === null) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [index]);

  return (
    <dialog
      ref={ref}
      aria-label={cert ? `${cert.code}, ${t(`home.certificates.items.${cert.key}`)}` : undefined}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') onStep(1);
        if (event.key === 'ArrowLeft') onStep(-1);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="cert-viewer m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 backdrop:bg-stone-950/80 backdrop:backdrop-blur-sm"
    >
      {cert && (
        <div className="flex flex-col items-center gap-4 p-4" onClick={(event) => {
          if (event.target === event.currentTarget) ref.current?.close();
        }}>
          <div className="relative flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label={t('home.certificates.viewerPrev')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* Sized from the scan's proportions at once; until the large image
                arrives, the shelf's thumbnail (already loaded) shows through. */}
            <img
              key={cert.key}
              src={optimizeImage(cert.url, { width: 1200 })}
              alt={alt(cert)}
              width={cert.w}
              height={cert.h}
              style={{ backgroundImage: `url("${optimizeImage(cert.url, { width: 240 })}")` }}
              className="cert-viewer-sheet h-[min(76vh,880px)] w-auto max-w-[calc(100vw-9rem)] rounded-[3px] bg-white bg-contain bg-center bg-no-repeat bg-origin-content object-contain p-2 shadow-2xl sm:max-w-[min(72vw,1000px)]"
              referrerPolicy="no-referrer"
              decoding="async"
            />
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label={t('home.certificates.viewerNext')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-5 text-white">
            <p>
              <span className="font-serif text-lg font-semibold">{cert.code}</span>
              <span className="ml-2 text-sm text-stone-300">{t(`home.certificates.items.${cert.key}`)}</span>
              <span className="ml-3 text-sm tabular-nums text-stone-400">{(index ?? 0) + 1} / {CERTS.length}</span>
            </p>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t('home.certificates.viewerClose')}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

/** The certification sheets of the home page, with the viewer they open. */
export default function CertificateShelf() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-6 sm:gap-x-5">
        {CERTS.map((cert, i) => (
          <Sheet key={cert.key} cert={cert} index={i} onOpen={setOpen} />
        ))}
      </ul>
      <CertificateViewer
        index={open}
        onClose={() => setOpen(null)}
        onStep={(delta) => setOpen((current) => (current === null ? current : (current + delta + CERTS.length) % CERTS.length))}
      />
    </>
  );
}
