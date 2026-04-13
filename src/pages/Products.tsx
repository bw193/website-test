import { m, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';
import { Loader2, Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  category?: string;
  price_range?: string;
  msrp?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "New Arrival",
    "Hot Sale",
    "Led Lighted Mirror",
    "Bathroom Mirror without led",
    "Full Length Dressing Mirror",
    "Irregular Mirror"
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const normalizeCategory = (cat: string | undefined | null) => {
    if (!cat) return '';
    return cat.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
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
              setCategories(parsed);
            }
          } catch (e) {
            console.error("Error parsing categories", e);
          }
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? normalizeCategory(p.category) === normalizeCategory(selectedCategory) : true;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-stone-50 min-h-screen pb-24">
      <SEO
        title="LED Mirror Products Catalog | BOLEN Mirror Manufacturer"
        description="Explore our wide range of OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors from a leading LED mirror manufacturer. High-quality manufacturing for global brands."
        canonicalUrl="https://bolenmirror.com/products"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "BOLEN LED Mirror Products Catalog",
          "description": "Explore our wide range of OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors from a leading LED mirror manufacturer.",
          "url": "https://bolenmirror.com/products",
          "isPartOf": {
            "@type": "WebSite",
            "name": "BOLEN Mirror",
            "url": "https://bolenmirror.com"
          }
        }}
      />
      {/* Hero Section */}
      <div className="bg-stone-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 to-stone-900" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl leading-5 bg-stone-50 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors sm:text-sm"
              />
            </div>

            {/* Categories */}
            <div className="w-full overflow-x-auto hide-scrollbar">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl flex flex-col h-full overflow-hidden shadow-sm border border-stone-100 relative animate-pulse">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-200"></div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3 w-20 h-5 bg-stone-200 rounded-md"></div>
                  <div className="w-3/4 h-6 bg-stone-200 rounded mb-2"></div>
                  <div className="w-full h-4 bg-stone-200 rounded mb-2"></div>
                  <div className="w-5/6 h-4 bg-stone-200 rounded mb-4"></div>
                  <div className="mt-auto pt-4 border-t border-stone-100">
                    <div className="w-24 h-6 bg-stone-200 rounded"></div>
                  </div>
                </div>
              </div>
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
                        setSearchQuery('');
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
                {filteredProducts.map((product) => (
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
      </div>
    </div>
  );
}
