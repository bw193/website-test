/**
 * Browser-less prerender.
 *
 * Renders per-route static HTML files into dist/<lang>/<route>/index.html
 * with route-specific <head> (title, meta description, canonical, hreflang,
 * Open Graph, Twitter, JSON-LD) and a minimal body content block (H1, copy,
 * product links/images) so:
 *
 *   1. The raw HTML response contains route-level SEO + content for crawlers
 *      and audit tools that don't run JS or run JS slowly.
 *   2. Slow networks / failing lazy chunks have meaningful fallback content
 *      until the React app hydrates.
 *
 * Runs in pure Node (no Chromium / Playwright), so it works in the Cloudflare
 * Pages build environment, unlike scripts/prerender.ts.
 *
 * The body content is injected INSIDE <div id="root">. React mounts via
 * createRoot, which replaces the root's children on first render, so the
 * prerendered fallback is naturally cleared once the SPA takes over.
 */

import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { marked } from 'marked';
import {
  formatBlogDate,
  getBlogAvailableLanguages,
  hasBlogTranslation,
  localizePost,
  normalizeBlogCover,
  toListItem,
} from '../src/utils/blog';
import {
  formatVideoDuration,
  getVideoPlayback,
  localizeVideo,
  parseFeaturedVideoSlug,
  recommendProductsForVideo,
  toIsoDuration,
  toVideoListItem,
  videoMimeType,
} from '../src/utils/video';
import { optimizeImage } from '../src/utils/optimizeImage';
import { mediaSourceUrl, toMediaPath, toMediaUrl } from '../src/utils/media';
import { buildHomeSchema } from '../src/utils/homeSchema';
import { polishEnglishProductTitle } from '../src/utils/productCopy';
import { normalizeProductDetails } from '../src/utils/productDetails';
import { renderMarkdownToHtml } from '../src/components/Markdown';
import {
  buildProductBuyerSummary,
  normalizeSpecs,
  resolveProductSeo,
  type ProductSeoMetadata,
  type ResolvedProductSeo,
} from '../src/utils/productSeo';
import { en as enLocale } from '../src/locales/en';
import { zh as zhLocale } from '../src/locales/zh';
import { es as esLocale } from '../src/locales/es';
import { fr as frLocale } from '../src/locales/fr';
import { de as deLocale } from '../src/locales/de';
import { it as itLocale } from '../src/locales/it';
import {
  matchesSeoLandingProduct,
  scoreSeoLandingProduct,
  SEO_LANDING_BY_SLUG,
  SEO_LANDING_GROUPS,
  HOME_SOLUTION_SLUGS,
  recommendSolutionsForProduct,
  type SeoLandingPage,
} from '../src/data/seoLandingPages';
import {
  getLocalizedSeoLandingPages,
  getSeoLandingProductCardCopy,
  getSeoSolutionsUi,
  localizeSeoLandingPage,
} from '../src/data/seoLandingI18n';
import {
  buildCatalogCategorySchema,
  buildProductBreadcrumbSchema,
  canonicalCategoryName,
  CATALOG_CATEGORY_PREFIX,
  catalogCategoryPath,
  DEFAULT_PRODUCT_CATEGORIES,
  getCatalogCategoryEditorial,
  getCatalogCategoryPageCopy,
  getCatalogCategorySeoTitle,
  interpolateTemplate,
  parseCategoriesSetting,
  productMatchesCategory,
  toCategorySlug,
  uniqueCategorySlugs,
} from '../src/utils/catalogCategory';
import {
  buildBlogIndexSchema,
  buildBlogPostingSchema,
  buildBlogBreadcrumbSchema,
} from '../src/utils/blogSchema';
import {
  buildVideoBreadcrumbSchema,
  buildVideoIndexSchema,
  buildVideoObjectSchema,
} from '../src/utils/videoSchema';
import { buildStorySchema } from '../src/utils/storySchema';
import { INSIGHTS_PATH, insightDetailPath } from '../src/data/insights';
import {
  buildTermsSchema,
  getTermsCopy,
  TERMS_CONTACT_EMAIL,
  TERMS_PATH,
} from '../src/data/termsCopy';
import { productDetailPath, productAlternatePaths } from '../src/utils/productRoutes';
import type { BlogPost, BlogListItem, LocalizedBlogPost } from '../src/types/blog';
import type { LocalizedVideoPost, VideoListItem, VideoPost } from '../src/types/video';

// Single source of truth for the four static routes' <title>/<meta description>.
// The React pages read the same keys via t('seo.*'), so what gets baked into the
// static HTML and what react-helmet-async writes on mount are identical — these
// used to be maintained separately here and hardcoded in English in the pages,
// which silently overwrote the localized prerendered meta on 5 locales.
const LOCALE_SEO = {
  en: enLocale.translation.seo,
  zh: zhLocale.translation.seo,
  es: esLocale.translation.seo,
  fr: frLocale.translation.seo,
  de: deLocale.translation.seo,
  it: itLocale.translation.seo,
} as const;

const LOCALE_NAV = {
  en: enLocale.translation.navbar,
  zh: zhLocale.translation.navbar,
  es: esLocale.translation.navbar,
  fr: frLocale.translation.navbar,
  de: deLocale.translation.navbar,
  it: itLocale.translation.navbar,
} as const;

const LOCALE_PRODUCTS = {
  en: enLocale.translation.products,
  zh: zhLocale.translation.products,
  es: esLocale.translation.products,
  fr: frLocale.translation.products,
  de: deLocale.translation.products,
  it: itLocale.translation.products,
} as const;

const LOCALE_PRODUCT_DETAIL = {
  en: enLocale.translation.productDetail,
  zh: zhLocale.translation.productDetail,
  es: esLocale.translation.productDetail,
  fr: frLocale.translation.productDetail,
  de: deLocale.translation.productDetail,
  it: itLocale.translation.productDetail,
} as const;

const LOCALE_RFQ = {
  en: enLocale.translation.rfq,
  zh: zhLocale.translation.rfq,
  es: esLocale.translation.rfq,
  fr: frLocale.translation.rfq,
  de: deLocale.translation.rfq,
  it: itLocale.translation.rfq,
} as const;

const LOCALE_VIDEOS = {
  en: enLocale.translation.videos,
  zh: zhLocale.translation.videos,
  es: esLocale.translation.videos,
  fr: frLocale.translation.videos,
  de: deLocale.translation.videos,
  it: itLocale.translation.videos,
} as const;

// Hero kicker/heading/alt, so the static home <h1> and hero <img> match what
// src/pages/Home.tsx renders.
const LOCALE_HOME = {
  en: enLocale.translation.home,
  zh: zhLocale.translation.home,
  es: esLocale.translation.home,
  fr: frLocale.translation.home,
  de: deLocale.translation.home,
  it: itLocale.translation.home,
} as const;

const LOCALE_STORY = {
  en: enLocale.translation.ourStoryPage,
  zh: zhLocale.translation.ourStoryPage,
  es: esLocale.translation.ourStoryPage,
  fr: frLocale.translation.ourStoryPage,
  de: deLocale.translation.ourStoryPage,
  it: itLocale.translation.ourStoryPage,
} as const;

const LOCALE_FOOTER = {
  en: enLocale.translation.footer,
  zh: zhLocale.translation.footer,
  es: esLocale.translation.footer,
  fr: frLocale.translation.footer,
  de: deLocale.translation.footer,
  it: itLocale.translation.footer,
} as const;

const FALLBACK_FOOTER_LEGAL: Record<'en' | 'zh' | 'es' | 'fr' | 'de' | 'it', { privacy: string; terms: string }> = {
  en: { privacy: 'Privacy Policy', terms: 'Terms and Conditions' },
  zh: { privacy: '隐私政策', terms: '条款与条件' },
  es: { privacy: 'Política de Privacidad', terms: 'Términos y Condiciones' },
  fr: { privacy: 'Politique de Confidentialité', terms: 'Conditions Générales' },
  de: { privacy: 'Datenschutzerklärung', terms: 'Allgemeine Geschäftsbedingungen' },
  it: { privacy: 'Informativa sulla Privacy', terms: 'Termini e Condizioni' },
};

type SeoLandingWithAnchors = SeoLandingPage & {
  homeAnchor?: string;
  relatedAnchor?: string;
  footerAnchor?: string;
};

function getFooterLegalLabels(lang: 'en' | 'zh' | 'es' | 'fr' | 'de' | 'it'): { privacy: string; terms: string } {
  const footer = LOCALE_FOOTER[lang] as Record<string, unknown>;
  const fallback = FALLBACK_FOOTER_LEGAL[lang];
  return {
    privacy: typeof footer.privacy === 'string' && footer.privacy ? footer.privacy : fallback.privacy,
    terms: typeof footer.terms === 'string' && footer.terms ? footer.terms : fallback.terms,
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DIST = resolve(PROJECT_ROOT, 'dist');

const SITE_URL = 'https://bolenmirror.com';
const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
type Lang = (typeof LANGUAGES)[number];

const DEFAULT_OG_IMAGE =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';
const FACTORY_OG_IMAGE =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory1.jpg';

interface Product {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  is_active?: boolean;
  category?: string;
  price_range?: string;
  msrp?: string;
  details?: string;
  seo?: ProductSeoMetadata;
  specifications?: unknown;
  buyer_summary?: string;
  display_title?: string;
}

// Per-language copy. Kept in this file (not src/locales) so the prerender
// stays a single self-contained Node script. The visible React app continues
// to use src/locales via react-i18next at runtime.
const COPY: Record<
  Lang,
  {
    homeIntro: string;
    catalogH1: string;
    catalogIntro: string;
    productSuffix: string;
    storyH1: string;
    storyIntro: string;
    rfqH1: string;
    rfqIntro: string;
    breadcrumbHome: string;
    breadcrumbCatalog: string;
    navHome: string;
    navCatalog: string;
    navStory: string;
    navRfq: string;
    /** Headings for the prerendered product body. */
    detailsHeading: string;
    specsHeading: string;
    /**
     * Last-resort meta description when a product has neither `details` nor a
     * real `description`. `{title}` is substituted with the localized title —
     * keep the whole sentence in the target language (it used to be a hardcoded
     * English literal, which shipped mixed-language meta on 340 pages).
     */
    productDescTemplate: string;
  }
> = {
  en: {
    homeIntro:
      'BOLEN is an LED mirror and bathroom mirror manufacturer and supplier with its own 46,800 m² factory. Since 2005 its 200+ specialists have made LED bathroom mirrors, vanity mirrors, lighted mirrors and mirror cabinets for OEM/ODM, custom and wholesale orders from brands, distributors and hotel projects.',
    catalogH1: 'Product Catalog',
    catalogIntro:
      'Browse our extensive collection of premium mirrors, featuring smart LED technology, elegant vanity designs, and customizable options.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Our Story',
    storyIntro:
      'Established in 2005, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) develops and manufactures LED, smart, vanity, bathroom, and decorative mirrors at its 46,800 m² Jiaxing facility with a team of 200+ specialists.',
    rfqH1: 'Contact Sales',
    rfqIntro:
      'Contact Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders. Our sales team responds within 24 hours.',
    breadcrumbHome: 'Home',
    breadcrumbCatalog: 'Catalog',
    navHome: 'Home',
    navCatalog: 'Catalog',
    navStory: 'Our Story',
    navRfq: 'Contact Sales',
    detailsHeading: 'Product Details',
    specsHeading: 'Specifications',
    productDescTemplate:
      'Premium {title} by BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — OEM/ODM LED, smart, vanity, and bath mirrors. Contact sales for bulk pricing.',
  },
  zh: {
    homeIntro:
      'BOLEN 镜业是 LED 镜与浴室镜制造商和供应商，拥有 46,800 平方米自有工厂。自 2005 年起，200 多名专业人员为品牌、经销商和酒店项目生产 LED 浴室镜、化妆镜、带灯镜和镜柜，承接 OEM/ODM、定制和批发订单。',
    catalogH1: '产品目录',
    catalogIntro: '浏览我们丰富的优质镜面系列，包括智能 LED 技术、优雅的化妆镜设计和可定制选项。',
    productSuffix: '| BOLEN 镜业',
    storyH1: '关于我们',
    storyIntro:
      '嘉兴诚泰镜业有限公司（BOLEN）成立于 2005 年，在嘉兴 46,800 平方米生产基地内，由 200+ 名专业人员开发和制造 LED 镜、智能镜、化妆镜、浴室镜及装饰镜。',
    rfqH1: '请求报价',
    rfqIntro: '联系嘉兴诚泰镜业有限公司（BOLEN）获取 OEM/ODM 询价、定制镜子制造和批量订单。我们的销售团队 24 小时内回复。',
    breadcrumbHome: '首页',
    breadcrumbCatalog: '目录',
    navHome: '首页',
    navCatalog: '目录',
    navStory: '关于我们',
    navRfq: '询价',
    detailsHeading: '产品详情',
    specsHeading: '规格',
    productDescTemplate:
      '{title} — 嘉兴诚泰镜业有限公司（BOLEN）优质出品，专业提供 OEM/ODM LED 镜、智能镜、化妆镜和浴室镜。欢迎询价获取批发价格。',
  },
  es: {
    homeIntro:
      'BOLEN es un fabricante y proveedor de espejos LED y espejos de baño con fábrica propia de 46.800 m². Desde 2005, sus más de 200 especialistas producen espejos de baño LED, espejos de tocador, espejos con luz y armarios con espejo para pedidos OEM/ODM, a medida y al por mayor de marcas, distribuidores y proyectos hoteleros.',
    catalogH1: 'Catálogo de Productos',
    catalogIntro:
      'Explore nuestra extensa colección de espejos premium, con tecnología LED inteligente, elegantes diseños de tocador y opciones personalizables.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Nuestra Historia',
    storyIntro:
      'Fundada en 2005, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) desarrolla y fabrica espejos LED, inteligentes, de tocador, de baño y decorativos en su planta de 46.800 m² en Jiaxing con un equipo de más de 200 especialistas.',
    rfqH1: 'Solicitar Cotización',
    rfqIntro:
      'Contacte a Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) para consultas OEM/ODM, fabricación de espejos personalizados y pedidos al por mayor. Nuestro equipo de ventas responde en 24 horas.',
    breadcrumbHome: 'Inicio',
    breadcrumbCatalog: 'Catálogo',
    navHome: 'Inicio',
    navCatalog: 'Catálogo',
    navStory: 'Nuestra Historia',
    navRfq: 'Solicitar Cotización',
    detailsHeading: 'Detalles del Producto',
    specsHeading: 'Especificaciones',
    productDescTemplate:
      '{title} de primera calidad, fabricado por BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — espejos LED, inteligentes, de tocador y de baño OEM/ODM. Solicite una cotización para precios al por mayor.',
  },
  fr: {
    homeIntro:
      "BOLEN est un fabricant et fournisseur de miroirs LED et de miroirs de salle de bain, avec sa propre usine de 46 800 m². Depuis 2005, ses plus de 200 spécialistes produisent des miroirs de salle de bain LED, des miroirs de toilette, des miroirs lumineux et des armoires à miroir pour les commandes OEM/ODM, sur mesure et en gros de marques, de distributeurs et de projets hôteliers.",
    catalogH1: 'Catalogue de Produits',
    catalogIntro:
      "Parcourez notre vaste collection de miroirs haut de gamme, dotés d'une technologie LED intelligente, de designs élégants et d'options personnalisables.",
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Notre Histoire',
    storyIntro:
      "Fondée en 2005, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) développe et fabrique des miroirs LED, intelligents, de toilette, de salle de bain et décoratifs sur son site de 46 800 m² à Jiaxing avec une équipe de plus de 200 spécialistes.",
    rfqH1: 'Demande de Devis',
    rfqIntro:
      "Contactez Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) pour les demandes OEM/ODM, la fabrication de miroirs personnalisés et les commandes en gros. Notre équipe commerciale répond sous 24 heures.",
    breadcrumbHome: 'Accueil',
    breadcrumbCatalog: 'Catalogue',
    navHome: 'Accueil',
    navCatalog: 'Catalogue',
    navStory: 'Notre Histoire',
    navRfq: 'Demande de Devis',
    detailsHeading: 'Détails du Produit',
    specsHeading: 'Spécifications',
    productDescTemplate:
      "{title} haut de gamme, fabriqué par BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — miroirs LED, intelligents, de toilette et de salle de bain OEM/ODM. Demandez un devis pour les tarifs en gros.",
  },
  de: {
    homeIntro:
      'BOLEN ist Hersteller und Lieferant von LED-Spiegeln und Badspiegeln mit eigener, 46.800 m² großer Fabrik. Seit 2005 fertigen mehr als 200 Fachkräfte LED-Badspiegel, Schminkspiegel, beleuchtete Spiegel und Spiegelschränke für OEM/ODM-, Sonder- und Großhandelsaufträge von Marken, Händlern und Hotelprojekten.',
    catalogH1: 'Produktkatalog',
    catalogIntro:
      'Durchsuchen Sie unsere umfangreiche Kollektion hochwertiger Spiegel mit intelligenter LED-Technologie, eleganten Schminkdesigns und anpassbaren Optionen.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Unsere Geschichte',
    storyIntro:
      'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) wurde 2005 gegründet und entwickelt und fertigt LED-, Smart-, Schmink-, Bad- und Dekorationsspiegel in seiner 46.800 m² großen Anlage in Jiaxing mit mehr als 200 Fachkräften.',
    rfqH1: 'Angebotsanfrage',
    rfqIntro:
      'Kontaktieren Sie Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) für OEM/ODM-Anfragen, kundenspezifische Spiegelherstellung und Großbestellungen. Unser Vertriebsteam antwortet innerhalb von 24 Stunden.',
    breadcrumbHome: 'Startseite',
    breadcrumbCatalog: 'Katalog',
    navHome: 'Startseite',
    navCatalog: 'Katalog',
    navStory: 'Unsere Geschichte',
    navRfq: 'Angebotsanfrage',
    detailsHeading: 'Produktdetails',
    specsHeading: 'Spezifikationen',
    productDescTemplate:
      'Hochwertiger {title} von BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — OEM/ODM-LED-, Smart-, Schmink- und Badspiegel. Fordern Sie ein Angebot für Großhandelspreise an.',
  },
  it: {
    homeIntro:
      "BOLEN è un produttore e fornitore di specchi LED e specchi da bagno con una propria fabbrica di 46.800 m². Dal 2005 i suoi oltre 200 specialisti realizzano specchi da bagno LED, specchi da toeletta, specchi illuminati e armadietti con specchio per ordini OEM/ODM, su misura e all'ingrosso di marchi, distributori e progetti alberghieri.",
    catalogH1: 'Catalogo Prodotti',
    catalogIntro:
      'Sfoglia la nostra vasta collezione di specchi premium, con tecnologia LED intelligente, eleganti design da toeletta e opzioni personalizzabili.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'La Nostra Storia',
    storyIntro:
      "Fondata nel 2005, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) sviluppa e produce specchi LED, smart, da toeletta, da bagno e decorativi nel suo stabilimento di 46.800 m² a Jiaxing con un team di oltre 200 specialisti.",
    rfqH1: 'Richiedi un Preventivo',
    rfqIntro:
      "Contatta Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) per richieste OEM/ODM, produzione personalizzata di specchi e ordini all'ingrosso. Il nostro team commerciale risponde entro 24 ore.",
    breadcrumbHome: 'Home',
    breadcrumbCatalog: 'Catalogo',
    navHome: 'Home',
    navCatalog: 'Catalogo',
    navStory: 'La Nostra Storia',
    navRfq: 'Richiedi un Preventivo',
    detailsHeading: 'Dettagli Prodotto',
    specsHeading: 'Specifiche',
    productDescTemplate:
      "{title} di alta qualità, prodotto da BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — specchi LED, smart, da toeletta e da bagno OEM/ODM. Richiedi un preventivo per i prezzi all'ingrosso.",
  },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}


// Responsive candidate widths for the LCP hero image. Kept in lockstep with
// the same list in src/pages/Home.tsx so the prerendered <img>/preload URLs are
// byte-identical to what React renders on mount — the browser then serves the
// already-downloaded hero from cache instead of re-fetching (no flash, no
// duplicate LCP candidate).
const HERO_WIDTHS = [640, 960, 1280, 1920] as const;
const HERO_DEFAULT_SIZE = { w: 1920, h: 750 };

interface HeroImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

/** One carousel slide's responsive source set (self-hosted or Supabase). */
interface HeroSlide {
  src: string;
  srcset: string;
}

function buildHeroSrcSet(url: string): string {
  return HERO_WIDTHS.map((w) => `${optimizeImage(url, { width: w })} ${w}w`).join(', ');
}

// Reads the intrinsic dimensions of a remote image so the baked hero <img> can
// reserve the correct aspect-ratio box (kills CLS) without shipping a layout
// library. Pure-Node header parse for JPEG / PNG / WebP; any failure falls back
// to the known hero aspect ratio so the build never breaks on a network blip.
async function probeImageSize(url: string): Promise<{ w: number; h: number }> {
  try {
    const res = await fetch(url);
    if (!res.ok) return HERO_DEFAULT_SIZE;
    const b = Buffer.from(await res.arrayBuffer());

    // PNG: IHDR width/height at fixed offset.
    if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) {
      return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    }
    // WebP (RIFF....WEBP): VP8 / VP8L / VP8X variants.
    if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const fmt = b.toString('ascii', 12, 16);
      if (fmt === 'VP8X') return { w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
      if (fmt === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      if (fmt === 'VP8L') {
        const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
        return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
      }
    }
    // JPEG: scan for a Start-Of-Frame marker.
    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        let m = b[i + 1];
        while (m === 0xff) { i++; m = b[i + 1]; }
        if (m === 0xd8 || m === 0xd9 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) { i += 2; continue; }
        const len = b.readUInt16BE(i + 2);
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
        }
        i += 2 + len;
      }
    }
  } catch {
    // fall through to default
  }
  return HERO_DEFAULT_SIZE;
}

