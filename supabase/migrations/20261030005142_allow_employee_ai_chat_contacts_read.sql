-- Approved employees can read the same unexpired follow-up contacts as admins.
-- Contact writes remain restricted to the server-side Worker.

begin;

set local lock_timeout = '5s';

create policy "ai chat contacts employee read"
  on public.ai_chat_contacts for select
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

commit;
