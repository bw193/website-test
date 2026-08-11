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
import { runWhenIdle } from '../utils/idle';

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

    if (initialCatalog) {
      const cancel = runWhenIdle(fetchData, 2500);
      return () => {
        active = false;
        cancel();
      };
    }

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

  return (
    <div className="bg-stone-50 min-h-screen pb-24">
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
      <div className="bg-stone-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Own factory photography — was a generic Unsplash bathroom stock shot,
            which reads as "this factory may not exist" to a sourcing buyer. */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${CATALOG_BACKDROP}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 to-stone-900" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif tracking-tight mb-6"
          >
            {t('products.catalog')}
          </m.h1>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto font-light"
          >
            {t('products.desc')}
          </m.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 md:p-6 mb-12">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              {/* Placeholder-as-label is unreliable (it disappears on input and
                  is inconsistently announced), and this placeholder was also
                  the one hardcoded English string on an otherwise localized page. */}
              <label htmlFor="product-search" className="sr-only">
                {t('products.searchLabel', 'Search products')}
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="product-search"
                type="search"
                placeholder={t('products.searchPlaceholder', 'Search products...')}
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl leading-5 bg-stone-50 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors sm:text-sm"
              />
            </div>

            {/* Categories */}
            <div className="w-full overflow-x-auto hide-scrollbar">
              {/* aria-pressed carries the filter state — it was previously
                  conveyed by background colour alone. */}
              <div className="flex flex-wrap gap-2" role="group" aria-label={t('products.searchLabel', 'Search products')}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  aria-pressed={selectedCategory === null}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === null
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {t('products.allCategories')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    {t(`products.categories.${cat}`, cat)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!loading && (
          <p className="mb-6 text-sm font-medium text-stone-600" aria-live="polite">
            {t('products.resultCount', {
              count: filteredProducts.length,
              defaultValue: '{{count}} products found',
            })}
          </p>
        )}

        {/* Grid classes below must match the resolved grid exactly, or the
            layout shifts when loading finishes. */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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
                className="w-full rounded-3xl overflow-hidden shadow-lg relative min-h-[500px] flex items-center justify-center bg-stone-100"
              >
                <div className="text-center py-24 w-full h-full flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200 mb-6">
                    <PackageX className="h-8 w-8 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">No products found</h3>
                  <p className="text-stone-500 max-w-md mx-auto">
                    {searchQuery 
                      ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search or filters.`
                      : t('products.noProducts')}
                  </p>
                </div>
                
                {(searchQuery || selectedCategory) && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                    <button
                      onClick={() => {
                        updateSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="px-6 py-3 bg-stone-900/90 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors shadow-xl border border-white/20 flex items-center gap-2"
                    >
                      <PackageX className="w-4 h-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </m.div>
            ) : (
              <m.div 
                key="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
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
          <div className="mt-12 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {t('products.showMore', 'Show more')}
            </button>
            <span className="text-xs text-stone-500">
              {Math.min(visibleCount, filteredProducts.length)} / {filteredProducts.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
