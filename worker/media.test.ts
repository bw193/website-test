import assert from 'node:assert/strict';
import test from 'node:test';
import { handleMediaRequest } from './media.ts';
import reliableWorker from './reliable-entry.ts';
import type { Env } from './index.ts';

const ORIGIN = 'https://bolenmirror.com';
const STORAGE = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1';

type FetchCall = { url: string; accept: string | null };

function supabaseFetch(options: { status?: number; contentType?: string; body?: string } = {}) {
  const calls: FetchCall[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), accept: new Headers(init?.headers).get('Accept') });
    return new Response(options.body ?? 'image-bytes', {
      status: options.status ?? 200,
      headers: {
        'Content-Type': options.contentType ?? 'image/webp',
        'Cache-Control': 'max-age=31536000',
        ETag: '"abc123"',
        'X-Robots-Tag': 'none',
        'Set-Cookie': '__cf_bm=tracking; Domain=supabase.co',
        'sb-project-ref': 'mxmmffwntosvwaviippd',
      },
    });
  }) as typeof fetch;
  return { calls, fetchImpl };
}

function memoryCache() {
  const store = new Map<string, Response>();
  return {
    store,
    cache: {
      async match(request: Request) {
        return store.get(request.url)?.clone();
      },
      async put(request: Request, response: Response) {
        store.set(request.url, response);
      },
    },
  };
}

function mediaRequest(path: string, headers: Record<string, string> = {}, method = 'GET') {
  return new Request(`${ORIGIN}${path}`, { method, headers });
}

test('serves Supabase images without the noindex header or Supabase cookies', async () => {
  const { calls, fetchImpl } = supabaseFetch();
  const response = await handleMediaRequest(
    mediaRequest('/media/product-images/products/a.jpg?width=800&resize=contain', { Accept: 'image/avif,image/webp,*/*' }),
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
    url: `${STORAGE}/render/image/public/product-images/products/a.jpg?width=800&resize=contain`,
    accept: 'image/webp',
  }]);
});

test('original files come from the object endpoint and are not format-negotiated', async () => {
  const { calls, fetchImpl } = supabaseFetch({ contentType: 'image/png' });
  const response = await handleMediaRequest(mediaRequest('/media/comp%20image/logo.png', { Accept: 'image/webp' }), undefined, {
    fetch: fetchImpl,
    cache: null,
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Vary'), null);
  assert.deepEqual(calls, [{ url: `${STORAGE}/object/public/comp%20image/logo.png`, accept: '*/*' }]);
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

test('answers conditional and HEAD requests without a body', async () => {
  const { fetchImpl } = supabaseFetch();
  const path = '/media/product-images/products/a.jpg';
  const notModified = await handleMediaRequest(mediaRequest(path, { 'If-None-Match': '"abc123"' }), undefined, {
    fetch: fetchImpl,
    cache: null,
  });
  assert.equal(notModified.status, 304);
  assert.equal(notModified.headers.get('ETag'), '"abc123"');
  assert.equal(await notModified.text(), '');

  const head = await handleMediaRequest(mediaRequest(path, {}, 'HEAD'), undefined, { fetch: fetchImpl, cache: null });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('Content-Type'), 'image/webp');
  assert.equal(await head.text(), '');
});

test('refuses non-media paths, non-image content and upstream failures', async () => {
  const { calls, fetchImpl } = supabaseFetch();
  for (const path of ['/media/private/a.jpg', '/media/product-videos/videos/a.mp4', '/media/product-images/a.jpg?width=99999']) {
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
