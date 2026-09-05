// Keep the original slug algorithm for category paths and legacy product URLs.
// Localized product detail routes use toProductSlug and the product route map.

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** Readable localized slugs; preserve CJK and transliterate Latin accents. */
export function toProductSlug(title: string, lang: string): string {
  let value = title.toLowerCase();
  if (lang === 'de') {
    value = value.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  }
  return value.normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

const TRAILING_UUID =
  /^(?:(.*)-)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function parseProductParam(param: string | undefined): {
  slug: string;
  legacyId?: string;
} {
  if (!param) return { slug: '' };
  const match = param.match(TRAILING_UUID);
  if (match) return { slug: match[1] ?? '', legacyId: match[2] };
  return { slug: param };
}
