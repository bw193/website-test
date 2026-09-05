// Per-language overlays for product copy (title/description/details/specs).
// Generated at build time by scripts/translate-products.ts into
// public/i18n/products.<lang>.json and served as static assets.
//
// These overlays replace display fields only. Localized URL slugs are compiled
// separately into productRoutes.json so links do not wait for a translation
// fetch. Chinese display copy retains its existing English fallback.

import { useEffect, useState } from 'react';

export interface ProductFields {
  title?: string;
  description?: string;
  details?: string;
  specifications?: Array<{ key: string; value: string }> | Record<string, string>;
}

const TRANSLATED_LANGS = new Set(['es', 'fr', 'de', 'it']);

type LangMap = Record<string, ProductFields>;
const cache: Record<string, LangMap> = {};
const fullyLoaded: Record<string, boolean> = {};
const inflight: Record<string, Promise<LangMap> | undefined> = {};

export function isTranslatedLang(lang: string | undefined): boolean {
  return !!lang && TRANSLATED_LANGS.has(lang);
}

// Seed the cache from a prerender data island so prerendered pages overlay
// synchronously on first render — no fetch, no English→translated flash.
// `full` marks that every product for this language is present (home/catalog
// islands), so the runtime can skip the network fetch entirely.
export function primeProductTranslations(
  lang: string | undefined,
  entries: LangMap | undefined,
  full = false
): void {
  if (!isTranslatedLang(lang) || !entries) return;
  cache[lang!] = { ...(cache[lang!] || {}), ...entries };
  if (full) fullyLoaded[lang!] = true;
}

export async function loadProductTranslations(lang: string): Promise<LangMap> {
  if (!isTranslatedLang(lang)) return {};
  if (fullyLoaded[lang]) return cache[lang] || {};
  if (inflight[lang]) return inflight[lang]!;
  const promise = (async () => {
    try {
      const res = await fetch(`/i18n/products.${lang}.json`, { cache: 'force-cache' });
      if (res.ok) {
        const json = (await res.json()) as LangMap;
        cache[lang] = { ...(cache[lang] || {}), ...json };
        fullyLoaded[lang] = true;
      }
    } catch {
      // Keep whatever was primed from the island; fall back to English copy.
    }
    return cache[lang] || {};
  })();
  inflight[lang] = promise;
  return promise;
}

// Overlay translated fields onto an (English) product. Returns the product
// unchanged when there is no translation, so callers can render it directly.
export function overlayProduct<T extends ProductFields & { id?: string }>(
  product: T,
  lang: string
): T {
  if (!product?.id || !isTranslatedLang(lang)) return product;
  const tr = cache[lang]?.[product.id];
  if (!tr) return product;
  return {
    ...product,
    title: tr.title || product.title,
    description: tr.description || product.description,
    details: tr.details || product.details,
    specifications: tr.specifications ?? product.specifications,
  };
}

// Ensures the language map is loaded, then returns an overlay function that
// re-applies once the data is available (the load triggers a re-render).
export function useProductTranslator(
  lang: string
): <T extends ProductFields & { id?: string }>(product: T) => T {
  const [, force] = useState(0);
  useEffect(() => {
    let active = true;
    if (isTranslatedLang(lang) && !fullyLoaded[lang]) {
      loadProductTranslations(lang).then(() => active && force((n) => n + 1));
    }
    return () => {
      active = false;
    };
  }, [lang]);
  return (product) => overlayProduct(product, lang);
}
