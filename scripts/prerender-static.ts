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
  buildBlogIndexSchema,
  buildBlogPostingSchema,
  buildBlogBreadcrumbSchema,
} from '../src/utils/blogSchema';
import type { BlogPost, BlogListItem, LocalizedBlogPost } from '../src/types/blog';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DIST = resolve(PROJECT_ROOT, 'dist');

const SITE_URL = 'https://bolenmirror.com';
const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
type Lang = (typeof LANGUAGES)[number];

const DEFAULT_OG_IMAGE =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

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
}

// Per-language copy. Kept in this file (not src/locales) so the prerender
// stays a single self-contained Node script. The visible React app continues
// to use src/locales via react-i18next at runtime.
const COPY: Record<
  Lang,
  {
    homeTitle: string;
    homeDesc: string;
    homeH1: string;
    homeIntro: string;
    catalogTitle: string;
    catalogDesc: string;
    catalogH1: string;
    catalogIntro: string;
    productSuffix: string;
    storyTitle: string;
    storyDesc: string;
    storyH1: string;
    storyIntro: string;
    rfqTitle: string;
    rfqDesc: string;
    rfqH1: string;
    rfqIntro: string;
    breadcrumbHome: string;
    breadcrumbCatalog: string;
    navHome: string;
    navCatalog: string;
    navStory: string;
    navRfq: string;
  }
