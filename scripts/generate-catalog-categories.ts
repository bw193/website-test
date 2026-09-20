import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import 'dotenv/config';
import { DEFAULT_PRODUCT_CATEGORIES, parseCategoriesSetting } from '../src/utils/catalogCategory';

// Snapshots the editor-managed category list (site_settings.categories) into
// src/data/catalogCategories.json so components that render on every page —
// the footer, most importantly — link to categories that actually exist.
// The footer used to iterate the hardcoded DEFAULT_PRODUCT_CATEGORIES, which
// still listed "New Arrival" (removed by the editors) and lacked "Mirror
// Cabinet" (added by them), so all 872 pages linked to a dead category page.
// Mirrors scripts/generate-product-routes.ts: a compact build-time index keeps
// links synchronous with no Supabase round-trip on the client.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mxmmffwntosvwaviippd.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_kf5n3mcse_1n8pTw-xHnQg__mNSn3iD',
);

const { data, error } = await supabase
  .from('site_settings')
  .select('value')
  .eq('key', 'categories')
  .maybeSingle();
if (error) throw new Error(`Cannot read catalog categories: ${error.message}`);

// An absent or empty setting is legitimate (fresh project) and falls back to
// the defaults, exactly like the runtime and the prerender do.
const parsed = parseCategoriesSetting(data?.value);
const categories = parsed.length > 0 ? parsed : [...DEFAULT_PRODUCT_CATEGORIES];

await writeFile(resolve(ROOT, 'src/data/catalogCategories.json'), `${JSON.stringify(categories, null, 2)}\n`);
console.log(
  `[catalog-categories] Wrote ${categories.length} categories${parsed.length ? '' : ' (defaults; site_settings.categories is empty)'}: ${categories.join(', ')}`,
);
