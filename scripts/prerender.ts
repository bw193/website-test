import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { preview, type PreviewServer } from 'vite';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { getPublicPages, expandToAllLanguageUrls } from './lib/get-public-urls.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DIST = resolve(PROJECT_ROOT, 'dist');

const PORT = 4173;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;
const SITE_URL = 'https://bolenmirror.com';

const CONCURRENCY = 4;
const PAGE_NAV_TIMEOUT = 30_000;
const HYDRATE_TIMEOUT = 20_000;

function isProductDetailPath(urlPath: string): boolean {
  return /^\/[a-z]{2}\/products\/[^/]+$/.test(urlPath);
}

async function prerenderUrl(
  context: BrowserContext,
  urlPath: string,
  template: string
): Promise<{ urlPath: string; status: 'ok' | 'skipped' | 'failed'; reason?: string }> {
  const page = await context.newPage();
  try {
    const fullUrl = `${BASE_URL}${urlPath}`;
    const expectedCanonical = `${SITE_URL}${urlPath}`;
    const requireProduct = isProductDetailPath(urlPath);

    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: PAGE_NAV_TIMEOUT });

    // Wait for Helmet to (a) replace canonical with the route-specific value, and
    // (b) for product detail pages, emit the Product JSON-LD (proves Supabase load completed).
    await page.waitForFunction(
      ({ expected, requireProduct }: { expected: string; requireProduct: boolean }) => {
        const canonical = document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute('href');
        if (canonical !== expected) return false;

        if (requireProduct) {
          const scripts = Array.from(
            document.querySelectorAll('script[type="application/ld+json"]')
          );
          return scripts.some((s) => {
            try {
              const parsed = JSON.parse(s.textContent || 'null');
              const list = Array.isArray(parsed) ? parsed : [parsed];
              return list.some((item) => item && item['@type'] === 'Product');
            } catch {
              return false;
            }
          });
        }

        return true;
      },
      { expected: expectedCanonical, requireProduct },
      { timeout: HYDRATE_TIMEOUT }
    );

    // Extract the post-hydration <head> contents (Helmet has populated it).
    const headInner: string = await page.evaluate(() => document.head.innerHTML);

    // Build the static file: keep the template body untouched (SPA shell + bundle script),
    // replace the head with the route-specific, Helmet-populated head.
    const newHtml = template.replace(
      /<head>[\s\S]*?<\/head>/i,
      `<head>\n${headInner}\n</head>`
    );

    // dist/en/products/foo-uuid/index.html
    const outDir = resolve(DIST, urlPath.replace(/^\//, ''));
    await mkdir(outDir, { recursive: true });
    await writeFile(resolve(outDir, 'index.html'), newHtml, 'utf-8');

    return { urlPath, status: 'ok' };
  } catch (err: any) {
    return { urlPath, status: 'failed', reason: err?.message || String(err) };
  } finally {
    await page.close();
  }
}

async function runPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('[prerender] Resolving public URLs...');
  const pages = await getPublicPages();
  const urls = expandToAllLanguageUrls(pages);
  console.log(`[prerender] ${urls.length} URLs (${pages.length} pages × 6 languages)`);

  const templatePath = resolve(DIST, 'index.html');
  const template = await readFile(templatePath, 'utf-8');

  console.log(`[prerender] Starting vite preview on ${BASE_URL}...`);
  const server: PreviewServer = await preview({
    preview: { port: PORT, host: HOST, strictPort: true },
  });

  let browser: Browser | undefined;
  try {
    console.log('[prerender] Launching Chromium...');
    browser = await chromium.launch();
    const context = await browser.newContext();

    console.log(`[prerender] Rendering with concurrency=${CONCURRENCY}...`);
    const t0 = Date.now();
    const results = await runPool(urls, CONCURRENCY, (u) => prerenderUrl(context, u, template));
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    const ok = results.filter((r) => r.status === 'ok').length;
    const failed = results.filter((r) => r.status === 'failed');

    console.log(`[prerender] Done in ${elapsed}s — ${ok}/${urls.length} pages OK`);
    if (failed.length > 0) {
      console.log(`[prerender] ${failed.length} failed:`);
      for (const r of failed) console.log(`  - ${r.urlPath}: ${r.reason}`);
    }

    if (ok === 0) {
      process.exitCode = 1;
    }
  } finally {
    await browser?.close();
    await new Promise<void>((resolveClose) => server.httpServer.close(() => resolveClose()));
  }
}

main().catch((err) => {
  console.error('[prerender] Fatal:', err);
  process.exit(1);
});