interface ProductFields {
  title?: string;
  description?: string;
  details?: string;
  specifications?: unknown;
}
type LangTranslations = Record<string, ProductFields>;

// Reads the per-language product copy produced by scripts/translate-products.ts.
// Missing files (translations not generated yet) fall back to English — the
// build never fails just because a language hasn't been translated.
async function loadProductTranslations(): Promise<Record<Lang, LangTranslations>> {
  const out = {} as Record<Lang, LangTranslations>;
  for (const lang of LANGUAGES) {
    out[lang] = {};
    if (lang === 'en') continue; // en is source; zh/es/fr/de/it load public/i18n/products.<lang>.json
    try {
      const raw = await readFile(resolve(PROJECT_ROOT, 'public', 'i18n', `products.${lang}.json`), 'utf-8');
      out[lang] = JSON.parse(raw) as LangTranslations;
    } catch {
      // no translation file for this language yet — graceful fallback
    }
  }
  return out;
}

// Overlay localized copy onto an (English) product and apply English title
// typo/polish cleanup. Never touches the title used for slugs/URLs — callers
// always derive routes from `productDetailPath(product, lang)`.
function localizeProduct(product: Product, tr: LangTranslations | undefined, lang: Lang = 'en'): Product {
  const polishedEnTitle = polishEnglishProductTitle(product.title);
  const fields = tr?.[product.id];
  if (!fields) {
    return lang === 'en' ? { ...product, title: polishedEnTitle } : { ...product, title: polishedEnTitle };
  }
  const rawTitle = fields.title?.trim() ? fields.title : polishedEnTitle;
  return {
    ...product,
    title: lang === 'en' ? polishEnglishProductTitle(rawTitle) : rawTitle,
    description: (fields.description as string) || product.description,
    details: (fields.details as string) || product.details,
    specifications: fields.specifications ?? product.specifications,
  };
}

/**
 * Extracts ONLY `{ title, description }` for the products actually listed on a
 * catalog, landing, blog, or video page — never embedding all 117 full
 * `details`/`specifications` (~550 KB) into `__BOLEN_PRERENDER_DATA__`.
 */
function pickCardTranslations(
  tr: LangTranslations | undefined,
  listed: ReadonlyArray<{ id?: string }>
): LangTranslations | undefined {
  if (!tr) return undefined;
  const subset: LangTranslations = {};
  let count = 0;
  for (const item of listed) {
    if (!item.id) continue;
    const entry = tr[item.id];
    if (!entry) continue;
    const compact: ProductFields = {};
    if (entry.title) compact.title = entry.title;
    if (typeof entry.description === 'string' && entry.description) compact.description = entry.description;
    if (compact.title || compact.description) {
      subset[item.id] = compact;
      count++;
    }
  }
  return count > 0 ? subset : undefined;
}

/**
 * Cleans image `alt` text (`<= 100` chars, fixes typos like "loding", strips
 * Alibaba-style certification/wholesale keyword-stuffing tails, and truncates
 * cleanly at a word or CJK boundary).
 */
function cleanImageAlt(raw: string | undefined | null, maxLen = 100): string {
  if (!raw) return '';
  let text = raw
    .replace(/\bloding\b/gi, (m) => (m[0] === 'L' ? 'Loading' : 'loading'))
    .replace(/\bReactanglar\b/gi, 'Rectangular')
    .replace(/\bFree\s+Standings\b/gi, 'Free-Standing')
    .replace(/\bNatual\b/gi, 'Natural')
    .replace(/\bCertificated\b/gi, 'Certified')
    .replace(/\bDiemension\b/gi, 'Dimension')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  // Strip repeated certification / wholesale keyword-stuffing suffixes
  text = text
    .replace(/[,;·|\-–—\s]*(?:\b(?:CE|RoHS|BSCI|UL|ETL|SAA|UKCA|CB|ISO\s*9001)\b[\s,;/·|\-–—]*){2,}$/i, '')
    .trim();
  if (text.length <= maxLen) return text;
  const sliced = text.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = lastSpace >= Math.floor(maxLen * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return trimmed.replace(/[,;:.·|\-–—/+\s]+$/u, '').trim();
}

/** Ensures any `<img>` produced by Markdown rendering also respects `alt <= 100` chars. */
function sanitizeHtmlImageAlts(html: string): string {
  return html.replace(/(<img\b[^>]*?\balt=")([^"]*)(")/gi, (_full, prefix: string, altVal: string, suffix: string) => {
    const decoded = altVal
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    return `${prefix}${escapeAttr(cleanImageAlt(decoded, 100))}${suffix}`;
  });
}

// react-helmet-async uses `data-rh="true"` to identify the tags it manages.
// On client mount it diffs existing data-rh tags against what it wants to
// render and only inserts/removes the difference. Without this marker
// Helmet would APPEND its own copies of every SEO tag we prerender,
// causing duplicates (two canonicals, 14 hreflangs, etc).
const RH = 'data-rh="true"';

function hreflangBlock(routePath: string, languages: readonly string[] = LANGUAGES, alternatePaths?: Record<string, string>): string {
  // Trailing slash matches Cloudflare Pages directory-style URLs (it serves
  // dist/en/products/index.html as /en/products/). Keeping canonical and
  // hreflang URLs aligned with the served URL avoids Google picking a
  // different canonical and dropping URLs from the index.
  const suffix = routePath === '/' ? '' : routePath;
  return [
    ...languages.map((l) => `<link ${RH} rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${alternatePaths?.[l] ?? suffix}/" />`),
    ...(languages.includes('en')
      ? [`<link ${RH} rel="alternate" hreflang="x-default" href="${SITE_URL}/en${alternatePaths?.en ?? suffix}/" />`]
      : []),
  ].join('\n    ');
}

// Injected right before </body> as a compact JSON island + window sync so both
// `src/utils/prerenderData.ts` (`getElementById`) and components reading
// `window.__BOLEN_PRERENDER_DATA__` directly hydrate synchronously without
// bloating <head>.
function prerenderDataScript(payload: unknown): string {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<script id="__BOLEN_PRERENDER_DATA__" type="application/json">${json}</script>\n    <script>try{window.__BOLEN_PRERENDER_DATA__=JSON.parse(document.getElementById("__BOLEN_PRERENDER_DATA__").textContent)}catch(e){}</script>`;
}

function ogTwitterBlock(
  canonical: string,
  title: string,
  description: string,
  ogImage: string,
  ogType: string,
  ogVideo?: { url: string; type: string }
): string {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const u = escapeAttr(canonical);
  // Same value src/components/SEO.tsx writes: the site's own /media/ copy.
  const img = escapeAttr(toMediaUrl(ogImage));
  // Tag order mirrors src/components/SEO.tsx so Helmet adopts these nodes.
  const videoTags = ogVideo
    ? [
        `<meta ${RH} property="og:video" content="${escapeAttr(ogVideo.url)}" />`,
        `<meta ${RH} property="og:video:secure_url" content="${escapeAttr(ogVideo.url)}" />`,
        `<meta ${RH} property="og:video:type" content="${escapeAttr(ogVideo.type)}" />`,
      ]
    : [];
  return [
    `<meta ${RH} property="og:type" content="${ogType}" />`,
    `<meta ${RH} property="og:url" content="${u}" />`,
    `<meta ${RH} property="og:title" content="${t}" />`,
    `<meta ${RH} property="og:description" content="${d}" />`,
    `<meta ${RH} property="og:image" content="${img}" />`,
    `<meta ${RH} property="og:site_name" content="BOLEN Mirror" />`,
    ...videoTags,
    `<meta ${RH} name="twitter:card" content="summary_large_image" />`,
    `<meta ${RH} name="twitter:url" content="${u}" />`,
    `<meta ${RH} name="twitter:title" content="${t}" />`,
    `<meta ${RH} name="twitter:description" content="${d}" />`,
    `<meta ${RH} name="twitter:image" content="${img}" />`,
  ].join('\n    ');
}

function schemaBlock(schema: any[]): string {
  return schema
    .map(
      (s) =>
        `<script ${RH} type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n    ');
}

function buildHead(opts: {
  lang: Lang;
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType?: string;
  ogVideo?: { url: string; type: string };
  routePath: string;
  schema?: any[];
  alternateLanguages?: readonly string[];
  alternatePaths?: Record<string, string>;
}): string {
  const {
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    ogVideo,
    routePath,
    schema = [],
    alternateLanguages = LANGUAGES,
    alternatePaths,
  } = opts;
  return [
    // <title> is updated by Helmet via document.title (not appended), so it
    // doesn't need a data-rh marker.
    `<title>${escapeHtml(title)}</title>`,
    `<meta ${RH} name="description" content="${escapeAttr(description)}" />`,
    `<link ${RH} rel="canonical" href="${escapeAttr(canonical)}" />`,
    hreflangBlock(routePath, alternateLanguages, alternatePaths),
    ogTwitterBlock(canonical, title, description, ogImage, ogType, ogVideo),
    schemaBlock(schema),
  ]
    .filter(Boolean)
    .join('\n    ');
}

