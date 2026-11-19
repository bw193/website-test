import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath, type SupportedLanguage } from '../hooks/useLocalizedPath';
import { optimizeImage } from '../utils/optimizeImage';
import type { FactoryGalleryItem } from '../utils/prerenderData';
import { capImageAlt } from './ProductCard';
import Reveal from './Reveal';

const PHOTO_WIDTHS = [480, 800, 1200, 1600];
const PHOTO_SIZES = '(min-width: 1280px) 746px, (min-width: 1024px) 61vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

type GalleryTranslation = { caption: string; alt: string };

const GALLERY_COPY_BY_KEY: Record<
  | 'exterior'
  | 'sampleRoom'
  | 'rdOffice'
  | 'machinery'
  | 'workshop'
  | 'inventory'
  | 'assembly'
  | 'warehouse'
  | 'loading',
  Record<SupportedLanguage, GalleryTranslation>
> = {
  exterior: {
    en: { caption: 'Manufacturing Plant', alt: 'BOLEN 46,800 m² LED mirror manufacturing plant exterior' },
    zh: { caption: '生产基地外观', alt: 'BOLEN 46,800 平方米 LED 镜生产基地外观' },
    es: { caption: 'Planta de fabricación', alt: 'Exterior de la planta de espejos LED BOLEN de 46.800 m²' },
    fr: { caption: 'Site de production', alt: 'Extérieur de l’usine de miroirs LED BOLEN de 46 800 m²' },
    de: { caption: 'Produktionswerk', alt: 'Außenansicht des 46.800 m² großen BOLEN LED-Spiegelwerks' },
    it: { caption: 'Stabilimento produttivo', alt: 'Esterno dello stabilimento specchi LED BOLEN da 46.800 m²' },
  },
  sampleRoom: {
    en: { caption: 'OEM/ODM Sample Room', alt: 'BOLEN OEM and ODM mirror sample showroom for buyer review' },
    zh: { caption: 'OEM/ODM 样品展厅', alt: 'BOLEN 定制镜与 LED 浴室镜样品评审展厅' },
    es: { caption: 'Sala de muestras', alt: 'Sala de muestras OEM/ODM de espejos LED BOLEN' },
    fr: { caption: 'Showroom d’échantillons', alt: 'Salle d’échantillons OEM/ODM de miroirs LED BOLEN' },
    de: { caption: 'Muster-Showroom', alt: 'BOLEN OEM/ODM-Musterraum für LED- und Badspiegel' },
    it: { caption: 'Sala campioni', alt: 'Sala campioni OEM/ODM di specchi LED BOLEN' },
  },
  rdOffice: {
    en: { caption: 'R&D & Engineering Building', alt: 'BOLEN mirror R&D and optical-electrical engineering center' },
    zh: { caption: '研发与工程大楼', alt: 'BOLEN 镜业光学与电气工程研发办公大楼' },
    es: { caption: 'Edificio de I+D', alt: 'Centro de I+D e ingeniería óptica y eléctrica BOLEN' },
    fr: { caption: 'Centre R&D', alt: 'Bâtiment R&D et ingénierie optique-électrique BOLEN' },
    de: { caption: 'F&E-Gebäude', alt: 'Forschungs- und Entwicklungszentrum von BOLEN Mirror' },
    it: { caption: 'Centro R&S', alt: 'Edificio ricerca, sviluppo e ingegneria BOLEN' },
  },
  machinery: {
    en: { caption: 'CNC Glass Machinery', alt: 'CNC mirror glass cutting and edge-polishing machinery at BOLEN' },
    zh: { caption: '自动化玻璃加工设备', alt: 'BOLEN 自动化镜片数控切割与磨边加工设备' },
    es: { caption: 'Maquinaria CNC de vidrio', alt: 'Maquinaria CNC de corte y pulido de vidrio para espejos BOLEN' },
    fr: { caption: 'Parc machines CNC verre', alt: 'Machines CNC de découpe et polissage du verre miroir BOLEN' },
    de: { caption: 'CNC-Glasbearbeitung', alt: 'CNC-Glasschneide- und Kantenschleifanlagen bei BOLEN' },
    it: { caption: 'Macchinari CNC vetro', alt: 'Macchinari CNC per taglio e molatura del vetro specchio BOLEN' },
  },
  workshop: {
    en: { caption: 'Processing Workshop', alt: 'BOLEN mirror glass processing and metal frame workshop' },
    zh: { caption: '镜片与边框车间', alt: 'BOLEN 镜片深加工与铝合金边框制备生产车间' },
    es: { caption: 'Taller de producción', alt: 'Taller de procesado de espejos y marcos en la planta BOLEN' },
    fr: { caption: 'Atelier de fabrication', alt: 'Atelier de façonnage des miroirs et cadres chez BOLEN' },
    de: { caption: 'Fertigungshalle', alt: 'BOLEN Werkhalle für Spiegelglas- und Rahmenfertigung' },
    it: { caption: 'Reparto lavorazione', alt: 'Reparto lavorazione vetro e telai per specchi BOLEN' },
  },
  inventory: {
    en: { caption: 'Mirror Glass Inventory', alt: '5mm copper-free silver mirror glass sheets staged for production' },
    zh: { caption: '无铜银镜原片库存', alt: '待投产的 5mm 无铜环保银镜玻璃原片库存' },
    es: { caption: 'Inventario de vidrio espejo', alt: 'Stock de vidrio espejo sin cobre preparado para producción' },
    fr: { caption: 'Stock de verre miroir', alt: 'Stock de feuilles de miroir sans cuivre prêt pour la production' },
    de: { caption: 'Spiegelglas-Lagerbestand', alt: 'Kupferfreies Spiegelglas im Materiallager für die Fertigung' },
    it: { caption: 'Magazzino lastre specchio', alt: 'Scorte di vetro specchio senza rame pronte per la produzione' },
  },
  assembly: {
    en: { caption: 'Production & Assembly Line', alt: 'BOLEN LED bathroom mirror assembly and electrical testing line' },
    zh: { caption: '生产与组装测试线', alt: 'BOLEN LED 浴室镜组装、接线与通电老化检验产线' },
    es: { caption: 'Línea de producción y montaje', alt: 'Línea de montaje y ensayo eléctrico de espejos LED BOLEN' },
    fr: { caption: 'Ligne de production et d’assemblage', alt: 'Ligne d’assemblage et de test électrique des miroirs LED BOLEN' },
    de: { caption: 'Produktions- & Montagelinie', alt: 'Montage- und Funktionsprüflinie für LED-Badspiegel bei BOLEN' },
    it: { caption: 'Linea di produzione e assemblaggio', alt: 'Linea di assemblaggio e collaudo elettrico specchi LED BOLEN' },
  },
  warehouse: {
    en: { caption: 'Finished Mirror Warehouse', alt: 'Palletized export cartons in the BOLEN finished mirror warehouse' },
    zh: { caption: '成品仓储中心', alt: 'BOLEN 成品镜托盘化出口包装仓储区' },
    es: { caption: 'Almacén de producto terminado', alt: 'Almacén de espejos terminados y paletizados para exportación' },
    fr: { caption: 'Entrepôt produits finis', alt: 'Entrepôt de miroirs emballés sur palettes prêts à l’export' },
    de: { caption: 'Fertigwarenlager', alt: 'Palettierte Exportkartons im Fertigwarenlager von BOLEN' },
    it: { caption: 'Magazzino prodotti finiti', alt: 'Magazzino di specchi finiti pallettizzati per l’esportazione' },
  },
  loading: {
    en: { caption: 'Loading & Shipping', alt: 'BOLEN export mirror cartons during container loading and shipping' },
    zh: { caption: '装柜与出口发运', alt: 'BOLEN 出口镜品集装箱装柜加固与发运现场' },
    es: { caption: 'Carga y expedición', alt: 'Carga de contenedores de exportación de espejos en BOLEN' },
    fr: { caption: 'Chargement et expédition', alt: 'Chargement en conteneur des miroirs d’exportation BOLEN' },
    de: { caption: 'Verladung & Versand', alt: 'Containerverladung versandfertiger Spiegelkartons bei BOLEN' },
    it: { caption: 'Carico e spedizione', alt: 'Carico in container e spedizione internazionale di specchi BOLEN' },
  },
};

