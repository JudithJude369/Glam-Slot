-- GlamSlot: key the owner allowlist on the Supabase auth user id instead of the
-- email claim.
--
-- Reason: auth.uid() is the subject claim of the verified JWT and never changes
-- for an account. The email claim changes when the owner changes their address,
-- which would silently lock them out of the dashboard.
--
-- The email is not kept as a column. The dashboard can show the signed-in
-- address from the session claims, so there is no second copy to drift.

-- The policies go first. "owner claims the owner email" reads the email column
-- directly, so Postgres refuses to drop the column while that policy exists.

drop policy if exists "owner reads the owner email" on public.salon_owner;
drop policy if exists "owner claims the owner email" on public.salon_owner;
drop policy if exists "owner updates the owner email" on public.salon_owner;
drop policy if exists "owner deletes the owner email" on public.salon_owner;

alter table public.salon_owner
  add column user_id uuid not null unique,
  drop column email;

create or replace function private.is_salon_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.salon_owner
    where salon_owner.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_salon_owner() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_salon_owner() to authenticated;

create policy "owner reads the owner row"
  on public.salon_owner for select
  to authenticated
  using ((select private.is_salon_owner()));

-- Compared with the verified subject directly rather than through
-- private.is_salon_owner(). The function reads salon_owner, and a row being
-- inserted is not visible to the same command that inserts it.
create policy "owner claims the owner row"
  on public.salon_owner for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "owner updates the owner row"
  on public.salon_owner for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes the owner row"
  on public.salon_owner for delete
  to authenticated
  using ((select private.is_salon_owner()));