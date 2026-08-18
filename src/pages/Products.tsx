import { m, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Search, PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useCurrentLang } from '../hooks/useLocalizedPath';
import { readInitialCatalogData } from '../utils/prerenderData';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  category?: string;
  price_range?: string;
  msrp?: string;
}

// Own factory photography for the catalog header backdrop (replaces a generic
// Unsplash stock photo). Requested at 2000px because it renders full-bleed.
const CATALOG_BACKDROP =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/render/image/public/comp%20image/factory4.jpg?width=2000&resize=contain';

const DEFAULT_CATEGORIES = [
  "New Arrival",
  "Hot Sale",
  "Led Lighted Mirror",
  "Bathroom Mirror without led",
  "Full Length Dressing Mirror",
  "Irregular Mirror"
];

const PAGE_SIZE = 12;
const GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10';

export default function Products() {
  const initialCatalog = readInitialCatalogData<Product>();
  const [products, setProducts] = useState<Product[]>(initialCatalog?.products ?? []);
  const [categories, setCategories] = useState<string[]>(
    initialCatalog?.categories && initialCatalog.categories.length > 0
      ? initialCatalog.categories
      : DEFAULT_CATEGORIES
  );
  const [loading, setLoading] = useState(initialCatalog === null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { t } = useTranslation();
  const lang = useCurrentLang();

  const updateSearchQuery = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const normalizeCategory = (cat: string | undefined | null) => {
    if (!cat) return '';
    return cat.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const { supabase } = await import('../supabase');
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        if (!active) return;
        setProducts(productsData || []);

        // Fetch categories
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'categories')
          .single();

        if (!settingsError && settingsData && settingsData.value) {
          try {
            const parsed = JSON.parse(settingsData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (active) setCategories(parsed);
            }
          } catch (e) {
            console.error("Error parsing categories", e);
          }
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? normalizeCategory(p.category) === normalizeCategory(selectedCategory) : true;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // A new search or filter starts at the first batch. All matching products
  // remain reachable through the incremental Show more control below.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedCategory]);

  const categoryChip = (active: boolean) =>
    `relative pb-3 text-sm font-medium tracking-wide transition-colors whitespace-nowrap ${
      active ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'
    }`;

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-24 selection:bg-amber-200/60 selection:text-stone-900">
      <SEO
        title={t('seo.catalogTitle')}
        description={t('seo.catalogDesc')}
        path="/products"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "BOLEN LED Mirror Products Catalog",
          "description": "Explore our wide range of OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors from a leading LED mirror manufacturer.",
          "url": `https://bolenmirror.com/${lang}/products/`,
          "isPartOf": {
            "@type": "WebSite",
            "name": "BOLEN Mirror",
            "url": "https://bolenmirror.com"
          }
        }}
      />
      {/* Hero Section */}
      <div className="bg-stone-950 text-white pt-24 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Own factory photography — was a generic Unsplash bathroom stock shot,
            which reads as "this factory may not exist" to a sourcing buyer. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('${CATALOG_BACKDROP}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/70 to-stone-950" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-amber-400"
          >
            {t('products.kicker', 'OEM · ODM · Factory direct')}
          </m.p>
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
          >
            {t('products.catalog')}
          </m.h1>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mx-auto mt-8 max-w-2xl text-lg font-light leading-relaxed text-stone-300"
          >
            {t('products.desc')}
          </m.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="mb-14 rounded-2xl border border-stone-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md md:p-6">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              {/* Placeholder-as-label is unreliable (it disappears on input and
                  is inconsistently announced), and this placeholder was also
                  the one hardcoded English string on an otherwise localized page. */}
              <label htmlFor="product-search" className="sr-only">
                {t('products.searchLabel', 'Search products')}
              </label>
              <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" />
              </div>
              <input
                id="product-search"
                type="search"
                placeholder={t('products.searchPlaceholder', 'Search products...')}
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                className="block w-full border-0 border-b border-stone-200 bg-transparent py-3 pl-8 pr-3 text-sm text-stone-900 placeholder-stone-400 transition-colors focus:border-amber-600 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Categories */}
            <div className="w-full">
              {/* aria-pressed carries the filter state — it was previously
                  conveyed by background colour alone. */}
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-stone-200" role="group" aria-label={t('products.searchLabel', 'Search products')}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  aria-pressed={selectedCategory === null}
                  className={categoryChip(selectedCategory === null)}
                >
                  {t('products.allCategories')}
                  {selectedCategory === null && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-500" />
                  )}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                    className={categoryChip(selectedCategory === cat)}
                  >
                    {t(`products.categories.${cat}`, cat)}
                    {selectedCategory === cat && (
                      <span className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!loading && (
          <p className="mb-10 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400" aria-live="polite">
            {t('products.resultCount', {
              count: filteredProducts.length,
              defaultValue: '{{count}} products found',
            })}
          </p>
        )}

        {/* Grid classes below must match the resolved grid exactly, or the
            layout shifts when loading finishes. */}
        {loading ? (
          <div className={GRID_CLASS}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <m.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex min-h-[420px] w-full items-center justify-center rounded-3xl bg-white"
              >
                <div className="flex w-full flex-col items-center justify-center px-6 py-24 text-center">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                    <PackageX className="h-8 w-8 text-stone-400" />
                  </div>
                  <h3 className="mb-2 font-serif text-2xl text-stone-900">
                    {t('products.emptyTitle', 'No products found')}
                  </h3>
                  <p className="mx-auto max-w-md text-stone-500">
                    {searchQuery 
                      ? t('products.emptySearch', 'We couldn’t find anything matching “{{query}}”. Try adjusting your search or filters.', { query: searchQuery })
                      : t('products.noProducts')}
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <button
                      onClick={() => {
                        updateSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="mt-8 rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-800 transition-colors hover:border-stone-900 hover:text-stone-900"
                    >
                      {t('products.clearFilters', 'Clear all filters')}
                    </button>
                  )}
                </div>
              </m.div>
            ) : (
              <m.div 
                key="grid"
                className={GRID_CLASS}
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                  }
                }}
              >
                {visibleProducts.map((product) => (
                  <m.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                  >
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      description={product.description}
                      image={product.images?.[0]}
                      category={product.category}
                      priceRange={product.price_range}
                      msrp={product.msrp}
                    />
                  </m.div>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        )}

        {!loading && filteredProducts.length > visibleCount && (
          <div className="mt-16 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-semibold text-stone-900 transition-colors hover:border-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {t('products.showMore', 'Show more')}
            </button>
            <span className="text-xs tracking-wide text-stone-400">
              {Math.min(visibleCount, filteredProducts.length)} / {filteredProducts.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