function injectIntoTemplate(
  template: string,
  opts: { lang: Lang; headExtras: string; bodyContent: string; dataScript?: string }
): string {
  let html = template;

  // Set <html lang="...">
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${opts.lang}"`);

  // Remove the template's default <title> so the per-route title is the only one.
  html = html.replace(/<title>[^<]*<\/title>/, '');

  // Inject lean SEO head extras immediately before </head>.
  html = html.replace('</head>', `    ${opts.headExtras}\n  </head>`);

  // Put the SEO fallback content directly inside #root (with all img alts capped <= 100 chars).
  const safeBody = sanitizeHtmlImageAlts(opts.bodyContent);
  const rootBlock = `<div id="root">\n      ${safeBody}\n    </div>`;
  let replaced = false;
  html = html.replace(
    /<div id="root">\s*<div id="root-loader">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    () => {
      replaced = true;
      return rootBlock;
    }
  );
  if (!replaced) {
    html = html.replace(/<div id="root">\s*<\/div>/, rootBlock);
  }

  // Inject __BOLEN_PRERENDER_DATA__ right before </body> instead of inside <head>.
  if (opts.dataScript) {
    html = html.replace('</body>', `    ${opts.dataScript}\n  </body>`);
  }

  // Swap loader CSS for lightweight fallback layout CSS.
  html = html.replace(
    /<style>\s*#root-loader\{[\s\S]*?<\/style>/,
    `<style>${PRERENDER_FALLBACK_CSS}</style>`
  );
  html = html.replace(/<noscript><style>#root-loader\{display:none\}<\/style><\/noscript>/, '');

  return html;
}

/**
 * Minimal styling for the prerendered fallback block. Deliberately tiny and
 * self-contained — it ships inline in all ~560 route files, and it only has to
 * hold up for the few hundred ms before the React app replaces #root.
 * Colours match the app shell (stone/amber on #FAF9F6).
 */
const PRERENDER_FALLBACK_CSS = [
  '[data-prerender]{max-width:52rem;margin:0 auto;padding:2rem 1.25rem 4rem;',
  'font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#1c1917;line-height:1.65}',
  '[data-prerender] h1{font-size:1.875rem;line-height:1.2;margin:0 0 1rem;font-weight:600}',
  // The home <h1> opens with the hero kicker, as in Home.tsx.
  '[data-prerender=home] h1>span{display:block;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:#d97706;margin-bottom:.5rem}',
  '[data-prerender] h2{font-size:1.25rem;margin:2rem 0 .75rem;font-weight:600}',
  '[data-prerender] img{max-width:100%;height:auto;border-radius:.75rem;display:block;margin:1.5rem 0}',
  '[data-prerender] nav{font-size:.875rem;color:#78716c;margin-bottom:1.5rem}',
  '[data-prerender] a{color:#b45309}',
  '[data-prerender] ul{list-style:none;padding:0}',
  '[data-prerender] li{margin:.5rem 0}',
  '[data-prerender] dl{display:grid;grid-template-columns:auto 1fr;gap:.4rem 1.5rem;font-size:.9375rem}',
  '[data-prerender] dt{color:#78716c}',
  '[data-prerender] dd{margin:0}',
].join('');

interface FactoryGalleryItem {
  url: string;
  alt: string;
  caption?: string;
}

const FACTORY_COPY: Record<Lang, { heading: string; intro: string }> = {
  en: {
    heading: 'Inside Our Factory',
    intro: 'A look inside our 46,800 m² facility — LED, smart, vanity, bath, and decorative mirror production from material preparation to packed shipment.',
  },
  zh: {
    heading: '走进我们的工厂',
    intro: '走进我们 46,800 平方米的生产基地——从材料准备到打包出货，制造 LED 镜、智能镜、化妆镜、浴室镜及装饰镜。',
  },
  es: {
    heading: 'Dentro de Nuestra Fábrica',
    intro: 'Un recorrido por nuestra planta de 46.800 m²: producción de espejos LED, inteligentes, de tocador, de baño y decorativos, desde la preparación de materiales hasta el envío embalado.',
  },
  fr: {
    heading: 'À l\'Intérieur de Notre Usine',
    intro: 'Visite de notre site de 46 800 m² — production de miroirs LED, intelligents, de toilette, de salle de bain et décoratifs, de la préparation des matériaux à l\'expédition emballée.',
  },
  de: {
    heading: 'Einblick in unsere Fabrik',
    intro: 'Ein Blick in unsere 46.800 m² große Produktionsstätte — Fertigung von LED-, Smart-, Schmink-, Bad- und Dekorationsspiegeln, von der Materialvorbereitung bis zum verpackten Versand.',
  },
  it: {
    heading: 'Dentro la Nostra Fabbrica',
    intro: 'Uno sguardo dentro il nostro stabilimento di 46.800 m² — produzione di specchi LED, smart, da toeletta, da bagno e decorativi, dalla preparazione dei materiali alla spedizione imballata.',
  },
};

// Mirrors `home.featuredVideo` in src/locales/*.ts — the visible React section
// reads those; this copy is only for the crawler-facing static fallback.
const FEATURED_VIDEO_COPY: Record<Lang, { heading: string; intro: string; cta: string }> = {
  en: {
    heading: 'See Our Mirrors in Motion',
    intro:
      'One click into the factory floor: watch how BOLEN LED, smart, and vanity mirrors are built, finished, and tested before they ship.',
    cta: 'All videos',
  },
  zh: {
    heading: '在动态中了解我们的镜子',
    intro: '一键走进车间：观看 BOLEN LED 镜、智能镜与化妆镜从制造、打磨到出货前测试的全过程。',
    cta: '全部视频',
  },
  es: {
    heading: 'Vea Nuestros Espejos en Movimiento',
    intro:
      'Un clic para entrar en la planta: vea cómo se fabrican, acaban y prueban los espejos LED, inteligentes y de tocador de BOLEN antes de enviarlos.',
    cta: 'Todos los videos',
  },
  fr: {
    heading: 'Découvrez Nos Miroirs en Mouvement',
    intro:
      "Un clic pour entrer dans l'atelier : découvrez comment les miroirs LED, intelligents et de toilette BOLEN sont fabriqués, finis et testés avant expédition.",
    cta: 'Toutes les vidéos',
  },
  de: {
    heading: 'Unsere Spiegel in Bewegung',
    intro:
      'Ein Klick in die Fertigung: Sehen Sie, wie BOLEN LED-, Smart- und Schminkspiegel gefertigt, veredelt und vor dem Versand geprüft werden.',
    cta: 'Alle Videos',
  },
  it: {
    heading: 'I Nostri Specchi in Movimento',
    intro:
      'Un clic per entrare in reparto: guarda come gli specchi LED, smart e da toeletta BOLEN vengono prodotti, rifiniti e testati prima della spedizione.',
    cta: 'Tutti i video',
  },
};

/**
 * Home island payload for the featured video. `search_text` is dropped — it
 * concatenates every language's body copy, and the home section never searches,
 * so keeping it would bloat all six localized home pages.
 */
function toFeaturedVideoPayload(video: VideoPost, lang: Lang): VideoListItem {
  const { search_text, ...rest } = toVideoListItem(video, lang);
  return rest;
}

const PHYSICAL_ADDRESS: Record<Lang, { label: string; value: string }> = {
  en: {
    label: 'Factory Address',
    value: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  },
  zh: {
    label: '工厂地址',
    value: '中国浙江省嘉兴市秀洲区王店镇创业路1号2幢1号（No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China）',
  },
  es: {
    label: 'Dirección de fábrica',
    value: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  },
  fr: {
    label: 'Adresse de l’usine',
    value: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  },
  de: {
    label: 'Werksadresse',
    value: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  },
  it: {
    label: 'Indirizzo dello stabilimento',
    value: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town, Jiaxing, Zhejiang, China',
  },
};

const FACTORY_GALLERY_I18N: Record<
  string,
  Record<Lang, { caption: string; alt: string }>
> = {
  factory: {
    en: { caption: 'Factory', alt: 'BOLEN LED mirror manufacturing plant exterior' },
    zh: { caption: '生产基地', alt: 'BOLEN LED 浴室镜自有生产基地外观' },
    es: { caption: 'Fábrica', alt: 'Planta de fabricación de espejos LED BOLEN' },
    fr: { caption: 'Usine', alt: 'Usine de fabrication de miroirs LED BOLEN' },
    de: { caption: 'Werk', alt: 'BOLEN Produktionswerk für LED-Badspiegel' },
    it: { caption: 'Stabilimento', alt: 'Stabilimento di produzione specchi LED BOLEN' },
  },
  'sample room': {
    en: { caption: 'Sample room', alt: 'BOLEN mirror showroom with custom OEM/ODM samples' },
    zh: { caption: '样品展厅', alt: 'BOLEN 镜业 OEM/ODM 定制样品展示厅' },
    es: { caption: 'Sala de muestras', alt: 'Sala de exposición de muestras OEM/ODM de espejos BOLEN' },
    fr: { caption: 'Salle d’échantillons', alt: 'Showroom d’échantillons de miroirs sur mesure BOLEN' },
    de: { caption: 'Musterraum', alt: 'BOLEN Ausstellungsraum mit OEM/ODM-Spiegelmustern' },
    it: { caption: 'Sala campioni', alt: 'Showroom campioni specchi personalizzati OEM/ODM BOLEN' },
  },
  'r&d office building': {
    en: { caption: 'R&D Office Building', alt: 'BOLEN mirror R&D and engineering office building' },
    zh: { caption: '研发办公楼', alt: 'BOLEN 镜业光学与结构研发办公大楼' },
    es: { caption: 'Edificio de I+D y oficinas', alt: 'Edificio de oficinas e ingeniería de I+D de BOLEN' },
    fr: { caption: 'Bâtiment R&D et bureaux', alt: 'Bâtiment de recherche, développement et ingénierie BOLEN' },
    de: { caption: 'F&E- und Verwaltungsgebäude', alt: 'BOLEN Forschungs-, Entwicklungs- und Bürogebäude' },
    it: { caption: 'Edificio uffici e R&S', alt: 'Edificio uffici progettazione e ricerca BOLEN' },
  },
  'company machinery': {
    en: { caption: 'Company machinery', alt: 'Automated CNC glass cutting and edging equipment' },
    zh: { caption: '自动化生产设备', alt: '全自动 CNC 玻璃切割与精磨边加工设备' },
    es: { caption: 'Maquinaria industrial', alt: 'Maquinaria CNC automatizada de corte y canteado de vidrio' },
    fr: { caption: 'Parc machines', alt: 'Équipement CNC automatisé de découpe et façonnage du verre' },
    de: { caption: 'Maschinenpark', alt: 'Automatisierte CNC-Glaszuschnitt- und Kantenbearbeitungsanlage' },
    it: { caption: 'Macchinari di produzione', alt: 'Impianto CNC automatizzato per taglio e molatura del vetro' },
  },
  workshop: {
    en: { caption: 'Workshop', alt: 'BOLEN mirror fabrication and frame workshop' },
    zh: { caption: '生产车间', alt: 'BOLEN 镜面深加工与金属边框制造车间' },
    es: { caption: 'Taller de producción', alt: 'Taller de fabricación y ensamblaje de espejos BOLEN' },
    fr: { caption: 'Atelier de production', alt: 'Atelier de fabrication et d’usinage de miroirs BOLEN' },
    de: { caption: 'Fertigungshalle', alt: 'BOLEN Werkhalle für Spiegel- und Rahmenfertigung' },
    it: { caption: 'Reparto produttivo', alt: 'Reparto di lavorazione specchi e telai BOLEN' },
  },
  'mirror inventory': {
    en: { caption: 'Mirror inventory', alt: 'Raw copper-free silver mirror glass sheet inventory' },
    zh: { caption: '原片与半成品储备', alt: '无铜环保银镜原片与半成品仓储区' },
    es: { caption: 'Inventario de espejos', alt: 'Stock de láminas de vidrio plateado sin cobre' },
    fr: { caption: 'Stock de miroiterie', alt: 'Stock de volumes de verre argenté sans cuivre' },
    de: { caption: 'Spiegellager', alt: 'Lagerbestand an kupferfreiem Silberspiegel-Rohglas' },
    it: { caption: 'Magazzino lastre', alt: 'Stoccaggio lastre di vetro argentato senza rame' },
  },
  'production&assembly line': {
    en: { caption: 'Production & assembly line', alt: 'BOLEN LED bathroom mirror assembly and QC line' },
    zh: { caption: '总装与检测流水线', alt: 'BOLEN LED 浴室镜电气总装与在线老化检测线' },
    es: { caption: 'Línea de producción y montaje', alt: 'Línea de ensamblaje y prueba de espejos de baño LED BOLEN' },
    fr: { caption: 'Ligne de production et d’assemblage', alt: 'Ligne d’assemblage et de contrôle qualité des miroirs LED BOLEN' },
    de: { caption: 'Produktions- und Montagelinie', alt: 'BOLEN Fertigungs- und Prüflinie für LED-Badspiegel' },
    it: { caption: 'Linea di produzione e assemblaggio', alt: 'Linea di montaggio e collaudo specchi da bagno LED BOLEN' },
  },
  warehouse: {
    en: { caption: 'Warehouse', alt: 'Finished mirror export carton warehouse' },
    zh: { caption: '成品仓库', alt: '待发运出口包装成品镜立体仓库' },
    es: { caption: 'Almacén', alt: 'Almacén de espejos terminados listos para exportación' },
    fr: { caption: 'Entrepôt', alt: 'Entrepôt de miroirs emballés prêts pour l’exportation' },
    de: { caption: 'Fertigwarenlager', alt: 'Lagerhalle für versandfertig verpackte Exportspiegel' },
    it: { caption: 'Magazzino prodotti finiti', alt: 'Magazzino specchi imballati pronti per la spedizione' },
  },
  'loading and shipping': {
    en: { caption: 'Loading and shipping', alt: 'Mirror container loading and export dispatch' },
    zh: { caption: '装柜与发运', alt: '出口集装箱现场装柜加固与物流发运' },
    es: { caption: 'Carga y expedición', alt: 'Carga de contenedores de espejos y despacho marítimo' },
    fr: { caption: 'Chargement et expédition', alt: 'Chargement de conteneurs de miroirs pour expédition maritime' },
    de: { caption: 'Verladung und Versand', alt: 'Containerverladung und Exportversand von Spiegellieferungen' },
    it: { caption: 'Carico e spedizione', alt: 'Carico container di specchi per spedizioni internazionali' },
  },
};

function localizeFactoryGallery(gallery: FactoryGalleryItem[], lang: Lang): FactoryGalleryItem[] {
  return gallery.map((item) => {
    const key = (item.caption || '').trim().toLowerCase();
    const mapped = FACTORY_GALLERY_I18N[key]?.[lang];
    if (mapped) {
      return {
        url: item.url,
        alt: cleanImageAlt(mapped.alt),
        caption: mapped.caption,
      };
    }
    return {
      url: item.url,
      alt: cleanImageAlt(lang === 'en' ? item.alt : `${FACTORY_COPY[lang].heading} — BOLEN`),
      caption: lang === 'en' ? item.caption : undefined,
    };
  });
}

function featuredVideoBlock(lang: Lang, video?: VideoListItem): string {
  if (!video) return '';
  const c = FEATURED_VIDEO_COPY[lang];
  const href = `/${lang}/videos/${video.slug}/`;
  const poster = video.thumbnail_url
    ? `<img src="${escapeAttr(optimizeImage(video.thumbnail_url, { width: 960 }))}" alt="${escapeAttr(
        cleanImageAlt(video.title)
      )}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
    : '';
  const excerpt = video.excerpt ? `<p>${escapeHtml(video.excerpt)}</p>` : '';
  return `
    <section id="featured-video" aria-labelledby="featured-video-title">
      <h2 id="featured-video-title">${escapeHtml(c.heading)}</h2>
      <p>${escapeHtml(c.intro)}</p>
      <a href="${escapeAttr(href)}">${poster}<h3>${escapeHtml(video.title)}</h3></a>
      ${excerpt}
      <p><a href="/${lang}/videos/">${escapeHtml(c.cta)}</a></p>
    </section>
  `.trim();
}

function factoryGalleryBlock(lang: Lang, gallery: FactoryGalleryItem[]): string {
  if (!gallery.length) return '';
  const fc = FACTORY_COPY[lang];
  const widths = [400, 800, 1200];
  const items = gallery
    .map((it) => {
      const srcset = widths
        .map((w) => `${optimizeImage(it.url, { width: w })} ${w}w`)
        .join(', ');
      const figcaption = it.caption
        ? `<figcaption>${escapeHtml(it.caption)}</figcaption>`
        : '';
      return `<li><figure><img src="${escapeAttr(optimizeImage(it.url, { width: 800 }))}" srcset="${escapeAttr(srcset)}" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" width="800" height="600" alt="${escapeAttr(cleanImageAlt(it.alt))}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />${figcaption}</figure></li>`;
    })
    .join('\n        ');
  return `
    <section id="factory-showcase" aria-labelledby="factory-showcase-title">
      <h2 id="factory-showcase-title">${escapeHtml(fc.heading)}</h2>
      <p>${escapeHtml(fc.intro)}</p>
      <ul aria-label="${escapeAttr(fc.heading)}">
        ${items}
      </ul>
    </section>
  `.trim();
}

// Markup helpers
function homeContent(
  lang: Lang,
  hero?: HeroImage,
  gallery: FactoryGalleryItem[] = [],
  featuredVideo?: VideoListItem,
  categories: string[] = [...DEFAULT_PRODUCT_CATEGORIES]
): string {
  const c = COPY[lang];
  const h = LOCALE_HOME[lang];
  const addr = PHYSICAL_ADDRESS[lang];
  const legal = getFooterLegalLabels(lang);
  const heroBlock = hero
    ? `<div class="relative bg-stone-900 overflow-hidden">
        <img src="${escapeAttr(hero.src)}" srcset="${escapeAttr(hero.srcset)}" sizes="100vw" width="${hero.width}" height="${hero.height}" alt="${escapeAttr(cleanImageAlt(h.heroImageAlt))}" class="w-full h-auto block" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" />
      </div>
      `
    : '';
  const solutionPages = getLocalizedSeoLandingPages(lang) as SeoLandingWithAnchors[];
  const solutionsUi = getSeoSolutionsUi(lang);
  const solutionLinks = `<section aria-labelledby="manufacturing-solutions-title">
          <h2 id="manufacturing-solutions-title">${escapeHtml(solutionsUi.homeHeading)}</h2>
          <p>${escapeHtml(solutionsUi.homeIntro)}</p>
          <ul>
            ${HOME_SOLUTION_SLUGS.map((slug) => solutionPages.find((page) => page.slug === slug))
              .filter((page): page is SeoLandingWithAnchors => Boolean(page))
              .map(
                (page) =>
                  `<li><a href="/${lang}/solutions/${escapeAttr(page.slug)}/"><strong>${escapeHtml(page.homeAnchor || page.shortTitle || page.h1)}</strong></a> — ${escapeHtml(page.blurb || page.description)}</li>`
              ).join('\n            ')}
          </ul>
        </section>`;
  return `
    <div data-prerender="home">
      ${heroBlock}<h1><span>${escapeHtml(h.heroKicker)}</span> ${escapeHtml(h.heroTitle1)} ${escapeHtml(h.heroTitle2)}</h1>
      <p>${escapeHtml(c.homeIntro)}</p>
      <nav aria-label="Site sections">
        <a href="/${lang}/products/">${escapeHtml(c.navCatalog)}</a>
        <a href="/${lang}/our-story/">${escapeHtml(c.navStory)}</a>
        <a href="/${lang}/rfq/">${escapeHtml(c.navRfq)}</a>
      </nav>
      <nav aria-label="${escapeAttr(LOCALE_PRODUCTS[lang].categoriesNav)}">
        <a href="/${lang}/products/">${escapeHtml(LOCALE_PRODUCTS[lang].allCategories)}</a>
        ${uniqueCategorySlugs(categories.length ? categories : [...DEFAULT_PRODUCT_CATEGORIES]).map(({ name, slug }) =>
          `<a href="/${lang}${CATALOG_CATEGORY_PREFIX}/${slug}/">${escapeHtml(categoryDisplayName(lang, name))}</a>`
        ).join('\n        ')}
      </nav>
      ${featuredVideoBlock(lang, featuredVideo)}
      ${solutionLinks}
      ${factoryGalleryBlock(lang, gallery)}
      <footer>
        <p><strong>Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)</strong></p>
        <address>${escapeHtml(addr.label)}: ${escapeHtml(addr.value)} &middot; <a href="mailto:sales@bolenmirror.com">sales@bolenmirror.com</a> &middot; <a href="tel:+8618058603602">+86 18058603602</a></address>
        <p><a href="/${lang}/privacy-policy/">${escapeHtml(legal.privacy)}</a> &middot; <a href="/${lang}/terms-and-conditions/">${escapeHtml(legal.terms)}</a></p>
      </footer>
    </div>
  `.trim();
}

function seoSolutionsContent(lang: Lang): string {
  const pages = getLocalizedSeoLandingPages(lang);
  const ui = getSeoSolutionsUi(lang);
  const groups = SEO_LANDING_GROUPS.map((group) => {
    const copy = ui.hubGroups[group.id];
    const links = group.slugs
      .map((slug) => pages.find((page) => page.slug === slug))
      .filter((page): page is SeoLandingPage => Boolean(page))
      .map(
        (page) => `<li><a href="/${lang}/solutions/${escapeAttr(page.slug)}/"><h3>${escapeHtml(page.shortTitle || page.h1)}</h3></a><p>${escapeHtml(page.blurb || page.description)}</p></li>`
      )
      .join('\n        ');
    return `<section><h2>${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.description)}</p><ul>${links}</ul></section>`;
  }).join('\n      ');
  return `
    <div data-prerender="seo-solutions">
      <nav aria-label="Breadcrumb"><a href="/${lang}/">${escapeHtml(ui.home)}</a> &raquo; <span>${escapeHtml(ui.footerLabel)}</span></nav>
      <h1>${escapeHtml(ui.hubHeading)}</h1>
      <p>${escapeHtml(ui.hubIntro)}</p>
      <ol>
        ${ui.howSteps.map((step) => `<li><h2>${escapeHtml(step.title)}</h2><p>${escapeHtml(step.copy)}</p></li>`).join('\n        ')}
      </ol>
      ${groups}
      <p><a href="/${lang}/rfq/">${escapeHtml(ui.discussProject)}</a></p>
    </div>
  `.trim();
}

function seoLandingContent(
  lang: Lang,
  page: SeoLandingPage,
  sourcePage: SeoLandingPage,
  products: Product[],
  tr: LangTranslations
): string {
  const ui = getSeoSolutionsUi(lang);
  const matchedProducts = products
    .filter((product) => matchesSeoLandingProduct(sourcePage, product))
    .sort((a, b) => scoreSeoLandingProduct(sourcePage, b) - scoreSeoLandingProduct(sourcePage, a))
    .slice(0, 6);
  const proof = page.proofPoints
    .map((point) => `<li><strong>${escapeHtml(point.value)}</strong> — ${escapeHtml(point.label)}</li>`)
    .join('\n        ');
  const sections = page.sections
    .map((section) => {
      const paragraphs = section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n        ');
      const bullets = section.bullets?.length
        ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
        : '';
      return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${bullets}</section>`;
    })
    .join('\n      ');
  const productList = matchedProducts
    .map((product) => {
      const display = localizeProduct(product, tr, lang);
      const fallbackCopy = getSeoLandingProductCardCopy(product, lang);
      const hasTranslation = Boolean(tr[product.id]?.title);
      const displayTitle = lang === 'en' ? display.title : hasTranslation ? display.title : fallbackCopy.title;
      const href = `/${lang}${productDetailPath(product, lang)}/`;
      const image = product.images?.[0]
        ? `<img src="${escapeAttr(toMediaPath(product.images[0]))}" alt="${escapeAttr(cleanImageAlt(displayTitle))}" width="400" height="400" loading="lazy" />`
        : '';
      const summary = lang === 'en' || hasTranslation ? buildProductBuyerSummary(display) : fallbackCopy.summary;
      return `<li><a href="${escapeAttr(href)}">${image}<strong>${escapeHtml(displayTitle)}</strong></a>${summary ? `<p>${escapeHtml(summary)}</p>` : ''}</li>`;
    })
    .join('\n        ');
  const faqs = page.faq
    .map((item) => `<article><h2>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.answer)}</p></article>`)
    .join('\n      ');
  const related = page.relatedSlugs
    .map((slug) => SEO_LANDING_BY_SLUG[slug])
    .filter((candidate): candidate is SeoLandingPage => Boolean(candidate))
    .map((candidate) => localizeSeoLandingPage(candidate, lang) as SeoLandingWithAnchors)
    .map((candidate) => `<li><a href="/${lang}/solutions/${escapeAttr(candidate.slug)}/">${escapeHtml(candidate.relatedAnchor || candidate.shortTitle || candidate.h1)}</a></li>`)
    .join('\n        ');

  return `
    <div data-prerender="seo-landing">
      <nav aria-label="Breadcrumb"><a href="/${lang}/">${escapeHtml(ui.home)}</a> &raquo; <a href="/${lang}/solutions/">${escapeHtml(ui.footerLabel)}</a> &raquo; <span>${escapeHtml(page.shortTitle || page.h1)}</span></nav>
      <h1>${escapeHtml(page.h1)}</h1>
      <p>${escapeHtml(page.intro)}</p>
      <ul aria-label="BOLEN manufacturing proof points">${proof}</ul>
      ${productList ? `<section><h2>${escapeHtml(ui.modelsHeading)}</h2><ul>${productList}</ul></section>` : ''}
      ${sections}
      <section><h2>${escapeHtml(ui.faqHeading)}</h2>${faqs}</section>
      <section><h2>${escapeHtml(ui.relatedSolutions)}</h2><ul>${related}</ul></section>
      <p><a href="/${lang}/rfq/">${escapeHtml(ui.requestQuote)}</a></p>
    </div>
  `.trim();
}

