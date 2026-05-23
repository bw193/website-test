// Reads the JSON payload that scripts/prerender-static.ts embeds at build time
// into <script id="__BOLEN_PRERENDER_DATA__" type="application/json">.
// Lets Products / ProductDetail seed their initial state synchronously so the
// rendered DOM contains products before the Supabase fetch completes —
// crawlers and slow-network users see content instead of a loading skeleton.

const SCRIPT_ID = '__BOLEN_PRERENDER_DATA__';

interface PrerenderPayload {
  route?: 'home' | 'catalog' | 'productDetail';
  lang?: string;
  products?: unknown[];
  product?: { id?: string } & Record<string, unknown>;
  heroBgs?: string[];
  categories?: string[];
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

export function readInitialProduct<T>(productId: string): T | null {
  const data = getPrerenderData();
  if (data?.route === 'productDetail' && data.product?.id === productId) {
    return data.product as T;
  }
  return null;
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
