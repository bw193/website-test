import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../supabase';
import SEO from '../components/SEO';

interface RFQForm {
  customerName: string;
  customerEmail: string;
  productInterest: string;
  message: string;
}

export default function RFQ() {
  const { t } = useTranslation();
  const [rfqStatus, setRfqStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RFQForm>();

  const onSubmitRFQ = async (data: RFQForm) => {
    setRfqStatus('submitting');
    try {
      const { error } = await supabase
        .from('rfqs')
        .insert([
          {
            product_id: null,
            product_name: data.productInterest || 'General Inquiry',
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            message: data.message,
            status: 'new'
          }
        ]);

      if (error) throw error;
      
      setRfqStatus('success');
      reset();
    } catch (error) {
      console.error("Error submitting RFQ", error);
      setRfqStatus('error');
    }
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Request for Quote (RFQ) | BOLEN Mirror",
    "description": "Contact Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders.",
    "url": "https://bolenmirror.com/rfq",
    "mainEntity": {
      "@type": "Organization",
      "name": "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+86-18058603602",
        "email": "bolen2@cnjxctm.com",
        "contactType": "customer service",
        "areaServed": "Worldwide",
        "availableLanguage": ["en", "zh"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town",
        "addressLocality": "Jiaxing",
        "addressRegion": "Zhejiang",
        "addressCountry": "CN"
      }
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen pt-24 pb-16">
      <SEO 
        title="Request for Quote (RFQ) | BOLEN Mirror" 
        description="Contact Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders."
        canonicalUrl="https://bolenmirror.com/rfq"
        schema={contactSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4"
          >
            {t('productDetail.requestQuote')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-600 font-light"
          >
            Interested in wholesale pricing, custom orders, or OEM/ODM services? Send us an inquiry and our sales team will respond within 24 hours.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm h-full">
              <h3 className="text-xl font-bold text-stone-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Email Us</p>
                    <a href="mailto:bolen2@cnjxctm.com" className="text-stone-600 hover:text-amber-600 transition-colors">bolen2@cnjxctm.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Call Us</p>
                    <a href="tel:+8618058603602" className="text-stone-600 hover:text-amber-600 transition-colors">+86 18058603602</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Visit Us</p>
                    <p className="text-stone-600">Jiaxing, Zhejiang, China</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RFQ Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl shadow-stone-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -z-10 opacity-50"></div>
              
              {rfqStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-12 flex flex-col items-center text-center h-full justify-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">Inquiry Sent Successfully!</h3>
                  <p className="text-green-700 text-lg">{t('productDetail.rfqSuccess')}</p>
                  <button onClick={() => setRfqStatus('idle')} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors">Send another inquiry</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmitRFQ)} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <label htmlFor="productInterest" className="block text-sm font-medium text-stone-700 mb-1">Product of Interest (Optional)</label>
                    <input
                      type="text"
                      id="productInterest"
                      placeholder="e.g. LED Bathroom Mirrors, Custom Vanity Mirrors"
                      {...register('productInterest')}
                      className="block w-full rounded-xl border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-3 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.inquiryDetails')}</label>
                    <textarea
                      id="message"
                      rows={6}
                      placeholder="Please provide details about your inquiry, including estimated quantities, specific requirements, or questions..."
                      {...register('message', { required: 'Message is required' })}
                      className="block w-full rounded-xl border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-3 transition-colors resize-none"
                    ></textarea>
                    {errors.message && <p className="mt-1 text-sm text-red-600 font-medium">{errors.message.message}</p>}
                  </div>

                  {rfqStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 font-medium">{t('productDetail.rfqError')}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={rfqStatus === 'submitting'}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-stone-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {rfqStatus === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      t('productDetail.submitRfq')
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
