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
  await writeFile(resolve(ROOT, 'src/data/productRoutes.json'), `${JSON.stringify(routes, null, 2)}\n`);
  console.log(`[product-routes] Generated ${products.length * LANGUAGES.length} detail URLs across ${LANGUAGES.length} languages.`);
}

main().catch((error) => {
  console.error('[product-routes]', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
