import type { SupportedLanguage } from '../hooks/useLocalizedPath';
import { toSlug } from './slug';
import { productDetailPath } from './productRoutes';
import { toMediaUrl } from './media';
import catalogCategoriesSnapshot from '../data/catalogCategories.json';

// Hardcoded seed used only when site_settings.categories is empty or
// unreachable. Editors manage the real list in the admin portal; do not read
// this for anything rendered on every page — use CATALOG_CATEGORIES below.
export const DEFAULT_PRODUCT_CATEGORIES = [
  'New Arrival',
  'Hot Sale',
  'Led Lighted Mirror',
  'Bathroom Mirror without led',
  'Full Length Dressing Mirror',
  'Irregular Mirror',
] as const;

/**
 * The live category list (site_settings.categories), snapshotted at build time
 * by scripts/generate-catalog-categories.ts into src/data/catalogCategories.json.
 * Synchronous and identical in every locale, so global chrome such as the
 * footer can link categories without a Supabase fetch and without ever
 * pointing at a category the editors have removed.
 */
export const CATALOG_CATEGORIES: readonly string[] = (() => {
  const snapshot = parseCategoriesSetting(catalogCategoriesSnapshot);
  return snapshot.length > 0 ? snapshot : [...DEFAULT_PRODUCT_CATEGORIES];
})();

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
  'bathroom-vanity': 'Bathroom Vanity Manufacturer | Custom Bathroom Vanity Cabinets',
} as const;

type CategorySeoSlug = keyof typeof ENGLISH_CATEGORY_SEO_TITLES;

// Keep every supported language complete; the English keys define the scope.
const CATEGORY_SEO_TITLES: Readonly<
  Record<SupportedLanguage, Readonly<Record<CategorySeoSlug, string>>>
> = {
  en: ENGLISH_CATEGORY_SEO_TITLES,
  zh: {
    'hot-sale': '镜子批发供应商 | 热销镜子制造商',
    'led-lighted-mirror': 'LED 浴室镜制造商 | LED 发光镜供应商',
    'bathroom-mirror-without-led': '无 LED 浴室镜 | 浴室镜制造商',
    'full-length-dressing-mirror': '全身镜制造商 | 穿衣镜供应商',
    'irregular-mirror': '定制异形镜 | 专业异形镜制造商',
    'mirror-cabinet': 'LED 镜柜制造商 | 镜柜制造',
    'bathroom-vanity': '浴室柜制造商 | 定制浴室柜批发供应商',
  },
  es: {
    'hot-sale': 'Proveedor mayorista de espejos | Fabricante de los espejos más vendidos',
    'led-lighted-mirror': 'Fabricante de espejos de baño LED | Proveedor de espejos con luz LED',
    'bathroom-mirror-without-led': 'Espejos de baño sin LED | Fabricante de espejos de baño',
    'full-length-dressing-mirror': 'Fabricante de espejos de cuerpo entero | Proveedor de espejos de vestidor',
    'irregular-mirror': 'Espejos irregulares a medida | Fabricante profesional de espejos irregulares',
    'mirror-cabinet': 'Fabricante de armarios con espejo LED | Fabricación de armarios con espejo',
    'bathroom-vanity': 'Fabricante de muebles de baño | Proveedor mayorista de muebles de lavabo',
  },
  fr: {
    'hot-sale': 'Fournisseur de miroirs en gros | Fabricant de miroirs à succès',
    'led-lighted-mirror': 'Fabricant de miroirs de salle de bain LED | Fournisseur de miroirs lumineux LED',
    'bathroom-mirror-without-led': 'Miroirs de salle de bain sans LED | Fabricant de miroirs de salle de bain',
    'full-length-dressing-mirror': 'Fabricant de miroirs en pied | Fournisseur de miroirs de dressing',
    'irregular-mirror': 'Miroirs irréguliers sur mesure | Fabricant professionnel de miroirs irréguliers',
    'mirror-cabinet': "Fabricant d'armoires à miroir LED | Fabrication d'armoires à miroir",
    'bathroom-vanity': 'Fabricant de meubles de salle de bain | Fournisseur de meubles vasques sur mesure',
  },
  de: {
    'hot-sale': 'Spiegel-Großhändler | Hersteller gefragter Spiegel',
    'led-lighted-mirror': 'Hersteller von LED-Badspiegeln | Lieferant für LED-Leuchtspiegel',
    'bathroom-mirror-without-led': 'Badspiegel ohne LED | Hersteller von Badspiegeln',
    'full-length-dressing-mirror': 'Hersteller von Ganzkörperspiegeln | Lieferant für Ankleidespiegel',
    'irregular-mirror': 'Unregelmäßige Spiegel nach Maß | Professioneller Hersteller unregelmäßiger Spiegel',
    'mirror-cabinet': 'Hersteller von LED-Spiegelschränken | Fertigung von Spiegelschränken',
    'bathroom-vanity': 'Hersteller von Badmöbeln | Waschtischunterschränke nach Maß',
  },
  it: {
    'hot-sale': "Fornitore di specchi all'ingrosso | Produttore degli specchi più venduti",
    'led-lighted-mirror': 'Produttore di specchi da bagno LED | Fornitore di specchi illuminati a LED',
    'bathroom-mirror-without-led': 'Specchi da bagno senza LED | Produttore di specchi da bagno',
    'full-length-dressing-mirror': 'Produttore di specchi a figura intera | Fornitore di specchi da guardaroba',
    'irregular-mirror': 'Specchi irregolari su misura | Produttore professionale di specchi irregolari',
    'mirror-cabinet': 'Produttore di armadietti con specchio LED | Produzione di armadietti con specchio',
    'bathroom-vanity': 'Produttore di mobili da bagno | Fornitore di mobili lavabo su misura',
  },
};

export function getCatalogCategorySeoTitle(lang: string, slug: string, fallback: string): string {
  const titles = Object.hasOwn(CATEGORY_SEO_TITLES, lang)
    ? CATEGORY_SEO_TITLES[lang as SupportedLanguage]
    : undefined;
  return titles && Object.hasOwn(titles, slug)
    ? titles[slug as CategorySeoSlug]
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
  'irregular-mirror': {
    h1: 'Custom Irregular Mirror Manufacturer',
    description: 'Source custom irregular mirrors from a professional mirror manufacturer. Custom shapes, sizes and finishes with OEM/ODM supply for brands and hotel projects.',
  },
  'mirror-cabinet': {
    h1: 'LED Mirror Cabinet Manufacturer',
    description: 'Source LED mirror cabinets with practical storage, custom sizes and finishes. OEM/ODM mirror cabinet manufacturing and wholesale supply for brands and hotels.',
  },
  'bathroom-vanity': {
    h1: 'Custom Bathroom Vanity Manufacturer',
    description: 'Source wall-hung and freestanding bathroom vanity cabinets with sintered stone or ceramic basins. OEM/ODM vanity manufacturing and wholesale supply for brands and hotels.',
  },
} as const satisfies Readonly<Record<CategorySeoSlug, CatalogCategoryPageCopy>>;

// Every category with a custom SEO title must have dedicated H1/description
// copy in all supported languages, shared by the hero, metadata and JSON-LD.
const CATEGORY_PAGE_COPY: Readonly<
  Record<SupportedLanguage, Readonly<Record<keyof typeof ENGLISH_CATEGORY_PAGE_COPY, CatalogCategoryPageCopy>>>
