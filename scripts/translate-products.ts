/**
 * Generates per-language product copy for the storefront.
 *
 * Reads active products from Supabase (the English source of truth) and uses the
 * Gemini API to translate the human-readable fields — title, description,
 * details, and specification keys/values — into zh / es / fr / de / it.
 *
 * Output: public/i18n/products.<lang>.json, a map of product id -> fields, e.g.
 *   { "<uuid>": { "title": "...", "description": "...", "details": "...",
 *                 "specifications": [{ "key": "...", "value": "..." }] } }
 * These static files are committed and consumed at build time by
 * scripts/prerender-static.ts and at runtime by src/utils/productI18n.ts.
 *
 * Translation is the source of truth's hash away from a no-op: a product whose
 * English source is unchanged (see public/i18n/.source.json) is reused, so
 * re-runs only translate new/edited products and stay cheap.
 *
 * Usage:  GEMINI_API_KEY=... npm run translate
 *         (optional GEMINI_MODEL, default gemini-2.0-flash)
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(PROJECT_ROOT, 'public', 'i18n');

const TARGET_LANGS = ['zh', 'es', 'fr', 'de', 'it'] as const;
type TargetLang = (typeof TARGET_LANGS)[number];
const LANG_NAMES: Record<TargetLang, string> = {
  zh: 'Simplified Chinese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
};

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

interface Spec {
  key: string;
  value: string;
}
interface ProductRow {
  id: string;
  title: string;
  description?: string;
  details?: string;
  specifications?: Spec[] | Record<string, string> | null;
}
interface Fields {
  title?: string;
  description?: string;
  details?: string;
  specifications?: Spec[];
}

const PROMPT_LEAK_RE =
  /benefit-first language|spec signals trust|nutzenorientierte sprache|lenguaje orientado|langage ax[ée] sur|linguaggio orientato/i;

function normalizeSpecs(raw: ProductRow['specifications']): Spec[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((s) => s && s.key).map((s) => ({ key: String(s.key), value: String(s.value ?? '') }));
  }
  return Object.entries(raw).map(([key, value]) => ({ key, value: String(value ?? '') }));
}

// A description that is really just a model code (e.g. "CTF0067LK") or an
// accidental authoring rubric has nothing to translate.
function isTranslatableText(text: string | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (PROMPT_LEAK_RE.test(trimmed)) return false;
  return /\s/.test(trimmed) && trimmed.length >= 15;
}

// The English source we feed the model — also what we hash for the skip cache.
function sourceFields(p: ProductRow): Fields {
  const fields: Fields = { title: p.title };
  if (isTranslatableText(p.description)) fields.description = p.description;
  if (isTranslatableText(p.details)) fields.details = p.details;
  const specs = normalizeSpecs(p.specifications);
  if (specs.length) fields.specifications = specs;
  return fields;
}

function hashFields(f: Fields): string {
  return createHash('sha1').update(JSON.stringify(f)).digest('hex');
}

function sanitizeText(lang: TargetLang, value: string): string {
  let out = value.replace(/\*\* +([^*\n]+?)\*\*/g, '**$1**').replace(/\*\*([^*\n]+?) +\*\*/g, '**$1**');
  // Normalize CommonMark §6.2 punctuation-flanking bold spans (especially CJK `**...：**` / `**...）**`)
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, (full, rawInner: string, offset: number, str: string) => {
    let inner = rawInner.trim();
    if (!inner) return full;
    let suffixOutside = '';
    if (inner.endsWith('：') && inner.length > 1) {
      inner = inner.slice(0, -1).trim();
      suffixOutside = '：';
    }
    const prev = offset > 0 ? str[offset - 1] : '';
    const next = suffixOutside ? suffixOutside[0] : offset + full.length < str.length ? str[offset + full.length] : '';
    const lead = /[\p{L}\p{N}]/u.test(prev) && /^[^\s\p{L}\p{N}]/u.test(inner) ? ' ' : '';
    const trail = !suffixOutside && /[^\s\p{L}\p{N}]$/u.test(inner) && /[\p{L}\p{N}]/u.test(next) ? ' ' : '';
    return `${lead}**${inner}**${suffixOutside}${trail}`;
  });
  if (lang === 'fr') {
    out = out
      .replace(/\bde plain-pied\b/gi, 'en pied')
      .replace(/\bmiroirs? de vanity\b/gi, (m) => (/miroirs/i.test(m) ? 'miroirs de salle de bains' : 'miroir de salle de bains'));
  } else if (lang === 'es') {
    out = out
      .replace(/\bespejos? de vanidad\b/gi, (m) => (/espejos/i.test(m) ? 'espejos de tocador' : 'espejo de tocador'))
      .replace(/\bantinieblas?\b/gi, 'antivaho')
      .replace(/\b(?:con |en )?forma de piscina\b/gi, 'tipo cápsula');
  } else if (lang === 'de') {
    out = out
      .replace(/\bEntnebler(?:s|n)?\b/g, 'Antibeschlagfunktion')
      .replace(/\b[Bb]eckenförmig(er|e|es|en|em)?\b/g, (_, suf = '') => `kapselförmig${suf}`);
  } else if (lang === 'it') {
    out = out.replace(/\ba forma di piscina\b/gi, 'a capsula');
  } else if (lang === 'zh') {
    out = out.replace(/泳池形/g, '跑道椭圆形');
  }
  return out;
}

