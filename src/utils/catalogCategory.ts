import type { SupportedLanguage } from '../hooks/useLocalizedPath';
import { toSlug } from './slug';

export const DEFAULT_PRODUCT_CATEGORIES = [
  'New Arrival',
  'Hot Sale',
  'Led Lighted Mirror',
  'Bathroom Mirror without led',
  'Full Length Dressing Mirror',
  'Irregular Mirror',
] as const;

export const CATALOG_CATEGORY_PREFIX = '/products/category';

const SITE_URL = 'https://bolenmirror.com';

// Approved English source titles; localized versions preserve their keywords.
const ENGLISH_CATEGORY_SEO_TITLES = {
  'hot-sale': 'Wholesale Mirror Supplier | Hot-Selling Mirror Manufacturer',
  'led-lighted-mirror': 'LED Bathroom Mirror Manufacturer | LED Lighted Mirror Supplier',
  'bathroom-mirror-without-led': 'Non-LED Bathroom Mirrors | Bathroom Mirror Manufacturer',
  'full-length-dressing-mirror': 'Full-Length Mirror Manufacturer | Dressing Mirror Supplier',
  'irregular-mirror': 'Custom Irregular Mirrors | Professional Irregular Mirror Manufacturer',
  'mirror-cabinet': 'LED Mirror Cabinet Manufacturer | Mirror Cabinet Manufacturing',
} as const;

// Keep every supported language complete; the English keys define the scope.
const CATEGORY_SEO_TITLES: Readonly<
  Record<SupportedLanguage, Readonly<Record<keyof typeof ENGLISH_CATEGORY_SEO_TITLES, string>>>
> = {
  en: ENGLISH_CATEGORY_SEO_TITLES,
  zh: {
    "hot-sale": "镜子批发供应商 | 热销镜子制造商",
    "led-lighted-mirror": "LED 浴室镜制造商 | LED 发光镜供应商",
    "bathroom-mirror-without-led": "无 LED 浴室镜 | 浴室镜制造商",
    "full-length-dressing-mirror": "全身镜制造商 | 穿衣镜供应商",
    "irregular-mirror": "定制异形镜 | 专业异形镜制造商",
    "mirror-cabinet": "LED 镜柜制造商 | 镜柜制造"
  },
  es: {
    "hot-sale": "Proveedor mayorista de espejos | Fabricante de los espejos más vendidos",
    "led-lighted-mirror": "Fabricante de espejos de baño LED | Proveedor de espejos con luz LED",
    "bathroom-mirror-without-led": "Espejos de baño sin LED | Fabricante de espejos de baño",
    "full-length-dressing-mirror": "Fabricante de espejos de cuerpo entero | Proveedor de espejos de vestidor",
    "irregular-mirror": "Espejos irregulares a medida | Fabricante profesional de espejos irregulares",
    "mirror-cabinet": "Fabricante de armarios con espejo LED | Fabricación de armarios con espejo"
  },
  fr: {
    "hot-sale": "Fournisseur de miroirs en gros | Fabricant de miroirs à succès",
    "led-lighted-mirror": "Fabricant de miroirs de salle de bain LED | Fournisseur de miroirs lumineux LED",
    "bathroom-mirror-without-led": "Miroirs de salle de bain sans LED | Fabricant de miroirs de salle de bain",
    "full-length-dressing-mirror": "Fabricant de miroirs en pied | Fournisseur de miroirs de dressing",
    "irregular-mirror": "Miroirs irréguliers sur mesure | Fabricant professionnel de miroirs irréguliers",
    "mirror-cabinet": "Fabricant d'armoires à miroir LED | Fabrication d'armoires à miroir"
  },
  de: {
    "hot-sale": "Spiegel-Großhändler | Hersteller gefragter Spiegel",
    "led-lighted-mirror": "Hersteller von LED-Badspiegeln | Lieferant für LED-Leuchtspiegel",
    "bathroom-mirror-without-led": "Badspiegel ohne LED | Hersteller von Badspiegeln",
    "full-length-dressing-mirror": "Hersteller von Ganzkörperspiegeln | Lieferant für Ankleidespiegel",
    "irregular-mirror": "Unregelmäßige Spiegel nach Maß | Professioneller Hersteller unregelmäßiger Spiegel",
    "mirror-cabinet": "Hersteller von LED-Spiegelschränken | Fertigung von Spiegelschränken"
  },
  it: {
    "hot-sale": "Fornitore di specchi all'ingrosso | Produttore degli specchi più venduti",
    "led-lighted-mirror": "Produttore di specchi da bagno LED | Fornitore di specchi illuminati a LED",
    "bathroom-mirror-without-led": "Specchi da bagno senza LED | Produttore di specchi da bagno",
    "full-length-dressing-mirror": "Produttore di specchi a figura intera | Fornitore di specchi da guardaroba",
    "irregular-mirror": "Specchi irregolari su misura | Produttore professionale di specchi irregolari",
    "mirror-cabinet": "Produttore di armadietti con specchio LED | Produzione di armadietti con specchio"
  },
};