function categoryDisplayName(lang: Lang, name: string): string {
  const canonical = canonicalCategoryName(name) || name;
  const map = LOCALE_PRODUCTS[lang].categories as Record<string, string>;
  return map[canonical] || map[name] || canonical;
}

function catalogContent(
  lang: Lang,
  products: Product[],
  tr: LangTranslations,
  opts?: { categoryName?: string; categories?: string[]; heading?: string; description?: string }
): string {
  const c = COPY[lang];
  const categoryName = opts?.categoryName;
  const categorySlug = categoryName ? toCategorySlug(categoryName) : '';
  const categoryLabel = categoryName ? categoryDisplayName(lang, categoryName) : '';
  const listed = categoryName
    ? products.filter((p) => productMatchesCategory(p.category, categoryName))
    : products;
  const items = listed
    .map((p) => {
      const href = `/${lang}${productDetailPath(p, lang)}/`;
      const display = localizeProduct(p, tr, lang);
      const title = display.title;
      const img = p.images?.[0];
      const imgTag = img
        ? `<img src="${escapeAttr(toMediaPath(img))}" alt="${escapeAttr(cleanImageAlt(title))}" width="400" height="400" loading="lazy" />`
        : '';
      return `<li><a href="${escapeAttr(href)}">${imgTag}<span>${escapeHtml(title)}</span></a></li>`;
    })
    .join('\n        ');
  const navCategories = opts?.categories?.length ? opts.categories : [...DEFAULT_PRODUCT_CATEGORIES];
  const categoryNav = `
      <nav aria-label="${escapeAttr(LOCALE_PRODUCTS[lang].categoriesNav)}">
        ${categoryName
          ? `<a href="/${lang}/products/">${escapeHtml(LOCALE_PRODUCTS[lang].allCategories)}</a>`
          : `<span>${escapeHtml(LOCALE_PRODUCTS[lang].allCategories)}</span>`}
        ${uniqueCategorySlugs(navCategories)
          .map(({ name, slug }) => {
            const label = categoryDisplayName(lang, name);
            const href = `/${lang}${CATALOG_CATEGORY_PREFIX}/${slug}/`;
            return categoryName && toCategorySlug(categoryName) === slug
              ? `<span>${escapeHtml(label)}</span>`
              : `<a href="${escapeAttr(href)}">${escapeHtml(label)}</a>`;
          })
          .join('\n        ')}
      </nav>`;
  const intro = opts?.description ?? (categoryName
    ? interpolateTemplate(LOCALE_PRODUCTS[lang].categoryIntro, { category: categoryLabel })
    : c.catalogIntro);
  const editorial = categorySlug ? getCatalogCategoryEditorial(lang, categorySlug) : null;
  const editorialBlock = editorial
    ? `
      <section aria-labelledby="category-editorial-heading">
        <h2 id="category-editorial-heading">${escapeHtml(editorial.heading)}</h2>
        ${editorial.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n        ')}
        <ul>
          ${editorial.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ')}
        </ul>
      </section>`
    : '';
  return `
    <div data-prerender="catalog">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(LOCALE_NAV[lang].home)}</a>
        &raquo;
        ${categoryName
          ? `<a href="/${lang}/products/">${escapeHtml(LOCALE_NAV[lang].catalog)}</a> &raquo; <span>${escapeHtml(categoryLabel)}</span>`
          : `<span>${escapeHtml(LOCALE_NAV[lang].catalog)}</span>`}
      </nav>
      <h1>${escapeHtml(opts?.heading ?? (categoryName ? categoryLabel : c.catalogH1))}</h1>
      <p data-seo-description="">${escapeHtml(intro)}</p>
      ${categoryNav}
      <ul aria-label="Products">
        ${items}
      </ul>${editorialBlock}
    </div>
  `.trim();
}

function productDetailContent(lang: Lang, product: Product, tr: LangTranslations, seo: ResolvedProductSeo): string {
  const c = COPY[lang];
  const localized = localizeProduct(product, tr, lang);
  const img = product.images?.[0];
  const imgTag = img
    ? `<img src="${escapeAttr(toMediaPath(img))}" alt="${escapeAttr(cleanImageAlt(localized.title))}" width="600" height="600" />`
    : '';
  const descText = localized.description?.trim() || '';
  const desc = descText.length >= 30 && descText !== seo.description
    ? `<p>${escapeHtml(descText.slice(0, 600))}</p>`
    : '';
  const modelNo = descText.length > 0 && descText.length < 30 ? `<p>${escapeHtml(descText)}</p>` : '';
  const price = product.price_range
    ? `<p><strong>${escapeHtml(product.price_range.startsWith('$') ? product.price_range : `$${product.price_range}`)}</strong></p>`
    : '';

  const details = localized.details?.trim()
    ? `<h2>${escapeHtml(c.detailsHeading)}</h2>\n      ${renderMarkdownToHtml(normalizeProductDetails(localized.details), { descriptionImages: true })}`
    : '';

  const specs = normalizeSpecs(localized.specifications);
  const specTable = specs.length
    ? `<h2>${escapeHtml(c.specsHeading)}</h2>
      <dl>
        ${specs
          .map(
            (s) =>
              `<dt>${escapeHtml(s.key)}</dt><dd>${escapeHtml(s.value)}</dd>`
          )
          .join('\n        ')}
      </dl>`
    : '';
  const solutions = relatedSolutionsBlock(lang, product);
  const resolvedCategory = canonicalCategoryName(product.category);

  return `
    <div data-prerender="product">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(LOCALE_NAV[lang].home)}</a>
        &raquo;
        <a href="/${lang}/products/">${escapeHtml(LOCALE_NAV[lang].catalog)}</a>
        ${resolvedCategory && product.category
          ? `&raquo; <a href="/${lang}${catalogCategoryPath(product.category)}/">${escapeHtml(categoryDisplayName(lang, resolvedCategory))}</a>`
          : ''}
        &raquo;
        <span>${escapeHtml(localized.title)}</span>
      </nav>
      <h1>${escapeHtml(seo.h1)}</h1>
      <p data-seo-description="">${escapeHtml(seo.description)}</p>
      ${imgTag}
      ${modelNo}
      ${desc}
      ${price}
      ${details}
      ${specTable}
      ${solutions}
      <p><a href="/${lang}/rfq/">${escapeHtml(c.navRfq)}</a></p>
    </div>
  `.trim();
}

function relatedSolutionsBlock(
  lang: Lang,
  seed: { title?: string; category?: string; description?: string }
): string {
  const ui = getSeoSolutionsUi(lang);
  const items = recommendSolutionsForProduct(seed)
    .map((page) => localizeSeoLandingPage(page, lang) as SeoLandingWithAnchors)
    .map(
      (page) =>
        `<li><a href="/${lang}/solutions/${escapeAttr(page.slug)}/">${escapeHtml(page.relatedAnchor || page.shortTitle || page.h1)}</a></li>`
    )
    .join('\n        ');
  if (!items) return '';
  return `<section><h2>${escapeHtml(ui.relatedSolutions)}</h2><ul>${items}</ul></section>`;
}

function storyContent(lang: Lang): string {
  const story = LOCALE_STORY[lang];
  const addr = PHYSICAL_ADDRESS[lang];
  const stages = [
    story.process.steps.brief,
    story.process.steps.specification,
    story.process.steps.manufacturing,
    story.process.steps.inspection,
    story.process.steps.packaging,
    story.process.steps.logistics,
  ];
  return `
    <div data-prerender="story">
      <h1>${escapeHtml(story.title)}</h1>
      <p>${escapeHtml(story.hero.description)}</p>
      <section>
        <h2>${escapeHtml(story.company.titleLine1)} ${escapeHtml(story.company.titleLine2)}</h2>
        <p>${escapeHtml(story.company.description)}</p>
        <dl>
          <dt>${escapeHtml(story.company.foundedLabel)}</dt><dd>2005</dd>
          <dt>${escapeHtml(story.company.facilityLabel)}</dt><dd>46,800 m²</dd>
          <dt>${escapeHtml(story.company.teamLabel)}</dt><dd>200+</dd>
          <dt>${escapeHtml(addr.label)}</dt><dd>${escapeHtml(addr.value)}</dd>
        </dl>
      </section>
      <section>
        <h2>${escapeHtml(story.process.titleLine1)} ${escapeHtml(story.process.titleLine2)}</h2>
        <p>${escapeHtml(story.process.description)}</p>
        <ol>${stages.map((stage) => `<li><strong>${escapeHtml(stage.label)}</strong> — ${escapeHtml(stage.description)}</li>`).join('')}</ol>
      </section>
      <section>
        <h2>${escapeHtml(story.quality.titleLine1)} ${escapeHtml(story.quality.titleLine2)}</h2>
        <p>${escapeHtml(story.quality.scopeNote)}</p>
      </section>
      <section>
        <h2>${escapeHtml(story.partnership.titleLine1)} ${escapeHtml(story.partnership.titleLine2)}</h2>
        <p>${escapeHtml(story.partnership.description)}</p>
        <address>${escapeHtml(addr.value)} &middot; <a href="mailto:sales@bolenmirror.com">sales@bolenmirror.com</a> &middot; <a href="tel:+8618058603602">+86 18058603602</a></address>
      </section>
    </div>
  `.trim();
}

