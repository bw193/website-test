export type SimilaritySpec =
  | Array<{ key?: string | null; value?: string | null }>
  | Record<string, string>
  | null
  | undefined;

export interface SimilarityProduct {
  id: string;
  title: string;
  category?: string | null;
  description?: string | null;
  images?: unknown;
  specifications?: SimilaritySpec;
}

export type SimilarityReason = 'title' | 'specs' | 'category';

export interface SimilarityScore {
  score: number;
  reasons: SimilarityReason[];
}

export interface SimilarMatch {
  product: SimilarityProduct;
  score: number;
  reasons: SimilarityReason[];
}

export interface SimilarCluster {
  products: SimilarityProduct[];
  maxScore: number;
  reasons: SimilarityReason[];
}

export const SIMILARITY_THRESHOLDS = [0.6, 0.7, 0.8, 0.9] as const;
export const DEFAULT_SIMILARITY_THRESHOLD = 0.7;
export const SAVE_WARN_SCORE = 0.82;
export const LIVE_MATCH_MIN_SCORE = 0.55;

const TITLE_STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'for',
  'with',
  'to',
  'in',
  'on',
  'by',
  'from',
  'at',
  'is',
  'are',
  'our',
  'your',
  'this',
  'that',
  'its',
  'into',
  'over',
  'under',
  'per',
  'pcs',
  'pc',
  'ctn',
]);

const GENERIC_SPEC_KEY_RE =
  /certificat|packag|warranty|garantie|moq|oem|odm|lead\s*time|delivery|custom|hs\s*code|origin|carton|qty|quantity/;

function compactText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
}

export function tokenize(value: string): string[] {
  const normalized = value
    .toLowerCase()
    .replace(/[×*]/g, 'x')
    .replace(/(\d)\s*x\s*(\d)/g, '$1x$2')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ');
  const tokens: string[] = [];
  for (const raw of normalized.split(/\s+/)) {
    if (!raw || TITLE_STOPWORDS.has(raw) || raw.length === 1) continue;
    tokens.push(raw);
    const dim = raw.match(/^(\d+)x(\d+)(?:x(\d+))?(?:cm|mm|in|inch)?$/);
    if (dim) {
      tokens.push(dim[1], dim[2]);
      if (dim[3]) tokens.push(dim[3]);
    }
  }
  return tokens;
}

function tokenSet(value: string): Set<string> {
  return new Set(tokenize(value));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const token of a) {
    if (b.has(token)) inter += 1;
  }
  return inter / (a.size + b.size - inter);
}

function bigrams(value: string): string[] {
  const compact = compactText(value);
  if (compact.length < 2) return compact ? [compact] : [];
  const grams: string[] = [];
  for (let i = 0; i < compact.length - 1; i += 1) {
    grams.push(compact.slice(i, i + 2));
  }
  return grams;
}

function dice(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const gram of a) counts.set(gram, (counts.get(gram) || 0) + 1);
  let overlap = 0;
  for (const gram of b) {
    const remaining = counts.get(gram) || 0;
    if (remaining > 0) {
      overlap += 1;
      counts.set(gram, remaining - 1);
    }
  }
  return (2 * overlap) / (a.length + b.length);
}

function specEntries(specs: SimilaritySpec): Array<[string, string]> {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs
      .filter((row) => row && String(row.key || '').trim() && String(row.value || '').trim())
      .map((row) => [String(row.key).trim(), String(row.value).trim()]);
  }
  return Object.entries(specs).filter(([key, value]) => key.trim() && String(value || '').trim());
}

function specTokenSet(specs: SimilaritySpec): Set<string> {
  const tokens = new Set<string>();
  for (const [key, value] of specEntries(specs)) {
    if (GENERIC_SPEC_KEY_RE.test(key.toLowerCase())) continue;
    const keyTokens = tokenize(key);
    const valueTokens = tokenize(value);
    for (const token of valueTokens) tokens.add(token);
    const keyPrefix = keyTokens[0];
    if (keyPrefix) {
      for (const token of valueTokens) {
        if (/\d/.test(token) || token.length > 3) tokens.add(`${keyPrefix}:${token}`);
      }
    }
  }
  return tokens;
}

