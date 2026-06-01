export interface ProductContentInput {
  title?: string;
  description?: string;
  category?: string;
}

const MODEL_ONLY_PATTERN =
  /^(?:model\s*(?:no\.?|number)?\s*:?\s*)?[A-Z]{2,}[-\s]?\d+[A-Z0-9\s.-]*$/i;

export function isThinProductDescription(description?: string | null): boolean {
  const trimmed = description?.trim() ?? '';
  if (!trimmed) return true;
  if (trimmed.length < 30) return true;
  return MODEL_ONLY_PATTERN.test(trimmed);
}

export function buildProductDescription(product: ProductContentInput): string {
  const description = product.description?.trim() ?? '';
  if (!isThinProductDescription(description)) return description;

  const title = product.title?.trim() || 'BOLEN mirror product';
  const category = product.category?.trim();
  const categoryClause = category ? ` in the ${category} range` : '';

  return `Premium ${title}${categoryClause} from BOLEN Mirror, built for OEM/ODM projects, wholesale buyers, hotels, bathrooms, and modern residential interiors.`;
}
