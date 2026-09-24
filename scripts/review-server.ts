import express from 'express';
import path from 'node:path';
import { productRedirectLocation } from '../src/utils/productRoutes';
import { handleMediaRequest } from '../worker/media';

const app = express();
const reviewPort = Number.parseInt(process.env.REVIEW_PORT || '4173', 10);
const productionOrigin = 'https://bolenmirror.com';
const distPath = path.resolve(process.cwd(), 'dist');

app.disable('x-powered-by');
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/__review/health', (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json({ ok: true, apiProxy: productionOrigin });
});

// The review portal never needs a local Supabase secret. It forwards only the
// two fixed receptionist endpoints to the deployed Cloudflare Worker and uses
// an allowlist of request/response headers. Cookies and authorization headers
// are deliberately not forwarded.
app.use(
  '/api/ai-receptionist',
  express.raw({ type: 'application/json', limit: '24kb' }),
  async (request, response) => {
    if (request.method !== 'POST' && request.method !== 'OPTIONS') {
      response.setHeader('Allow', 'POST, OPTIONS');
      response.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
      return;
    }

    const target = new URL(request.originalUrl, productionOrigin);
    if (
      target.pathname !== '/api/ai-receptionist' &&
      target.pathname !== '/api/ai-receptionist/contact'
    ) {
      response.status(404).json({ error: 'API_NOT_FOUND' });
      return;
    }

    const headers = new Headers({
      Origin: productionOrigin,
      'Sec-Fetch-Site': 'same-origin',
    });
    const sessionId = request.header('X-AI-Session');
    if (sessionId) headers.set('X-AI-Session', sessionId);
    const contentType = request.header('Content-Type');
    if (contentType) headers.set('Content-Type', contentType);
    const userAgent = request.header('User-Agent');
    if (userAgent) headers.set('User-Agent', userAgent.slice(0, 160));

    try {
      const upstream = await fetch(target, {
        method: request.method,
        headers,
        body: request.method === 'POST' ? request.body : undefined,
        redirect: 'manual',
      });
      for (const headerName of ['cache-control', 'content-type', 'retry-after']) {
        const value = upstream.headers.get(headerName);
        if (value) response.setHeader(headerName, value);
      }
      if (!upstream.ok) {
        console.warn('[review-proxy] upstream response', {
          path: target.pathname,
          status: upstream.status,
        });
      }
      response.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      console.error('[review-proxy] request failed', {
        path: target.pathname,
        error: error instanceof Error ? error.message : 'unknown error',
      });
      response.status(502).json({ error: 'REVIEW_PROXY_UNAVAILABLE' });
    }
  },
);

// Same-origin copies of the Supabase-hosted images, answered by the same
// handler production uses (worker/media.ts), minus the edge cache.
app.get('/media/*', async (request, response) => {
  const media = await handleMediaRequest(
    new Request(new URL(request.originalUrl, productionOrigin), {
      method: request.method,
      headers: { Accept: request.header('Accept') || '*/*' },
    }),
    undefined,
    { cache: null },
  );
  media.headers.forEach((value, name) => response.setHeader(name, value));
  response.status(media.status).send(Buffer.from(await media.arrayBuffer()));
});

app.use((request, response, next) => {
  const requestUrl = new URL(request.originalUrl, productionOrigin);
  const target = productRedirectLocation(requestUrl);
  if ((request.method === 'GET' || request.method === 'HEAD') && target) {
    response.redirect(301, target);
    return;
  }
  // Mirrors worker/reliable-entry.ts: the bare category index 301s to the catalog.
  const categoryIndex = requestUrl.pathname.match(/^\/(en|zh|es|fr|de|it)\/products\/category\/?$/);
  if ((request.method === 'GET' || request.method === 'HEAD') && categoryIndex) {
    response.redirect(301, `/${categoryIndex[1]}/products/${requestUrl.search}`);
    return;
  }
  next();
});

app.use(
  express.static(distPath, {
    index: 'index.html',
    setHeaders: (response, filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        response.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

// Same contract as production (wrangler.jsonc + worker/reliable-entry.ts):
// the client-only employee portal gets its shell with 200 for every /admin
// path; any other path without a prerendered file is a real 404 that still
// boots the React NotFound view.
app.get(['/admin', '/admin/*'], (_request, response) => {
  response.sendFile(path.join(distPath, 'admin', 'index.html'));
});

app.get('*', (_request, response) => {
  response.status(404).sendFile(path.join(distPath, '404.html'));
});

const ipv4Server = app.listen(reviewPort, '127.0.0.1', () => {
  console.log(`BOLEN review portal ready at http://127.0.0.1:${reviewPort}/en/`);
});

const ipv6Server = app.listen(reviewPort, '::1', () => {
  console.log(`BOLEN review portal ready at http://localhost:${reviewPort}/en/`);
});

for (const server of [ipv4Server, ipv6Server]) {
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error('[review-server] listen failed', {
      code: error.code || 'UNKNOWN',
      message: error.message,
    });
    process.exitCode = 1;
  });
}
