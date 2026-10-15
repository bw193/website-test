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
 * Repair legacy product copy with unclosed or incorrectly spaced ** labels,
 * and lay out details typed as plain lines (see structureTypedLines).
 * Both the storefront and prerenderer use this, without rewriting stored copy.
 * Valid Markdown blocks (code, tables, HTML) are preserved.
 */
export function normalizeProductDetails(source: string | null | undefined): string {
  if (!source) return '';
  return structureTypedLines(repairLegacyMarkers(source));
}

function repairLegacyMarkers(source: string): string {
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

/*
 * Staff type details in a plain textarea, one feature, bullet or label per
 * line. Markdown folds a single line break into a space, so most of them ran
 * together: "1.Item" and "• item" lines became one paragraph, a title merged
 * into the sentence under it, and "*item" showed its asterisk. This pass reads
 * the lines the way they were typed. It only rearranges paragraphs, and lists
 * whose items are a title over a description; headings, other lists, tables
 * and code are left alone, and a line break inside bold text, a link or code
 * is never split.
 */

/** A typed line, or null for the blank line between two paragraphs. */
type Line = string | null;

type TypedLine =
  | { kind: 'numbered'; number: number; text: string }
  | { kind: 'bullet'; dash: boolean; text: string }
  | { kind: 'stars'; lead?: string; label?: string; items: string[] }
  | { kind: 'emphasis'; text: string; label: boolean }
  | { kind: 'section'; text: string }
  | { kind: 'text'; text: string };

const NUMBERED = /^(\d{1,2})[.)、．](?!\d)\s*(?=\S)/;
const GLYPH_BULLET = /^[•●■▪◆◇►▶➤→✓✔√★☆✅❖◎○·▸‣⁃]\s*(?=\S)/u;
const DASH_BULLET = /^[-–](?=[\p{L}\p{N}])/u;
const WHOLE_EMPHASIS = /^(\*{1,3})(?=[^\s*])(.+?)(?<=[^\s*])\1\s*([:：])?$/;
const SECTION = /^([^:：]{1,60}?)\s*[:：]$/;
const PAIR = /^([\p{Lu}\p{N}][^:：]{0,59}?)\s*([:：])(\s*)(\S.*)$/u;
// Sentences may come first when lines were run together: "… finish. Label: *one *two".
const LABEL_BEFORE_STARS = /^(?:(.*?[.!?。！？])\s+)?([^:：*.!?。！？]{1,60}?)\s*[:：]\s*(?=\*[^\s*])/;

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** A paragraph's lines as typed: split at folded and hard line breaks, never inside bold, a link or code. */
function typedLines(tokens: readonly Token[]): string[] {
  const lines = [''];
  for (const token of tokens) {
    if (token.type === 'br') {
      lines.push('');
      continue;
    }
    const [first, ...rest] = token.type === 'text' ? token.raw.split('\n') : [token.raw];
    lines[lines.length - 1] += first;
    lines.push(...rest);
  }
  return lines.map((line) => line.trim()).filter(Boolean);
}

function pair(text: string): { label: string; value: string } | null {
  const match = text.match(PAIR);
  if (!match || countWords(match[1]) > 8 || /[.!?;*。！？；]/.test(match[1])) return null;
  const [, label, colon, space, value] = match;
  // "Size:60cm" is a label too, but "10:30" and "16:9" are not.
  if (colon === ':' && !space && !/^\p{Lu}.*\p{L}$/u.test(label)) return null;
  return { label, value };
}

/** "**Label:**", with an ASCII colon unless the label is CJK. */
function boldLabel(label: string): string {
  return `**${label.trim()}${/[\u3000-\u9fff]/.test(label) ? '：' : ':'}**`;
}

/** "*one *two" or "Label: *one *two": asterisks typed as bullets, none of them closing emphasis. */
function starItems(line: string): { lead?: string; label?: string; items: string[] } | null {
  if (/[^\s*]\*/.test(line.replace(/\d\s*\*\s*\d/g, ''))) return null;
  const labelled = line.match(LABEL_BEFORE_STARS);
  const rest = labelled ? line.slice(labelled[0].length) : line;
  if (!/^\*[^\s*]/.test(rest)) return null;
  const items = rest.split(/(?:^|\s+)\*(?=[^\s*])/).map((item) => item.trim()).filter(Boolean);
  return { lead: labelled?.[1], label: labelled?.[2], items };
}

