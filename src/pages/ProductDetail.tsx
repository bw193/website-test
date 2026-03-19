import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  title: string;
  description: string;
  details?: string;
  images: string[];
  category?: string;
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
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
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
      await addDoc(collection(db, 'rfqs'), {
        productId: product.id,
        productName: product.title,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        message: data.message,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setRfqStatus('success');
      reset();
    } catch (error) {
      console.error("Error submitting RFQ", error);
      setRfqStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
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

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-amber-600 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('productDetail.backToCatalog')}
          </Link>
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Image Gallery */}
          <div className="flex flex-col">
            <div className="relative aspect-w-1 aspect-h-1 w-full rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200">
              <img
                src={product.images[currentImageIndex] || 'https://picsum.photos/seed/mirror/800/800'}
                alt={product.title}
                className="w-full h-full object-center object-cover"
                referrerPolicy="no-referrer"
              />
              {product.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white text-stone-800">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white text-stone-800">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 ${currentImageIndex === idx ? 'border-amber-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & RFQ */}
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            {product.category && <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide">{product.category}</p>}
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">{product.title}</h1>
            
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <p className="text-base text-stone-700">{product.description}</p>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-8 border-t border-stone-200 pt-8">
                <h3 className="text-lg font-medium text-stone-900">{t('productDetail.specifications')}</h3>
                <div className="mt-4 prose prose-sm text-stone-500">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <li key={key} className="flex"><span className="font-medium text-stone-900 mr-2">{key}:</span> {value}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {product.details && (
              <div className="mt-8 border-t border-stone-200 pt-8">
                <h3 className="text-lg font-medium text-stone-900 mb-4">{t('productDetail.productDetails')}</h3>
                <div className="prose prose-amber text-stone-600 whitespace-pre-wrap">
                  {product.details}
                </div>
              </div>
            )}

            {/* RFQ Form */}
            <div className="mt-12 bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">{t('productDetail.requestQuote')}</h2>
              <p className="text-stone-500 mb-6 text-sm">Interested in wholesale pricing or custom orders? Send us an inquiry and our sales team will respond within 24 hours.</p>
              
              {rfqStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-green-900">Inquiry Sent Successfully!</h3>
                  <p className="text-green-700 mt-2">{t('productDetail.rfqSuccess')}</p>
                  <button onClick={() => setRfqStatus('idle')} className="mt-6 text-sm font-medium text-green-700 hover:text-green-800 underline">Send another inquiry</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmitRFQ)} className="space-y-4">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-stone-700">{t('productDetail.companyName')}</label>
                    <input
                      type="text"
                      id="customerName"
                      {...register('customerName', { required: 'Name is required' })}
                      className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2.5 border"
                    />
                    {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-stone-700">{t('productDetail.email')}</label>
                    <input
                      type="email"
                      id="customerEmail"
                      {...register('customerEmail', { 
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                      })}
                      className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2.5 border"
                    />
                    {errors.customerEmail && <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700">{t('productDetail.inquiryDetails')}</label>
                    <textarea
                      id="message"
                      rows={4}
                      {...register('message', { required: 'Message is required' })}
                      className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2.5 border"
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                  </div>
                  {rfqStatus === 'error' && (
                    <p className="text-sm text-red-600">{t('productDetail.rfqError')}</p>
                  )}
                  <button
                    type="submit"
                    disabled={rfqStatus === 'submitting'}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    {rfqStatus === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : t('productDetail.submitRfq')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
