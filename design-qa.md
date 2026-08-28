# Our Story — Product Design QA

## Comparison inputs

- Selected source: `C:\Users\Administrator\.codex\generated_images\01a036a3-dd84-7460-a3a5-02cf5abb9991\exec-68d3677b-4e82-4cc6-b015-a8fc1aba1d65.png`
- Desktop implementation: `C:\Users\Administrator\Documents\GitHub\website-test\shots\story-option2-desktop-full-qa.png`
- Mobile implementation: `C:\Users\Administrator\Documents\GitHub\website-test\shots\story-option2-mobile-390x844.png`
- Preview URL: `http://127.0.0.1:5173/en/our-story/`

The selected source and the loaded desktop implementation were reviewed together in one comparison pass.

## Viewports and density

- Source image: 862 × 1825 px.
- Desktop visual QA: 1440 × 900, DPR 1, plus a full-page capture.
- Final clean preview: 1280 × 720, DPR 1.
- Responsive QA: 390 × 844 and 320 × 800.
- No horizontal document overflow at 1440, 390, or 320 px.

## Visual result

- Preserves the site's existing white Navbar, Playfair/Inter typography, warm ivory canvas, stone ink, amber action color, rounded cards, and dark closing/footer system.
- Matches the selected guided-factory-journal anatomy: photographic hero with an ivory story card, chapter rail, interactive process stages, factory gallery, compact featured film, documentation panel, and dark partnership close.
- Uses real editor-managed factory images, the selected published database video, and existing document graphics. The company facts module is intentionally more detailed than the visual source because the brief asked for more informative and trustworthy content.
- Facts are scoped and consistent: founded 2005, 46,800 m² facility, 200+ specialists, live catalog/video counts, and model/market-specific documentation language.

## Interaction and accessibility checks

- Chapter controls scroll to the requested section and update the active chapter.
- Process tabs work by click and Arrow Left/Right/Home/End; the selected mobile tab is automatically centered in its horizontal rail.
- Gallery thumbnails and Previous/Next controls update the featured image and its live-region caption.
- Featured-film facade opens a native controlled player and can be closed.
- Primary links resolve to localized RFQ, catalog, and video routes.
- One H1, ordered section headings, tab/tabpanel relationships, visible focus states, meaningful alt text, 44 px minimum control targets, and reduced-motion-compatible entrance behavior are present.
- Fresh-tab console check: no errors or warnings.
- All visible factory/document images loaded successfully during the complete scroll pass.

## Findings and iteration history

1. Initial pass found the default mobile process tab outside the visible horizontal rail. Added horizontal centering tied to the active stage and re-tested at 390 px.
2. Initial clean-console pass found a React `fetchPriority` development warning. Removed the incompatible prop and re-tested in a new tab with zero console errors or warnings.
3. Source-to-implementation comparison found no remaining P0, P1, or P2 visual, interaction, accessibility, or responsive defects.

final result: passed

---

# Insights — Product Design QA

## Comparison inputs

- Source visual truth: `http://localhost:3000/en/solutions/` (the existing Solution page requested as the design and URL-pattern reference).
- Implementation URL: `http://localhost:3000/en/insights/`.
- Source screenshot: in-app Browser capture, tab `5` (the Browser API returned rendered image content but no filesystem export path).
- Implementation screenshot: in-app Browser capture, tab `6` (the Browser API returned rendered image content but no filesystem export path).
- Article-detail evidence: `http://localhost:3000/en/insights/anti-fog-mirror-technology-explained/`.

The source and implementation were captured at the same state and viewport and emitted together in one browser comparison input. A browser security restriction prevented generating a separate data-URL composite; the two original, unmodified captures were therefore compared as the paired panels returned by that input.

## Viewport, pixels, and state

- CSS viewport: 1280 × 720; the in-app Browser clamped requested viewport overrides to this desktop size for fresh tabs.
- Source screenshot: 1265 × 712 JPEG pixels.
- Implementation screenshot: 1265 × 712 JPEG pixels.
- Device scale factor: 1; no density normalization was required.
- State: English, desktop, top of page, published data loaded, category filter set to All.
- A 390 × 844 responsive override was attempted twice, but the Browser enforced its 1280 px minimum in this session. This remains a visual test gap, not an observed responsive defect; the implementation retains the site's existing responsive container, wrapping, and grid breakpoints.