const FALLBACK_GALLERY_LABEL: Record<SupportedLanguage, { caption: string; alt: string }> = {
  en: { caption: 'Factory View', alt: 'BOLEN LED mirror manufacturing facility view' },
  zh: { caption: '工厂实景', alt: 'BOLEN LED 镜生产基地车间实景' },
  es: { caption: 'Vista de fábrica', alt: 'Instalaciones de fabricación de espejos LED BOLEN' },
  fr: { caption: 'Vue de l’usine', alt: 'Installations de fabrication de miroirs LED BOLEN' },
  de: { caption: 'Werksansicht', alt: 'Einblick in die LED-Spiegelfertigung von BOLEN' },
  it: { caption: 'Vista stabilimento', alt: 'Reparto produttivo di specchi LED BOLEN' },
};

function detectGalleryKey(item: FactoryGalleryItem): keyof typeof GALLERY_COPY_BY_KEY | null {
  const url = (item.url || '').toLowerCase();
  const text = `${item.caption || ''} ${item.alt || ''}`.toLowerCase();

  if (url.includes('xx5h5wp') || /^factory$/i.test((item.caption || '').trim()) || /exterior/.test(text)) {
    return 'exterior';
  }
  if (url.includes('dgqqbgp') || /sample\s*room/.test(text)) return 'sampleRoom';
  if (url.includes('7k63tu7') || /r\s*&\s*d|office\s+building/.test(text)) return 'rdOffice';
  if (url.includes('8cu9cp3') || /machin/.test(text)) return 'machinery';
  if (url.includes('0set20l') || /workshop/.test(text)) return 'workshop';
  if (url.includes('nqszgrq') || /inventory/.test(text)) return 'inventory';
  if (url.includes('khnb1yn') || url.includes('1mr3q2t') || /assembly|production\s*line|production&assembly/.test(text)) {
    return 'assembly';
  }
  if (url.includes('dtkebxh') || /warehouse/.test(text)) return 'warehouse';
  if (url.includes('3tgkp8m') || url.includes('93qn9wa') || /lo[a]?ding|shipping|container/.test(text)) {
    return 'loading';
  }
  return null;
}