> = {
  en: ENGLISH_CATEGORY_PAGE_COPY,
  zh: {
    'hot-sale': {
      h1: '热销镜子批发',
      description: '选购镜子批发供应商与制造商提供的热销镜子。支持定制尺寸、镜框及表面处理，适用于品牌商、零售商和酒店项目。',
    },
    'led-lighted-mirror': {
      h1: 'LED 浴室镜制造商',
      description: '采购 LED 发光浴室镜，支持定制尺寸，并提供调光和防雾选项。为品牌商和酒店提供 OEM/ODM 镜子制造及批发供应。',
    },
    'bathroom-mirror-without-led': {
      h1: '浴室镜制造商',
      description: '采购有框及无框设计的无 LED 浴室镜。支持定制尺寸、材料和表面处理，为品牌商和酒店提供 OEM/ODM 镜子制造服务。',
    },
    'full-length-dressing-mirror': {
      h1: '全身穿衣镜制造商',
      description: '从制造商和批发供应商处采购全身穿衣镜。支持定制尺寸、镜框和表面处理，适用于酒店、零售商及家居品牌。',
    },
    'irregular-mirror': {
      h1: '定制异形镜制造商',
      description: '向专业镜子制造商采购定制异形镜。支持定制形状、尺寸和表面处理，为品牌商及酒店项目提供 OEM/ODM 供应服务。',
    },
    'mirror-cabinet': {
      h1: 'LED 镜柜制造商',
      description: '采购兼具实用储物空间的 LED 镜柜，支持定制尺寸与表面处理。为品牌商和酒店提供 OEM/ODM 镜柜制造及批发供应。',
    },
    'bathroom-vanity': {
      h1: '定制浴室柜制造商',
      description: '采购壁挂式与落地式浴室柜，配备岩板或陶瓷一体盆及多层防水柜体。为品牌商和酒店项目提供 OEM/ODM 浴室柜制造与批发供应。',
    },
  },
  es: {
    'hot-sale': {
      h1: 'Espejos más vendidos al por mayor',
      description: 'Descubra los espejos más vendidos de un proveedor mayorista y fabricante de espejos. Tamaños, marcos y acabados personalizados para marcas, minoristas y proyectos hoteleros.',
    },
    'led-lighted-mirror': {
      h1: 'Fabricante de espejos de baño LED',
      description: 'Adquiera espejos de baño con luz LED, tamaños personalizados y opciones de regulación de brillo y antivaho. Fabricación de espejos OEM/ODM y suministro al por mayor para marcas y hoteles.',
    },
    'bathroom-mirror-without-led': {
      h1: 'Fabricante de espejos de baño',
      description: 'Adquiera espejos de baño sin LED, con o sin marco. Tamaños, materiales y acabados personalizados, con fabricación de espejos OEM/ODM para marcas y hoteles.',
    },
    'full-length-dressing-mirror': {
      h1: 'Fabricante de espejos de vestidor de cuerpo entero',
      description: 'Adquiera espejos de vestidor de cuerpo entero de un fabricante y proveedor mayorista. Tamaños, marcos y acabados personalizados para hoteles, minoristas y marcas de artículos para el hogar.',
    },
    'irregular-mirror': {
      h1: 'Fabricante de espejos irregulares a medida',
      description: 'Adquiera espejos irregulares a medida de un fabricante profesional. Formas, tamaños y acabados personalizados, con suministro OEM/ODM para marcas y proyectos hoteleros.',
    },
    'mirror-cabinet': {
      h1: 'Fabricante de armarios con espejo LED',
      description: 'Adquiera armarios con espejo LED y espacio de almacenamiento práctico, con tamaños y acabados personalizados. Fabricación OEM/ODM y suministro al por mayor para marcas y hoteles.',
    },
    'bathroom-vanity': {
      h1: 'Fabricante de muebles de baño a medida',
      description: 'Adquiera muebles de baño suspendidos y de pie con lavabos cerámicos o de piedra sinterizada. Fabricación OEM/ODM y suministro mayorista para marcas y proyectos hoteleros.',
    },
  },
  fr: {
    'hot-sale': {
      h1: 'Miroirs à succès en gros',
      description: "Découvrez des miroirs à succès auprès d'un fournisseur et fabricant de miroirs en gros. Dimensions, cadres et finitions sur mesure pour les marques, les détaillants et les projets hôteliers.",
    },
    'led-lighted-mirror': {
      h1: 'Fabricant de miroirs de salle de bain LED',
      description: 'Commandez des miroirs de salle de bain à éclairage LED aux dimensions personnalisées, avec réglage de luminosité et fonction antibuée en option. Fabrication de miroirs OEM/ODM et fourniture en gros pour les marques et les hôtels.',
    },
    'bathroom-mirror-without-led': {
      h1: 'Fabricant de miroirs de salle de bain',
      description: 'Commandez des miroirs de salle de bain sans LED, avec ou sans cadre. Dimensions, matériaux et finitions sur mesure, avec fabrication de miroirs OEM/ODM pour les marques et les hôtels.',
    },
    'full-length-dressing-mirror': {
      h1: 'Fabricant de miroirs de dressing en pied',
      description: "Commandez des miroirs de dressing en pied auprès d'un fabricant et fournisseur en gros. Dimensions, cadres et finitions sur mesure pour les hôtels, les détaillants et les marques d'articles pour la maison.",
    },
    'irregular-mirror': {
      h1: 'Fabricant de miroirs irréguliers sur mesure',
      description: "Commandez des miroirs irréguliers sur mesure auprès d'un fabricant professionnel. Formes, dimensions et finitions personnalisées, avec fourniture OEM/ODM pour les marques et les projets hôteliers.",
    },
    'mirror-cabinet': {
      h1: "Fabricant d'armoires à miroir LED",
      description: 'Commandez des armoires à miroir LED avec des rangements pratiques, des dimensions et des finitions sur mesure. Fabrication OEM/ODM et fourniture en gros pour les marques et les hôtels.',
    },
    'bathroom-vanity': {
      h1: 'Fabricant de meubles de salle de bain sur mesure',
      description: 'Commandez des meubles vasques suspendus ou sur pied avec plans en céramique ou pierre frittée. Fabrication OEM/ODM et fourniture en gros pour les marques et les projets hôteliers.',
    },
  },
  de: {
    'hot-sale': {
      h1: 'Gefragte Spiegel im Großhandel',
      description: 'Entdecken Sie gefragte Spiegel von einem Spiegel-Großhändler und Hersteller. Individuelle Größen, Rahmen und Oberflächen für Marken, Einzelhändler und Hotelprojekte.',
    },
    'led-lighted-mirror': {
      h1: 'Hersteller von LED-Badspiegeln',
      description: 'Beziehen Sie LED-beleuchtete Badspiegel in individuellen Größen mit optionaler Dimm- und Antibeschlagfunktion. OEM/ODM-Spiegelfertigung und Großhandelslieferungen für Marken und Hotels.',
    },
    'bathroom-mirror-without-led': {
      h1: 'Hersteller von Badspiegeln',
      description: 'Beziehen Sie Badspiegel ohne LED in gerahmten und rahmenlosen Ausführungen. Individuelle Größen, Materialien und Oberflächen mit OEM/ODM-Spiegelfertigung für Marken und Hotels.',
    },
    'full-length-dressing-mirror': {
      h1: 'Hersteller von Ganzkörper-Ankleidespiegeln',
      description: 'Beziehen Sie Ganzkörper-Ankleidespiegel von einem Hersteller und Großhändler. Individuelle Größen, Rahmen und Oberflächen für Hotels, Einzelhändler und Einrichtungsmarken.',
    },
    'irregular-mirror': {
      h1: 'Hersteller unregelmäßiger Spiegel nach Maß',
      description: 'Beziehen Sie unregelmäßige Spiegel nach Maß von einem professionellen Hersteller. Individuelle Formen, Größen und Oberflächen mit OEM/ODM-Lieferungen für Marken und Hotelprojekte.',
    },
    'mirror-cabinet': {
      h1: 'Hersteller von LED-Spiegelschränken',
      description: 'Beziehen Sie LED-Spiegelschränke mit praktischem Stauraum sowie individuellen Größen und Oberflächen. OEM/ODM-Fertigung und Großhandelslieferungen für Marken und Hotels.',
    },
    'bathroom-vanity': {
      h1: 'Hersteller von Badmöbeln nach Maß',
      description: 'Beziehen Sie wandhängende und bodenstehende Waschtischunterschränke mit Keramik- oder Sintersteinbecken. OEM/ODM-Fertigung und Großhandelslieferungen für Marken und Hotelprojekte.',
    },
  },
  it: {
    'hot-sale': {
      h1: "Specchi più venduti all'ingrosso",
      description: "Scopri gli specchi più venduti di un fornitore all'ingrosso e produttore di specchi. Dimensioni, cornici e finiture personalizzate per marchi, rivenditori e progetti alberghieri.",
    },
    'led-lighted-mirror': {
      h1: 'Produttore di specchi da bagno LED',
      description: "Acquista specchi da bagno illuminati a LED con dimensioni personalizzate, regolazione della luminosità e funzione antiappannamento opzionali. Produzione di specchi OEM/ODM e fornitura all'ingrosso per marchi e hotel.",
    },
    'bathroom-mirror-without-led': {
      h1: 'Produttore di specchi da bagno',
      description: "Acquista specchi da bagno senza LED, con o senza cornice. Dimensioni, materiali e finiture personalizzati, con produzione di specchi OEM/ODM per marchi e hotel.",
    },
    'full-length-dressing-mirror': {
      h1: 'Produttore di specchi da guardaroba a figura intera',
      description: "Acquista specchi da guardaroba a figura intera da un produttore e fornitore all'ingrosso. Dimensioni, cornici e finiture personalizzate per hotel, rivenditori e marchi per la casa.",
    },
    'irregular-mirror': {
      h1: 'Produttore di specchi irregolari su misura',
      description: "Acquista specchi irregolari su misura da un produttore professionale. Forme, dimensioni e finiture personalizzate, con fornitura OEM/ODM per marchi e progetti alberghieri.",
    },
    'mirror-cabinet': {
      h1: 'Produttore di armadietti con specchio LED',
      description: "Acquista armadietti con specchio LED e pratici vani portaoggetti, con dimensioni e finiture personalizzate. Produzione OEM/ODM e fornitura all'ingrosso per marchi e hotel.",
    },
    'bathroom-vanity': {
      h1: 'Produttore di mobili da bagno su misura',
      description: "Acquista mobili da bagno sospesi e a terra con lavabi in ceramica o pietra sinterizzata. Produzione OEM/ODM e fornitura all'ingrosso per marchi e progetti alberghieri.",
    },
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

export interface CatalogCategoryEditorial {
  readonly heading: string;
  readonly paragraphs: readonly [string, string, string];
  readonly highlights: readonly [string, string, string, string];
}

// Substantive B2B engineering & sourcing copy (190–250+ words per category)
// rendered on both static prerendered HTML and the hydrated Products category
// view so low-SKU category hubs never look like thin filter pages.
const CATEGORY_EDITORIAL: Readonly<
  Record<SupportedLanguage, Readonly<Record<CategorySeoSlug, CatalogCategoryEditorial>>>
> = {
  en: {
    'hot-sale': {
      heading: 'Factory-Direct Wholesale & High-Turnover Mirror Specifications',
      paragraphs: [
        'Our hot-selling lineup brings together proven retail, e-commerce, and hospitality models produced on dedicated lines inside our 46,800 m² Jiaxing manufacturing facility. Each SKU uses 5mm EN 1036 copper-free silver glass with shatter-resistant safety film, precision CNC-polished edges, and anodized aluminum or stainless-steel framing engineered for humid residential and commercial interiors.',
        'For importers, distributors, and private-label brands seeking dependable replenishment, these core models combine streamlined tooling with full OEM customization. Buyers can specify regional plug and hardwire configurations, stepless 2700K–6500K lighting, heated anti-fog pads, laser-etched logos, and ISTA-3A drop-tested mail-order cartons with 25–35 day mass-production lead times.',
        'Every repeat order follows recorded golden-sample benchmarks, incoming raw-glass clarity checks, 100% electrical burn-in testing on illuminated models, and pre-shipment AQL inspection near Shanghai and Ningbo ports to keep defect rates minimal across multi-container rollouts.',
      ],
      highlights: [
        'Glass & silvering: 5mm EN 1036 copper-free mirror glass with explosion-proof backing film',
        'Lighting & electronics: High-density CRI ≥ 90 LED strips with 3-year electrical component warranty',
        'Non-LED structural coverage: 2-year warranty on silvering, protective backing, and metal frames',
        'Order flexibility: Standard MOQ 50–100 pcs per model with mixed-container loading near Shanghai Port',
      ],
    },
    'led-lighted-mirror': {
      heading: 'OEM/ODM LED Bathroom Mirror Engineering & Compliance',
      paragraphs: [
        'BOLEN manufactures backlit, front-lit, and dual-lit LED bathroom mirrors built around 5mm copper-free silver glass, anodized aluminum chassis, and sealed IP44/IP54 electrical enclosures suited for residential vanities and hotel guestrooms. High-density 120–240 LEDs/m strips deliver CRI ≥ 90 color rendering without visible hotspots, paired with stepless dimming, 3-color CCT memory (3000K/4000K/6000K), and separate heated demister pads.',
        'Every electrical assembly is matched to destination-market compliance requirements—including UL 962 / ETL for North America, CE EN 60598 / RoHS / UKCA for Europe and the UK, and SAA for Australia—confirmed per model during quotation. Every unit undergoes 100% hi-pot dielectric, grounding, aging, and optical inspection prior to export packing.',
        'Custom engineering teams support bespoke frosted sandblasting patterns, Bluetooth audio modules, digital clock/temperature displays, 3X/5X integrated magnifying zones, and wall-switch hardwire compatibility alongside private-label user manuals and barcode carton labeling.',
      ],
      highlights: [
        'Optical performance: 5mm copper-free glass, CRI ≥ 90, 2700K–6500K stepless CCT and memory touch control',
        'Moisture protection: IP44/IP54 sealed driver housing with independent anti-fog heating film',
        'Market certifications: UL, ETL, CE, CB, UKCA, SAA, and RoHS configurations per destination market',
        'Warranty & packaging: 3-year warranty on LED/electrical components; ISTA-3A drop-tested cartons',
      ],
    },
    'bathroom-mirror-without-led': {
      heading: 'Architectural Non-LED Framed & Frameless Bathroom Mirrors',
      paragraphs: [
        'Designed for projects and retail programs that pair separate vanity sconces with clean architectural glass, our non-LED bathroom mirrors use distortion-free 5mm EN 1036 copper-free silver glass with multi-layer anti-corrosion backing that resists black-edge oxidation in high-humidity washrooms. Frame options span brushed anodized aluminum, powder-coated iron, stainless steel, and beveled frameless profiles.',
        'Because non-illuminated mirrors require no electrical certification lead time, buyers benefit from rapid sampling, flexible dimensional scaling from compact powder-room sizes to wide double-vanity formats, and high container-loading density. Reinforced French-cleat or keyhole brackets support both vertical and horizontal wall mounting.',
        'Pre-shipment quality checks verify frame seam alignment, anodized color consistency across production batches, neutral-salt-spray corrosion resistance, and reinforced corner protection inside five-ply export cartons or palletized project crates.',
      ],
      highlights: [
        'Mirror substrate: 5mm copper-free, lead-free silver mirror with CAT-I/CAT-II shatterproof safety film',
        'Frame finishes: Matte black, brushed gold, champagne bronze, brushed nickel, white, and frameless beveled edges',
        'Mounting hardware: Heavy-duty dual-orientation Z-bar cleats or reinforced multi-point wall brackets',
        'Structural warranty: 2-year factory warranty on non-LED mirror silvering, backing coat, and frame integrity',
      ],
    },
    'full-length-dressing-mirror': {
      heading: 'Full-Length Floor, Leaning & Wall-Mounted Dressing Mirrors',
      paragraphs: [
        'Our full-length dressing mirrors serve bedroom furniture brands, apparel boutiques, hospitality suites, and e-commerce retailers requiring tall, distortion-free reflection across 1500mm to 1800mm+ heights. Available in freestanding easel-stand, wall-leaning, and flush wall-mounted constructions, each piece combines 4mm–5mm copper-free safety glass with rigid extruded aluminum, solid wood, or upholstered profiles.',
        'Large-format glass transit safety is engineered into every carton: honeycomb board, high-density EPS/EPE corner armor, and reinforced export cartons or palletized crates protect full-height panels through parcel couriers and ocean freight. Optional perimeter LED lighting with touch dimming is available across select dressing mirror series.',
        'Whether sourcing arched, rectangular, or rounded-corner silhouettes, buyers can customize frame extrusion widths, matte or brushed metallic finishes, anti-tip hardware kits, and retail-ready color labels for omnichannel distribution.',
      ],
      highlights: [
        'Standard & custom sizing: Popular 1600×500mm, 1650×600mm, 1800×800mm formats plus bespoke project dimensions',
        'Safety glass construction: Full-coverage shatter-resistant backing film prevents loose shards on impact',
        'Installation modes: Folding U-stand with anti-slip feet, wall-leaning safety tether, or vertical/horizontal wall hang',
        'Warranty coverage: 3-year warranty on LED/electrical variants; 2-year warranty on non-LED mirror and frame structure',
      ],
    },
    'irregular-mirror': {
      heading: 'CNC-Contoured Asymmetrical & Organic Custom Mirror Manufacturing',
      paragraphs: [
        'BOLEN’s irregular mirror collection features CNC-cut asymmetrical, pebble, cloud, wavy, capsule, and organic silhouettes crafted for design-led interior brands, boutique hotels, and architectural specifiers. Automated waterjet and CNC glass-edging lines maintain smooth, uniform arris and pencil polishes along complex concave and convex curves without micro-chipping.',
        'Both frameless backlit halo designs and contoured slim-frame executions can be engineered from your CAD/DXF drawings. Diffused silicone neon channels or high-density flexible LED strips follow organic perimeters evenly, while multi-angle hanging plates allow buyers or installers to orient asymmetrical shapes in multiple directions.',
        'Prototype samples are typically completed within 7–15 days from drawing approval, with custom die-cut foam molds shaped to each irregular contour so asymmetrical panels ship with the same drop-test reliability as standard rectangular mirrors.',
      ],
      highlights: [
        'Precision fabrication: CNC contour cutting and automated smooth edge polishing from client CAD/DXF files',
        'Illuminated & non-LED options: Uniform flexible silicone-diffused halo backlighting or clean non-LED silhouettes',
        'Multi-angle mounting: 360-degree / 4-way rear hanging brackets for flexible vertical or horizontal orientation',
        'Clear warranty terms: 3-year warranty on LED drivers and strips; 2-year warranty on non-LED glass and frames',
      ],
    },
    'mirror-cabinet': {
      heading: 'Recessed & Surface-Mounted LED Bathroom Mirror Cabinets',
      paragraphs: [
        'Our LED mirror cabinets integrate illuminated grooming mirrors with organized bathroom storage inside rust-proof anodized aluminum or moisture-sealed cabinet bodies. Double-sided mirrored doors, adjustable tempered-glass shelves, and soft-close cushioned hinges maximize daily usability for residential developments, senior living, and hospitality washrooms.',
        'OEM/ODM engineering options include interior shaver/toothbrush sockets (110V–240V market-specific), door-activated IR motion sensors, heated anti-fog door panels, digital clock/temperature readouts, and convertible recessed-or-surface-mount side kits that simplify SKU management for distributors and multi-branch showroom networks.',
        'Single-door, double-door, and triple-door widths from 500mm to 1200mm+ are assembled on dedicated cabinet lines with pre-wired terminal blocks, concealed wire channels, and heavy-duty wall mounting rails for straightforward contractor installation across new-build apartments, hotel renovations, and retail showroom displays.',
      ],
      highlights: [
        'Cabinet construction: Corrosion-resistant anodized aluminum body with double-sided copper-free mirrored doors',
        'Hardware & storage: 110°–165° soft-close stainless hinges and height-adjustable 6mm–8mm tempered glass shelves',
        'Integrated electrics: IP44 bathroom protection, CRI ≥ 90 task lighting, anti-fog pad, and optional internal power outlet',
        'Warranty & MOQ: 3-year warranty on LED/electrical modules; MOQ 50 pcs with custom width and depth tooling',
      ],
    },
    'bathroom-vanity': {
      heading: 'Wall-Hung & Freestanding Bathroom Vanity Cabinets for B2B Projects',
      paragraphs: [
        'BOLEN supplies complete bathroom vanity cabinet assemblies engineered to pair seamlessly with our illuminated mirrors and mirror cabinets for coordinated hospitality, multi-family residential, and showroom collections. Constructed from multi-layer moisture-resistant eucalyptus plywood or high-density waterproof PVC board, each vanity cabinet withstands humid bathroom environments without warping or delamination.',
        'Countertop and basin configurations include seamless one-piece glazed ceramic basins, scratch- and stain-resistant sintered stone slabs with undermount sinks, and pre-drilled single-hole or widespread faucet decks. Full-extension soft-close drawer slides, U-shaped plumbing siphon cutouts, and pre-assembled or flat-pack export crating streamline site installation.',
        'Sourcing bathroom vanities and illuminated mirrors from one factory partner unifies woodgrain, matte lacquer, and hardware finishes across the entire washroom suite while consolidating quality inspection and ocean container loading.',
      ],
      highlights: [
        'Moisture-sealed cabinetry: E1-grade multi-layer waterproof plywood or high-density PVC with PU/melamine finishes',
        'Basin & top options: Sintered stone countertops, solid surface tops, or integrated high-fire vitreous china basins',
        'Commercial hardware: Soft-close damping drawer runners, concealed hinges, and pre-engineered plumbing cutouts',
        'Coordinated sourcing: Standard 600mm–1500mm single/double sink widths, MOQ 30–50 sets, 2-year cabinetry warranty',
      ],
    },
  },
  zh: {
    'hot-sale': {
      heading: '工厂直供热销镜款与高周转批发技术标准',
      paragraphs: [
        '热销镜系列汇集了我们在嘉兴 46,800 平方米自有生产基地长期稳定出货的零售、电商与酒店工程主力型号。全系采用符合 EN 1036 标准的 5mm 无铜环保银镜原片，背面覆贴防爆安全膜，配合 CNC 精磨亮边工艺及阳极氧化铝合金或不锈钢防潮边框，适应高湿卫浴与商业空间长期使用。',
        '针对进口商、区域经销商及自有品牌补货需求，热销系列兼具成熟模具成本优势与完整 OEM 定制深度。采购商可按目标市场指定美规/欧规/英规/澳规插头或预留硬接线、2700K–6500K 无极调光色温、独立防雾发热膜、激光雕刻品牌标识，以及通过 ISTA-3A 跌落测试的电商邮购安全包装，常规大货交期约 25–35 天。',
        '每批次翻单严格对标封样标准，执行原片光学平整度入库检验、带电款 100% 老化点亮与耐压测试及出货前 AQL 抽检，依托上海港与宁波港地理优势高效衔接整柜及多型号拼箱发运。',
      ],
      highlights: [
        '镜片与镀层：5mm EN 1036 无铜无铅环保银镜，标配防飞溅安全背膜与耐腐蚀背漆',
        '照明与质保：高密度 CRI ≥ 90 显指灯带，LED 灯带、电源驱动及触控开关享 3 年质保',
        '非带电结构保障：无灯镜银层、背漆及金属外框结构提供 2 年出厂品质质保',
        '起订与拼柜支持：单款常规起订量 50–100 片，毗邻上海港与宁波港支持多型号拼箱出运',
      ],
    },
    'led-lighted-mirror': {
      heading: 'LED 发光浴室镜 OEM/ODM 光学与电气工程规范',
      paragraphs: [
        'BOLEN 制造背发光、前发光及双光源 LED 浴室镜，采用 5mm 无铜高透银镜、防锈阳极氧化铝底盘以及 IP44/IP54 密封防水电器仓，广泛配套住宅卫浴品牌与星级酒店客房。每米 120–240 珠高密度灯带配合匀光硅胶导光罩实现 CRI ≥ 90 高显色无暗区照明，支持三色温切换记忆、无极调光及独立除雾加热控制。',
        '电气系统严格按出口目的地法规选型配置，可提供北美 UL 962 / ETL、欧洲与英国 CE EN 60598 / RoHS / UKCA 及澳洲 SAA 等认证方案（按具体型号在报价阶段书面确认）。每台成品装箱前均经过 100% 耐压绝缘、接地导通、老化点亮及外观光学全检。',
        '工程团队同时支持定制喷砂透光花纹、蓝牙音响模组、时间温度数显、局部 3 倍/5 倍放大化妆镜及墙控开关联动方案，并配套提供多语种说明书与私模条码外箱定制。',
      ],
      highlights: [
        '光学表现：5mm 无铜银镜原片，CRI ≥ 90 高显指，支持 2700K–6500K 色温调节与断电记忆',
        '防潮防雾：IP44/IP54 防水等级密封驱动电源盒，搭配独立控温 PET 防雾加热膜',
        '合规认证：支持按目标市场匹配 UL、ETL、CE、CB、UKCA、SAA 与 RoHS 认证元器件',
        '售后与包装：LED 及电子电气部件享 3 年质保，采用高密度护角与 ISTA-3A 抗摔外箱',
      ],
    },
    'bathroom-mirror-without-led': {
      heading: '无 LED 有框及无框建筑级浴室镜制造方案',
      paragraphs: [
        '面向搭配独立镜前壁灯的酒店工程、精装公寓与零售家装系列，我们的无 LED 浴室镜选用高平整度 5mm EN 1036 无铜银镜玻璃与多层抗氧化封边背漆，有效抑制潮湿洗漱环境下的黑边腐蚀。边框工艺涵盖拉丝阳极氧化铝、静电粉末喷涂铁框、不锈钢及无框斜边精磨款式。',
        '由于不涉及带电驱动认证周期，无灯浴室镜具备打样速度快、尺寸跨度灵活（从紧凑客卫镜到双盆宽幅主卫镜均可按图生产）以及高装柜利用率等优势。背部配置加厚法式挂条或双向葫芦孔挂片，兼容横挂与竖挂安装。',
        '出厂前品控团队逐批核验金属框拼角平整度、阳极氧化色差一致性、中性盐雾防锈表现及五层瓦楞箱护角抗压强度，确保批量海运与工地集中分发安全可靠。',
      ],
      highlights: [
        '镜面基材：5mm 无铜无铅高清银镜，背面贴覆 CAT-I / CAT-II 防爆防碎安全膜',
        '边框表面处理：哑光黑、拉丝金、香槟铜、拉丝镍、雅白及无框斜边抛光等多种工艺',
        '安装结构：高承重铝合金挂条或多点加固背板挂钩，支持水平与垂直双向安装',
        '质保标准：无 LED 镜面镀银层、防潮背漆与金属镜框结构提供 2 年工厂质保',
      ],
    },
    'full-length-dressing-mirror': {
      heading: '落地支架、靠墙及壁挂全身穿衣镜工程规格',
      paragraphs: [
        '全身穿衣镜系列专为卧室家具品牌、服装买手店、酒店套房及跨境家居零售商打造，常规高度覆盖 1500mm 至 1800mm 以上，确保远距离全身成像清晰无畸变。结构涵盖折叠 U 型落地支架、防倾倒靠墙式及贴墙悬挂三种形态，搭配高强度铝合金窄边、实木框或软包镜框。',
        '针对大尺寸镜面长途海运与快递派送痛点，包装内部采用蜂窝纸板、高密度保丽龙护角及加硬五层瓦楞箱或免熏蒸木托加固。部分穿衣镜款式同时支持选配环绕式 LED 补光灯带与触控调光模块。',
        '无论是拱形、直角矩形还是圆角大全身镜，采购商均可定制型材宽度、哑光或拉丝金属配色、防倾倒墙面固定配件以及适配线上零售渠道的彩标唛头。',
      ],
      highlights: [
        '标准与定制尺寸：常规 1600×500mm、1650×600mm、1800×800mm 及工程定制规格齐全',
        '安全防爆结构：全幅贴覆高粘度防爆背膜，意外受外力冲击时碎片不飞溅脱落',
        '多场景安装：一体式防滑折叠支架、靠墙防倾倒安全绳或墙面横竖双用挂件',
        '质保口径明确：带灯智能款电子元件享 3 年质保；无灯全身镜镜体与边框享 2 年质保',
      ],
    },
    'irregular-mirror': {
      heading: 'CNC 异形轮廓切割与艺术定制镜制造工艺',
      paragraphs: [
        'BOLEN 异形镜系列涵盖不对称流线形、鹅卵石形、云朵形、波浪形及跑道椭圆等现代设计造型，服务于设计师家居品牌、精品酒店与商业空间软装采购。工厂配备全自动 CNC 数控异形切割机与异形磨边线，确保复杂内凹与外凸弧线边缘平滑均匀、无崩边暗裂。',
        '我们可根据客户提供的 CAD / DXF 图纸定做无框背发光悬浮光晕款或贴合轮廓的极窄边框款。高柔韧硅胶匀光霓虹灯带沿异形曲线均匀布光，背部配置多角度挂片，方便终端按空间布局自由旋转悬挂方向。',
        '确认图纸后通常 7–15 天即可交付工程样品，并针对每一款不规则轮廓单独开模定制贴合泡沫内衬，使异形镜在跨境快递与整柜海运中具备同等抗冲击安全性。',
      ],
      highlights: [
        '数控精工：支持导入客户 CAD/DXF 矢量图纸进行 CNC 异形切割与自动圆边抛光',
        '带灯与无灯可选：可选配柔性硅胶匀光背光灯带，或打造纯粹极简无灯装饰镜',
        '多向悬挂背板：配备四向或多角度安全挂钩，满足不同室内设计朝向需求',
        '清晰质保承诺：带 LED 款电气模块享 3 年质保；无 LED 款镜片与框体享 2 年质保',
      ],
    },
    'mirror-cabinet': {
      heading: '嵌入式与明装壁挂 LED 浴室镜柜技术方案',
      paragraphs: [
        'LED 浴室镜柜将高显指洗漱照明与分层收纳空间融为一体，柜体采用防锈阳极氧化铝型材或防潮密封板材打造。双面无铜银镜柜门、可调高度钢化玻璃层板及静音缓冲铰链设计，满足精装住宅、康养公寓及酒店卫浴的高频使用需求。',
        'OEM/ODM 功能模块支持选配柜内美规/欧规/英规剃须刀与电动牙刷插座、开门自动感应亮灯、柜门除雾加热膜、时间温度数显，以及可拆卸侧板设计（同一型号兼容墙面明装与入墙暗装），帮助渠道商精简库存 SKU。',
        '产品线覆盖 500mm 至 1200mm 以上单门、双门及三门规格，内部预置规范接线端子与隐藏式走线槽，并随箱附带高承重铝制挂墙导轨，大幅提升工程现场安装效率。',
      ],
      highlights: [
        '防潮柜体结构：耐腐蚀阳极氧化铝柜体搭配双面高清无铜环保镜门，持久防潮不变形',
        '五金与收纳：不锈钢大角度静音阻尼铰链，配 6mm–8mm 可调高度安全钢化玻璃隔板',
        '集成电气配置：IP44 卫浴防护等级、CRI ≥ 90 镜前照明、门板除雾及可选内置电源插座',
        '质保与起订：LED 照明与电子模组享 3 年质保；常规 50 台起订，支持宽度与进深定制',
      ],
    },
    'bathroom-vanity': {
      heading: '壁挂式与落地式定制浴室柜工程及批发配套方案',
      paragraphs: [
        'BOLEN 定制浴室柜系列专为与我们的 LED 浴室镜及镜柜成套采购而研发，助力卫浴品牌商、酒店工程承包商与建材展厅实现同色系、同尺寸的一站式卫浴配套。主柜甄选 E1 级多层实木防水板或高密度防潮 PVC 板材，经多道封边与防潮涂装工艺处理，在高湿卫浴环境下抗变形、不开裂。',
        '台面与盆体支持高温微晶自洁一体陶瓷盆、耐刮抗污岩板台面配台下盆等多种组合，并可按各国龙头标准预开单孔或三孔龙头孔位。全拉出静音阻尼导轨、U 型避让排水管抽屉结构以及整装或平板拆装出口加固包装，显著降低工程现场安装工时与运输破损率。',
        '在同一自有工厂体系下协同采购浴室主柜与上方智能浴室镜，不仅能够统一木纹色卡、哑光烤漆面与五金拉手色调，还能合并验货流程与集装箱混装计划，优化综合采购成本。',
      ],
      highlights: [
        '防水耐潮柜体：E1 级多层实木防水胶合板或高密度 PVC 板，支持木纹覆膜与哑光烤漆定制',
        '台面与洗漱盆：可选岩板无缝拼接盆、人造石台面或高温烧制易洁釉面一体陶瓷盆',
        '工程级五金结构：品牌静音缓冲抽屉滑轨与阻尼门铰，预留标准 U 型排水检修空间',
        '成套交付与质保：覆盖 600mm–1500mm 单双盆主流宽度，30–50 套起订，柜体结构享 2 年质保',
      ],
    },
  },
  es: {
    'hot-sale': {
      heading: 'Especificaciones mayoristas de espejos de alta rotación directo de fábrica',
      paragraphs: [
        'Nuestra selección de espejos más vendidos reúne los modelos con mayor rotación comercial en retail, comercio electrónico y proyectos hoteleros, fabricados en nuestra planta propia de 46.800 m² en Jiaxing. Cada referencia utiliza vidrio plateado sin cobre de 5 mm según norma EN 1036 con lámina posterior de seguridad contra roturas, cantos pulidos por CNC y marcos de aluminio anodizado o acero inoxidable resistentes a la humedad.',
        'Para importadores, distribuidores y marcas propias que buscan reposición fiable, estos modelos combinan utillaje optimizado con personalización OEM completa. Puede especificar enchufes o conexión directa según normativa local, iluminación regulable de 2700K a 6500K, lámina calefactora antivaho, logotipo grabado por láser y embalaje certificado bajo pruebas de caída ISTA-3A con plazos de producción de 25 a 35 días.',
        'Cada pedido recurrente se verifica frente a muestras patrón aprobadas, controles ópticos del vidrio base, pruebas de envejecimiento eléctrico al 100 % e inspecciones AQL previas al embarque cerca de los puertos de Shanghái y Ningbo.',
      ],
      highlights: [
        'Vidrio y plateado: espejo sin cobre EN 1036 de 5 mm con película protectora inastillable',
        'Iluminación LED: tiras de alta densidad CRI ≥ 90 con garantía de 3 años en componentes eléctricos',
        'Cobertura estructural sin LED: 2 años de garantía en plateado, capa trasera y marcos metálicos',
        'Pedidos flexibles: MOQ estándar de 50–100 uds. por modelo y carga de contenedor mixto cerca de Shanghái',
      ],
    },
    'led-lighted-mirror': {
      heading: 'Ingeniería OEM/ODM y certificaciones en espejos de baño con luz LED',
      paragraphs: [
        'BOLEN fabrica espejos de baño con retroiluminación, luz frontal y doble iluminación construidos con vidrio sin cobre de 5 mm, chasis de aluminio anodizado y cajas eléctricas selladas IP44/IP54 aptas para cuartos de baño residenciales y habitaciones de hotel. Las tiras de 120–240 LED/m ofrecen reproducción cromática CRI ≥ 90 uniforme, regulación continua, memoria de temperatura de color (3000K/4000K/6000K) y sistema antivaho independiente.',
        'Cada conjunto eléctrico se configura conforme a los requisitos del mercado de destino —incluyendo UL 962 / ETL para Norteamérica, CE EN 60598 / RoHS / UKCA para Europa y Reino Unido, y SAA para Australia—, confirmados por modelo en la cotización. El 100 % de las unidades supera ensayos dieléctricos, puesta a tierra, envejecimiento y control óptico antes del embalaje.',
        'Nuestro equipo técnico desarrolla además esmerilados personalizados, módulos de audio Bluetooth, indicadores digitales de reloj y temperatura, zonas de aumento 3X/5X y manuales multilingües con etiquetado privado para grandes cadenas.',
      ],
      highlights: [
        'Rendimiento óptico: vidrio sin cobre de 5 mm, CRI ≥ 90, CCT regulable 2700K–6500K y sensor táctil con memoria',
        'Protección frente a humedad: driver estanco IP44/IP54 con almohadilla térmica antivaho dedicada',
        'Cumplimiento internacional: opciones UL, ETL, CE, CB, UKCA, SAA y RoHS según mercado de destino',
        'Garantía y embalaje: 3 años de garantía en módulos LED y electrónicos; cajas con ensayo de caída ISTA-3A',
      ],
    },
    'bathroom-mirror-without-led': {
      heading: 'Espejos de baño sin LED con marco y sin marco para arquitectura y retail',
      paragraphs: [
        'Pensados para proyectos hoteleros, promociones residenciales y colecciones minoristas que emplean apliques murales independientes, nuestros espejos de baño sin LED utilizan vidrio flotado plateado sin cobre de 5 mm EN 1036 con recubrimiento posterior anticorrosión que previene la oxidación de bordes en ambientes húmedos. Disponemos de marcos en aluminio anodizado cepillado, hierro termolacado, acero inoxidable y cantos biselados sin marco.',
        'Al prescindir de componentes eléctricos, estos espejos permiten un muestreo rápido, escalado dimensional desde aseos compactos hasta tocadores dobles y una alta densidad de carga por contenedor. Los herrajes traseros reforzados admiten instalación mural tanto vertical como horizontal.',
        'Antes de cada despacho verificamos la unión de esquinas, la uniformidad cromática del anodizado entre lotes, la resistencia a niebla salina y el refuerzo perimetral en cajas de exportación de cinco capas o palés de obra.',
      ],
      highlights: [
        'Sustrato óptico: espejo sin cobre ni plomo de 5 mm con lámina trasera de seguridad CAT-I / CAT-II',
        'Acabados de marco: negro mate, oro cepillado, bronce champán, níquel cepillado, blanco y biselado sin marco',
        'Fijación mural: listones metálicos en Z o soportes multipunto reforzados para montaje en ambos sentidos',
        'Garantía estructural: 2 años de garantía de fábrica en plateado, pintura dorsal y estructura del marco',
      ],
    },
    'full-length-dressing-mirror': {
      heading: 'Espejos de vestidor de cuerpo entero de pie, de apoyo y murales',
      paragraphs: [
        'Nuestra línea de espejos de cuerpo entero abastece a marcas de mobiliario, tiendas de moda, suites hoteleras y operadores de comercio electrónico que requieren una reflexión nítida en alturas de 1500 mm a más de 1800 mm. Disponibles con caballete plegable de suelo, apoyo en pared o fijación mural, combinan vidrio de seguridad sin cobre de 4–5 mm con perfiles rígidos de aluminio extruido, madera maciza o marcos tapizados.',
        'La protección logística para formatos grandes está integrada en cada caja mediante paneles alveolares, cantoneras de EPS/EPE de alta densidad y cartón reforzado o paletizado marítimo. Determinadas series admiten iluminación perimetral LED con control táctil.',
        'Tanto en siluetas de arco como rectangulares o de esquinas redondeadas, los compradores pueden personalizar el grosor del perfil, los acabados metálicos cepillados o mates, los kits antivuelco y el etiquetado comercial listo para distribución omnicanal.',
      ],
      highlights: [
        'Formatos estándar y a medida: medidas habituales 1600×500 mm, 1650×600 mm y 1800×800 mm o dimensiones de proyecto',
        'Seguridad ante impactos: película adhesiva posterior completa que retiene fragmentos en caso de golpe',
        'Tres modos de uso: soporte en U con patas antideslizantes, anclaje antivuelco o colgado vertical/horizontal',
        'Garantía diferenciada: 3 años en componentes LED/eléctricos y 2 años en espejos sin LED y estructura',
      ],
    },
    'irregular-mirror': {
      heading: 'Fabricación CNC de espejos irregulares, orgánicos y asimétricos a medida',
      paragraphs: [
        'La colección de espejos irregulares de BOLEN abarca siluetas asimétricas, orgánicas, onduladas, tipo guijarro y cápsula ovalada diseñadas para marcas de interiorismo, hoteles boutique y prescriptores arquitectónicos. Nuestras líneas automatizadas de corte y canteado CNC logran bordes pulidos suaves y uniformes en curvas cóncavas y convexas complejas sin microastillado.',
        'Desarrollamos tanto modelos sin marco con halo retroiluminado como diseños contorneados con perfil fino a partir de sus planos CAD/DXF. Los difusores flexibles de silicona garantizan una luz perimetral continua, mientras que los colgadores traseros multidireccionales facilitan distintas orientaciones en obra.',
        'Los prototipos se completan habitualmente en un plazo de 7 a 15 días tras la aprobación del plano, utilizando moldes internos de espuma troquelados a la medida exacta de cada contorno asimétrico para garantizar envíos seguros.',
      ],
      highlights: [
        'Mecanizado de precisión: corte por control numérico y pulido perimetral directo desde archivos CAD/DXF',
        'Versiones con o sin luz: retroiluminación uniforme con difusor de silicona o espejo decorativo sin LED',
        'Montaje versátil: colgadores traseros en cuatro direcciones para orientación vertical, horizontal o diagonal',
        'Condiciones claras de garantía: 3 años en electrónica LED y 2 años en vidrio y marcos sin iluminación',
      ],
    },
    'mirror-cabinet': {
      heading: 'Armarios con espejo LED empotrables y de superficie para baño',
      paragraphs: [
        'Nuestros armarios con espejo LED combinan iluminación frontal de tocador con almacenamiento interior organizado dentro de cuerpos de aluminio anodizado inoxidable o tableros sellados contra la humedad. Las puertas espejadas de doble cara, las baldas regulables de vidrio templado y las bisagras con cierre amortiguado optimizan el uso diario en viviendas, residencias y hoteles.',
        'Las opciones OEM/ODM incluyen toma interior para afeitado o cepillo eléctrico (110V–240V según país), sensor infrarrojo de apertura de puerta, lámina antivaho en la puerta, indicador digital de hora y kits laterales convertibles para instalación empotrada o mural.',
        'Fabricamos configuraciones de una, dos y tres puertas entre 500 mm y más de 1200 mm de ancho con regletas de conexión precableadas, canalización oculta y rieles de carga pesada para agilizar el trabajo del instalador.',
      ],
      highlights: [
        'Cuerpo anticorrosión: estructura de aluminio anodizado con puertas de espejo sin cobre por ambas caras',
        'Herrajes y estantes: bisagras amortiguadas de 110°–165° y baldas ajustables de vidrio templado de 6–8 mm',
        'Electrónica integrada: protección IP44, luz CRI ≥ 90, sistema antivaho y enchufe interno opcional',
        'Garantía y MOQ: 3 años de garantía en módulos eléctricos/LED; MOQ desde 50 unidades con medidas a medida',
      ],
    },
    'bathroom-vanity': {
      heading: 'Muebles de baño suspendidos y de pie con lavabo para proyectos B2B',
      paragraphs: [
        'BOLEN fabrica conjuntos completos de muebles de baño y muebles de lavabo diseñados para coordinarse en medidas y acabados con nuestros espejos LED y armarios con espejo en proyectos hoteleros, promociones plurifamiliares y exposiciones de baño. Cada mueble emplea tablero contrachapado multicapa resistente a la humedad de grado E1 o PVC hidrófugo de alta densidad para evitar deformaciones en cuartos de baño húmedos.',
        'Las opciones de encimera y lavabo incluyen lavabos integrados de cerámica vitrificada de alta cocción, encimeras de piedra sinterizada resistentes al rayado con poza bajo encimera y perforaciones adaptadas a grifería monomando o de batería. Los cajones de extracción total con freno suave y recorte en U para sifón agilizan el montaje en obra.',
        'Centralizar la compra de muebles de lavabo y espejos iluminados en una misma fábrica permite igualar vetas de madera, lacados mates y tonos de herrajes en todo el conjunto de baño, unificando el control de calidad y la consolidación marítima.',
      ],
      highlights: [
        'Ebanistería hidrófuga: contrachapado multicapa impermeable E1 o PVC de alta densidad con acabados lacados o madera',
        'Encimeras y lavabos: piedra sinterizada, superficie sólida o lavabo cerámico integrado de fácil limpieza',
        'Herrajes de proyecto: guías ocultas de cierre amortiguado, bisagras suaves y hueco en U preconfigurado para desagüe',
        'Suministro coordinado: anchos estándar de 600 a 1500 mm (seno simple o doble), MOQ 30–50 conjuntos y 2 años de garantía',
      ],
    },
  },
  fr: {
    'hot-sale': {
      heading: 'Spécifications de gros direct usine pour nos miroirs à forte rotation',
      paragraphs: [
        'Notre sélection de miroirs à succès regroupe les modèles les plus demandés par les enseignes de détail, le e-commerce et les projets hôteliers, fabriqués au sein de notre usine de 46 800 m² à Jiaxing. Chaque référence utilise un verre argenté sans cuivre de 5 mm conforme à la norme EN 1036 avec film arrière anti-éclats, chants polis par CNC et cadres en aluminium anodisé ou acier inoxydable adaptés aux pièces humides.',
        'Pour les importateurs, distributeurs et marques distributeurs recherchant un réassort fiable, ces modèles associent des outillages éprouvés à une personnalisation OEM complète : fiches secteur locales ou raccordement direct, variation continue 2700K–6500K, film chauffant antibuée, gravure laser du logo et cartons certifiés ISTA-3A avec un délai de série de 25 à 35 jours.',
        'Chaque commande de réassort suit un échantillon témoin consigné, un contrôle optique du verre brut, un test de vieillissement électrique à 100 % et une inspection AQL avant embarquement à proximité des ports de Shanghai et Ningbo.',
      ],
      highlights: [
        'Verre et argenture : miroir sans cuivre EN 1036 de 5 mm avec film de sécurité pare-éclats',
        'Éclairage et électronique : rubans LED haute densité IRC ≥ 90 couverts par une garantie de 3 ans',
        'Garantie structurelle hors LED : garantie usine de 2 ans sur l’argenture, le revêtement dorsal et les cadres',
        'Souplesse logistique : MOQ standard de 50 à 100 pièces par modèle et groupage conteneur près du port de Shanghai',
      ],
    },
    'led-lighted-mirror': {
      heading: 'Ingénierie OEM/ODM et conformité des miroirs de salle de bain LED',
      paragraphs: [
        'BOLEN conçoit et fabrique des miroirs de salle de bain rétroéclairés, à éclairage frontal ou double flux autour d’un verre sans cuivre de 5 mm, d’un châssis en aluminium anodisé et de boîtiers électriques étanches IP44/IP54 destinés aux salles d’eau résidentielles et chambres d’hôtel. Les rubans de 120 à 240 LED/m assurent un rendu des couleurs IRC ≥ 90 sans points lumineux visibles, avec variation continue, mémoire CCT (3000K/4000K/6000K) et antibuée indépendant.',
        'Chaque configuration électrique répond aux normes du marché cible — UL 962 / ETL pour l’Amérique du Nord, CE EN 60598 / RoHS / UKCA pour l’Europe et le Royaume-Uni, SAA pour l’Australie — validées par modèle lors du devis. Chaque miroir subit un contrôle diélectrique, de mise à la terre, de vieillissement et optique à 100 % avant expédition.',
        'Notre bureau d’études accompagne également le sablage sur mesure, l’intégration audio Bluetooth, l’affichage digital heure/température, les zones grossissantes 3X/5X ainsi que les notices multilingues et étiquetages codes-barres à votre marque.',
      ],
      highlights: [
        'Qualité optique : verre sans cuivre 5 mm, IRC ≥ 90, CCT 2700K–6500K réglable et commande tactile à mémoire',
        'Protection salle d’eau : alimentation scellée IP44/IP54 associée à un film chauffant antibuée dédié',
        'Certifications export : configurations UL, ETL, CE, CB, UKCA, SAA et RoHS selon la destination',
        'Garantie et emballage : garantie de 3 ans sur les composants LED/électriques ; cartons testés ISTA-3A',
      ],
    },
    'bathroom-mirror-without-led': {
      heading: 'Miroirs de salle de bain sans LED encadrés et sans cadre',
      paragraphs: [
        'Conçus pour les programmes hôteliers, résidentiels et retail qui associent des appliques murales séparées à une miroiterie architecturale sobre, nos miroirs de salle de bain sans LED emploient un verre argenté sans cuivre de 5 mm EN 1036 doté d’un revêtement dorsal multicouche anticorrosion évitant l’oxydation des bords en milieu humide. Les finitions incluent l’aluminium anodisé brossé, l’acier thermolaqué, l’inox et les bords biseautés.',
        'Exempts de composants électriques, ces modèles permettent un prototypage rapide, un dimensionnement sur mesure du format lave-mains au double plan vasque et une densité de chargement optimale en conteneur. Les fixations arrière renforcées autorisent une pose murale verticale ou horizontale.',
        'Nos contrôles qualité vérifient l’ajustement des angles de cadre, la régularité de teinte d’anodisation entre lots, la tenue au brouillard salin et la protection périphérique en cartons cinq cannelures ou caisses palettes.',
      ],
      highlights: [
        'Miroiterie haute clarté : verre sans cuivre ni plomb de 5 mm avec film de sécurité dorsal CAT-I / CAT-II',
        'Finitions de cadre : noir mat, or brossé, bronze champagne, nickel brossé, blanc et biseau sans cadre',
        'Système d’accroche : barres Z en aluminium ou pattes multipoints renforcées pour double orientation',
        'Garantie structurelle : garantie fabricant de 2 ans sur l’argenture, le revêtement dorsal et le cadre',
      ],
    },
    'full-length-dressing-mirror': {
      heading: 'Miroirs de dressing en pied sur chevalet, à poser ou muraux',
      paragraphs: [
        'Nos miroirs en pied répondent aux besoins des marques d’ameublement, boutiques de prêt-à-porter, suites hôtelières et distributeurs e-commerce recherchant une réflexion sans déformation sur des hauteurs de 1500 mm à plus de 1800 mm. Déclinés en version chevalet autoportant, à appuyer contre le mur ou à suspendre, ils associent un verre de sécurité sans cuivre de 4 à 5 mm à des profilés rigides en aluminium extrudé, bois massif ou cadre gainé.',
        'La résistance au transport grand format est assurée par des panneaux alvéolaires, des cornières EPS/EPE haute densité et des cartons renforcés ou caisses palettisées. Certaines gammes proposent également un éclairage LED périphérique à commande tactile.',
        'Qu’il s’agisse de formes arche, rectangulaires ou à angles adoucis, les acheteurs peuvent personnaliser l’épaisseur du profilé, les teintes métallisées mates ou brossées, les sangles anti-basculement et l’étiquetage logistique omnicanal.',
      ],
      highlights: [
        'Dimensions standard et sur mesure : formats 1600×500 mm, 1650×600 mm, 1800×800 mm et cotes projets',
        'Sécurité anti-éclats : film adhésif intégral au dos retenant les éclats en cas de choc accidentel',
        'Trois modes de pose : pied pliant en U antidérapant, kit anti-basculement mural ou suspension murale',
        'Garantie claire : 3 ans sur les versions LED/électriques ; 2 ans sur les miroirs en pied sans LED et cadres',
      ],
    },
    'irregular-mirror': {
      heading: 'Fabrication CNC de miroirs irréguliers, organiques et asymétriques sur mesure',
      paragraphs: [
        'La collection de miroirs irréguliers BOLEN réunit des silhouettes asymétriques, organiques, ondulées, galet et capsule ovale destinées aux éditeurs de décoration, hôtels-boutiques et architectes d’intérieur. Nos lignes numériques de découpe et de façonnage CNC garantissent un polissage régulier le long des courbes concaves et convexes sans micro-écaillage.',
        'Nous réalisons aussi bien des modèles sans cadre à halo rétroéclairé que des cadres fins épousant le contour exact de vos fichiers CAO/DXF. Les diffuseurs souples en silicone assurent une lumière homogène sur tout le périmètre, tandis que les attaches arrière multi-orientations offrent une liberté de pose complète.',
        'Les prototypes sont généralement livrés sous 7 à 15 jours après validation des plans, avec des calages en mousse découpés sur mesure selon chaque silhouette afin de sécuriser aussi bien l’expédition colis que le fret maritime.',
      ],
      highlights: [
        'Usinage sur plan : découpe numérique CNC et polissage des chants directement à partir de fichiers CAO/DXF',
        'Options lumineuses ou épurées : halo LED diffusé par silicone souple ou silhouette décorative sans LED',
        'Accrochage multiposition : fixations arrière à quatre orientations pour pose verticale ou horizontale',
        'Garantie différenciée : 3 ans sur l’alimentation et les LED ; 2 ans sur le verre et la structure hors LED',
      ],
    },
    'mirror-cabinet': {
      heading: 'Armoires à miroir LED encastrables et en applique pour salle de bain',
      paragraphs: [
        'Nos armoires à miroir LED combinent un éclairage fonctionnel sans ombre et un volume de rangement structuré dans un caisson en aluminium anodisé anticorrosion ou panneau hydrofuge scellé. Les portes miroirs double face, les étagères réglables en verre trempé et les charnières à fermeture amortie répondent aux exigences des logements collectifs et de l’hôtellerie.',
        'Les options OEM/ODM comprennent une prise rasoir intérieure (110V–240V selon le pays), un capteur infrarouge d’ouverture, un film antibuée sur la porte, l’affichage de l’heure et des kits latéraux convertibles permettant une pose encastrée ou murale avec une seule référence.',
        'Disponibles en versions une, deux ou trois portes de 500 mm à plus de 1200 mm de largeur, nos armoires intègrent un bornier pré-câblé, des passages de câbles dissimulés et un rail mural porteur facilitant la pose sur chantier.',
      ],
      highlights: [
        'Caisson anticorrosion : corps en aluminium anodisé et portes miroirs sans cuivre double face',
        'Quincaillerie durable : charnières freinées 110°–165° et tablettes réglables en verre trempé de 6 à 8 mm',
        'Équipement électrique : indice IP44, éclairage IRC ≥ 90, antibuée intégré et prise interne en option',
        'Garantie et série : garantie 3 ans sur les modules LED/électriques ; MOQ 50 pièces avec cotes personnalisables',
      ],
    },
    'bathroom-vanity': {
      heading: 'Meubles vasques suspendus et sur pied sur mesure pour projets B2B',
      paragraphs: [
        'BOLEN fabrique des ensembles complets de meubles de salle de bain conçus pour s’harmoniser en largeur et en finition avec nos miroirs lumineux et armoires à miroir dans les projets hôteliers, résidentiels et salles d’exposition. Chaque caisson est assemblé en contreplaqué multiplis hydrofuge de classe E1 ou en panneau PVC haute densité résistant à l’humidité afin d’éviter tout gonflement ou décollement.',
        'Les configurations de plan incluent des vasques monoblocs en céramique émaillée haute température, des plateaux en pierre frittée résistants aux rayures et aux taches avec vasque sous plan, ainsi que des perçages robinetterie sur demande. Les tiroirs à sortie totale avec amortisseur et découpe siphon en U facilitent l’installation sur chantier.',
        'Approvisionner meubles vasques et miroirs éclairés auprès d’un seul partenaire industriel garantit la cohérence des décors bois, laques mates et finitions métalliques tout en regroupant l’inspection qualité et le chargement conteneur.',
      ],
      highlights: [
        'Menuiserie hydrofuge : contreplaqué marin multiplis E1 ou PVC haute densité avec finitions laquées ou bois',
        'Plans et vasques : pierre frittée, surface solide ou plan-vasque monobloc en céramique vitrifiée',
        'Quincaillerie professionnelle : coulisses à fermeture douce, charnières invisibles et découpe plomberie en U',
        'Offre coordonnée : largeurs standard de 600 à 1500 mm (simple ou double vasque), MOQ 30–50 ensembles, garantie 2 ans',
      ],
    },
  },
  de: {
    'hot-sale': {
      heading: 'Werkseitige Großhandelsspezifikationen für schnelldrehende Spiegelmodelle',
      paragraphs: [
        'Unser Sortiment gefragter Spiegel bündelt bewährte Bestseller für Einzelhandel, E-Commerce und Hotelprojekte aus unserem 46.800 m² großen Produktionswerk in Jiaxing. Jedes Modell besteht aus 5 mm starkem, kupferfreiem Silberspiegelglas nach EN 1036 mit rückseitiger Splitterschutzfolie, präzise CNC-polierten Kanten sowie korrosionsbeständigen Rahmen aus eloxiertem Aluminium oder Edelstahl für feuchte Bäder.',
        'Für Importeure, Fachgroßhändler und Handelsmarken verbinden diese Kernmodelle kurze Rüstzeiten mit vollständiger OEM-Anpassung: länderspezifische Netzstecker oder direkter Wandanschluss, stufenlose Lichtfarbe von 2700K bis 6500K, separate Spiegelheizung gegen Beschlagen, Laser-Logogravur und ISTA-3A-fallgeprüfte Versandkartons bei 25 bis 35 Tagen Serienlieferzeit.',
        'Jeder Folgeauftrag wird anhand freigegebener Referenzmuster, optischer Rohglasprüfungen, eines 100-prozentigen elektrischen Dauerlaufs bei Lichtspiegeln sowie dokumentierter AQL-Endkontrollen vor der Verladung über die Häfen Shanghai und Ningbo abgesichert, sodass Nachbestellungen für Filialnetze und Online-Sortimente konstant in gleicher Verarbeitungsqualität eintreffen.',
      ],
      highlights: [
        'Spiegelglas & Beschichtung: 5 mm kupferfreies EN-1036-Silberglas mit rückseitiger Splitterschutzfolie für hohe Sicherheit',
        'Lichttechnik & Garantie: hochdichte LED-Bänder mit CRI ≥ 90 und 3 Jahren Garantie auf alle Elektronikkomponenten',
        'Strukturgarantie ohne LED: 2 Jahre Werksgarantie auf Silberschicht, Schutzlack und eloxierte Metallrahmen',
        'Bestellflexibilität: Standard-MOQ 50–100 Stück pro Modell sowie wirtschaftliche Mischcontainer-Verladung nahe Shanghai',
      ],
    },
    'led-lighted-mirror': {
      heading: 'OEM/ODM-Technik und Prüfnormen für beleuchtete LED-Badspiegel',
      paragraphs: [
        'BOLEN fertigt hinterleuchtete, frontbeleuchtete und doppelt beleuchtete LED-Badspiegel auf Basis von 5 mm starkem, kupferfreiem Spiegelglas, eloxierten Aluminiumprofilen und abgedichteten IP44/IP54-Elektronikgehäusen für Privatbäder und Hotelzimmer. Hochdichte Lichtbänder mit 120 bis 240 LEDs pro Meter liefern eine gleichmäßige Farbwiedergabe von CRI ≥ 90 ohne sichtbare Lichtpunkte, ergänzt durch stufenloses Dimmen, Farbtemperaturspeicher (3000K/4000K/6000K) und separate Antibeschlagfunktion.',
        'Alle elektrischen Baugruppen werden passend zum Zielmarkt ausgelegt — darunter UL 962 und ETL für Nordamerika, CE EN 60598, RoHS und UKCA für Europa und Großbritannien sowie SAA für Australien — und im Angebot je Modell schriftlich bestätigt. Vor dem Verpacken durchläuft jedes einzelne Gerät eine vollständige Hochspannungs-, Schutzleiter-, Alterungs- und Sichtprüfung.',
        'Darüber hinaus unterstützt unsere Konstruktionsabteilung individuelle Sandstrahldekore, integrierte Bluetooth-Lautsprecher, Digitaluhren mit Temperaturanzeige, 3-fach- oder 5-fach-Vergrößerungsspiegel sowie mehrsprachige Bedienungsanleitungen und kundenspezifische Kartonetiketten für den europäischen und internationalen Fachhandel.',
      ],
      highlights: [
        'Optische Leistung: 5 mm kupferfreies Glas, CRI ≥ 90, 2700K–6500K Farbtemperaturwahl und zuverlässige Touch-Memory-Steuerung',
        'Feuchtraumschutz: gekapseltes IP44/IP54-Treibergehäuse kombiniert mit separat schaltbarer elektrischer Spiegelheizung',
        'Zertifizierungen: UL-, ETL-, CE-, CB-, UKCA-, SAA- und RoHS-Ausführungen passend zum jeweiligen Bestimmungsland',
        'Garantie & Versand: 3 Jahre Garantie auf LED- und Elektronikmodule sowie ISTA-3A-geprüfte Einzelkartons',
      ],
    },
    'bathroom-mirror-without-led': {
      heading: 'Gerahmte und rahmenlose Badspiegel ohne LED für Objekt und Handel',
      paragraphs: [
        'Für Hotelbauten, Wohnanlagen und Handelskollektionen mit separaten Wandleuchten fertigen wir Badspiegel ohne LED aus verzerrungsfreiem, 5 mm starkem, kupferfreiem Silberspiegelglas nach EN 1036 mit mehrlagigem Korrosionsschutzlack gegen Kantenoxidation in dauerhaft feuchten Waschräumen. Zur Auswahl stehen Rahmen aus gebürstetem Aluminium, pulverbeschichtetem Stahl, Edelstahl sowie rahmenlose Spiegel mit Facettenschliff.',
        'Da keine Treiberelektronik erforderlich ist, profitieren Einkäufer von besonders schneller Bemusterung, flexibler Maßanfertigung vom kompakten Gäste-WC bis zum breiten Doppelwaschtisch und einer hohen Auslastung im Seecontainer. Verstärkte Z-Schienen oder Mehrpunkt-Aufhängungen erlauben die sichere Montage im Hoch- und Querformat auf unterschiedlichsten Wanduntergründen im Neubau und in der Sanierung.',
        'Vor dem Versand prüfen unsere Qualitätsteams die Passgenauigkeit der Rahmenecken, die Farbgleichheit der Eloxal- und Pulveroberflächen über alle Fertigungslose hinweg, die Salzsprühnebelbeständigkeit sowie den verstärkten Kantenschutz im fünfwelligen Exportkarton oder in stabilen Projekt-Holzverschlägen für Großbaustellen.',
      ],
      highlights: [
        'Spiegelsubstrat: 5 mm starker, kupfer- und bleifreier Silberspiegel mit geprüfter CAT-I/CAT-II-Splitterschutzfolie',
        'Rahmenoberflächen: Mattschwarz, Gebürstetes Gold, Champagnerbronze, Nickel, Weiß oder klassischer Facettenschliff',
        'Wandmontage: belastbare Aluminium-Keilleisten oder verstärkte Aufhängebleche für senkrechte und waagerechte Montage',
        'Strukturgarantie: 2 Jahre Herstellergarantie auf Versilberung, korrosionsbeständigen Rückseitenlack und Rahmenkonstruktion',
      ],
    },
    'full-length-dressing-mirror': {
      heading: 'Ganzkörper- und Ankleidespiegel als Stand-, Anlehn- oder Wandspiegel',
      paragraphs: [
        'Unsere Ganzkörperspiegel beliefern Möbelmarken, Modehäuser, Hotelsuiten und Onlinehändler, die eine klare, verzerrungsfreie Reflexion über Bauhöhen von 1500 mm bis über 1800 mm benötigen. Erhältlich mit klappbarem Standfuß, als moderner Wand-Anlehnspiegel oder zur flachen Wandmontage, kombinieren sie 4 bis 5 mm starkes, kupferfreies Sicherheitsglas mit verwindungssteifen Aluminium-, Massivholz- oder Polsterrahmen.',
        'Für den bruchsicheren Versand großer Glasformate im Paketdienst und im Überseecontainer sorgen stabile Wabenplatten, hochdichte EPS- und EPE-Eckpolster sowie verstärkte Exportkartons oder Palettenverschläge nach internationalen Falltestvorgaben. Ausgewählte Modellreihen sind zudem mit umlaufender LED-Beleuchtung und sanfter Touch-Dimmung für Ankleidezimmer und Boutiquen erhältlich.',
        'Ob Rundbogen-, Rechteck- oder Soft-Edge-Silhouette: Großabnehmer können Profilbreiten, matte oder gebürstete Metalltöne, Kippsicherungs-Sets für die Wand sowie verkaufsfertige Versand- und Barcodeetiketten für den stationären Möbelhandel und den Direktversand individuell festlegen.',
      ],
      highlights: [
        'Standard- & Sondermaße: gängige Formate wie 1600×500 mm, 1650×600 mm und 1800×800 mm sowie individuelle Projektmaße',
        'Splitterschutz: vollflächige Sicherheitsfolie auf der Rückseite bindet Glassplitter zuverlässig bei Stoßeinwirkung',
        'Drei Montagearten: rutschfester U-Klappständer, Kippsicherung zum sicheren Anlehnen oder direkte Wandaufhängung',
        'Klare Garantiebedingungen: 3 Jahre auf LED-/Elektronikbauteile sowie 2 Jahre auf unbeleuchtete Spiegel und Rahmen',
      ],
    },
    'irregular-mirror': {
      heading: 'CNC-gefertigte asymmetrische und organische Spiegel nach Maß',
      paragraphs: [
        'Die Kollektion unregelmäßiger Spiegel von BOLEN umfasst asymmetrische, organische, wellenförmige, kiesel- und kapselförmige Konturen für Designmarken, Boutique-Hotels und Innenarchitekten. Automatisierte CNC-Zuschnitt- und Schleifanlagen erzeugen gleichmäßig fein polierte Glaskanten entlang komplexer Innen- und Außenradien ganz ohne Muschelausbrüche oder Mikrorisse.',
        'Auf Basis Ihrer CAD- oder DXF-Zeichnungen realisieren wir sowohl rahmenlose Spiegel mit indirektem Lichtkranz als auch exakt konturfolgende Schmalkantenrahmen in individuellen Eloxalfarben. Flexible Silikon-Diffusoren sorgen für eine angenehm homogene Ausleuchtung rund um die organische Form, während Mehrwege-Aufhänger auf der Rückseite mehrere Einbaulagen auf der Baustelle ermöglichen.',
        'Freigabemuster entstehen in der Regel innerhalb von 7 bis 15 Tagen nach Zeichnungsfreigabe; zusätzlich fertigen wir formschlüssig gestanzte Schaumstoffeinlagen passend zu jeder einzelnen Kontur, damit auch asymmetrische Designspiegel beim Einzelpaketversand und Seetransport optimal geschützt bleiben.',
      ],
      highlights: [
        'Präzisionszuschnitt: digitaler CNC-Konturschnitt und automatische Kantenpolitur direkt nach Ihren Kunden-CAD/DXF-Daten für höchste Maßhaltigkeit',
        'Beleuchtet oder puristisch: gleichmäßiges Halo-Backlight mit flexiblem Silikondiffusor oder edle Ausführung ganz ohne LED-Technik',
        'Flexible Aufhängung: rückseitige Vier-Wege-Halterungen für vertikale, horizontale oder frei gedrehte Wandmontage im Objektbau',
        'Garantieumfang: 3 Jahre auf LED-Treiber und Lichtbänder sowie 2 Jahre auf unbeleuchtetes Glas und Rahmen',
      ],
    },
    'mirror-cabinet': {
      heading: 'Unterputz- und Aufputz-LED-Spiegelschränke für Bad und Objektbau',
      paragraphs: [
        'Unsere LED-Spiegelschränke vereinen blendfreie Waschtischbeleuchtung mit durchdachtem Stauraum in korrosionsfreien Gehäusen aus eloxiertem Aluminium oder feuchteversiegelten Korpusplatten. Beidseitig verspiegelte Türen aus kupferfreiem Glas, höhenverstellbare Fachböden aus Sicherheitsglas und gedämpfte Soft-Close-Scharniere bewähren sich im mehrgeschossigen Wohnungsbau und im täglichen Hotelbetrieb.',
        'Zu den OEM- und ODM-Optionen zählen integrierte Rasier- und Ladesteckdosen für 110V bis 240V je Zielmarkt, berührungslose Infrarot-Türsensoren, beheizte Antibeschlag-Türfelder, Digitalanzeigen sowie umrüstbare Seitenblenden für wahlweise Unterputz- oder Aufputzmontage aus einer einzigen Artikelnummer zur Reduzierung der Lagerkomplexität im Großhandel.',
        'Ein-, zwei- und dreitürige Breiten von 500 mm bis über 1200 mm laufen über spezialisierte Schranklinien mit vorverdrahteten Anschlussklemmen, verdeckter Kabelführung und stabilen Aluminium-Montageschienen für eine schnelle, sichere und zeitsparende Installation durch Elektro- und Sanitärbetriebe vor Ort.',
      ],
      highlights: [
        'Korrosionsfreier Korpus: langlebiges eloxiertes Aluminiumgehäuse mit beidseitig verspiegelten kupferfreien Spiegeltüren für feuchte Bäder',
        'Beschläge & Fachböden: 110°–165°-Soft-Close-Edelstahlscharniere und individuell verstellbare 6–8 mm starke Sicherheitsglasböden',
        'Integrierte Elektrik: Schutzart IP44, hohe Lichtqualität mit CRI ≥ 90, elektrische Spiegelheizung und optionale Innensteckdose',
        'Garantie & Serie: 3 Jahre Garantie auf LED- und Elektronikmodule bei einem MOQ ab 50 Stück inklusive individueller Breiten- und Tiefenanpassung',
      ],
    },
    'bathroom-vanity': {
      heading: 'Wandhängende und bodenstehende Badmöbel & Waschtischunterschränke für B2B-Projekte',
      paragraphs: [
        'BOLEN liefert komplett vormontierte oder flach verpackte Waschtischunterschränke, die in Breite, Kantenbild und Oberfläche exakt auf unsere LED-Badspiegel und Spiegelschränke abgestimmt sind — ideal für Hotelprojekte, Wohnanlagen und Badausstellungen. Gefertigt aus mehrschichtigem, wasserfest verleimtem E1-Eukalyptussperrholz oder hochdichten Feuchtraum-PVC-Platten bleiben die Möbelkorpusse auch bei hoher Luftfeuchtigkeit dauerhaft formstabil.',
        'Bei Waschtischen und Abdeckplatten stehen einteilige glasierte Sanitärkeramik-Becken, kratz- und fleckenresistente Sintersteinplatten mit Unterbaubecken sowie maßgebohrte Einloch- oder Dreiloch-Armaturenbänke zur Auswahl. Vollauszüge mit sanftem Selbsteinzug, vorgefertigte U-Siphonausschnitte für gängige Ablaufgarnituren und stoßgeschützte Exportverpackungen mit Eckschutz beschleunigen die Montage auf der Baustelle.',
        'Der gemeinsame Bezug von Waschtischunterschränken und beleuchteten Badspiegeln aus einer einzigen Herstellerhand vereinheitlicht Holzdekore, matte Lacktöne und Griffprofile im gesamten Badprogramm und bündelt sowohl die Werkskontrolle als auch die wirtschaftliche Seecontainer-Konsolidierung für Großabnehmer.',
      ],
      highlights: [
        'Feuchtraumfester Möbelbau: wasserfest verleimtes E1-Mehrschichtsperrholz oder hochdichtes PVC mit widerstandsfähigem Lack- oder Holzdekor',
        'Waschtischvarianten: robuste Sinterstein-Abdeckplatten, moderner Mineralguss oder pflegeleichte einteilige Keramikwaschtische mit Überlauf',
        'Objektbeschläge: gedämpfte Soft-Close-Schubladenführungen mit Vollauszug, verdeckte Topfscharniere und passgenauer U-Siphonausschnitt',
        'Abgestimmte Beschaffung: Standardbreiten von 600 bis 1500 mm als Einzel- oder Doppelwaschtisch, MOQ 30–50 Sets, 2 Jahre Garantie',
      ],
    },
  },
  it: {
    'hot-sale': {
      heading: 'Specifiche all’ingrosso diretto di fabbrica per gli specchi più richiesti',
      paragraphs: [
        'La selezione degli specchi più venduti riunisce i modelli a più alta rotazione per retail, e-commerce e forniture alberghiere prodotti nello stabilimento BOLEN di 46.800 m² a Jiaxing. Ogni articolo impiega vetro argentato senza rame da 5 mm conforme a EN 1036 con pellicola posteriore antisfondamento, bordi lucidati a controllo numerico e telai in alluminio anodizzato o acciaio inox adatti ad ambienti umidi.',
        'Per importatori, distributori e marchi private label che cercano riassortimenti rapidi, questi modelli uniscono attrezzature consolidate e personalizzazione OEM completa: spine locali o cablaggio diretto, regolazione continua 2700K–6500K, tappetino antiappannamento, incisione laser del logo e imballaggi testati ISTA-3A con produzione in 25–35 giorni.',
        'Ogni lotto ripetitivo segue campioni di riferimento archiviati, ispezioni ottiche sulle lastre in ingresso, collaudo elettrico al 100% sui modelli illuminati e controlli AQL pre-imbarco vicino ai porti di Shanghai e Ningbo.',
      ],
      highlights: [
        'Vetro e argentatura: specchio senza rame EN 1036 da 5 mm con pellicola protettiva antischeggia',
        'Illuminazione ed elettronica: strisce LED ad alta densità CRI ≥ 90 con 3 anni di garanzia elettrica',
        'Copertura strutturale non LED: 2 anni di garanzia su argentatura, vernice protettiva e telai metallici',
        'Lotti flessibili: MOQ standard 50–100 pezzi per modello e carico container misto vicino al porto di Shanghai',
      ],
    },
    'led-lighted-mirror': {
      heading: 'Ingegneria OEM/ODM e conformità per specchi da bagno illuminati a LED',
      paragraphs: [
        'BOLEN produce specchi da bagno retroilluminati, a luce frontale e a doppia emissione realizzati con vetro senza rame da 5 mm, telai in alluminio anodizzato e vani elettrici sigillati IP44/IP54 per bagni residenziali e camere d’albergo. Le strisce da 120–240 LED/m garantiscono resa cromatica CRI ≥ 90 uniforme senza punti visibili, dimmerazione continua, memoria CCT (3000K/4000K/6000K) e funzione antiappannamento separata.',
        'Ogni gruppo elettrico è configurato secondo le normative del mercato di destinazione — inclusi UL 962 / ETL per il Nord America, CE EN 60598 / RoHS / UKCA per Europa e Regno Unito e SAA per l’Australia — confermate per singolo modello in fase di preventivo. Il 100% dei pezzi supera test dielettrici, messa a terra, invecchiamento e controllo ottico prima dell’imballo.',
        'Il reparto tecnico sviluppa inoltre sabbiature su disegno, moduli audio Bluetooth, display orologio/temperatura, inserti ingranditori 3X/5X e manualistica multilingue con etichettatura privata per la grande distribuzione.',
      ],
      highlights: [
        'Prestazioni ottiche: vetro senza rame 5 mm, CRI ≥ 90, CCT 2700K–6500K regolabile e comando touch con memoria',
        'Protezione dall’umidità: alimentatore stagno IP44/IP54 abbinato a pellicola riscaldante antiappannamento',
        'Certificazioni export: configurazioni UL, ETL, CE, CB, UKCA, SAA e RoHS in base al Paese di destinazione',
        'Garanzia e imballo: 3 anni di garanzia sui componenti LED ed elettronici; scatole certificate ISTA-3A',
      ],
    },
    'bathroom-mirror-without-led': {
      heading: 'Specchi da bagno senza LED con e senza cornice per contract e distribuzione',
      paragraphs: [
        'Progettati per hotel, complessi residenziali e collezioni retail che abbinano applique murali indipendenti a superfici specchianti pulite, i nostri specchi da bagno senza LED utilizzano vetro argentato senza rame da 5 mm EN 1036 con verniciatura dorsale multistrato anticorrosione contro l’ossidazione dei bordi. Le finiture includono alluminio anodizzato spazzolato, metallo verniciato a polvere, acciaio inox e bordi bisellati.',
        'L’assenza di componenti elettrici consente campionature rapide, sviluppo su misura dal bagno di servizio al doppio lavabo e un’elevata resa di carico in container. Le staffe posteriori rinforzate supportano il fissaggio murale sia verticale sia orizzontale.',
        'Prima della spedizione verifichiamo la precisione delle giunzioni angolari, l’uniformità cromatica dell’anodizzazione tra i lotti, la resistenza alla nebbia salina e le protezioni angolari in cartoni export a cinque onde.',
      ],
      highlights: [
        'Lastra specchiante: specchio senza rame né piombo da 5 mm con pellicola di sicurezza CAT-I / CAT-II',
        'Finiture cornice: nero opaco, oro spazzolato, bronzo champagne, nichel spazzolato, bianco e bisellato a filo',
        'Sistema di fissaggio: barre a Z in alluminio o ganci multipunto rinforzati per doppio orientamento',
        'Garanzia strutturale: 2 anni di garanzia di fabbrica su argentatura, strato protettivo e telaio',
      ],
    },
    'full-length-dressing-mirror': {
      heading: 'Specchi a figura intera da terra, da appoggio e a parete',
      paragraphs: [
        'I nostri specchi da guardaroba a figura intera servono marchi di arredamento, boutique di abbigliamento, suite alberghiere e operatori e-commerce che richiedono una riflessione priva di distorsioni su altezze da 1500 mm a oltre 1800 mm. Disponibili con cavalletto pieghevole autoportante, da appoggio a parete o sospesi a muro, uniscono vetro di sicurezza senza rame da 4–5 mm a profili rigidi in alluminio estruso, legno massello o telai rivestiti.',
        'La protezione logistica dei grandi formati integra pannelli a nido d’ape, paraspigoli in EPS/EPE ad alta densità e cartoni rinforzati o casse pallettizzate. Alcune linee offrono anche illuminazione perimetrale LED con regolazione touch.',
        'Sia nelle sagome ad arco sia nei formati rettangolari o con angoli raggiati, i buyer possono personalizzare lo spessore del profilo, le finiture metalliche opache o spazzolate, i kit antiribaltamento e le etichette logistiche omnicanale.',
      ],
      highlights: [
        'Misure standard e su progetto: formati 1600×500 mm, 1650×600 mm, 1800×800 mm e dimensioni personalizzate',
        'Sicurezza antischeggia: pellicola adesiva integrale sul retro che trattiene i frammenti in caso d’urto',
        'Tre modalità di posa: supporto a U antiscivolo, kit antiribaltamento a parete o montaggio murale',
        'Termini di garanzia: 3 anni sulle varianti con LED/elettronica; 2 anni su specchi senza LED e telai',
      ],
    },
    'irregular-mirror': {
      heading: 'Produzione CNC di specchi irregolari, organici e asimmetrici su misura',
      paragraphs: [
        'La collezione di specchi irregolari BOLEN propone sagome asimmetriche, organiche, ondulate, a ciottolo e a capsula ovale dedicate a brand d’interni, boutique hotel e progettisti. Le linee automatizzate di taglio e molatura CNC assicurano bordi levigati e uniformi lungo curve concave e convesse complesse senza micro-scheggiature.',
        'Realizziamo sia modelli senza cornice con alone retroilluminato sia profili sottili sagomati direttamente dai vostri file CAD/DXF. I diffusori flessibili in silicone distribuiscono la luce in modo omogeneo lungo il perimetro, mentre gli attacchi posteriori multidirezionali permettono diverse pose in cantiere.',
        'I campioni prototipo vengono completati in 7–15 giorni dall’approvazione dei disegni, con imbottiture in schiuma fustellate su misura per ogni singolo contorno irregolare così da proteggere le spedizioni corriere e marittime.',
      ],
      highlights: [
        'Lavorazione da disegno: taglio CNC sagomato e lucidatura perimetrale direttamente da file CAD/DXF',
        'Versioni luminose o neutre: retroilluminazione diffusa in silicone o silhouette decorativa senza LED',
        'Fissaggio versatile: ganci posteriori a quattro orientamenti per posa verticale, orizzontale o libera',
        'Copertura chiara: 3 anni su driver e strisce LED; 2 anni su vetro e cornici prive di illuminazione',
      ],
    },
    'mirror-cabinet': {
      heading: 'Armadietti con specchio LED da incasso e a parete per il bagno',
      paragraphs: [
        'I nostri armadietti con specchio LED integrano illuminazione frontale ad alta resa cromatica e vani contenitori ordinati in scocche di alluminio anodizzato antiruggine o pannelli sigillati contro l’umidità. Ante specchiate bifacciali, ripiani regolabili in vetro temperato e cerniere ammortizzate soft-close rispondono alle esigenze di complessi residenziali e strutture ricettive.',
        'Le personalizzazioni OEM/ODM includono presa interna per rasoio o spazzolino (110V–240V secondo il Paese), sensore IR di apertura anta, funzione antiappannamento, display orologio e kit laterali convertibili per installazione ad incasso o a parete.',
        'Disponibili a una, due o tre ante da 500 mm a oltre 1200 mm di larghezza, gli armadietti vengono assemblati con morsettiere precablate, passacavi nascosti e binari murali ad alta portata per agevolare gli installatori.',
      ],
      highlights: [
        'Scocca anticorrosione: struttura in alluminio anodizzato con ante specchiate senza rame su entrambi i lati',
        'Ferramenta e ripiani: cerniere inox ammortizzate 110°–165° e mensole regolabili in vetro temperato 6–8 mm',
        'Dotazione elettrica: grado IP44, luce CRI ≥ 90, tappetino antiappannamento e presa interna opzionale',
        'Garanzia e lotti: 3 anni di garanzia sui moduli LED/elettrici; MOQ 50 pezzi con misure personalizzabili',
      ],
    },
    'bathroom-vanity': {
      heading: 'Mobili da bagno sospesi e a terra con lavabo per forniture B2B',
      paragraphs: [
        'BOLEN fornisce mobili lavabo completi progettati per abbinarsi per larghezza e finitura ai nostri specchi illuminati e armadietti con specchio in progetti alberghieri, residenziali multifamiliari e showroom. Ogni mobile è realizzato in multistrato marino idrofugo di classe E1 o pannelli in PVC ad alta densità resistenti all’umidità per evitare rigonfiamenti o delaminazioni nel tempo.',
        'Le soluzioni top e lavabo comprendono lavabi monoblocco in ceramica smaltata ad alta temperatura, piani in pietra sinterizzata resistenti a graffi e macchie con vasca sottopiano e forature rubinetteria personalizzate. Cassetti ad estrazione totale con chiusura rallentata e sagomatura a U per il sifone velocizzano il montaggio in cantiere.',
        'Acquistare mobili da bagno e specchi illuminati da un unico produttore consente di coordinare essenze legno, laccature opache e finiture metalliche nell’intero ambiente bagno, semplificando il controllo qualità e il carico container.',
      ],
      highlights: [
        'Struttura idrofuga: multistrato impermeabile E1 o PVC ad alta densità con finiture laccate opache o effetto legno',
        'Piani e lavabi: pietra sinterizzata, solid surface o lavabo integrato in ceramica sanitaria smaltata',
        'Ferramenta contract: guide ammortizzate soft-close, cerniere a scomparsa e vano sifone a U predefinito',
        'Fornitura coordinata: larghezze standard 600–1500 mm (vasca singola o doppia), MOQ 30–50 set, garanzia 2 anni',
      ],
    },
  },
};

export function getCatalogCategoryEditorial(
  lang: string,
  slug: string
): CatalogCategoryEditorial | null {
  const byLang = Object.hasOwn(CATEGORY_EDITORIAL, lang)
    ? CATEGORY_EDITORIAL[lang as SupportedLanguage]
    : undefined;
  return byLang && Object.hasOwn(byLang, slug)
    ? byLang[slug as CategorySeoSlug]
    : null;
}

const RETIRED_CATEGORY_SLUG_TARGETS: Readonly<Record<string, string>> = {
  'framed-led-mirror': 'led-lighted-mirror',
  'frameless-led-mirror': 'led-lighted-mirror',
  'rectangle-led-mirror': 'led-lighted-mirror',
  'magnifying-makeup-mirror': 'led-lighted-mirror',
  'new-arrival': 'hot-sale',
};

const CANONICAL_CATEGORY_NAMES_BY_SLUG: Readonly<Record<string, string>> = {
  'hot-sale': 'Hot Sale',
  'led-lighted-mirror': 'Led Lighted Mirror',
  'bathroom-mirror-without-led': 'Bathroom Mirror without led',
  'full-length-dressing-mirror': 'Full Length Dressing Mirror',
  'irregular-mirror': 'Irregular Mirror',
  'mirror-cabinet': 'Mirror Cabinet',
  'bathroom-vanity': 'Bathroom Vanity',
};

export function toCategorySlug(name: string): string {
  return toSlug(name || '');
}

export function canonicalCategoryName(name: string | undefined | null): string | null {
  if (!name) return null;
  const slug = toCategorySlug(name);
  if (!slug || slug === 'uncategorized') return null;
  const targetSlug = Object.hasOwn(RETIRED_CATEGORY_SLUG_TARGETS, slug)
    ? RETIRED_CATEGORY_SLUG_TARGETS[slug]
    : slug;
  return CANONICAL_CATEGORY_NAMES_BY_SLUG[targetSlug] ?? name;
}

export function catalogCategoryPath(name: string): string {
  const slug = toCategorySlug(name);
  if (!slug || slug === 'uncategorized') return '/products';
  const targetSlug = Object.hasOwn(RETIRED_CATEGORY_SLUG_TARGETS, slug)
    ? RETIRED_CATEGORY_SLUG_TARGETS[slug]
    : slug;
  return `${CATALOG_CATEGORY_PREFIX}/${targetSlug}`;
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
  const mappedA = Object.hasOwn(RETIRED_CATEGORY_SLUG_TARGETS, slugA)
    ? RETIRED_CATEGORY_SLUG_TARGETS[slugA]
    : slugA;
  const mappedB = Object.hasOwn(RETIRED_CATEGORY_SLUG_TARGETS, slugB)
    ? RETIRED_CATEGORY_SLUG_TARGETS[slugB]
    : slugB;
  if (mappedA && mappedA === mappedB) return true;
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
  id?: string;
  category?: string;
  /** Original product title; display names and URL translations are separate. */
  title: string;
  /** Localized display name, when available. */
  name?: string;
  image?: string;
}

/**
 * Shared ProductDetail BreadcrumbList JSON-LD used by both `src/pages/ProductDetail.tsx`
 * and `scripts/prerender-static.ts` so `react-helmet-async` `isEqualNode` matches
 * byte-for-byte across all 6 languages and includes the Category item when present.
 */
export function buildProductBreadcrumbSchema(opts: {
  lang: string;
  homeLabel: string;
  catalogLabel: string;
  categoryName?: string | null;
  categoryLabel?: string;
  productTitle: string;
  productUrl: string;
}): Record<string, unknown> {
  const catPath = opts.categoryName ? catalogCategoryPath(opts.categoryName) : '/products';
  const hasCategory = Boolean(opts.categoryName && catPath !== '/products' && opts.categoryLabel);
  const items: Array<Record<string, unknown>> = [
    { '@type': 'ListItem', position: 1, name: opts.homeLabel, item: `${SITE_URL}/${opts.lang}/` },
    { '@type': 'ListItem', position: 2, name: opts.catalogLabel, item: `${SITE_URL}/${opts.lang}/products/` },
  ];
  if (hasCategory) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: opts.categoryLabel!,
      item: `${SITE_URL}/${opts.lang}${catPath}/`,
    });
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: opts.productTitle,
      item: opts.productUrl,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: opts.productTitle,
      item: opts.productUrl,
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
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
      url: `${SITE_URL}/${opts.lang}${productDetailPath({ ...product, category: product.category || opts.slug }, opts.lang)}/`,
      ...(product.image ? { image: toMediaUrl(product.image) } : {}),
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
