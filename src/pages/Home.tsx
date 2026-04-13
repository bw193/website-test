import { m, AnimatePresence } from 'motion/react';
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, ShieldCheck, Truck, Factory, Lightbulb, Users, Clock, CheckCircle2, ChevronRight, ChevronLeft, Settings, Palette } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { optimizeImage } from '../utils/optimizeImage';

const GlobalMap = lazy(() => import('../components/GlobalMap'));

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const { t } = useTranslation();
  const [heroBgs, setHeroBgs] = useState<string[]>([
    "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg"
  ]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "New Arrival",
    "Hot Sale",
    "Led Lighted Mirror",
    "Bathroom Mirror without led",
    "Full Length Dressing Mirror",
    "Irregular Mirror"
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const normalizeCategory = (cat: string | undefined | null) => {
    if (!cat) return '';
    return cat.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch hero background settings
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_bg')
          .single();
        
        if (data && data.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const filtered = parsed.filter(url => !url.includes('building.jpg'));
              if (filtered.length > 0) {
                setHeroBgs(filtered);
              }
            } else if (typeof data.value === 'string' && data.value.length > 0 && !data.value.startsWith('[')) {
              if (!data.value.includes('building.jpg')) {
                setHeroBgs([data.value]);
              }
            }
          } catch (e) {
            if (typeof data.value === 'string' && data.value.length > 0) {
              if (!data.value.includes('building.jpg')) {
                setHeroBgs([data.value]);
              }
            }
          }
        }

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

        // Fetch all products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!productsError && productsData) {
          setAllProducts(productsData);
        }
      } catch (err) {
        // Ignore errors if table doesn't exist or setting not found
        console.error("Could not fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const featuredProducts = allProducts
    .filter(p => selectedCategory ? normalizeCategory(p.category) === normalizeCategory(selectedCategory) : true)
    .slice(0, 6);

  useEffect(() => {
    if (heroBgs.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBgs.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [heroBgs.length, currentBgIndex]);

  const nextBg = () => {
    setCurrentBgIndex((prev) => (prev + 1) % heroBgs.length);
  };

  const prevBg = () => {
    setCurrentBgIndex((prev) => (prev - 1 + heroBgs.length) % heroBgs.length);
  };

  return (
    <div className="bg-[#FAF9F6] text-stone-800 font-sans overflow-hidden">
      <SEO schema={[
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
          "url": "https://bolenmirror.com",
          "logo": "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png",
          "description": "Leading LED mirror manufacturer specializing in OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors for global brands.",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+86-18058603602",
            "email": "bolen2@cnjxctm.com",
            "contactType": "customer service",
            "areaServed": "Worldwide",
            "availableLanguage": ["en", "zh", "es", "fr", "de", "it"]
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town",
            "addressLocality": "Jiaxing",
            "addressRegion": "Zhejiang",
            "addressCountry": "CN"
          },
          "sameAs": []
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "BOLEN Mirror",
          "url": "https://bolenmirror.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://bolenmirror.com/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
      ]} />
      {/* Hero Section */}
      <div className="relative bg-stone-900 min-h-[90vh] flex items-center justify-center overflow-hidden group">
        <h1 className="sr-only">BOLEN — LED Mirror Manufacturer & OEM Smart Mirror Factory</h1>
        <div className="absolute inset-0">
          <AnimatePresence>
            {heroBgs.length > 0 && (
              <m.img
                key={currentBgIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
                src={optimizeImage(heroBgs[currentBgIndex], { width: 1920, quality: 85 })}
                alt="BOLEN LED bathroom mirror manufacturing showcase"
                referrerPolicy="no-referrer"
                fetchPriority="high"
                decoding="async"
              />
            )}
          </AnimatePresence>
        </div>

        {heroBgs.length > 1 && (
          <>
            <button 
              onClick={prevBg}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={nextBg}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroBgs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBgIndex(idx)}
                  className="p-3"
                  aria-label={`Go to image ${idx + 1}`}
                ><span className={`block w-2.5 h-2.5 rounded-full transition-all ${idx === currentBgIndex ? 'bg-amber-400 w-8' : 'bg-white/50 hover:bg-white/80'}`} /></button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats Section */}
      <div className="relative -mt-16 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="bg-white rounded-2xl shadow-xl border border-stone-100 p-8 lg:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {[
            { icon: Factory, value: "50k+", label: t('home.stats.sqMeters') },
            { icon: Users, value: "200+", label: t('home.stats.artisans') },
            { icon: Lightbulb, value: "200+", label: t('home.stats.styles') },
            { icon: Globe, value: "Global", label: t('home.stats.global') }
          ].map((stat, idx) => (
            <m.div key={idx} variants={fadeIn} className="flex flex-col items-center text-center group">
              <div className="h-14 w-14 rounded-full bg-stone-50 group-hover:bg-amber-50 flex items-center justify-center mb-4 transition-colors duration-300">
                <stat.icon className="h-7 w-7 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-stone-900 mb-1 font-serif">{stat.value}</p>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold">{stat.label}</p>
            </m.div>
          ))}
        </m.div>
      </div>

      {/* About Section */}
      <div id="about" className="py-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl leading-tight mb-6">
              Global Reach: <span className="italic text-amber-700">From Shanghai to the World</span>
            </h2>
            <p className="text-lg text-stone-600 font-light leading-relaxed">
              Headquartered in Jiaxing, Zhejiang, China—just 60 kilometers from Shanghai—Chengtai has grown into a fully integrated enterprise specializing in the research, development, manufacturing, and global export of premium mirror products.
            </p>
          </m.div>
          
          <m.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full"
          >
            <div className="aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl relative border border-stone-200">
              <Suspense fallback={<div className="w-full h-full bg-stone-200 animate-pulse rounded-3xl" />}>
                <GlobalMap />
              </Suspense>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-stone-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />
          </m.div>
        </div>
      </div>

      {/* Featured Collections (Bento Grid) */}
      <div className="py-24 bg-stone-50 text-stone-900 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.collections.subtitle')}</span>
              <h2 className="text-4xl font-serif sm:text-5xl mb-4">{t('home.collections.title')}</h2>
              <p className="text-lg text-stone-600 font-light">
                {t('home.collections.desc')}
              </p>
            </m.div>
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/products" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors group">
                {t('home.collections.viewAll')} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </m.div>
          </div>

          {/* Category Filter */}
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2 mb-12"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-stone-900 text-white shadow-md scale-105'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {t('products.allCategories', 'All Categories')}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-stone-900 text-white shadow-md scale-105'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {category}
              </button>
            ))}
          </m.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, idx) => (
                <m.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              <>
                <m.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer"
                >
                  <Link to="/products" className="block w-full h-full">
                    <img src="https://picsum.photos/seed/smart-mirror/800/600" alt="Smart Mirrors" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" width="800" height="600" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full text-white">
                      <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-sm shadow-sm">{t('home.collections.smart.tag')}</span>
                      <h3 className="text-3xl md:text-4xl font-serif mb-3 drop-shadow-md">{t('home.collections.smart.title')}</h3>
                      <p className="text-stone-200 max-w-md font-light mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 drop-shadow-sm">
                        {t('home.collections.smart.desc')}
                      </p>
                      <span className="inline-flex items-center text-white font-medium drop-shadow-sm">
                        {t('home.collections.smart.explore')} <ChevronRight className="ml-1 h-5 w-5" />
                      </span>
                    </div>
                  </Link>
                </m.div>

                <m.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="relative rounded-3xl overflow-hidden group cursor-pointer"
                >
                  <Link to="/products" className="block w-full h-full">
                    <img src="https://picsum.photos/seed/vanity-mirror/400/400" alt="Vanity Mirrors" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" width="400" height="400" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 p-8 w-full text-white">
                      <h3 className="text-2xl font-serif mb-2 drop-shadow-md">{t('home.collections.vanity.title')}</h3>
                      <p className="text-stone-200 text-sm font-light mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 drop-shadow-sm">
                        {t('home.collections.vanity.desc')}
                      </p>
                      <span className="inline-flex items-center text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-sm">
                        {t('home.collections.vanity.explore')} <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </m.div>

                <m.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="relative rounded-3xl overflow-hidden group cursor-pointer bg-white p-8 flex flex-col justify-between border border-stone-200 hover:border-amber-500/50 hover:shadow-lg transition-all"
                >
                  <Link to="/products" className="block w-full h-full flex flex-col justify-between">
                    <div>
                      <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                        <Factory className="h-6 w-6 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-serif mb-3 text-stone-900">{t('home.collections.oem.title')}</h3>
                      <p className="text-stone-600 text-sm font-light leading-relaxed">
                        {t('home.collections.oem.desc')}
                      </p>
                    </div>
                    <span className="inline-flex items-center text-amber-600 font-medium mt-6">
                      {t('home.collections.oem.partner')} <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </m.div>
              </>
            </div>
          )}
        </div>
      </div>

      {/* The BOLEN Process */}
      <div className="py-24 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.process.subtitle')}</span>
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4">{t('home.process.title')}</h2>
            <p className="text-lg text-stone-600 font-light">
              {t('home.process.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: t('home.process.steps.s1.title'), desc: t('home.process.steps.s1.desc') },
              { step: "02", title: t('home.process.steps.s2.title'), desc: t('home.process.steps.s2.desc') },
              { step: "03", title: t('home.process.steps.s3.title'), desc: t('home.process.steps.s3.desc') },
              { step: "04", title: t('home.process.steps.s4.title'), desc: t('home.process.steps.s4.desc') }
            ].map((item, idx) => (
              <m.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                {idx !== 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-[1px] bg-stone-300" />
                )}
                <div className="relative z-10 bg-white w-16 h-16 rounded-full border-4 border-stone-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <span className="text-xl font-serif font-bold text-amber-600">{item.step}</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-stone-600 text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl leading-tight">
              {t('home.whyUs.title1')} <span className="italic text-amber-700">{t('home.whyUs.title2')}</span>
            </h2>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Factory className="w-8 h-8" />, idx: 0 },
              { icon: <Settings className="w-8 h-8" />, idx: 1 },
              { icon: <Palette className="w-8 h-8" />, idx: 2 },
              { icon: <ShieldCheck className="w-8 h-8" />, idx: 3 }
            ].map((item, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-4">
                  {(t('home.whyUs.features', { returnObjects: true }) as any[])[item.idx]?.title}
                </h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  {(t('home.whyUs.paragraphs', { returnObjects: true }) as string[])[item.idx]}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="py-16 bg-white border-t border-stone-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.certificates.subtitle')}</span>
          <h2 className="text-3xl font-serif text-stone-900">{t('home.certificates.title')}</h2>
        </div>
        
        <div className="relative w-full overflow-hidden flex group">
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite;
              }
              .group:hover .animate-marquee {
                animation-play-state: paused;
              }
            `}
          </style>
          
          <div className="flex animate-marquee whitespace-nowrap w-max">
            {/* First set of images */}
            {[
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/au.png", alt: "SAA Australia certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/CE(1)(1).jpg", alt: "CE European conformity certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/IP44.jpg", alt: "IP44 water and dust resistance rating" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UKCA.jpg", alt: "UKCA United Kingdom conformity certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UL2.jpg", alt: "UL safety certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/ctce.png", alt: "CCC China compulsory certification" }
            ].map((cert, idx) => (
              <div key={`cert-1-${idx}`} className="mx-8 flex-none w-48 h-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <img src={optimizeImage(cert.url, { width: 192, height: 128 })} alt={cert.alt} className="max-w-full max-h-full object-contain" width="192" height="128" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </div>
            ))}
            {/* Duplicate set for seamless scrolling */}
            {[
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/au.png", alt: "SAA Australia certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/CE(1)(1).jpg", alt: "CE European conformity certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/IP44.jpg", alt: "IP44 water and dust resistance rating" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UKCA.jpg", alt: "UKCA United Kingdom conformity certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/UL2.jpg", alt: "UL safety certification" },
              { url: "https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/ctce.png", alt: "CCC China compulsory certification" }
            ].map((cert, idx) => (
              <div key={`cert-2-${idx}`} className="mx-8 flex-none w-48 h-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <img src={optimizeImage(cert.url, { width: 192, height: 128 })} alt={cert.alt} className="max-w-full max-h-full object-contain" width="192" height="128" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-stone-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/mirror-cta/1200/400" alt="Background" className="w-full h-full object-cover opacity-20" width="1200" height="400" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-stone-900/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <m.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif text-white sm:text-5xl mb-6"
          >
            {t('home.cta.title')}
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-300 font-light mb-10"
          >
            {t('home.cta.desc')}
          </m.p>
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/products" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-stone-900 bg-amber-400 hover:bg-amber-500 transition-colors">
              {t('home.cta.viewCatalog')}
            </Link>
            <Link to="/rfq" className="inline-flex justify-center items-center px-8 py-4 border border-stone-300 text-base font-medium rounded-full text-white hover:bg-white/10 transition-colors">
              {t('home.cta.contactSales')}
            </Link>
          </m.div>
        </div>
      </div>
    </div>
  );
}

