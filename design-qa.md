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

# Homepage Stats Copy - Product Design QA

## Comparison inputs

- Source visual truth: `C:\Users\Administrator\Pictures\Screenshots\屏幕截图(64).png`
- Desktop implementation: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-stats-copy-desktop-final.png`
- Mobile implementation: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-stats-copy-mobile-final.png`
- Focused source/implementation comparison: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-stats-copy-comparison-final.png`
- Preview URL: `http://127.0.0.1:3000/en/#home-stats`

The supplied homepage screenshot and final browser rendering were placed in one focused comparison image before judging the stats card.

## Viewports, pixels, and state

- Source screenshot: 2560 x 1440 px; the stats region was cropped from the original capture and normalized to the comparison panel width.
- Desktop CSS viewport: 2560 x 1215. Browser screenshot: 2545 x 1208 px after scrollbar/chrome allocation.
- Mobile CSS viewport: 390 x 844. Document client width: 375 px; browser screenshot: 375 x 812 px.
- State: English homepage with the stats card and following Inside the Factory section visible; count-up animation settled at 46,800 m², 200+, 200+, and Global.
- No horizontal document overflow or label overflow at either verified viewport.

## Full-view comparison evidence

- The implementation preserves the source card's centered placement, white surface, rounded corners, subtle shadow, amber line icons, serif values, four desktop columns, and light vertical dividers.
- The requested descriptive copy intentionally makes the desktop card taller than the source's short uppercase-label version, while keeping the value hierarchy and surrounding warm ivory transition intact.
- At mobile width, the four columns become a balanced 2 x 2 grid so the longer sentences stay readable without horizontal scrolling.

## Focused-region comparison evidence

- The combined comparison clearly shows the same four stats, icon order, type hierarchy, centered alignment, and card treatment in the reference and implementation.
- All four revised sentences are visible in full. The longest logistics sentence wraps naturally inside its column and does not clip or overflow.
- The card remains visually connected to the introduction above and Inside the Factory section below.

## Required fidelity surfaces

- Fonts and typography: existing serif numerals and sans-serif supporting copy are retained; desktop copy is 13 px and mobile copy is 12 px with relaxed line height and no truncation.
- Spacing and layout rhythm: desktop uses one four-column row; mobile uses two equal rows and columns with matching dividers, consistent padding, radii, and elevation.
- Colors and visual tokens: the existing white, ivory, stone, and amber palette is unchanged and maintains the source hierarchy.
- Image quality and asset fidelity: no source imagery or product assets were changed; the same Lucide icon set remains sharp at both viewports.
- Copy and content: spelling and grammar were corrected while preserving the user's four claims. Equivalent localized copy was added for English, Chinese, German, French, Spanish, and Italian.

## Interaction and accessibility evidence

- DOM and browser checks confirmed the four values and four complete English descriptions.
- Responsive checks confirmed document `scrollWidth` equals `clientWidth` and all labels report no horizontal overflow.
- Browser console errors and warnings: 0.
- Production build and TypeScript lint checks pass.

## Findings and comparison history

1. The original four-column mobile strip could not support the requested longer sentences without excessive compression. It was replaced with a 2 x 2 mobile grid while retaining the source's four-column desktop layout.
2. The first mobile refinement rendered descriptive copy at 11 px. Visual review found it undersized for paragraph-length labels, so it was increased to 12 px and recaptured with no overflow.
3. Post-fix desktop and mobile captures found no remaining actionable P0, P1, or P2 visual, responsive, accessibility, or content issues.

final result: passed

---

# Homepage Banner + Quick Inquiry — overlap refinement

## Comparison inputs

- Source visual truth: `C:\Users\Administrator\Pictures\Screenshots\屏幕截图(96).png`
- Desktop implementation: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-overlap-desktop-final.jpg`
- Mobile implementation: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-overlap-mobile-final.jpg`
- Combined full-view and focused comparison: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-overlap-comparison.jpg`
- Preview URL: `http://127.0.0.1:3000/en/`

