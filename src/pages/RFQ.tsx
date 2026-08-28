import { m } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import { useCurrentLang } from '../hooks/useLocalizedPath';
import { trackEvent } from '../utils/analytics';

interface RFQForm {
  customerName: string;
  customerEmail: string;
  productInterest: string;
  message: string;
}

const cleanQueryParam = (value: string | null, maxLength = 200) =>
  (value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);

export default function RFQ() {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const [searchParams] = useSearchParams();
  const productFromQuery = cleanQueryParam(searchParams.get('product'));
  const modelFromQuery = cleanQueryParam(searchParams.get('model'), 60);
  const productReference = productFromQuery
    ? `${productFromQuery}${modelFromQuery ? ` (${modelFromQuery})` : ''}`
    : modelFromQuery;
  const initialMessage = productReference
    ? t('rfq.prefillMessage', {
        reference: productReference,
        defaultValue:
          "I'm interested in {{reference}}. Please quote for the estimated quantity and include MOQ, unit-price basis, sample and production lead times, customization, and compliance options.",
      })
    : '';
  const emailSubject = productReference
    ? t('rfq.emailSubjectProduct', {
        reference: productReference,
        defaultValue: 'RFQ: {{reference}}',
      })
    : t('rfq.emailSubject', 'BOLEN mirror RFQ');
  const backupEmailHref = `mailto:bolen2@cnjxctm.com?subject=${encodeURIComponent(emailSubject)}${
    initialMessage ? `&body=${encodeURIComponent(initialMessage)}` : ''
  }`;
  const [rfqStatus, setRfqStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  // On success the whole <form> is swapped out, which would otherwise leave
  // focus on a submit button that no longer exists — screen reader and keyboard
  // users get no indication the submission worked.
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (rfqStatus === 'success') successHeadingRef.current?.focus();
  }, [rfqStatus]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RFQForm>({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      productInterest: productReference,
      message: initialMessage,
    },
  });

  // React Router can keep this page mounted when a buyer opens a different
  // product-specific RFQ URL. Refresh the form defaults so the newly selected
  // product/model is never replaced by stale inquiry context.
  useEffect(() => {
    reset({
      customerName: '',
      customerEmail: '',
      productInterest: productReference,
      message: initialMessage,
    });
  }, [initialMessage, productReference, reset]);

  const onSubmitRFQ = async (data: RFQForm) => {
    setRfqStatus('submitting');
    try {
      const { supabase } = await import('../supabase');
      const { error } = await supabase
        .from('rfqs')
        .insert([
          {
            product_id: null,
            product_name: data.productInterest || 'General Inquiry',
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            message: data.message
          }
        ]);

      if (error) throw error;

      trackEvent('generate_lead', {
        form_location: 'rfq_page',
        lead_source: productReference ? 'catalog' : 'standalone_rfq',
        has_product_reference: Boolean(productReference),
      });
      setRfqStatus('success');
      reset();
    } catch (error) {
      console.error("Error submitting RFQ", error);
      trackEvent('rfq_submit_error', {
        form_location: 'rfq_page',
        has_product_reference: Boolean(productReference),
      });
      setRfqStatus('error');
    }
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Sales | BOLEN Mirror",
    "description": "Contact Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders.",
    "url": `https://bolenmirror.com/${lang}/rfq/`,
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
    <div className="bg-stone-50 min-h-screen pt-10 sm:pt-14 lg:pt-16 pb-12">
      <SEO 
        title={t('seo.rfqTitle')}
        description={t('seo.rfqDesc')}
        path="/rfq"
        schema={contactSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-12">
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-serif text-stone-900 sm:text-5xl mb-4"
          >
            {t('productDetail.requestQuote')}
          </m.h1>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-600 font-light"
          >
            {t(
              'rfq.intro',
              'Interested in wholesale pricing, custom orders, or OEM/ODM services? Send us an inquiry and our sales team will respond within 24 hours.'
            )}
          </m.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <m.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 lg:order-1 lg:col-span-1"
          >
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm h-full">
              <h3 className="text-xl font-bold text-stone-900 mb-6">
                {t('rfq.contactInformation', 'Contact information')}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{t('rfq.emailUs', 'Email us')}</p>
                    <a href="mailto:bolen2@cnjxctm.com" className="text-stone-600 hover:text-amber-600 transition-colors">bolen2@cnjxctm.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{t('rfq.callUs', 'Call us')}</p>
                    <a href="tel:+8618058603602" className="text-stone-600 hover:text-amber-600 transition-colors">+86 18058603602</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{t('rfq.visitUs', 'Visit us')}</p>
                    <p className="text-stone-600">Jiaxing, Zhejiang, China</p>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          {/* RFQ Form */}
          <m.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-1 lg:order-2 lg:col-span-2"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl shadow-stone-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -z-10 opacity-50"></div>

              {rfqStatus !== 'success' && (
                <div className="relative z-10 mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5">
                  <h2 className="font-semibold text-stone-900 mb-3">
                    {t('rfq.quoteIncludesTitle', 'Your quote will include')}
                  </h2>
                  <ul className="grid gap-2 text-sm text-stone-700 sm:grid-cols-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                      <span>{t('rfq.quoteIncludesMoq', 'MOQ and unit-price basis')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                      <span>{t('rfq.quoteIncludesLeadTime', 'Sample and production lead times')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                      <span>{t('rfq.quoteIncludesOptions', 'Customization and target-market compliance options')}</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {rfqStatus === 'success' ? (
                <m.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-12 flex flex-col items-center text-center h-full justify-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 ref={successHeadingRef} tabIndex={-1} className="text-2xl font-bold text-green-900 mb-2 focus:outline-none">
                    {t('rfq.successTitle', 'Inquiry sent successfully!')}
                  </h3>
                  <p className="text-green-700 text-lg">{t('productDetail.rfqSuccess')}</p>
                  <button type="button" onClick={() => setRfqStatus('idle')} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors">
                    {t('rfq.sendAnother', 'Send another inquiry')}
                  </button>
                </m.div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmitRFQ)}
                  data-rfq-form="rfq_page"
                  aria-busy={rfqStatus === 'submitting'}
                  className="space-y-5 relative z-10"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.companyName')}</label>
                      <input
                        type="text"
                        id="customerName"
                        placeholder="Your Company Ltd."
                        autoComplete="organization"
                        {...register('customerName', {
                          required: t('rfq.errors.nameRequired', 'Name is required'),
                        })}
                        aria-invalid={errors.customerName ? true : undefined}
                        aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                        className="block w-full rounded-xl border border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none sm:text-sm p-3 transition-colors"
                      />
                      {errors.customerName && <p id="customerName-error" role="alert" className="mt-1 text-sm text-red-600 font-medium">{errors.customerName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.email')}</label>
                      <input
                        type="email"
                        id="customerEmail"
                        placeholder="sales@company.com"
                        autoComplete="email"
                        {...register('customerEmail', { 
                          required: t('rfq.errors.emailRequired', 'Email is required'),
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                            message: t('rfq.errors.invalidEmail', 'Invalid email address'),
                          }
                        })}
                        aria-invalid={errors.customerEmail ? true : undefined}
                        aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
                        className="block w-full rounded-xl border border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none sm:text-sm p-3 transition-colors"
                      />
                      {errors.customerEmail && <p id="customerEmail-error" role="alert" className="mt-1 text-sm text-red-600 font-medium">{errors.customerEmail.message}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="productInterest" className="block text-sm font-medium text-stone-700 mb-1">
                      {t('rfq.productInterest', 'Product of interest (optional)')}
                    </label>
                    <input
                      type="text"
                      id="productInterest"
                      placeholder={t('rfq.productPlaceholder', 'e.g. LED bathroom mirrors or custom vanity mirrors')}
                      {...register('productInterest')}
                      className="block w-full rounded-xl border border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none sm:text-sm p-3 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">{t('productDetail.inquiryDetails')}</label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder={t(
                        'rfq.messagePlaceholder',
                        'Please include estimated quantity, dimensions, features, target market, and any customization needs.'
                      )}
                      {...register('message', {
                        required: t('rfq.errors.messageRequired', 'Message is required'),
                      })}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className="block w-full rounded-xl border border-stone-200 bg-stone-50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none sm:text-sm p-3 transition-colors resize-none"
                    ></textarea>
                    {errors.message && <p id="message-error" role="alert" className="mt-1 text-sm text-red-600 font-medium">{errors.message.message}</p>}
                  </div>

                  {rfqStatus === 'error' && (
                    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                      <p className="text-red-700 font-semibold">
                        {t('rfq.backupTitle', "Can't send the form?")}
                      </p>
                      <p className="mt-1 text-red-700">
                        {t('rfq.backupText', 'Email or call us directly and we will help with your request.')}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                        <a href={backupEmailHref} className="font-semibold text-red-800 underline underline-offset-2 hover:text-red-950">
                          {t('rfq.emailDirectly', 'Email us')}
                        </a>
                        <a href="tel:+8618058603602" className="font-semibold text-red-800 underline underline-offset-2 hover:text-red-950">
                          {t('rfq.callDirectly', 'Call us')}
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={rfqStatus === 'submitting'}
                    className="btn-primary w-full py-4 text-base"
                  >
                    {rfqStatus === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('productDetail.submitting')}
                      </span>
                    ) : (
                      t('productDetail.submitRfq')
                    )}
                  </button>
                </form>
              )}
            </div>
          </m.div>
        </div>
      </div>
    </div>
  );
}
