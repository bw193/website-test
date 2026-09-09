import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { toProductSlug } from './slug';
import {
  PRODUCT_ROUTES, findProductRoute, localizedProductPathname, parseProductDetailPath,
  productAlternatePaths, productDetailPath, productMatchesDetailPath, productRedirectLocation,
} from './productRoutes';
import { buildCatalogCategorySchema } from './catalogCategory';

const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
const ORIGIN = 'https://bolenmirror.com';
const id = 'edcee852-cbc8-4d0d-a0e8-eb54f443e94d';
const product = { id, title: 'Drop-Shaped Aluminum Framed Shatterproof LED Bathroom Mirror', category: 'Led Lighted Mirror' };
const germanPath = '/products/led-lighted-mirror/tropfenfoermiger-bruchsicherer-led-badezimmerspiegel-mit-aluminiumrahmen';

test('German detail URLs contain the category and German product name', () => {
  assert.equal(productDetailPath(product, 'de'), germanPath);
  assert.equal(productDetailPath(product, 'en'), '/products/led-lighted-mirror/drop-shaped-aluminum-framed-shatterproof-led-bathroom-mirror');
  assert.equal(productDetailPath({ ...product, title: 'Different display or SEO title' }, 'de'), germanPath);
});

test('localized slugs handle German umlauts, Latin accents, model codes and Chinese', () => {
  assert.equal(toProductSlug('Großer Spiegel für Bäder – Größe 60×80', 'de'), 'grosser-spiegel-fuer-baeder-groesse-60-80');
  assert.equal(toProductSlug('Miroir éclairé, modèle CTL609', 'fr'), 'miroir-eclaire-modele-ctl609');
  assert.equal(toProductSlug('Espejo de baño con iluminación', 'es'), 'espejo-de-bano-con-iluminacion');
  assert.equal(toProductSlug('圆形 LED 浴室镜，触摸调光', 'zh'), '圆形-led-浴室镜-触摸调光');
});

test('every built language URL resolves to its product ID and switches reciprocally', () => {
  const urls = new Set<string>();
  for (const [productId, route] of Object.entries(PRODUCT_ROUTES)) {
    for (const lang of LANGUAGES) {
      const urlPath = `/${lang}${productDetailPath({ id: productId, title: '' }, lang)}/`;
      assert.equal(findProductRoute(urlPath)?.id, productId);
      assert.equal(findProductRoute(decodeURI(urlPath))?.id, productId);
      assert.equal(productRedirectLocation(new URL(urlPath, ORIGIN)), null);
      assert.equal(urls.has(urlPath), false, `Duplicate URL: ${urlPath}`);
      urls.add(urlPath);
      assert.ok(route.category);
      for (const other of LANGUAGES) {
        const switched = localizedProductPathname(urlPath, other)!;
        assert.equal(findProductRoute(switched)?.id, productId);
        assert.equal(localizedProductPathname(switched, lang), urlPath);
      }
    }
  }
  assert.equal(urls.size, Object.keys(PRODUCT_ROUTES).length * LANGUAGES.length);
});

test('compiled slugs follow the actual translations for every non-English product', () => {
  for (const lang of LANGUAGES.filter((value) => value !== 'en')) {
    const file = lang === 'zh' ? 'product-slugs.zh.json' : `products.${lang}.json`;
    const translations = JSON.parse(readFileSync(new URL(`../../public/i18n/${file}`, import.meta.url), 'utf8'));
    for (const [productId, route] of Object.entries(PRODUCT_ROUTES)) {
      assert.equal(route.slugs[lang], toProductSlug(translations[productId].title, lang));
      assert.notEqual(route.slugs[lang], route.slugs.en, `${lang}/${productId}: English URL remains`);
    }
  }
});

test('old English, UUID and unprefixed detail links redirect directly, preserving query parameters', () => {
  for (const [productId, route] of Object.entries(PRODUCT_ROUTES)) {
    for (const prefix of ['', ...LANGUAGES.map((lang) => `/${lang}`)]) {
      const lang = prefix.slice(1) || 'en';
      const expected = `/${lang}${productDetailPath({ id: productId, title: '' }, lang)}/?utm_source=legacy`;
      for (const param of [route.slugs.en, `${route.slugs.en}-${productId}`, productId]) {
        for (const slash of ['', '/']) {
          assert.equal(productRedirectLocation(new URL(`${prefix}/products/${param}${slash}?utm_source=legacy`, ORIGIN)), expected);
        }
      }
    }
  }
});

