import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schema?: any;
}

export default function SEO({ 
  title = 'Jiaxing Chengtai Mirror (BOLEN) | OEM LED Mirror & Smart Mirrors',
  description = 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) is a leading mirror manufacture specializing in OEM LED mirrors, smart mirrors, vanity mirrors, bath mirrors, and touch mirrors.',
  canonicalUrl = 'https://bolenmirror.com/',
  ogImage = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg',
  schema
}: SEOProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const languages = ['en', 'zh', 'es', 'fr', 'de', 'it'];

  // Ensure canonical URL doesn't have query params for the base href
  const baseUrl = canonicalUrl.split('?')[0];

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {languages.map((lang) => (
        <link 
          key={lang}
          rel="alternate" 
          hrefLang={lang} 
          href={`${baseUrl}?lng=${lang}`} 
        />
      ))}
      <link 
        rel="alternate" 
        hrefLang="x-default" 
        href={baseUrl} 
      />
      
      {/* Open Graph / Facebook */}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