## Full-view comparison evidence

- Both pages use the same BOLEN navigation, warm ivory canvas, serif display hierarchy, stone text palette, amber accent/action color, max-width content frame, horizontal section rules, and square-corner editorial surfaces.
- The Insights introduction follows the Solution composition: left-aligned kicker/H1/description, right-aligned primary and secondary actions, followed by a ruled content section.
- The featured Insight is deliberately text-first. The live featured record has no rendered cover, and the layout closes the image column entirely instead of reserving a placeholder or fallback-image slot.
- The page keeps a readable editorial hierarchy while using the Solution page's restrained spacing and border rhythm; no horizontal overflow was present at the verified viewport.

## Focused-region evidence

- The above-the-fold capture was sufficiently large to read the display typography, paragraph wrapping, CTA proportions, featured metadata, and section spacing, so a separate crop was not needed for those surfaces.
- A dedicated article-detail capture verified the text-first breadcrumb, category, H1, excerpt, metadata, and optional real cover. The cover loaded at 800 px natural width with no placeholder substitution.
- Browser DOM checks verified one H1, one featured-article destination link, five real optional list images for six published English records, and no forced image for the no-cover featured record.

## Required fidelity surfaces

- Fonts and typography: existing serif and sans families, optical weights, line heights, uppercase metadata, and wrapping match the Solution reference. Long article titles wrap without clipping or truncation.
- Spacing and layout rhythm: content bounds, hero spacing, CTA alignment, section rules, card gaps, and article measure follow the existing design system. No extra rounded-card or shadow treatment was introduced.
- Colors and tokens: warm ivory, white, stone, amber, and dark CTA tokens are reused directly from the product; contrast and visible focus rings are retained.
- Image quality and asset fidelity: imagery is optional, uses the real editor-managed asset only, preserves a defined aspect ratio, and disappears on missing/invalid/error states. No placeholder, CSS art, fake SVG, or generated substitute is rendered.
- Copy and content: public terminology is consistently “Insights”; six locale headings/meta copy and category labels are localized, and untranslated articles are excluded from that locale instead of showing English under a false local URL.

## Interaction and accessibility evidence

- Category filter test: selecting Technology set `aria-pressed` correctly and reduced the list to the single Technology article; returning to All restored the full view.
- SPA navigation test: featured article → related Anti-Fog article updated URL, H1, and canonical together with no stale article state and no loading state left behind.
- Translation test: the Chinese hub rendered only its one real translated article; the English-only Anti-Fog title was absent.
- Legacy and untranslated routes resolve to the canonical Insights destination; generated article-specific legacy redirects precede generic rules and avoid a redirect chain.
- Fresh-tab console errors: 0.
- Keyboard semantics: filter controls are buttons with pressed state and visible focus; the featured article was reduced from three redundant focus targets to one link.

## Findings and comparison history

1. Initial implementation audit found a P1 stale-state risk when navigating between article slugs/languages. The prerender seed is now language-aware, article/list state resets on slug or language change, and a browser A→B navigation confirmed matching URL, H1, and canonical with zero console errors.
2. Initial implementation audit found a P1 thin-page risk for published records without a complete title/body pair. Publishing now requires English body content, and zero-language legacy records render the not-found/noindex state instead of a thin 200 article.
3. Initial QA found P2 metadata, category-localization, redirect-chain, and redundant-focus inconsistencies. Static and client title suffixes now match; category labels are localized in every supported language and every public surface; untranslated legacy URLs redirect directly to the final locale; and the featured item now exposes one focus target.
4. Post-fix source/implementation recapture at the matched 1280 × 720 viewport found no remaining actionable P0, P1, or P2 visual, interaction, accessibility, or content differences.

## Follow-up polish

- Residual test gap: capture one 390 px production-preview screenshot when a browser surface that permits a true mobile viewport is available.

final result: passed
