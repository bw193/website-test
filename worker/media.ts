import { isVideoMediaPath, MEDIA_PATH_PREFIX, mediaUpstreamUrl } from '../src/utils/media';

/**
 * Serves the site's Supabase-hosted images and videos from bolenmirror.com/media/.
 *
 * Supabase Storage sends `X-Robots-Tag: none` with every object, which keeps
 * images out of Google Images and self-hosted MP4s out of Google Video indexing
 * and rich results. This proxy streams the upstream bytes directly with a clean
 * header set (no robots header, no Supabase cookies), forwards HTTP Range /
 * If-Range headers for 206 Partial Content video seeking, and caches full 200
 * responses at the edge. Only mapped buckets and media extensions are served
 * (see src/utils/media.ts); anything else is a 404.
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
// Prevents an uploaded SVG opened directly from running script on the site's origin,
// while permitting native browser rendering of images and video documents.
const MEDIA_CSP = "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox";
// Avoid teeing very large video streams (>25 MB) into cache.put() in Worker memory.
const MAX_VIDEO_CACHE_BYTES = 25 * 1024 * 1024;

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

function mediaHeaders(upstream: Headers, negotiated: boolean, isVideo: boolean): Headers {
  const headers = new Headers();
  for (const name of [
    'Content-Type',
    'Content-Length',
    'Content-Range',
    'Accept-Ranges',
    'ETag',
    'Last-Modified',
  ]) {
    const value = upstream.get(name);
    if (value) headers.set(name, value);
  }
  if (isVideo && !headers.has('Accept-Ranges')) {
    headers.set('Accept-Ranges', 'bytes');
  }
  headers.set('Cache-Control', upstream.get('Cache-Control') || DEFAULT_CACHE_CONTROL);
  // Transforms come back as WebP or the source format depending on Accept.
  if (negotiated) headers.set('Vary', 'Accept');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', MEDIA_CSP);
  return headers;
}

function rangeNotSatisfiableHeaders(upstream: Headers): Headers {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Accept-Ranges': 'bytes',
  });
  const contentRange = upstream.get('Content-Range');
  if (contentRange) headers.set('Content-Range', contentRange);
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

  const isVideo = isVideoMediaPath(url.pathname);
  const fetchUpstream = deps.fetch ?? fetch;
  const cache = deps.cache === undefined ? edgeCache() : deps.cache;

  const rangeHeader = request.headers.get('Range');
  const ifRangeHeader = request.headers.get('If-Range');
  const hasRange = Boolean(rangeHeader);

  // Supabase picks WebP only when the client accepts it, so the negotiated
  // format is part of the cache key.
  const negotiated = upstreamUrl.includes('/render/image/');
  const webp = negotiated && /image\/webp/i.test(request.headers.get('Accept') || '');
  const variant = negotiated ? (webp ? 'webp' : 'source') : 'original';
  const source = new URL(upstreamUrl);
  const cacheKey = new Request(`${url.origin}/__media-cache/${variant}${source.pathname}${source.search}`);

  let response = !hasRange && cache ? await cache.match(cacheKey).catch(() => undefined) : undefined;
  if (!response) {
    const upstreamReqHeaders = new Headers({ Accept: webp ? 'image/webp' : '*/*' });
    if (rangeHeader) {
      upstreamReqHeaders.set('Range', rangeHeader);
      if (ifRangeHeader) upstreamReqHeaders.set('If-Range', ifRangeHeader);
    }

    let upstream: Response;
    try {
      upstream = await fetchUpstream(upstreamUrl, {
        method: request.method === 'HEAD' && hasRange ? 'HEAD' : 'GET',
        headers: upstreamReqHeaders,
      });
    } catch {
      return failure(502);
    }

    if (hasRange && upstream.status === 416) {
      await upstream.body?.cancel();
      return new Response(null, { status: 416, headers: rangeNotSatisfiableHeaders(upstream.headers) });
    }

    const contentType = upstream.headers.get('Content-Type') || '';
    const validStatus = upstream.status === 200 || (hasRange && upstream.status === 206);
    const validType = isVideo ? /^video\//i.test(contentType) : /^image\//i.test(contentType);
    if (!validStatus || !validType) {
      await upstream.body?.cancel();
      return failure(upstream.status >= 500 ? 502 : 404);
    }

    // Stream upstream.body directly — never buffer video or image payloads in memory.
    response = new Response(upstream.body, {
      status: upstream.status,
      headers: mediaHeaders(upstream.headers, negotiated, isVideo),
    });

    const contentLength = Number(upstream.headers.get('Content-Length') || '0');
    const canCache =
      cache &&
      upstream.status === 200 &&
      !hasRange &&
      (!isVideo || !(Number.isFinite(contentLength) && contentLength > MAX_VIDEO_CACHE_BYTES));

    if (canCache) {
      const stored = cache.put(cacheKey, response.clone()).catch(() => undefined);
      if (ctx) ctx.waitUntil(stored);
      else await stored;
    }
  }

  const etag = response.headers.get('ETag');
  if (!hasRange && response.status === 200 && etag && request.headers.get('If-None-Match') === etag) {
    await response.body?.cancel();
    return new Response(null, { status: 304, headers: notModifiedHeaders(response.headers) });
  }
  if (request.method === 'HEAD') {
    await response.body?.cancel();
    return new Response(null, { status: response.status, headers: response.headers });
  }
  return response;
}
