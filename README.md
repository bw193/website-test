<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BOLEN website

Vite/React storefront with a Cloudflare Workers AI receptionist and Supabase-backed content/RFQs.

## Run locally

Prerequisites: Node.js 22+.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add the Supabase public configuration.
3. Run the Vite/Express development server: `npm run dev`

The regular development server renders the website, but the AI binding only exists in the Cloudflare Workers runtime. To test the AI route locally, authenticate Wrangler once with `npx wrangler login`, then run:

Add `SUPABASE_SECRET_KEY` to an ignored `.env.local` file before starting the Worker preview. It is a server-only Supabase secret: never add a `VITE_` prefix, put it in `wrangler.jsonc`, or commit it.

```sh
npm run preview:cloudflare
```

## Cloudflare Workers AI

`wrangler.jsonc` configures the static `dist` assets, the `AI` binding, and the rate limiter. The browser calls the same-origin `POST /api/ai-receptionist` endpoint; no model API key is shipped to the browser.

Deploy after authenticating Wrangler:

```sh
npx wrangler secret put SUPABASE_SECRET_KEY
npm run deploy:cloudflare
```

The default model is selected in `worker/index.ts`. Cloudflare's daily free Workers AI allocation applies at the account level. When the allocation or request limit is reached, the chat keeps the existing RFQ path available for a human follow-up.

Edit `buildSystemPrompt()` in `worker/index.ts` to change the assistant's verified company background, answer scope, RFQ handoff, and response style. Keep personal contact details in the structured RFQ flow rather than the saved chat transcript.

Automatically redacted conversations are retained for up to 90 days. Authorized administrators can review them at `/admin?tab=ai-chats`; anonymous visitors and employees without administrator access cannot read the chat tables.

The first deployment receives a `workers.dev` address. Attach the production domain in the Cloudflare Workers dashboard after confirming that the domain's DNS zone is managed by the intended Cloudflare account.

`GEMINI_API_KEY` is optional and is used only by `npm run translate`; it is not used by the public AI receptionist.