The supplied reference and final browser capture were normalized into the same comparison image before judging the banner edge, card proportions, and transition into the introduction band.

## Viewport, pixels, and state

- Source: 2560 × 1440 physical pixels at the user's 125% Windows scale; normalized to a 2048 px logical-width comparison.
- Desktop CSS viewport: 2048 × 1215. Browser capture: 2033 × 1162 px after browser scrollbar/chrome allocation.
- Desktop geometry: hero bottom 858 px; inquiry card 780 × 134 px at y 810–944, creating a measured 48 px overlap across the banner edge.
- Mobile CSS viewport: 390 × 844; document client width 375 px. The card is 343 × 306 px at y 178–484 and overlaps the banner by 32 px.
- State: English homepage, a live carousel image fully loaded, quick-inquiry fields empty, introduction visible beneath the card.
- Horizontal overflow: none at either verified viewport.

## Full-view comparison evidence

- The reference and implementation now share the same three-part composition: banner artwork, centered white quick-reply card crossing the banner boundary, and the page introduction directly below.
- The value-band background begins exactly where the banner ends and continues behind the lower portion of the card, so there is no detached white gap between the three regions.
- The implementation preserves the current site's taller responsive hero and existing BOLEN navigation rather than copying unrelated content from the reference site.
- Carousel pagination sits above the floating card and remains visible without covering the card or its controls.

## Focused-region comparison evidence

- The focused comparison shows nearly equal card-to-page proportions: the final 780 px desktop card is centered and uses the same short title plus one-row Name, Email, Message, and Send layout as the source.
- The measured 48 px desktop overlap closely matches the source's approximately 52 px logical overlap.
- The lower introduction sits close enough to read as part of the same composition while maintaining separation from the card shadow.

## Required fidelity surfaces

- Fonts and typography: the form title keeps the source's serif character; input and button text use the established BOLEN sans hierarchy with readable optical weight and no truncation.
- Spacing and layout rhythm: card width, 48 px desktop overlap, 32 px mobile overlap, single-row desktop grid, stacked mobile grid, and the transition into the information band are balanced and contained.
- Colors and visual tokens: white/ivory surfaces, stone borders, soft elevation, amber focus treatment, and the existing orange primary action are consistent with the current brand. The warmer button color is an intentional brand-system adaptation.
- Image quality and asset fidelity: the existing responsive banner image remains unchanged and fully sharp; no placeholder, generated asset, CSS art, or replacement imagery was introduced.
- Copy and content: the compact quick-reply title and Name, Email, Message, and Send fields match the reference's content model; the existing localized strings remain available in all six supported locales.

## Interaction and accessibility evidence

- Empty-submit testing returned all three expected messages: `Name is required`, `Email is required`, and `Message is required`; no inquiry was transmitted.
- Labels, required-state relationships, autocomplete hints, visible focus styling, loading/success/error feedback, and keyboard submission remain intact.
- Desktop and mobile browser captures show no clipping or horizontal scrolling.
- Browser console errors: 0.
- Production build and TypeScript checks pass.

## Findings and comparison history

1. User feedback identified a P2 composition mismatch: the form previously followed the introduction instead of crossing the banner edge. The form was moved to the first visual position in the information band and raised 48 px on desktop / 32 px on mobile; the revised capture confirms a real banner overlap.
2. The first overlap pass retained a 896 px card, which was visibly wider than the source. The final maximum width is 780 px and the desktop columns now use a 1 : 1 : 1.5 field ratio; the focused recapture aligns closely with the reference.
3. Accessibility review found a P2 source-order mismatch: CSS ordering placed the form above the introduction visually while keyboard and assistive-technology order still reached the introduction first. The form markup now precedes the introduction in the DOM, matching visual and focus order without changing the layout.
4. Post-fix desktop and mobile captures found no remaining actionable P0, P1, or P2 visual, interaction, accessibility, or responsive issues.