function rfqContent(lang: Lang): string {
  const rfq = LOCALE_RFQ[lang];
  const pd = LOCALE_PRODUCT_DETAIL[lang];
  const addr = PHYSICAL_ADDRESS[lang];
  return `
    <div data-prerender="rfq">
      <h1>${escapeHtml(pd.requestQuote)}</h1>
      <p>${escapeHtml(rfq.intro)}</p>
      <section>
        <h2>${escapeHtml(rfq.quoteIncludesTitle)}</h2>
        <ul>
          <li>${escapeHtml(rfq.quoteIncludesMoq)}</li>
          <li>${escapeHtml(rfq.quoteIncludesLeadTime)}</li>
          <li>${escapeHtml(rfq.quoteIncludesOptions)}</li>
        </ul>
      </section>
      <section>
        <h2>${escapeHtml(rfq.contactInformation)}</h2>
        <dl>
          <dt>${escapeHtml(rfq.emailUs)}</dt>
          <dd><a href="mailto:sales@bolenmirror.com">sales@bolenmirror.com</a></dd>
          <dt>${escapeHtml(rfq.callUs)}</dt>
          <dd><a href="tel:+8618058603602">+86 18058603602</a></dd>
          <dt>${escapeHtml(rfq.visitUs)}</dt>
          <dd><address>${escapeHtml(addr.value)}</address></dd>
        </dl>
        <p>${escapeHtml(rfq.messagePlaceholder)}</p>
      </section>
    </div>
  `.trim();
}

// Localized per locale, matching src/pages/TermsAndConditions.tsx.
function termsContent(lang: Lang): string {
  const copy = getTermsCopy(lang);
  const sections = copy.sections.map(
    (section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`
  ).join('\n      ');
  return `
    <div data-prerender="terms">
      <p>${escapeHtml(copy.kicker)}</p>
      <h1>${escapeHtml(copy.heading)}</h1>
      <p>${escapeHtml(copy.lastUpdated)}</p>
      <p>${escapeHtml(copy.intro)}</p>
      ${sections}
      <section><h2>${escapeHtml(copy.contactHeading)}</h2><p>${escapeHtml(copy.contactLead)} <a href="mailto:${escapeAttr(TERMS_CONTACT_EMAIL)}">${escapeHtml(TERMS_CONTACT_EMAIL)}</a>.</p></section>
    </div>
  `.trim();
}

function privacyContent(
  lang: Lang,
  copy: {
    kicker: string;
    heading: string;
    lastUpdated: string;
    intro: string;
    sections: ReadonlyArray<{ title: string; body: string }>;
    contactHeading: string;
    contactLead: string;
  }
): string {
  const addr = PHYSICAL_ADDRESS[lang];
  const sections = copy.sections
    .map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`)
    .join('\n      ');
  return `
    <div data-prerender="privacy">
      <p>${escapeHtml(copy.kicker)}</p>
      <h1>${escapeHtml(copy.heading)}</h1>
      <p>${escapeHtml(copy.lastUpdated)}</p>
      <p>${escapeHtml(copy.intro)}</p>
      ${sections}
      <section>
        <h2>${escapeHtml(copy.contactHeading)}</h2>
        <p>${escapeHtml(copy.contactLead)} <a href="mailto:${escapeAttr(TERMS_CONTACT_EMAIL)}">${escapeHtml(TERMS_CONTACT_EMAIL)}</a>.</p>
        <address>${escapeHtml(addr.value)}</address>
      </section>
    </div>
  `.trim();
}

// Copy mirrors src/pages/NotFound.tsx, which React renders on hydration. The
// robots meta carries data-rh so Helmet adopts it instead of adding a second.
const NOT_FOUND_TITLE = 'Page Not Found | BOLEN Mirror';
const NOT_FOUND_DESC = "The page you're looking for doesn't exist or has been moved.";
const NOINDEX_META = `<meta ${RH} name="robots" content="noindex, nofollow" />`;

/**
 * dist/404.html: the SPA shell with a noindex head (zero canonical/hreflang!)
 * and a static not-found body.
 */
function notFoundHtml(template: string): string {
  const headExtras = [
    `<title>${escapeHtml(NOT_FOUND_TITLE)}</title>`,
    `<meta ${RH} name="description" content="${escapeAttr(NOT_FOUND_DESC)}" />`,
    NOINDEX_META,
  ].join('\n    ');
  const bodyContent = `
    <div data-prerender="not-found">
      <p>404</p>
      <h1>Page Not Found</h1>
      <p>${escapeHtml(NOT_FOUND_DESC)}</p>
      <p><a href="/en/">Go Home</a> &middot; <a href="/en/products/">Browse Products</a></p>
    </div>
  `.trim();
  return injectIntoTemplate(template, { lang: 'en', headExtras, bodyContent });
}

/**
 * dist/admin/index.html: an unmodified SPA shell (loader intact — the portal
 * has nothing to prerender) with the employee-portal title and a noindex meta
 * that matches what AdminLogin / AdminDashboard emit via <SEO noindex>.
 * worker/reliable-entry.ts serves this file with 200 for every /admin path.
 */
function adminShellHtml(template: string): string {
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(enLocale.translation.admin.seo.portal)}</title>`)
    .replace('</head>', `    ${NOINDEX_META}\n  </head>`);
}

// Schemas
// Schemas below are intentionally byte-compatible with what each page's
// React component emits via <SEO schema={...}>, so that react-helmet-async's
// `isEqualNode` check on mount adopts the prerendered script tags instead of
// removing them and appending a duplicate copy. Mirror the source object
// shapes in:
//   - src/utils/homeSchema.ts   (Organization, WebSite — shared, not mirrored)
//   - src/pages/Products.tsx    (CollectionPage)
//   - src/pages/ProductDetail.tsx (Product, BreadcrumbList)
//   - src/pages/OurStory.tsx    (AboutPage)
//   - src/pages/RFQ.tsx         (ContactPage)
// Key order matters: JSON.stringify follows insertion order, and `isEqualNode`
// compares serialized script contents.

// Shared with src/pages/Home.tsx (src/utils/homeSchema.ts).
function homeSchema(lang: Lang, gallery: FactoryGalleryItem[] = [], featuredVideo?: VideoListItem): any[] {
  return buildHomeSchema(lang, { factoryGallery: gallery, featuredVideo });
}

function catalogSchema(lang: Lang): any[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: COPY[lang].catalogH1,
      description: LOCALE_SEO[lang].catalogDesc,
      url: `https://bolenmirror.com/${lang}/products/`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'BOLEN Mirror',
        url: 'https://bolenmirror.com',
      },
    },
  ];
}

function seoSolutionsSchema(lang: Lang): any[] {
  const pages = getLocalizedSeoLandingPages(lang);
  const ui = getSeoSolutionsUi(lang);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: ui.hubHeading,
      itemListElement: pages.map((page, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: page.h1,
        url: `${SITE_URL}/${lang}/solutions/${page.slug}/`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui.home, item: `${SITE_URL}/${lang}/` },
        { '@type': 'ListItem', position: 2, name: ui.footerLabel, item: `${SITE_URL}/${lang}/solutions/` },
      ],
    },
  ];
}

const SERVICE_SCHEMA_I18N: Record<
  Lang,
  { areaServed: string; audienceType: string; catalogName: string }
> = {
  en: {
    areaServed: 'Worldwide',
    audienceType: 'Importers, distributors, brands, hotel and project buyers',
    catalogName: 'BOLEN mirror catalog',
  },
  zh: {
    areaServed: '全球市场',
    audienceType: '进口商、经销商、卫浴品牌、酒店及工程项目采购商',
    catalogName: 'BOLEN 产品目录',
  },
  es: {
    areaServed: 'Mundial',
    audienceType: 'Importadores, distribuidores, marcas, hoteles y compradores de proyectos',
    catalogName: 'Catálogo de espejos BOLEN',
  },
  fr: {
    areaServed: 'Monde entier',
    audienceType: 'Importateurs, distributeurs, marques, hôtels et acheteurs projets',
    catalogName: 'Catalogue de miroirs BOLEN',
  },
  de: {
    areaServed: 'Weltweit',
    audienceType: 'Importeure, Großhändler, Marken, Hotels und Projekteinkäufer',
    catalogName: 'BOLEN Spiegelkatalog',
  },
  it: {
    areaServed: 'Tutto il mondo',
    audienceType: 'Importatori, distributori, marchi, hotel e buyer di progetto',
    catalogName: 'Catalogo specchi BOLEN',
  },
};

function seoLandingSchema(lang: Lang, page: SeoLandingPage): any[] {
  const ui = getSeoSolutionsUi(lang);
  const svc = SERVICE_SCHEMA_I18N[lang];
  const url = `${SITE_URL}/${lang}/solutions/${page.slug}/`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.h1,
      alternateName: page.shortTitle,
      serviceType: page.shortTitle || page.h1,
      description: page.description,
      url,
      inLanguage: lang,
      areaServed: {
        '@type': 'Place',
        name: svc.areaServed,
      },
      audience: {
        '@type': 'BusinessAudience',
        audienceType: svc.audienceType,
      },
      brand: {
        '@type': 'Brand',
        name: 'BOLEN',
      },
      provider: {
        '@type': 'Organization',
        name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
        url: SITE_URL,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: svc.catalogName,
        url: `${SITE_URL}/${lang}/products/`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui.home, item: `${SITE_URL}/${lang}/` },
        { '@type': 'ListItem', position: 2, name: ui.footerLabel, item: `${SITE_URL}/${lang}/solutions/` },
        { '@type': 'ListItem', position: 3, name: page.h1, item: url },
      ],
    },
  ];
}

// Mirrors src/pages/ProductDetail.tsx's parsePriceRange. Keep both in lockstep
// so the prerendered JSON-LD matches Helmet's render and avoids duplicates.
function parsePriceRange(range?: string): { low: number; high: number } {
  const nums = range?.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (nums.length === 0) return { low: 0, high: 0 };
  if (nums.length === 1) return { low: nums[0], high: nums[0] };
  return { low: Math.min(...nums), high: Math.max(...nums) };
}

// Thin localized wrappers over the shared helpers in src/utils/productSeo.ts,
// which src/pages/ProductDetail.tsx also uses — so the prerendered <title>/
// <meta description> and the values Helmet writes on mount cannot drift.
function productPageSeo(product: Product, lang: Lang): ResolvedProductSeo {
  const display = { ...product, title: lang === 'en' ? polishEnglishProductTitle(product.title) : product.title };
  return resolveProductSeo(display, lang, {
    titleSuffix: LOCALE_PRODUCT_DETAIL[lang].brandSuffix,
    descriptionTemplate: LOCALE_PRODUCT_DETAIL[lang].descTemplate,
  });
}

function productDetailSchema(lang: Lang, product: Product, display: Product, seo: ResolvedProductSeo): any[] {
  const productFullUrl = `https://bolenmirror.com/${lang}${productDetailPath(product, lang)}/`;
  const { low: lowPrice, high: highPrice } = parsePriceRange(product.price_range);
  const resolvedCategory = canonicalCategoryName(product.category);
  const categoryLabel = resolvedCategory ? categoryDisplayName(lang, resolvedCategory) : undefined;
  return [
    {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: seo.h1,
      image: (product.images || []).map((image) => toMediaUrl(image)),
      description: seo.description,
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'BOLEN',
      },
      ...(normalizeSpecs(display.specifications).length
        ? {
            additionalProperty: normalizeSpecs(display.specifications).map((s) => ({
              '@type': 'PropertyValue',
              name: s.key,
              value: s.value,
            })),
          }
        : {}),
      ...(lowPrice > 0
        ? {
            offers: {
              '@type': 'Offer',
              url: productFullUrl,
              priceCurrency: 'USD',
              ...(lowPrice === highPrice
                ? { price: lowPrice }
                : {
                    priceSpecification: {
                      '@type': 'UnitPriceSpecification',
                      priceCurrency: 'USD',
                      minPrice: lowPrice,
                      maxPrice: highPrice,
                    },
                  }),
            },
          }
        : {}),
    },
    buildProductBreadcrumbSchema({
      lang,
      homeLabel: LOCALE_NAV[lang].home,
      catalogLabel: LOCALE_NAV[lang].catalog,
      categoryName: product.category,
      categoryLabel,
      productTitle: display.title,
      productUrl: productFullUrl,
    }),
  ];
}

function storySchema(lang: Lang): any[] {
  return [buildStorySchema(lang, LOCALE_SEO[lang].storyTitle, LOCALE_SEO[lang].storyDesc)];
}

function rfqSchema(lang: Lang): any[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: LOCALE_SEO[lang].rfqTitle,
      description: LOCALE_SEO[lang].rfqDesc,
      url: `https://bolenmirror.com/${lang}/rfq/`,
      inLanguage: lang,
      mainEntity: {
        '@type': 'Organization',
        name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+86-18058603602',
          email: 'sales@bolenmirror.com',
          contactType: 'sales',
          areaServed: 'Worldwide',
          availableLanguage: [...LANGUAGES],
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town',
          addressLocality: 'Jiaxing',
          addressRegion: 'Zhejiang',
          addressCountry: 'CN',
        },
      },
    },
  ];
}

async function writeRoute(routeFsPath: string, html: string): Promise<void> {
  const outPath = resolve(DIST, routeFsPath, 'index.html');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, 'utf-8');
}

async function fetchAllProducts(): Promise<Product[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[prerender-static] Supabase credentials not set; prerendering without product data.');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  // Supabase caps an unbounded select at 1000 rows and returns no error, which
  // would silently truncate the prerendered catalog AND the sitemap. Page
  // explicitly so growth past 1000 products can't quietly drop pages.
  const PAGE = 500;
  const all: Product[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, images, category, price_range, msrp, details, specifications, seo')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) {
      console.warn(`[prerender-static] Could not fetch products: ${error.message}`);
      return from === 0 ? [] : all;
    }
    const batch = (data || []) as Product[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }
  return all;
}

// Defaults mirror Home.tsx so the home data island always has a populated payload
// even when site_settings is empty or unreachable.
const DEFAULT_HERO_BGS = [
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg',
];
const DEFAULT_CATEGORIES = [...DEFAULT_PRODUCT_CATEGORIES];

