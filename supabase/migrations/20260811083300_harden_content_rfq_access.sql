-- Security-only migration for the existing BOLEN schema.
--
-- Invariants:
--   * no INSERT/UPDATE/DELETE is issued against existing application rows;
--   * products, blog posts, videos, and RFQs cannot be hard-deleted/truncated;
--   * public RFQ submissions remain append-only and must enter as status=new;
--   * public Storage buckets remain publicly readable by object URL, while
--     mutations are limited to approved staff and object deletion is disabled.
--
-- This file is intentionally not applied automatically. Test it in a disposable
-- branch/local database with anon, pending, employee, and admin sessions first.

begin;

-- ---------------------------------------------------------------------------
-- Private authorization helpers
-- ---------------------------------------------------------------------------

create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    coalesce((select auth.jwt() ->> 'email') = 'wubanglun@gmail.com', false)
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    );
$$;

create or replace function app_private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    coalesce((select auth.jwt() ->> 'email') = 'wubanglun@gmail.com', false)
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role in ('admin', 'employee')
    );
$$;

create or replace function app_private.prevent_protected_hard_delete()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception using
    errcode = '42501',
    message = format(
      'Hard deletion is disabled for protected table %I.%I; use a reversible lifecycle action instead.',
      tg_table_schema,
      tg_table_name
    );
  return null;
end;
$$;

revoke all on function app_private.is_admin() from public, anon, authenticated;
revoke all on function app_private.is_staff() from public, anon, authenticated;
revoke all on function app_private.prevent_protected_hard_delete() from public, anon, authenticated;
grant execute on function app_private.is_admin() to authenticated;
grant execute on function app_private.is_staff() to authenticated;

-- Preserve compatibility for any existing code that calls public.is_admin()
-- or public.is_staff(), but make the exposed wrappers security-invoker and
-- unavailable to anonymous callers.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select app_private.is_admin();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select app_private.is_staff();
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_staff() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- Trigger functions do not need to be callable through the Data API.
alter function public.handle_new_user() set search_path = pg_catalog;
alter function public.set_blog_posts_updated_at() set search_path = pg_catalog;
alter function public.set_videos_updated_at() set search_path = pg_catalog;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_blog_posts_updated_at() from public, anon, authenticated;
revoke all on function public.set_videos_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Profiles: no anonymous directory, no self-service role escalation
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Staff can view all profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Staff can update profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "profiles users insert pending" on public.profiles;
drop policy if exists "profiles users read own" on public.profiles;
drop policy if exists "profiles admins read all" on public.profiles;
drop policy if exists "profiles admins update roles" on public.profiles;

revoke all privileges on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, email, role) on table public.profiles to authenticated;
grant update (role) on table public.profiles to authenticated;

create policy "profiles users insert pending"
  on public.profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    and role = 'pending'
    and email = (select auth.jwt() ->> 'email')
  );

create policy "profiles users read own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles admins read all"
  on public.profiles for select
  to authenticated
  using ((select app_private.is_admin()));

create policy "profiles admins update roles"
  on public.profiles for update
  to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- ---------------------------------------------------------------------------
-- Products: public read, staff insert/update, never hard-delete
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;

drop policy if exists "Admins can manage products" on public.products;
drop policy if exists "Staff can manage products" on public.products;
drop policy if exists "Enable delete for admins" on public.products;
drop policy if exists "Enable insert for admins" on public.products;
drop policy if exists "Enable read access for all users" on public.products;
drop policy if exists "Products are viewable by everyone" on public.products;
drop policy if exists "Public can view products" on public.products;
drop policy if exists "Enable update for admins" on public.products;
drop policy if exists "products public read" on public.products;
drop policy if exists "products staff insert" on public.products;
drop policy if exists "products staff update" on public.products;

revoke all privileges on table public.products from public, anon, authenticated;
grant select on table public.products to anon, authenticated;
grant insert, update on table public.products to authenticated;

create policy "products public read"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "products staff insert"
  on public.products for insert
  to authenticated
  with check ((select app_private.is_staff()));

create policy "products staff update"
  on public.products for update
  to authenticated
  using ((select app_private.is_staff()))
  with check ((select app_private.is_staff()));

