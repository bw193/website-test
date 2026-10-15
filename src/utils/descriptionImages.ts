import { Marked, type MarkedExtension, type Token, type Tokens } from 'marked';
import { toMediaPath } from './media';
import { imageSrcSet, optimizeImage } from './optimizeImage';

/**
 * Photos inside a product's long-form `details` (Markdown).
 *
 * Staff add them with Insert image in the admin product form, which uploads the
 * file and writes it on its own line as
 *
 *   ![<description>](<public URL of products/<time>-<id>-<width>x<height>.<ext>>)
 *
 * The description is both the photo's alt text and the caption printed under
 * it on the product page, so it is visible page text. That is what lets a
 * photo shared by several products (a layer diagram of the mirror glass, say)
 * add something specific to each page instead of more duplicate content. Hence
 * the rules: every photo needs a description long enough to say something, and
 * no two photos, on this product or any other, may share one. The admin form
 * checks them as staff type and again before saving.
 *
 * Shared by the admin form, the product page and scripts/prerender-static.ts.
 */

export const MIN_DESCRIPTION_WORDS = 6;
export const MAX_DESCRIPTION_CHARS = 300;

/** A description already used on a photo in another product's details. */
export type UsedDescription = { productId: string; productTitle: string; description: string };

export type DescriptionIssue =
  | { kind: 'missing' | 'tooShort' | 'tooLong' | 'repeatedHere' }
  | { kind: 'usedElsewhere'; productTitle: string };

/** A problem with one photo; `photo` counts from 1 in page order. */
export type DescriptionImageProblem = DescriptionIssue & { photo: number };

export interface DescriptionImage {
  src: string;
  /** The alt text as plain text: escapes resolved, inline formatting dropped. */
  description: string;
  /** The photo's Markdown and where it sits in the source; `start` is -1 if it can't be located. */
  raw: string;
  start: number;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Case, punctuation and spacing don't make a description a new one. */
function descriptionKey(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/**
 * Checks one photo's description against the rules. `others` are the other
 * photos' descriptions in the same details, `usedElsewhere` the ones on other
 * products' photos.
 */
export function checkDescription(
  text: string,
  context: { others?: readonly string[]; usedElsewhere?: readonly UsedDescription[] } = {},
): DescriptionIssue | null {
  const trimmed = text.trim();
  if (!trimmed) return { kind: 'missing' };
  if (trimmed.length > MAX_DESCRIPTION_CHARS) return { kind: 'tooLong' };
  if (countWords(trimmed) < MIN_DESCRIPTION_WORDS) return { kind: 'tooShort' };
  const key = descriptionKey(trimmed);
  if (context.others?.some((other) => descriptionKey(other) === key)) return { kind: 'repeatedHere' };
  const used = context.usedElsewhere?.find((u) => descriptionKey(u.description) === key);
  if (used) return { kind: 'usedElsewhere', productTitle: used.productTitle };
  return null;
}

const lexer = new Marked({ async: false, gfm: true });

const NAMED_ENTITIES: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    const lower = name.toLowerCase();
    if (lower.startsWith('#')) {
      const code = lower[1] === 'x' ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    }
    return NAMED_ENTITIES[lower] ?? entity;
  });
}

/** Inline tokens as plain text. Raw HTML is dropped, as the product page drops it. */
function inlineText(tokens: readonly Token[]): string {
  let out = '';
  for (const token of tokens) {
    if (token.type === 'html') continue;
    if (token.type === 'br') out += ' ';
    else if ('tokens' in token && token.tokens?.length) out += inlineText(token.tokens);
    else if (token.type === 'text') out += decodeEntities(token.text);
    else if ('text' in token && typeof token.text === 'string') out += token.text;
  }
  return out;
}

function imageDescription(token: Tokens.Image): string {
  const text = token.tokens ? inlineText(token.tokens) : decodeEntities(token.text);
  return text.replace(/\s+/g, ' ').trim();
}