function classify(line: string): TypedLine {
  const numbered = line.match(NUMBERED);
  if (numbered) return { kind: 'numbered', number: Number(numbered[1]), text: line.slice(numbered[0].length) };
  const glyph = line.match(GLYPH_BULLET);
  if (glyph) return { kind: 'bullet', dash: false, text: line.slice(glyph[0].length) };
  if (DASH_BULLET.test(line)) return { kind: 'bullet', dash: true, text: line.slice(1) };
  const stars = starItems(line);
  if (stars) return { kind: 'stars', ...stars };
  const emphasis = line.match(WHOLE_EMPHASIS);
  if (emphasis && !emphasis[2].includes(emphasis[1])) {
    const inner = emphasis[2].trim();
    return { kind: 'emphasis', text: inner.replace(/\s*[:：]$/, ''), label: Boolean(emphasis[3]) || /[:：]$/.test(inner) };
  }
  const section = line.match(SECTION);
  if (section && countWords(section[1]) <= 8 && !/[.!?*。！？]/.test(section[1])) return { kind: 'section', text: section[1] };
  return { kind: 'text', text: line };
}

/** A line wrapped onto the next one: it starts in lowercase, or the line above stops at a comma. */
function continues(previous: string, line: string): boolean {
  return /^\p{Ll}/u.test(line) || /[,;，；、&(/]$/.test(previous);
}

/** A short line with no closing punctuation, typed as a title over the text below it. */
function looksLikeHeading(text: string): boolean {
  return looksLikeTitle(text) && text.length <= 80 && countWords(text) <= 12 && !/[,;，；]$/.test(text) && !pair(text);
}

function listBlock(items: string[], ordered: boolean, start = 1): string {
  // Bold the labels only when most items have one, so a list reads evenly.
  const labels = items.map(pair);
  const labelled = labels.filter(Boolean).length >= Math.max(2, Math.ceil((items.length * 2) / 3));
  return items
    .map((item, index) => {
      const label = labelled ? labels[index] : null;
      return `${ordered ? `${start + index}.` : '-'} ${label ? `${boldLabel(label.label)} ${label.value}` : item}`;
    })
    .join('\n');
}

/** A line with no closing punctuation: a list item, a title or a label, not a sentence. */
function isFragment(text: string): boolean {
  return text.length <= 80 && !/[.!?:：。！？]$/.test(text);
}

/**
 * Turns typed lines into Markdown blocks. `beforeList` says a list follows
 * the last line, so a short line there is that list's title.
 */
function layOut(lines: Line[], beforeList = false): string[] {
  const kinds = lines.map((line) => (line === null ? null : classify(line)));
  const blocks: string[] = [];
  const isText = (k: number) => kinds[k]?.kind === 'text';
  const inParagraph = (k: number) => k >= 0 && k < lines.length && lines[k] !== null;
  const numberedTitle = (k: number) => {
    const kind = kinds[k];
    return kind?.kind === 'numbered' && inParagraph(k + 1) && isText(k + 1)
      && looksLikeHeading(kind.text) && !continues(kind.text, lines[k + 1]!);
  };
  /** Lines k and k+1 start a run of items: "Label: value" lines or short fragments. */
  const itemsAt = (k: number) => isText(k) && isText(k + 1) && inParagraph(k + 1)
    && !continues(lines[k]!, lines[k + 1]!)
    && ((pair(lines[k]!) && pair(lines[k + 1]!)) || (isFragment(lines[k]!) && isFragment(lines[k + 1]!)));
  /** The text from line k on, with the lines wrapped onto it; and where it ends. */
  const textFrom = (k: number): [string, number] => {
    let text = lines[k]!;
    let end = k + 1;
    while (isText(end) && continues(lines[end - 1]!, lines[end]!)) text += ` ${lines[end++]}`;
    return [text, end];
  };
  /** Items after line k: more of the same marker, across blank lines, with lines typed under an item. */
  const collect = (k: number, sameKind: (k: number) => string[] | null, items: string[]): number => {
    while (k < lines.length) {
      if (lines[k] === null) {
        if (k + 1 < lines.length && sameKind(k + 1)) {
          k++;
          continue;
        }
        break;
      }
      const more = sameKind(k);
      if (more) {
        items.push(...more);
        k++;
      } else if (isText(k) && (continues(lines[k - 1]!, lines[k]!) || (inParagraph(k + 1) && sameKind(k + 1)))) {
        items[items.length - 1] += ` ${lines[k++]}`;
      } else break;
    }
    return k;
  };
  /** Consecutive text lines from k matching `test`, none wrapped onto the one before. */
  const runOf = (k: number, test: (text: string) => unknown) => {
    let end = k;
    while (isText(end) && test(lines[end]!) && (end === k || !continues(lines[end - 1]!, lines[end]!))) end++;
    return end;
  };

  // A title opens a paragraph, or follows a list typed in the same paragraph.
  let paragraphStart = true;
  let afterList = false;
  let i = 0;
  while (i < lines.length) {
    const kind = kinds[i];
    if (kind === null) {
      paragraphStart = true;
      afterList = false;
      i++;
      continue;
    }
    const line = lines[i]!;
    const opensParagraph = paragraphStart;
    const followsList = afterList;
    paragraphStart = false;
    afterList = false;

    if (kind.kind === 'emphasis' || kind.kind === 'section') {
      if (kind.kind === 'emphasis' && !inParagraph(i + 1)) {
        blocks.push(line);
      } else if (kind.kind === 'emphasis' && !kind.label) {
        blocks.push(`### ${kind.text}`);
      } else if (inParagraph(i + 1) && isText(i + 1) && !itemsAt(i + 1)) {
        // A label over its text: keep them together, as a line break.
        const [body, end] = textFrom(i + 1);
        blocks.push(`${boldLabel(kind.text)}  \n${body}`);
        i = end;
        continue;
      } else {
        blocks.push(boldLabel(kind.text));
        // A paragraph after it typed one item per line holds this label's items.
        const end = inParagraph(i + 1) ? i : runOf(i + 2, (text) => text.length <= 200);
        if (end - i > 3 && !inParagraph(end)) {
          blocks.push(listBlock(lines.slice(i + 2, end) as string[], false));
          i = end;
          continue;
        }
      }
      i++;
      continue;
    }

    if (kind.kind === 'stars') {
      if (kind.lead) blocks.push(kind.lead);
      if (kind.label) blocks.push(boldLabel(kind.label));
      const items = [...kind.items];
      const more = (k: number) => {
        const next = kinds[k];
        return next?.kind === 'stars' && !next.label ? next.items : null;
      };
      i = collect(i + 1, more, items);
      blocks.push(listBlock(items, false));
      afterList = true;
      continue;
    }

    if (kind.kind === 'bullet') {
      const items = [kind.text];
      const more = (k: number) => {
        const next = kinds[k];
        return next?.kind === 'bullet' && next.dash === kind.dash ? [next.text] : null;
      };
      const end = collect(i + 1, more, items);
      // A single "-word" line is more likely text than a bullet.
      if (!kind.dash || items.length > 1) {
        blocks.push(listBlock(items, false));
        i = end;
        afterList = true;
        continue;
      }
    }

    if (kind.kind === 'numbered') {
      if (numberedTitle(i)) {
        blocks.push(`### ${kind.number}. ${kind.text}`);
        i++;
        continue;
      }
      const items = [kind.text];
      const more = (k: number) => {
        const next = kinds[k];
        return next?.kind === 'numbered' && !numberedTitle(k) ? [next.text] : null;
      };
      i = collect(i + 1, more, items);
      blocks.push(listBlock(items, true, kind.number));
      afterList = true;
      continue;
    }

    // A short line over a sentence is its title: at the start of a paragraph
    // also one over "Label: value" lines, and one alone right before a list.
    // After a list it must also not read as one more short item of that list.
    const next = lines[i + 1];
    const sentenceNext = inParagraph(i + 1) && isText(i + 1) && !continues(line, next!)
      && (/[.!?。！？]$/.test(next!) || (opensParagraph && pair(next!)));
    const newList = followsList && !isFragment(lines[i - 1]!) && runOf(i + 1, pair) - i > 2;
    if ((opensParagraph || followsList) && looksLikeHeading(line)
      && (sentenceNext || newList || (beforeList && opensParagraph && i === lines.length - 1))) {
      blocks.push(`### ${line}`);
      i++;
      continue;
    }

    // Runs of short lines ("Label: value" specs, fragments) and "Label:
    // sentence" lines typed one under another are lists.
    let end = runOf(i, isFragment);
    // The last short line may be the title of the sentences after it.
    if (end - i > 2 && !pair(lines[end - 1]!) && isText(end) && /[.!?。！？]$/.test(lines[end]!)) end--;
    if (end - i < 2) end = runOf(i, pair);
    if (end - i > 1) {
      blocks.push(listBlock(lines.slice(i, end) as string[], false));
      i = end;
      afterList = true;
      continue;
    }

    // "Label: value" paragraphs one after another keep that, labels in bold.
    const single = (k: number) => isText(k) && !inParagraph(k - 1) && !inParagraph(k + 1) && pair(lines[k]!);
    if (single(i) && single(i + 2)) {
      let k = i;
      while (single(k)) {
        const { label, value } = pair(lines[k]!)!;
        blocks.push(`${boldLabel(label)} ${value}`);
        k += 2;
      }
      i = k - 1;
      continue;
    }

    const [text, textEnd] = textFrom(i);
    blocks.push(text);
    i = textEnd;
  }
  // Markdown joins two lists in a row into one; a different marker keeps them apart.
  return blocks.map((block, index) => {
    const previous = blocks[index - 1];
    if (previous?.startsWith('- ') && block.startsWith('- ')) return block.replace(/^- /gm, '* ');
    if (/^\d+\. /.test(previous ?? '') && /^\d+\. /.test(block)) return block.replace(/^(\d+)\. /gm, '$1) ');
    return block;
  });
}

/**
 * A list whose every item is a title line over its description ("1. Factory
 * Direct Pricing" then "As a manufacturer, ..."): Markdown runs each title
 * into its text, so the items become headings over their text instead.
 */
function layOutTitledList(list: Tokens.List): string | null {
  const items = list.items.map((item) => {
    const blocks = item.tokens.filter((token) => token.type !== 'space');
    const block = blocks[0];
    if (item.task || blocks.length !== 1 || (block.type !== 'text' && block.type !== 'paragraph')) return null;
    const lines = typedLines((block as Tokens.Paragraph).tokens ?? []);
    if (lines.length < 2 || !looksLikeHeading(lines[0]) || continues(lines[0], lines[1])) return null;
    return lines;
  });
  if (!items.length || !items.every(Boolean)) return null;
  const start = list.ordered ? Number(list.start) || 1 : 0;
  return items
    .map((lines, index) => [`### ${list.ordered ? `${start + index}. ` : ''}${lines![0]}`, ...layOut(lines!.slice(1))].join('\n\n'))
    .join('\n\n');
}

function structureTypedLines(source: string): string {
  const parts: string[] = [];
  let changed = false;
  const pushBlocks = (markdownBlocks: string) => {
    const previous = parts[parts.length - 1];
    if (previous && !previous.endsWith('\n\n')) parts.push(previous.endsWith('\n') ? '\n' : '\n\n');
    parts.push(`${markdownBlocks}\n\n`);
    changed = true;
  };
  let run: Tokens.Paragraph[] = [];
  let runRaw = '';
  const flush = (beforeList = false) => {
    if (!run.length) return;
    const lines: Line[] = [];
    for (const paragraph of run) {
      if (lines.length) lines.push(null);
      lines.push(...typedLines(paragraph.tokens));
    }
    const blocks = layOut(lines, beforeList);
    const unchanged = blocks.length === run.length && blocks.every((block, index) => block === run[index].text.trim());
    if (unchanged) parts.push(runRaw);
    else pushBlocks(blocks.join('\n\n'));
    run = [];
    runRaw = '';
  };
  for (const token of markdown.lexer(source)) {
    if (token.type === 'paragraph' || (token.type === 'space' && run.length)) {
      if (token.type === 'paragraph') run.push(token as Tokens.Paragraph);
      runRaw += token.raw;
      continue;
    }
    flush(token.type === 'list');
    const titled = token.type === 'list' ? layOutTitledList(token as Tokens.List) : null;
    if (titled === null) parts.push(token.raw);
    else pushBlocks(titled);
  }
  flush();
  return changed ? parts.join('') : source;
}