export function getCatalogCategorySeoTitle(lang: string, slug: string, fallback: string): string {
  const titles = Object.hasOwn(CATEGORY_SEO_TITLES, lang)
    ? CATEGORY_SEO_TITLES[lang as SupportedLanguage]
    : undefined;
  return titles && Object.hasOwn(titles, slug)
    ? titles[slug as keyof typeof ENGLISH_CATEGORY_SEO_TITLES]
    : fallback;
}

export interface CatalogCategoryPageCopy {
  readonly h1: string;
  readonly description: string;
}

// Approved English source copy remains unchanged when adding translations.
const ENGLISH_CATEGORY_PAGE_COPY = {
  'hot-sale': {
    h1: 'Wholesale Hot-Selling Mirrors',
    description: 'Explore hot-selling mirrors from a wholesale mirror supplier and manufacturer. Custom sizes, frames and finishes for brands, retailers and hotel projects.',
  },
  'led-lighted-mirror': {
    h1: 'LED Bathroom Mirror Manufacturer',
    description: 'Source LED lighted bathroom mirrors with custom sizes, dimming and anti-fog options. OEM/ODM mirror manufacturing and wholesale supply for brands and hotels.',
  },
  'bathroom-mirror-without-led': {
    h1: 'Bathroom Mirror Manufacturer',
    description: 'Source non-LED bathroom mirrors in framed and frameless designs. Custom sizes, materials and finishes with OEM/ODM mirror manufacturing for brands and hotels.',
  },
  'full-length-dressing-mirror': {
    h1: 'Full-Length Dressing Mirror Manufacturer',
    description: 'Source full-length dressing mirrors from a manufacturer and wholesale supplier. Custom sizes, frames and finishes for hotels, retailers and home brands.',
  },
} as const satisfies Readonly<Record<string, CatalogCategoryPageCopy>>;

// Only categories 1–4 have new H1/description copy. Other categories retain
// their existing localized labels and description templates.
const CATEGORY_PAGE_COPY: Readonly<
  Record<SupportedLanguage, Readonly<Record<keyof typeof ENGLISH_CATEGORY_PAGE_COPY, CatalogCategoryPageCopy>>>