export function localizeFactoryGalleryItem(
  item: FactoryGalleryItem,
  lang: SupportedLanguage,
  index = 0
): FactoryGalleryItem {
  const matchedKey = detectGalleryKey(item);
  if (matchedKey) {
    const entry = GALLERY_COPY_BY_KEY[matchedKey][lang] || GALLERY_COPY_BY_KEY[matchedKey].en;
    return {
      url: item.url,
      caption: entry.caption,
      alt: capImageAlt(entry.alt, 100),
    };
  }

  const fixedAlt = capImageAlt((item.alt || '').replace(/\bloding\b/gi, 'loading'), 100);
  const fixedCaption = item.caption ? item.caption.replace(/\bloding\b/gi, 'loading').trim() : undefined;

  if (lang === 'en') {
    return {
      url: item.url,
      caption: fixedCaption,
      alt: fixedAlt || FALLBACK_GALLERY_LABEL.en.alt,
    };
  }

  // On non-English locales, avoid leaking raw ASCII-only English captions/alts
  // from editor-uploaded photos that lack per-locale metadata.
  const fallback = FALLBACK_GALLERY_LABEL[lang] || FALLBACK_GALLERY_LABEL.en;
  const num = String(index + 1).padStart(2, '0');
  return {
    url: item.url,
    caption: `${fallback.caption} ${num}`,
    alt: capImageAlt(`${fallback.alt} (${num})`, 100),
  };
}

