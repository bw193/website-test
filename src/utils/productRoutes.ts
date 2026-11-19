import legacyAliases from '../data/legacyProductAliases.json';
import routeData from '../data/productRoutes.json';
import type { SupportedLanguage } from '../hooks/useLocalizedPath';
import { catalogCategoryPath } from './catalogCategory';
import { parseProductParam, toSlug } from './slug';

export interface ProductRoute {
  category: string;
  slugs: Record<SupportedLanguage, string>;
}

export interface RoutableProduct {
  id?: string;
  title: string;
  category?: string | null;
}

// A compact build-time index keeps links synchronous, including before the
// much larger display-translation files have loaded. Never derive URLs from SEO.
export const PRODUCT_ROUTES = routeData as Record<string, ProductRoute>;
const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;

// Historical English & localized slugs (spelling fixes, August title renames,
// and Oct 14 published translations) mapped to their active product IDs, plus
// discontinued product slugs mapped to their closest active category page.
const LEGACY_SLUG_IDS: Readonly<Record<string, string>> = legacyAliases.activeSlugIds;
const DISCONTINUED_CATEGORY_BY_SLUG: Readonly<Record<string, string>> =
  legacyAliases.discontinuedCategoryBySlug;

const KNOWN_PRODUCT_CATEGORIES = new Set<string>([
  ...Object.values(PRODUCT_ROUTES).map((route) => route.category),
  'hot-sale',
  'led-lighted-mirror',
  'bathroom-mirror-without-led',
  'full-length-dressing-mirror',
  'irregular-mirror',
  'mirror-cabinet',
  'bathroom-vanity',
  'rectangle-led-mirror',
  'framed-led-mirror',
  'frameless-led-mirror',
  'magnifying-makeup-mirror',
  'new-arrival',
  'uncategorized',
]);

function routePath(route: ProductRoute, lang: string): string {
  const slug = route.slugs[lang as SupportedLanguage] || route.slugs.en;
  return `/products/${route.category}/${encodeURIComponent(slug)}`;
}

export function productDetailPath(product: RoutableProduct, lang: string): string {
  const route = product.id ? PRODUCT_ROUTES[product.id] : undefined;
  if (route) return routePath(route, lang);
  // Newly added products remain reachable until the next translated build.
  return `/products/${toSlug(product.category || '') || 'uncategorized'}/${toSlug(product.title) || product.id || 'product'}`;
}

export function productAlternatePaths(product: RoutableProduct): Record<SupportedLanguage, string> {
  return Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, productDetailPath(product, lang)])) as Record<SupportedLanguage, string>;
}

export function parseProductDetailPath(pathname: string): {
  lang: string; category?: string; param: string;
} | null {
  let decoded: string;
  try { decoded = decodeURI(pathname); } catch { return null; }
  const match = decoded.match(/^\/(?:(en|zh|es|fr|de|it)\/)?products\/(?!category(?:\/|$))([^/]+)(?:\/([^/]+))?\/?$/);
  if (!match) return null;
  return { lang: match[1] || 'en', category: match[3] ? match[2] : undefined, param: match[3] || match[2] };
}

/** Match canonical routes, old slugs, category moves and UUID links to the same row. */
export function findProductRoute(pathname: string): (ProductRoute & { id: string }) | null {
  const parsed = parseProductDetailPath(pathname);
  if (!parsed) return null;
  if (parsed.category && !KNOWN_PRODUCT_CATEGORIES.has(parsed.category)) return null;
  const { slug, legacyId } = parseProductParam(parsed.param);
  if (legacyId && PRODUCT_ROUTES[legacyId]) return { id: legacyId, ...PRODUCT_ROUTES[legacyId] };
  const aliasId = Object.hasOwn(LEGACY_SLUG_IDS, slug) ? LEGACY_SLUG_IDS[slug] : undefined;
  if (aliasId && PRODUCT_ROUTES[aliasId]) return { id: aliasId, ...PRODUCT_ROUTES[aliasId] };
  const candidates = Object.entries(PRODUCT_ROUTES).filter(([, route]) =>
    Object.values(route.slugs).includes(slug),
  );
  // Prefer exact category + requested locale when multiple candidates exist.
  const sameCategory = parsed.category
    ? candidates.filter(([, route]) => route.category === parsed.category)
    : candidates;
  const pool = sameCategory.length ? sameCategory : candidates;
  const found = pool.find(([, route]) => route.slugs[parsed.lang as SupportedLanguage] === slug) || pool[0];
  return found ? { id: found[0], ...found[1] } : null;
}

/** Only product details are remapped; catalog/category paths keep their suffix. */
export function localizedProductPathname(pathname: string, lang: string): string | null {
  const route = findProductRoute(pathname);
  return route ? `/${lang}${routePath(route, lang)}/` : null;
}

export function productMatchesDetailPath(product: RoutableProduct, pathname: string): boolean {
  const found = findProductRoute(pathname);
  if (found) return found.id === product.id;
  const parsed = parseProductDetailPath(pathname);
  if (!parsed) return false;
  const { slug, legacyId } = parseProductParam(parsed.param);
  if (parsed.category && parsed.category !== (toSlug(product.category || '') || 'uncategorized')) return false;
  return legacyId ? legacyId === product.id : slug === toSlug(product.title);
}

/** Shared by the edge Worker and local servers. Keeps campaign parameters. */
export function productRedirectLocation(url: URL): string | null {
  const parsed = parseProductDetailPath(url.pathname);
  if (!parsed) return null;
  const target = localizedProductPathname(url.pathname, parsed.lang);
  if (target) return target !== url.pathname ? `${target}${url.search}` : null;
  if (!parsed.category && KNOWN_PRODUCT_CATEGORIES.has(parsed.param)) {
    return `/${parsed.lang}${catalogCategoryPath(parsed.param)}/${url.search}`;
  }
  if (parsed.category && !KNOWN_PRODUCT_CATEGORIES.has(parsed.category)) return null;
  const { slug, legacyId } = parseProductParam(parsed.param);
  const discontinuedCategory =
    (legacyId && Object.hasOwn(DISCONTINUED_CATEGORY_BY_SLUG, legacyId)
      ? DISCONTINUED_CATEGORY_BY_SLUG[legacyId]
      : undefined) ||
    (Object.hasOwn(DISCONTINUED_CATEGORY_BY_SLUG, slug)
      ? DISCONTINUED_CATEGORY_BY_SLUG[slug]
      : undefined);
  if (discontinuedCategory) {
    return `/${parsed.lang}/products/category/${discontinuedCategory}/${url.search}`;
  }
  return null;
}
