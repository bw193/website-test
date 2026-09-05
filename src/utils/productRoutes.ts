import routeData from '../data/productRoutes.json';
import type { SupportedLanguage } from '../hooks/useLocalizedPath';
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

/** Match canonical routes, old English slugs and UUID links to the same row. */
export function findProductRoute(pathname: string): (ProductRoute & { id: string }) | null {
  const parsed = parseProductDetailPath(pathname);
  if (!parsed) return null;
  const { slug, legacyId } = parseProductParam(parsed.param);
  if (legacyId && PRODUCT_ROUTES[legacyId]) return { id: legacyId, ...PRODUCT_ROUTES[legacyId] };
  const candidates = Object.entries(PRODUCT_ROUTES).filter(([, route]) =>
    (!parsed.category || parsed.category === route.category) &&
    Object.values(route.slugs).includes(slug),
  );
  // Prefer the requested locale if two translations happen to overlap.
  const found = candidates.find(([, route]) => route.slugs[parsed.lang as SupportedLanguage] === slug) || candidates[0];
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
  return target && target !== url.pathname ? `${target}${url.search}` : null;
}
