import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import {
  PRODUCT_ROUTES, findProductRoute, parseProductDetailPath, productDetailPath,
} from '../src/utils/productRoutes';

const DIST = path.resolve('dist');
const ORIGIN = 'https://bolenmirror.com';
const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
const argument = (name: string) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
};

const files = (await readdir(DIST, { recursive: true })).filter((file) => file.endsWith('index.html'));
const htmlByRoute = new Map(await Promise.all(files.map(async (file) => [
  new URL(`/${file.split(path.sep).join('/').replace(/index\.html$/, '')}`, ORIGIN).pathname,
  await readFile(path.join(DIST, file), 'utf8'),
] as const)));
const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
const sitemapLocations = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
let detailCount = 0;
for (const id of Object.keys(PRODUCT_ROUTES)) {
  for (const lang of LANGUAGES) {
    const pathname = `/${lang}${productDetailPath({ id, title: '' }, lang)}/`;
    assert.ok(htmlByRoute.has(pathname), `Missing built HTML: ${pathname}`);
    assert.ok(sitemapLocations.has(`${ORIGIN}${pathname}`), `Missing sitemap URL: ${pathname}`);
    detailCount += 1;
  }
}
let links = 0;
for (const [route, html] of htmlByRoute) {
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(match[1].replace(/&amp;/g, '&'), ORIGIN);
    if (url.origin !== ORIGIN || !parseProductDetailPath(url.pathname)) continue;
    assert.ok(parseProductDetailPath(url.pathname)?.category, `${route}: uncategorized detail link ${url.pathname}`);
    assert.ok(findProductRoute(url.pathname), `${route}: unknown product link ${url.pathname}`);
    assert.ok(htmlByRoute.has(url.pathname), `${route}: broken product link ${url.pathname}`);
    links += 1;
  }
}
for (const loc of sitemapLocations) {
  const url = new URL(loc);
  if (!parseProductDetailPath(url.pathname)) continue;
  assert.ok(parseProductDetailPath(url.pathname)?.category, `Old product URL in sitemap: ${loc}`);
  assert.ok(htmlByRoute.has(url.pathname), `Sitemap URL has no HTML: ${loc}`);
}
console.log(`[verify-product-routes] ${detailCount} detail URLs and ${links} internal/alternate links resolve to built HTML.`);

const baseline = argument('--baseline');
if (baseline) {
  // Normalize only detail destinations so any category URL, copy, image,
  // product ordering or structured-data change still fails this comparison.
  const normalizeLinks = (value: string) => value.replace(
    /(?:https:\/\/bolenmirror\.com)?\/(?:en|zh|es|fr|de|it)\/products\/[^"<>\s]+/g,
    (link) => {
      const url = new URL(link, ORIGIN);
      const route = findProductRoute(url.pathname);
      return route ? `/${parseProductDetailPath(url.pathname)!.lang}/product-id/${route.id}/` : link;
    },
  );
  const capture = (html: string) => ({
    body: normalizeLinks(html.match(/<div data-prerender="catalog">([\s\S]*?)<\/div>/)?.[1] || ''),
    title: html.match(/<title>([^<]*)<\/title>/)?.[1],
    description: html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1],
    canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1],
    schema: [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(normalizeLinks(match[1]))),
    // Detail-only SEO overrides can be edited in the live database between
    // builds. They are not displayed by catalog cards; verify all other data.
    data: JSON.parse(html.match(/<script[^>]*id="__BOLEN_PRERENDER_DATA__"[^>]*>([\s\S]*?)<\/script>/)![1],
      (key, value) => key === 'seo' ? undefined : value),
  });
  const baselineFiles = (await readdir(baseline, { recursive: true })).filter((file) => file.endsWith('index.html'));
  assert.ok(baselineFiles.length > 0);
  for (const file of baselineFiles) {
    const before = capture(await readFile(path.join(baseline, file), 'utf8'));
    const after = capture(await readFile(path.join(DIST, file), 'utf8'));
    assert.ok(before.body && after.body, `Missing catalog baseline: ${file}`);
    for (const key of Object.keys(before) as Array<keyof typeof before>) {
      assert.deepEqual(after[key], before[key], `Catalog/category ${key} changed beyond product URLs: ${file}`);
    }
  }
  console.log(`[verify-product-routes] ${baselineFiles.length} catalog/category pages match the baseline except for detail URLs.`);
}

const baseUrl = argument('--base-url');
if (baseUrl) {
  // Verify the actual edge/static serving pipeline, including encoded CJK paths.
  const ids = Object.keys(PRODUCT_ROUTES);
  let cursor = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      for (const lang of LANGUAGES) {
        const canonicalPath = `/${lang}${productDetailPath({ id, title: '' }, lang)}/`;
        const response = await fetch(new URL(canonicalPath, baseUrl), { redirect: 'manual' });
        assert.equal(response.status, 200, `${canonicalPath}: expected direct HTTP 200`);
        const html = await response.text();
        assert.ok(html.includes(`href="${ORIGIN}${canonicalPath}"`), `${canonicalPath}: wrong HTML served`);
        const oldPath = `/${lang}/products/${PRODUCT_ROUTES[id].slugs.en}/?utm_source=verification`;
        const oldResponse = await fetch(new URL(oldPath, baseUrl), { redirect: 'manual' });
        assert.equal(oldResponse.status, 301, `${oldPath}: expected HTTP 301`);
        assert.equal(new URL(oldResponse.headers.get('location')!, baseUrl).pathname, canonicalPath);
        assert.equal(new URL(oldResponse.headers.get('location')!, baseUrl).search, '?utm_source=verification');
      }
    }
  }));
  console.log(`[verify-product-routes] ${detailCount} HTTP 200 destinations and ${detailCount} HTTP 301 legacy redirects passed.`);
}
