import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getCatalogCategoryPageCopy, getCatalogCategorySeoTitle } from '../src/utils/catalogCategory';
import { resolveProductSeo, type ProductSeoFields } from '../src/utils/productSeo';
import { polishEnglishProductTitle } from '../src/utils/productCopy';
import { en } from '../src/locales/en';
import { zh } from '../src/locales/zh';
import { es } from '../src/locales/es';
import { fr } from '../src/locales/fr';
import { de } from '../src/locales/de';
import { it } from '../src/locales/it';

const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
const DIST = path.resolve('dist');
const ORIGIN = 'https://bolenmirror.com';
const LOCALES = { en, zh, es, fr, de, it };

function decodeHtml(value: string): string {
  const named: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()] ?? match;
  });
}

const normalized = (value: string) => value.replace(/\s+/g, ' ').trim();

function readOne(html: string, pattern: RegExp, route: string, label: string): string {
  const matches = [...html.matchAll(pattern)];
  assert.equal(matches.length, 1, `${route}: expected exactly one ${label}`);
  const value = normalized(decodeHtml(matches[0][1]));
  assert.ok(value.length > 0, `${route}: ${label} is empty`);
  return value;
}

async function main(): Promise<void> {
  const routeSets: Set<string>[] = [];
  const counts = { catalogs: 0, categories: 0, products: 0 };

  for (const lang of LANGUAGES) {
    const productRoot = path.join(DIST, lang, 'products');
    const files = (await readdir(productRoot, { recursive: true }))
      .filter((file) => path.basename(file) === 'index.html')
      .sort();
    assert.ok(files.includes('index.html'), `${lang}: product catalog was not built; run npm run build first`);
    const routeSet = new Set<string>();

    for (const file of files) {
      const absolutePath = path.join(productRoot, file);
      const relativePath = path.relative(DIST, absolutePath).split(path.sep).join('/');
      const route = `/${relativePath.replace(/index\.html$/, '')}`;
      routeSet.add(route.slice(lang.length + 1));
      const html = (await readFile(absolutePath, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
      const title = readOne(html, /<title\b[^>]*>([^<]*)<\/title>/g, route, 'Title');
      const h1 = readOne(html, /<h1\b[^>]*>([^<]*)<\/h1>/g, route, 'H1');
      const description = readOne(html, /<meta\b[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/g, route, 'Meta Description');
      const visibleDescription = readOne(html, /<p\b[^>]*\bdata-seo-description=""[^>]*>([^<]*)<\/p>/g, route, 'visible SEO description');
      const canonical = readOne(html, /<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/g, route, 'canonical');
      const htmlLang = readOne(html, /<html\b[^>]*lang="([^"]*)"[^>]*>/g, route, 'HTML language');

      assert.equal(visibleDescription, description, `${route}: visible description differs from Meta Description`);
      assert.equal(canonical, `${ORIGIN}${route}`, `${route}: canonical URL changed`);
      assert.equal(htmlLang, lang, `${route}: HTML language does not match the route`);

      for (const [attribute, prefix] of [['property', 'og'], ['name', 'twitter']] as const) {
        for (const [field, expected] of [['title', title], ['description', description]] as const) {
          const label = `${prefix}:${field}`;
          const value = readOne(html, new RegExp(`<meta\\b[^>]*${attribute}="${label}"[^>]*content="([^"]*)"[^>]*>`, 'g'), route, label);
          assert.equal(value, expected, `${route}: ${label} differs from page metadata`);
        }
      }

      const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .flatMap<Record<string, unknown>>((match) => {
          const parsed: unknown = JSON.parse(match[1]);
          const entries: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
          return entries.map((entry) => {
            assert.ok(entry && typeof entry === 'object' && !Array.isArray(entry), `${route}: invalid JSON-LD object`);
            return entry as Record<string, unknown>;
          });
        });
      const categorySlug = route.match(/\/products\/category\/([^/]+)\/$/)?.[1];
      const isCatalog = route === `/${lang}/products/`;
      const pageType = isCatalog || categorySlug ? 'CollectionPage' : 'Product';
      const pageSchemas = schemas.filter((schema) => schema['@type'] === pageType);
      assert.equal(pageSchemas.length, 1, `${route}: expected one ${pageType} schema`);
      assert.equal(normalized(String(pageSchemas[0].name)), h1, `${route}: schema name differs from H1`);
      assert.equal(normalized(String(pageSchemas[0].description)), description, `${route}: schema description differs from Meta Description`);

      if (categorySlug) {
        const expectedTitle = getCatalogCategorySeoTitle(lang, categorySlug, '');
        if (expectedTitle) {
          const expectedCopy = getCatalogCategoryPageCopy(lang, categorySlug, { h1: '', description: '' });
          assert.ok(expectedCopy.h1 && expectedCopy.description, `${route}: custom title has no dedicated page copy`);
          assert.equal(title, expectedTitle, `${route}: category Title override missing`);
          assert.deepEqual({ h1, description }, expectedCopy, `${route}: category copy override missing`);
        }
        const itemLists = schemas.filter((schema) => schema['@type'] === 'ItemList');
        assert.equal(itemLists.length, 1, `${route}: expected one ItemList`);
        assert.equal(itemLists[0].name, h1, `${route}: ItemList name differs from H1`);
        counts.categories += 1;
      } else if (isCatalog) {
        counts.catalogs += 1;
      } else {
        const islandMatch = html.match(/<script\b[^>]*id="__BOLEN_PRERENDER_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        assert.ok(islandMatch, `${route}: product data island missing`);
        const payload = JSON.parse(islandMatch[1]) as {
          product: ProductSeoFields & { id: string };
          productTranslations?: Record<string, Partial<ProductSeoFields>>;
        };
        const translated = payload.productTranslations?.[payload.product.id];
        const product: ProductSeoFields = {
          ...payload.product,
          title: translated?.title || payload.product.title,
          description: translated?.description || payload.product.description,
          details: translated?.details || payload.product.details,
        };
        if (lang === 'en') product.title = polishEnglishProductTitle(product.title);
        const copy = LOCALES[lang].translation.productDetail;
        const expected = resolveProductSeo(product, lang, {
          titleSuffix: copy.brandSuffix,
          descriptionTemplate: copy.descTemplate,
        });
        assert.deepEqual({ title, description, h1 }, {
          title: normalized(expected.title), description: normalized(expected.description), h1: normalized(expected.h1),
        }, `${route}: saved product SEO/defaults do not match the rendered page`);
        counts.products += 1;
      }
    }

    routeSets.push(routeSet);
  }

  for (let index = 1; index < routeSets.length; index += 1) {
    assert.deepEqual(routeSets[index], routeSets[0], `${LANGUAGES[index]}: product routes differ from the English routes`);
  }
  console.log(`[verify-product-seo] Passed: ${counts.catalogs} catalogs, ${counts.categories} category pages, ${counts.products} product pages across ${LANGUAGES.length} languages.`);
  console.log('[verify-product-seo] Title, Meta Description, visible H1/description, canonical, social tags and page schema are consistent.');
}

main().catch((error) => {
  console.error('[verify-product-seo] Failed:', error);
  process.exitCode = 1;
});
