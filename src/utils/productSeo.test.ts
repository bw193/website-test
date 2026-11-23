import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  PRODUCT_SEO_LANGUAGES,
  buildProductDescription,
  buildProductJsonLd,
  buildProductSeoTitle,
  getProductSeoLengthRecommendation,
  normalizeProductSeo,
  parseProductPriceBounds,
  resolveProductSeo,
  type ProductSeoFields,
} from './productSeo';
import { toSlug } from './slug';
import { en } from '../locales/en';
import { zh } from '../locales/zh';
import { es } from '../locales/es';
import { fr } from '../locales/fr';
import { de } from '../locales/de';
import { it } from '../locales/it';

const locales = { en, zh, es, fr, de, it };
const defaults = {
  titleSuffix: '| BOLEN Mirror',
  descriptionTemplate: 'Source {title} with OEM/ODM support.',
};
const product: ProductSeoFields = {
  title: 'Round LED Bathroom Mirror with Touch Control',
  description: 'CTL511',
  details: 'A round bathroom mirror with adjustable lighting, a durable aluminum frame and touch control for hotel and residential projects.',
};

test('absent SEO fields preserve the existing generated title, description and H1', () => {
  assert.deepEqual(resolveProductSeo(product, 'en', defaults), {
    title: buildProductSeoTitle(product.title, defaults.titleSuffix),
    description: buildProductDescription(product, defaults.descriptionTemplate),
    h1: product.title,
  });
});

test('manual SEO is used verbatim without truncation or another brand suffix', () => {
  const seo = { en: {
    title: 'Custom Round LED Bathroom Mirror Manufacturer | Wholesale Lighted Mirror Supplier',
    description: 'Source custom round LED bathroom mirrors with touch controls and OEM/ODM options.',
    h1: 'Custom Round LED Bathroom Mirrors',
  } };
  assert.deepEqual(resolveProductSeo({ ...product, seo }, 'en', defaults), seo.en);
});

test('H1, SEO title and description never mutate the product name or URL', () => {
  const input = { ...product, seo: { en: { title: 'Wholesale LED Mirrors', h1: 'Custom Mirror Manufacturer' } } };
  const before = JSON.stringify(input);
  const slug = toSlug(input.title);
  resolveProductSeo(input, 'en', defaults);
  assert.equal(JSON.stringify(input), before);
  assert.equal(toSlug(input.title), slug);
});

test('partial overrides fall back independently and blank fields restore automatic values', () => {
  const actual = resolveProductSeo({ ...product, seo: { en: { title: '  ', description: 'Custom summary', h1: '\n' } } }, 'en', defaults);
  assert.equal(actual.title, buildProductSeoTitle(product.title, defaults.titleSuffix));
  assert.equal(actual.h1, product.title);
  assert.equal(actual.description, 'Custom summary');
});

test('English overrides do not leak into other language pages', () => {
  assert.deepEqual(
    resolveProductSeo({ ...product, seo: { en: { title: 'English override', description: 'English summary', h1: 'English heading' } } }, 'fr', defaults),
    resolveProductSeo(product, 'fr', defaults),
  );
});

test('normalization removes unsupported keys, invalid values and empty language entries', () => {
  assert.deepEqual(normalizeProductSeo({
    en: { title: '  Custom\nTitle  ', description: '  ', h1: 42, url: '/changed/' },
    zh: { h1: '定制浴室镜', description: null },
    es: [], fr: null, de: { title: false }, it: {}, pt: { title: 'Unsupported' },
  }), { en: { title: 'Custom Title' }, zh: { h1: '定制浴室镜' } });
  for (const value of [undefined, null, false, 42, 'not JSON', []]) {
    assert.deepEqual(normalizeProductSeo(value), {});
  }
});

test('JSON serialization retains all locale overrides and supports clearing just one locale', () => {
  const original = { en: { title: 'English title' }, fr: { h1: 'Miroirs sur mesure' }, zh: { description: '定制浴室镜制造与批发。' } };
  const reloaded = normalizeProductSeo(JSON.parse(JSON.stringify(original)));
  assert.deepEqual(reloaded, original);
  assert.deepEqual(normalizeProductSeo({ ...reloaded, fr: { title: '', h1: '' } }), { en: original.en, zh: original.zh });
});

