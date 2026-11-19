import assert from 'node:assert/strict';
import test from 'node:test';
import { handleMediaRequest } from './media.ts';
import reliableWorker from './reliable-entry.ts';
import type { Env } from './index.ts';

const ORIGIN = 'https://bolenmirror.com';
const STORAGE = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1';

type FetchCall = {
  url: string;
  method: string;
  accept: string | null;
  range: string | null;
  ifRange: string | null;
};

function supabaseFetch(
  options: {
    status?: number;
    contentType?: string;
    body?: BodyInit | null;
    extraHeaders?: Record<string, string>;
  } = {},
) {
  const calls: FetchCall[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const reqHeaders = new Headers(init?.headers);
    const method = (init?.method || 'GET').toUpperCase();
    calls.push({
      url: String(input),
      method,
      accept: reqHeaders.get('Accept'),
      range: reqHeaders.get('Range'),
      ifRange: reqHeaders.get('If-Range'),
    });
    const body = method === 'HEAD' ? null : (options.body === undefined ? 'image-bytes' : options.body);
    return new Response(body, {
      status: options.status ?? 200,
      headers: {
        'Content-Type': options.contentType ?? 'image/webp',
        'Cache-Control': 'max-age=31536000',
        ETag: '"abc123"',
        'X-Robots-Tag': 'none',
        'Set-Cookie': '__cf_bm=tracking; Domain=supabase.co',
        'sb-project-ref': 'mxmmffwntosvwaviippd',
        ...(options.extraHeaders || {}),
      },
    });
  }) as typeof fetch;
  return { calls, fetchImpl };
}

function memoryCache() {
  const store = new Map<string, { status: number; headers: [string, string][]; bytes: ArrayBuffer }>();
  return {
    store,
    cache: {
      async match(request: Request) {
        const entry = store.get(request.url);
        if (!entry) return undefined;
        return new Response(entry.bytes.slice(0), { status: entry.status, headers: entry.headers });
      },
      async put(request: Request, response: Response) {
        const bytes = await response.arrayBuffer();
        store.set(request.url, {
          status: response.status,
          headers: [...response.headers.entries()],
          bytes,
        });
      },
    },
  };
}

function mediaRequest(path: string, headers: Record<string, string> = {}, method = 'GET') {
  return new Request(`${ORIGIN}${path}`, { method, headers });
}

test('serves Supabase images (including .jfif and escaped parentheses) without noindex or Supabase cookies', async () => {
  const { calls, fetchImpl } = supabaseFetch();
  const response = await handleMediaRequest(
    mediaRequest('/media/product-images/products/a.jfif?width=800&resize=contain', { Accept: 'image/avif,image/webp,*/*' }),
    undefined,
    { fetch: fetchImpl, cache: null },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'image-bytes');
  assert.equal(response.headers.get('X-Robots-Tag'), null);
  assert.equal(response.headers.get('Set-Cookie'), null);
  assert.equal(response.headers.get('sb-project-ref'), null);
  assert.equal(response.headers.get('Content-Type'), 'image/webp');
  assert.equal(response.headers.get('Cache-Control'), 'max-age=31536000');
  assert.equal(response.headers.get('Vary'), 'Accept');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.match(response.headers.get('Content-Security-Policy') || '', /sandbox/);
  assert.deepEqual(calls, [{
    url: `${STORAGE}/render/image/public/product-images/products/a.jfif?width=800&resize=contain`,
    method: 'GET',
    accept: 'image/webp',
    range: null,
    ifRange: null,
  }]);

  const parens = supabaseFetch({ contentType: 'image/jpeg' });
  const parensRes = await handleMediaRequest(
    mediaRequest('/media/comp%20image/CE%281%29%281%29.jpg'),
    undefined,
    { fetch: parens.fetchImpl, cache: null },
  );
  assert.equal(parensRes.status, 200);
  assert.equal(parensRes.headers.get('X-Robots-Tag'), null);
  assert.equal(parens.calls[0].url, `${STORAGE}/object/public/comp%20image/CE%281%29%281%29.jpg`);
});

