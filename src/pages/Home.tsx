import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Globe, ShieldCheck, Truck, Factory, Lightbulb, Users, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

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

  return (
    <div className="bg-[#FAF9F6] text-stone-800 font-sans overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-stone-900 min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="w-full h-full object-cover opacity-40"
            src="https://picsum.photos/seed/warm-interior-mirror/1920/1080?blur=2"
            alt="Premium Mirrors"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent mix-blend-multiply" />
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 w-full">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.span variants={fadeIn} className="inline-block text-amber-500 font-semibold tracking-wider uppercase mb-4 tracking-[0.2em] text-sm">
              {t('home.companyName')}
            </motion.span>
            <motion.h1 variants={fadeIn} className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
              {t('home.heroTitle1')} <br />
              <span className="text-amber-400 font-serif italic font-light">{t('home.heroTitle2')}</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-6 text-xl text-stone-300 max-w-2xl leading-relaxed font-light">
              <Trans i18nKey="home.heroDesc" components={{ 1: <strong /> }} />
            </motion.p>
            <motion.div variants={fadeIn} className="mt-10 flex flex-wrap gap-4">
              <Link to="/products" className="group inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-stone-900 bg-amber-400 hover:bg-amber-500 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                {t('home.exploreBtn')} 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#about" className="inline-flex items-center px-8 py-4 border border-stone-300/30 text-base font-medium rounded-full text-stone-200 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                {t('home.ourStoryBtn')}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-16 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
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
            <motion.div key={idx} variants={fadeIn} className="flex flex-col items-center text-center group">
              <div className="h-14 w-14 rounded-full bg-stone-50 group-hover:bg-amber-50 flex items-center justify-center mb-4 transition-colors duration-300">
                <stat.icon className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-3xl font-bold text-stone-900 mb-1 font-serif">{stat.value}</h3>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* About Section */}
      <div id="about" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.about.heritage')}</span>
              <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl mb-6 leading-tight">{t('home.about.title1')} <span className="italic text-amber-700">{t('home.about.title2')}</span></h2>
              <div className="space-y-6 text-lg text-stone-600 font-light leading-relaxed">
                <p>{t('home.about.desc1')}</p>
                <p>{t('home.about.desc2')}</p>
              </div>
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src={`https://picsum.photos/seed/worker${i}/100/100`} alt="Worker" referrerPolicy="no-referrer" />
                  ))}
                </div>
                <p className="text-sm text-stone-500 font-medium">{t('home.about.backedBy')}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-12 lg:mt-0 relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                <img src="https://picsum.photos/seed/mirror-factory/800/1000" alt="Factory" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-2xl font-serif italic mb-2">{t('home.about.quote')}</p>
                  <p className="text-sm text-stone-300 uppercase tracking-widest">{t('home.about.corePrinciple')}</p>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-stone-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Collections (Bento Grid) */}
      <div className="py-24 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <span className="text-amber-500 font-semibold tracking-wider uppercase text-sm mb-2 block">{t('home.collections.subtitle')}</span>
              <h2 className="text-4xl font-serif sm:text-5xl mb-4">{t('home.collections.title')}</h2>
              <p className="text-lg text-stone-400 font-light">
                {t('home.collections.desc')}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/products" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium transition-colors group">
                {t('home.collections.viewAll')} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer"
            >
              <img src="https://picsum.photos/seed/smart-mirror/1200/800" alt="Smart Mirrors" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-sm">{t('home.collections.smart.tag')}</span>
                <h3 className="text-3xl md:text-4xl font-serif mb-3">{t('home.collections.smart.title')}</h3>
                <p className="text-stone-300 max-w-md font-light mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {t('home.collections.smart.desc')}
                </p>
                <Link to="/products" className="inline-flex items-center text-white font-medium">
                  {t('home.collections.smart.explore')} <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden group cursor-pointer"
            >
              <img src="https://picsum.photos/seed/vanity-mirror/600/600" alt="Vanity Mirrors" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-serif mb-2">{t('home.collections.vanity.title')}</h3>
                <p className="text-stone-300 text-sm font-light mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {t('home.collections.vanity.desc')}
                </p>
                <Link to="/products" className="inline-flex items-center text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {t('home.collections.vanity.explore')} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative rounded-3xl overflow-hidden group cursor-pointer bg-stone-800 p-8 flex flex-col justify-between border border-stone-700 hover:border-amber-500/50 transition-colors"
            >
              <div>
                <div className="h-12 w-12 rounded-full bg-stone-700 flex items-center justify-center mb-6">
                  <Factory className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-2xl font-serif mb-3">{t('home.collections.oem.title')}</h3>
                <p className="text-stone-400 text-sm font-light leading-relaxed">
                  {t('home.collections.oem.desc')}
                </p>
              </div>
              <Link to="/products" className="inline-flex items-center text-amber-400 font-medium mt-6">
                {t('home.collections.oem.partner')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </div>
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
              <motion.div 
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 mb-12 lg:mb-0"
            >
              <h2 className="text-4xl font-serif text-stone-900 sm:text-5xl mb-6 leading-tight">{t('home.whyUs.title1')} <br/>{t('home.whyUs.title2')}</h2>
              <p className="text-lg text-stone-600 font-light mb-8">
                {t('home.whyUs.desc')}
              </p>
              <ul className="space-y-4">
                {(t('home.whyUs.points', { returnObjects: true }) as string[]).map((text: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0" />
                    <span className="text-stone-700">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 hover:shadow-lg transition-shadow duration-300">
                <ShieldCheck className="h-10 w-10 text-amber-600 mb-6" />
                <h3 className="text-xl font-bold text-stone-900 mb-3">{t('home.whyUs.cert.title')}</h3>
                <p className="text-stone-600 font-light text-sm leading-relaxed">{t('home.whyUs.cert.desc')}</p>
              </div>
              <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 hover:shadow-lg transition-shadow duration-300 sm:translate-y-8">
                <Truck className="h-10 w-10 text-amber-600 mb-6" />
                <h3 className="text-xl font-bold text-stone-900 mb-3">{t('home.whyUs.logistics.title')}</h3>
                <p className="text-stone-600 font-light text-sm leading-relaxed">{t('home.whyUs.logistics.desc')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-stone-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/mirror-cta/1920/600" alt="Background" className="w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-stone-900/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif text-white sm:text-5xl mb-6"
          >
            {t('home.cta.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-300 font-light mb-10"
          >
            {t('home.cta.desc')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/products" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-stone-900 bg-amber-400 hover:bg-amber-500 transition-colors">
              {t('home.cta.viewCatalog')}
            </Link>
            <a href="mailto:contact@bolen.com" className="inline-flex justify-center items-center px-8 py-4 border border-stone-300 text-base font-medium rounded-full text-white hover:bg-white/10 transition-colors">
              {t('home.cta.contactSales')}
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