## Follow-up polish

- P3, intentionally retained: the implementation uses the site's rounder corners and orange CTA instead of duplicating the reference site's sharper card and yellow button.

final result: passed

---

# Homepage Banner + Quick Inquiry — Product Design QA

## Comparison inputs

- Supplied current homepage: `C:\Users\Administrator\Pictures\Screenshots\屏幕截图(97).png`
- Supplied input-area reference: `C:\Users\Administrator\Pictures\Screenshots\屏幕截图(96).png`
- Desktop implementation, top of page: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-desktop-final-top.png`
- Desktop implementation, form in view: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-desktop-final-form.png`
- Mobile implementation: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-mobile-final.png`
- Full-view composite: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-comparison-full.jpg`
- Focused form composite: `C:\Users\Administrator\Documents\GitHub\website-test\shots\home-quick-inquiry-comparison-focused.png`
- Preview URL: `http://127.0.0.1:3000/en/`

The supplied homepage, input reference, and browser-rendered implementation were normalized and reviewed in combined comparison images rather than from separate image views.

## Viewports, pixels, and state

- Both supplied screenshots are 2560 × 1440 physical pixels at the user's 125% Windows scale. They were normalized to 2048 × 1152 before cropping for comparison.
- Desktop CSS viewport: 2048 × 1018. Browser screenshot: 2033 × 1011 pixels; the difference is browser scrollbar/chrome allocation, not page scaling.
- Mobile CSS viewport: 390 × 844. Document client width: 375 px with the scrollbar present; screenshot captured at the same state.
- State: English homepage, live hero carousel image loaded, introduction and quick-inquiry form visible, no form values entered.
- No horizontal overflow at the mobile viewport.

## Full-view comparison evidence

- The navbar, banner artwork, brand typography, warm ivory information band, CTAs, and page silhouette remain intact.
- The information band now overlaps the bottom of the banner by 16 px on mobile, 24 px on tablet, and 32 px on desktop. This is a restrained upward shift matching the requested “move it up a little” treatment.
- Carousel pagination was lifted clear of the new overlap so it remains visible and clickable without covering the banner's baked-in certification copy.
- The new form sits directly after the banner information, before the existing stats card, preserving the homepage's conversion hierarchy.

## Focused form comparison evidence

- The reference and implementation both use a centered white quick-reply card, a short serif heading, three bordered inputs in one desktop row, and a warm-colored submit button.
- The implementation intentionally uses BOLEN's existing amber action color, rounded controls, focus rings, icon language, and slightly wider responsive measure instead of copying the source site's yellow/red branding.
- At mobile width the row becomes a clean single-column stack; all controls remain fully contained and the shorter “Message” placeholder avoids truncation.

## Required fidelity surfaces

- Fonts and typography: the existing BOLEN serif/sans pairing is preserved. The form heading matches the reference's editorial serif treatment, while 14 px input text and clear button weight remain readable.
- Spacing and layout rhythm: the banner overlap is modest; the form, stats card, and following factory section keep even vertical spacing. Desktop fields align to a single 48 px control row; mobile controls stack without clipping.
- Colors and visual tokens: existing ivory, white, stone, amber, border, focus, and shadow tokens are reused. Contrast and focus states are clear.
- Image quality and asset fidelity: the banner source, responsive image loading, crop, and intrinsic sizing are unchanged. No generated, placeholder, CSS-art, or replacement imagery was introduced.
- Copy and content: the compact quick-reply title and Name, Email, Message, and Send labels follow the supplied reference. Equivalent copy is present in English, Chinese, German, French, Spanish, and Italian.

## Interaction and accessibility evidence

