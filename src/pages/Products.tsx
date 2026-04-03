import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';
import { Loader2, Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

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
  const [heroBgs, setHeroBgs] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
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

        // Fetch hero backgrounds
        const { data: heroData, error: heroError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_bg')
          .single();

        if (!heroError && heroData && heroData.value) {
          try {
            const parsed = JSON.parse(heroData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroBgs(parsed);
            } else if (typeof heroData.value === 'string' && heroData.value.length > 0 && !heroData.value.startsWith('[')) {
              setHeroBgs([heroData.value]);
            }
          } catch (e) {
            if (typeof heroData.value === 'string' && heroData.value.length > 0) {
              setHeroBgs([heroData.value]);
            }
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

  useEffect(() => {
    if (heroBgs.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBgs.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroBgs.length, currentBgIndex]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? normalizeCategory(p.category) === normalizeCategory(selectedCategory) : true;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-stone-50 min-h-screen pb-24">
      {/* Hero Section */}
      <div className="bg-stone-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 to-stone-900" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
          >
            {t('products.catalog')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto font-light"
          >
            {t('products.desc')}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 md:p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
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
            <div className="flex-1 w-full overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <div className="flex md:flex-wrap gap-2 md:justify-end min-w-max md:min-w-0">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === null
                      ? 'bg-stone-900 text-white shadow-md scale-105'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {t('products.allCategories')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white shadow-md scale-105'
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
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full rounded-3xl overflow-hidden shadow-lg relative min-h-[500px] flex items-center justify-center bg-stone-100"
              >
                {heroBgs.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentBgIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        src={heroBgs[currentBgIndex]}
                        alt="Promotion"
                        referrerPolicy="no-referrer"
                        fetchPriority="high"
                        decoding="async"
                      />
                    </AnimatePresence>
                    
                    {heroBgs.length > 1 && (
                      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {heroBgs.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentBgIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBgIndex ? 'bg-amber-600 w-8' : 'bg-white/50 hover:bg-white/80'}`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
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
                )}
                
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
              </motion.div>
            ) : (
              <motion.div 
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
                  <motion.div
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
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