for (const lang of PRODUCT_SEO_LANGUAGES) {
  test(`${lang}: each SEO field has a content-language-specific length recommendation`, () => {
    const expected = lang === 'zh'
      ? { title: { min: 25, max: 30 }, description: { min: 70, max: 90 }, h1: { min: 10, max: 30 } }
      : { title: { min: 50, max: 60 }, description: { min: 140, max: 160 }, h1: { min: 20, max: 70 } };
    for (const field of ['title', 'description', 'h1'] as const) {
      assert.deepEqual(getProductSeoLengthRecommendation(field, lang), expected[field]);
    }
  });

  test(`${lang}: localized defaults and saved overrides resolve independently`, () => {
    const copy = locales[lang].translation.productDetail;
    const localizedDefaults = { titleSuffix: copy.brandSuffix, descriptionTemplate: copy.descTemplate };
    const generated = resolveProductSeo({ title: 'Mirror' }, lang, localizedDefaults);
    assert.equal(generated.title, buildProductSeoTitle('Mirror', copy.brandSuffix));
    assert.equal(generated.description, copy.descTemplate.replace('{title}', 'Mirror'));
    const override = { title: `${lang} title`, description: `${lang} summary`, h1: `${lang} heading` };
    assert.deepEqual(resolveProductSeo({ ...product, seo: { [lang]: override } }, lang, localizedDefaults), override);
  });
}

test('recommendations never truncate or reject longer custom SEO copy', () => {
  for (const lang of PRODUCT_SEO_LANGUAGES) {
    const override = {
      title: 'Custom mirror title '.repeat(12).trim(),
      description: 'Custom bathroom mirror summary. '.repeat(12).trim(),
      h1: 'Custom mirror heading '.repeat(12).trim(),
    };
    for (const field of ['title', 'description', 'h1'] as const) {
      assert.ok(Array.from(override[field]).length > getProductSeoLengthRecommendation(field, lang).max);
    }
    assert.deepEqual(resolveProductSeo({ ...product, seo: { [lang]: override } }, lang, defaults), override);
  }
});

test('parseProductPriceBounds handles single prices, ranges, thousands separators, msrp fallback and price-less items', () => {
  assert.deepEqual(parseProductPriceBounds('$45', '$400'), { lowPrice: 45, highPrice: 45 });
  assert.deepEqual(parseProductPriceBounds('$35-$35'), { lowPrice: 35, highPrice: 35 });
  assert.deepEqual(parseProductPriceBounds('$35-$45', '$400'), { lowPrice: 35, highPrice: 45 });
  assert.deepEqual(parseProductPriceBounds('32-65', '499'), { lowPrice: 32, highPrice: 65 });
  assert.deepEqual(parseProductPriceBounds('$80 - $40'), { lowPrice: 40, highPrice: 80 });
  assert.deepEqual(parseProductPriceBounds('$1,200 - $1,550.50'), { lowPrice: 1200, highPrice: 1550.5 });
  assert.deepEqual(parseProductPriceBounds('$0-$50'), { lowPrice: 50, highPrice: 50 });

  // Fallback to msrp when price_range has no positive numeric price
  assert.deepEqual(parseProductPriceBounds('', '$400'), { lowPrice: 400, highPrice: 400 });
  assert.deepEqual(parseProductPriceBounds('Contact sales', '$280-$320'), { lowPrice: 280, highPrice: 320 });
  assert.deepEqual(parseProductPriceBounds('$0', '199.95'), { lowPrice: 199.95, highPrice: 199.95 });

  // Truly price-less items return zeros
  assert.deepEqual(parseProductPriceBounds('', ''), { lowPrice: 0, highPrice: 0 });
  assert.deepEqual(parseProductPriceBounds(undefined, undefined), { lowPrice: 0, highPrice: 0 });
  assert.deepEqual(parseProductPriceBounds('Quote on request', '$0'), { lowPrice: 0, highPrice: 0 });
});

