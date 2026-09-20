import type { ProductRoute } from '../../src/utils/productRoutes';
import { toProductSlug, toSlug } from '../../src/utils/slug';

export const PRODUCT_ROUTE_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
type TranslatedLanguage = Exclude<(typeof PRODUCT_ROUTE_LANGUAGES)[number], 'en'>;
type UrlTranslations = Partial<Record<TranslatedLanguage, Record<string, { title?: string | null }>>>;

interface Product {
  id: string;
  title: string;
  category?: string | null;
}

/** Match the storefront's English fallback while translations catch up to the catalog. */
export function compileProductRoutes(products: Product[], translations: UrlTranslations) {
  const routes: Record<string, ProductRoute> = {};
  const missingTranslations: Array<{ id: string; title: string; languages: TranslatedLanguage[] }> = [];
  const used = new Map<string, string>();

  for (const product of products) {
    if (!product.title?.trim()) throw new Error(`Missing en URL title for ${product.id}.`);
    const englishSlug = toSlug(product.title);
    if (!englishSlug) throw new Error(`Empty en slug for ${product.id}.`);
    const category = toSlug(product.category || '') || 'uncategorized';
    if (category === 'category') throw new Error(`Reserved product category: ${product.id}`);
    const missing: TranslatedLanguage[] = [];
    const slugs = {} as ProductRoute['slugs'];

    for (const lang of PRODUCT_ROUTE_LANGUAGES) {
      let slug = englishSlug;
      if (lang !== 'en') {
        const title = translations[lang]?.[product.id]?.title?.trim();
        if (title) slug = toProductSlug(title, lang);
        else missing.push(lang);
      }
      if (!slug) throw new Error(`Empty ${lang} slug for ${product.id}.`);
      const key = `${lang}/${category}/${slug}`;
      if (used.has(key)) throw new Error(`Duplicate product URL ${key}: ${used.get(key)} and ${product.id}.`);
      used.set(key, product.id);
      slugs[lang] = slug;
    }

    routes[product.id] = { category, slugs };
    if (missing.length) missingTranslations.push({ id: product.id, title: product.title, languages: missing });
  }

  return { routes, missingTranslations };
}
