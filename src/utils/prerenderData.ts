// Reads the JSON payload that scripts/prerender-static.ts embeds at build time
// into <script id="__BOLEN_PRERENDER_DATA__" type="application/json">.
// Lets Products / ProductDetail seed their initial state synchronously so the
// rendered DOM contains products before the Supabase fetch completes —
// crawlers and slow-network users see content instead of a loading skeleton.

import { toSlug } from './slug';
import { primeProductTranslations, type ProductFields } from './productI18n';
import type { BlogListItem, LocalizedBlogPost } from '../types/blog';

const SCRIPT_ID = '__BOLEN_PRERENDER_DATA__';

interface PrerenderPayload {
  route?: 'home' | 'catalog' | 'productDetail' | 'blog' | 'blogPost';
  lang?: string;
  products?: unknown[];
  product?: { id?: string; title?: string } & Record<string, unknown>;
  heroBgs?: string[];
  categories?: string[];
  // Localized product copy embedded per page so the SPA can overlay
  // translations synchronously on first render. Home/catalog carry the full
  // map for the language; product pages carry just that product's entry.
  productTranslations?: Record<string, ProductFields>;
  // Journal (blog) payloads. The index carries a light list of cards; an
  // article page carries one post, both pre-localized for `lang` so the SPA
  // renders synchronously with no Supabase fetch on the critical path.
  blogPosts?: BlogListItem[];
  blogPost?: LocalizedBlogPost;
}

let cache: PrerenderPayload | null | undefined;

function getPrerenderData(): PrerenderPayload | null {
  if (cache !== undefined) return cache;
  if (typeof document === 'undefined') {
    cache = null;
    return cache;
  }
  const el = document.getElementById(SCRIPT_ID);
  if (!el?.textContent) {
    cache = null;
    return cache;
  }
  try {
    cache = JSON.parse(el.textContent) as PrerenderPayload;
    // A home/catalog island holds every product's translation for the lang;
    // a product island holds only one, so don't mark the lang fully loaded.
    primeProductTranslations(cache.lang, cache.productTranslations, cache.route !== 'productDetail');
  } catch {
    cache = null;
  }
  return cache;
}

export function readInitialProducts<T>(): T[] | null {
  const data = getPrerenderData();
  if (data?.route === 'catalog' && Array.isArray(data.products)) {
    return data.products as T[];
  }
  return null;
}

export function readInitialCatalogData<T>(): {
  products: T[];
  categories: string[];
} | null {
  const data = getPrerenderData();
  if (data?.route !== 'catalog' || !Array.isArray(data.products)) return null;
  return {
    products: data.products as T[],
    categories: Array.isArray(data.categories) ? data.categories : [],
  };
}

export function readInitialProduct<T>(match: { slug: string; id?: string }): T | null {
  const data = getPrerenderData();
  if (data?.route !== 'productDetail' || !data.product) return null;
  const p = data.product;
  const matchesSlug = !!match.slug && typeof p.title === 'string' && toSlug(p.title) === match.slug;
  const matchesId = !!match.id && p.id === match.id;
  return matchesSlug || matchesId ? (data.product as T) : null;
}

export function readInitialHomeData<T>(): {
  products: T[];
  heroBgs: string[];
  categories: string[];
} | null {
  const data = getPrerenderData();
  if (data?.route !== 'home' || !Array.isArray(data.products)) return null;
  return {
    products: data.products as T[],
    heroBgs: Array.isArray(data.heroBgs) ? data.heroBgs : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
  };
}

export function readInitialBlogList(): BlogListItem[] | null {
  const data = getPrerenderData();
  if (data?.route === 'blog' && Array.isArray(data.blogPosts)) {
    return data.blogPosts as BlogListItem[];
  }
  return null;
}

export function readInitialBlogPost(slug: string): LocalizedBlogPost | null {
  const data = getPrerenderData();
  if (data?.route !== 'blogPost' || !data.blogPost) return null;
  return data.blogPost.slug === slug ? data.blogPost : null;
}