async function fetchSiteSettings(): Promise<{
  heroBgs: string[];
  categories: string[];
  factoryGallery: FactoryGalleryItem[];
  featuredVideoSlug: string;
}> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return {
      heroBgs: DEFAULT_HERO_BGS,
      categories: DEFAULT_CATEGORIES,
      factoryGallery: [],
      featuredVideoSlug: '',
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let heroBgs: string[] = DEFAULT_HERO_BGS;
  let categories: string[] = DEFAULT_CATEGORIES;
  let factoryGallery: FactoryGalleryItem[] = [];
  let featuredVideoSlug = '';

  try {
    const { data: heroData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_bg')
      .single();
    if (heroData && heroData.value) {
      try {
        const parsed = JSON.parse(heroData.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((url: string) => !url.includes('building.jpg'));
          if (filtered.length > 0) heroBgs = filtered;
        } else if (typeof heroData.value === 'string' && heroData.value.length > 0 && !heroData.value.startsWith('[')) {
          if (!heroData.value.includes('building.jpg')) heroBgs = [heroData.value];
        }
      } catch {
        if (typeof heroData.value === 'string' && heroData.value.length > 0 && !heroData.value.includes('building.jpg')) {
          heroBgs = [heroData.value];
        }
      }
    }
  } catch (err) {
    console.warn('[prerender-static] hero_bg fetch failed; using default.', err);
  }

  try {
    const { data: catData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'categories')
      .single();
    if (catData && catData.value) {
      const parsed = parseCategoriesSetting(catData.value);
      if (parsed.length > 0) categories = parsed;
    }
  } catch (err) {
    console.warn('[prerender-static] categories fetch failed; using default.', err);
  }

  try {
    const { data: galleryData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'factory_gallery')
      .single();
    if (galleryData && galleryData.value) {
      try {
        const parsed = JSON.parse(galleryData.value);
        if (Array.isArray(parsed)) {
          factoryGallery = parsed
            .filter((it: any) => it && typeof it.url === 'string' && it.url.trim() !== '')
            .map((it: any) => ({
              url: it.url,
              alt: typeof it.alt === 'string' && it.alt.trim() !== '' ? it.alt : 'BOLEN mirror factory production line',
              caption: typeof it.caption === 'string' && it.caption.trim() !== '' ? it.caption : undefined,
            }));
        }
      } catch {
        // ignore — empty gallery is fine, section just hides
      }
    }
  } catch (err) {
    console.warn('[prerender-static] factory_gallery fetch failed; section will be empty.', err);
  }

  try {
    const { data: featuredData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'home_featured_video')
      .single();
    featuredVideoSlug = parseFeaturedVideoSlug(featuredData?.value);
  } catch (err) {
    console.warn('[prerender-static] home_featured_video fetch failed; section will be empty.', err);
  }

  return { heroBgs, categories, factoryGallery, featuredVideoSlug };
}

// ---- Journal (blog) ---------------------------------------------------------
// Self-contained per-language copy for the prerendered <head> and SEO body
// fallback, mirroring the COPY pattern above. Article copy itself comes from
// the DB (per-language JSONB), localized via src/utils/blog.

const BLOG_COPY: Record<
  Lang,
  { metaTitle: string; metaDesc: string; h1: string; journal: string }
> = {
  en: {
    metaTitle: 'BOLEN Mirror Insights | LED Mirror Sourcing & Manufacturing',
    metaDesc:
      'Practical sourcing guides, technology explainers, and OEM/ODM manufacturing insights for LED, smart, bathroom, and custom mirrors.',
    h1: 'Mirror sourcing insights',
    journal: 'Insights',
  },
  zh: {
    metaTitle: 'BOLEN 镜类采购洞察 | LED 镜技术与制造指南',
    metaDesc: '面向 LED 镜、智能镜、浴室镜与定制镜采购的实用指南、技术解析及 OEM/ODM 制造洞察。',
    h1: '镜类采购洞察',
    journal: '洞察',
  },
  es: {
    metaTitle: 'Perspectivas BOLEN | Compra y Fabricación de Espejos LED',
    metaDesc:
      'Guías prácticas de compra, explicaciones técnicas y perspectivas de fabricación OEM/ODM para espejos LED, inteligentes y a medida.',
    h1: 'Perspectivas para la compra de espejos',
    journal: 'Perspectivas',
  },
  fr: {
    metaTitle: 'Conseils BOLEN | Achat et Fabrication de Miroirs LED',
    metaDesc:
      "Guides d'achat pratiques, explications techniques et conseils de fabrication OEM/ODM pour les miroirs LED, intelligents et sur mesure.",
    h1: "Conseils d'achat de miroirs",
    journal: 'Conseils',
  },
  de: {
    metaTitle: 'BOLEN Einblicke | Beschaffung und Fertigung von LED-Spiegeln',
    metaDesc:
      'Praxisnahe Einkaufsratgeber, Technik-Erklärungen und OEM/ODM-Fertigungseinblicke für LED-, Smart- und Maßspiegel.',
    h1: 'Einblicke in die Spiegelbeschaffung',
    journal: 'Einblicke',
  },
  it: {
    metaTitle: 'Approfondimenti BOLEN | Acquisto e Produzione di Specchi LED',
    metaDesc:
      "Guide pratiche all'acquisto, spiegazioni tecniche e approfondimenti OEM/ODM per specchi LED, smart e su misura.",
    h1: "Approfondimenti per l'acquisto di specchi",
    journal: 'Approfondimenti',
  },
};

const BLOG_RELATED_HEADING: Record<Lang, string> = {
  en: 'Related products',
  zh: '相关产品',
  es: 'Productos relacionados',
  fr: 'Produits associés',
  de: 'Ähnliche Produkte',
  it: 'Prodotti correlati',
};

const BLOG_MORE_HEADING: Record<Lang, string> = {
  en: 'More insights',
  zh: '更多洞察',
  es: 'Más perspectivas',
  fr: 'Plus de conseils',
  de: 'Weitere Einblicke',
  it: 'Altri approfondimenti',
};

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[prerender-static] Supabase credentials not set; prerendering without blog posts.');
    return [];
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  // select('*') (not an explicit column list) so a newly-typed column that has
  // not been added to the DB yet — e.g. product_ids before the ALTER is run —
  // never turns into a hard fetch error that drops every post.
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) {
    // Table may not exist yet (SQL not run) — never fail the whole build for it.
    console.warn(`[prerender-static] Could not fetch blog posts: ${error.message}`);
    return [];
  }
  return (data || []) as BlogPost[];
}

// Inline markdown images use the same-origin /media/ copies, as in Markdown.tsx.
marked.use({
  walkTokens(token) {
    if (token.type === 'image') token.href = toMediaPath(token.href);
  },
});

function renderMarkdown(md: string): string {
  if (!md) return '';
  return marked.parse(md, { async: false }) as string;
}

function blogIndexContent(lang: Lang, items: BlogListItem[]): string {
  const c = BLOG_COPY[lang];
  const list = items
    .map((p) => {
      const href = `/${lang}${insightDetailPath(p.slug)}/`;
      const cover = normalizeBlogCover(p.cover_image);
      const img = cover
        ? `<img src="${escapeAttr(toMediaPath(cover))}" alt="" width="600" height="400" loading="lazy" />`
        : '';
      return `<li><a href="${escapeAttr(href)}">${img}<h2>${escapeHtml(p.title)}</h2></a><p>${escapeHtml(
        p.excerpt
      )}</p></li>`;
    })
    .join('\n        ');
  return `
    <div data-prerender="blog">
      <h1>${escapeHtml(c.h1)}</h1>
      <ul aria-label="Articles">
        ${list}
      </ul>
    </div>
  `.trim();
}

function blogPostContent(
  lang: Lang,
  post: LocalizedBlogPost,
  relatedProducts: { href: string; title: string; img?: string }[],
  relatedArticles: { href: string; title: string; img?: string | null }[]
): string {
  const c = BLOG_COPY[lang];
  const hc = COPY[lang];
  const cover = normalizeBlogCover(post.cover_image);
  const img = cover
    ? `<img src="${escapeAttr(toMediaPath(cover))}" alt="${escapeAttr(post.title)}" width="1200" height="675" />`
    : '';
  const relatedProductsBlock = relatedProducts.length
    ? `<section aria-label="${escapeAttr(BLOG_RELATED_HEADING[lang])}">
        <h2>${escapeHtml(BLOG_RELATED_HEADING[lang])}</h2>
        <ul>
          ${relatedProducts
            .map(
              (r) =>
                `<li><a href="${escapeAttr(r.href)}">${
                  r.img
                    ? `<img src="${escapeAttr(toMediaPath(r.img))}" alt="${escapeAttr(r.title)}" width="200" height="200" loading="lazy" />`
                    : ''
                }${escapeHtml(r.title)}</a></li>`
            )
            .join('\n          ')}
        </ul>
      </section>`
    : '';
  const relatedArticlesBlock = relatedArticles.length
    ? `<section aria-label="${escapeAttr(BLOG_MORE_HEADING[lang])}">
        <h2>${escapeHtml(BLOG_MORE_HEADING[lang])}</h2>
        <ul>
          ${relatedArticles
            .map((related) => {
              const relatedCover = normalizeBlogCover(related.img);
              return `<li><a href="${escapeAttr(related.href)}">${
                relatedCover
                  ? `<img src="${escapeAttr(toMediaPath(relatedCover))}" alt="" width="300" height="200" loading="lazy" />`
                  : ''
              }${escapeHtml(related.title)}</a></li>`;
            })
            .join('\n          ')}
        </ul>
      </section>`
    : '';
  return `
    <div data-prerender="blogPost">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(hc.breadcrumbHome)}</a>
        &raquo;
        <a href="/${lang}${INSIGHTS_PATH}/">${escapeHtml(c.journal)}</a>
        &raquo;
        <span>${escapeHtml(post.title)}</span>
      </nav>
      <h1>${escapeHtml(post.title)}</h1>
      ${img}
      <div>${renderMarkdown(post.body)}</div>
      ${relatedProductsBlock}
      ${relatedSolutionsBlock(lang, {
        title: post.title,
        category: `${post.category || ''} ${post.excerpt || ''}`,
      })}
      ${relatedArticlesBlock}
      <p><a href="/${lang}/products/">${escapeHtml(hc.navCatalog)}</a> &middot; <a href="/${lang}/solutions/">${escapeHtml(
        getSeoSolutionsUi(lang).navLabel
      )}</a> &middot; <a href="/${lang}/rfq/">${escapeHtml(hc.navRfq)}</a></p>
    </div>
  `.trim();
}

// ---- Videos -----------------------------------------------------------------

// Mirrors `videos.*` in src/locales/*.ts — the React page renders the same
// strings, so the prerendered fallback and the hydrated DOM read identically.
const VIDEO_COPY: Record<
  Lang,
  {
    metaTitle: string;
    metaDesc: string;
    h1: string;
    intro: string;
    videos: string;
    allVideos: string;
    duration: string;
    upNext: string;
    relatedProducts: string;
    ctaTitle: string;
    ctaDesc: string;
  }
> = {
  en: {
    metaTitle: 'LED Mirror Videos: Product Demos, Factory Tours & Installation | BOLEN',
    metaDesc:
      'Watch BOLEN LED mirror videos: smart mirror product demos, 46,800 m² factory tours, quality-control footage and installation guides from a 21-year OEM/ODM mirror manufacturer.',
    h1: 'LED mirror videos: product demos, factory tours & installation',
    intro:
      'See how BOLEN LED, smart, vanity and bathroom mirrors are built, tested and installed — short clips shot in our own Jiaxing factory that answer sourcing questions before you specify a product.',
    videos: 'Videos',
    allVideos: 'All videos',
    duration: 'Duration',
    upNext: 'Up next',
    relatedProducts: 'Products in this video',
    ctaTitle: 'Seen a mirror you want to specify?',
    ctaDesc:
      'Send us the video or product reference. We reply with OEM/ODM options, MOQ, packaging and lead time — and can film a custom demo of your specification.',
  },
  zh: {
    metaTitle: 'LED 镜视频：产品演示、工厂实拍与安装指南 | BOLEN',
    metaDesc:
      '观看 BOLEN LED 镜视频：智能镜产品演示、46,800 平方米工厂实拍、质检画面与安装指南，来自拥有 21 年经验的 OEM/ODM 镜子制造商。',
    h1: 'LED 镜视频：产品演示、工厂实拍与安装指南',
    intro:
      '了解 BOLEN LED 镜、智能镜、化妆镜与浴室镜如何生产、测试和安装——所有短片均在我们嘉兴自有工厂实拍，在选型前解答您的采购疑问。',
    videos: '视频',
    allVideos: '全部视频',
    duration: '时长',
    upNext: '接下来观看',
    relatedProducts: '视频中的产品',
    ctaTitle: '看到想要选用的镜子了吗？',
    ctaDesc: '把视频或产品参考发给我们，我们将回复 OEM/ODM 选项、MOQ、包装和交期——还可以按您的规格拍摄定制演示。',
  },
  es: {
    metaTitle: 'Videos de espejos LED: demos, recorridos de fábrica e instalación | BOLEN',
    metaDesc:
      'Vea los videos de espejos LED de BOLEN: demostraciones de espejos inteligentes, recorridos por la fábrica de 46.800 m², control de calidad y guías de instalación de un fabricante OEM/ODM con 21 años de experiencia.',
    h1: 'Videos de espejos LED: demos de producto, recorridos de fábrica e instalación',
    intro:
      'Descubra cómo se fabrican, prueban e instalan los espejos LED, inteligentes, de tocador y de baño BOLEN: clips breves grabados en nuestra propia fábrica de Jiaxing que responden a sus dudas de compra antes de especificar un producto.',
    videos: 'Videos',
    allVideos: 'Todos los videos',
    duration: 'Duración',
    upNext: 'A continuación',
    relatedProducts: 'Productos en este video',
    ctaTitle: '¿Ha visto un espejo que quiere especificar?',
    ctaDesc:
      'Envíenos el video o la referencia del producto. Respondemos con opciones OEM/ODM, MOQ, embalaje y plazo de entrega, y podemos grabar una demostración a medida de su especificación.',
  },
  fr: {
    metaTitle: "Vidéos miroirs LED : démos, visites d'usine et installation | BOLEN",
    metaDesc:
      "Regardez les vidéos de miroirs LED BOLEN : démonstrations de miroirs connectés, visites de l'usine de 46 800 m², contrôle qualité et guides d'installation d'un fabricant OEM/ODM depuis 21 ans.",
    h1: "Vidéos miroirs LED : démos produit, visites d'usine et installation",
    intro:
      "Voyez comment les miroirs LED, connectés, de toilette et de salle de bain BOLEN sont fabriqués, testés et installés : de courts clips tournés dans notre propre usine de Jiaxing qui répondent à vos questions d'achat avant de spécifier un produit.",
    videos: 'Vidéos',
    allVideos: 'Toutes les vidéos',
    duration: 'Durée',
    upNext: 'À suivre',
    relatedProducts: 'Produits présentés dans cette vidéo',
    ctaTitle: 'Vous avez repéré un miroir à spécifier ?',
    ctaDesc:
      'Envoyez-nous la vidéo ou la référence produit. Nous répondons avec les options OEM/ODM, le MOQ, l\'emballage et le délai, et pouvons filmer une démonstration sur mesure de votre spécification.',
  },
  de: {
    metaTitle: 'LED-Spiegel Videos: Produktdemos, Werksrundgänge & Installation | BOLEN',
    metaDesc:
      'Sehen Sie BOLEN LED-Spiegel-Videos: Smart-Mirror-Produktdemos, Rundgänge durch das 46.800 m² Werk, Qualitätskontrolle und Installationsanleitungen eines OEM/ODM-Spiegelherstellers mit 21 Jahren Erfahrung.',
    h1: 'LED-Spiegel Videos: Produktdemos, Werksrundgänge & Installation',
    intro:
      'Sehen Sie, wie BOLEN LED-, Smart-, Schmink- und Badspiegel gefertigt, geprüft und montiert werden – kurze Clips aus unserem eigenen Werk in Jiaxing, die Ihre Beschaffungsfragen beantworten, bevor Sie ein Produkt spezifizieren.',
    videos: 'Videos',
    allVideos: 'Alle Videos',
    duration: 'Dauer',
    upNext: 'Als Nächstes',
    relatedProducts: 'Produkte in diesem Video',
    ctaTitle: 'Einen Spiegel gesehen, den Sie spezifizieren möchten?',
    ctaDesc:
      'Senden Sie uns das Video oder die Produktreferenz. Wir antworten mit OEM/ODM-Optionen, MOQ, Verpackung und Lieferzeit – und drehen auf Wunsch eine Demo nach Ihrer Spezifikation.',
  },
  it: {
    metaTitle: 'Video specchi LED: demo prodotto, tour della fabbrica e installazione | BOLEN',
    metaDesc:
      'Guarda i video degli specchi LED BOLEN: demo di specchi smart, tour della fabbrica di 46.800 m², controllo qualità e guide di installazione da un produttore OEM/ODM con 21 anni di esperienza.',
    h1: 'Video specchi LED: demo prodotto, tour della fabbrica e installazione',
    intro:
      'Scopri come gli specchi LED, smart, da toeletta e da bagno BOLEN vengono costruiti, testati e installati: brevi clip girate nella nostra fabbrica di Jiaxing che rispondono alle domande di acquisto prima di specificare un prodotto.',
    videos: 'Video',
    allVideos: 'Tutti i video',
    duration: 'Durata',
    upNext: 'Prossimi video',
    relatedProducts: 'Prodotti in questo video',
    ctaTitle: 'Hai visto uno specchio che vuoi specificare?',
    ctaDesc:
      'Inviaci il video o il riferimento prodotto. Rispondiamo con opzioni OEM/ODM, MOQ, imballaggio e tempi di consegna, e possiamo girare una demo su misura della tua specifica.',
  },
};

