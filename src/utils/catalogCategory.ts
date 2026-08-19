import { toSlug } from './slug';

export const DEFAULT_PRODUCT_CATEGORIES = [
  'New Arrival',
  'Hot Sale',
  'Led Lighted Mirror',
  'Bathroom Mirror without led',
  'Full Length Dressing Mirror',
  'Irregular Mirror',
] as const;

export const CATALOG_CATEGORY_PREFIX = '/products/category';

const SITE_URL = 'https://bolenmirror.com';

export function toCategorySlug(name: string): string {
  return toSlug(name || '');
}

export function catalogCategoryPath(name: string): string {
  return `${CATALOG_CATEGORY_PREFIX}/${toCategorySlug(name)}`;
}

export function parseCategoriesSetting(value: unknown): string[] {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

export function uniqueCategorySlugs(
  categories: readonly string[]
): Array<{ name: string; slug: string }> {
  const seen = new Set<string>();
  const out: Array<{ name: string; slug: string }> = [];
  for (const name of categories) {
    const slug = toCategorySlug(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ name, slug });
  }
  return out;
}

export function findCategoryBySlug(
  categories: readonly (string | null | undefined)[],
  slug: string | undefined
): string | undefined {
  if (!slug) return undefined;
  const match = categories.find((name) => !!name && toCategorySlug(name) === slug);
  return match || undefined;
}

export function productMatchesCategory(
  productCategory: string | undefined | null,
  categoryName: string
): boolean {
  if (!productCategory) return false;
  const slugA = toCategorySlug(productCategory);
  const slugB = toCategorySlug(categoryName);
  if (slugA && slugA === slugB) return true;
  const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return compact(productCategory) === compact(categoryName);
}

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function categoryPublicPages(
  categories: readonly string[],
  lastmod: string
): Array<{ path: string; changefreq: string; priority: string; lastmod: string }> {
  return uniqueCategorySlugs(categories).map(({ slug }) => ({
    path: `${CATALOG_CATEGORY_PREFIX}/${slug}`,
    changefreq: 'weekly',
    priority: '0.85',
    lastmod,
  }));
}

/** Shared CollectionPage + breadcrumb JSON-LD for catalog category URLs. */
export function buildCatalogCategorySchema(opts: {
  lang: string;
  slug: string;
  name: string;
  description: string;
  homeLabel: string;
  catalogLabel: string;
}): Record<string, unknown>[] {
  const url = `${SITE_URL}/${opts.lang}${CATALOG_CATEGORY_PREFIX}/${opts.slug}/`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: opts.name,
      description: opts.description,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: 'BOLEN Mirror',
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: opts.homeLabel, item: `${SITE_URL}/${opts.lang}/` },
        { '@type': 'ListItem', position: 2, name: opts.catalogLabel, item: `${SITE_URL}/${opts.lang}/products/` },
        { '@type': 'ListItem', position: 3, name: opts.name, item: url },
      ],
    },
  ];
}