export function localizeFactoryGalleryList(
  items: FactoryGalleryItem[],
  lang: SupportedLanguage
): FactoryGalleryItem[] {
  return items.map((item, idx) => localizeFactoryGalleryItem(item, lang, idx));
}

function FactoryPhoto({ item, direction, progress }: {
  item: FactoryGalleryItem;
  direction: 1 | -1;
  progress: number;
}) {
  const { t } = useTranslation();
  const [readyUrl, setReadyUrl] = useState<string | null>(item.url);
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
          className={`factory-photo-current absolute inset-0 h-full w-full object-cover ${readyUrl === item.url || !previousPhoto ? 'is-ready' : ''}`}
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
  const { lp, lang } = useLocalizedPath();
  const localizedItems = useMemo(() => localizeFactoryGalleryList(items, lang), [items, lang]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Keep the selected photograph when editor-managed images are reordered;
  // fall back to the first photo if that photograph has been removed.
  const activeIndex = Math.max(0, localizedItems.findIndex((item) => item.url === selectedUrl));
  const activeItem = localizedItems[activeIndex];

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
  }, [activeIndex, localizedItems.length]);

  const selectImage = (index: number, movement?: 1 | -1) => {
    if (!localizedItems[index] || localizedItems[index].url === activeItem?.url) return;
    setDirection(movement ?? (index > activeIndex ? 1 : -1));
    setSelectedUrl(localizedItems[index].url);
  };

  const handleThumbnailKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextIndex = activeIndex;
    switch (event.key) {
      case 'ArrowRight': nextIndex = (activeIndex + 1) % localizedItems.length; break;
      case 'ArrowLeft': nextIndex = (activeIndex - 1 + localizedItems.length) % localizedItems.length; break;
      case 'Home': nextIndex = 0; break;
      case 'End': nextIndex = localizedItems.length - 1; break;
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
          {localizedItems.length > 1 && (
            <div
              ref={thumbnailsRef}
              role="tablist"
              aria-label={t('home.factoryShowcase.subtitle')}
              onKeyDown={handleThumbnailKeyDown}
              className="relative order-2 flex gap-2 overflow-x-auto pb-2 pt-2 hide-scrollbar"
            >
              {localizedItems.map((item, index) => (
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
            role={localizedItems.length > 1 ? 'tabpanel' : undefined}
            aria-labelledby={localizedItems.length > 1 ? `factory-photo-tab-${activeIndex}` : 'factory-showcase-title'}
            tabIndex={localizedItems.length > 1 ? 0 : undefined}
            className="order-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[#F5F3EF]"
          >
            <FactoryPhoto item={activeItem} direction={direction} progress={(activeIndex + 1) / localizedItems.length} />
            <figcaption className="flex min-h-[76px] items-center justify-between gap-4 py-3">
              <div aria-live="polite" aria-atomic="true" className="flex min-w-0 items-center gap-3 sm:gap-4">
                <span key={`number-${activeItem.url}`} className="factory-caption-in shrink-0 border-r border-stone-300 pr-3 text-xs font-medium tabular-nums sm:pr-4">
                  <span className="text-amber-700">{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className="text-stone-500"> / {String(localizedItems.length).padStart(2, '0')}</span>
                </span>
                <span key={`caption-${activeItem.url}`} className="factory-caption-in text-sm font-medium leading-5 text-stone-800">{activeItem.caption || activeItem.alt}</span>
              </div>
              {localizedItems.length > 1 && (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => selectImage((activeIndex - 1 + localizedItems.length) % localizedItems.length, -1)}
                    aria-label={t('home.factoryShowcase.prev')}
                    aria-controls="factory-gallery-panel"
                    className="factory-nav factory-nav-prev inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:border-stone-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectImage((activeIndex + 1) % localizedItems.length, 1)}
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
