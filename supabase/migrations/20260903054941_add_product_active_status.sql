begin;

-- Existing products stay published. Editors can explicitly deactivate a row
-- without deleting it, which also preserves historical RFQ relationships.
alter table public.products
  add column if not exists is_active boolean not null default true;

comment on column public.products.is_active is
  'Controls whether a product is visible and addressable on the public website.';

-- Remove every known legacy public-read policy before replacing it. Multiple
-- permissive SELECT policies are ORed together, so leaving any USING (true)
-- policy in place would still expose inactive products through the Data API.
drop policy if exists "Enable read access for all users" on public.products;
drop policy if exists "Products are viewable by everyone" on public.products;
drop policy if exists "Public can view products" on public.products;
drop policy if exists "products public read" on public.products;
drop policy if exists "products public read active" on public.products;
drop policy if exists "products staff read all" on public.products;
drop policy if exists "products anon visibility gate" on public.products;
drop policy if exists "products authenticated visibility gate" on public.products;

create policy "products public read active"
  on public.products for select
  to anon, authenticated
  using (is_active);

-- UPDATE requires SELECT under RLS. Approved staff therefore retain access to
-- inactive rows so they can edit or reactivate them in the admin portal.
create policy "products staff read all"
  on public.products for select
  to authenticated
  using ((select public.is_staff()));

-- Restrictive gates keep the lifecycle rule intact even if an older permissive
-- USING (true) policy is accidentally restored later. Staff can still access
-- inactive rows through the authenticated gate.
create policy "products anon visibility gate"
  on public.products as restrictive for select
  to anon
  using (is_active);

create policy "products authenticated visibility gate"
  on public.products as restrictive for select
  to authenticated
  using (is_active or (select public.is_staff()));

-- Matches the public catalog query: active rows ordered newest-first.
create index if not exists products_active_created_at_idx
  on public.products (created_at desc)
  where is_active;

commit;
