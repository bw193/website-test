import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, Factory, Globe } from 'lucide-react';
import SEO from '../components/SEO';

export default function OurStory() {
  const { t } = useTranslation();
  const paragraphs = t('ourStoryPage.paragraphs', { returnObjects: true }) as string[];
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen selection:bg-stone-200 selection:text-stone-900">
      <SEO
        title="Our Story | BOLEN LED Mirror Manufacturer"
        description="Learn about the history and manufacturing excellence of BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), a leading LED mirror manufacturer since 1995 specializing in OEM smart mirrors."
        canonicalUrl="https://bolenmirror.com/our-story"
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Our Story — BOLEN LED Mirror Manufacturer",
          "description": "Learn about the history and manufacturing excellence of BOLEN, a leading LED mirror manufacturer since 1995.",
          "url": "https://bolenmirror.com/our-story",
          "mainEntity": {
            "@type": "Organization",
            "name": "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
            "foundingDate": "1995",
            "url": "https://bolenmirror.com",
            "numberOfEmployees": { "@type": "QuantitativeValue", "value": 200 },
            "areaServed": "Worldwide"
          }
        }}
      />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-stone-900">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-stone-900/80 z-10 mix-blend-multiply" />
          <img 
            src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/building.jpg" 
            alt="Factory Building" 
            className="w-full h-full object-cover object-center scale-105"
            width="1920"
            height="1080"
            referrerPolicy="no-referrer"
            fetchPriority="high"
            decoding="async"
          />
        </motion.div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="px-4 py-1.5 rounded-full border border-white/20 text-white/80 text-xs font-medium tracking-[0.2em] uppercase backdrop-blur-sm">
              {t('ourStoryPage.subtitle')}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-serif text-white mb-8 leading-[0.9] tracking-tight"
          >
            {t('ourStoryPage.title')}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-3"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Discover</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 w-full h-1/2 bg-white"
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chapter 1: Heritage & Scale */}
      <section className="py-32 md:py-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 bg-[#FAF9F6]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-10"
          >
            <div className="flex items-center gap-6">
              <span className="text-stone-300 font-serif text-6xl leading-none">01</span>
              <div className="h-px w-16 bg-stone-300"></div>
              <span className="text-stone-500 font-medium tracking-[0.2em] uppercase text-xs">Heritage</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.1] tracking-tight">
              Two decades of <br/>
              <span className="italic text-stone-500 font-light">dedicated craftsmanship.</span>
            </h2>
            
            <div className="space-y-6 text-lg text-stone-600 font-light leading-relaxed max-w-md">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-stone-900 first-letter:mr-2 first-letter:float-left">{paragraphs[0]}</p>
            </div>
          </motion.div>

          <div className="lg:col-span-7 relative">
            <motion.div 
              initial={{ opacity: 0, clipPath: 'inset(10% 10% 10% 10%)', scale: 0.95 }}
              whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[4/5] md:aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl"
            >
              <img 
                src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory1.jpg" 
                alt="Craftsmanship" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000 ease-out"
                width="2000"
                height="1333"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
            
            {/* Floating Stat Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50, x: 50, rotate: 5 }}
              whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-10 -left-10 md:-bottom-16 md:-left-16 bg-stone-900 p-10 max-w-xs hidden sm:flex flex-col justify-center rounded-3xl shadow-2xl border border-stone-800"
            >
              <div className="w-12 h-px bg-amber-600 mb-8"></div>
              <p className="text-6xl font-serif text-white mb-4">50k<span className="text-amber-500">+</span></p>
              <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-medium leading-relaxed">Sq. Meters of<br/>Production Space</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chapter 2: Vertical Integration */}
      <section className="py-32 md:py-48 bg-stone-100 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Sticky Text Content */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="sticky top-32 space-y-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center gap-6"
                >
                  <span className="text-stone-300 font-serif text-6xl leading-none">02</span>
                  <div className="h-px w-16 bg-stone-300"></div>
                  <span className="text-stone-500 font-medium tracking-[0.2em] uppercase text-xs">Process</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.1] tracking-tight"
                >
                  Vertical integration <br/>
                  <span className="italic text-stone-500 font-light">under one roof.</span>
                </motion.h2>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-6 text-lg text-stone-600 font-light leading-relaxed"
                >
                  <p>{paragraphs[1]}</p>
                </motion.div>
              </div>
            </div>

            {/* Image Grid */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-4 md:space-y-8 mt-12 md:mt-24">
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="aspect-[3/4] overflow-hidden bg-stone-200 rounded-3xl shadow-xl"
                  >
                    <img src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory2.jpg" alt="Production Detail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" width="1000" height="1333" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="aspect-square overflow-hidden bg-stone-200 rounded-3xl shadow-xl"
                  >
                    <img src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory3.jpg" alt="Materials" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" width="1000" height="1000" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  </motion.div>
                </div>
                <div className="space-y-4 md:space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="aspect-square overflow-hidden bg-stone-200 rounded-3xl shadow-xl"
                  >
                    <img src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory4.jpg" alt="Quality Control" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" width="1000" height="1000" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="aspect-[3/4] overflow-hidden bg-stone-200 rounded-3xl shadow-xl"
                  >
                    <img src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory5.jpg" alt="Finished Product" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" width="1000" height="1333" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  </motion.div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Chapter 3: Innovation & Partnership */}
      <section className="py-32 md:py-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-6 mb-8"
          >
            <div className="h-px w-12 bg-stone-300"></div>
            <span className="text-stone-500 font-medium tracking-[0.2em] uppercase text-xs">03 / The Future</span>
            <div className="h-px w-12 bg-stone-300"></div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.1] tracking-tight mb-8"
          >
            Building partnerships <br/>
            <span className="italic text-stone-500 font-light">that last.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: -10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-white p-12 md:p-16 border border-stone-200 hover:border-stone-300 hover:shadow-2xl transition-all duration-500 flex flex-col items-start rounded-3xl"
          >
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-500 shadow-sm border border-stone-100">
              <Factory className="w-7 h-7 text-stone-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <h3 className="text-2xl font-serif text-stone-900 mb-6">Design & Innovation</h3>
            <p className="text-lg text-stone-600 font-light leading-relaxed">
              {paragraphs[2]}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: -10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-white p-12 md:p-16 border border-stone-200 hover:border-stone-300 hover:shadow-2xl transition-all duration-500 flex flex-col items-start rounded-3xl"
          >
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-500 shadow-sm border border-stone-100">
              <Globe className="w-7 h-7 text-stone-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <h3 className="text-2xl font-serif text-stone-900 mb-6">Global Compliance</h3>
            <p className="text-lg text-stone-600 font-light leading-relaxed">
              {paragraphs[3]}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
