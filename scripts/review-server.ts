import express from 'express';
import path from 'node:path';

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

app.get('*', (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'));
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