function videoCategoryDisplayName(lang: Lang, category: string): string {
  const map = LOCALE_VIDEOS[lang].categories as Record<string, string>;
  return map[category] || category;
}

function getVideoAvailableLanguages(
  video: Pick<VideoPost, 'title' | 'body' | 'excerpt'>
): Lang[] {
  return LANGUAGES.filter((lang) => {
    const title = video.title?.[lang]?.trim();
    const content = video.body?.[lang]?.trim() || video.excerpt?.[lang]?.trim();
    return Boolean(title && content);
  });
}

function hasVideoTranslation(
  video: Pick<VideoPost, 'title' | 'body' | 'excerpt'>,
  lang: Lang
): boolean {
  return getVideoAvailableLanguages(video).includes(lang);
}

function videoMetaLine(video: VideoListItem | LocalizedVideoPost, lang: Lang): string {
  const parts: string[] = [];
  if (video.category) parts.push(`<span>${escapeHtml(videoCategoryDisplayName(lang, video.category))}</span>`);
  if (video.published_at) {
    parts.push(
      `<time datetime="${escapeAttr(video.published_at)}">${escapeHtml(formatBlogDate(video.published_at, lang))}</time>`
    );
  }
  if (video.duration_seconds) {
    parts.push(
      `<time datetime="${escapeAttr(toIsoDuration(video.duration_seconds))}">${escapeHtml(
        formatVideoDuration(video.duration_seconds)
      )}</time>`
    );
  }
  return parts.length ? `<p>${parts.join(' &middot; ')}</p>` : '';
}

async function fetchVideos(): Promise<VideoPost[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[prerender-static] Supabase credentials not set; prerendering without videos.');
    return [];
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const PAGE = 500;
  const all: VideoPost[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) {
      console.warn(`[prerender-static] Could not fetch videos: ${error.message}`);
      return from === 0 ? [] : all;
    }
    const batch = (data || []) as VideoPost[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }
  return all;
}

function videoIndexContent(lang: Lang, items: VideoListItem[]): string {
  const c = VIDEO_COPY[lang];
  const hc = COPY[lang];
  const list = items
    .map((video, index) => {
      const href = `/${lang}/videos/${video.slug}/`;
      const img = video.thumbnail_url
        ? `<img src="${escapeAttr(toMediaPath(video.thumbnail_url))}" alt="${escapeAttr(cleanImageAlt(video.title))}" width="640" height="360" loading="${
            index < 3 ? 'eager' : 'lazy'
          }" />`
        : '';
      return `<li><a href="${escapeAttr(href)}">${img}<h3>${escapeHtml(video.title)}</h3></a>${videoMetaLine(
        video,
        lang
      )}<p>${escapeHtml(video.excerpt)}</p></li>`;
    })
    .join('\n        ');
  return `
    <div data-prerender="videos">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(LOCALE_NAV[lang].home)}</a>
        &raquo;
        <span>${escapeHtml(c.videos)}</span>
      </nav>
      <h1>${escapeHtml(c.h1)}</h1>
      <p>${escapeHtml(c.intro)}</p>
      <h2>${escapeHtml(c.allVideos)}</h2>
      <ul aria-label="${escapeAttr(c.allVideos)}">
        ${list}
      </ul>
      <h2>${escapeHtml(c.ctaTitle)}</h2>
      <p>${escapeHtml(c.ctaDesc)}</p>
      <p><a href="/${lang}/rfq/">${escapeHtml(hc.navRfq)}</a> &middot; <a href="/${lang}/products/">${escapeHtml(
        hc.navCatalog
      )}</a></p>
    </div>
  `.trim();
}

