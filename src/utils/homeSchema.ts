// Home page JSON-LD, shared by src/pages/Home.tsx and scripts/prerender-static.ts
// so the tags baked into the static HTML and the ones react-helmet-async writes
// on mount are byte-identical (Helmet then adopts them instead of replacing
// them). Keep this module browser-safe and keep property insertion order stable.

import type { VideoListItem } from '../types/video';
import { SITE_ORIGIN, toMediaUrl } from './media';
import { buildVideoObjectSchema } from './videoSchema';

export interface HomeGalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const LOGO_URL = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png';
const SITE_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];

// Brand as used across the site (WebSite name, og:site_name, title suffixes);
// the registered company name goes in legalName.
const BRAND_NAME = 'BOLEN Mirror';
const LEGAL_NAME = 'Jiaxing Chengtai Mirror Co., Ltd.';

export function buildHomeSchema(
  lang: string,
  { factoryGallery = [], featuredVideo }: { factoryGallery?: readonly HomeGalleryImage[]; featuredVideo?: VideoListItem | null } = {}
): Record<string, unknown>[] {
  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: BRAND_NAME,
      legalName: LEGAL_NAME,
      // The name other pages use for the publisher, plus the Chinese company name.
      alternateName: ['BOLEN', 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)', '嘉兴诚泰镜业有限公司'],
      url: `${SITE_ORIGIN}/`,
      logo: { '@type': 'ImageObject', url: toMediaUrl(LOGO_URL), width: 320, height: 320 },
      description:
        'LED mirror and bathroom mirror manufacturer in Jiaxing, China, supplying OEM/ODM, custom and wholesale LED bathroom mirrors, LED vanity mirrors, lighted mirrors and mirror cabinets to brands, distributors and hotel projects since 2005.',
      foundingDate: '2005',
      numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 200 },
      knowsAbout: [
        'LED mirrors',
        'LED bathroom mirrors',
        'LED vanity mirrors',
        'Lighted and illuminated mirrors',
        'Bathroom mirrors',
        'Mirror cabinets',
        'OEM/ODM mirror manufacturing',
      ],
      areaServed: 'Worldwide',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+86-18058603602',
        email: 'sales@bolenmirror.com',
        contactType: 'sales',
        areaServed: 'Worldwide',
        availableLanguage: SITE_LANGUAGES,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town',
        addressLocality: 'Jiaxing',
        addressRegion: 'Zhejiang',
        addressCountry: 'CN',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: BRAND_NAME,
      alternateName: ['BOLEN', 'bolenmirror.com'],
      url: `${SITE_ORIGIN}/`,
      inLanguage: SITE_LANGUAGES,
      publisher: { '@id': ORGANIZATION_ID },
    },
  ];

  if (factoryGallery.length > 0) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: 'Inside the BOLEN Mirror Factory',
      description:
        'Photos of the BOLEN (Jiaxing Chengtai Mirror Co., Ltd.) LED mirror factory in Jiaxing, China: production lines, sample room and offices.',
      url: `${SITE_ORIGIN}/${lang}/#factory-showcase`,
      // creator / creditText / copyrightNotice make the photos eligible for
      // image-credit details in Google Images.
      image: factoryGallery.map((item) => ({
        '@type': 'ImageObject',
        contentUrl: toMediaUrl(item.url),
        url: toMediaUrl(item.url),
        description: item.alt,
        ...(item.caption ? { caption: item.caption } : {}),
        creator: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: BRAND_NAME },
        creditText: BRAND_NAME,
        copyrightNotice: `© ${LEGAL_NAME}`,
      })),
    });
  }

  if (featuredVideo) schema.push(buildVideoObjectSchema(featuredVideo, lang));
  return schema;
}