drop trigger if exists products_block_hard_delete on public.products;
create trigger products_block_hard_delete
  before delete or truncate on public.products
  for each statement execute function app_private.prevent_protected_hard_delete();

-- ---------------------------------------------------------------------------
-- Insights/blog: published public read, staff insert/update, no hard-delete
-- ---------------------------------------------------------------------------

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts public read published" on public.blog_posts;
drop policy if exists "blog_posts authenticated all" on public.blog_posts;
drop policy if exists "blog_posts staff read" on public.blog_posts;
drop policy if exists "blog_posts staff insert" on public.blog_posts;
drop policy if exists "blog_posts staff update" on public.blog_posts;

revoke all privileges on table public.blog_posts from public, anon, authenticated;
grant select on table public.blog_posts to anon, authenticated;
grant insert, update on table public.blog_posts to authenticated;

create policy "blog_posts public read published"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'published');

create policy "blog_posts staff read"
  on public.blog_posts for select
  to authenticated
  using ((select app_private.is_staff()));

create policy "blog_posts staff insert"
  on public.blog_posts for insert
  to authenticated
  with check ((select app_private.is_staff()));

create policy "blog_posts staff update"
  on public.blog_posts for update
  to authenticated
  using ((select app_private.is_staff()))
  with check ((select app_private.is_staff()));

drop trigger if exists blog_posts_block_hard_delete on public.blog_posts;
create trigger blog_posts_block_hard_delete
  before delete or truncate on public.blog_posts
  for each statement execute function app_private.prevent_protected_hard_delete();

-- ---------------------------------------------------------------------------
-- Videos: published public read, staff insert/update, no hard-delete
-- ---------------------------------------------------------------------------

alter table public.videos enable row level security;

drop policy if exists "videos public read published" on public.videos;
drop policy if exists "videos read published or staff" on public.videos;
drop policy if exists "videos staff manage" on public.videos;
drop policy if exists "videos staff insert" on public.videos;
drop policy if exists "videos staff update" on public.videos;
drop policy if exists "videos staff delete" on public.videos;
drop policy if exists "videos staff read" on public.videos;

revoke all privileges on table public.videos from public, anon, authenticated;
grant select on table public.videos to anon, authenticated;
grant insert, update on table public.videos to authenticated;

create policy "videos public read published"
  on public.videos for select
  to anon, authenticated
  using (status = 'published');

create policy "videos staff read"
  on public.videos for select
  to authenticated
  using ((select app_private.is_staff()));

create policy "videos staff insert"
  on public.videos for insert
  to authenticated
  with check ((select app_private.is_staff()));

create policy "videos staff update"
  on public.videos for update
  to authenticated
  using ((select app_private.is_staff()))
  with check ((select app_private.is_staff()));

drop trigger if exists videos_block_hard_delete on public.videos;
create trigger videos_block_hard_delete
  before delete or truncate on public.videos
  for each statement execute function app_private.prevent_protected_hard_delete();

-- ---------------------------------------------------------------------------
-- Site settings: public read, approved staff insert/update, no delete
-- ---------------------------------------------------------------------------

alter table public.site_settings enable row level security;

drop policy if exists "Allow public read access" on public.site_settings;
drop policy if exists "Allow admin write access" on public.site_settings;
drop policy if exists "site_settings public read" on public.site_settings;
drop policy if exists "site_settings staff insert" on public.site_settings;
drop policy if exists "site_settings staff update" on public.site_settings;

revoke all privileges on table public.site_settings from public, anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant insert, update on table public.site_settings to authenticated;

create policy "site_settings public read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings staff insert"
  on public.site_settings for insert
  to authenticated
  with check ((select app_private.is_staff()));

create policy "site_settings staff update"
  on public.site_settings for update
  to authenticated
  using ((select app_private.is_staff()))
  with check ((select app_private.is_staff()));

-- ---------------------------------------------------------------------------
-- RFQs: public may append only validated status=new rows; staff may read and
-- change lifecycle status, but nobody using the Data API may delete records.
-- ---------------------------------------------------------------------------

alter table public.rfqs enable row level security;
alter table public.rfqs alter column status set default 'new';

