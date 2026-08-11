import React, { useMemo } from 'react';
import { Marked } from 'marked';

/**
 * Renders trusted, admin-authored markdown (product `details`, blog bodies,
 * video bodies).
 *
 * Replaces react-markdown, which pulled remark + micromark + mdast/hast into a
 * 118 KB / 36 KB-gzip shared chunk loaded by ProductDetail, BlogPost and
 * VideoDetail — the three page types buyers land on from search. `marked` does
 * the same job for these documents at roughly a third of the size, and the
 * prerenderer (scripts/prerender-static.ts) already uses it, so both paths now
 * produce identical HTML.
 *
 * Safety: react-markdown ignores raw HTML and strips dangerous URL protocols
 * unless explicitly opted out of. Both behaviours are reproduced below so this
 * swap is not a security regression — raw HTML blocks and inline tags are
 * dropped, and href/src are limited to a protocol allowlist.
 */

const SAFE_PROTOCOL = /^(https?:|mailto:|tel:|#|\/|\.)/i;

/**
 * Removes ASCII control characters and spaces. A naive prefix test can be
 * fooled by a protocol with an embedded tab, newline or null byte, which
 * browsers strip and then execute; removing them first makes the allowlist
 * check meaningful.
 */
function stripControlChars(s: string): string {
  let out = '';
  for (const ch of s) {
    if (ch.charCodeAt(0) > 0x20) out += ch;
  }
  return out;
}

function safeUrl(href: string | null | undefined): string | null {
  if (!href) return null;
  const cleaned = stripControlChars(href.trim());
  return SAFE_PROTOCOL.test(cleaned) ? cleaned : null;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const renderer = {
  // Drop raw HTML entirely (both block and inline), matching react-markdown's
  // default. Inner text is preserved by marked's own tokenizer.
  html(): string {
    return '';
  },
  link(token: { href: string; title?: string | null; text: string }): string {
    const href = safeUrl(token.href);
    if (!href) return token.text;
    const title = token.title ? ` title="${escapeAttr(token.title)}"` : '';
    const external = /^https?:/i.test(href);
    const rel = external ? ' rel="noopener noreferrer" target="_blank"' : '';
    return `<a href="${escapeAttr(href)}"${title}${rel}>${token.text}</a>`;
  },
  image(token: { href: string; title?: string | null; text: string }): string {
    const src = safeUrl(token.href);
    if (!src) return '';
    const title = token.title ? ` title="${escapeAttr(token.title)}"` : '';
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(token.text || '')}"${title} loading="lazy" decoding="async" />`;
  },
};

// One instance for the module — configuration is immutable, so it is safe to
// share across renders and components.
const md = new Marked({ async: false, gfm: true, breaks: false });
md.use({ renderer });

export function renderMarkdownToHtml(source: string): string {
  if (!source) return '';
  return md.parse(source) as string;
}

interface MarkdownProps {
  children: string | null | undefined;
  className?: string;
}

export default function Markdown({ children, className }: MarkdownProps) {
  const html = useMemo(() => renderMarkdownToHtml(children || ''), [children]);
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
