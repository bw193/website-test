import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowDown } from 'lucide-react';

export default function OurStory() {
  const { t } = useTranslation();
  const paragraphs = t('ourStoryPage.paragraphs', { returnObjects: true }) as string[];
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="bg-[#FAF9F6] min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-stone-900/40 z-10" />
          <img 
            src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/building.jpg" 
            alt="Factory Building" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-amber-400 font-medium tracking-[0.2em] uppercase text-sm md:text-base mb-6"
          >
            {t('ourStoryPage.subtitle')}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-8 leading-none"
          >
            {t('ourStoryPage.title')}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Chapter 1: Heritage & Scale */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-amber-600"></span>
              <span className="text-amber-600 font-medium tracking-widest uppercase text-sm">01 / Heritage</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight">
              Two decades of <br/><span className="italic text-stone-500">dedicated craftsmanship.</span>
            </h2>
            <div className="space-y-6 text-lg text-stone-600 font-light leading-relaxed">
              <p>{paragraphs[0]}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="lg:col-span-7 relative"
          >
            <div className="aspect-[4/5] md:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop" 
                alt="Craftsmanship" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Stat Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 bg-white p-8 rounded-2xl shadow-xl max-w-xs hidden sm:block"
            >
              <p className="text-5xl font-serif text-stone-900 mb-2">50k+</p>
              <p className="text-sm text-stone-500 uppercase tracking-wider font-medium">Sq. Meters of Production Space</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Chapter 2: Vertical Integration */}
      <section className="py-24 md:py-32 bg-stone-900 text-stone-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="lg:col-span-6 order-2 lg:order-1"
            >
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4 md:space-y-6 mt-12 md:mt-24">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=1000&auto=format&fit=crop" alt="Production Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop" alt="Materials" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop" alt="Quality Control" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1000&auto=format&fit=crop" alt="Finished Product" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 order-1 lg:order-2 space-y-8"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-amber-500"></span>
                <span className="text-amber-500 font-medium tracking-widest uppercase text-sm">02 / Process</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                Vertical integration <br/><span className="italic text-stone-400">under one roof.</span>
              </h2>
              <div className="space-y-6 text-lg text-stone-400 font-light leading-relaxed">
                <p>{paragraphs[1]}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chapter 3: Innovation & Partnership */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <span className="h-px w-8 bg-amber-600"></span>
            <span className="text-amber-600 font-medium tracking-widest uppercase text-sm">03 / The Future</span>
            <span className="h-px w-8 bg-amber-600"></span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight mb-8"
          >
            Building partnerships <br/><span className="italic text-stone-500">that last.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-stone-100"
          >
            <h3 className="text-2xl font-serif text-stone-900 mb-6">Design & Innovation</h3>
            <p className="text-lg text-stone-600 font-light leading-relaxed">
              {paragraphs[2]}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-stone-100"
          >
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
