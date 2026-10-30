-- Approved employees share read-only access to redacted AI transcripts.
-- Keep administrator policies, contact-email access, and Worker writes intact.

begin;

set local lock_timeout = '5s';

create policy "ai conversations employee read"
  on public.ai_conversations for select
  to authenticated
  using (
    retention_expires_at > now()
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'employee'
    )
  );

create policy "ai messages employee read"
  on public.ai_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'employee'
    )
    and exists (
      select 1
      from public.ai_conversations conversation
      where conversation.id = ai_messages.conversation_id
        and conversation.retention_expires_at > now()
    )
  );

commit;
