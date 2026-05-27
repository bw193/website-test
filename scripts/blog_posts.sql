-- ============================================================================
-- BOLEN Journal — blog_posts table
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Localizable fields are per-language JSONB maps ({"en": "...", "zh": "..."}).
-- English is required; any missing language falls back to English on the site.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  status          text not null default 'draft' check (status in ('draft', 'published')),
  category        text,
  cover_image     text,
  author          text default 'BOLEN Editorial',
  reading_minutes int,
  tags            text[],
  product_ids     text[],
  title           jsonb not null default '{}'::jsonb,
  excerpt         jsonb default '{}'::jsonb,
  body            jsonb default '{}'::jsonb,
  seo_title       jsonb default '{}'::jsonb,
  seo_description jsonb default '{}'::jsonb,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists blog_posts_status_idx       on public.blog_posts (status);
create index if not exists blog_posts_published_at_idx  on public.blog_posts (published_at desc);
create index if not exists blog_posts_slug_idx          on public.blog_posts (slug);

-- Added after the initial release: relate articles to products (stores product
-- UUIDs). `if not exists` makes this safe to re-run on an already-created table.
alter table public.blog_posts add column if not exists product_ids text[];

-- ----------------------------------------------------------------------------
-- Row Level Security
-- The browser uses the public anon key, so RLS is what keeps DRAFTS private.
-- Match these policies to your existing `products` table if it differs.
-- ----------------------------------------------------------------------------
alter table public.blog_posts enable row level security;

-- Anyone (anon + authenticated) may read ONLY published posts.
drop policy if exists "blog_posts public read published" on public.blog_posts;
create policy "blog_posts public read published"
  on public.blog_posts for select
  using (status = 'published');

-- Authenticated users (your admins) get full read/write access.
drop policy if exists "blog_posts authenticated all" on public.blog_posts;
create policy "blog_posts authenticated all"
  on public.blog_posts for all
  to authenticated
  using (true)
  with check (true);

-- Keep updated_at current on every update.
create or replace function public.set_blog_posts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_blog_posts_updated_at();

-- ============================================================================
-- OPTIONAL SEED — three English starter articles so the Journal has content to
-- prerender and verify immediately. Other languages fall back to English until
-- translated in the admin. Safe to skip or delete. Re-runnable (ON CONFLICT).
-- ============================================================================
insert into public.blog_posts (slug, status, category, cover_image, author, reading_minutes, title, excerpt, body, published_at)
values
(
  'led-bathroom-mirror-buyers-guide',
  'published',
  'Buying Guide',
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory1.jpg',
  'BOLEN Editorial',
  5,
  jsonb_build_object('en', 'How to Choose the Right LED Bathroom Mirror: A 2026 Buyer''s Guide'),
  jsonb_build_object('en', 'From color temperature and IP ratings to anti-fog and dimming, here is how to specify an LED bathroom mirror that buyers love and that passes inspection.'),
  jsonb_build_object('en', E'## Start with light quality\n\nThe single biggest factor in how an LED mirror feels is color temperature, measured in Kelvin (K). For bathrooms and vanity use, 4000K to 5000K reads as clean daylight and renders skin tones accurately for makeup and shaving. Warmer 3000K light looks cozy but can distort color. Look for a CRI (color rendering index) of 90 or higher.\n\n## Match the size to the vanity\n\nAs a rule of thumb, a mirror should be a few inches narrower than the vanity or sink it sits above. For double vanities, two separate mirrors often look more intentional than one oversized sheet. Confirm mounting height so the light band sits near eye level.\n\n## The features that matter\n\n- Anti-fog demister pads that keep the glass clear after a hot shower\n- Touch or motion sensor switches rated for damp rooms\n- Dimming and color-temperature adjustment for flexible ambiance\n- Built-in defogger, clock, or Bluetooth audio on premium lines\n\n## Do not skip the ratings\n\nBathroom mirrors must tolerate moisture. Specify an IP44 rating or better for zones near water, and require CE and RoHS documentation for any unit sold in Europe. Reputable manufacturers test lighting components to IP66 and provide certificates on request.\n\n## Work with a manufacturer, not a reseller\n\nBuying directly from the factory means control over size, frame, lighting, and packaging, plus consistent quality across reorders. Explore the BOLEN catalog or request a quote to specify a mirror to your exact requirements.'),
  now()
),
(
  'anti-fog-mirror-technology-explained',
  'published',
  'Technology',
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory3.jpg',
  'BOLEN Editorial',
  4,
  jsonb_build_object('en', 'Anti-Fog Mirror Technology Explained: Demister Pads vs. Coatings'),
  jsonb_build_object('en', 'Why mirrors fog, how heated demister pads and surface coatings each solve it, and which approach to specify for bathrooms, hotels, and spas.'),
  jsonb_build_object('en', E'## Why mirrors fog\n\nFog forms when warm, humid air meets the cooler surface of the glass and condenses into tiny droplets that scatter light. The fix is either to keep the glass warm enough to prevent condensation, or to change how water behaves on the surface.\n\n## Heated demister pads\n\nA demister pad is a thin heating film bonded to the back of the mirror. When powered, it gently warms the glass above the dew point so condensation never forms in the first place. Pads are the most reliable solution for steamy bathrooms because they work continuously and leave the entire mirror clear.\n\n- Even, fast clearing across the heated zone\n- Pairs naturally with LED mirrors that are already wired\n- Low power draw, typically activated with the light\n\n## Hydrophilic and hydrophobic coatings\n\nCoatings change the contact angle of water. Hydrophilic coatings spread droplets into a thin, transparent sheet, while hydrophobic coatings make water bead and run off. Coatings need no power, but their performance can fade over years of cleaning.\n\n## Which to choose\n\nFor hotels, spas, and premium residential bathrooms, a heated demister pad is the dependable specification. For budget lines or low-humidity spaces, a coating may be enough. BOLEN integrates demister pads directly into its LED mirror production, tested for safe operation in damp environments.'),
  now()
),
(
  'oem-vs-odm-mirror-manufacturing',
  'published',
  'Manufacturing',
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/building.jpg',
  'BOLEN Editorial',
  4,
  jsonb_build_object('en', 'OEM vs. ODM Mirror Manufacturing: What Importers Need to Know'),
  jsonb_build_object('en', 'OEM and ODM are two ways to work with a mirror factory. Here is how they differ in cost, speed, and control, and how to decide which fits your brand.'),
  jsonb_build_object('en', E'## Two models, one factory\n\nOEM and ODM describe two ways of working with a manufacturer. Understanding the difference helps importers and brands control cost, speed, and differentiation.\n\n## OEM: your design, our production\n\nIn an OEM (original equipment manufacturer) arrangement, you bring the design and specifications and the factory builds to them. This suits brands that already have engineering and want full control of the product, with the manufacturer providing capacity, quality systems, and compliance.\n\n## ODM: our design, your brand\n\nIn an ODM (original design manufacturer) arrangement, you select from designs the factory has already developed and apply your branding. This is faster and lower risk because tooling and testing already exist. It is ideal for retailers expanding a catalog without an in-house design team.\n\n## How to decide\n\n- Choose OEM when differentiation and IP ownership matter most\n- Choose ODM when speed to market and lower upfront cost matter most\n- Many buyers blend both: an ODM base with OEM customizations\n\n## What to confirm before you commit\n\nAsk about minimum order quantities, certification coverage (CE, RoHS, IP ratings), lead times, and whether the factory owns its production end to end. Vertical integration usually means tighter quality and fewer delays. To discuss an OEM or ODM program, request a quote from BOLEN.'),
  now()
)
on conflict (slug) do nothing;
