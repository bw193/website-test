import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import 'dotenv/config';
import { compileProductRoutes, PRODUCT_ROUTE_LANGUAGES } from './lib/product-routes';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANGUAGES = PRODUCT_ROUTE_LANGUAGES;

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mxmmffwntosvwaviippd.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_kf5n3mcse_1n8pTw-xHnQg__mNSn3iD',
  );

  const { data: products, error } = await supabase.from('products')
    .select('id, title, category').eq('is_active', true).order('id');
  if (error) throw new Error(`Cannot generate product URLs: ${error.message}`);
  if (!products?.length) throw new Error('Cannot generate product URLs from an empty catalog.');

  const translations = Object.fromEntries(await Promise.all(
    LANGUAGES.filter((lang) => lang !== 'en').map(async (lang) => [lang, JSON.parse(await readFile(
      resolve(ROOT, 'public/i18n', lang === 'zh' ? 'product-slugs.zh.json' : `products.${lang}.json`), 'utf8',
    )) as Record<string, { title: string }>]),
  ));
  const { routes, missingTranslations } = compileProductRoutes(products, translations);
  for (const { id, title, languages } of missingTranslations) {
    console.warn(`[product-routes] Missing ${languages.join(', ')} URL translations for ${id} (${title.trim()}); using the English slug.`);
  }

  // Guard against uncommitted-translation loss & preserve displaced slugs as 301 aliases.
  const routesPath = resolve(ROOT, 'src/data/productRoutes.json');
  const legacyPath = resolve(ROOT, 'src/data/legacyProductAliases.json');
  const previousRoutes = JSON.parse(await readFile(routesPath, 'utf8').catch(() => '{}')) as Record<
    string,
    { category: string; slugs: Record<string, string> }
  >;
  const legacyData = JSON.parse(
    await readFile(legacyPath, 'utf8').catch(() => '{"activeSlugIds":{},"discontinuedCategoryBySlug":{}}'),
  ) as {
    activeSlugIds: Record<string, string>;
    discontinuedCategoryBySlug: Record<string, string>;
  };

  const regressions: string[] = [];
  const activeCanonicalSlugs = new Map<string, string>();
  for (const [id, route] of Object.entries(routes)) {
    for (const s of Object.values(route.slugs)) activeCanonicalSlugs.set(s, id);
  }

  let addedAliases = 0;
  for (const [id, prev] of Object.entries(previousRoutes)) {
    const next = routes[id];
    if (!next) continue;
    for (const lang of LANGUAGES) {
      const oldSlug = prev.slugs?.[lang];
      const newSlug = next.slugs[lang];
      if (!oldSlug || oldSlug === newSlug) continue;
      if (lang !== 'en' && oldSlug !== prev.slugs.en && newSlug === next.slugs.en) {
        regressions.push(`${id} (${lang}: ${oldSlug} -> English fallback)`);
      }
      if (!activeCanonicalSlugs.has(oldSlug) && legacyData.activeSlugIds[oldSlug] !== id) {
        legacyData.activeSlugIds[oldSlug] = id;
        addedAliases += 1;
      }
    }
  }

  if (regressions.length > 0 && process.env.ALLOW_ROUTE_REGRESSION !== '1') {
    throw new Error(
      `Refusing to overwrite ${regressions.length} existing localized URL(s) with English fallbacks (run npm run translate or set ALLOW_ROUTE_REGRESSION=1): ${regressions.slice(0, 5).join('; ')}`,
    );
  }

  if (addedAliases > 0) {
    legacyData.activeSlugIds = Object.fromEntries(
      Object.entries(legacyData.activeSlugIds).sort(([a], [b]) => a.localeCompare(b)),
    );
    await writeFile(legacyPath, `${JSON.stringify(legacyData, null, 2)}\n`);
    console.log(`[product-routes] Preserved ${addedAliases} displaced product slug(s) in legacyProductAliases.json.`);
  }

  await writeFile(routesPath, `${JSON.stringify(routes, null, 2)}\n`);
  console.log(`[product-routes] Generated ${products.length * LANGUAGES.length} detail URLs across ${LANGUAGES.length} languages.`);
}

main().catch((error) => {
  console.error('[product-routes]', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