> = {
  en: ENGLISH_CATEGORY_PAGE_COPY,
  zh: {
    "hot-sale": {
      "h1": "热销镜子批发",
      "description": "选购镜子批发供应商与制造商提供的热销镜子。支持定制尺寸、镜框及表面处理，适用于品牌商、零售商和酒店项目。"
    },
    "led-lighted-mirror": {
      "h1": "LED 浴室镜制造商",
      "description": "采购 LED 发光浴室镜，支持定制尺寸，并提供调光和防雾选项。为品牌商和酒店提供 OEM/ODM 镜子制造及批发供应。"
    },
    "bathroom-mirror-without-led": {
      "h1": "浴室镜制造商",
      "description": "采购有框及无框设计的无 LED 浴室镜。支持定制尺寸、材料和表面处理，为品牌商和酒店提供 OEM/ODM 镜子制造服务。"
    },
    "full-length-dressing-mirror": {
      "h1": "全身穿衣镜制造商",
      "description": "从制造商和批发供应商处采购全身穿衣镜。支持定制尺寸、镜框和表面处理，适用于酒店、零售商及家居品牌。"
    }
  },
  es: {
    "hot-sale": {
      "h1": "Espejos más vendidos al por mayor",
      "description": "Descubra los espejos más vendidos de un proveedor mayorista y fabricante de espejos. Tamaños, marcos y acabados personalizados para marcas, minoristas y proyectos hoteleros."
    },
    "led-lighted-mirror": {
      "h1": "Fabricante de espejos de baño LED",
      "description": "Adquiera espejos de baño con luz LED, tamaños personalizados y opciones de regulación de brillo y antivaho. Fabricación de espejos OEM/ODM y suministro al por mayor para marcas y hoteles."
    },
    "bathroom-mirror-without-led": {
      "h1": "Fabricante de espejos de baño",
      "description": "Adquiera espejos de baño sin LED, con o sin marco. Tamaños, materiales y acabados personalizados, con fabricación de espejos OEM/ODM para marcas y hoteles."
    },
    "full-length-dressing-mirror": {
      "h1": "Fabricante de espejos de vestidor de cuerpo entero",
      "description": "Adquiera espejos de vestidor de cuerpo entero de un fabricante y proveedor mayorista. Tamaños, marcos y acabados personalizados para hoteles, minoristas y marcas de artículos para el hogar."
    }
  },
  fr: {
    "hot-sale": {
      "h1": "Miroirs à succès en gros",
      "description": "Découvrez des miroirs à succès auprès d'un fournisseur et fabricant de miroirs en gros. Dimensions, cadres et finitions sur mesure pour les marques, les détaillants et les projets hôteliers."
    },
    "led-lighted-mirror": {
      "h1": "Fabricant de miroirs de salle de bain LED",
      "description": "Commandez des miroirs de salle de bain à éclairage LED aux dimensions personnalisées, avec réglage de luminosité et fonction antibuée en option. Fabrication de miroirs OEM/ODM et fourniture en gros pour les marques et les hôtels."
    },
    "bathroom-mirror-without-led": {
      "h1": "Fabricant de miroirs de salle de bain",
      "description": "Commandez des miroirs de salle de bain sans LED, avec ou sans cadre. Dimensions, matériaux et finitions sur mesure, avec fabrication de miroirs OEM/ODM pour les marques et les hôtels."
    },
    "full-length-dressing-mirror": {
      "h1": "Fabricant de miroirs de dressing en pied",
      "description": "Commandez des miroirs de dressing en pied auprès d'un fabricant et fournisseur en gros. Dimensions, cadres et finitions sur mesure pour les hôtels, les détaillants et les marques d'articles pour la maison."
    }
  },
  de: {
    "hot-sale": {
      "h1": "Gefragte Spiegel im Großhandel",
      "description": "Entdecken Sie gefragte Spiegel von einem Spiegel-Großhändler und Hersteller. Individuelle Größen, Rahmen und Oberflächen für Marken, Einzelhändler und Hotelprojekte."
    },
    "led-lighted-mirror": {
      "h1": "Hersteller von LED-Badspiegeln",
      "description": "Beziehen Sie LED-beleuchtete Badspiegel in individuellen Größen mit optionaler Dimm- und Antibeschlagfunktion. OEM/ODM-Spiegelfertigung und Großhandelslieferungen für Marken und Hotels."
    },
    "bathroom-mirror-without-led": {
      "h1": "Hersteller von Badspiegeln",
      "description": "Beziehen Sie Badspiegel ohne LED in gerahmten und rahmenlosen Ausführungen. Individuelle Größen, Materialien und Oberflächen mit OEM/ODM-Spiegelfertigung für Marken und Hotels."
    },
    "full-length-dressing-mirror": {
      "h1": "Hersteller von Ganzkörper-Ankleidespiegeln",
      "description": "Beziehen Sie Ganzkörper-Ankleidespiegel von einem Hersteller und Großhändler. Individuelle Größen, Rahmen und Oberflächen für Hotels, Einzelhändler und Einrichtungsmarken."
    }
  },
  it: {
    "hot-sale": {
      "h1": "Specchi più venduti all'ingrosso",
      "description": "Scopri gli specchi più venduti di un fornitore all'ingrosso e produttore di specchi. Dimensioni, cornici e finiture personalizzate per marchi, rivenditori e progetti alberghieri."
    },
    "led-lighted-mirror": {
      "h1": "Produttore di specchi da bagno LED",
      "description": "Acquista specchi da bagno illuminati a LED con dimensioni personalizzate, regolazione della luminosità e funzione antiappannamento opzionali. Produzione di specchi OEM/ODM e fornitura all'ingrosso per marchi e hotel."
    },
    "bathroom-mirror-without-led": {
      "h1": "Produttore di specchi da bagno",
      "description": "Acquista specchi da bagno senza LED, con o senza cornice. Dimensioni, materiali e finiture personalizzati, con produzione di specchi OEM/ODM per marchi e hotel."
    },
    "full-length-dressing-mirror": {
      "h1": "Produttore di specchi da guardaroba a figura intera",
      "description": "Acquista specchi da guardaroba a figura intera da un produttore e fornitore all'ingrosso. Dimensioni, cornici e finiture personalizzate per hotel, rivenditori e marchi per la casa."
    }
  },
};

