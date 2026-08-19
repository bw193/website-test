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
import { localizePost, toListItem } from '../src/utils/blog';
import {
  localizeVideo,
  parseFeaturedVideoSlug,
  recommendProductsForVideo,
  toVideoListItem,
} from '../src/utils/video';
import { optimizeImage } from '../src/utils/optimizeImage';
import {
  buildProductDescription,
  buildProductBuyerSummary,
  buildProductSeoTitle,
  normalizeSpecs,
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
  CATALOG_CATEGORY_PREFIX,
  DEFAULT_PRODUCT_CATEGORIES,
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
  category?: string;
  price_range?: string;
  msrp?: string;
  details?: string;
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
    homeH1: string;
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
    homeH1: 'BOLEN — LED Mirror Manufacturer & OEM Smart Mirror Factory',
    homeIntro:
      'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) operates a 50,000+ sqm facility with 200+ skilled artisans, manufacturing premium LED mirrors, smart mirrors, vanity mirrors, and bathroom mirrors for global brands. Over 20 years of OEM/ODM manufacturing experience.',
    catalogH1: 'Product Catalog',
    catalogIntro:
      'Browse our extensive collection of premium mirrors, featuring smart LED technology, elegant vanity designs, and customizable options.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Our Story',
    storyIntro:
      'Founded in 2005 with roots tracing back to 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combines Italian design inspiration with two decades of manufacturing expertise. A 50,000+ sqm facility, two factories, and 200+ skilled workers produce premium LED, smart, vanity, and bath mirrors for global brands.',
    rfqH1: 'Request a Quote',
    rfqIntro:
      'Contact Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders. Our sales team responds within 24 hours.',
    breadcrumbHome: 'Home',
    breadcrumbCatalog: 'Catalog',
    navHome: 'Home',
    navCatalog: 'Catalog',
    navStory: 'Our Story',
    navRfq: 'Request a Quote',
    detailsHeading: 'Product Details',
    specsHeading: 'Specifications',
    productDescTemplate:
      'Premium {title} by BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — OEM/ODM LED, smart, vanity, and bath mirrors. Request a quote for bulk pricing.',
  },
  zh: {
    homeH1: 'BOLEN — LED 镜制造商 & OEM 智能镜工厂',
    homeIntro:
      '嘉兴诚泰镜业有限公司（BOLEN）拥有 50,000+ 平米厂房和 200+ 名熟练工匠，为全球品牌制造优质 LED 镜、智能镜、化妆镜和浴室镜。20 年以上 OEM/ODM 制造经验。',
    catalogH1: '产品目录',
    catalogIntro: '浏览我们丰富的优质镜面系列，包括智能 LED 技术、优雅的化妆镜设计和可定制选项。',
    productSuffix: '| BOLEN 镜业',
    storyH1: '关于我们',
    storyIntro:
      '成立于 2005 年，历史可追溯至 1995 年，嘉兴诚泰镜业有限公司（BOLEN）将意大利设计灵感与二十年的制造专业相结合。50,000+ 平米厂房、两家工厂、200+ 熟练工人为全球品牌生产优质 LED、智能、化妆和浴室镜。',
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
    homeH1: 'BOLEN — Fabricante de Espejos LED y Fábrica OEM de Espejos Inteligentes',
    homeIntro:
      'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) opera una instalación de 50,000+ m² con más de 200 artesanos calificados, fabricando espejos LED premium, espejos inteligentes, espejos de tocador y espejos de baño para marcas globales. Más de 20 años de experiencia en fabricación OEM/ODM.',
    catalogH1: 'Catálogo de Productos',
    catalogIntro:
      'Explore nuestra extensa colección de espejos premium, con tecnología LED inteligente, elegantes diseños de tocador y opciones personalizables.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Nuestra Historia',
    storyIntro:
      'Fundada en 2005 con raíces que se remontan a 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combina la inspiración del diseño italiano con dos décadas de experiencia en fabricación. Una instalación de más de 50,000 m², dos fábricas y más de 200 trabajadores calificados producen espejos LED, inteligentes, de tocador y de baño premium para marcas globales.',
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
    homeH1: 'BOLEN — Fabricant de Miroirs LED et Usine OEM de Miroirs Intelligents',
    homeIntro:
      "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) exploite une installation de 50 000+ m² avec plus de 200 artisans qualifiés, fabriquant des miroirs LED haut de gamme, des miroirs intelligents, des miroirs de toilette et des miroirs de salle de bain pour les marques mondiales. Plus de 20 ans d'expérience en fabrication OEM/ODM.",
    catalogH1: 'Catalogue de Produits',
    catalogIntro:
      "Parcourez notre vaste collection de miroirs haut de gamme, dotés d'une technologie LED intelligente, de designs élégants et d'options personnalisables.",
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Notre Histoire',
    storyIntro:
      "Fondée en 2005 avec des racines remontant à 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combine l'inspiration du design italien avec deux décennies d'expertise en fabrication. Une installation de plus de 50 000 m², deux usines et plus de 200 ouvriers qualifiés produisent des miroirs LED, intelligents, de toilette et de salle de bain haut de gamme pour les marques mondiales.",
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
    homeH1: 'BOLEN — LED-Spiegelhersteller & OEM-Smart-Spiegel-Fabrik',
    homeIntro:
      'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) betreibt eine Anlage von über 50.000 m² mit mehr als 200 erfahrenen Handwerkern und fertigt hochwertige LED-Spiegel, Smart-Spiegel, Schminkspiegel und Badspiegel für globale Marken. Über 20 Jahre OEM/ODM-Fertigungserfahrung.',
    catalogH1: 'Produktkatalog',
    catalogIntro:
      'Durchsuchen Sie unsere umfangreiche Kollektion hochwertiger Spiegel mit intelligenter LED-Technologie, eleganten Schminkdesigns und anpassbaren Optionen.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'Unsere Geschichte',
    storyIntro:
      'Gegründet 2005 mit Wurzeln bis 1995, kombiniert Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) italienische Designinspiration mit zwei Jahrzehnten Fertigungsexpertise. Eine Anlage von über 50.000 m², zwei Fabriken und mehr als 200 erfahrene Arbeiter produzieren hochwertige LED-, Smart-, Schmink- und Badspiegel für globale Marken.',
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
    homeH1: 'BOLEN — Produttore di Specchi LED e Fabbrica OEM di Specchi Smart',
    homeIntro:
      "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) gestisce un impianto di oltre 50.000 m² con più di 200 artigiani qualificati, producendo specchi LED premium, specchi smart, specchi da toeletta e specchi da bagno per marchi globali. Oltre 20 anni di esperienza nella produzione OEM/ODM.",
    catalogH1: 'Catalogo Prodotti',
    catalogIntro:
      'Sfoglia la nostra vasta collezione di specchi premium, con tecnologia LED intelligente, eleganti design da toeletta e opzioni personalizzabili.',
    productSuffix: '| BOLEN Mirror',
    storyH1: 'La Nostra Storia',
    storyIntro:
      "Fondata nel 2005 con radici che risalgono al 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combina l'ispirazione del design italiano con due decenni di esperienza produttiva. Un impianto di oltre 50.000 m², due fabbriche e oltre 200 operai qualificati producono specchi LED, smart, da toeletta e da bagno premium per marchi globali.",
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
    if (lang === 'en' || lang === 'zh') continue; // en is source; zh stays English
    try {
      const raw = await readFile(resolve(PROJECT_ROOT, 'public', 'i18n', `products.${lang}.json`), 'utf-8');
      out[lang] = JSON.parse(raw) as LangTranslations;
    } catch {
      // no translation file for this language yet
    }
  }
  return out;
}