function uniqueReasons(reasons: SimilarityReason[]): SimilarityReason[] {
  return (['title', 'specs', 'category'] as const).filter((reason) => reasons.includes(reason));
}

export function scoreSimilarity(a: SimilarityProduct, b: SimilarityProduct): SimilarityScore {
  const titleA = (a.title || '').trim();
  const titleB = (b.title || '').trim();
  if (!titleA || !titleB) return { score: 0, reasons: [] };

  if (compactText(titleA) === compactText(titleB)) {
    const reasons: SimilarityReason[] = ['title'];
    if ((a.category || '') && a.category === b.category) reasons.push('category');
    return { score: 1, reasons };
  }

  const titleDice = dice(bigrams(titleA), bigrams(titleB));
  const titleJaccard = jaccard(tokenSet(titleA), tokenSet(titleB));
  const specJaccard = jaccard(specTokenSet(a.specifications), specTokenSet(b.specifications));
  const sameCategory = Boolean(a.category && b.category && a.category === b.category);

  let score = titleDice * 0.45 + titleJaccard * 0.3 + specJaccard * 0.2 + (sameCategory ? 0.05 : 0);
  if (titleDice >= 0.92) score = Math.max(score, 0.88);
  score = Math.min(1, Math.max(0, score));

  const reasons: SimilarityReason[] = [];
  if (titleDice >= 0.5 || titleJaccard >= 0.4) reasons.push('title');
  if (specJaccard >= 0.3) reasons.push('specs');
  if (sameCategory) reasons.push('category');

  return { score, reasons: uniqueReasons(reasons) };
}

export function findSimilarTo(
  query: SimilarityProduct,
  catalog: SimilarityProduct[],
  options: { excludeId?: string; minScore?: number; limit?: number } = {}
): SimilarMatch[] {
  const minScore = options.minScore ?? LIVE_MATCH_MIN_SCORE;
  const limit = options.limit ?? 5;
  if (!query.title?.trim()) return [];

  const matches: SimilarMatch[] = [];
  for (const product of catalog) {
    if (!product?.id || product.id === options.excludeId || product.id === query.id) continue;
    const result = scoreSimilarity(query, product);
    if (result.score >= minScore) {
      matches.push({ product, score: result.score, reasons: result.reasons });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
}

export function clusterSimilarProducts(
  catalog: SimilarityProduct[],
  minScore = DEFAULT_SIMILARITY_THRESHOLD
): SimilarCluster[] {
  const products = catalog.filter((product) => product?.id && product.title?.trim());
  const n = products.length;
  if (n < 2) return [];

  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (index: number): number => {
    if (parent[index] !== index) parent[index] = find(parent[index]);
    return parent[index];
  };
  const unite = (a: number, b: number) => {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) parent[pa] = pb;
  };

  const pairMeta: Array<{ i: number; j: number; score: number; reasons: SimilarityReason[] }> = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const result = scoreSimilarity(products[i], products[j]);
      if (result.score >= minScore) {
        unite(i, j);
        pairMeta.push({ i, j, score: result.score, reasons: result.reasons });
      }
    }
  }

  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i += 1) {
    const root = find(i);
    const members = groups.get(root);
    if (members) members.push(i);
    else groups.set(root, [i]);
  }

  const clusters: SimilarCluster[] = [];
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const memberSet = new Set(members);
    const pairs = pairMeta.filter((pair) => memberSet.has(pair.i) && memberSet.has(pair.j));
    const maxScore = pairs.reduce((max, pair) => Math.max(max, pair.score), 0);
    const reasons = uniqueReasons(pairs.flatMap((pair) => pair.reasons));
    clusters.push({
      products: members.map((index) => products[index]),
      maxScore,
      reasons,
    });
  }

  clusters.sort((a, b) => b.maxScore - a.maxScore || b.products.length - a.products.length);
  return clusters;
}

export function similarityLevel(score: number): 'duplicate' | 'similar' | 'related' {
  if (score >= 0.9) return 'duplicate';
  if (score >= 0.75) return 'similar';
  return 'related';
}

export function similarityPercent(score: number): number {
  return Math.round(score * 100);
}
