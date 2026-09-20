import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compileProductRoutes, PRODUCT_ROUTE_LANGUAGES } from './product-routes';

const product = {
  id: 'new-product',
  title: 'Irregular Frameless LED Mirror',
  category: 'Irregular Mirror',
};

test('new products with no translations get reachable URLs in all six languages', () => {
  const { routes, missingTranslations } = compileProductRoutes([product], {});
  assert.equal(routes[product.id].category, 'irregular-mirror');
  for (const lang of PRODUCT_ROUTE_LANGUAGES) {
    assert.equal(routes[product.id].slugs[lang], 'irregular-frameless-led-mirror');
  }
  assert.deepEqual(missingTranslations, [{
    id: product.id,
    title: product.title,
    languages: ['zh', 'es', 'fr', 'de', 'it'],
  }]);
});

test('partial translations keep localized URLs and report only absent or blank titles', () => {
  const { routes, missingTranslations } = compileProductRoutes([product], {
    zh: { [product.id]: { title: '异形无框 LED 镜' } },
    es: { [product.id]: { title: 'Espejo LED sin marco' } },
    de: { [product.id]: { title: '   ' } },
    fr: { [product.id]: {} },
    it: { [product.id]: { title: null } },
  });
  assert.deepEqual(routes[product.id].slugs, {
    en: 'irregular-frameless-led-mirror',
    zh: '异形无框-led-镜',
    es: 'espejo-led-sin-marco',
    fr: 'irregular-frameless-led-mirror',
    de: 'irregular-frameless-led-mirror',
    it: 'irregular-frameless-led-mirror',
  });
  assert.deepEqual(missingTranslations[0].languages, ['fr', 'de', 'it']);
});

test('fallback uses the exact English slug even when the source has accented letters', () => {
  const { routes } = compileProductRoutes([{ ...product, title: 'Décor Mirror' }], {});
  for (const lang of PRODUCT_ROUTE_LANGUAGES) {
    assert.equal(routes[product.id].slugs[lang], 'd-cor-mirror');
  }
});

test('translated URLs replace the fallback when translations become available', () => {
  const translations = Object.fromEntries(['zh', 'es', 'fr', 'de', 'it'].map((lang) => [
    lang, { [product.id]: { title: `Translated ${lang} Mirror` } },
  ]));
  const { routes, missingTranslations } = compileProductRoutes([product], translations);
  assert.equal(routes[product.id].slugs.en, 'irregular-frameless-led-mirror');
  assert.equal(routes[product.id].slugs.de, 'translated-de-mirror');
  assert.deepEqual(missingTranslations, []);
});

test('fallbacks cannot silently collide with another product URL', () => {
  const other = { ...product, id: 'other-product', title: 'Other Mirror' };
  assert.throws(() => compileProductRoutes([product, other], {
    es: { [product.id]: { title: 'Other Mirror' } },
  }), /Duplicate product URL es\/irregular-mirror\/other-mirror: new-product and other-product/);
});

test('invalid source titles, translated slugs and reserved categories still fail', () => {
  assert.throws(() => compileProductRoutes([{ ...product, title: ' ' }], {}), /Missing en URL title/);
  assert.throws(() => compileProductRoutes([{ ...product, title: '!!!' }], {}), /Empty en slug/);
  assert.throws(() => compileProductRoutes([product], {
    zh: { [product.id]: { title: '!!!' } },
  }), /Empty zh slug/);
  assert.throws(() => compileProductRoutes([{ ...product, category: 'Category' }], {}), /Reserved product category/);
});