test('original files come from the object endpoint and are not format-negotiated', async () => {
  const { calls, fetchImpl } = supabaseFetch({ contentType: 'image/png' });
  const response = await handleMediaRequest(mediaRequest('/media/comp%20image/logo.png', { Accept: 'image/webp' }), undefined, {
    fetch: fetchImpl,
    cache: null,
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Vary'), null);
  assert.deepEqual(calls, [{
    url: `${STORAGE}/object/public/comp%20image/logo.png`,
    method: 'GET',
    accept: '*/*',
    range: null,
    ifRange: null,
  }]);
});

test('streams .mp4 video Range requests (206 Partial Content), strips X-Robots-Tag, and skips cache.put on 206', async () => {
  const chunks = [new TextEncoder().encode('ftyp'), new TextEncoder().encode('moov-data')];
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

  const { calls, fetchImpl } = supabaseFetch({
    status: 206,
    contentType: 'video/mp4',
    body: stream,
    extraHeaders: {
      'Content-Length': '13',
      'Content-Range': 'bytes 0-12/3512867',
    },
  });
  const { cache, store } = memoryCache();

  const response = await handleMediaRequest(
    mediaRequest('/media/product-videos/videos/1782526758014-t1n84v7.mp4', {
      Range: 'bytes=0-12',
      'If-Range': '"abc123"',
    }),
    undefined,
    { fetch: fetchImpl, cache },
  );

  assert.equal(response.status, 206);
  assert.equal(response.headers.get('Content-Type'), 'video/mp4');
  assert.equal(response.headers.get('Content-Range'), 'bytes 0-12/3512867');
  assert.equal(response.headers.get('Content-Length'), '13');
  assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(response.headers.get('X-Robots-Tag'), null);
  assert.equal(response.headers.get('Set-Cookie'), null);
  assert.equal(await response.text(), 'ftypmoov-data');
  assert.equal(store.size, 0, '206 Partial Content responses must not be written to caches.default');
  assert.deepEqual(calls, [{
    url: `${STORAGE}/object/public/product-videos/videos/1782526758014-t1n84v7.mp4`,
    method: 'GET',
    accept: '*/*',
    range: 'bytes=0-12',
    ifRange: '"abc123"',
  }]);
});

test('caches full 200 video responses cleanly while still serving subsequent Range requests from upstream', async () => {
  const { calls, fetchImpl } = supabaseFetch({
    status: 200,
    contentType: 'video/mp4',
    body: 'full-video-bytes',
    extraHeaders: {
      'Content-Length': '16',
      'Accept-Ranges': 'bytes',
    },
  });
  const { cache, store } = memoryCache();
  const path = '/media/product-videos/videos/clip.mp4';

  const fullRes = await handleMediaRequest(mediaRequest(path), undefined, { fetch: fetchImpl, cache });
  assert.equal(fullRes.status, 200);
  assert.equal(fullRes.headers.get('X-Robots-Tag'), null);
  assert.equal(fullRes.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(await fullRes.text(), 'full-video-bytes');
  assert.equal(store.size, 1);

  const cachedRes = await handleMediaRequest(mediaRequest(path), undefined, { fetch: fetchImpl, cache });
  assert.equal(cachedRes.status, 200);
  assert.equal(await cachedRes.text(), 'full-video-bytes');
  assert.equal(calls.length, 1, 'repeat full 200 request is served from cache');
});

test('caches each negotiated format separately and serves repeats from the edge cache', async () => {
  const { calls, fetchImpl } = supabaseFetch();
  const { cache, store } = memoryCache();
  const path = '/media/product-images/products/a.jpg?width=400&resize=contain';
  const waited: Promise<unknown>[] = [];
  const ctx = { waitUntil: (promise: Promise<unknown>) => void waited.push(promise) };

  await handleMediaRequest(mediaRequest(path, { Accept: 'image/webp' }), ctx, { fetch: fetchImpl, cache });
  await Promise.all(waited);
  const repeat = await handleMediaRequest(mediaRequest(path, { Accept: 'image/webp' }), ctx, { fetch: fetchImpl, cache });
  await handleMediaRequest(mediaRequest(path, { Accept: 'image/jpeg' }), ctx, { fetch: fetchImpl, cache: null });

  assert.equal(await repeat.text(), 'image-bytes');
  assert.equal(calls.length, 2, 'the repeat WebP request is served from cache');
  assert.equal(calls[1].accept, '*/*');
  assert.deepEqual([...store.keys()], [
    `${ORIGIN}/__media-cache/webp/storage/v1/render/image/public/product-images/products/a.jpg?width=400&resize=contain`,
  ]);
});

test('answers conditional and HEAD requests without a body and avoids upstream GET or cache poisoning on HEAD misses', async () => {
  const { calls, fetchImpl } = supabaseFetch();
  const { cache, store } = memoryCache();
  const path = '/media/product-images/products/a.jpg';
  const notModified = await handleMediaRequest(mediaRequest(path, { 'If-None-Match': '"abc123"' }), undefined, {
    fetch: fetchImpl,
    cache: null,
  });
  assert.equal(notModified.status, 304);
  assert.equal(notModified.headers.get('ETag'), '"abc123"');
  assert.equal(await notModified.text(), '');

  const headMiss = await handleMediaRequest(mediaRequest(path, {}, 'HEAD'), undefined, { fetch: fetchImpl, cache });
  assert.equal(headMiss.status, 200);
  assert.equal(headMiss.headers.get('Content-Type'), 'image/webp');
  assert.equal(await headMiss.text(), '');
  assert.equal(calls[calls.length - 1].method, 'HEAD', 'HEAD cache miss forwards HEAD upstream');
  assert.equal(store.size, 0, 'HEAD response must never be written to the GET edge cache');

  const getAfterHead = await handleMediaRequest(mediaRequest(path), undefined, { fetch: fetchImpl, cache });
  assert.equal(getAfterHead.status, 200);
  assert.equal(await getAfterHead.text(), 'image-bytes');
  assert.equal(calls[calls.length - 1].method, 'GET');
  assert.equal(store.size, 1);

  const callsBeforeWarmHead = calls.length;
  const headHit = await handleMediaRequest(mediaRequest(path, {}, 'HEAD'), undefined, { fetch: fetchImpl, cache });
  assert.equal(headHit.status, 200);
  assert.equal(headHit.headers.get('Content-Type'), 'image/webp');
  assert.equal(await headHit.text(), '');
  assert.equal(calls.length, callsBeforeWarmHead, 'warm HEAD hit is answered from edge cache without upstream fetch');
});

test('skips edge caching for videos with missing, zero, or oversized Content-Length and passes through 416', async () => {
  const path = '/media/product-videos/videos/stream.mp4';

  const unknownLength = supabaseFetch({
    status: 200,
    contentType: 'video/mp4',
    body: 'chunked-video',
  });
  const unknownCache = memoryCache();
  const unknownRes = await handleMediaRequest(mediaRequest(path), undefined, {
    fetch: unknownLength.fetchImpl,
    cache: unknownCache.cache,
  });
  assert.equal(unknownRes.status, 200);
  assert.equal(await unknownRes.text(), 'chunked-video');
  assert.equal(unknownCache.store.size, 0, 'video with absent Content-Length must not be teed into cache.put');

  const oversized = supabaseFetch({
    status: 200,
    contentType: 'video/mp4',
    body: 'big-video',
    extraHeaders: { 'Content-Length': String(30 * 1024 * 1024) },
  });
  const oversizedCache = memoryCache();
  const oversizedRes = await handleMediaRequest(mediaRequest(path), undefined, {
    fetch: oversized.fetchImpl,
    cache: oversizedCache.cache,
  });
  assert.equal(oversizedRes.status, 200);
  assert.equal(await oversizedRes.text(), 'big-video');
  assert.equal(oversizedCache.store.size, 0, 'video larger than 25 MB must not be teed into cache.put');

  const range416 = supabaseFetch({
    status: 416,
    contentType: 'text/plain',
    body: null,
    extraHeaders: { 'Content-Range': 'bytes */1024' },
  });
  const res416 = await handleMediaRequest(mediaRequest(path, { Range: 'bytes=5000-6000' }), undefined, {
    fetch: range416.fetchImpl,
    cache: null,
  });
  assert.equal(res416.status, 416);
  assert.equal(res416.headers.get('Content-Range'), 'bytes */1024');
  assert.equal(res416.headers.get('Accept-Ranges'), 'bytes');
});

test('refuses non-media paths, video resize params, mismatched content types and upstream failures', async () => {
  const { calls, fetchImpl } = supabaseFetch();
  for (const path of [
    '/media/private/a.jpg',
    '/media/private/a.mp4',
    '/media/product-videos/videos/a.mp4?width=800',
    '/media/product-images/a.jpg?width=99999',
  ]) {
    const response = await handleMediaRequest(mediaRequest(path), undefined, { fetch: fetchImpl, cache: null });
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
  }
  assert.equal(calls.length, 0, 'refused paths never reach Supabase');

  const html = supabaseFetch({ contentType: 'text/html' });
  assert.equal(
    (await handleMediaRequest(mediaRequest('/media/product-images/a.jpg'), undefined, { fetch: html.fetchImpl, cache: null })).status,
    404,
  );
  assert.equal(
    (await handleMediaRequest(mediaRequest('/media/product-videos/videos/a.mp4'), undefined, { fetch: html.fetchImpl, cache: null })).status,
    404,
  );
  const missing = supabaseFetch({ status: 400, contentType: 'application/json' });
  assert.equal(
    (await handleMediaRequest(mediaRequest('/media/product-images/gone.jpg'), undefined, { fetch: missing.fetchImpl, cache: null })).status,
    404,
  );
  const down = supabaseFetch({ status: 503, contentType: 'text/plain' });
  assert.equal(
    (await handleMediaRequest(mediaRequest('/media/product-images/a.jpg'), undefined, { fetch: down.fetchImpl, cache: null })).status,
    502,
  );
  const offline = (async () => { throw new Error('network down'); }) as typeof fetch;
  assert.equal(
    (await handleMediaRequest(mediaRequest('/media/product-images/a.jpg'), undefined, { fetch: offline, cache: null })).status,
    502,
  );
});

test('the deployed entry routes /media/ to the proxy before the static assets', async (context) => {
  const { calls, fetchImpl } = supabaseFetch({ contentType: 'image/jpeg' });
  context.mock.method(globalThis, 'fetch', fetchImpl);
  const env = {
    ASSETS: { fetch: async () => new Response('asset', { status: 404 }) },
  } as unknown as Env;

  const response = await reliableWorker.fetch(mediaRequest('/media/product-images/products/a.jpg'), env);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Robots-Tag'), null);
  assert.equal(calls[0].url, `${STORAGE}/object/public/product-images/products/a.jpg`);
});