> = {
  en: {
    homeTitle: 'BOLEN Mirror | LED Mirror Manufacturer & OEM Smart Mirror Factory',
    homeDesc:
      'BOLEN Mirror is a leading LED mirror manufacturer specializing in OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors for global brands.',
    homeH1: 'BOLEN — LED Mirror Manufacturer & OEM Smart Mirror Factory',
    homeIntro:
      'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) operates a 50,000+ sqm facility with 200+ skilled artisans, manufacturing premium LED mirrors, smart mirrors, vanity mirrors, and bathroom mirrors for global brands. Over 20 years of OEM/ODM manufacturing experience.',
    catalogTitle: 'LED Mirror Products Catalog | BOLEN Mirror Manufacturer',
    catalogDesc:
      'Explore our wide range of OEM LED mirrors, smart mirrors, vanity mirrors, and bath mirrors from a leading LED mirror manufacturer. High-quality manufacturing for global brands.',
    catalogH1: 'Product Catalog',
    catalogIntro:
      'Browse our extensive collection of premium mirrors, featuring smart LED technology, elegant vanity designs, and customizable options.',
    productSuffix: '| BOLEN Mirror',
    storyTitle: 'Our Story | BOLEN LED Mirror Manufacturer',
    storyDesc:
      'Learn about the history and manufacturing excellence of BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), a leading LED mirror manufacturer since 1995 specializing in OEM smart mirrors.',
    storyH1: 'Our Story',
    storyIntro:
      'Founded in 2005 with roots tracing back to 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combines Italian design inspiration with two decades of manufacturing expertise. A 50,000+ sqm facility, two factories, and 200+ skilled workers produce premium LED, smart, vanity, and bath mirrors for global brands.',
    rfqTitle: 'Request for Quote | BOLEN LED Mirror Manufacturer',
    rfqDesc:
      'Contact BOLEN, a leading LED mirror manufacturer, for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders.',
    rfqH1: 'Request a Quote',
    rfqIntro:
      'Contact Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) for OEM/ODM inquiries, custom mirror manufacturing, and bulk orders. Our sales team responds within 24 hours.',
    breadcrumbHome: 'Home',
    breadcrumbCatalog: 'Catalog',
    navHome: 'Home',
    navCatalog: 'Catalog',
    navStory: 'Our Story',
    navRfq: 'Request a Quote',
  },
  zh: {
    homeTitle: 'BOLEN 镜业 | LED 智能镜制造商 & OEM 镜子工厂',
    homeDesc:
      'BOLEN Mirror 是领先的 LED 镜制造商，专业生产 OEM LED 镜、智能镜、化妆镜和浴室镜，服务全球品牌。',
    homeH1: 'BOLEN — LED 镜制造商 & OEM 智能镜工厂',
    homeIntro:
      '嘉兴诚泰镜业有限公司（BOLEN）拥有 50,000+ 平米厂房和 200+ 名熟练工匠，为全球品牌制造优质 LED 镜、智能镜、化妆镜和浴室镜。20 年以上 OEM/ODM 制造经验。',
    catalogTitle: 'LED 镜产品目录 | BOLEN 镜业制造商',
    catalogDesc:
      '探索我们丰富的 OEM LED 镜、智能镜、化妆镜和浴室镜产品系列，来自领先的 LED 镜制造商，为全球品牌提供优质制造。',
    catalogH1: '产品目录',
    catalogIntro: '浏览我们丰富的优质镜面系列，包括智能 LED 技术、优雅的化妆镜设计和可定制选项。',
    productSuffix: '| BOLEN 镜业',
    storyTitle: '关于我们 | BOLEN LED 镜业制造商',
    storyDesc:
      '了解 BOLEN（嘉兴诚泰镜业有限公司）的历史和卓越制造，自 1995 年以来领先的 LED 镜制造商，专业生产 OEM 智能镜。',
    storyH1: '关于我们',
    storyIntro:
      '成立于 2005 年，历史可追溯至 1995 年，嘉兴诚泰镜业有限公司（BOLEN）将意大利设计灵感与二十年的制造专业相结合。50,000+ 平米厂房、两家工厂、200+ 熟练工人为全球品牌生产优质 LED、智能、化妆和浴室镜。',
    rfqTitle: '询价 | BOLEN LED 镜业制造商',
    rfqDesc: '联系领先的 LED 镜制造商 BOLEN，获取 OEM/ODM 询价、定制镜子制造和批量订单。',
    rfqH1: '请求报价',
    rfqIntro: '联系嘉兴诚泰镜业有限公司（BOLEN）获取 OEM/ODM 询价、定制镜子制造和批量订单。我们的销售团队 24 小时内回复。',
    breadcrumbHome: '首页',
    breadcrumbCatalog: '目录',
    navHome: '首页',
    navCatalog: '目录',
    navStory: '关于我们',
    navRfq: '询价',
  },
  es: {
    homeTitle: 'BOLEN Mirror | Fabricante de Espejos LED y Fábrica OEM de Espejos Inteligentes',
    homeDesc:
      'BOLEN Mirror es un fabricante líder de espejos LED especializado en espejos LED OEM, espejos inteligentes, espejos de tocador y espejos de baño para marcas globales.',
    homeH1: 'BOLEN — Fabricante de Espejos LED y Fábrica OEM de Espejos Inteligentes',
    homeIntro:
      'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) opera una instalación de 50,000+ m² con más de 200 artesanos calificados, fabricando espejos LED premium, espejos inteligentes, espejos de tocador y espejos de baño para marcas globales. Más de 20 años de experiencia en fabricación OEM/ODM.',
    catalogTitle: 'Catálogo de Productos de Espejos LED | Fabricante BOLEN Mirror',
    catalogDesc:
      'Explore nuestra amplia gama de espejos LED OEM, espejos inteligentes, espejos de tocador y espejos de baño de un fabricante líder de espejos LED. Fabricación de alta calidad para marcas globales.',
    catalogH1: 'Catálogo de Productos',
    catalogIntro:
      'Explore nuestra extensa colección de espejos premium, con tecnología LED inteligente, elegantes diseños de tocador y opciones personalizables.',
    productSuffix: '| BOLEN Mirror',
    storyTitle: 'Nuestra Historia | Fabricante de Espejos LED BOLEN',
    storyDesc:
      'Conozca la historia y la excelencia en fabricación de BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), un fabricante líder de espejos LED desde 1995 especializado en espejos inteligentes OEM.',
    storyH1: 'Nuestra Historia',
    storyIntro:
      'Fundada en 2005 con raíces que se remontan a 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combina la inspiración del diseño italiano con dos décadas de experiencia en fabricación. Una instalación de más de 50,000 m², dos fábricas y más de 200 trabajadores calificados producen espejos LED, inteligentes, de tocador y de baño premium para marcas globales.',
    rfqTitle: 'Solicitud de Cotización | Fabricante de Espejos LED BOLEN',
    rfqDesc:
      'Contacte a BOLEN, un fabricante líder de espejos LED, para consultas OEM/ODM, fabricación de espejos personalizados y pedidos al por mayor.',
    rfqH1: 'Solicitar Cotización',
    rfqIntro:
      'Contacte a Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) para consultas OEM/ODM, fabricación de espejos personalizados y pedidos al por mayor. Nuestro equipo de ventas responde en 24 horas.',
    breadcrumbHome: 'Inicio',
    breadcrumbCatalog: 'Catálogo',
    navHome: 'Inicio',
    navCatalog: 'Catálogo',
    navStory: 'Nuestra Historia',
    navRfq: 'Solicitar Cotización',
  },
  fr: {
    homeTitle: 'BOLEN Mirror | Fabricant de Miroirs LED et Usine OEM de Miroirs Intelligents',
    homeDesc:
      "BOLEN Mirror est un fabricant leader de miroirs LED spécialisé dans les miroirs LED OEM, les miroirs intelligents, les miroirs de toilette et les miroirs de salle de bain pour les marques mondiales.",
    homeH1: 'BOLEN — Fabricant de Miroirs LED et Usine OEM de Miroirs Intelligents',
    homeIntro:
      "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) exploite une installation de 50 000+ m² avec plus de 200 artisans qualifiés, fabriquant des miroirs LED haut de gamme, des miroirs intelligents, des miroirs de toilette et des miroirs de salle de bain pour les marques mondiales. Plus de 20 ans d'expérience en fabrication OEM/ODM.",
    catalogTitle: 'Catalogue de Produits Miroirs LED | Fabricant BOLEN Mirror',
    catalogDesc:
      "Explorez notre large gamme de miroirs LED OEM, miroirs intelligents, miroirs de toilette et miroirs de salle de bain d'un fabricant leader de miroirs LED. Fabrication de haute qualité pour les marques mondiales.",
    catalogH1: 'Catalogue de Produits',
    catalogIntro:
      "Parcourez notre vaste collection de miroirs haut de gamme, dotés d'une technologie LED intelligente, de designs élégants et d'options personnalisables.",
    productSuffix: '| BOLEN Mirror',
    storyTitle: 'Notre Histoire | Fabricant de Miroirs LED BOLEN',
    storyDesc:
      "Découvrez l'histoire et l'excellence de fabrication de BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), un fabricant leader de miroirs LED depuis 1995 spécialisé dans les miroirs intelligents OEM.",
    storyH1: 'Notre Histoire',
    storyIntro:
      "Fondée en 2005 avec des racines remontant à 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combine l'inspiration du design italien avec deux décennies d'expertise en fabrication. Une installation de plus de 50 000 m², deux usines et plus de 200 ouvriers qualifiés produisent des miroirs LED, intelligents, de toilette et de salle de bain haut de gamme pour les marques mondiales.",
    rfqTitle: 'Demande de Devis | Fabricant de Miroirs LED BOLEN',
    rfqDesc:
      'Contactez BOLEN, un fabricant leader de miroirs LED, pour les demandes OEM/ODM, la fabrication de miroirs personnalisés et les commandes en gros.',
    rfqH1: 'Demande de Devis',
    rfqIntro:
      "Contactez Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) pour les demandes OEM/ODM, la fabrication de miroirs personnalisés et les commandes en gros. Notre équipe commerciale répond sous 24 heures.",
    breadcrumbHome: 'Accueil',
    breadcrumbCatalog: 'Catalogue',
    navHome: 'Accueil',
    navCatalog: 'Catalogue',
    navStory: 'Notre Histoire',
    navRfq: 'Demande de Devis',
  },
  de: {
    homeTitle: 'BOLEN Mirror | LED-Spiegelhersteller & OEM-Smart-Spiegel-Fabrik',
    homeDesc:
      'BOLEN Mirror ist ein führender LED-Spiegelhersteller, spezialisiert auf OEM-LED-Spiegel, Smart-Spiegel, Schminkspiegel und Badspiegel für globale Marken.',
    homeH1: 'BOLEN — LED-Spiegelhersteller & OEM-Smart-Spiegel-Fabrik',
    homeIntro:
      'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) betreibt eine Anlage von über 50.000 m² mit mehr als 200 erfahrenen Handwerkern und fertigt hochwertige LED-Spiegel, Smart-Spiegel, Schminkspiegel und Badspiegel für globale Marken. Über 20 Jahre OEM/ODM-Fertigungserfahrung.',
    catalogTitle: 'LED-Spiegel Produktkatalog | BOLEN Mirror Hersteller',
    catalogDesc:
      'Entdecken Sie unser umfangreiches Sortiment an OEM-LED-Spiegeln, Smart-Spiegeln, Schminkspiegeln und Badspiegeln von einem führenden LED-Spiegelhersteller. Hochwertige Fertigung für globale Marken.',
    catalogH1: 'Produktkatalog',
    catalogIntro:
      'Durchsuchen Sie unsere umfangreiche Kollektion hochwertiger Spiegel mit intelligenter LED-Technologie, eleganten Schminkdesigns und anpassbaren Optionen.',
    productSuffix: '| BOLEN Mirror',
    storyTitle: 'Unsere Geschichte | BOLEN LED-Spiegelhersteller',
    storyDesc:
      'Erfahren Sie mehr über die Geschichte und Fertigungsexzellenz von BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), einem führenden LED-Spiegelhersteller seit 1995, der sich auf OEM-Smart-Spiegel spezialisiert hat.',
    storyH1: 'Unsere Geschichte',
    storyIntro:
      'Gegründet 2005 mit Wurzeln bis 1995, kombiniert Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) italienische Designinspiration mit zwei Jahrzehnten Fertigungsexpertise. Eine Anlage von über 50.000 m², zwei Fabriken und mehr als 200 erfahrene Arbeiter produzieren hochwertige LED-, Smart-, Schmink- und Badspiegel für globale Marken.',
    rfqTitle: 'Angebotsanfrage | BOLEN LED-Spiegelhersteller',
    rfqDesc:
      'Kontaktieren Sie BOLEN, einen führenden LED-Spiegelhersteller, für OEM/ODM-Anfragen, kundenspezifische Spiegelherstellung und Großbestellungen.',
    rfqH1: 'Angebotsanfrage',
    rfqIntro:
      'Kontaktieren Sie Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) für OEM/ODM-Anfragen, kundenspezifische Spiegelherstellung und Großbestellungen. Unser Vertriebsteam antwortet innerhalb von 24 Stunden.',
    breadcrumbHome: 'Startseite',
    breadcrumbCatalog: 'Katalog',
    navHome: 'Startseite',
    navCatalog: 'Katalog',
    navStory: 'Unsere Geschichte',
    navRfq: 'Angebotsanfrage',
  },
  it: {
    homeTitle: 'BOLEN Mirror | Produttore di Specchi LED e Fabbrica OEM di Specchi Smart',
    homeDesc:
      'BOLEN Mirror è un produttore leader di specchi LED specializzato in specchi LED OEM, specchi smart, specchi da toeletta e specchi da bagno per marchi globali.',
    homeH1: 'BOLEN — Produttore di Specchi LED e Fabbrica OEM di Specchi Smart',
    homeIntro:
      "Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) gestisce un impianto di oltre 50.000 m² con più di 200 artigiani qualificati, producendo specchi LED premium, specchi smart, specchi da toeletta e specchi da bagno per marchi globali. Oltre 20 anni di esperienza nella produzione OEM/ODM.",
    catalogTitle: 'Catalogo Prodotti Specchi LED | Produttore BOLEN Mirror',
    catalogDesc:
      'Esplora la nostra ampia gamma di specchi LED OEM, specchi smart, specchi da toeletta e specchi da bagno da un produttore leader di specchi LED. Produzione di alta qualità per marchi globali.',
    catalogH1: 'Catalogo Prodotti',
    catalogIntro:
      'Sfoglia la nostra vasta collezione di specchi premium, con tecnologia LED intelligente, eleganti design da toeletta e opzioni personalizzabili.',
    productSuffix: '| BOLEN Mirror',
    storyTitle: 'La Nostra Storia | Produttore di Specchi LED BOLEN',
    storyDesc:
      "Scopri la storia e l'eccellenza produttiva di BOLEN (Jiaxing Chengtai Mirror Co., Ltd.), un produttore leader di specchi LED dal 1995 specializzato in specchi smart OEM.",
    storyH1: 'La Nostra Storia',
    storyIntro:
      "Fondata nel 2005 con radici che risalgono al 1995, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) combina l'ispirazione del design italiano con due decenni di esperienza produttiva. Un impianto di oltre 50.000 m², due fabbriche e oltre 200 operai qualificati producono specchi LED, smart, da toeletta e da bagno premium per marchi globali.",
    rfqTitle: 'Richiesta di Preventivo | Produttore di Specchi LED BOLEN',
    rfqDesc:
      'Contatta BOLEN, un produttore leader di specchi LED, per richieste OEM/ODM, produzione personalizzata di specchi e ordini all\'ingrosso.',
    rfqH1: 'Richiedi un Preventivo',
    rfqIntro:
      "Contatta Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) per richieste OEM/ODM, produzione personalizzata di specchi e ordini all'ingrosso. Il nostro team commerciale risponde entro 24 ore.",
    breadcrumbHome: 'Home',
    breadcrumbCatalog: 'Catalogo',
    navHome: 'Home',
    navCatalog: 'Catalogo',
    navStory: 'La Nostra Storia',
    navRfq: 'Richiedi un Preventivo',
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

function hreflangBlock(routePath: string): string {
  // Trailing slash matches Cloudflare Pages directory-style URLs (it serves
  // dist/en/products/index.html as /en/products/). Keeping canonical and
  // hreflang URLs aligned with the served URL avoids Google picking a
  // different canonical and dropping URLs from the index.
  const suffix = routePath === '/' ? '' : routePath;
  return [
    ...LANGUAGES.map((l) => `<link ${RH} rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${suffix}/" />`),
    `<link ${RH} rel="alternate" hreflang="x-default" href="${SITE_URL}/en${suffix}/" />`,
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
}): string {
  const { lang, title, description, canonical, ogImage, ogType = 'website', routePath, schema = [] } = opts;
  return [
    // <title> is updated by Helmet via document.title (not appended), so it
    // doesn't need a data-rh marker.
    `<title>${escapeHtml(title)}</title>`,
    `<meta ${RH} name="description" content="${escapeAttr(description)}" />`,
    `<link ${RH} rel="canonical" href="${escapeAttr(canonical)}" />`,
    hreflangBlock(routePath),
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

  return html;
}

// Markup helpers
function homeContent(lang: Lang): string {
  const c = COPY[lang];
  return `
    <div data-prerender="home">
      <h1>${escapeHtml(c.homeH1)}</h1>
      <p>${escapeHtml(c.homeIntro)}</p>
      <nav aria-label="Site sections">
        <a href="/${lang}/products/">${escapeHtml(c.navCatalog)}</a>
        <a href="/${lang}/our-story/">${escapeHtml(c.navStory)}</a>
        <a href="/${lang}/rfq/">${escapeHtml(c.navRfq)}</a>
      </nav>
    </div>
  `.trim();
}

function catalogContent(lang: Lang, products: Product[], tr: LangTranslations): string {
  const c = COPY[lang];
  const items = products
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
  return `
    <div data-prerender="catalog">
      <h1>${escapeHtml(c.catalogH1)}</h1>
      <p>${escapeHtml(c.catalogIntro)}</p>
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
  const desc = localized.description ? `<p>${escapeHtml(localized.description.slice(0, 600))}</p>` : '';
  const price = product.price_range
    ? `<p><strong>${escapeHtml(product.price_range.startsWith('$') ? product.price_range : `$${product.price_range}`)}</strong></p>`
    : '';
  return `
    <div data-prerender="product">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${escapeHtml(c.breadcrumbHome)}</a>
        &raquo;
        <a href="/${lang}/products/">${escapeHtml(c.breadcrumbCatalog)}</a>
        &raquo;
        <span>${escapeHtml(localized.title)}</span>
      </nav>
      <h1>${escapeHtml(localized.title)}</h1>
      ${imgTag}
      ${desc}
      ${price}
      <p><a href="/${lang}/rfq/">${escapeHtml(c.navRfq)}</a></p>
    </div>
  `.trim();
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

function homeSchema(): any[] {
  return [
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

// Mirrors src/pages/ProductDetail.tsx's parsePriceRange. Keep both in lockstep
// so the prerendered JSON-LD matches Helmet's render and avoids duplicates.
function parsePriceRange(range?: string): { low: number; high: number } {
  const nums = range?.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (nums.length === 0) return { low: 0, high: 0 };
  if (nums.length === 1) return { low: nums[0], high: nums[0] };
  return { low: Math.min(...nums), high: Math.max(...nums) };
}

// Mirrors src/pages/ProductDetail.tsx's richDescription / seoTitle helpers.
function richProductDescription(product: Product): string {
  if (product.description && product.description.trim().length >= 30) {
    return product.description;
  }
  return `Premium ${product.title} by BOLEN Mirror (Jiaxing Chengtai Mirror Co., Ltd.) — OEM/ODM LED, smart, vanity, and bath mirrors. Request a quote for bulk pricing.`;
}

function productSeoTitle(product: Product): string {
  return product.title.length > 55 ? product.title : `${product.title} | BOLEN Mirror`;
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
      description: richProductDescription(display),
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'BOLEN',
      },
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
  const { data, error } = await supabase
    .from('products')
    .select('id, title, description, images, category, price_range, msrp, details, specifications')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn(`[prerender-static] Could not fetch products: ${error.message}`);
    return [];
  }
  return (data || []) as Product[];
}

// Defaults mirror Home.tsx so the home data island always has a populated payload
// even when site_settings is empty or unreachable.
const DEFAULT_HERO_BGS = [
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg',
];
const DEFAULT_CATEGORIES = [
  'New Arrival',
  'Hot Sale',
  'Led Lighted Mirror',
  'Bathroom Mirror without led',
  'Full Length Dressing Mirror',
  'Irregular Mirror',
];

async function fetchSiteSettings(): Promise<{ heroBgs: string[]; categories: string[] }> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return { heroBgs: DEFAULT_HERO_BGS, categories: DEFAULT_CATEGORIES };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let heroBgs: string[] = DEFAULT_HERO_BGS;
  let categories: string[] = DEFAULT_CATEGORIES;

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
      try {
        const parsed = JSON.parse(catData.value);
        if (Array.isArray(parsed) && parsed.length > 0) categories = parsed;
      } catch {
        // ignore — fall back to defaults
      }
    }
  } catch (err) {
    console.warn('[prerender-static] categories fetch failed; using default.', err);
  }

  return { heroBgs, categories };
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

  console.log('[prerender-static] Fetching site settings (hero, categories)...');
  const { heroBgs, categories } = await fetchSiteSettings();

  // ProductCard only reads id/title/description/images/category/price_range/msrp;
  // strip the heavy details/specifications fields out of the shared product payload.
  const lightProducts = products.map(({ details, specifications, ...rest }) => rest);

  console.log('[prerender-static] Loading product translations (public/i18n)...');
  const translations = await loadProductTranslations();

  console.log('[prerender-static] Fetching published blog posts...');
  const blogPosts = await fetchBlogPosts();
  console.log(`[prerender-static] ${blogPosts.length} blog posts loaded.`);
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
      const dataScript = prerenderDataScript({
        route: 'home',
        lang,
        products: lightProducts,
        heroBgs,
        categories,
        productTranslations: translations[lang],
      });
      const headExtras = `${buildHead({
        lang,
        title: c.homeTitle,
        description: c.homeDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/',
        schema: homeSchema(),
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: homeContent(lang),
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
        title: c.catalogTitle,
        description: c.catalogDesc,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        routePath: '/products',
        schema: catalogSchema(lang),
      })}\n    ${dataScript}`;
      const html = injectIntoTemplate(template, {
        lang,
        headExtras,
        bodyContent: catalogContent(lang, products, translations[lang]),
      });
      await writeRoute(`${lang}/products`, html);
      routeCount++;
    }

    // Our Story
    {
      const canonical = `${SITE_URL}/${lang}/our-story/`;
      const headExtras = buildHead({
        lang,
        title: c.storyTitle,
        description: c.storyDesc,
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
        title: c.rfqTitle,
        description: c.rfqDesc,
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
      const title = productSeoTitle(display);
      const description = richProductDescription(display);
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
