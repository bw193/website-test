import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCurrentLang } from '../hooks/useLocalizedPath';

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
  title = 'LED Mirror Manufacturer & OEM Smart Mirror Factory | BOLEN',
  description = 'BOLEN — OEM LED mirror manufacturer. Smart, vanity & bath mirrors for global brands. Request a wholesale quote today.',
  path = '/',
  ogImage = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg',
  ogType = 'website',
  schema,
  noindex = false
}: SEOProps) {
  const currentLang = useCurrentLang();
  const canonicalUrl = `${SITE_URL}/${currentLang}${path === '/' ? '' : path}`;

  // react-helmet-async processes <Helmet> children via React.Children iteration but
  // does NOT recurse into nested arrays/expressions reliably. To make every tag
  // actually reach the DOM we must render each child as a direct, flat sibling —
  // hence the explicit unrolled list below.
  const schemaArray = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* hreflang alternates — flat siblings so Helmet picks them up */}
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en${path === '/' ? '' : path}`} />
      <link rel="alternate" hrefLang="zh" href={`${SITE_URL}/zh${path === '/' ? '' : path}`} />
      <link rel="alternate" hrefLang="es" href={`${SITE_URL}/es${path === '/' ? '' : path}`} />
      <link rel="alternate" hrefLang="fr" href={`${SITE_URL}/fr${path === '/' ? '' : path}`} />
      <link rel="alternate" hrefLang="de" href={`${SITE_URL}/de${path === '/' ? '' : path}`} />
      <link rel="alternate" hrefLang="it" href={`${SITE_URL}/it${path === '/' ? '' : path}`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en${path === '/' ? '' : path}`} />

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

      {/* JSON-LD — up to 5 schemas as flat siblings (sufficient for current pages) */}
      {schemaArray[0] && (
        <script type="application/ld+json">{JSON.stringify(schemaArray[0])}</script>
      )}
      {schemaArray[1] && (
        <script type="application/ld+json">{JSON.stringify(schemaArray[1])}</script>
      )}
      {schemaArray[2] && (
        <script type="application/ld+json">{JSON.stringify(schemaArray[2])}</script>
      )}
      {schemaArray[3] && (
        <script type="application/ld+json">{JSON.stringify(schemaArray[3])}</script>
      )}
      {schemaArray[4] && (
        <script type="application/ld+json">{JSON.stringify(schemaArray[4])}</script>
      )}
    </Helmet>
  );
}
