/**
 * Shared product SEO helpers.
 *
 * Imported by BOTH src/pages/ProductDetail.tsx (runtime, via react-helmet-async)
 * and scripts/prerender-static.ts (build time). These two used to hold separate
 * copies of the same logic, which meant Helmet could overwrite a prerendered
 * <title>/<meta description> with a differently-derived value on mount.
 *
 * Localized strings are passed IN rather than resolved here: the runtime gets
 * them from i18next, the prerenderer from its own COPY table.
 */

import { toMediaUrl } from './media';

export interface ProductSeoFields {
  title: string;
  description?: string;
  details?: string;
  specifications?: unknown;
  seo?: ProductSeoMetadata | null;
}

export const PRODUCT_SEO_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
export type ProductSeoLanguage = (typeof PRODUCT_SEO_LANGUAGES)[number];
export type ProductSeoField = 'title' | 'description' | 'h1';
export type ProductSeoOverrides = Partial<Record<ProductSeoField, string>>;
export type ProductSeoMetadata = Partial<Record<ProductSeoLanguage, ProductSeoOverrides>>;
export type ResolvedProductSeo = Record<ProductSeoField, string>;

// Editorial reference ranges only, not Google limits or validation constraints.
// Chinese glyphs usually need more display width than Latin characters.
const PRODUCT_SEO_LENGTH_RECOMMENDATIONS = {
  latin: {
    title: { min: 50, max: 60 },
    description: { min: 140, max: 160 },
    h1: { min: 20, max: 70 },
  },
  zh: {
    title: { min: 25, max: 30 },
    description: { min: 70, max: 90 },
    h1: { min: 10, max: 30 },
  },
} as const;

/** Use the content language, not the admin interface language. */
export function getProductSeoLengthRecommendation(field: ProductSeoField, language: ProductSeoLanguage) {
  return PRODUCT_SEO_LENGTH_RECOMMENDATIONS[language === 'zh' ? 'zh' : 'latin'][field];
}

/** Only persist supported, nonblank plain-text overrides; blanks restore defaults. */
export function normalizeProductSeo(value: unknown): ProductSeoMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: ProductSeoMetadata = {};
  for (const lang of PRODUCT_SEO_LANGUAGES) {
    const entry = (value as Record<string, unknown>)[lang];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const fields: ProductSeoOverrides = {};
    for (const field of ['title', 'description', 'h1'] as const) {
      const raw = (entry as Record<string, unknown>)[field];
      if (typeof raw !== 'string') continue;
      const text = collapseWhitespace(raw);
      if (text) fields[field] = text;
    }
    if (Object.keys(fields).length > 0) result[lang] = fields;
  }
  return result;
}

/** Shared by the admin preview, public page and static HTML. Never changes URLs. */
export function resolveProductSeo(
  product: ProductSeoFields,
  lang: string,
  defaults: { titleSuffix: string; descriptionTemplate: string }
): ResolvedProductSeo {
  const language = lang.toLowerCase().split('-')[0] as ProductSeoLanguage;
  const overrides = normalizeProductSeo(product.seo)[language];
  return {
    // Manual titles are not truncated and do not get another brand suffix.
    title: overrides?.title || buildProductSeoTitle(product.title, defaults.titleSuffix),
    description: overrides?.description || buildProductDescription(product, defaults.descriptionTemplate),
    h1: overrides?.h1 || product.title,
  };
}

/**
 * Flattens markdown to a single line of prose, for <meta> content and JSON-LD.
 * Strips fences, images, list bullets and heading markers, and unwraps links to
 * their label. Not a parser — product `details` is prose with light markdown,
 * and this only needs to be good enough for a ~160-character summary.
 */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    // Photo descriptions escape brackets ("\]"), which must not end the alt text.
    .replace(/!\[(?:\\.|[^\\\]])*\]\((?:\\.|[^\\)])*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Flattens any run of whitespace (including newlines) to single spaces. */
