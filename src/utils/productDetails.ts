import { Marked, type Token, type Tokens } from 'marked';

const markdown = new Marked({ async: false, gfm: true });
const LEGACY_PREFIX = /^ {0,3}(?:- ?)?(\*{2,3})(?!\*)[ \t]*(.*)$/;

function legacyLines(paragraph: Tokens.Paragraph): Set<number> {
  // Only repair markers that Markdown treats as literal text. Valid bold text,
  // including emphasis spanning several lines, must keep its original meaning.
  let offset = 0;
  const textRanges = paragraph.tokens.flatMap((token) => {
    const start = offset;
    offset += token.raw.length;
    return token.type === 'text' ? [{ start, end: offset }] : [];
  });
  const broken = new Set<number>();
  offset = 0;
  paragraph.text.split('\n').forEach((line, index) => {
    const match = line.match(LEGACY_PREFIX);
    const start = offset + line.indexOf('*');
    if (match && textRanges.some((range) => start >= range.start && start + match[1].length <= range.end)) {
      broken.add(index);
    }
    offset += line.length + 1;
  });
  return broken;
}

function looksLikeTitle(text: string): boolean {
  return text.length > 0 && text.length <= 140
    && !/[.!?。！？:：]$/.test(text)
    && !/[*_#><\[\]`\\]/.test(text);
}

function lastLeaf(tokens: Token[]): Token | undefined {
  const token = tokens.filter((item) => item.type !== 'space').at(-1);
  if (token?.type === 'list') return lastLeaf((token as Tokens.List).items.at(-1)?.tokens || []);
  if (token && 'tokens' in token && Array.isArray(token.tokens)) return lastLeaf(token.tokens);
  return token;
}

/**
 * Repair legacy product copy with unclosed or incorrectly spaced ** labels.
 * Both the storefront and prerenderer use this, without rewriting stored copy.
 * Valid Markdown blocks (lists, code, tables, HTML) are preserved.
 */
export function normalizeProductDetails(source: string | null | undefined): string {
  if (!source) return '';
  const tokens = markdown.lexer(source);
  const last = lastLeaf(tokens);
  const trailingMarker = last?.type === 'text' && /[.!?。！？]\*{2,3}$/.test(last.raw.trimEnd());
  const trimTrailingMarker = (value: string) => trailingMarker
    ? value.replace(/([.!?。！？])\*{2,3}(\s*)$/, '$1$2')
    : value;
  const paragraphs = tokens.filter((token): token is Tokens.Paragraph => token.type === 'paragraph');
  const brokenByParagraph = new Map(paragraphs.map((paragraph) => [paragraph, legacyLines(paragraph)]));
  if (![...brokenByParagraph.values()].some((lines) => lines.size > 0)) return trimTrailingMarker(source);

  return trimTrailingMarker(tokens.map((token) => {
    if (token.type !== 'paragraph') return token.raw;
    const paragraph = token as Tokens.Paragraph;
    const broken = brokenByParagraph.get(paragraph)!;
    const lines = paragraph.text.split('\n');
    const formatted = [...lines];

    lines.forEach((line, index) => {
      const text = line.trim();
      if (!broken.has(index)) {
        // Some of these descriptions omit the marker on their first feature.
        if (index === 0 && lines.length > 1 && looksLikeTitle(text)
          && /[–—]/.test(text) && /\p{Lu}/u.test(text) && !/\p{Ll}/u.test(text)) {
          formatted[index] = `### ${text}\n`;
        }
        return;
      }

      const [, marker, rawContent] = line.match(LEGACY_PREFIX)!;
      const content = rawContent.trim();
      if (!content) {
        const next = lines[index + 1]?.trim();
        if (next?.endsWith(marker) && !next.slice(0, -marker.length).includes('*')) {
          formatted[index] = `\n\n${marker}${next.slice(0, -marker.length).trim()}${marker}\n`;
          formatted[index + 1] = '';
        }
        return;
      }
      const closing = content.indexOf(marker);
      if (closing !== -1) {
        // Spaces (including nonbreaking spaces copied from an editor) inside
        // the closing marker prevent Markdown from recognizing a bold label.
        const title = content.slice(0, closing).trim();
        const body = content.slice(closing + marker.length).trimStart();
        const bullet = /^ {0,3}-/.test(line) ? '- ' : '';
        const separator = body ? (/^[:：,.;!?]/.test(body) ? '' : ' ') : '  ';
        formatted[index] = `${bullet}${marker}${title}${marker}${separator}${body}`;
        return;
      }
      const label = content.match(/^([\p{L}][^:：]{0,59})[:：]\s*(\S.*)$/u);
      if (label) {
        formatted[index] = `\n\n**${label[1]}:** ${label[2]}\n\n`;
      } else if (looksLikeTitle(content)) {
        formatted[index] = `\n\n### ${content}\n`;
      } else {
        // A few entries put the stray marker on the sentence below its title.
        const previous = lines[index - 1]?.trim();
        if (index === 1 && previous && looksLikeTitle(previous)) {
          formatted[index - 1] = `### ${previous}\n`;
        }
        formatted[index] = `\n${content}`;
      }
    });

    // Keep the raw block's trailing newline so an immediately following heading
    // or list cannot be joined onto the last sentence during reconstruction.
    return paragraph.raw.replace(paragraph.text, () => formatted.join('\n'));
  }).join(''));
}
