-- Admin-controlled receptionist guidance and an email gate for follow-up AI turns.
-- Email addresses are deliberately stored separately from the redacted transcript.

begin;

set local lock_timeout = '5s';

create table public.ai_receptionist_settings (
  id smallint primary key default 1,
  reply_guidance text not null default '',
  tone text not null default 'concise',
  answer_length text not null default 'short',
  email_gate_enabled boolean not null default true,
  free_turns smallint not null default 1,
  max_turns smallint not null default 5,
  updated_at timestamptz not null default now(),
  constraint ai_receptionist_settings_singleton_check check (id = 1),
  constraint ai_receptionist_settings_guidance_length_check
    check (char_length(reply_guidance) <= 1200),
  constraint ai_receptionist_settings_tone_check
    check (tone in ('concise', 'consultative', 'technical')),
  constraint ai_receptionist_settings_answer_length_check
    check (answer_length in ('short', 'medium')),
  constraint ai_receptionist_settings_free_turns_check
    check (free_turns between 1 and 3),
  constraint ai_receptionist_settings_max_turns_check
    check (max_turns between 2 and 10 and max_turns >= free_turns)
);

insert into public.ai_receptionist_settings (id)
values (1)
on conflict (id) do nothing;

create table public.ai_chat_contacts (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique
    references public.ai_conversations (id)
    on update restrict
    on delete cascade,
  email text not null,
  consent_version text not null default 'ai-chat-email-gate-v1',
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  retention_expires_at timestamptz not null,
  constraint ai_chat_contacts_email_normalized_check
    check (email = lower(btrim(email))),
  constraint ai_chat_contacts_email_length_check
    check (char_length(email) between 3 and 254),
  constraint ai_chat_contacts_email_format_check
    check (email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  constraint ai_chat_contacts_consent_version_check
    check (consent_version = 'ai-chat-email-gate-v1'),
  constraint ai_chat_contacts_retention_check
    check (
      retention_expires_at >= created_at
      and retention_expires_at <= created_at + interval '90 days'
    )
);

create index ai_chat_contacts_email_idx
  on public.ai_chat_contacts (email);

create index ai_chat_contacts_retention_expires_at_idx
  on public.ai_chat_contacts (retention_expires_at);

alter table public.ai_receptionist_settings enable row level security;
alter table public.ai_receptionist_settings force row level security;
alter table public.ai_chat_contacts enable row level security;
alter table public.ai_chat_contacts force row level security;

-- Explicit grants are required by Supabase's 2026 Data API defaults. The
-- browser may never write contact rows; only the Worker service secret can.
revoke all privileges on table public.ai_receptionist_settings
  from public, anon, authenticated, service_role;
revoke all privileges on table public.ai_chat_contacts
  from public, anon, authenticated, service_role;

grant select, insert, update, delete on table public.ai_receptionist_settings
  to service_role;
grant select, insert, update, delete on table public.ai_chat_contacts
  to service_role;

grant select, insert, update on table public.ai_receptionist_settings
  to authenticated;
grant select on table public.ai_chat_contacts
  to authenticated;

create policy "ai receptionist settings admin read"
  on public.ai_receptionist_settings for select
  to authenticated
  using ((select app_private.is_admin()));

create policy "ai receptionist settings admin insert"
  on public.ai_receptionist_settings for insert
  to authenticated
  with check (id = 1 and (select app_private.is_admin()));

create policy "ai receptionist settings admin update"
  on public.ai_receptionist_settings for update
  to authenticated
  using (id = 1 and (select app_private.is_admin()))
  with check (id = 1 and (select app_private.is_admin()));

create policy "ai chat contacts admin read"
  on public.ai_chat_contacts for select
  to authenticated
  using (
    retention_expires_at > now()
    and (select app_private.is_admin())
  );

commit;