const historicalMisspellings = [
  {
    id: '0a97a69f-9285-42be-b8ef-04b3e1ebfd00',
    category: 'bathroom-mirror-without-led',
    slug: 'modern-minimalist-bulk-frameless-rectanglar-beveled-edge-bathroom-vanity-mirror-wall-mounted',
  },
  {
    id: 'ed981223-b816-44ca-be5a-feee3512fe9b',
    category: 'led-lighted-mirror',
    slug: 'low-moq-rectanglar-ip44-waterproof-led-lighted-bathroom-mirror-with-aluminum-alloy-frame',
  },
  {
    id: 'fdbac784-0592-4680-bb92-cf2e10f6026b',
    category: 'mirror-cabinet',
    slug: 'manufacturer-rectanglar-smart-light-color-temperature-adjustable-vanity-mirror-cabinet-with-storage',
  },
];

for (const legacy of historicalMisspellings) {
  test(`historical misspelling resolves and redirects for ${legacy.category}`, () => {
    const current = { id: legacy.id, title: 'Updated product title', category: legacy.category };
    for (const prefix of ['', ...LANGUAGES.map((lang) => `/${lang}`)]) {
      const lang = prefix.slice(1) || 'en';
      const canonical = `/${lang}${productDetailPath(current, lang)}/`;
      for (const categoryPrefix of ['', `${legacy.category}/`]) {
        for (const slash of ['', '/']) {
          const pathname = `${prefix}/products/${categoryPrefix}${legacy.slug}${slash}`;
          assert.equal(findProductRoute(pathname)?.id, legacy.id);
          assert.equal(productMatchesDetailPath(current, pathname), true);
          assert.equal(productMatchesDetailPath({ ...current, id: 'other' }, pathname), false);
          assert.equal(
            productRedirectLocation(new URL(`${pathname}?utm_source=legacy&q=custom%20size`, ORIGIN)),
            `${canonical}?utm_source=legacy&q=custom%20size`,
          );
        }
      }
      assert.equal(productRedirectLocation(new URL(canonical, ORIGIN)), null);
    }
    assert.equal(findProductRoute(`/en/products/wrong-category/${legacy.slug}/`), null);
    assert.equal(findProductRoute(`/en/products/${legacy.category}/${legacy.slug}-unknown/`), null);
  });
}

test('catalogs, categories, unknown URLs and unrelated routes are never remapped', () => {
  for (const prefix of ['', ...LANGUAGES.map((lang) => `/${lang}`)]) {
    for (const suffix of ['/products', '/products/', '/products/category', '/products/category/', '/products/category/led-lighted-mirror/']) {
      assert.equal(parseProductDetailPath(`${prefix}${suffix}`), null);
      assert.equal(productRedirectLocation(new URL(`${prefix}${suffix}`, ORIGIN)), null);
    }
  }
  for (const pathname of ['/en/products/unknown/', '/en/products/wrong-category/unknown/', '/admin/products/new', '/fr/insights/article/', '/de/products/%E0%A4%A/']) {
    assert.equal(localizedProductPathname(pathname, 'it'), null);
  }
  assert.equal(findProductRoute(`/de/products/wrong-category/${PRODUCT_ROUTES[id].slugs.de}/`), null);
  assert.equal(productMatchesDetailPath(product, `/de${germanPath}/`), true);
  assert.equal(productMatchesDetailPath({ ...product, id: 'other' }, `/de${germanPath}/`), false);
});

test('category ItemList uses the same translated destination as product cards', () => {
  const schemas = buildCatalogCategorySchema({
    lang: 'de', slug: 'led-lighted-mirror', name: 'LED-Spiegel', description: 'Existing copy',
    homeLabel: 'Startseite', catalogLabel: 'Produkte', products: [{ ...product, name: 'Tropfenförmiger Spiegel' }],
  });
  const itemList = schemas[2].itemListElement as Array<{ url: string }>;
  assert.equal(itemList[0].url, `${ORIGIN}/de${germanPath}/`);
  assert.equal(schemas[0].url, `${ORIGIN}/de/products/category/led-lighted-mirror/`);
  assert.equal(productAlternatePaths(product).de, germanPath);
});
