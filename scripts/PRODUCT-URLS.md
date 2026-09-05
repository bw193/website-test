# Product detail URLs

Detail routes use `/{language}/products/{category-slug}/{localized-product-slug}/`.
Catalogs and category pages keep their existing paths and copy. The category
segment uses the existing source category slug; only the product slug is localized.

`npm run build` first runs `generate-product-routes.ts`. It reads active products
with the public Supabase client and compiles `src/data/productRoutes.json` from
the original English titles and `public/i18n/products.{es,fr,de,it}.json` titles.
Chinese URL names live in `public/i18n/product-slugs.zh.json` and are deliberately
separate from display copy. Keep these translation maps complete when adding
products; the generator rejects missing translations and duplicate URLs.

The compact route index is shared by product cards, detail lookup, language
switching, SEO, prerendering, sitemaps and the Cloudflare Worker. Products added
since the last build can still use a category-qualified English fallback until
their translations are supplied and the site is rebuilt. SEO title/H1 overrides
never change URLs.

The Worker redirects old English-slug, slug-plus-UUID and bare-UUID detail links
to the current localized destination with HTTP 301, preserving query parameters.
Only product paths run through this handler. Catalog/category assets keep their
existing serving behavior. Deploy the Worker configuration and built assets
together for the redirect migration.

Verification:

```sh
npm run test:seo
npm run test:worker
npm run build
npm run verify:seo:rendered
npx tsx scripts/verify-product-routes.ts
# Optional: also test a running local Worker and compare captured catalog HTML.
npx tsx scripts/verify-product-routes.ts --base-url http://127.0.0.1:4179 --baseline <directory>
```
