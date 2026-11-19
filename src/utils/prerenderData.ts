// Reads the JSON payload that scripts/prerender-static.ts embeds at build time
// into <script id="__BOLEN_PRERENDER_DATA__" type="application/json">.
// Lets Products / ProductDetail seed their initial state synchronously so the
// rendered DOM contains products before the Supabase fetch completes —
// crawlers and slow-network users see content instead of a loading skeleton.

import { productMatchesDetailPath } from './productRoutes';
import { primeProductTranslations, type ProductFields } from './productI18n';
import type { BlogListItem, LocalizedBlogPost } from '../types/blog';
import type { LocalizedVideoPost, VideoListItem } from '../types/video';

const SCRIPT_ID = '__BOLEN_PRERENDER_DATA__';

export interface FactoryGalleryItem {
  url: string;
  alt: string;
  caption?: string;
}

export interface PrerenderPayload {
  route?:
    | 'home'
    | 'catalog'
    | 'productDetail'
    | 'blog'
    | 'blogPost'
    | 'videos'
    | 'videoPost'
    | 'seoLanding'
    | 'ourStory';
  lang?: string;
  products?: unknown[];
  product?: { id?: string; title?: string } & Record<string, unknown>;
  heroBgs?: string[];
  // Intrinsic pixel size of the primary hero, probed at build time so the SPA
  // can reserve the hero's aspect-ratio box on first paint (no CLS).
  heroW?: number;
  heroH?: number;
  // Self-hosted (Cloudflare-CDN) responsive set for the LCP hero slide, baked
  // into dist/hero/ at build time. Absent if the build-time fetch failed.
  heroLcp?: { src: string; srcset: string };
  // One responsive set per carousel slide (index-aligned with heroBgs), each
  // self-hosted when the build-time download succeeded and a Supabase
  // transform set otherwise. Lets the carousel advance without a cold
  // Supabase transform for slides 2..n.
  heroSlides?: Array<{ src: string; srcset: string }>;
  categories?: string[];
  // Editor-managed factory/company photo strip, baked into the home HTML so
  // crawlers see <figure>/<figcaption>/alt and the SPA mounts byte-identically.
  factoryGallery?: FactoryGalleryItem[];
  // Editor-picked home video (site_settings.home_featured_video), pre-localized
  // for `lang` so the home section renders without a Supabase round-trip.
  featuredVideo?: VideoListItem | null;
  // Localized product copy embedded per page so the SPA can overlay
  // translations synchronously on first render. List/landing islands carry
  // lightweight `{ title, description }` entries; productDetail carries the
  // single product's full entry.
  productTranslations?: Record<string, ProductFields>;
  // Journal (blog) payloads. The index carries a light list of cards; an
  // article page carries one post plus related products/articles, pre-localized
  // for `lang` so the SPA renders synchronously with no Supabase fetch.
  blogPosts?: BlogListItem[];
  blogPost?: LocalizedBlogPost;
  relatedProducts?: unknown[];
  relatedArticles?: BlogListItem[];
  videoPosts?: VideoListItem[];
  videoPost?: LocalizedVideoPost;
  upNext?: VideoListItem[];
  productCount?: number;
  videoCount?: number;
  landingSlug?: string;
  categorySlug?: string;
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
    if (typeof window !== 'undefined') {
      (window as unknown as { __BOLEN_PRERENDER_DATA__?: PrerenderPayload }).__BOLEN_PRERENDER_DATA__ = cache;
    }
    // Catalog/home/landing islands embed only `{ title, description }` per
    // listed product (never all 117 full details/specs), and productDetail
    // embeds only `[product.id]`, so never mark the whole language dictionary
    // fully loaded — client-side navigation to another product will still fetch
    // `/i18n/products.<lang>.json` for full details and specifications.
    primeProductTranslations(cache.lang, cache.productTranslations, false);
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

export function readInitialProduct<T>(pathname: string): T | null {
  const data = getPrerenderData();
  if (data?.route !== 'productDetail' || !data.product) return null;
  const p = data.product;
  return typeof p.title === 'string' && productMatchesDetailPath({
    id: p.id, title: p.title, category: typeof p.category === 'string' ? p.category : undefined,
  }, pathname) ? (data.product as T) : null;
}

export function readInitialHomeData<T>(): {
  products: T[];
  heroBgs: string[];
  heroW?: number;
  heroH?: number;
  heroLcp?: { src: string; srcset: string };
  heroSlides?: Array<{ src: string; srcset: string }>;
  categories: string[];
  factoryGallery: FactoryGalleryItem[];
  featuredVideo: VideoListItem | null;
} | null {
  const data = getPrerenderData();
  if (data?.route !== 'home' || !Array.isArray(data.products)) return null;
  const heroSlides = Array.isArray(data.heroSlides)
    ? data.heroSlides.filter((slide) => typeof slide?.src === 'string' && typeof slide?.srcset === 'string')
    : undefined;
  return {
    products: data.products as T[],
    heroBgs: Array.isArray(data.heroBgs) ? data.heroBgs : [],
    heroW: typeof data.heroW === 'number' ? data.heroW : undefined,
    heroH: typeof data.heroH === 'number' ? data.heroH : undefined,
    heroLcp: data.heroLcp && typeof data.heroLcp.src === 'string' ? data.heroLcp : undefined,
    heroSlides: heroSlides && heroSlides.length > 0 ? heroSlides : undefined,
    categories: Array.isArray(data.categories) ? data.categories : [],
    factoryGallery: Array.isArray(data.factoryGallery) ? data.factoryGallery : [],
    featuredVideo: data.featuredVideo?.slug ? data.featuredVideo : null,
  };
}

export function readInitialBlogList(lang?: string): BlogListItem[] | null {
  const data = getPrerenderData();
  if (
    data?.route === 'blog' &&
    (!lang || data.lang === lang) &&
    Array.isArray(data.blogPosts)
  ) {
    return data.blogPosts as BlogListItem[];
  }
  return null;
}

export function readInitialBlogPost(slug: string, lang?: string): LocalizedBlogPost | null {
  const data = getPrerenderData();
  if (
    data?.route !== 'blogPost' ||
    (lang && data.lang !== lang) ||
    !data.blogPost
  ) {
    return null;
  }
  return data.blogPost.slug === slug ? data.blogPost : null;
}

export function readInitialBlogPostExtras<T>(slug: string, lang?: string): {
  relatedProducts: T[];
  relatedArticles: BlogListItem[];
} | null {
  const data = getPrerenderData();
  if (
    data?.route !== 'blogPost' ||
    (lang && data.lang !== lang) ||
    data.blogPost?.slug !== slug
  ) {
    return null;
  }
  return {
    relatedProducts: Array.isArray(data.relatedProducts) ? (data.relatedProducts as T[]) : [],
    relatedArticles: Array.isArray(data.relatedArticles) ? data.relatedArticles : [],
  };
}

export function readInitialVideoList(lang?: string): VideoListItem[] | null {
  const data = getPrerenderData();
  if (
    data?.route === 'videos' &&
    (!lang || data.lang === lang) &&
    Array.isArray(data.videoPosts)
  ) {
    return data.videoPosts as VideoListItem[];
  }
  return null;
}

export function readInitialVideoPost(slug: string, lang?: string): LocalizedVideoPost | null {
  const data = getPrerenderData();
  if (
    data?.route !== 'videoPost' ||
    (lang && data.lang !== lang) ||
    !data.videoPost
  ) {
    return null;
  }
  return data.videoPost.slug === slug ? data.videoPost : null;
}

export function readInitialVideoPostExtras<T>(slug: string, lang?: string): {
  relatedProducts: T[];
  upNext: VideoListItem[];
} | null {
  const data = getPrerenderData();
  if (
    data?.route !== 'videoPost' ||
    (lang && data.lang !== lang) ||
    data.videoPost?.slug !== slug
  ) {
    return null;
  }
  return {
    relatedProducts: Array.isArray(data.relatedProducts) ? (data.relatedProducts as T[]) : [],
    upNext: Array.isArray(data.upNext) ? data.upNext : [],
  };
}

export function readInitialStoryData(lang?: string): {
  productCount?: number;
  videoCount?: number;
} | null {
  const data = getPrerenderData();
  if (data?.route !== 'ourStory' || (lang && data.lang !== lang)) return null;
  return {
    productCount: typeof data.productCount === 'number' ? data.productCount : undefined,
    videoCount: typeof data.videoCount === 'number' ? data.videoCount : undefined,
  };
}

export function readInitialSeoLandingData<T>(slug: string): { products: T[]; lang?: string } | null {
  const data = getPrerenderData();
  if (data?.route !== 'seoLanding' || data.landingSlug !== slug || !Array.isArray(data.products)) return null;
  return { products: data.products as T[], lang: data.lang };
}
