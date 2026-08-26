-- Store only the redacted AI transcript produced by the Cloudflare Worker.
-- Contact details, request headers, IP addresses, user agents, and raw request
-- bodies must never be written to these tables.

begin;

set local lock_timeout = '5s';

-- Keep the authorization helper outside the exposed public schema. This is
-- self-contained because the older hardening migration has not been recorded
-- in the live project's migration history.
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

revoke all on function app_private.is_admin() from public, anon, authenticated;
grant execute on function app_private.is_admin() to authenticated;

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  language text not null,
  page_path text not null,
  page_title text,
  status text not null default 'active',
  message_count integer not null default 0,
  pii_redacted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  retention_expires_at timestamptz not null default (now() + interval '90 days'),
  constraint ai_conversations_session_id_format_check
    check (session_id ~ '^[A-Za-z0-9_-]{12,128}$'),
  constraint ai_conversations_language_check
    check (language in ('en', 'zh', 'es', 'fr', 'de', 'it')),
  constraint ai_conversations_page_path_check
    check (
      char_length(page_path) between 1 and 300
      and left(page_path, 1) = '/'
      and position('?' in page_path) = 0
      and position('#' in page_path) = 0
      and position(chr(92) in page_path) = 0
    ),
  constraint ai_conversations_page_title_length_check
    check (page_title is null or char_length(page_title) between 1 and 200),
  constraint ai_conversations_status_check
    check (status in ('active', 'qualified', 'closed', 'archived')),
  constraint ai_conversations_message_count_check
    check (message_count >= 0 and message_count <= 2000),
  constraint ai_conversations_redacted_check
    check (pii_redacted),
  constraint ai_conversations_time_order_check
    check (
      retention_expires_at >= last_message_at
      and retention_expires_at <= last_message_at + interval '90 days'
    )
);

create unique index if not exists ai_conversations_session_id_uidx
  on public.ai_conversations (session_id);

create index if not exists ai_conversations_last_message_at_idx
  on public.ai_conversations (last_message_at desc);

create index if not exists ai_conversations_retention_expires_at_idx
  on public.ai_conversations (retention_expires_at);

create table if not exists public.ai_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null
    references public.ai_conversations (id)
    on update restrict
    on delete cascade,
  turn_id uuid not null,
  sequence_no integer not null,
  role text not null,
  content text not null,
  pii_redacted boolean not null default true,
  created_at timestamptz not null default now(),
  constraint ai_messages_sequence_no_check
    check (sequence_no > 0 and sequence_no <= 2000),
  constraint ai_messages_role_check
    check (role in ('user', 'assistant')),
  constraint ai_messages_content_length_check
    check (char_length(btrim(content)) between 1 and 1800),
  constraint ai_messages_redacted_check
    check (pii_redacted),
  constraint ai_messages_conversation_turn_role_unique
    unique (conversation_id, turn_id, role),
  constraint ai_messages_conversation_sequence_unique
    unique (conversation_id, sequence_no)
);

create index if not exists ai_messages_conversation_sequence_idx
  on public.ai_messages (conversation_id, sequence_no);

alter table public.ai_conversations enable row level security;
alter table public.ai_conversations force row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_messages force row level security;

-- Supabase's 2026 Data API defaults require explicit grants. The Worker writes
-- with a server-only service-role/secret key. Browser clients get no write
-- grant, and only authenticated administrators can read rows through RLS.
revoke all privileges on table public.ai_conversations
  from public, anon, authenticated, service_role;
revoke all privileges on table public.ai_messages
  from public, anon, authenticated, service_role;
revoke all privileges on sequence public.ai_messages_id_seq
  from public, anon, authenticated, service_role;

grant select, insert, update, delete on table public.ai_conversations
  to service_role;
grant select, insert, update, delete on table public.ai_messages
  to service_role;
grant usage, select on sequence public.ai_messages_id_seq
  to service_role;

grant select on table public.ai_conversations to authenticated;
grant select on table public.ai_messages to authenticated;

drop policy if exists "ai conversations admin read" on public.ai_conversations;
create policy "ai conversations admin read"
  on public.ai_conversations for select
  to authenticated
  using (
    retention_expires_at > now()
    and (select app_private.is_admin())
  );

drop policy if exists "ai messages admin read" on public.ai_messages;
create policy "ai messages admin read"
  on public.ai_messages for select
  to authenticated
  using (
    (select app_private.is_admin())
    and exists (
      select 1
      from public.ai_conversations conversation
      where conversation.id = ai_messages.conversation_id
        and conversation.retention_expires_at > now()
    )
  );

commit;