test('buildProductJsonLd emits a valid single-price Offer without range priceSpecification or availability', () => {
  const schema = buildProductJsonLd({
    id: 'single-price-id',
    name: 'Round LED Bathroom Mirror',
    description: 'Copper-free silver LED bathroom mirror.',
    url: 'https://bolenmirror.com/en/products/led-lighted-mirror/round-led-bathroom-mirror/',
    images: [
      'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/mirror-1.jpg',
      '',
    ],
    specifications: [
      { key: 'Installation', value: 'Wall-mounted' },
      { key: 'installation', value: 'Wall-Mounted' },
      { key: 'IP Rating', value: 'IP44' },
    ],
    priceRange: '$45',
    msrp: '$200',
  });

  assert.deepEqual(schema, {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: 'Round LED Bathroom Mirror',
    image: ['https://bolenmirror.com/media/product-images/mirror-1.jpg'],
    description: 'Copper-free silver LED bathroom mirror.',
    sku: 'single-price-id',
    brand: {
      '@type': 'Brand',
      name: 'BOLEN',
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Installation', value: 'Wall-mounted' },
      { '@type': 'PropertyValue', name: 'IP Rating', value: 'IP44' },
    ],
    offers: {
      '@type': 'Offer',
      url: 'https://bolenmirror.com/en/products/led-lighted-mirror/round-led-bathroom-mirror/',
      priceCurrency: 'USD',
      price: 45,
      itemCondition: 'https://schema.org/NewCondition',
    },
  });
  assert.equal('priceSpecification' in (schema!.offers as Record<string, unknown>), false);
  assert.equal('availability' in (schema!.offers as Record<string, unknown>), false);
});

test('buildProductJsonLd emits Offer.price AND UnitPriceSpecification.price/minPrice/maxPrice for price ranges', () => {
  const schema = buildProductJsonLd({
    id: 'd3ee9bf9-45e7-463e-9b54-bf953195c296',
    name: 'Backlit Hotel LED Mirror',
    description: 'Custom hotel backlit mirror with stepless dimming.',
    url: 'https://bolenmirror.com/en/products/led-lighted-mirror/backlit-hotel-led-mirror/',
    images: ['https://bolenmirror.com/media/product-images/hotel-1.jpg'],
    priceRange: '$35-$45',
    msrp: '$400',
  });

  assert.ok(schema);
  assert.equal('additionalProperty' in schema, false);
  assert.deepEqual(schema.offers, {
    '@type': 'Offer',
    url: 'https://bolenmirror.com/en/products/led-lighted-mirror/backlit-hotel-led-mirror/',
    priceCurrency: 'USD',
    price: 35,
    itemCondition: 'https://schema.org/NewCondition',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: 35,
      minPrice: 35,
      maxPrice: 45,
      priceCurrency: 'USD',
    },
  });
  assert.equal('availability' in (schema.offers as Record<string, unknown>), false);
});

test('buildProductJsonLd falls back to msrp when price_range is empty', () => {
  const schema = buildProductJsonLd({
    id: 'msrp-fallback-id',
    name: 'Frameless Vanity Mirror',
    description: 'Frameless LED vanity mirror.',
    url: 'https://bolenmirror.com/en/products/led-lighted-mirror/frameless-vanity-mirror/',
    images: [],
    priceRange: '',
    msrp: '$299',
  });

  assert.ok(schema);
  assert.deepEqual(schema.offers, {
    '@type': 'Offer',
    url: 'https://bolenmirror.com/en/products/led-lighted-mirror/frameless-vanity-mirror/',
    priceCurrency: 'USD',
    price: 299,
    itemCondition: 'https://schema.org/NewCondition',
  });
});

test('buildProductJsonLd returns null for truly price-less products so invalid Product blocks are omitted', () => {
  const schema = buildProductJsonLd({
    id: 'dd492c7a-e9bd-4fc4-90b1-4fb34a62d11d',
    name: 'Black Aluminium Framed Arch LED Vanity Mirror',
    description: 'Arch vanity mirror with copper-free silver glass.',
    url: 'https://bolenmirror.com/en/products/led-lighted-mirror/arch-vanity-mirror/',
    images: ['https://bolenmirror.com/media/product-images/arch-1.jpg'],
    priceRange: '',
    msrp: '',
  });

  assert.equal(schema, null);
});
