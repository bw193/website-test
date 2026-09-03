import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useCurrentLang } from '../hooks/useLocalizedPath';

interface SEOProps {
  title?: string;
  description?: string;
  /** Path without language prefix, e.g. "/products" or "/" */
  path?: string;
  ogImage?: string;
  ogType?: string;
  /**
   * Open Graph video for watch pages — an MP4 URL (type video/mp4) or a
   * YouTube/Vimeo embed URL (type text/html) so LinkedIn / Facebook / WhatsApp
   * previews can offer inline playback.
   */
  ogVideo?: { url: string; type: string };
  schema?: any | any[];
  noindex?: boolean;
  /** Languages with a real equivalent route. Defaults to all supported locales. */
  alternateLanguages?: string[];
}

const SITE_URL = 'https://bolenmirror.com';

export default function SEO({
  title = 'BOLEN Mirror | LED Mirror Manufacturer & OEM Smart Mirror Factory',
  description = 'BOLEN Mirror is a leading LED mirror manufacturer specializing in OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors for global brands.',
  path = '/',
  ogImage = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg',
  ogType = 'website',
  ogVideo,
  schema,
  noindex = false,
  alternateLanguages = ['en', 'zh', 'es', 'fr', 'de', 'it']
}: SEOProps) {
  const currentLang = useCurrentLang();
  const { i18n } = useTranslation();
  const htmlLang = (i18n.language || currentLang).split('-')[0] || currentLang;
  // Cloudflare Pages serves directory-style URLs with a trailing slash
  // (dist/en/products/index.html -> /en/products/). Canonical, hreflang,
  // OG/Twitter URLs, and JSON-LD URLs all use trailing slash so they match
  // the final URL and Google doesn't pick a different canonical.
  const suffix = path === '/' ? '' : path;
  const canonicalUrl = `${SITE_URL}/${currentLang}${suffix}/`;

  // react-helmet-async iterates <Helmet> children with React.Children but does NOT
  // recurse into nested arrays/expressions, so every alternate link and JSON-LD
  // script must appear as a direct, flat sibling of <Helmet>.
  const schemaArray = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const hasAlternate = (lang: string) => alternateLanguages.includes(lang);

  return (
    <Helmet>
      <html lang={htmlLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {hasAlternate('en') && <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en${suffix}/`} />}
      {hasAlternate('zh') && <link rel="alternate" hrefLang="zh" href={`${SITE_URL}/zh${suffix}/`} />}
      {hasAlternate('es') && <link rel="alternate" hrefLang="es" href={`${SITE_URL}/es${suffix}/`} />}
      {hasAlternate('fr') && <link rel="alternate" hrefLang="fr" href={`${SITE_URL}/fr${suffix}/`} />}
      {hasAlternate('de') && <link rel="alternate" hrefLang="de" href={`${SITE_URL}/de${suffix}/`} />}
      {hasAlternate('it') && <link rel="alternate" hrefLang="it" href={`${SITE_URL}/it${suffix}/`} />}
      {hasAlternate('en') && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en${suffix}/`} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="BOLEN Mirror" />
      {ogVideo && <meta property="og:video" content={ogVideo.url} />}
      {ogVideo && <meta property="og:video:secure_url" content={ogVideo.url} />}
      {ogVideo && <meta property="og:video:type" content={ogVideo.type} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

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