// Overlay localized copy onto an (English) product. Never touches the title
// used for slugs/URLs — callers always derive those from the original product.
function localizeProduct(product: Product, tr: LangTranslations | undefined): Product {
  const fields = tr?.[product.id];
  if (!fields) return product;
  return {
    ...product,
    title: fields.title || product.title,
    description: (fields.description as string) || product.description,
    details: (fields.details as string) || product.details,
    specifications: fields.specifications ?? product.specifications,
  };
}

// react-helmet-async uses `data-rh="true"` to identify the tags it manages.
// On client mount it diffs existing data-rh tags against what it wants to
// render and only inserts/removes the difference. Without this marker
// Helmet would APPEND its own copies of every SEO tag we prerender,
// causing duplicates (two canonicals, 14 hreflangs, etc).
const RH = 'data-rh="true"';

function hreflangBlock(routePath: string, languages: readonly string[] = LANGUAGES): string {
  // Trailing slash matches Cloudflare Pages directory-style URLs (it serves
  // dist/en/products/index.html as /en/products/). Keeping canonical and
  // hreflang URLs aligned with the served URL avoids Google picking a
  // different canonical and dropping URLs from the index.
  const suffix = routePath === '/' ? '' : routePath;
  return [
    ...languages.map((l) => `<link ${RH} rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${suffix}/" />`),
    ...(languages.includes('en')
      ? [`<link ${RH} rel="alternate" hreflang="x-default" href="${SITE_URL}/en${suffix}/" />`]
      : []),
  ].join('\n    ');
}

