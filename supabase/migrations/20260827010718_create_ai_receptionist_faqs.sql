-- Administrator-managed, multilingual FAQ knowledge for the AI receptionist.

begin;

set local lock_timeout = '5s';

-- PostgreSQL check constraints cannot contain subqueries. Keep validation for
-- individual array entries in a small immutable helper outside public.
create function app_private.ai_receptionist_trigger_phrases_are_valid(phrases text[])
returns boolean
language sql
immutable
strict
parallel safe
set search_path = pg_catalog
as $$
  select
    cardinality(phrases) between 1 and 20
    and array_ndims(phrases) = 1
    and not exists (
      select 1
      from unnest(phrases) as item(phrase)
      where phrase is null
        or phrase <> btrim(phrase)
        or char_length(phrase) not between 2 and 160
    );
$$;

revoke all on function app_private.ai_receptionist_trigger_phrases_are_valid(text[])
  from public, anon, authenticated, service_role;
grant usage on schema app_private to authenticated;
grant execute on function app_private.ai_receptionist_trigger_phrases_are_valid(text[])
  to authenticated;

create table public.ai_receptionist_faqs (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  trigger_phrases text[] not null,
  answer_en text not null,
  answer_zh text,
  answer_es text,
  answer_fr text,
  answer_de text,
  answer_it text,
  is_active boolean not null default true,
  priority smallint not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_receptionist_faqs_topic_check
    check (topic = btrim(topic) and char_length(topic) between 1 and 80),
  constraint ai_receptionist_faqs_trigger_phrases_check
    check (app_private.ai_receptionist_trigger_phrases_are_valid(trigger_phrases)),
  constraint ai_receptionist_faqs_answer_en_check
    check (answer_en = btrim(answer_en) and char_length(answer_en) between 1 and 1200),
  constraint ai_receptionist_faqs_answer_zh_check
    check (
      answer_zh is null
      or (answer_zh = btrim(answer_zh) and char_length(answer_zh) between 1 and 1200)
    ),
  constraint ai_receptionist_faqs_answer_es_check
    check (
      answer_es is null
      or (answer_es = btrim(answer_es) and char_length(answer_es) between 1 and 1200)
    ),
  constraint ai_receptionist_faqs_answer_fr_check
    check (
      answer_fr is null
      or (answer_fr = btrim(answer_fr) and char_length(answer_fr) between 1 and 1200)
    ),
  constraint ai_receptionist_faqs_answer_de_check
    check (
      answer_de is null
      or (answer_de = btrim(answer_de) and char_length(answer_de) between 1 and 1200)
    ),
  constraint ai_receptionist_faqs_answer_it_check
    check (
      answer_it is null
      or (answer_it = btrim(answer_it) and char_length(answer_it) between 1 and 1200)
    ),
  constraint ai_receptionist_faqs_priority_check
    check (priority between 1 and 1000)
);

create index ai_receptionist_faqs_active_priority_idx
  on public.ai_receptionist_faqs (is_active, priority);

alter table public.ai_receptionist_faqs enable row level security;
alter table public.ai_receptionist_faqs force row level security;

revoke all privileges on table public.ai_receptionist_faqs
  from public, anon, authenticated, service_role;

-- The Worker only reads approved answers. Keep write authority in the
-- authenticated admin policies instead of granting backend-wide mutation.
grant select on table public.ai_receptionist_faqs
  to service_role;
grant select, insert, update, delete on table public.ai_receptionist_faqs
  to authenticated;

create policy "ai receptionist faqs admin read"
  on public.ai_receptionist_faqs for select
  to authenticated
  using ((select app_private.is_admin()));

create policy "ai receptionist faqs admin insert"
  on public.ai_receptionist_faqs for insert
  to authenticated
  with check ((select app_private.is_admin()));

create policy "ai receptionist faqs admin update"
  on public.ai_receptionist_faqs for update
  to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

create policy "ai receptionist faqs admin delete"
  on public.ai_receptionist_faqs for delete
  to authenticated
  using ((select app_private.is_admin()));

commit;