/** Every photo in a product's details, in page order. */
export function extractDescriptionImages(markdown: string | null | undefined): DescriptionImage[] {
  if (!markdown) return [];
  const images: Tokens.Image[] = [];
  lexer.walkTokens(lexer.lexer(markdown), (token) => {
    if (token.type === 'image') images.push(token as Tokens.Image);
  });
  // Tokens come in document order, so each photo's Markdown follows the last.
  let from = 0;
  return images.map((token) => {
    const start = markdown.indexOf(token.raw, from);
    if (start !== -1) from = start + token.raw.length;
    return { src: token.href, description: imageDescription(token), raw: token.raw, start };
  });
}

/** Everything that stops details with photos from being saved; empty when they can be. */
export function findDescriptionImageProblems(
  markdown: string | null | undefined,
  usedElsewhere: readonly UsedDescription[] = [],
): DescriptionImageProblem[] {
  const images = extractDescriptionImages(markdown);
  const problems: DescriptionImageProblem[] = [];
  images.forEach((image, index) => {
    const issue = checkDescription(image.description, {
      others: images.slice(0, index).map((earlier) => earlier.description),
      usedElsewhere,
    });
    if (issue) problems.push({ ...issue, photo: index + 1 });
  });
  return problems;
}

/** Descriptions on the photos of every product except `excludeId`. */
export function collectUsedDescriptions(
  products: ReadonlyArray<{ id: string; title?: string | null; details?: string | null }>,
  excludeId?: string,
): UsedDescription[] {
  return products
    .filter((product) => product.id !== excludeId)
    .flatMap((product) =>
      extractDescriptionImages(product.details).map((image) => ({
        productId: product.id,
        productTitle: product.title || '',
        description: image.description,
      })),
    );
}

/**
 * The Markdown for a photo. The description is one line with Markdown's
 * special characters escaped, so "60*80 cm" keeps its asterisk and a bracket
 * can't end the alt text early.
 */
