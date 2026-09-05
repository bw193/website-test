import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium, type Page } from 'playwright';
import { PRODUCT_ROUTES, productDetailPath } from '../src/utils/productRoutes';

const BASE = process.argv[2] || 'http://127.0.0.1:4179';
const id = 'edcee852-cbc8-4d0d-a0e8-eb54f443e94d';
const langs = ['en', 'de', 'fr', 'es', 'it', 'zh'] as const;
const labels = { en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español', it: 'Italiano', zh: '中文' };
const route = (lang: string) => `/${lang}${productDetailPath({ id, title: '' }, lang)}/`;
const screenshotDir = await mkdtemp(path.join(tmpdir(), 'bolen-product-routing-'));
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined),
});
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await context.newPage();
const errors: string[] = [];
page.on('pageerror', (error) => errors.push(error.message));

async function assertProduct(page: Page, lang: string, expectedId = id) {
  const pathname = `/${lang}${productDetailPath({ id: expectedId, title: '' }, lang)}/`;
  await page.waitForURL((url) => url.pathname === pathname);
  await page.locator('#product-rfq').waitFor();
  await page.waitForFunction(({ pathname, expectedId }) => {
    if (document.querySelector('link[rel="canonical"]')?.getAttribute('href') !== `https://bolenmirror.com${pathname}`) return false;
    return [...document.querySelectorAll('script[type="application/ld+json"]')].some((script) => {
      const schema = JSON.parse(script.textContent || '{}');
      return schema['@type'] === 'Product' && schema.sku === expectedId;
    });
  }, { pathname, expectedId });
  assert.equal(await page.locator('h1').count(), 1);
  const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((elements) =>
    elements.map((element) => ({ lang: element.getAttribute('hreflang'), href: element.getAttribute('href') })),
  );
  for (const alternate of alternates) {
    const alternateLang = alternate.lang === 'x-default' ? 'en' : alternate.lang!;
    assert.equal(alternate.href, `https://bolenmirror.com/${alternateLang}${productDetailPath({ id: expectedId, title: '' }, alternateLang)}/`);
  }
  assert.equal(alternates.length, 7);
}

async function waitForVisuals(page: Page) {
  await page.waitForFunction(() => {
    let element: Element | null = document.querySelector('h1');
    if (!element) return false;
    while (element) {
      if (Number(getComputedStyle(element).opacity) < 0.99) return false;
      element = element.parentElement;
    }
    const image = document.querySelector('main img') as HTMLImageElement | null;
    return !!image?.complete && image.naturalWidth > 0;
  });
}

try {
  for (const lang of langs) {
    await page.goto(new URL(route(lang), BASE).href, { waitUntil: 'domcontentloaded' });
    await assertProduct(page, lang);
  }
  console.log('[browser] Direct entry and hydration passed in all 6 languages.');
  // A real menu click must use the translated destination, with no page reload.
  for (const lang of langs) {
    await page.locator('button[aria-haspopup="true"]:visible').click();
    await page.getByRole('menuitem', { name: labels[lang], exact: true }).click();
    await assertProduct(page, lang);
  }
  console.log('[browser] Language menu keeps the product identity across all 6 locales.');

  await page.goto(new URL('/de/products/category/led-lighted-mirror/', BASE).href);
  const card = page.locator('main article a[href*="/products/led-lighted-mirror/"]').first();
  await card.waitFor();
  const href = (await card.getAttribute('href'))!;
  const expectedId = Object.keys(PRODUCT_ROUTES).find((candidate) =>
    `/de${productDetailPath({ id: candidate, title: '' }, 'de')}/` === href,
  )!;
  assert.ok(expectedId);
  await card.click();
  await assertProduct(page, 'de', expectedId);
  await page.goBack();
  await page.waitForURL('**/de/products/category/led-lighted-mirror/');
  await page.locator('main article').first().waitFor();
  console.log('[browser] Category card click and browser Back preserve the category page.');

  await page.goto(new URL(`/de/products/${PRODUCT_ROUTES[id].slugs.en}/?utm_source=browser`, BASE).href);
  await assertProduct(page, 'de');
  assert.equal(new URL(page.url()).search, '?utm_source=browser');
  await waitForVisuals(page);
  await page.screenshot({ path: path.join(screenshotDir, 'german-detail-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await waitForVisuals(page);
  await page.screenshot({ path: path.join(screenshotDir, 'german-detail-mobile.png') });
  assert.equal(await page.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth), true);
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  console.log(`[browser] Legacy entry, campaign parameter and mobile layout passed. Screenshots: ${screenshotDir}`);
} finally {
  await context.close();
  await browser.close();
}
