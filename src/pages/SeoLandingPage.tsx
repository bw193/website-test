import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight, Plus } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Reveal from '../components/Reveal';
import SolutionGallery from '../components/SolutionGallery';
import {
  matchesSeoLandingProduct,
  scoreSeoLandingProduct,
  SEO_LANDING_BY_SLUG,
  SEO_SOLUTIONS_PATH,
} from '../data/seoLandingPages';
import {
  getSeoLandingProductCardCopy,
  getSeoSolutionsUi,
  localizeSeoLandingPage,
} from '../data/seoLandingI18n';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialSeoLandingData } from '../utils/prerenderData';
import { buildProductBuyerSummary } from '../utils/productSeo';
import { productDetailPath } from '../utils/productRoutes';
import { optimizeImage } from '../utils/optimizeImage';
import { SOLUTION_DETAIL_COPY } from '../data/solutionDetailCopy';
import './SeoLandingPage.css';
import './SeoLandingPage.motion.css';

const SITE_URL = 'https://bolenmirror.com';
const FACTORY_IMAGE = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/factory/1783993292006-xx5h5wp.jpg';

interface Product {
  id: string;
  title: string;
  description: string;
  details?: string;
  buyer_summary?: string;
  display_title?: string;
  images: string[];
  category?: string;
  price_range?: string;
  msrp?: string;
}

export default function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLocalizedPath();
  // Reset the guide, gallery and FAQ when navigating to another solution/locale.
  return <SolutionDetail key={`${lang}:${slug}`} />;
}

function SolutionDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const enhancedMotion = slug === 'custom-mirror-manufacturer';
  const { lang, lp } = useLocalizedPath();
  const sourcePage = SEO_LANDING_BY_SLUG[slug];
  const page = useMemo(() => sourcePage ? localizeSeoLandingPage(sourcePage, lang) : undefined, [sourcePage, lang]);
  const ui = getSeoSolutionsUi(lang);
  const detail = SOLUTION_DETAIL_COPY[lang];
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('solution-overview');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const heading = lang === 'zh' ? 'font-sans font-semibold tracking-tight' : 'font-serif';
  const initial = useMemo(() => readInitialSeoLandingData<Product>(slug), [slug]);
  const [products, setProducts] = useState<Product[]>(initial?.products ?? []);
  const [loading, setLoading] = useState(initial === null);
  const prerenderCopyMatchesLanguage = initial?.lang === lang;

  useEffect(() => {
    if (initial !== null) {
      setProducts(initial.products);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, details, images, category, price_range, msrp')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (!cancelled) setProducts((data as Product[]) || []);
      } catch (error) {
        console.error('Could not load solution products', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const featuredProducts = useMemo(
    () => {
      if (!sourcePage) return [];
      if (initial !== null) return products.slice(0, 6);
      return products
        .filter((product) => matchesSeoLandingProduct(sourcePage, product))
        .sort((a, b) => scoreSeoLandingProduct(sourcePage, b) - scoreSeoLandingProduct(sourcePage, a))
        .slice(0, 6);
    },
    [initial, sourcePage, products]
  );

  const galleryItems = useMemo(() => featuredProducts
    .filter((product) => Boolean(product.images?.[0]))
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      image: product.images[0],
      title: lang === 'en' ? product.title : getSeoLandingProductCardCopy(product, lang).title,
      href: `/${lang}${productDetailPath(product, lang)}/`,
    })), [featuredProducts, lang]);
  const showProducts = loading || featuredProducts.length > 0;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-solution-section]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const parallax = enhancedMotion
      ? window.matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 901px) and (hover: hover) and (pointer: fine)')
      : null;
    const photos = enhancedMotion
      ? Array.from(root.querySelectorAll<HTMLImageElement>('.solution-chapter-photo > img, .solution-closing-image img'))
      : [];
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const distance = root.offsetHeight - window.innerHeight + 64;
      let current = sections[0]?.id ?? 'solution-overview';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 220) current = section.id;
      }
      // Read image frames before writing transforms. Text and card bounds stay fixed.
      const photoPositions = photos.map((image) => {
        if (!parallax?.matches) return { image, offset: 0 };
        const bounds = image.parentElement!.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) return null;
        const progress = (window.innerHeight / 2 - bounds.top - bounds.height / 2) / ((window.innerHeight + bounds.height) / 2);
        return { image, offset: Math.max(-1, Math.min(1, progress)) * Math.min(24, bounds.height * .033) };
      });
      root.style.setProperty('--solution-progress', String(Math.min(1, Math.max(0, (64 - rect.top) / Math.max(1, distance)))));
      root.style.setProperty('--solution-hero-offset', `${reducedMotion.matches ? 0 : Math.min(32, Math.max(0, -rect.top) * .065)}px`);
      for (const position of photoPositions) {
        if (position) position.image.style.setProperty('--solution-photo-shift', `${position.offset.toFixed(2)}px`);
      }
      setActiveSection(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    parallax?.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      parallax?.removeEventListener('change', schedule);
    };
  }, [showProducts, enhancedMotion]);

  const jumpTo = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(event.currentTarget.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    target.focus({ preventScroll: true });
  };

  if (!page) return <Navigate to={lp('/solutions')} replace />;

  const canonical = `${SITE_URL}/${lang}/solutions/${page.slug}/`;
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    alternateName: page.shortTitle,
    serviceType: page.shortTitle || page.h1,
    description: page.description,
    url: canonical,
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Importers, distributors, brands, hotel and project buyers',
    },
    brand: {
      '@type': 'Brand',
      name: 'BOLEN',
    },
    provider: {
      '@type': 'Organization',
      name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
      url: SITE_URL,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'BOLEN mirror catalog',
      url: `${SITE_URL}/${lang}/products/`,
    },
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ui.home, item: `${SITE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: ui.footerLabel, item: `${SITE_URL}/${lang}/solutions/` },
      { '@type': 'ListItem', position: 3, name: page.h1, item: canonical },
    ],
  };

  const ogImage = featuredProducts[0]?.images?.[0];
  const titleParts = lang === 'en' ? page.h1.match(/^(.+?)( for .+)$/) : null;
  const sectionLinks = [
    { id: 'solution-overview', label: detail.overview },
    ...(showProducts ? [{ id: 'solution-models', label: ui.modelsHeading }] : []),
    { id: 'solution-details', label: detail.details },
    { id: 'solution-faq', label: ui.buyerQuestions },
  ];

  return (
    <div ref={rootRef} lang={lang} className={`solution-detail min-h-screen bg-[#FAF9F6] text-stone-800${enhancedMotion ? ' solution-motion' : ''}`}>
      <SEO
        title={page.title}
        description={page.description}
        path={`${SEO_SOLUTIONS_PATH}/${page.slug}`}
        ogImage={ogImage}
        schema={[serviceSchema, faqSchema, breadcrumbSchema]}
      />

      <header className="solution-hero">
        <div className="solution-container">
          <nav className="solution-breadcrumb" aria-label="Breadcrumb">
            <Link to={lp('/')}>{ui.home}</Link><ChevronRight aria-hidden="true" />
            <Link to={lp('/solutions')}>{ui.solutions}</Link><ChevronRight aria-hidden="true" />
            <span aria-current="page">{page.shortTitle || page.h1}</span>
          </nav>
          <div className="solution-hero-grid">
            <div className="solution-hero-copy">
              <p className="solution-eyebrow solution-hero-enter">{page.eyebrow}</p>
              <h1 className={`solution-hero-title solution-hero-enter ${heading}`}>
                {titleParts ? <><span>{titleParts[1]}</span>{' '}<em>{titleParts[2].trimStart()}</em></> : page.h1}
              </h1>
              <p className="solution-hero-description solution-hero-enter">{page.blurb || page.description}</p>
              <div className="solution-hero-actions solution-hero-enter">
                <Link to={lp('/rfq')} className="btn-primary">{ui.requestQuote}<ArrowUpRight size={17} aria-hidden="true" /></Link>
                <Link to={lp('/products')} className="btn-secondary">{ui.viewCatalog}</Link>
              </div>
              <a href="#solution-overview" onClick={jumpTo} className="solution-explore solution-hero-enter">
                <span className="solution-explore-icon"><ArrowDown size={18} aria-hidden="true" /></span>
                {ui.exploreSolution}
              </a>
            </div>
            <div className="solution-hero-visual">
              {loading ? (
                <div className="solution-gallery-skeleton" role="status"><span className="sr-only">{detail.imageLoading}</span></div>
              ) : (
                <SolutionGallery
                  items={galleryItems.length ? galleryItems : [{ id: 'factory', image: FACTORY_IMAGE, title: detail.factoryEyebrow, href: lp('/our-story') }]}
                  label={galleryItems.length ? ui.modelsHeading : detail.factoryEyebrow}
                  viewLabel={galleryItems.length ? detail.viewModel : detail.factoryLink}
                  previewLabel={detail.previewModel}
                  loadingLabel={detail.imageLoading}
                  errorLabel={detail.imageUnavailable}
                  retryLabel={detail.retryImage}
                />
              )}
            </div>
          </div>
          <ul className="solution-proof">
            {page.proofPoints.map((point, index) => (
              <Reveal as="li" key={point.label} delay={index * 75}>
                <strong>{point.value}</strong><span>{point.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </header>

      <nav className="solution-section-nav" aria-label={detail.onThisPage}>
        <div className="solution-container solution-section-nav-inner">
          <div className="solution-section-links">
            {sectionLinks.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={jumpTo} aria-current={activeSection === item.id ? 'location' : undefined}>{item.label}</a>
            ))}
          </div>
          <Link to={lp('/rfq')} className="solution-nav-contact">{ui.requestQuote}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="solution-reading-progress" aria-hidden="true" />
      </nav>

      <section id="solution-overview" tabIndex={-1} data-solution-section className="solution-container solution-overview solution-anchor" aria-labelledby="solution-overview-title">
        <Reveal>
          <p className="solution-eyebrow">{detail.overview}</p>
          <h2 id="solution-overview-title" className={`solution-heading ${heading}`}>{page.eyebrow}</h2>
        </Reveal>
        <Reveal delay={100}><p className="solution-intro">{page.intro}</p></Reveal>
      </section>

      {showProducts && (
        <section id="solution-models" tabIndex={-1} data-solution-section className="solution-models solution-anchor" aria-labelledby="solution-models-title">
          <div className="solution-container">
            <Reveal className="solution-section-header">
              <div><p className="solution-eyebrow">{ui.relevantProducts}</p><h2 id="solution-models-title" className={`solution-heading ${heading}`}>{ui.modelsHeading}</h2></div>
              <Link to={lp('/products')} className="solution-text-link">{ui.viewAllProducts}<ArrowUpRight size={18} aria-hidden="true" /></Link>
            </Reveal>
            <div className="solution-model-grid">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={index} />)
                : featuredProducts.slice(0, 3).map((product, index) => {
                    const cardCopy = getSeoLandingProductCardCopy(product, lang);
                    const displayTitleOverride = prerenderCopyMatchesLanguage
                      ? product.display_title
                      : lang === 'zh'
                        ? cardCopy.title
                        : undefined;
                    const buyerSummary = prerenderCopyMatchesLanguage
                      ? product.buyer_summary
                      : lang === 'en'
                        ? buildProductBuyerSummary(product)
                        : lang === 'zh'
                          ? cardCopy.summary
                          : undefined;
                    return (
                      <Reveal key={product.id} delay={index * 100}>
                        <ProductCard
                          id={product.id}
                          title={product.title}
                          description={product.description || ''}
                          buyerSummary={buyerSummary}
                          displayTitleOverride={displayTitleOverride}
                          image={product.images?.[0] || ''}
                          category={product.category}
                          priceRange={product.price_range}
                          msrp={product.msrp}
                        />
                      </Reveal>
                    );
                  })}
            </div>
          </div>
        </section>
      )}

      <section id="solution-details" tabIndex={-1} data-solution-section className="solution-guide solution-anchor" aria-label={detail.details}>
        <article className="solution-guide-content">
          {page.sections.map((section, index) => {
            const model = galleryItems[index % Math.max(1, galleryItems.length)];
            const isFactory = !model;
            return (
              <section id={`solution-chapter-${index}`} tabIndex={-1} key={section.heading} className="solution-chapter solution-anchor" aria-labelledby={`solution-chapter-title-${index}`}>
                <div className="solution-container solution-chapter-grid">
                  <Reveal variant="scale" className="solution-chapter-visual">
                    <Link to={isFactory ? lp('/our-story') : model.href} className="solution-chapter-photo">
                      <img
                        src={optimizeImage(isFactory ? FACTORY_IMAGE : model.image, { width: 800 })}
                        alt={isFactory ? detail.factoryImageAlt : model.title}
                        width="800" height="960" loading="lazy" decoding="async"
                      />
                      <span className="solution-chapter-photo-link">{isFactory ? detail.factoryLink : detail.viewModel}<ArrowUpRight size={18} aria-hidden="true" /></span>
                    </Link>
                  </Reveal>
                  <div className="solution-chapter-copy">
                    <Reveal>
                      <p className="solution-eyebrow"><span>{String(index + 1).padStart(2, '0')}</span>{detail.details}</p>
                      <h2 id={`solution-chapter-title-${index}`} className={heading}>{section.heading}</h2>
                      <div className="solution-prose">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                    </Reveal>
                    {section.bullets && (
                      <ul className="solution-spec-list">
                        {section.bullets.map((bullet, bulletIndex) => (
                          <Reveal as="li" key={bullet} delay={bulletIndex * 60}><Check size={17} aria-hidden="true" /><span>{bullet}</span></Reveal>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </article>
      </section>

      <section id="solution-faq" tabIndex={-1} data-solution-section className="solution-faq solution-anchor" aria-labelledby="solution-faq-title">
        <div className="solution-container solution-faq-grid">
          <Reveal>
            <p className="solution-eyebrow">{ui.buyerQuestions}</p>
            <h2 id="solution-faq-title" className={`solution-heading ${heading}`}>{ui.faqHeading}</h2>
            <Link to={lp('/rfq')} className="solution-text-link">{ui.discussProject}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          </Reveal>
          <div className="solution-faq-list">
            {page.faq.map((item, index) => (
              <Reveal key={item.question} delay={index * 60} className={`solution-faq-item ${openFaq === index ? 'is-open' : ''}`}>
                <h3>
                  <button id={`solution-question-${index}`} type="button" aria-expanded={openFaq === index} aria-controls={`solution-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                    <span className="solution-faq-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item.question}</span><span className="solution-faq-toggle"><Plus size={20} aria-hidden="true" /></span>
                  </button>
                </h3>
                <div id={`solution-answer-${index}`} role="region" aria-labelledby={`solution-question-${index}`} aria-hidden={openFaq !== index} className="solution-faq-answer">
                  <div><p>{item.answer}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="solution-container solution-related" aria-labelledby="solution-related-title">
        <Reveal className="solution-section-header">
          <h2 id="solution-related-title" className={`solution-heading ${heading}`}>{ui.relatedSolutions}</h2>
          <Link to={lp('/solutions')} className="solution-text-link">{ui.solutions}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </Reveal>
        <ul className="solution-related-grid">
            {page.relatedSlugs.map((relatedSlug, index) => {
              const relatedSource = SEO_LANDING_BY_SLUG[relatedSlug];
              const related = relatedSource ? localizeSeoLandingPage(relatedSource, lang) : undefined;
              if (!related) return null;
              return (
                <Reveal as="li" key={related.slug} delay={index * 80}>
                  <Link to={lp(`/solutions/${related.slug}`)} className="solution-related-card">
                    <span className="solution-related-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <div className="solution-related-heading"><h3 className={heading}>{related.shortTitle || related.h1}</h3><ArrowUpRight size={22} aria-hidden="true" /></div>
                    <p>{related.blurb || related.description}</p>
                    <span className="solution-related-action">{ui.homeExplore}<ArrowRight size={16} aria-hidden="true" /></span>
                  </Link>
                </Reveal>
              );
            })}
        </ul>
      </section>

      <section className="solution-closing" aria-labelledby="solution-closing-title">
        <div className="solution-closing-image" aria-hidden="true"><img src={optimizeImage(FACTORY_IMAGE, { width: 1200 })} alt="" width="1200" height="800" loading="lazy" /></div>
        <div className="solution-container solution-closing-grid">
          <Reveal>
            <p className="solution-eyebrow">{detail.factoryEyebrow}</p>
            <h2 id="solution-closing-title" className={`solution-heading ${heading}`}>{detail.factoryHeading}</h2>
            <p className="solution-closing-description">{ui.quoteHeading}</p>
            <div className="solution-closing-actions">
              <Link to={lp('/rfq')} className="btn-primary">{ui.startRfq}<ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link to={lp('/products')} className="btn-secondary-on-dark">{ui.browseCatalog}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