drop policy if exists "Staff can manage rfqs" on public.rfqs;
drop policy if exists "Enable delete for admins" on public.rfqs;
drop policy if exists "Anyone can submit RFQs" on public.rfqs;
drop policy if exists "Enable insert for public" on public.rfqs;
drop policy if exists "Public can submit rfqs" on public.rfqs;
drop policy if exists "Admins can view RFQs" on public.rfqs;
drop policy if exists "Enable read for admins" on public.rfqs;
drop policy if exists "Enable update for admins" on public.rfqs;
drop policy if exists "rfqs public append new" on public.rfqs;
drop policy if exists "rfqs staff read" on public.rfqs;
drop policy if exists "rfqs staff update status" on public.rfqs;

revoke all privileges on table public.rfqs from public, anon, authenticated;
grant insert (
  product_id,
  product_name,
  customer_name,
  customer_email,
  message
) on table public.rfqs to anon, authenticated;
grant select on table public.rfqs to authenticated;
grant update (status) on table public.rfqs to authenticated;

create policy "rfqs public append new"
  on public.rfqs for insert
  to anon, authenticated
  with check (
    status = 'new'
    and char_length(btrim(customer_name)) between 1 and 200
    and char_length(btrim(customer_email)) between 3 and 320
    and position('@' in customer_email) > 1
    and char_length(btrim(coalesce(product_name, ''))) between 1 and 500
    and char_length(btrim(coalesce(message, ''))) between 1 and 10000
  );

create policy "rfqs staff read"
  on public.rfqs for select
  to authenticated
  using ((select app_private.is_staff()));

create policy "rfqs staff update status"
  on public.rfqs for update
  to authenticated
  using ((select app_private.is_staff()))
  with check (
    (select app_private.is_staff())
    and status in ('new', 'read', 'archived')
  );

drop trigger if exists rfqs_block_hard_delete on public.rfqs;
create trigger rfqs_block_hard_delete
  before delete or truncate on public.rfqs
  for each statement execute function app_private.prevent_protected_hard_delete();

-- ---------------------------------------------------------------------------
-- Storage: public buckets remain readable by object URL. Only staff may list
-- metadata/upload/update the two managed buckets. No client-side hard delete.
-- ---------------------------------------------------------------------------

drop policy if exists "Admin Delete" on storage.objects;
drop policy if exists "Admin Upload" on storage.objects;
drop policy if exists "Admin Update" on storage.objects;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "insert 16wiy3a_0" on storage.objects;
drop policy if exists "insert 16wiy3a_1" on storage.objects;
drop policy if exists "insert 16wiy3a_2" on storage.objects;
drop policy if exists "insert 16wiy3a_3" on storage.objects;
drop policy if exists "product_videos public read" on storage.objects;
drop policy if exists "product_videos staff insert" on storage.objects;
drop policy if exists "product_videos staff update" on storage.objects;
drop policy if exists "product_videos staff delete" on storage.objects;
drop policy if exists "product_images staff select" on storage.objects;
drop policy if exists "product_images staff insert" on storage.objects;
drop policy if exists "product_images staff update" on storage.objects;
drop policy if exists "product_videos staff select" on storage.objects;

revoke delete, truncate, references, trigger
  on table storage.objects
  from public, anon, authenticated;

create policy "product_images staff select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select app_private.is_staff())
  );

create policy "product_images staff insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (select app_private.is_staff())
  );

create policy "product_images staff update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select app_private.is_staff())
  )
  with check (
    bucket_id = 'product-images'
    and (select app_private.is_staff())
  );

create policy "product_videos staff select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'product-videos'
    and (select app_private.is_staff())
  );

create policy "product_videos staff insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-videos'
    and (select app_private.is_staff())
  );

create policy "product_videos staff update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-videos'
    and (select app_private.is_staff())
  )
  with check (
    bucket_id = 'product-videos'
    and (select app_private.is_staff())
  );

-- Fail the migration rather than silently leave an unknown destructive policy.
do $migration_guard$
begin
  if exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename in ('products', 'blog_posts', 'videos', 'rfqs')
      and cmd in ('ALL', 'DELETE')
  ) then
    raise exception 'A protected public table still has an ALL or DELETE policy';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'DELETE'
  ) then
    raise exception 'storage.objects still has a DELETE policy';
  end if;
end;
$migration_guard$;

commit;
