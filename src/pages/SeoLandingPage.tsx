import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
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

const SITE_URL = 'https://bolenmirror.com';

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
  const { slug = '' } = useParams<{ slug: string }>();
  const { lang, lp } = useLocalizedPath();
  const sourcePage = SEO_LANDING_BY_SLUG[slug];
  const page = sourcePage ? localizeSeoLandingPage(sourcePage, lang) : undefined;
  const ui = getSeoSolutionsUi(lang);
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

  const showProducts = loading || featuredProducts.length > 0;
  const ogImage = featuredProducts[0]?.images?.[0];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800">
      <SEO
        title={page.title}
        description={page.description}
        path={`${SEO_SOLUTIONS_PATH}/${page.slug}`}
        ogImage={ogImage}
        schema={[serviceSchema, faqSchema, breadcrumbSchema]}
      />

      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav className="text-sm text-stone-500" aria-label="Breadcrumb">
            <Link to={lp('/')} className="hover:text-stone-900">{ui.home}</Link>
            <span aria-hidden="true"> / </span>
            <Link to={lp('/solutions')} className="hover:text-stone-900">{ui.solutions}</Link>
            <span aria-hidden="true"> / </span>
            <span className="text-stone-800">{page.shortTitle || page.h1}</span>
          </nav>
          <h1 className={`mt-8 text-3xl leading-snug text-stone-900 sm:text-4xl ${heading}`}>
            {page.h1}
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">{page.blurb || page.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={lp('/rfq')} className="btn-primary">{ui.requestQuote}</Link>
            <Link to={lp('/products')} className="btn-secondary">{ui.viewCatalog}</Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone-600">
            {page.proofPoints.map((point) => (
              <li key={point.label}>
                <span className="font-medium text-stone-900">{point.value}</span>
                <span className="text-stone-400"> · </span>
                {point.label}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {showProducts && (
        <section className="border-b border-stone-200 bg-[#FAF9F6]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className={`text-2xl text-stone-900 ${heading}`}>{ui.modelsHeading}</h2>
              <Link to={lp('/products')} className="text-sm font-medium text-stone-700 hover:text-stone-900">
                {ui.viewAllProducts}
              </Link>
            </div>
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={index} />)
                : featuredProducts.slice(0, 3).map((product) => {
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
                      <ProductCard
                        key={product.id}
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
                    );
                  })}
            </div>
          </div>
        </section>
      )}

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-[17px] leading-8 text-stone-700">{page.intro}</p>
        {page.sections.map((section) => (
          <section key={section.heading} className="mt-12">
            <h2 className={`text-2xl text-stone-900 ${heading}`}>{section.heading}</h2>
            <div className="mt-4 space-y-4 text-[17px] leading-8 text-stone-700">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {section.bullets && (
              <ul className="mt-5 list-disc space-y-2 pl-5 text-[17px] leading-8 text-stone-700">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-16 border-t border-stone-200 pt-12">
          <h2 className={`text-2xl text-stone-900 ${heading}`}>{ui.faqHeading}</h2>
          <div className="mt-6 divide-y divide-stone-200">
            {page.faq.map((item) => (
              <article key={item.question} className="py-5">
                <h3 className="font-medium text-stone-900">{item.question}</h3>
                <p className="mt-2 text-[17px] leading-8 text-stone-700">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-stone-200 pt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">{ui.relatedSolutions}</h2>
          <ul className="mt-4 space-y-3">
            {page.relatedSlugs.map((relatedSlug) => {
              const relatedSource = SEO_LANDING_BY_SLUG[relatedSlug];
              const related = relatedSource ? localizeSeoLandingPage(relatedSource, lang) : undefined;
              if (!related) return null;
              return (
                <li key={related.slug}>
                  <Link to={lp(`/solutions/${related.slug}`)} className="group inline-flex items-center gap-2 text-[17px] text-stone-900 hover:text-amber-800">
                    {related.shortTitle || related.h1}
                    <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-amber-800" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="mt-14 flex flex-col gap-4 border-t border-stone-200 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[17px] leading-7 text-stone-700">{ui.quoteHeading}</p>
          <Link to={lp('/rfq')} className="btn-primary shrink-0">{ui.startRfq}</Link>
        </div>
      </article>
    </div>
  );
}