// Injected as a non-executing JSON island that Products / ProductDetail
// pick up on first render. Lets the rendered DOM contain product cards /
// detail content immediately, before the Supabase refresh fetch completes.
function prerenderDataScript(payload: unknown): string {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<script id="__BOLEN_PRERENDER_DATA__" type="application/json">${json}</script>`;
}

function ogTwitterBlock(
  canonical: string,
  title: string,
  description: string,
  ogImage: string,
  ogType: string
): string {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const u = escapeAttr(canonical);
  const img = escapeAttr(ogImage);
  return [
    `<meta ${RH} property="og:type" content="${ogType}" />`,
    `<meta ${RH} property="og:url" content="${u}" />`,
    `<meta ${RH} property="og:title" content="${t}" />`,
    `<meta ${RH} property="og:description" content="${d}" />`,
    `<meta ${RH} property="og:image" content="${img}" />`,
    `<meta ${RH} property="og:site_name" content="BOLEN Mirror" />`,
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
  routePath: string;
  schema?: any[];
  alternateLanguages?: readonly string[];
}): string {
  const {
    lang,
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    routePath,
    schema = [],
    alternateLanguages = LANGUAGES,
  } = opts;
  return [
    // <title> is updated by Helmet via document.title (not appended), so it
    // doesn't need a data-rh marker.
    `<title>${escapeHtml(title)}</title>`,
    `<meta ${RH} name="description" content="${escapeAttr(description)}" />`,
    `<link ${RH} rel="canonical" href="${escapeAttr(canonical)}" />`,
    hreflangBlock(routePath, alternateLanguages),
    ogTwitterBlock(canonical, title, description, ogImage, ogType),
    schemaBlock(schema),
  ]
    .filter(Boolean)
    .join('\n    ');
}

function injectIntoTemplate(
  template: string,
  opts: { lang: Lang; headExtras: string; bodyContent: string }
): string {
  let html = template;

  // Set <html lang="...">
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${opts.lang}"`);

  // Remove the template's default <title> so the per-route title is the only one.
  // `[^<]*` keeps the match on one tag — index.html has a block comment that
  // *mentions* `<title>` in prose; a [\s\S]*? lazy match would otherwise jump
  // from that prose into the real `</title>` 18 lines later, wiping the head.
  html = html.replace(/<title>[^<]*<\/title>/, '');

  // Inject head extras immediately before </head>.
  html = html.replace('</head>', `    ${opts.headExtras}\n  </head>`);

  // Put the SEO fallback content directly inside #root. React replaces this
  // on mount, while crawlers, no-JS users, and slow-network visitors see real
  // route content immediately instead of a full-screen loader.
  const rootBlock = `<div id="root">\n      ${opts.bodyContent}\n    </div>`;
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

  // The loader element is gone from prerendered routes (only dist/index.html,
  // the SPA fallback shell, still has it), so its CSS is dead weight here.
  // Swap it for styling that makes the fallback readable: React clears #root on
  // mount via createRoot, but until the entry chunk lands this markup IS the
  // page, and it carries no Tailwind classes.
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
    intro: 'A look inside our 50,000 m² Jiaxing facility — vertically integrated LED, smart, vanity, and bath mirror production from raw glass to packed pallet.',
  },
  zh: {
    heading: '走进我们的工厂',
    intro: '走进我们位于嘉兴的 50,000 平方米生产基地——从原片玻璃到打包出货，垂直整合制造 LED 镜、智能镜、化妆镜与浴室镜。',
  },
  es: {
    heading: 'Dentro de Nuestra Fábrica',
    intro: 'Un recorrido por nuestra planta de 50.000 m² en Jiaxing: producción verticalmente integrada de espejos LED, inteligentes, de tocador y de baño, desde el vidrio crudo hasta el palé listo para enviar.',
  },
  fr: {
    heading: 'À l\'Intérieur de Notre Usine',
    intro: 'Visite de notre site de 50 000 m² à Jiaxing — production verticalement intégrée de miroirs LED, intelligents, de toilette et de salle de bain, du verre brut à la palette prête à expédier.',
  },
  de: {
    heading: 'Einblick in unsere Fabrik',
    intro: 'Ein Blick in unsere 50.000 m² große Produktionsstätte in Jiaxing — vertikal integrierte Fertigung von LED-, Smart-, Schmink- und Badspiegeln, vom Rohglas bis zur versandfertigen Palette.',
  },
  it: {
    heading: 'Dentro la Nostra Fabbrica',
    intro: 'Uno sguardo dentro il nostro stabilimento di 50.000 m² a Jiaxing — produzione verticalmente integrata di specchi LED, smart, da toeletta e da bagno, dal vetro grezzo al pallet pronto per la spedizione.',
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

function featuredVideoBlock(lang: Lang, video?: VideoListItem): string {
  if (!video) return '';
  const c = FEATURED_VIDEO_COPY[lang];
  const href = `/${lang}/videos/${video.slug}/`;
  // Same transform URL FeaturedVideo.tsx requests, so React's <img> on mount
  // hits the already-downloaded image instead of fetching a second derivative.
  // No width/height: the poster's real shape isn't known at build time, and the
  // React frame reserves the box via aspect-ratio.
  const poster = video.thumbnail_url
    ? `<img src="${escapeAttr(optimizeImage(video.thumbnail_url, { width: 960 }))}" alt="${escapeAttr(
        video.title
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
      return `<li><figure><img src="${escapeAttr(optimizeImage(it.url, { width: 800 }))}" srcset="${escapeAttr(srcset)}" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" width="800" height="600" alt="${escapeAttr(it.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />${figcaption}</figure></li>`;
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
  // Bake the LCP hero straight into the static HTML so the browser discovers
  // and fetches it during HTML parse — before any JS runs. React renders a
  // byte-identical <img> on mount, so the painted pixels never change.
  const heroBlock = hero
    ? `<div class="relative bg-stone-900 overflow-hidden">
        <img src="${escapeAttr(hero.src)}" srcset="${escapeAttr(hero.srcset)}" sizes="100vw" width="${hero.width}" height="${hero.height}" alt="BOLEN LED bathroom mirror manufacturing showcase" class="w-full h-auto block" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" />
      </div>
      `
    : '';
  const solutionPages = getLocalizedSeoLandingPages(lang);
  const solutionsUi = getSeoSolutionsUi(lang);
  const solutionLinks = `<section aria-labelledby="manufacturing-solutions-title">
          <h2 id="manufacturing-solutions-title">${escapeHtml(solutionsUi.homeHeading)}</h2>
          <p>${escapeHtml(solutionsUi.homeIntro)}</p>
          <ul>
            ${HOME_SOLUTION_SLUGS.map((slug) => solutionPages.find((page) => page.slug === slug))
              .filter((page): page is SeoLandingPage => Boolean(page))
              .map(
                (page) =>
                  `<li><a href="/${lang}/solutions/${escapeAttr(page.slug)}/"><strong>${escapeHtml(page.shortTitle || page.h1)}</strong></a> — ${escapeHtml(page.blurb || page.description)}</li>`
              ).join('\n            ')}
          </ul>
        </section>`;
  return `
    <div data-prerender="home">
      ${heroBlock}<h1>${escapeHtml(c.homeH1)}</h1>
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
      ${solutionLinks}
      ${featuredVideoBlock(lang, featuredVideo)}
      ${factoryGalleryBlock(lang, gallery)}
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
      const display = localizeProduct(product, tr);
      const fallbackCopy = getSeoLandingProductCardCopy(product, lang);
      const hasTranslation = Boolean(tr[product.id]?.title);
      const displayTitle = lang === 'en' ? display.title : hasTranslation ? display.title : fallbackCopy.title;
      const href = `/${lang}/products/${toSlug(product.title)}/`;
      const image = product.images?.[0]
        ? `<img src="${escapeAttr(product.images[0])}" alt="${escapeAttr(displayTitle)}" width="400" height="400" loading="lazy" />`
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
    .map((candidate) => localizeSeoLandingPage(candidate, lang))
    .map((candidate) => `<li><a href="/${lang}/solutions/${escapeAttr(candidate.slug)}/">${escapeHtml(candidate.shortTitle || candidate.h1)}</a></li>`)
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
  const map = LOCALE_PRODUCTS[lang].categories as Record<string, string>;
  return map[name] || name;
}

function catalogContent(
  lang: Lang,
  products: Product[],
  tr: LangTranslations,
  opts?: { categoryName?: string; categories?: string[] }
): string {
  const c = COPY[lang];
  const categoryName = opts?.categoryName;
  const categoryLabel = categoryName ? categoryDisplayName(lang, categoryName) : '';
  const listed = categoryName
    ? products.filter((p) => productMatchesCategory(p.category, categoryName))
    : products;
  const items = listed
    .map((p) => {
      const slug = toSlug(p.title || ''); // slug from English title
      const href = `/${lang}/products/${slug}/`;
      const title = tr[p.id]?.title || p.title;
      const img = p.images?.[0];
      const imgTag = img
        ? `<img src="${escapeAttr(img)}" alt="${escapeAttr(title)}" width="400" height="400" loading="lazy" />`
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
  const intro = categoryName
    ? interpolateTemplate(LOCALE_PRODUCTS[lang].categoryIntro, { category: categoryLabel })
    : c.catalogIntro;
  return `
    <div data-prerender="catalog">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(c.breadcrumbHome)}</a>
        &raquo;
        ${categoryName
          ? `<a href="/${lang}/products/">${escapeHtml(c.breadcrumbCatalog)}</a> &raquo; <span>${escapeHtml(categoryLabel)}</span>`
          : `<span>${escapeHtml(c.breadcrumbCatalog)}</span>`}
      </nav>
      <h1>${escapeHtml(categoryName ? categoryLabel : c.catalogH1)}</h1>
      <p>${escapeHtml(intro)}</p>
      ${categoryNav}
      <ul aria-label="Products">
        ${items}
      </ul>
    </div>
  `.trim();
}

function productDetailContent(lang: Lang, product: Product, tr: LangTranslations): string {
  const c = COPY[lang];
  const localized = localizeProduct(product, tr);
  const img = product.images?.[0];
  const imgTag = img
    ? `<img src="${escapeAttr(img)}" alt="${escapeAttr(localized.title)}" width="600" height="600" />`
    : '';
  // The `description` column holds model codes ("CTL609"), not prose. Render it
  // as a model number when it is short, and as an actual description only when
  // it is long enough to be one.
  const descText = localized.description?.trim() || '';
  const desc = descText.length >= 30 ? `<p>${escapeHtml(descText.slice(0, 600))}</p>` : '';
  const modelNo = descText.length > 0 && descText.length < 30 ? `<p>${escapeHtml(descText)}</p>` : '';
  const price = product.price_range
    ? `<p><strong>${escapeHtml(product.price_range.startsWith('$') ? product.price_range : `$${product.price_range}`)}</strong></p>`
    : '';

  // `details` is the real marketing copy (and is translated per-language by
  // scripts/translate-products.ts). It was fetched but never rendered, which
  // left every product page under 40 words of crawlable content.
  const details = localized.details?.trim()
    ? `<h2>${escapeHtml(c.detailsHeading)}</h2>\n      ${renderMarkdown(localized.details)}`
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

  return `
    <div data-prerender="product">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(c.breadcrumbHome)}</a>
        &raquo;
        <a href="/${lang}/products/">${escapeHtml(c.breadcrumbCatalog)}</a>
        ${product.category
          ? `&raquo; <a href="/${lang}${CATALOG_CATEGORY_PREFIX}/${toCategorySlug(product.category)}/">${escapeHtml(categoryDisplayName(lang, product.category))}</a>`
          : ''}
        &raquo;
        <span>${escapeHtml(localized.title)}</span>
      </nav>
      <h1>${escapeHtml(localized.title)}</h1>
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
    .map((page) => localizeSeoLandingPage(page, lang))
    .map(
      (page) =>
        `<li><a href="/${lang}/solutions/${escapeAttr(page.slug)}/">${escapeHtml(page.shortTitle || page.h1)}</a></li>`
    )
    .join('\n        ');
  if (!items) return '';
  return `<section><h2>${escapeHtml(ui.relatedSolutions)}</h2><ul>${items}</ul></section>`;
}

function storyContent(lang: Lang): string {
  const c = COPY[lang];
  return `
    <div data-prerender="story">
      <h1>${escapeHtml(c.storyH1)}</h1>
      <p>${escapeHtml(c.storyIntro)}</p>
    </div>
  `.trim();
}

function rfqContent(lang: Lang): string {
  const c = COPY[lang];
  return `
    <div data-prerender="rfq">
      <h1>${escapeHtml(c.rfqH1)}</h1>
      <p>${escapeHtml(c.rfqIntro)}</p>
    </div>
  `.trim();
}

// Schemas
// Schemas below are intentionally byte-compatible with what each page's
// React component emits via <SEO schema={...}>, so that react-helmet-async's
// `isEqualNode` check on mount adopts the prerendered script tags instead of
// removing them and appending a duplicate copy. Mirror the source object
// shapes in:
//   - src/pages/Home.tsx        (Organization, WebSite)
//   - src/pages/Products.tsx    (CollectionPage)
//   - src/pages/ProductDetail.tsx (Product, BreadcrumbList)
//   - src/pages/OurStory.tsx    (AboutPage)
//   - src/pages/RFQ.tsx         (ContactPage)
// Key order matters: JSON.stringify follows insertion order, and `isEqualNode`
// compares serialized script contents.

function homeSchema(lang: Lang, gallery: FactoryGalleryItem[] = [], featuredVideo?: VideoListItem): any[] {
  const base: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
      url: 'https://bolenmirror.com',
      logo: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png',
      description:
        'Leading LED mirror manufacturer specializing in OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors for global brands.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+86-18058603602',
        email: 'bolen2@cnjxctm.com',
        contactType: 'customer service',
        areaServed: 'Worldwide',
        availableLanguage: ['en', 'zh', 'es', 'fr', 'de', 'it'],
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town',
        addressLocality: 'Jiaxing',
        addressRegion: 'Zhejiang',
        addressCountry: 'CN',
      },
      sameAs: [],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'BOLEN Mirror',
      url: 'https://bolenmirror.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://bolenmirror.com/products?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ];
  if (gallery.length > 0) {
    base.push({
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: 'Inside the BOLEN Mirror Factory',
      description:
        'Editor-managed photo set of the Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) production facility — LED, smart, vanity, and bath mirror manufacturing.',
      url: 'https://bolenmirror.com/#factory-showcase',
      image: gallery.map((it) => ({
        '@type': 'ImageObject',
        contentUrl: it.url,
        url: it.url,
        description: it.alt,
        ...(it.caption ? { caption: it.caption } : {}),
      })),
    });
  }
  if (featuredVideo) base.push(buildVideoObjectSchema(featuredVideo, lang));
  return base;
}

function catalogSchema(lang: Lang): any[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'BOLEN LED Mirror Products Catalog',
      description:
        'Explore our wide range of OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors from a leading LED mirror manufacturer.',
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

function seoLandingSchema(lang: Lang, page: SeoLandingPage): any[] {
  const ui = getSeoSolutionsUi(lang);
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
      areaServed: {
        '@type': 'Place',
        name: 'Worldwide',
      },
      audience: {
        '@type': 'BusinessAudience',
        audienceType: 'Importers, distributors, brands, hotel and project buyers',
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
        name: 'BOLEN mirror catalog',
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
function richProductDescription(product: Product, lang: Lang): string {
  return buildProductDescription(product, COPY[lang].productDescTemplate);
}

function productSeoTitle(product: Product, lang: Lang): string {
  return buildProductSeoTitle(product.title, COPY[lang].productSuffix);
}

function productDetailSchema(lang: Lang, product: Product, display: Product): any[] {
  const slug = toSlug(product.title); // slug/URL from English title
  const productFullUrl = `https://bolenmirror.com/${lang}/products/${slug}/`;
  const { low: lowPrice, high: highPrice } = parsePriceRange(product.price_range);
  return [
    {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: display.title,
      image: product.images || [],
      description: richProductDescription(display, lang),
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'BOLEN',
      },
      // Surfaces the same spec table Google sees in the body as structured
      // data. Omitted entirely when a product has no specs — an empty
      // additionalProperty array is worse than none.
      ...(normalizeSpecs(display.specifications).length
        ? {
            additionalProperty: normalizeSpecs(display.specifications).map((s) => ({
              '@type': 'PropertyValue',
              name: s.key,
              value: s.value,
            })),
          }
        : {}),
      offers: {
        '@type': 'AggregateOffer',
        url: productFullUrl,
        priceCurrency: 'USD',
        lowPrice,
        highPrice,
        offerCount: 1,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `https://bolenmirror.com/${lang}/` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `https://bolenmirror.com/${lang}/products/` },
        { '@type': 'ListItem', position: 3, name: display.title, item: productFullUrl },
      ],
    },
  ];
}

function storySchema(lang: Lang): any[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Our Story — BOLEN LED Mirror Manufacturer',
      description:
        'Learn about the history and manufacturing excellence of BOLEN, a leading LED mirror manufacturer since 1995.',
      url: `https://bolenmirror.com/${lang}/our-story/`,
      mainEntity: {
        '@type': 'Organization',
        name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
        foundingDate: '1995',
        url: 'https://bolenmirror.com',
        numberOfEmployees: { '@type': 'QuantitativeValue', value: 200 },
        areaServed: 'Worldwide',
      },
    },
  ];
}

function rfqSchema(lang: Lang): any[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Request for Quote (RFQ) | BOLEN Mirror',
      description:
        'Contact Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders.',
      url: `https://bolenmirror.com/${lang}/rfq/`,
      mainEntity: {
        '@type': 'Organization',
        name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+86-18058603602',
          email: 'bolen2@cnjxctm.com',
          contactType: 'customer service',
          areaServed: 'Worldwide',
          availableLanguage: ['en', 'zh'],
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
      .select('id, title, description, images, category, price_range, msrp, details, specifications')
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
  { metaTitle: string; metaDesc: string; h1: string; intro: string; journal: string }
> = {
  en: {
    metaTitle: 'The BOLEN Journal | LED & Smart Mirror Insights',
    metaDesc:
      'Buying guides, technology explainers, and manufacturing insight on LED mirrors, smart mirrors, and OEM/ODM production from BOLEN.',
    h1: 'The BOLEN Journal',
    intro:
      'Guides, technology, and manufacturing know-how on LED and smart mirrors — written by the team that builds them.',
    journal: 'Journal',
  },
  zh: {
    metaTitle: 'BOLEN 博客 | LED 与智能镜行业洞察',
    metaDesc: '来自 BOLEN 的 LED 镜、智能镜及 OEM/ODM 生产的选购指南、技术解析与制造洞察。',
    h1: 'BOLEN 博客',
    intro: '关于 LED 镜与智能镜的指南、技术与制造知识——由亲手打造它们的团队撰写。',
    journal: '博客',
  },
  es: {
    metaTitle: 'The BOLEN Journal | Perspectivas sobre Espejos LED e Inteligentes',
    metaDesc:
      'Guías de compra, explicaciones técnicas e información sobre fabricación de espejos LED, espejos inteligentes y producción OEM/ODM de BOLEN.',
    h1: 'The BOLEN Journal',
    intro:
      'Guías, tecnología y conocimientos de fabricación sobre espejos LED e inteligentes, escritos por el equipo que los construye.',
    journal: 'Blog',
  },
  fr: {
    metaTitle: 'The BOLEN Journal | Perspectives sur les Miroirs LED et Intelligents',
    metaDesc:
      "Guides d'achat, explications techniques et aperçus de fabrication sur les miroirs LED, les miroirs intelligents et la production OEM/ODM de BOLEN.",
    h1: 'The BOLEN Journal',
    intro:
      "Guides, technologie et savoir-faire de fabrication sur les miroirs LED et intelligents — rédigés par l'équipe qui les fabrique.",
    journal: 'Journal',
  },
  de: {
    metaTitle: 'The BOLEN Journal | Einblicke zu LED- und Smart-Spiegeln',
    metaDesc:
      'Kaufratgeber, Technologie-Erklärungen und Fertigungseinblicke zu LED-Spiegeln, Smart-Spiegeln und OEM/ODM-Produktion von BOLEN.',
    h1: 'The BOLEN Journal',
    intro:
      'Ratgeber, Technologie und Fertigungs-Know-how zu LED- und Smart-Spiegeln — geschrieben vom Team, das sie baut.',
    journal: 'Journal',
  },
  it: {
    metaTitle: 'The BOLEN Journal | Approfondimenti su Specchi LED e Smart',
    metaDesc:
      "Guide all'acquisto, spiegazioni tecniche e approfondimenti sulla produzione di specchi LED, specchi smart e produzione OEM/ODM di BOLEN.",
    h1: 'The BOLEN Journal',
    intro:
      'Guide, tecnologia e know-how produttivo su specchi LED e smart — scritti dal team che li costruisce.',
    journal: 'Journal',
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

function renderMarkdown(md: string): string {
  if (!md) return '';
  return marked.parse(md, { async: false }) as string;
}

function blogIndexContent(lang: Lang, items: BlogListItem[]): string {
  const c = BLOG_COPY[lang];
  const list = items
    .map((p) => {
      const href = `/${lang}/blog/${p.slug}/`;
      const img = p.cover_image
        ? `<img src="${escapeAttr(p.cover_image)}" alt="${escapeAttr(p.title)}" width="600" height="400" loading="lazy" />`
        : '';
      return `<li><a href="${escapeAttr(href)}">${img}<h2>${escapeHtml(p.title)}</h2></a><p>${escapeHtml(
        p.excerpt
      )}</p></li>`;
    })
    .join('\n        ');
  return `
    <div data-prerender="blog">
      <h1>${escapeHtml(c.h1)}</h1>
      <p>${escapeHtml(c.intro)}</p>
      <ul aria-label="Articles">
        ${list}
      </ul>
    </div>
  `.trim();
}

function blogPostContent(
  lang: Lang,
  post: LocalizedBlogPost,
  related: { href: string; title: string; img?: string }[]
): string {
  const c = BLOG_COPY[lang];
  const hc = COPY[lang];
  const img = post.cover_image
    ? `<img src="${escapeAttr(post.cover_image)}" alt="${escapeAttr(post.title)}" width="1200" height="675" />`
    : '';
  const relatedBlock = related.length
    ? `<section aria-label="${escapeAttr(BLOG_RELATED_HEADING[lang])}">
        <h2>${escapeHtml(BLOG_RELATED_HEADING[lang])}</h2>
        <ul>
          ${related
            .map(
              (r) =>
                `<li><a href="${escapeAttr(r.href)}">${
                  r.img
                    ? `<img src="${escapeAttr(r.img)}" alt="${escapeAttr(r.title)}" width="200" height="200" loading="lazy" />`
                    : ''
                }${escapeHtml(r.title)}</a></li>`
            )
            .join('\n          ')}
        </ul>
      </section>`
    : '';
  return `
    <div data-prerender="blogPost">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(hc.breadcrumbHome)}</a>
        &raquo;
        <a href="/${lang}/blog/">${escapeHtml(c.journal)}</a>
        &raquo;
        <span>${escapeHtml(post.title)}</span>
      </nav>
      <h1>${escapeHtml(post.title)}</h1>
      ${img}
      <div>${renderMarkdown(post.body)}</div>
      ${relatedBlock}
      ${relatedSolutionsBlock(lang, {
        title: post.title,
        category: `${post.category || ''} ${post.excerpt || ''}`,
      })}
      <p><a href="/${lang}/products/">${escapeHtml(hc.navCatalog)}</a> &middot; <a href="/${lang}/solutions/">${escapeHtml(
        getSeoSolutionsUi(lang).navLabel
      )}</a> &middot; <a href="/${lang}/rfq/">${escapeHtml(hc.navRfq)}</a></p>
    </div>
  `.trim();
}

// ---- Videos -----------------------------------------------------------------

const VIDEO_COPY: Record<
  Lang,
  { metaTitle: string; metaDesc: string; h1: string; intro: string; videos: string; relatedProducts: string }
> = {
  en: {
    metaTitle: 'BOLEN Mirror Videos | Product Demos & Factory Walkthroughs',
    metaDesc:
      'Watch BOLEN mirror product demos, factory walkthroughs, installation clips, and LED smart mirror feature videos.',
    h1: 'BOLEN Videos',
    intro:
      'See LED mirrors, smart features, factory processes, and installation details before you specify a product.',
    videos: 'Videos',
    relatedProducts: 'Related products',
  },
  zh: {
    metaTitle: 'BOLEN 镜业视频 | 产品演示与工厂实拍',
    metaDesc: '观看 BOLEN 镜子的产品演示、工厂实拍、安装片段以及 LED 智能镜功能视频。',
    h1: 'BOLEN 视频',
    intro: '在选型前，了解 LED 镜、智能功能、工厂流程和安装细节。',
    videos: '视频',
    relatedProducts: '相关产品',
  },
  es: {
    metaTitle: 'Videos de BOLEN Mirror | Demostraciones de producto y recorridos de fábrica',
    metaDesc:
      'Vea demostraciones de productos BOLEN, recorridos de fábrica, clips de instalación y videos de funciones de espejos LED inteligentes.',
    h1: 'Videos de BOLEN',
    intro:
      'Vea espejos LED, funciones inteligentes, procesos de fábrica y detalles de instalación antes de especificar un producto.',
    videos: 'Videos',
    relatedProducts: 'Productos relacionados',
  },
  fr: {
    metaTitle: "Vidéos BOLEN Mirror | Démonstrations produit et visites d'usine",
    metaDesc:
      "Regardez les démonstrations de produits BOLEN, les visites d'usine, les clips d'installation et les vidéos de fonctionnalités des miroirs LED intelligents.",
    h1: 'Vidéos BOLEN',
    intro:
      "Découvrez les miroirs LED, les fonctions intelligentes, les processus d'usine et les détails d'installation avant de choisir un produit.",
    videos: 'Vidéos',
    relatedProducts: 'Produits associés',
  },
  de: {
    metaTitle: 'BOLEN Mirror Videos | Produktdemos und Werksrundgänge',
    metaDesc:
      'Sehen Sie BOLEN Produktdemos, Werksrundgänge, Installationsclips und Funktionsvideos zu LED- und Smart-Spiegeln.',
    h1: 'BOLEN Videos',
    intro:
      'Sehen Sie LED-Spiegel, Smart-Funktionen, Fertigungsprozesse und Installationsdetails, bevor Sie ein Produkt spezifizieren.',
    videos: 'Videos',
    relatedProducts: 'Ähnliche Produkte',
  },
  it: {
    metaTitle: 'Video BOLEN Mirror | Demo prodotto e tour della fabbrica',
    metaDesc:
      'Guarda demo dei prodotti BOLEN, tour della fabbrica, clip di installazione e video sulle funzioni degli specchi LED smart.',
    h1: 'Video BOLEN',
    intro:
      'Scopri specchi LED, funzioni smart, processi di fabbrica e dettagli di installazione prima di specificare un prodotto.',
    videos: 'Video',
    relatedProducts: 'Prodotti correlati',
  },
};

async function fetchVideos(): Promise<VideoPost[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[prerender-static] Supabase credentials not set; prerendering without videos.');
    return [];
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) {
    console.warn(`[prerender-static] Could not fetch videos: ${error.message}`);
    return [];
  }
  return (data || []) as VideoPost[];
}

function videoIndexContent(lang: Lang, items: VideoListItem[]): string {
  const c = VIDEO_COPY[lang];
  const list = items
    .map((video) => {
      const href = `/${lang}/videos/${video.slug}/`;
      const img = video.thumbnail_url
        ? `<img src="${escapeAttr(video.thumbnail_url)}" alt="${escapeAttr(video.title)}" width="640" height="360" loading="lazy" />`
        : '';
      return `<li><a href="${escapeAttr(href)}">${img}<h2>${escapeHtml(video.title)}</h2></a><p>${escapeHtml(
        video.excerpt
      )}</p></li>`;
    })
    .join('\n        ');
  return `
    <div data-prerender="videos">
      <h1>${escapeHtml(c.h1)}</h1>
      <p>${escapeHtml(c.intro)}</p>
      <ul aria-label="Videos">
        ${list}
      </ul>
    </div>
  `.trim();
}

function videoPostContent(
  lang: Lang,
  video: LocalizedVideoPost,
  related: { href: string; title: string; img?: string }[]
): string {
  const c = VIDEO_COPY[lang];
  const hc = COPY[lang];
  const media = video.thumbnail_url
    ? `<img src="${escapeAttr(video.thumbnail_url)}" alt="${escapeAttr(video.title)}" width="1200" height="675" />`
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
                    ? `<img src="${escapeAttr(r.img)}" alt="${escapeAttr(r.title)}" width="200" height="200" loading="lazy" />`
                    : ''
                }${escapeHtml(r.title)}</a></li>`
            )
            .join('\n          ')}
        </ul>
      </section>`
    : '';
  return `
    <div data-prerender="videoPost">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(hc.breadcrumbHome)}</a>
        &raquo;
        <a href="/${lang}/videos/">${escapeHtml(c.videos)}</a>
        &raquo;
        <span>${escapeHtml(video.title)}</span>
      </nav>
      <h1>${escapeHtml(video.title)}</h1>
      ${media}
      <p>${escapeHtml(video.excerpt)}</p>
      <div>${renderMarkdown(video.body)}</div>
      ${relatedBlock}
      <p><a href="/${lang}/products/">${escapeHtml(hc.navCatalog)}</a> &middot; <a href="/${lang}/rfq/">${escapeHtml(
        hc.navRfq
      )}</a></p>
    </div>
  `.trim();
}

async function writeUuidRedirects(products: Product[]): Promise<void> {
  const redirectsPath = resolve(DIST, '_redirects');
  let existing = '';
  try {
    existing = await readFile(redirectsPath, 'utf-8');
  } catch {
    // No existing _redirects (public/_redirects deleted?) — start clean.
  }

  const BEGIN = '# BEGIN auto-uuid-redirects';
  const END = '# END auto-uuid-redirects';
  const staticBody = existing
    .replace(new RegExp(`${BEGIN}[\\s\\S]*?${END}\\n?`, 'g'), '')
    .replace(/^\n+/, '');

  const lines: string[] = [
    BEGIN,
    '# Generated by scripts/prerender-static.ts — 301s for legacy /<slug>-<uuid> product URLs.',
  ];
  let ruleCount = 0;
  for (const product of products) {
    if (!product.id || !product.title) continue;
    const slug = toSlug(product.title);
    if (!slug) continue;

    const pairs: Array<[string, string]> = [];
    pairs.push([`/products/${slug}-${product.id}`, `/en/products/${slug}/`]);
    pairs.push([`/products/${slug}-${product.id}/`, `/en/products/${slug}/`]);
    for (const lang of LANGUAGES) {
      const dest = `/${lang}/products/${slug}/`;
      pairs.push([`/${lang}/products/${slug}-${product.id}`, dest]);
      pairs.push([`/${lang}/products/${slug}-${product.id}/`, dest]);
    }
    for (const [src, dst] of pairs) {
      lines.push(`${src}  ${dst}  301`);
      ruleCount++;
    }
  }
  lines.push(END);

  await writeFile(redirectsPath, `${lines.join('\n')}\n\n${staticBody}`, 'utf-8');
  console.log(`[prerender-static] Wrote ${ruleCount} UUID redirect rules to dist/_redirects.`);
}

async function main(): Promise<void> {
  console.log('[prerender-static] Reading dist/index.html...');
  const template = await readFile(resolve(DIST, 'index.html'), 'utf-8');

  console.log('[prerender-static] Fetching products from Supabase...');
  const products = await fetchAllProducts();
  console.log(`[prerender-static] ${products.length} products loaded.`);

  console.log('[prerender-static] Fetching site settings (hero, categories, factory gallery, featured video)...');
  const { heroBgs, categories, factoryGallery, featuredVideoSlug } = await fetchSiteSettings();
  console.log(`[prerender-static] Factory gallery: ${factoryGallery.length} photo(s).`);

  // Probe the primary (LCP) hero's intrinsic size once, then derive the
  // responsive src/srcset baked into the home HTML, the <head> preload, and the
  // data island consumed by Home.tsx.
  const heroPrimary = heroBgs[0];
  const heroSize = heroPrimary ? await probeImageSize(heroPrimary) : HERO_DEFAULT_SIZE;
  const supabaseHero: HeroImage | undefined = heroPrimary
    ? { src: optimizeImage(heroPrimary, { width: 1280 }), srcset: buildHeroSrcSet(heroPrimary), width: heroSize.w, height: heroSize.h }
    : undefined;

  // Self-host the LCP hero: download each responsive width from Supabase's
  // transform endpoint at build time and write them into dist/hero/. Cloudflare
  // Pages then serves them from its CDN with fast TTFB, instead of the live
  // Supabase /render/image/ endpoint which can take ~2s on a cold transform —
  // that cold TTFB was the dominant remaining mobile-LCP cost. Falls back to the
  // Supabase URLs if the build-time fetch fails, so the build never breaks.
  let heroLcp: { src: string; srcset: string } | undefined;
  if (heroPrimary) {
    try {
      const heroDir = resolve(DIST, 'hero');
      await mkdir(heroDir, { recursive: true });
      const srcsetParts = await Promise.all(
        HERO_WIDTHS.map(async (w) => {
          const res = await fetch(optimizeImage(heroPrimary, { width: w }), { headers: { Accept: 'image/webp' } });
          if (!res.ok) throw new Error(`hero ${w}w -> HTTP ${res.status}`);
          await writeFile(resolve(heroDir, `lcp-${w}.webp`), Buffer.from(await res.arrayBuffer()));
          return `/hero/lcp-${w}.webp ${w}w`;
        })
      );
      heroLcp = { src: '/hero/lcp-1280.webp', srcset: srcsetParts.join(', ') };
      console.log('[prerender-static] Self-hosted hero derivatives written to dist/hero/.');
    } catch (err) {
      console.warn('[prerender-static] Hero self-host failed; using Supabase transform URLs.', err);
    }
  }

  // Prefer the self-hosted set for the baked <img>, the <head> preload, and the
  // data island; fall back to the Supabase transform set.
  const hero: HeroImage | undefined = heroLcp
    ? { ...heroLcp, width: heroSize.w, height: heroSize.h }
    : supabaseHero;
  // `href` is the fallback candidate for browsers that don't support
  // imagesrcset on a preload link — without it they parse the tag, find no URL,
  // and silently drop the LCP preload entirely. Supporting browsers ignore
  // `href` and pick from imagesrcset as normal.
  const heroPreload = hero
    ? `<link rel="preload" as="image" href="${escapeAttr(hero.src)}" imagesrcset="${escapeAttr(hero.srcset)}" imagesizes="100vw" fetchpriority="high" referrerpolicy="no-referrer" />`
    : '';
  console.log(`[prerender-static] Hero ${heroPrimary ? `${heroSize.w}x${heroSize.h}` : '(none)'} baked into home.`);

  // ProductCard only reads id/title/description/images/category/price_range/msrp;
  // strip the heavy details/specifications fields out of the shared product payload.
  const lightProducts = products.map(({ details, specifications, ...rest }) => rest);

  console.log('[prerender-static] Loading product translations (public/i18n)...');
  const translations = await loadProductTranslations();

  console.log('[prerender-static] Fetching published blog posts...');
  const blogPosts = await fetchBlogPosts();
  console.log(`[prerender-static] ${blogPosts.length} blog posts loaded.`);
  console.log('[prerender-static] Fetching published videos...');
  const videos = await fetchVideos();
  console.log(`[prerender-static] ${videos.length} videos loaded.`);

  // Home featured video: resolved from the published set, so unpublishing the
  // chosen video simply drops the section from the next build.
  const featuredVideoPost = featuredVideoSlug ? videos.find((v) => v.slug === featuredVideoSlug) : undefined;
  if (featuredVideoSlug && !featuredVideoPost) {
    console.warn(
      `[prerender-static] home_featured_video "${featuredVideoSlug}" is not a published video; home video section omitted.`
    );
  } else if (featuredVideoPost) {
    console.log(`[prerender-static] Home featured video: ${featuredVideoPost.slug}`);
  }
  const productById = new Map(products.map((p) => [p.id, p]));
  for (const lang of LANGUAGES) {
    const n = Object.keys(translations[lang]).length;
    if (n > 0) console.log(`[prerender-static]   ${lang}: ${n} translated products`);
  }

  let routeCount = 0;
  // Slugs no longer carry the row UUID, so two products with the same title
  // would map to the same file. Guard against silently overwriting one.
  const seenProductSlugs = new Set<string>();
  for (const lang of LANGUAGES) {
    const c = COPY[lang];

    // Home
    {
      const canonical = `${SITE_URL}/${lang}/`;
      const featuredVideo = featuredVideoPost ? toFeaturedVideoPayload(featuredVideoPost, lang) : undefined;
      const dataScript = prerenderDataScript({
        route: 'home',
        lang,
        products: lightProducts,
        heroBgs,
        heroW: heroSize.w,
        heroH: heroSize.h,
        heroLcp,
        categories,
        factoryGallery,
        featuredVideo,
        productTranslations: translations[lang],
      });
      const headExtras = `${buildHead({
        lang,
        title: LOCALE_SEO[lang].homeTitle,
        description: LOCALE_SEO[lang].homeDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/',
        schema: homeSchema(lang, factoryGallery, featuredVideo),
      })}\n    ${heroPreload}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: homeContent(lang, hero, factoryGallery, featuredVideo, categories),
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
        productTranslations: translations[lang],
      });
      const headExtras = `${buildHead({
        lang,
        title: LOCALE_SEO[lang].catalogTitle,
        description: LOCALE_SEO[lang].catalogDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/products',
        schema: catalogSchema(lang),
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: catalogContent(lang, products, translations[lang], { categories }),
      });
      await writeRoute(`${lang}/products`, html);
      routeCount++;
    }

    for (const { name: categoryName, slug: categorySlug } of uniqueCategorySlugs(categories)) {
      const categoryLabel = categoryDisplayName(lang, categoryName);
      const routePath = `${CATALOG_CATEGORY_PREFIX}/${categorySlug}`;
      const canonical = `${SITE_URL}/${lang}${routePath}/`;
      const title = interpolateTemplate(LOCALE_SEO[lang].categoryTitle, { category: categoryLabel });
      const description = interpolateTemplate(LOCALE_SEO[lang].categoryDesc, { category: categoryLabel });
      const ogImage =
        products.find((product) => productMatchesCategory(product.category, categoryName))?.images?.[0] ||
        DEFAULT_OG_IMAGE;
      const dataScript = prerenderDataScript({
        route: 'catalog',
        lang,
        products: lightProducts,
        categories,
        categorySlug,
        productTranslations: translations[lang],
      });
      const headExtras = `${buildHead({
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
          description,
          homeLabel: LOCALE_NAV[lang].home,
          catalogLabel: LOCALE_NAV[lang].catalog,
        }),
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: catalogContent(lang, products, translations[lang], {
          categoryName,
          categories,
        }),
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
            const localized = localizeProduct(product, translations[lang]);
            const fallbackCopy = getSeoLandingProductCardCopy(product, lang);
            const hasTranslation = Boolean(translations[lang][product.id]?.title);
            const { details, specifications, ...rest } = product;
            return {
              ...rest,
              display_title:
                lang === 'en' ? undefined : hasTranslation ? localized.title : fallbackCopy.title,
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
          productTranslations: translations[lang],
        });
        const headExtras = `${buildHead({
          lang,
          title: page.title,
          description: page.description,
          canonical,
          ogImage: landingProducts[0]?.images?.[0] || DEFAULT_OG_IMAGE,
          routePath,
          schema: seoLandingSchema(lang, page),
        })}\n    ${dataScript}`;
        const html = injectIntoTemplate(template, {
          lang,
          headExtras,
          bodyContent: seoLandingContent(lang, page, sourcePage, products, translations[lang]),
        });
        await writeRoute(`${lang}${routePath}`, html);
        routeCount++;
      }
    }

    // Our Story
    {
      const canonical = `${SITE_URL}/${lang}/our-story/`;
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

    // Journal index
    {
      const canonical = `${SITE_URL}/${lang}/blog/`;
      const items = blogPosts.map((p) => toListItem(p, lang));
      const bc = BLOG_COPY[lang];
      const dataScript = prerenderDataScript({ route: 'blog', lang, blogPosts: items });
      const headExtras = `${buildHead({
        lang,
        title: bc.metaTitle,
        description: bc.metaDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/blog',
        schema: buildBlogIndexSchema(lang) as any[],
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: blogIndexContent(lang, items),
      });
      await writeRoute(`${lang}/blog`, html);
      routeCount++;
    }

    // Videos index
    {
      const canonical = `${SITE_URL}/${lang}/videos/`;
      const items = videos.map((video) => toVideoListItem(video, lang));
      const vc = VIDEO_COPY[lang];
      const dataScript = prerenderDataScript({ route: 'videos', lang, videoPosts: items });
      const headExtras = `${buildHead({
        lang,
        title: vc.metaTitle,
        description: vc.metaDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/videos',
        schema: buildVideoIndexSchema(lang) as any[],
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: videoIndexContent(lang, items),
      });
      await writeRoute(`${lang}/videos`, html);
      routeCount++;
    }

    // Journal articles
    for (const rawPost of blogPosts) {
      if (!rawPost.slug) continue;
      const localized = localizePost(rawPost, lang);
      const related = localized.product_ids
        .map((pid) => productById.get(pid))
        .filter((p): p is Product => !!p)
        .map((p) => {
          const disp = localizeProduct(p, translations[lang]);
          return { href: `/${lang}/products/${toSlug(p.title)}/`, title: disp.title || p.title, img: p.images?.[0] };
        });
      const path = `/blog/${localized.slug}`;
      const canonical = `${SITE_URL}/${lang}${path}/`;
      const title = localized.seo_title || `${localized.title} | BOLEN Mirror`;
      const description = localized.seo_description || localized.excerpt;
      const dataScript = prerenderDataScript({ route: 'blogPost', lang, blogPost: localized });
      const headExtras = `${buildHead({
        lang,
        title,
        description,
        canonical,
        ogImage: localized.cover_image || DEFAULT_OG_IMAGE,
        ogType: 'article',
        routePath: path,
        schema: [buildBlogPostingSchema(localized, lang), buildBlogBreadcrumbSchema(localized, lang)],
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: blogPostContent(lang, localized, related),
      });
      await writeRoute(`${lang}${path}`, html);
      routeCount++;
    }

    // Product detail pages — title/description shape mirrors ProductDetail.tsx
    // exactly so Helmet's isEqualNode adoption works on mount.
    // Video details
    for (const rawVideo of videos) {
      if (!rawVideo.slug) continue;
      const localized = localizeVideo(rawVideo, lang);
      const related = recommendProductsForVideo(localized, products, 4).map((p) => {
        const disp = localizeProduct(p, translations[lang]);
        return { href: `/${lang}/products/${toSlug(p.title)}/`, title: disp.title || p.title, img: p.images?.[0] };
      });
      const path = `/videos/${localized.slug}`;
      const canonical = `${SITE_URL}/${lang}${path}/`;
      const title = localized.seo_title || `${localized.title} | BOLEN Mirror Videos`;
      const description = localized.seo_description || localized.excerpt;
      const dataScript = prerenderDataScript({ route: 'videoPost', lang, videoPost: localized });
      const headExtras = `${buildHead({
        lang,
        title,
        description,
        canonical,
        ogImage: localized.thumbnail_url || DEFAULT_OG_IMAGE,
        ogType: 'video.other',
        routePath: path,
        schema: [buildVideoObjectSchema(localized, lang), buildVideoBreadcrumbSchema(localized, lang)],
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: videoPostContent(lang, localized, related),
      });
      await writeRoute(`${lang}${path}`, html);
      routeCount++;
    }

    for (const product of products) {
      if (!product.id || !product.title) continue;
      const slug = toSlug(product.title);
      const slugKey = `${lang}/${slug}`;
      if (seenProductSlugs.has(slugKey)) {
        console.warn(
          `[prerender-static] Duplicate product slug "${slug}" (${product.id}); skipping to avoid overwriting the earlier product.`
        );
        continue;
      }
      seenProductSlugs.add(slugKey);
      const path = `/products/${slug}`; // slug from English title
      const canonical = `${SITE_URL}/${lang}${path}/`;
      const display = localizeProduct(product, translations[lang]);
      const title = productSeoTitle(display, lang);
      const description = richProductDescription(display, lang);
      const productFields = translations[lang][product.id];
      const dataScript = prerenderDataScript({
        route: 'productDetail',
        lang,
        product,
        productTranslations: productFields ? { [product.id]: productFields } : undefined,
      });
      const headExtras = `${buildHead({
        lang,
        title,
        description,
        canonical,
        ogImage: product.images?.[0] || DEFAULT_OG_IMAGE,
        ogType: 'product',
        routePath: path,
        schema: productDetailSchema(lang, product, display),
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: productDetailContent(lang, product, translations[lang]),
      });
      await writeRoute(`${lang}${path}`, html);
      routeCount++;
    }
  }

  await writeUuidRedirects(products);

  console.log(`[prerender-static] Wrote ${routeCount} route files into dist/.`);
}

main().catch((err) => {
  console.error('[prerender-static] Fatal:', err);
  process.exit(1);
});
