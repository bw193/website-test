import { MEDIA_PATH_PREFIX, mediaUpstreamUrl } from '../src/utils/media';

/**
 * Serves the site's Supabase-hosted images from bolenmirror.com/media/.
 *
 * Supabase Storage sends `X-Robots-Tag: none` with every object, which keeps
 * the images out of Google Images and out of Product / Organization / Video
 * rich results. This proxy returns the same bytes with a clean header set (no
 * robots header, no Supabase cookies) and caches them at the edge. Only image
 * files from the site's media buckets are served (see src/utils/media.ts);
 * anything else is a 404.
 */

export interface WaitUntil {
  waitUntil(promise: Promise<unknown>): void;
}

interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

export interface MediaDeps {
  fetch?: typeof fetch;
  /** Defaults to the Workers edge cache; absent outside the Workers runtime. */
  cache?: EdgeCache | null;
}

// Used only when Supabase sends no Cache-Control of its own.
const DEFAULT_CACHE_CONTROL = 'public, max-age=86400';
// An uploaded SVG opened directly must not run script on the site's origin.
const MEDIA_CSP = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

export function isMediaPath(pathname: string): boolean {
  return pathname.startsWith(MEDIA_PATH_PREFIX);
}

function edgeCache(): EdgeCache | null {
  const storage = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return storage?.default ?? null;
}

function failure(status: 404 | 502): Response {
  return new Response(status === 404 ? 'Not found' : 'Bad gateway', {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': status === 404 ? 'public, max-age=300' : 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function mediaHeaders(upstream: Headers, negotiated: boolean): Headers {
  const headers = new Headers();
  for (const name of ['Content-Type', 'ETag', 'Last-Modified']) {
    const value = upstream.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('Cache-Control', upstream.get('Cache-Control') || DEFAULT_CACHE_CONTROL);
  // Transforms come back as WebP or the source format depending on Accept.
  if (negotiated) headers.set('Vary', 'Accept');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', MEDIA_CSP);
  return headers;
}

function notModifiedHeaders(headers: Headers): Headers {
  const kept = new Headers();
  for (const name of ['Cache-Control', 'ETag', 'Last-Modified', 'Vary']) {
    const value = headers.get(name);
    if (value) kept.set(name, value);
  }
  return kept;
}

export async function handleMediaRequest(
  request: Request,
  ctx?: WaitUntil,
  deps: MediaDeps = {},
): Promise<Response> {
  const url = new URL(request.url);
  const upstreamUrl = mediaUpstreamUrl(url.pathname, url.searchParams);
  if (!upstreamUrl) return failure(404);

  const fetchUpstream = deps.fetch ?? fetch;
  const cache = deps.cache === undefined ? edgeCache() : deps.cache;

  // Supabase picks WebP only when the client accepts it, so the negotiated
  // format is part of the cache key.
  const negotiated = upstreamUrl.includes('/render/image/');
  const webp = negotiated && /image\/webp/i.test(request.headers.get('Accept') || '');
  const variant = negotiated ? (webp ? 'webp' : 'source') : 'original';
  const source = new URL(upstreamUrl);
  const cacheKey = new Request(`${url.origin}/__media-cache/${variant}${source.pathname}${source.search}`);

  let response = cache ? await cache.match(cacheKey).catch(() => undefined) : undefined;
  if (!response) {
    let upstream: Response;
    try {
      upstream = await fetchUpstream(upstreamUrl, { headers: { Accept: webp ? 'image/webp' : '*/*' } });
    } catch {
      return failure(502);
    }
    const contentType = upstream.headers.get('Content-Type') || '';
    if (!upstream.ok || !/^image\//i.test(contentType)) {
      await upstream.body?.cancel();
      return failure(upstream.status >= 500 ? 502 : 404);
    }
    response = new Response(upstream.body, { status: 200, headers: mediaHeaders(upstream.headers, negotiated) });
    if (cache) {
      const stored = cache.put(cacheKey, response.clone()).catch(() => undefined);
      if (ctx) ctx.waitUntil(stored);
      else await stored;
    }
  }

  const etag = response.headers.get('ETag');
  if (etag && request.headers.get('If-None-Match') === etag) {
    await response.body?.cancel();
    return new Response(null, { status: 304, headers: notModifiedHeaders(response.headers) });
  }
  if (request.method === 'HEAD') {
    await response.body?.cancel();
    return new Response(null, { status: response.status, headers: response.headers });
  }
  return response;
}
