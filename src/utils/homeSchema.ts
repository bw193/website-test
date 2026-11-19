// Home page JSON-LD, shared by src/pages/Home.tsx and scripts/prerender-static.ts
// so the tags baked into the static HTML and the ones react-helmet-async writes
// on mount are byte-identical (Helmet then adopts them instead of replacing
// them). Keep this module browser-safe and keep property insertion order stable.

import type { VideoListItem } from '../types/video';
import { SITE_ORIGIN, toMediaUrl } from './media';

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

interface HomeLocalizedSchemaCopy {
  orgDescription: string;
  knowsAbout: string[];
  galleryName: string;
  galleryDescription: string;
}

const HOME_SCHEMA_COPY: Record<string, HomeLocalizedSchemaCopy> = {
  en: {
    orgDescription:
      'LED mirror and bathroom mirror manufacturer and supplier with its own 46,800 m² factory. Since 2005 BOLEN has made OEM/ODM, custom and wholesale LED bathroom mirrors, vanity mirrors, lighted mirrors and mirror cabinets for brands, distributors, hotels and commercial projects.',
    knowsAbout: [
      'LED mirrors',
      'LED bathroom mirrors',
      'Bathroom mirrors',
      'Vanity mirrors',
      'LED vanity mirrors',
      'Lighted and illuminated mirrors',
      'Mirror cabinets',
      'LED mirror cabinets',
      'Hotel bathroom mirrors',
      'Commercial bathroom mirrors',
      'Custom mirrors',
      'OEM/ODM mirror manufacturing',
      'Wholesale mirror supply',
    ],
    galleryName: 'Inside the BOLEN Mirror Factory',
    galleryDescription:
      'Photos of the BOLEN LED mirror and bathroom mirror factory: production lines, sample room and offices.',
  },
  zh: {
    orgDescription:
      '拥有 46,800 平方米自有工厂的 LED 镜与浴室镜制造商及供应商。自 2005 年以来，BOLEN 专注于为全球品牌商、经销商、酒店及商业项目提供 OEM/ODM、定制与批发 LED 浴室镜、化妆镜、带灯镜及镜柜。',
    knowsAbout: [
      'LED 镜',
      'LED 浴室镜',
      '浴室镜',
      '化妆镜',
      'LED 化妆镜',
      '发光镜与带灯镜',
      '浴室镜柜',
      'LED 镜柜',
      '酒店工程浴室镜',
      '商业项目浴室镜',
      '定制镜子',
      'OEM/ODM 镜子制造',
      '镜子批发供应',
    ],
    galleryName: '走进 BOLEN 镜业自有工厂',
    galleryDescription: 'BOLEN LED 镜与浴室镜生产基地实拍：自动化产线、样品展厅与研发办公楼。',
  },
  es: {
    orgDescription:
      'Fabricante y proveedor de espejos LED y espejos de baño con fábrica propia de 46.800 m². Desde 2005, BOLEN produce espejos de baño LED, espejos de tocador, espejos iluminados y armarios con espejo OEM/ODM, a medida y al por mayor para marcas, distribuidores, hoteles y proyectos comerciales.',
    knowsAbout: [
      'Espejos LED',
      'Espejos de baño LED',
      'Espejos de baño',
      'Espejos de tocador',
      'Espejos de tocador LED',
      'Espejos iluminados',
      'Armarios con espejo',
      'Armarios de baño con espejo LED',
      'Espejos de baño para hoteles',
      'Espejos de baño comerciales',
      'Espejos a medida',
      'Fabricación de espejos OEM/ODM',
      'Suministro mayorista de espejos',
    ],
    galleryName: 'Dentro de la fábrica de espejos BOLEN',
    galleryDescription:
      'Fotografías de la fábrica de espejos LED y de baño BOLEN: líneas de producción, sala de muestras y oficinas.',
  },
  fr: {
    orgDescription:
      'Fabricant et fournisseur de miroirs LED et de miroirs de salle de bain disposant de sa propre usine de 46 800 m². Depuis 2005, BOLEN fabrique en OEM/ODM, sur mesure et en gros des miroirs de salle de bain LED, miroirs de courtoisie, miroirs lumineux et armoires de toilette pour marques, distributeurs, hôtels et projets commerciaux.',
    knowsAbout: [
      'Miroirs LED',
      'Miroirs de salle de bain LED',
      'Miroirs de salle de bain',
      'Miroirs de courtoisie',
      'Miroirs lumineux',
      'Armoires de toilette à miroir',
      'Armoires à miroir LED',
      "Miroirs d'hôtel",
      'Miroirs pour projets commerciaux',
      'Miroirs sur mesure',
      'Fabrication OEM/ODM de miroirs',
      'Fourniture de miroirs en gros',
    ],
    galleryName: "À l'intérieur de l'usine de miroirs BOLEN",
    galleryDescription:
      "Photos de l'usine de miroirs LED et de salle de bain BOLEN : lignes de production, salle d'échantillons et bureaux.",
  },
  de: {
    orgDescription:
      'Hersteller und Lieferant von LED-Spiegeln und Badspiegeln mit eigenem 46.800 m² Werk. Seit 2005 fertigt BOLEN im OEM/ODM-Verfahren maßgefertigte sowie Großhandels-LED-Badspiegel, Schminkspiegel, Lichtspiegel und Spiegelschränke für Marken, Händler, Hotels und Objektprojekte.',
    knowsAbout: [
      'LED-Spiegel',
      'LED-Badspiegel',
      'Badspiegel',
      'Schminkspiegel',
      'LED-Lichtspiegel',
      'Spiegelschränke',
      'LED-Spiegelschränke',
      'Hotel-Badspiegel',
      'Objekt-Badspiegel',
      'Spiegel nach Maß',
      'OEM/ODM-Spiegelfertigung',
      'Spiegel-Großhandel',
    ],
    galleryName: 'Einblick in das BOLEN Spiegelwerk',
    galleryDescription:
      'Fotos aus dem BOLEN Werk für LED- und Badspiegel: Fertigungslinien, Musterraum und Bürogebäude.',
  },
  it: {
    orgDescription:
      'Produttore e fornitore di specchi LED e specchi da bagno con stabilimento proprio di 46.800 m². Dal 2005 BOLEN realizza in OEM/ODM, su misura e all’ingrosso specchi da bagno LED, specchi da toeletta, specchi illuminati e pensili a specchio per marchi, distributori, hotel e progetti commerciali.',
    knowsAbout: [
      'Specchi LED',
      'Specchi da bagno LED',
      'Specchi da bagno',
      'Specchi da toeletta',
      'Specchi illuminati',
      'Pensili a specchio',
      'Armadietti a specchio LED',
      'Specchi da bagno per hotel',
      'Specchi da bagno per progetti contract',
      'Specchi su misura',
      'Produzione specchi OEM/ODM',
      'Fornitura specchi all’ingrosso',
    ],
    galleryName: 'All’interno dello stabilimento specchi BOLEN',
    galleryDescription:
      'Foto della fabbrica di specchi LED e da bagno BOLEN: linee di produzione, sala campioni e uffici.',
  },
};

function getHomeSchemaCopy(lang: string): HomeLocalizedSchemaCopy {
  return HOME_SCHEMA_COPY[lang] || HOME_SCHEMA_COPY.en;
}

export function buildHomeSchema(
  lang: string,
  {
    factoryGallery = [],
  }: { factoryGallery?: readonly HomeGalleryImage[]; featuredVideo?: VideoListItem | null } = {}
): Record<string, unknown>[] {
  const copy = getHomeSchemaCopy(lang);
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
      description: copy.orgDescription,
      foundingDate: '2005',
      numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 200 },
      knowsAbout: copy.knowsAbout,
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
      name: copy.galleryName,
      description: copy.galleryDescription,
      inLanguage: lang,
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

  // Intentionally do NOT emit a standalone VideoObject on the homepage: the
  // homepage ambient backdrop is not a dedicated watch page, and emitting a
  // VideoObject pointing to /videos/<slug>/ caused a watch-page mismatch.
  return schema;
}
