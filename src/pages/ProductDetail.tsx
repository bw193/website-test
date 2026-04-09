import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, ArrowLeft, Send, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import SEO from '../components/SEO';

interface Product {
  id: string;
  title: string;
  description: string;
  details?: string;
  images: string[];
  category?: string;
  price_range?: string;
  msrp?: string;
  specifications?: Record<string, string>;
}

interface RFQForm {
  customerName: string;
  customerEmail: string;
  message: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rfqStatus, setRfqStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { t } = useTranslation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RFQForm>();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      // Extract UUID from slug-id format (UUID is 36 chars)
      const actualId = id.length > 36 ? id.slice(-36) : id;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', actualId)
          .single();

        if (error) throw error;
        if (data) {
          setProduct(data as Product);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const onSubmitRFQ = async (data: RFQForm) => {
    if (!product) return;
    setRfqStatus('submitting');
    try {
      const { error } = await supabase
        .from('rfqs')
        .insert({
          product_id: product.id,
          product_name: product.title,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          message: data.message,
          created_at: new Date().toISOString(),
          status: 'new'
        });
      
      if (error) throw error;
      
      setRfqStatus('success');
      reset();
    } catch (error) {
      console.error("Error submitting RFQ", error);
      setRfqStatus('error');
    }
  };

  const formatPrice = (val?: string) => {
    if (!val) return '';
    return val.startsWith('$') ? val : `$${val}`;
  };

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 animate-pulse">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-stone-100">
                <div className="aspect-square bg-stone-200 rounded-2xl mb-6"></div>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-24 h-24 bg-stone-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
                <div className="w-24 h-6 bg-stone-200 rounded-md mb-4"></div>
                <div className="w-3/4 h-10 bg-stone-200 rounded-md mb-6"></div>
                <div className="w-full h-24 bg-stone-200 rounded-md mb-8"></div>
                <div className="w-1/3 h-8 bg-stone-200 rounded-md mb-12"></div>
                <div className="w-full h-48 bg-stone-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-stone-500 text-xl">
        Product not found.
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const slug = product ? product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
  const productUrl = product ? `https://bolenmirror.com/products/${slug}-${product.id}` : '';

  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.images,
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "AggregateOffer",
      "url": productUrl,
      "priceCurrency": "USD",
      "lowPrice": product.price_range ? parseFloat(product.price_range.replace(/[^0-9.]/g, '').split('-')[0]) || 0 : 0,
      "highPrice": product.price_range && product.price_range.includes('-') ? parseFloat(product.price_range.replace(/[^0-9.-]/g, '').split('-')[1]) || 0 : (product.price_range ? parseFloat(product.price_range.replace(/[^0-9.]/g, '')) || 0 : 0),
      "offerCount": 1
    }
  } : undefined;

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <SEO 
        title={`${product.title} | BOLEN Mirror`}
        description={product.description || `View details for ${product.title}, a premium mirror from Jiaxing Chengtai Mirror Co., Ltd.`}
        canonicalUrl={productUrl}
        ogImage={product.images?.[0]}
        schema={productSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center text-sm font-medium text-stone-500"
        >
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <ChevronRight className="mx-2 h-4 w-4 text-stone-300" />
          <Link to="/products" className="hover:text-amber-600 transition-colors">{t('productDetail.backToCatalog')}</Link>
          <ChevronRight className="mx-2 h-4 w-4 text-stone-300" />
          <span className="text-stone-900 truncate max-w-[200px] sm:max-w-none">{product.title}</span>
        </motion.div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Left Column: Image Gallery (Sticky) */}
          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-w-4 aspect-h-5 sm:aspect-w-1 sm:aspect-h-1 w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-200 group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[currentImageIndex] || 'https://picsum.photos/seed/mirror/800/800'}
                  alt={product.title}
                  className="w-full h-full object-center object-cover"
                  width="800"
                  height="800"
                  referrerPolicy="no-referrer"
                  fetchPriority="high"
                  decoding="async"
                />
              </AnimatePresence>
              
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white text-stone-800 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white text-stone-800 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </motion.div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 grid grid-cols-5 gap-3"
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-w-1 aspect-h-1 rounded-xl overflow-hidden transition-all duration-200 ${
                      currentImageIndex === idx 
                        ? 'ring-2 ring-amber-500 ring-offset-2 scale-95' 
                        : 'border border-stone-200 hover:border-amber-300 hover:shadow-md'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" width="160" height="160" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right Column: Product Info & RFQ */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-10 px-4 sm:px-0 lg:mt-0"
          >
            {product.category && (
              <motion.p variants={fadeInUp} className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">
                {product.category}
              </motion.p>
            )}
            <motion.h1 variants={fadeInUp} className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl leading-tight">
              {product.title}
            </motion.h1>
            
            {(product.price_range || product.msrp) && (
              <motion.div variants={fadeInUp} className="mt-6 flex items-baseline gap-4">
                {product.price_range && <div className="text-3xl font-bold text-stone-900">{formatPrice(product.price_range)}</div>}
                {product.msrp && <div className="text-lg text-stone-500 line-through decoration-stone-300">{t('products.msrp')}: {formatPrice(product.msrp)}</div>}
              </motion.div>
            )}

            <motion.div variants={fadeInUp} className="mt-8">
              <h3 className="sr-only">Description</h3>
              <p className="text-lg text-stone-600 leading-relaxed font-light">{product.description}</p>
            </motion.div>

            {/* Value Props */}
            <motion.div variants={fadeInUp} className="mt-8 grid grid-cols-2 gap-4 py-6 border-y border-stone-200">
              <div className="flex items-center gap-3 text-stone-700">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <Truck className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Global Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Fast Turnaround</span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">OEM/ODM Available</span>
              </div>
            </motion.div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <motion.div variants={fadeInUp} className="mt-10">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                  {t('productDetail.specifications')}
                </h3>
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                  <ul className="divide-y divide-stone-100">
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <li key={key} className={`flex px-6 py-4 ${idx % 2 === 0 ? 'bg-stone-50/50' : 'bg-white'}`}>
                        <span className="w-1/3 font-medium text-stone-900">{key}</span>
                        <span className="w-2/3 text-stone-600">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {product.details && (
              <motion.div variants={fadeInUp} className="mt-10">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                  {t('productDetail.productDetails')}
                </h3>
                <div className="prose prose-amber prose-stone max-w-none text-stone-600 leading-relaxed bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <ReactMarkdown>{product.details}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* RFQ Form */}
            <motion.div variants={fadeInUp} className="mt-12 bg-white rounded-3xl p-8 border border-stone-200 shadow-xl shadow-stone-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -z-10 opacity-50"></div>
              <h2 className="text-2xl font-bold text-stone-900 mb-3">{t('productDetail.requestQuote')}</h2>
              <p className="text-stone-500 mb-8 text-sm leading-relaxed max-w-md">Interested in wholesale pricing or custom orders? Send us an inquiry and our sales team will respond within 24 hours.</p>
              
              {rfqStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Inquiry Sent Successfully!</h3>
                  <p className="text-green-700">{t('productDetail.rfqSuccess')}</p>
                  <button onClick={() => setRfqStatus('idle')} className="mt-6 text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-4">Send another inquiry</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmitRFQ)} className="space-y-5 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.companyName')}</label>
                      <input
                        type="text"
                        id="customerName"
                        placeholder="Your Company Ltd."
                        {...register('customerName', { required: 'Name is required' })}
                        className="block w-full rounded-xl border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-3 transition-colors"
                      />
                      {errors.customerName && <p className="mt-1 text-sm text-red-600 font-medium">{errors.customerName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.email')}</label>
                      <input
                        type="email"
                        id="customerEmail"
                        placeholder="sales@company.com"
                        {...register('customerEmail', { 
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                        })}
                        className="block w-full rounded-xl border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-3 transition-colors"
                      />
                      {errors.customerEmail && <p className="mt-1 text-sm text-red-600 font-medium">{errors.customerEmail.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.inquiryDetails')}</label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder={`I'm interested in ordering ${product.title}. Please provide pricing for 100 units...`}
                      {...register('message', { required: 'Message is required' })}
                      className="block w-full rounded-xl border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-3 transition-colors resize-none"
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600 font-medium">{errors.message.message}</p>}
                  </div>
                  {rfqStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                      {t('productDetail.rfqError')}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={rfqStatus === 'submitting'}
                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {rfqStatus === 'submitting' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {t('productDetail.submitRfq')}
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
