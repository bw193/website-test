export const INSIGHTS_PATH = '/insights';
export const LEGACY_BLOG_PATH = '/blog';

export function insightDetailPath(slug: string): string {
  return `${INSIGHTS_PATH}/${slug}`;
}
