import { useEffect, useState } from 'react';
import { ArrowUpRight, Loader2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImage } from '../utils/optimizeImage';

export type SolutionGalleryItem = { id: string; image: string; title: string; href: string };

type Props = {
  items: SolutionGalleryItem[];
  label: string;
  viewLabel: string;
  previewLabel: string;
  loadingLabel: string;
  errorLabel: string;
  retryLabel: string;
};

/** Keep the last decoded photograph in place while the next model loads. */
export default function SolutionGallery({ items, label, viewLabel, previewLabel, loadingLabel, errorLabel, retryLabel }: Props) {
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const [displayed, setDisplayed] = useState<SolutionGalleryItem | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pending = !displayed || displayed.image !== selected?.image;

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setFailed(false);
    const photo = new Image();
    photo.src = optimizeImage(selected.image, { width: 960 });
    photo.decode().then(() => {
      if (!cancelled) setDisplayed(selected);
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => { cancelled = true; };
  }, [selected, attempt]);

  if (!selected) return null;
  const displayedIndex = items.findIndex((item) => item.id === displayed?.id);

  return (
    <div className="solution-gallery" data-loaded={Boolean(displayed)}>
      <div className="solution-gallery-photo" aria-busy={pending && !failed}>
        {displayed && (
          <div className="solution-gallery-surface"><img
            key={displayed.image}
            src={optimizeImage(displayed.image, { width: 960 })}
            alt={displayed.title}
            width="960"
            height="960"
            className="solution-gallery-image"
            decoding="async"
          /></div>
        )}
        {!displayed && !failed && (
          <span className="solution-image-status" role="status">
            <Loader2 aria-hidden="true" className="solution-loader" />
            {loadingLabel}
          </span>
        )}
        {pending && displayed && !failed && (
          <span className="solution-gallery-loading" role="status">
            <Loader2 aria-hidden="true" className="solution-loader" />
            <span className="sr-only">{loadingLabel}</span>
          </span>
        )}
        {failed && (
          <div className="solution-image-error" role="status">
            <p>{errorLabel}</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)}>
              <RotateCcw size={16} aria-hidden="true" />{retryLabel}
            </button>
          </div>
        )}
        {displayed && (
          <Link to={displayed.href} className="solution-gallery-caption">
            <span><span className="solution-gallery-label">{label}</span><span>{viewLabel}</span></span>
            <span className="solution-round-arrow"><ArrowUpRight size={22} aria-hidden="true" /></span>
          </Link>
        )}
      </div>
      {items.length > 1 && (
        <div className="solution-gallery-controls">
          <div className="solution-gallery-thumbnails" role="group" aria-label={label}>
            {items.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                aria-pressed={selected.id === item.id}
                aria-label={`${previewLabel} ${index + 1}: ${item.title}`}
              >
                <img src={optimizeImage(item.image, { width: 100 })} alt="" width="56" height="56" loading="lazy" />
              </button>
            ))}
          </div>
          <span className="solution-gallery-count" aria-hidden="true">
            <strong key={displayed?.id}>{String(Math.max(0, displayedIndex) + 1).padStart(2, '0')}</strong>
            <span />{String(items.length).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