export function descriptionImageMarkdown(src: string, description: string): string {
  const alt = description.replace(/\s+/g, ' ').trim().replace(/[\\`*_[\]<>&~]/g, '\\$&');
  const url = src.trim().replace(/[\s()<>]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
  return `![${alt}](${url})`;
}

/**
 * Inserts a photo's Markdown at offset `at` as a paragraph of its own. Returns
 * the new text, the offset just after the photo, and the edit itself: `insert`
 * replaces the source from `start` to `end` (spaces around the cursor).
 */
export function insertDescriptionImage(
  markdown: string,
  at: number,
  imageMarkdown: string,
): { text: string; cursor: number; start: number; end: number; insert: string } {
  const before = markdown.slice(0, at).replace(/[ \t]+$/, '');
  const after = markdown.slice(at).replace(/^[ \t]+/, '');
  const lead = before === '' ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const trail = after === '' ? '\n' : after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
  const insert = `${lead}${imageMarkdown}${trail}`;
  return {
    text: `${before}${insert}${after}`,
    cursor: before.length + lead.length + imageMarkdown.length,
    start: before.length,
    end: markdown.length - after.length,
    insert,
  };
}

/** Removes a photo's Markdown, closing up the blank lines it leaves behind. */
export function removeDescriptionImage(markdown: string, image: Pick<DescriptionImage, 'raw' | 'start'>): string {
  if (image.start < 0 || markdown.slice(image.start, image.start + image.raw.length) !== image.raw) return markdown;
  const before = markdown.slice(0, image.start).replace(/[ \t]+$/, '');
  const after = markdown.slice(image.start + image.raw.length).replace(/^[ \t]+/, '');
  if (!before.trim()) return after.replace(/^\n+/, '');
  if (!after.trim()) return before.replace(/\n+$/, '\n');
  const breaks = Math.min(2, (before.match(/\n*$/)?.[0].length ?? 0) + (after.match(/^\n*/)?.[0].length ?? 0));
  return `${before.replace(/\n+$/, '')}${'\n'.repeat(Math.max(breaks, 1))}${after.replace(/^\n+/, '')}`;
}

/** Uploads are named `<time>-<id>-<width>x<height>.<ext>`, which gives the page their size. */
export function descriptionImageSize(src: string): { width: number; height: number } | null {
  const match = src.split(/[?#]/)[0].match(/-(\d{1,5})x(\d{1,5})\.(?:jpe?g|png|webp)$/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? { width, height } : null;
}

export function descriptionImageFileName(size: { width: number; height: number }, extension: string): string {
  const id = Math.random().toString(36).slice(2, 9);
  return `${Date.now()}-${id}-${size.width}x${size.height}.${extension}`;
}

const SRCSET_WIDTHS = [480, 800, 1200, 1600];

// The details column fills the page on phones and tablets (inside the 20px and
// 32px gutters). Wider screens put it beside the spec sheet, where it is about
// 420-520px wide up to 1150px and 620px beyond; the rare product with no specs
// gets 820px.
export const DESCRIPTION_IMAGE_SIZES =
  '(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc(100vw - 64px), (max-width: 1150px) 520px, 620px';

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * A photo as the product page shows it: lazy, sized so it doesn't shift the
 * text when it loads, served in several widths through /media/, and captioned
 * with its description. `safeSrc` vets the URL; null drops the photo.
 */
export function descriptionFigureHtml(
  image: { src: string; description: string },
  safeSrc: (url: string) => string | null,
  sizes = DESCRIPTION_IMAGE_SIZES,
): string {
  const original = safeSrc(image.src);
  if (!original) return '';
  const size = descriptionImageSize(original);
  const transformable = /\.(?:jpe?g|png|webp)$/i.test(original.split(/[?#]/)[0]);
  // Never ask for a copy wider than the upload itself; its own width is the
  // largest one on offer.
  const largest = Math.min(size?.width ?? Infinity, SRCSET_WIDTHS[SRCSET_WIDTHS.length - 1]);
  const widths = [...SRCSET_WIDTHS.filter((width) => width < largest), ...(Number.isFinite(largest) ? [largest] : [])];
  const srcset = transformable && widths.length > 1 ? imageSrcSet(original, widths) : '';
  const fallbackWidth = widths.filter((width) => width <= 1200).pop() ?? widths[0];
  const src = (transformable ? optimizeImage(original, { width: fallbackWidth }) : '') || toMediaPath(original);
  const attributes = [
    `src="${escapeHtml(src)}"`,
    srcset ? `srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"` : '',
    size ? `width="${size.width}" height="${size.height}" style="max-width:${size.width}px"` : '',
    `alt="${escapeHtml(image.description)}"`,
    'loading="lazy" decoding="async"',
  ].filter(Boolean);
  const caption = image.description ? `<figcaption>${escapeHtml(image.description)}</figcaption>` : '';
  return `<figure class="description-image"><img ${attributes.join(' ')}>${caption}</figure>\n`;
}

/**
 * Marked extension that renders every photo in a paragraph as a captioned
 * figure (descriptionFigureHtml). Text around a photo in the same paragraph
 * stays in paragraphs of its own, since a figure can't sit inside a <p>.
 */
export function descriptionFiguresExtension(
  safeSrc: (url: string) => string | null,
  sizes?: string,
): MarkedExtension {
  return {
    renderer: {
      paragraph(token) {
        if (!token.tokens?.some((child) => child.type === 'image')) return false;
        let html = '';
        let run: Token[] = [];
        const flush = () => {
          const trimmed = trimRun(run);
          if (trimmed.length) html += `<p>${this.parser.parseInline(trimmed)}</p>\n`;
          run = [];
        };
        for (const child of token.tokens) {
          if (child.type !== 'image') {
            run.push(child);
            continue;
          }
          flush();
          const image = child as Tokens.Image;
          html += descriptionFigureHtml({ src: image.href, description: imageDescription(image) }, safeSrc, sizes);
        }
        flush();
        return html;
      },
    },
  };
}

/** Drops the line breaks and spaces a photo leaves at the edges of the text around it. */
function trimRun(tokens: Token[]): Token[] {
  const run = [...tokens];
  const blank = (token: Token) => token.type === 'br' || (token.type === 'text' && !token.text.trim());
  while (run.length && blank(run[0])) run.shift();
  while (run.length && blank(run[run.length - 1])) run.pop();
  if (!run.length) return run;
  const first = run[0];
  if (first.type === 'text') run[0] = { ...first, raw: first.raw.trimStart(), text: first.text.trimStart() };
  const last = run[run.length - 1];
  if (last.type === 'text') run[run.length - 1] = { ...last, raw: last.raw.trimEnd(), text: last.text.trimEnd() };
  return run;
}