function sanitizeFields(lang: TargetLang, f: Fields): Fields {
  const out: Fields = {};
  if (f.title) out.title = sanitizeText(lang, f.title);
  if (f.description && !PROMPT_LEAK_RE.test(f.description)) {
    out.description = sanitizeText(lang, f.description);
  }
  if (f.details) out.details = sanitizeText(lang, f.details);
  if (Array.isArray(f.specifications)) {
    out.specifications = f.specifications.map((s) => ({
      key: sanitizeText(lang, String(s.key ?? '')),
      value: sanitizeText(lang, String(s.value ?? '')),
    }));
  }
  return out;
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function stripCodeFence(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

async function translateProduct(
  ai: GoogleGenAI,
  source: Fields
): Promise<Record<TargetLang, Fields>> {
  const prompt = `You are a professional B2B product-copy translator for an LED bathroom & architectural mirror manufacturer (brand: BOLEN / Jiaxing Chengtai Mirror Co., Ltd.).

Translate the JSON below from English into these languages: ${TARGET_LANGS.map((l) => `${l} (${LANG_NAMES[l]})`).join(', ')}.

Rules:
- Translate "title", "description", "details", and every specification "key" and "value" completely and naturally. Never leave English prose or English specification words untranslated (especially in zh / Simplified Chinese, translate words like "or Custom" -> "或定制", "and so on" -> "等", "PE Bag+Foam+Carton" -> "PE袋+泡沫+纸箱").
- Never output authoring instructions, prompt rubrics, or meta commentary — output only translated product copy.
- Mandatory B2B mirror glossary:
  * French (fr): "full-length mirror" = "miroir en pied" (NEVER "de plain-pied"); "vanity mirror" = "miroir de salle de bains" / "miroir de meuble-lavabo" (NEVER "vanity").
  * Spanish (es): "vanity mirror" = "espejo de tocador" (NEVER "vanidad"); "anti-fog" = "antivaho" (NEVER "antiniebla"); "capsule / pill / pool shape" = "tipo cápsula" (NEVER "piscina").
  * German (de): "defogger / demister / anti-fog" = "Antibeschlagfunktion" or "Spiegelheizung" (NEVER "Entnebler"); "capsule / pill / pool shape" = "kapselförmig" (NEVER "beckenförmig").
  * Italian (it): "capsule / pill / pool shape" = "a capsula" (NEVER "piscina").
  * Simplified Chinese (zh): "capsule / pill / pool shape" = "胶囊形" or "跑道椭圆形" (NEVER "泳池形").
- Keep UNCHANGED: brand names (BOLEN, Chengtai), model/SKU codes, measurements and numbers (e.g. "60*100CM", "5mm", "3000K–6500K"), and certification names (CE, RoHS, IP44, IP54, IP66, UKCA, UL, SAA, CB, EN 1036, ISO 9001).
- Preserve valid CommonMark Markdown in "details" (never leave spaces inside **bold** markers).
- In "details", keep every photo line ![description](url) where it is, with its url unchanged; translate only the description concisely (<= 90 chars), keeping any backslash escapes.
- Keep the same JSON structure. "specifications" must stay an array of {"key","value"} in the same order.
- Return ONLY a JSON object shaped exactly like:
  { ${TARGET_LANGS.map((l) => `"${l}": { ...translated fields... }`).join(', ')} }
  Each language object must contain only the fields present in the source.

Source JSON:
${JSON.stringify(source)}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature: 0.2 },
  });

  const text = stripCodeFence(response.text ?? '');
  const parsed = JSON.parse(text) as Record<string, Fields>;
  const out = {} as Record<TargetLang, Fields>;
  for (const lang of TARGET_LANGS) {
    out[lang] = sanitizeFields(lang, parsed[lang] || {});
  }
  return out;
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.error('[translate-products] GEMINI_API_KEY (or VITE_GEMINI_API_KEY) is not set. Add it to .env and re-run.');
    process.exit(1);
  }
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) {
    console.error('[translate-products] Supabase credentials not set.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('products')
    .select('id, title, description, details, specifications')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[translate-products] Failed to fetch products:', error.message);
    process.exit(1);
  }
  const products = (data || []) as ProductRow[];
  console.log(`[translate-products] ${products.length} active products from Supabase.`);

  await mkdir(OUT_DIR, { recursive: true });

  // Load existing output + source hashes so unchanged products are reused.
  const existing = {} as Record<TargetLang, Record<string, Fields>>;
  for (const lang of TARGET_LANGS) {
    existing[lang] = await readJson<Record<string, Fields>>(resolve(OUT_DIR, `products.${lang}.json`), {});
  }
  const prevHashes = await readJson<Record<string, string>>(resolve(OUT_DIR, '.source.json'), {});
  const nextHashes: Record<string, string> = {};

  const ai = new GoogleGenAI({ apiKey });
  const result = {} as Record<TargetLang, Record<string, Fields>>;
  for (const lang of TARGET_LANGS) result[lang] = {};

  let translated = 0;
  let reused = 0;
  for (const product of products) {
    if (!product.id || !product.title) continue;
    const source = sourceFields(product);
    const hash = hashFields(source);
    nextHashes[product.id] = hash;

    const unchanged = prevHashes[product.id] === hash;
    const haveAll = TARGET_LANGS.every(
      (l) => existing[l][product.id] && (!source.details || existing[l][product.id]?.details)
    );
    if (unchanged && haveAll) {
      for (const lang of TARGET_LANGS) {
        result[lang][product.id] = sanitizeFields(lang, existing[lang][product.id]);
      }
      reused++;
      continue;
    }

    try {
      const perLang = await translateProduct(ai, source);
      for (const lang of TARGET_LANGS) result[lang][product.id] = perLang[lang];
      translated++;
      console.log(`[translate-products] ✓ ${product.title.slice(0, 60)}`);
    } catch (err) {
      console.warn(`[translate-products] ✗ ${product.id} (${product.title.slice(0, 40)}): ${(err as Error).message}`);
      for (const lang of TARGET_LANGS) {
        if (existing[lang][product.id]) {
          result[lang][product.id] = sanitizeFields(lang, existing[lang][product.id]);
        }
      }
      delete nextHashes[product.id];
    }
  }

  for (const lang of TARGET_LANGS) {
    await writeFile(resolve(OUT_DIR, `products.${lang}.json`), JSON.stringify(result[lang], null, 2) + '\n', 'utf-8');
  }
  await writeFile(resolve(OUT_DIR, '.source.json'), JSON.stringify(nextHashes, null, 2) + '\n', 'utf-8');

  console.log(`[translate-products] Done — ${translated} translated, ${reused} reused. Wrote ${TARGET_LANGS.length} files to public/i18n/.`);
}

main().catch((err) => {
  console.error('[translate-products] Fatal:', err);
  process.exit(1);
});
