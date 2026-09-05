import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import 'dotenv/config';
import { toProductSlug, toSlug } from '../src/utils/slug';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
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
const used = new Map<string, string>();
const routes = Object.fromEntries(products.map((product) => {
  const category = toSlug(product.category || '') || 'uncategorized';
  if (category === 'category') throw new Error(`Reserved product category: ${product.id}`);
  const slugs = Object.fromEntries(LANGUAGES.map((lang) => {
    const title = lang === 'en' ? product.title : translations[lang]?.[product.id]?.title;
    if (!title?.trim()) throw new Error(`Missing ${lang} URL translation for ${product.id} (${product.title}).`);
    const slug = lang === 'en' ? toSlug(title) : toProductSlug(title, lang);
    if (!slug) throw new Error(`Empty ${lang} slug for ${product.id}.`);
    const key = `${lang}/${category}/${slug}`;
    if (used.has(key)) throw new Error(`Duplicate product URL ${key}: ${used.get(key)} and ${product.id}.`);
    used.set(key, product.id);
    return [lang, slug];
  }));
  return [product.id, { category, slugs }];
}));
await writeFile(resolve(ROOT, 'src/data/productRoutes.json'), `${JSON.stringify(routes, null, 2)}\n`);
console.log(`[product-routes] Generated ${products.length * LANGUAGES.length} localized detail URLs.`);