function videoPostContent(
  lang: Lang,
  video: LocalizedVideoPost,
  related: { href: string; title: string; img?: string }[],
  upNext: VideoListItem[]
): string {
  const c = VIDEO_COPY[lang];
  const hc = COPY[lang];
  const playback = getVideoPlayback(video);
  const posterPath = video.thumbnail_url ? toMediaPath(video.thumbnail_url) : '';
  const media =
    playback.kind === 'video'
      ? `<video controls preload="metadata" playsinline${
          posterPath ? ` poster="${escapeAttr(posterPath)}"` : ''
        } src="${escapeAttr(toMediaPath(playback.src))}" width="1280" height="720"></video>`
      : playback.kind === 'embed'
        ? `<iframe loading="lazy" src="${escapeAttr(playback.src)}" title="${escapeAttr(
            cleanImageAlt(video.title)
          )}" width="1280" height="720" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
        : posterPath
          ? `<img src="${escapeAttr(posterPath)}" alt="${escapeAttr(cleanImageAlt(video.title))}" width="1200" height="675" />`
          : '';
  const relatedBlock = related.length
    ? `<section aria-label="${escapeAttr(c.relatedProducts)}">
        <h2>${escapeHtml(c.relatedProducts)}</h2>
        <ul>
          ${related
            .map(
              (r) =>
                `<li><a href="${escapeAttr(r.href)}">${
                  r.img
                    ? `<img src="${escapeAttr(toMediaPath(r.img))}" alt="${escapeAttr(cleanImageAlt(r.title))}" width="200" height="200" loading="lazy" />`
                    : ''
                }${escapeHtml(r.title)}</a></li>`
            )
            .join('\n          ')}
        </ul>
      </section>`
    : '';
  const upNextBlock = upNext.length
    ? `<section aria-label="${escapeAttr(c.upNext)}">
        <h2>${escapeHtml(c.upNext)}</h2>
        <ul>
          ${upNext
            .map(
              (item) =>
                `<li><a href="/${lang}/videos/${escapeAttr(item.slug)}/">${
                  item.thumbnail_url
                    ? `<img src="${escapeAttr(toMediaPath(item.thumbnail_url))}" alt="${escapeAttr(cleanImageAlt(item.title))}" width="320" height="180" loading="lazy" />`
                    : ''
                }${escapeHtml(item.title)}</a>${videoMetaLine(item, lang)}</li>`
            )
            .join('\n          ')}
        </ul>
        <p><a href="/${lang}/videos/">${escapeHtml(c.allVideos)}</a></p>
      </section>`
    : '';
  // Raw DB tags are English-only; render them only on English pages so non-English locales stay clean.
  const tags =
    lang === 'en' && video.tags.length
      ? `<p>${video.tags.map((tag) => escapeHtml(tag)).join(' &middot; ')}</p>`
      : '';
  return `
    <div data-prerender="videoPost">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(LOCALE_NAV[lang].home)}</a>
        &raquo;
        <a href="/${lang}/videos/">${escapeHtml(c.videos)}</a>
        &raquo;
        <span>${escapeHtml(video.title)}</span>
      </nav>
      ${media}
      ${videoMetaLine(video, lang)}
      <h1>${escapeHtml(video.title)}</h1>
      <p>${escapeHtml(video.excerpt)}</p>
      <div>${renderMarkdown(video.body)}</div>
      ${tags}
      ${relatedBlock}
      ${upNextBlock}
      <h2>${escapeHtml(c.ctaTitle)}</h2>
      <p>${escapeHtml(c.ctaDesc)}</p>
      <p><a href="/${lang}/rfq/">${escapeHtml(hc.navRfq)}</a> &middot; <a href="/${lang}/products/">${escapeHtml(
        hc.navCatalog
      )}</a></p>
    </div>
  `.trim();
}

/** og:video for a watch page — the /media/-proxied MP4 for self-hosted clips, the player URL for embeds. */
function videoOgVideo(video: LocalizedVideoPost): { url: string; type: string } | undefined {
  const playback = getVideoPlayback(video);
  if (playback.kind === 'video') {
    return { url: toMediaUrl(playback.src), type: videoMimeType(playback.src) || 'video/mp4' };
  }
  if (playback.kind === 'embed') return { url: playback.src, type: 'text/html' };
  return undefined;
}

async function cleanLegacyAutoRedirects(): Promise<void> {
  const redirectsPath = resolve(DIST, '_redirects');
  try {
    const existing = await readFile(redirectsPath, 'utf-8');
    if (existing.includes('# BEGIN auto-uuid-redirects')) {
      const cleaned = existing
        .replace(/# BEGIN auto-uuid-redirects[\s\S]*?# END auto-uuid-redirects\n*/g, '')
        .replace(/^\n+/, '');
      await writeFile(redirectsPath, cleaned, 'utf-8');
    }
  } catch {
    // dist/_redirects may not exist yet
  }
}

async function main(): Promise<void> {
  console.log('[prerender-static] Reading dist/index.html...');
  const template = await readFile(resolve(DIST, 'index.html'), 'utf-8');

  const privacyModuleSpec = '../src/data/' + 'privacyCopy';
  const privacyMod = (await import(privacyModuleSpec).catch(() => null)) as null | {
    PRIVACY_PATH?: string;
    getPrivacyCopy?: (lang: string) => {
      kicker: string;
      heading: string;
      lastUpdated: string;
      intro: string;
      sections: ReadonlyArray<{ title: string; body: string }>;
      contactHeading: string;
      contactLead: string;
      seo: { title: string; description: string };
    };
    buildPrivacySchema?: (lang: string) => Record<string, unknown>;
  };

  console.log('[prerender-static] Fetching products from Supabase...');
  const products = await fetchAllProducts();
  console.log(`[prerender-static] ${products.length} products loaded.`);

  console.log('[prerender-static] Fetching site settings (hero, categories, factory gallery, featured video)...');
  const { heroBgs, categories, factoryGallery, featuredVideoSlug } = await fetchSiteSettings();
  console.log(`[prerender-static] Factory gallery: ${factoryGallery.length} photo(s).`);

  const heroPrimary = heroBgs[0];
  const heroSize = heroPrimary ? await probeImageSize(heroPrimary) : HERO_DEFAULT_SIZE;
  const supabaseHero: HeroImage | undefined = heroPrimary
    ? { src: optimizeImage(heroPrimary, { width: 1280 }), srcset: buildHeroSrcSet(heroPrimary), width: heroSize.w, height: heroSize.h }
    : undefined;

  const heroSlides: HeroSlide[] = [];
  if (heroBgs.length > 0) {
    const heroDir = resolve(DIST, 'hero');
    await mkdir(heroDir, { recursive: true });
    const results = await Promise.all(
      heroBgs.map(async (url, index): Promise<{ slide: HeroSlide; selfHosted: boolean }> => {
        const base = index === 0 ? 'lcp' : `slide${index + 1}`;
        try {
          const srcsetParts = await Promise.all(
            HERO_WIDTHS.map(async (w) => {
              const res = await fetch(mediaSourceUrl(optimizeImage(url, { width: w })), {
                headers: { Accept: 'image/webp' },
              });
              if (!res.ok) throw new Error(`hero slide ${index + 1} ${w}w -> HTTP ${res.status}`);
              await writeFile(resolve(heroDir, `${base}-${w}.webp`), Buffer.from(await res.arrayBuffer()));
              return `/hero/${base}-${w}.webp ${w}w`;
            })
          );
          return { slide: { src: `/hero/${base}-1280.webp`, srcset: srcsetParts.join(', ') }, selfHosted: true };
        } catch (err) {
          console.warn(`[prerender-static] Hero slide ${index + 1} self-host failed; using Supabase transform URLs.`, err);
          return { slide: { src: optimizeImage(url, { width: 1280 }), srcset: buildHeroSrcSet(url) }, selfHosted: false };
        }
      })
    );
    heroSlides.push(...results.map((r) => r.slide));
    const hosted = results.filter((r) => r.selfHosted).length;
    console.log(`[prerender-static] Self-hosted ${hosted}/${heroBgs.length} hero slide(s) in dist/hero/.`);
  }
  const heroLcp: HeroSlide | undefined = heroSlides[0]?.src.startsWith('/hero/') ? heroSlides[0] : undefined;

  const hero: HeroImage | undefined = heroLcp
    ? { ...heroLcp, width: heroSize.w, height: heroSize.h }
    : supabaseHero;
  const heroPreload = hero
    ? `<link rel="preload" as="image" href="${escapeAttr(hero.src)}" imagesrcset="${escapeAttr(hero.srcset)}" imagesizes="100vw" fetchpriority="high" referrerpolicy="no-referrer" />`
    : '';
  console.log(`[prerender-static] Hero ${heroPrimary ? `${heroSize.w}x${heroSize.h}` : '(none)'} baked into home.`);

  // ProductCard only reads id/title/description/images[0]/category/price_range/msrp;
  // strip details, specifications, seo, and extra gallery URLs from card payloads.
  const lightProducts = products.map(({ details, specifications, seo, images, ...rest }) => ({
    ...rest,
    images: images?.length ? [images[0]] : [],
  }));

  console.log('[prerender-static] Loading product translations (public/i18n)...');
  const translations = await loadProductTranslations();

  console.log('[prerender-static] Fetching published blog posts...');
  const blogPosts = await fetchBlogPosts();
  console.log(`[prerender-static] ${blogPosts.length} blog posts loaded.`);
  console.log('[prerender-static] Fetching published videos...');
  const videos = await fetchVideos();
  console.log(`[prerender-static] ${videos.length} videos loaded.`);

  const featuredVideoPost = featuredVideoSlug ? videos.find((v) => v.slug === featuredVideoSlug) : undefined;
  if (featuredVideoSlug && !featuredVideoPost) {
    console.warn(
      `[prerender-static] home_featured_video "${featuredVideoSlug}" is not a published video; home video section omitted.`
    );
  } else if (featuredVideoPost) {
    console.log(`[prerender-static] Home featured video: ${featuredVideoPost.slug}`);
  }
  const productById = new Map(products.map((p) => [p.id, p]));
  const lightProductById = new Map(lightProducts.map((p) => [p.id, p]));
  for (const lang of LANGUAGES) {
    const n = Object.keys(translations[lang]).length;
    if (n > 0) console.log(`[prerender-static]   ${lang}: ${n} translated products`);
  }

  let routeCount = 0;
  const seenProductSlugs = new Set<string>();
  for (const lang of LANGUAGES) {
    const localizedGallery = localizeFactoryGallery(factoryGallery, lang);
    const localizedVideosForLang = videos.filter((video) => hasVideoTranslation(video, lang));

    // Home
    {
      const canonical = `${SITE_URL}/${lang}/`;
      const featuredVideo =
        featuredVideoPost && hasVideoTranslation(featuredVideoPost, lang)
          ? toFeaturedVideoPayload(featuredVideoPost, lang)
          : undefined;
      const homeProducts = lightProducts.slice(0, 6);
      const dataScript = prerenderDataScript({
        route: 'home',
        lang,
        products: homeProducts,
        heroBgs,
        heroW: heroSize.w,
        heroH: heroSize.h,
        heroLcp,
        heroSlides,
        categories,
        factoryGallery: localizedGallery,
        featuredVideo,
        productTranslations: pickCardTranslations(translations[lang], homeProducts),
      });
      const headExtras = [
        buildHead({
          lang,
          title: LOCALE_SEO[lang].homeTitle,
          description: LOCALE_SEO[lang].homeDesc,
          canonical,
          ogImage: DEFAULT_OG_IMAGE,
          ogType: 'website',
          routePath: '/',
          schema: homeSchema(lang, localizedGallery, featuredVideo),
        }),
        heroPreload,
      ]
        .filter(Boolean)
        .join('\n    ');
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: homeContent(lang, hero, localizedGallery, featuredVideo, categories),
        dataScript,
      });
      await writeRoute(`${lang}`, html);
      routeCount++;
    }

    // Catalog
    {
      const canonical = `${SITE_URL}/${lang}/products/`;
      const catalogProducts = lightProducts;
      const dataScript = prerenderDataScript({
        route: 'catalog',
        lang,
        products: catalogProducts,
        categories,
        productTranslations: pickCardTranslations(translations[lang], catalogProducts),
      });
      const headExtras = buildHead({
        lang,
        title: LOCALE_SEO[lang].catalogTitle,
        description: LOCALE_SEO[lang].catalogDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/products',
        schema: catalogSchema(lang),
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: catalogContent(lang, products, translations[lang], {
          categories,
          description: LOCALE_SEO[lang].catalogDesc,
        }),
        dataScript,
      });
      await writeRoute(`${lang}/products`, html);
      routeCount++;
    }

    for (const { name: categoryName, slug: categorySlug } of uniqueCategorySlugs(categories)) {
      const categoryLabel = categoryDisplayName(lang, categoryName);
      const routePath = `${CATALOG_CATEGORY_PREFIX}/${categorySlug}`;
      const canonical = `${SITE_URL}/${lang}${routePath}/`;
      const title = getCatalogCategorySeoTitle(
        lang,
        categorySlug,
        interpolateTemplate(LOCALE_SEO[lang].categoryTitle, { category: categoryLabel })
      );
      const categoryCopy = getCatalogCategoryPageCopy(lang, categorySlug, {
        h1: categoryLabel,
        description: interpolateTemplate(LOCALE_SEO[lang].categoryDesc, { category: categoryLabel }),
      });
      const description = categoryCopy.description;
      const categoryProducts = products.filter((product) => productMatchesCategory(product.category, categoryName));
      const lightCategoryProducts = lightProducts.filter((product) =>
        productMatchesCategory(product.category, categoryName)
      );
      const ogImage = categoryProducts[0]?.images?.[0] || DEFAULT_OG_IMAGE;
      const dataScript = prerenderDataScript({
        route: 'catalog',
        lang,
        products: lightCategoryProducts,
        categories,
        categorySlug,
        productTranslations: pickCardTranslations(translations[lang], categoryProducts),
      });
      const headExtras = buildHead({
        lang,
        title,
        description,
        canonical,
        ogImage,
        ogType: 'website',
        routePath,
        schema: buildCatalogCategorySchema({
          lang,
          slug: categorySlug,
          name: categoryLabel,
          pageName: categoryCopy.h1,
          description,
          homeLabel: LOCALE_NAV[lang].home,
          catalogLabel: LOCALE_NAV[lang].catalog,
          products: categoryProducts.map((product) => {
            const disp = localizeProduct(product, translations[lang], lang);
            return {
              id: product.id,
              category: product.category,
              title: product.title,
              name: disp.title,
              image: product.images?.[0],
            };
          }),
        }),
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: catalogContent(lang, categoryProducts, translations[lang], {
          categoryName,
          categories,
          heading: categoryCopy.h1,
          description,
        }),
        dataScript,
      });
      await writeRoute(`${lang}${routePath}`, html);
      routeCount++;
    }

    // Buyer-intent solution hub and landing pages in every supported language.
    {
      {
        const routePath = '/solutions';
        const canonical = `${SITE_URL}/${lang}${routePath}/`;
        const ui = getSeoSolutionsUi(lang);
        const headExtras = buildHead({
          lang,
          title: ui.hubTitle,
          description: ui.hubDescription,
          canonical,
          ogImage: FACTORY_OG_IMAGE,
          routePath,
          schema: seoSolutionsSchema(lang),
        });
        const html = injectIntoTemplate(template, {
          lang,
          headExtras,
          bodyContent: seoSolutionsContent(lang),
        });
        await writeRoute(`${lang}/solutions`, html);
        routeCount++;
      }

      for (const page of getLocalizedSeoLandingPages(lang)) {
        const sourcePage = SEO_LANDING_BY_SLUG[page.slug];
        if (!sourcePage) continue;
        const routePath = `/solutions/${page.slug}`;
        const canonical = `${SITE_URL}/${lang}${routePath}/`;
        const landingProducts = products
          .filter((product) => matchesSeoLandingProduct(sourcePage, product))
          .sort((a, b) => scoreSeoLandingProduct(sourcePage, b) - scoreSeoLandingProduct(sourcePage, a))
          .slice(0, 6)
          .map((product) => {
            const localized = localizeProduct(product, translations[lang], lang);
            const fallbackCopy = getSeoLandingProductCardCopy(product, lang);
            const hasTranslation = Boolean(translations[lang][product.id]?.title);
            const { details, specifications, seo, images, ...rest } = product;
            return {
              ...rest,
              images: images?.length ? [images[0]] : [],
              display_title:
                lang === 'en' ? localized.title : hasTranslation ? localized.title : fallbackCopy.title,
              buyer_summary:
                lang === 'en' || hasTranslation
                  ? buildProductBuyerSummary(localized)
                  : fallbackCopy.summary,
            };
          });
        const dataScript = prerenderDataScript({
          route: 'seoLanding',
          lang,
          landingSlug: page.slug,
          products: landingProducts,
          productTranslations: pickCardTranslations(translations[lang], landingProducts),
        });
        const headExtras = buildHead({
          lang,
          title: page.title,
          description: page.description,
          canonical,
          ogImage: landingProducts[0]?.images?.[0] || DEFAULT_OG_IMAGE,
          routePath,
          schema: seoLandingSchema(lang, page),
        });
        const html = injectIntoTemplate(template, {
          lang,
          headExtras,
          bodyContent: seoLandingContent(lang, page, sourcePage, products, translations[lang]),
          dataScript,
        });
        await writeRoute(`${lang}${routePath}`, html);
        routeCount++;
      }
    }

    // Our Story
    {
      const canonical = `${SITE_URL}/${lang}/our-story/`;
      const dataScript = prerenderDataScript({
        route: 'ourStory',
        lang,
        productCount: products.length,
        videoCount: localizedVideosForLang.length,
        factoryGallery: localizedGallery,
      });
      const headExtras = buildHead({
        lang,
        title: LOCALE_SEO[lang].storyTitle,
        description: LOCALE_SEO[lang].storyDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/our-story',
        schema: storySchema(lang),
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: storyContent(lang),
        dataScript,
      });
      await writeRoute(`${lang}/our-story`, html);
      routeCount++;
    }

    // RFQ
    {
      const canonical = `${SITE_URL}/${lang}/rfq/`;
      const headExtras = buildHead({
        lang,
        title: LOCALE_SEO[lang].rfqTitle,
        description: LOCALE_SEO[lang].rfqDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/rfq',
        schema: rfqSchema(lang),
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: rfqContent(lang),
      });
      await writeRoute(`${lang}/rfq`, html);
      routeCount++;
    }

    // Terms and Conditions
    {
      const canonical = `${SITE_URL}/${lang}${TERMS_PATH}/`;
      const termsCopy = getTermsCopy(lang);
      const headExtras = buildHead({
        lang,
        title: termsCopy.seo.title,
        description: termsCopy.seo.description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: TERMS_PATH,
        schema: [buildTermsSchema(lang)],
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: termsContent(lang),
      });
      await writeRoute(`${lang}${TERMS_PATH}`, html);
      routeCount++;
    }

    // Optional Privacy Policy (prerenders all 6 locales automatically once src/data/privacyCopy.ts exists)
    if (
      typeof privacyMod?.PRIVACY_PATH === 'string' &&
      typeof privacyMod.getPrivacyCopy === 'function' &&
      typeof privacyMod.buildPrivacySchema === 'function'
    ) {
      const privacyPath = privacyMod.PRIVACY_PATH;
      const canonical = `${SITE_URL}/${lang}${privacyPath}/`;
      const copy = privacyMod.getPrivacyCopy(lang);
      const headExtras = buildHead({
        lang,
        title: copy.seo.title,
        description: copy.seo.description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: privacyPath,
        schema: [privacyMod.buildPrivacySchema(lang)],
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: privacyContent(lang, copy),
      });
      await writeRoute(`${lang}${privacyPath}`, html);
      routeCount++;
    }

    // Insights index
    {
      const canonical = `${SITE_URL}/${lang}${INSIGHTS_PATH}/`;
      const items = blogPosts
        .filter((post) => hasBlogTranslation(post, lang))
        .map((post) => toListItem(post, lang));
      const bc = BLOG_COPY[lang];
      const dataScript = prerenderDataScript({ route: 'blog', lang, blogPosts: items });
      const headExtras = buildHead({
        lang,
        title: bc.metaTitle,
        description: bc.metaDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: INSIGHTS_PATH,
        schema: buildBlogIndexSchema(lang, {
          name: bc.h1,
          description: bc.metaDesc,
          breadcrumbLabel: bc.journal,
          posts: items,
        }) as any[],
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: blogIndexContent(lang, items),
        dataScript,
      });
      await writeRoute(`${lang}${INSIGHTS_PATH}`, html);
      routeCount++;
    }

    // Videos index (only localized videos)
    {
      const canonical = `${SITE_URL}/${lang}/videos/`;
      const items = localizedVideosForLang.map((video) => {
        const { search_text, ...rest } = toVideoListItem(video, lang);
        return rest;
      });
      const vc = VIDEO_COPY[lang];
      const dataScript = prerenderDataScript({ route: 'videos', lang, videoPosts: items });
      const headExtras = buildHead({
        lang,
        title: vc.metaTitle,
        description: vc.metaDesc,
        canonical,
        ogImage: items[0]?.thumbnail_url || DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/videos',
        schema: buildVideoIndexSchema(lang, items) as any[],
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: videoIndexContent(lang, items),
        dataScript,
      });
      await writeRoute(`${lang}/videos`, html);
      routeCount++;
    }

    // Insight articles. Only render locales with genuine translated title/body.
    for (const rawPost of blogPosts) {
      if (!rawPost.slug || !hasBlogTranslation(rawPost, lang)) continue;
      const localized = localizePost(rawPost, lang);
      const bc = BLOG_COPY[lang];
      const relatedProductModels = localized.product_ids
        .map((pid) => productById.get(pid))
        .filter((p): p is Product => !!p);
      const related = relatedProductModels.map((p) => {
        const disp = localizeProduct(p, translations[lang], lang);
        return { href: `/${lang}${productDetailPath(p, lang)}/`, title: disp.title || p.title, img: p.images?.[0] };
      });
      const relatedProductCards = localized.product_ids
        .map((pid) => lightProductById.get(pid))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
      const relatedArticleCandidates = blogPosts
        .filter(
          (candidate) =>
            candidate.slug !== rawPost.slug &&
            hasBlogTranslation(candidate, lang)
        )
        .sort(
          (a, b) =>
            Number(Boolean(b.category && b.category === rawPost.category)) -
            Number(Boolean(a.category && a.category === rawPost.category))
        )
        .slice(0, 3)
        .map((candidate) => toListItem(candidate, lang));
      const relatedArticles = relatedArticleCandidates.map((item) => ({
        href: `/${lang}${insightDetailPath(item.slug)}/`,
        title: item.title,
        img: item.cover_image,
      }));
      const path = insightDetailPath(localized.slug);
      const canonical = `${SITE_URL}/${lang}${path}/`;
      const title = localized.seo_title || `${localized.title} | BOLEN Mirror Insights`;
      const description = localized.seo_description || localized.excerpt;
      const dataScript = prerenderDataScript({
        route: 'blogPost',
        lang,
        blogPost: localized,
        relatedProducts: relatedProductCards,
        relatedArticles: relatedArticleCandidates,
        productTranslations: pickCardTranslations(translations[lang], relatedProductModels),
      });
      const headExtras = buildHead({
        lang,
        title,
        description,
        canonical,
        ogImage: localized.cover_image || DEFAULT_OG_IMAGE,
        ogType: 'article',
        routePath: path,
        alternateLanguages: getBlogAvailableLanguages(rawPost),
        schema: [
          buildBlogPostingSchema(localized, lang),
          buildBlogBreadcrumbSchema(localized, lang, bc.journal),
        ],
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: blogPostContent(lang, localized, related, relatedArticles),
        dataScript,
      });
      await writeRoute(`${lang}${path}`, html);
      routeCount++;
    }

    // Video details (guarded by hasVideoTranslation)
    for (const rawVideo of videos) {
      if (!rawVideo.slug || !hasVideoTranslation(rawVideo, lang)) continue;
      const localized = localizeVideo(rawVideo, lang);
      const relatedProductModels = recommendProductsForVideo(localized, products, 4);
      const related = relatedProductModels.map((p) => {
        const disp = localizeProduct(p, translations[lang], lang);
        return { href: `/${lang}${productDetailPath(p, lang)}/`, title: disp.title || p.title, img: p.images?.[0] };
      });
      const relatedProductCards = relatedProductModels.map(({ details, specifications, seo, images, ...rest }) => ({
        ...rest,
        images: images?.length ? [images[0]] : [],
      }));
      const upNext = localizedVideosForLang
        .filter((item) => item.slug && item.slug !== rawVideo.slug)
        .map((item) => {
          const { search_text, ...rest } = toVideoListItem(item, lang);
          return rest;
        })
        .sort(
          (a, b) =>
            Number(Boolean(b.category && b.category === localized.category)) -
            Number(Boolean(a.category && a.category === localized.category))
        )
        .slice(0, 4);
      const { search_text: _omittedSearch, ...slimVideoPost } = localized;
      const path = `/videos/${localized.slug}`;
      const canonical = `${SITE_URL}/${lang}${path}/`;
      const title = localized.seo_title || `${localized.title} | BOLEN Mirror Videos`;
      const rawVideoDesc = (localized.seo_description || localized.excerpt || '').trim();
      const description = rawVideoDesc.length >= 15 ? rawVideoDesc : localized.title;
      const dataScript = prerenderDataScript({
        route: 'videoPost',
        lang,
        videoPost: slimVideoPost,
        relatedProducts: relatedProductCards,
        upNext,
        productTranslations: pickCardTranslations(translations[lang], relatedProductModels),
      });
      const headExtras = buildHead({
        lang,
        title,
        description,
        canonical,
        ogImage: localized.thumbnail_url || DEFAULT_OG_IMAGE,
        ogType: 'video.other',
        ogVideo: videoOgVideo(localized),
        routePath: path,
        alternateLanguages: getVideoAvailableLanguages(rawVideo),
        schema: [buildVideoObjectSchema(localized, lang), buildVideoBreadcrumbSchema(localized, lang)],
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: videoPostContent(lang, localized, related, upNext),
        dataScript,
      });
      await writeRoute(`${lang}${path}`, html);
      routeCount++;
    }

    // Product detail pages — title/description/schema shape mirrors ProductDetail.tsx
    // byte-for-byte so Helmet's isEqualNode adoption works on mount.
    for (const product of products) {
      if (!product.id || !product.title) continue;
      const path = productDetailPath(product, lang);
      const slugKey = `${lang}${path}`;
      if (seenProductSlugs.has(slugKey)) {
        console.warn(
          `[prerender-static] Duplicate product URL "${slugKey}" (${product.id}); skipping to avoid overwriting the earlier product.`
        );
        continue;
      }
      seenProductSlugs.add(slugKey);
      const canonical = `${SITE_URL}/${lang}${path}/`;
      const display = localizeProduct(product, translations[lang], lang);
      const seo = productPageSeo(display, lang);
      const { title, description } = seo;
      const productFields = translations[lang][product.id];
      const dataScript = prerenderDataScript({
        route: 'productDetail',
        lang,
        product,
        productTranslations: productFields ? { [product.id]: productFields } : undefined,
      });
      const headExtras = buildHead({
        lang,
        title,
        description,
        canonical,
        ogImage: product.images?.[0] || DEFAULT_OG_IMAGE,
        ogType: 'product',
        routePath: path,
        schema: productDetailSchema(lang, product, display, seo),
        alternatePaths: productAlternatePaths(product),
      });
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: productDetailContent(lang, product, translations[lang], seo),
        dataScript,
      });
      await writeRoute(decodeURI(`${lang}${path}`), html);
      routeCount++;
    }
  }

  // dist/404.html — served by Cloudflare with a real 404 status for any path
  // that has no asset (wrangler.jsonc not_found_handling = "404-page").
  await writeFile(resolve(DIST, '404.html'), notFoundHtml(template), 'utf-8');
  // dist/admin/index.html — the client-only employee portal shell, served with
  // 200 for every /admin path by worker/reliable-entry.ts.
  await writeRoute('admin', adminShellHtml(template));
  // Ensure bare root SPA shell dist/index.html carries noindex, follow if ever hit directly.
  if (!/<meta\b[^>]*name=["']robots["']/i.test(template)) {
    const rootNoindexHtml = template.replace(
      '</head>',
      '    <meta name="robots" content="noindex, follow" />\n  </head>'
    );
    await writeFile(resolve(DIST, 'index.html'), rootNoindexHtml, 'utf-8');
  }
  console.log('[prerender-static] Wrote dist/404.html, dist/admin/index.html, and noindex guard on dist/index.html.');

  await cleanLegacyAutoRedirects();

  console.log(`[prerender-static] Wrote ${routeCount} route files into dist/.`);
}

main().catch((err) => {
  console.error('[prerender-static] Fatal:', err);
  process.exit(1);
});
