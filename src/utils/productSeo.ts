/**
 * Shared product SEO helpers.
 *
 * Imported by BOTH src/pages/ProductDetail.tsx (runtime, via react-helmet-async)
 * and scripts/prerender-static.ts (build time). These two used to hold separate
 * copies of the same logic, which meant Helmet could overwrite a prerendered
 * <title>/<meta description> with a differently-derived value on mount.
 *
 * Localized strings are passed IN rather than resolved here: the runtime gets
 * them from i18next, the prerenderer from its own COPY table.
 */

export interface ProductSeoFields {
  title: string;
  description?: string;
  details?: string;
  specifications?: unknown;
}

/**
 * Flattens markdown to a single line of prose, for <meta> content and JSON-LD.
 * Strips fences, images, list bullets and heading markers, and unwraps links to
 * their label. Not a parser — product `details` is prose with light markdown,
 * and this only needs to be good enough for a ~160-character summary.
 */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Flattens any run of whitespace (including newlines) to single spaces. */
export function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Truncates at a word boundary, appending an ellipsis only if it actually cut. */
export function truncateAtWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  // CJK has no spaces — fall back to a hard cut rather than returning nothing.
  const base = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.\-—]+$/, '')}…`;
}

/**
 * Product `specifications` arrives from Supabase either as an array of
 * {key,value} or as a plain object. Normalizes both to entry pairs, dropping
 * blanks so an empty spec table is never rendered.
 *
 * Keys are de-duplicated case-insensitively, first occurrence wins: the live
 * data has rows like Installation/"Wall-mounted" and Installation/"Wall-Mounted"
 * on the same product, which would otherwise emit a duplicate <dt> and a
 * duplicate schema.org additionalProperty.
 */
export function normalizeSpecs(specs: unknown): Array<{ key: string; value: string }> {
  if (!specs) return [];
  const raw: Array<{ key: unknown; value: unknown }> = Array.isArray(specs)
    ? (specs as Array<{ key: unknown; value: unknown }>)
    : Object.entries(specs as Record<string, unknown>).map(([key, value]) => ({ key, value }));
  const seen = new Set<string>();
  const out: Array<{ key: string; value: string }> = [];
  for (const e of raw) {
    const key = String(e?.key ?? '').trim();
    const value = String(e?.value ?? '').trim();
    if (!key || !value) continue;
    const dedupeKey = key.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({ key, value });
  }
  return out;
}

/**
 * Meta description for a product.
 *
 * Source preference: `details` (real marketing prose, 400-2400 chars, and
 * translated per-language) > `description` > localized boilerplate. The
 * `description` column in Supabase currently holds bare model codes
 * ("CTL609", 6-43 chars), which is why the >=30 guard exists and why `details`
 * has to be tried first — otherwise every product falls through to the template
 * and all product pages share one meta description.
 *
 * @param fallbackTemplate Localized sentence containing a `{title}` token.
 */
export function buildProductDescription(
  product: ProductSeoFields,
  fallbackTemplate: string
): string {
  const details = product.details ? markdownToPlainText(product.details) : '';
  if (details.length >= 50) {
    // Lead with the product name. Several products share identical `details`
    // copy in Supabase (12 of 71 open with the same feature list), so a
    // details-only description would still be duplicated across pages; titles
    // are unique per slug, which makes every description unique.
    const lead = `${product.title} — `;
    return lead + truncateAtWord(details, Math.max(60, 155 - lead.length));
  }
  // collapseWhitespace, not just trim: at least one product's `description`
  // column contains hard line breaks, which would otherwise land raw inside the
  // <meta content="..."> attribute.
  const description = product.description ? collapseWhitespace(product.description) : '';
  if (description.length >= 30) {
    return truncateAtWord(description, 155);
  }
  return fallbackTemplate.replace('{title}', product.title);
}

/**
 * Title for a product page. Google truncates around 60 characters; raw product
 * titles here run to 121, so trim to a word boundary and always leave room for
 * the brand suffix — previously any title over 55 chars got no brand at all and
 * was cut mid-phrase in SERPs.
 *
 * @param suffix Localized brand suffix, e.g. "| BOLEN Mirror".
 */
export function buildProductSeoTitle(title: string, suffix: string): string {
  const clean = collapseWhitespace(title);
  const budget = 60 - suffix.length - 1;
  const trimmed = clean.length > budget ? truncateAtWord(clean, budget) : clean;
  return `${trimmed} ${suffix}`;
}
