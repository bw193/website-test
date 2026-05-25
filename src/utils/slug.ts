// Product URLs are keyed by a slug derived from the title — the products table
// has no slug column. New URLs are clean ("/products/<slug>"). Older URLs also
// carried the row UUID ("/products/<slug>-<uuid>"); parseProductParam still
// pulls that id out so previously indexed / bookmarked links keep resolving.

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
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