export function getCatalogCategoryPageCopy(
  lang: string,
  slug: string,
  fallback: CatalogCategoryPageCopy
): CatalogCategoryPageCopy {
  const copy = Object.hasOwn(CATEGORY_PAGE_COPY, lang)
    ? CATEGORY_PAGE_COPY[lang as SupportedLanguage]
    : undefined;
  return copy && Object.hasOwn(copy, slug)
    ? copy[slug as keyof typeof ENGLISH_CATEGORY_PAGE_COPY]
    : fallback;
}

export function toCategorySlug(name: string): string {
  return toSlug(name || '');
}

export function catalogCategoryPath(name: string): string {
  return `${CATALOG_CATEGORY_PREFIX}/${toCategorySlug(name)}`;
}

export function parseCategoriesSetting(value: unknown): string[] {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

export function uniqueCategorySlugs(
  categories: readonly string[]
): Array<{ name: string; slug: string }> {
  const seen = new Set<string>();
  const out: Array<{ name: string; slug: string }> = [];
  for (const name of categories) {
    const slug = toCategorySlug(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ name, slug });
  }
  return out;
}

export function findCategoryBySlug(
  categories: readonly (string | null | undefined)[],
  slug: string | undefined
): string | undefined {
  if (!slug) return undefined;
  const match = categories.find((name) => !!name && toCategorySlug(name) === slug);
  return match || undefined;
}

export function productMatchesCategory(
  productCategory: string | undefined | null,
  categoryName: string
): boolean {
  if (!productCategory) return false;
  const slugA = toCategorySlug(productCategory);
  const slugB = toCategorySlug(categoryName);
  if (slugA && slugA === slugB) return true;
  const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return compact(productCategory) === compact(categoryName);
}

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function categoryPublicPages(
  categories: readonly string[],
  lastmod: string
): Array<{ path: string; changefreq: string; priority: string; lastmod: string }> {
  return uniqueCategorySlugs(categories).map(({ slug }) => ({
    path: `${CATALOG_CATEGORY_PREFIX}/${slug}`,
    changefreq: 'weekly',
    priority: '0.85',
    lastmod,
  }));
}

export interface CatalogCategorySchemaProduct {
  /** Original English title used by product links; never a translated slug. */
  title: string;
  /** Localized display name, when available. */
  name?: string;
  image?: string;
}

/** Shared CollectionPage, breadcrumb and product ItemList JSON-LD. */
export function buildCatalogCategorySchema(opts: {
  lang: string;
  slug: string;
  name: string;
  description: string;
  /** Page H1 when it differs from the short category/breadcrumb label. */
  pageName?: string;
  homeLabel: string;
  catalogLabel: string;
  /** Products rendered on this page, in display order. Omit while loading. */
  products?: readonly CatalogCategorySchemaProduct[];
  /** Total matching products when only a Show more batch is rendered. */
  totalProducts?: number;
}): Record<string, unknown>[] {
  const url = `${SITE_URL}/${opts.lang}${CATALOG_CATEGORY_PREFIX}/${opts.slug}/`;
  const itemList = opts.products === undefined ? undefined : {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    name: opts.pageName ?? opts.name,
    url,
    numberOfItems: opts.totalProducts ?? opts.products.length,
    itemListElement: opts.products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name || product.title,
      url: `${SITE_URL}/${opts.lang}/products/${toSlug(product.title)}/`,
      ...(product.image ? { image: product.image } : {}),
    })),
  };
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: opts.pageName ?? opts.name,
      description: opts.description,
      url,
      ...(itemList ? { mainEntity: { '@id': itemList['@id'] } } : {}),
      isPartOf: {
        '@type': 'WebSite',
        name: 'BOLEN Mirror',
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: opts.homeLabel, item: `${SITE_URL}/${opts.lang}/` },
        { '@type': 'ListItem', position: 2, name: opts.catalogLabel, item: `${SITE_URL}/${opts.lang}/products/` },
        { '@type': 'ListItem', position: 3, name: opts.name, item: url },
      ],
    },
    ...(itemList ? [itemList] : []),
  ];
}
