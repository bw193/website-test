-- ============================================================================
-- BOLEN Videos - videos table + product-videos storage bucket
-- Run in the Supabase SQL Editor.
--
-- Localizable fields are per-language JSONB maps ({"en": "...", "zh": "..."}).
-- English is required by the admin UI and is the fallback on the website.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.videos (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  source_type      text not null default 'embed' check (source_type in ('embed', 'upload', 'direct')),
  video_url        text,
  embed_url        text,
  thumbnail_url    text,
  category         text,
  tags             text[],
  duration_seconds int,
  title            jsonb not null default '{}'::jsonb,
  excerpt          jsonb default '{}'::jsonb,
  body             jsonb default '{}'::jsonb,
  seo_title        jsonb default '{}'::jsonb,
  seo_description  jsonb default '{}'::jsonb,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists videos_status_idx on public.videos (status);
create index if not exists videos_published_at_idx on public.videos (published_at desc);
create index if not exists videos_slug_idx on public.videos (slug);
create index if not exists videos_category_idx on public.videos (category);
create index if not exists videos_tags_gin_idx on public.videos using gin (tags);

grant usage on schema public to anon, authenticated;
grant select on public.videos to anon, authenticated;
grant insert, update, delete on public.videos to authenticated;

alter table public.videos enable row level security;

drop policy if exists "videos public read published" on public.videos;
drop policy if exists "videos read published or staff" on public.videos;
create policy "videos read published or staff"
  on public.videos for select
  to anon, authenticated
  using (status = 'published' or (select public.is_staff()));

drop policy if exists "videos staff manage" on public.videos;
drop policy if exists "videos staff insert" on public.videos;
create policy "videos staff insert"
  on public.videos for insert
  to authenticated
  with check ((select public.is_staff()));

drop policy if exists "videos staff update" on public.videos;
create policy "videos staff update"
  on public.videos for update
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

drop policy if exists "videos staff delete" on public.videos;
create policy "videos staff delete"
  on public.videos for delete
  to authenticated
  using ((select public.is_staff()));

create or replace function public.set_videos_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
  before update on public.videos
  for each row execute function public.set_videos_updated_at();

-- Storage bucket for MP4/WebM uploads and thumbnail images. The global Storage
-- file size limit in Storage > Settings must also be above the video size; it
-- takes precedence over this per-bucket 500MB limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-videos',
  'product-videos',
  true,
  524288000,
  array[
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve objects by URL without a broad SELECT policy. Keep
-- listing private while allowing staff to upload/update/delete through Storage.
drop policy if exists "product_videos public read" on storage.objects;

drop policy if exists "product_videos staff insert" on storage.objects;
create policy "product_videos staff insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-videos' and (select public.is_staff()));

drop policy if exists "product_videos staff update" on storage.objects;
create policy "product_videos staff update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-videos' and (select public.is_staff()))
  with check (bucket_id = 'product-videos' and (select public.is_staff()));

drop policy if exists "product_videos staff delete" on storage.objects;
create policy "product_videos staff delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-videos' and (select public.is_staff()));
