import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCurrentLang, SUPPORTED_LANGUAGES } from '../hooks/useLocalizedPath';

interface SEOProps {
  title?: string;
  description?: string;
  /** Path without language prefix, e.g. "/products" or "/" */
  path?: string;
  ogImage?: string;
  ogType?: string;
  schema?: any | any[];
  noindex?: boolean;
}

const SITE_URL = 'https://bolenmirror.com';

export default function SEO({
  title = 'BOLEN Mirror | LED Mirror Manufacturer & OEM Smart Mirror Factory',
  description = 'BOLEN (Jiaxing Chengtai Mirror Co., Ltd.) is a leading LED mirror manufacturer specializing in OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors for global brands.',
  path = '/',
  ogImage = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg',
  ogType = 'website',
  schema,
  noindex = false
}: SEOProps) {
  const currentLang = useCurrentLang();
  const canonicalUrl = `${SITE_URL}/${currentLang}${path === '/' ? '' : path}`;

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${SITE_URL}/${lang}${path === '/' ? '' : path}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_URL}/en${path === '/' ? '' : path}`}
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="BOLEN Mirror" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schema && (Array.isArray(schema) ? schema : [schema]).map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