- Empty-submit testing produced the expected three localized validation messages for name, email, and message without sending data.
- The live submit path uses the site's existing RFQ store, includes loading/success/error states, resets after success, and records the homepage as the lead source. A live RFQ was intentionally not created during visual QA.
- Inputs have programmatic labels, autocomplete hints, limits matching the RFQ policy, invalid-state relationships, visible focus treatment, and keyboard-accessible submission.
- Fresh-tab console errors: 0.
- Production build and TypeScript checks pass.

## Findings and comparison history

1. The first desktop form pass was wider than the supplied reference. Its maximum width was reduced from 1024 px to 896 px, then recaptured in the focused comparison.
2. The first mobile pass used a long specification prompt that truncated. It was shortened to the localized equivalent of “Message,” then recaptured at 390 × 844 with no horizontal overflow.
3. The first console pass exposed an existing React warning for the hero image's priority attribute. The HTML-compatible lowercase attribute pattern already used elsewhere in the project was applied; a fresh tab then reported zero console errors.
4. The post-fix full-view and focused composites show no remaining actionable P0, P1, or P2 visual, responsive, interaction, accessibility, or content differences.

## Follow-up polish

- The card is intentionally adapted to the current BOLEN design system rather than duplicating the reference site's exact width and yellow button.

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

---

# Homepage Factory Gallery - 2026-09-05

- Reference: user screenshot `Screenshots/屏幕截图(110).png`.
- Preview: `http://localhost:3000/en/#factory-showcase`.
- Final captures: `shots/home-factory-redesign-desktop.png`, `shots/home-factory-redesign-wide.png`, and `shots/home-factory-redesign-mobile.png`.
- Replaced the viewport-wide filmstrip with a contained two-column composition: introduction, featured photograph, caption/navigation row, and thumbnail strip. Mobile stacks the introduction above the gallery.
- Keeps editor-managed photography, descriptive image alt text, structured image data, and localized routes. Added gallery control and factory link copy in all six supported languages.
- Verified all nine photographs, synchronized captions, thumbnail selection, previous/next wrapping, Arrow Left/Right, Home/End, and keyboard focus from the selected thumbnail to the image panel.
- Checked 320, 390, 768, 1024, 1440, and 2048 px widths; no horizontal document overflow. Thumbnail and arrow targets remain at least 44 px.
- Verified each locale and the factory-story link. Browser console/page errors: zero.
- Browser-only response fixtures verified reordered images, a removed selection, one image, missing captions, an empty gallery, restored images, and reduced-motion thumbnail navigation. No backend data was changed.
- TypeScript check (`npm.cmd run lint`) and Vite production build (`npm.cmd exec vite build`) passed. The build emitted its bundle-size advisory.

final result: passed

## Factory Gallery Animation Follow-up - 2026-09-05

- Current preview: `http://127.0.0.1:5178/en/#factory-showcase`. Port 3000 is now serving a separate Chengtai site, so this workspace has a dedicated Vite preview.
- Added staggered copy and thumbnail entrances, a directional photo crossfade with a short zoom, animated captions and position line, thumbnail lift, button feedback, and a link underline. All animations are finite; no automatic slide changes or animation dependencies were added.
- The last completed photo stays visible until its replacement decodes. Stale loads are ignored and failed images show localized recovery guidance.
- Captures: `shots/home-factory-animation-entry.png`, `shots/home-factory-animation-transition.png`, `shots/home-factory-animation-desktop.png`, and `shots/home-factory-animation-mobile.png`.
- Browser checks confirmed entrance timing, both slide directions including wrapping, outgoing image cleanup, rapid selection, and thumbnail hover feedback.
- Responsive checks passed at 320, 390, 768, 1024, and 1440 px. A separate touch-device context verified tap navigation and disabled hover zoom.
- Reduced-motion checks found no running gallery animations or hover transforms. Normal browsing produced no console or page errors.
- Browser-only delayed and failed image responses verified continuity, stale-response protection, clear failure feedback, and recovery. Backend data was not changed.
- TypeScript and the Vite production build passed; the existing bundle-size advisory remains.

final result: passed