export function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Truncates at a word boundary, appending an ellipsis only if it actually cut. */
export function truncateAtWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  // CJK has no spaces — fall back to a hard cut rather than returning nothing.
  const base = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.\-—]+$/, '')}…`;
}

/**
 * Product `specifications` arrives from Supabase either as an array of
 * {key,value} or as a plain object. Normalizes both to entry pairs, dropping
 * blanks so an empty spec table is never rendered.
 *
 * Keys are de-duplicated case-insensitively, first occurrence wins: the live
 * data has rows like Installation/"Wall-mounted" and Installation/"Wall-Mounted"
 * on the same product, which would otherwise emit a duplicate <dt> and a
 * duplicate schema.org additionalProperty.
 */
export function normalizeSpecs(specs: unknown): Array<{ key: string; value: string }> {
  if (!specs) return [];
  const raw: Array<{ key: unknown; value: unknown }> = Array.isArray(specs)
    ? (specs as Array<{ key: unknown; value: unknown }>)
    : Object.entries(specs as Record<string, unknown>).map(([key, value]) => ({ key, value }));
  const seen = new Set<string>();
  const out: Array<{ key: string; value: string }> = [];
  for (const e of raw) {
    const key = String(e?.key ?? '').trim();
    const value = String(e?.value ?? '').trim();
    if (!key || !value) continue;
    const dedupeKey = key.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({ key, value });
  }
  return out;
}

/**
 * Meta description for a product.
 *
 * Source preference: `details` (real marketing prose, 400-2400 chars, and
 * translated per-language) > `description` > localized boilerplate. The
 * `description` column in Supabase currently holds bare model codes
 * ("CTL609", 6-43 chars), which is why the >=30 guard exists and why `details`
 * has to be tried first — otherwise every product falls through to the template
 * and all product pages share one meta description.
 *
 * @param fallbackTemplate Localized sentence containing a `{title}` token.
 */
export function buildProductDescription(
  product: ProductSeoFields,
  fallbackTemplate: string
): string {
  const details = product.details ? markdownToPlainText(product.details) : '';
  if (details.length >= 50) {
    // Lead with the product name. Several products share identical `details`
    // copy in Supabase (12 of 71 open with the same feature list), so a
    // details-only description would still be duplicated across pages; titles
    // are unique per slug, which makes every description unique.
    const lead = `${product.title} — `;
    return lead + truncateAtWord(details, Math.max(60, 155 - lead.length));
  }
  // collapseWhitespace, not just trim: at least one product's `description`
  // column contains hard line breaks, which would otherwise land raw inside the
  // <meta content="..."> attribute.
  const description = product.description ? collapseWhitespace(product.description) : '';
  if (description.length >= 30) {
    return truncateAtWord(description, 155);
  }
  return fallbackTemplate.replace('{title}', product.title);
}

/**
 * Short buyer-facing card copy derived from the product's real long-form copy.
 * Legacy `description` values are often model numbers, so they are only used
 * when they read like prose. The return value is intentionally empty when no
 * trustworthy summary exists; ProductCard then uses its localized OEM fallback.
 */
export function buildProductBuyerSummary(
  product: Pick<ProductSeoFields, 'description' | 'details'>,
  max = 185
): string {
  const details = product.details ? markdownToPlainText(product.details) : '';
  if (details.length >= 50) return truncateAtWord(details, max);

  const description = product.description ? collapseWhitespace(product.description) : '';
  if (description.length >= 60) return truncateAtWord(description, max);
  return '';
}

/**
 * Title for a product page. Google truncates around 60 characters; raw product
 * titles here run to 121, so trim to a word boundary and always leave room for
 * the brand suffix — previously any title over 55 chars got no brand at all and
 * was cut mid-phrase in SERPs.
 *
 * @param suffix Localized brand suffix, e.g. "| BOLEN Mirror".
 */
export function buildProductSeoTitle(title: string, suffix: string): string {
  const clean = collapseWhitespace(title);
  const budget = 60 - suffix.length - 1;
  const trimmed = clean.length > budget ? truncateAtWord(clean, budget) : clean;
  return `${trimmed} ${suffix}`;
}

export interface ProductPriceBounds {
  lowPrice: number;
  highPrice: number;
}

function extractPositiveNumbers(raw?: string | null): number[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  // Remove thousands separators inside numbers (e.g. "$1,200-$1,550.50") without
  // merging comma-separated values like "$20,$40".
  const normalized = raw.replace(/(\d),(?=\d{3}(?!\d))/g, '$1');
  return (normalized.match(/\d+(?:\.\d+)?/g) ?? [])
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

/**
 * Extracts positive numeric low/high price bounds from `price_range`, falling
 * back to `msrp` when `price_range` contains no positive number. Returns
 * `{ lowPrice: 0, highPrice: 0 }` for truly price-less quote-only products.
 */
export function parseProductPriceBounds(
  priceRange?: string | null,
  msrp?: string | null
): ProductPriceBounds {
  const fromRange = extractPositiveNumbers(priceRange);
  const nums = fromRange.length > 0 ? fromRange : extractPositiveNumbers(msrp);
  if (nums.length === 0) return { lowPrice: 0, highPrice: 0 };
  if (nums.length === 1) return { lowPrice: nums[0], highPrice: nums[0] };
  return { lowPrice: Math.min(...nums), highPrice: Math.max(...nums) };
}

export interface ProductJsonLdInput {
  id: string;
  name: string;
  description: string;
  url: string;
  images?: readonly string[] | null;
  specifications?: unknown;
  priceRange?: string | null;
  msrp?: string | null;
}

/**
 * Builds the schema.org `Product` JSON-LD object shared by both
 * `src/pages/ProductDetail.tsx` and `scripts/prerender-static.ts`.
 *
 * - Priced products (`lowPrice > 0`): emits a Google Product Snippets-valid
 *   single-seller `Offer` with top-level `price` + `priceCurrency` (and
 *   `UnitPriceSpecification` with `price`, `minPrice`, `maxPrice` when
 *   `highPrice > lowPrice`), omitting `availability` to avoid unverified
 *   in-stock claims on made-to-order B2B items.
 * - Price-less products (`lowPrice === 0`): returns `null` so pages emit only
 *   `BreadcrumbList` instead of an invalid `Product` missing
 *   `offers`/`review`/`aggregateRating`.
 */
export function buildProductJsonLd(input: ProductJsonLdInput): Record<string, unknown> | null {
  const { lowPrice, highPrice } = parseProductPriceBounds(input.priceRange, input.msrp);
  if (lowPrice <= 0) return null;

  const specs = normalizeSpecs(input.specifications);
  const images = (input.images ?? [])
    .filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    .map((image) => toMediaUrl(image));

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: input.name,
    image: images,
    description: input.description,
    sku: input.id,
    brand: {
      '@type': 'Brand',
      name: 'BOLEN',
    },
    ...(specs.length > 0
      ? {
          additionalProperty: specs.map((s) => ({
            '@type': 'PropertyValue',
            name: s.key,
            value: s.value,
          })),
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: input.url,
      priceCurrency: 'USD',
      price: lowPrice,
      itemCondition: 'https://schema.org/NewCondition',
      ...(highPrice > lowPrice
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: lowPrice,
              minPrice: lowPrice,
              maxPrice: highPrice,
              priceCurrency: 'USD',
            },
          }
        : {}),
    },
  };
}
