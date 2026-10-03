-- GlamSlot: row level security on every table in the public schema.
--
-- Rules, from context/architecture.md:
--   - The owner reads and writes the salon's data.
--   - The anon role reads only public data: salon details, active services,
--     active staff, opening hours.
--   - Customers never query tables directly. Their actions go through server
--     routes using the admin client after the token is validated.
--
-- A table in an exposed schema gets every privilege granted to anon and
-- authenticated automatically, and adding policies does not take those grants
-- back. So each table below revokes first and is then granted only what its
-- app needs, and each policy is written per operation with a named role.
-- https://supabase.com/docs/guides/database/postgres/row-level-security

-- Same reason, for tables added later: do not hand the client roles every
-- privilege by default and rely on policies to take it back.
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- The owner is the signed-in user whose JWT email matches public.salon_owner.
-- Read here as a security definer function so the check does not re-enter RLS
-- on salon_owner, and so the result is cached once per statement.
create function private.is_salon_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.salon_owner
    where lower(salon_owner.email) = lower((select auth.jwt() ->> 'email'))
  );
$$;

revoke execute on function private.is_salon_owner() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_salon_owner() to authenticated;

-- public.salon_settings: the salon details the Landing and About pages show.

alter table public.salon_settings enable row level security;

revoke all on table public.salon_settings from anon, authenticated;
grant select on table public.salon_settings to anon, authenticated;
grant insert, update, delete on table public.salon_settings to authenticated;

create policy "salon settings are public"
  on public.salon_settings for select
  to anon, authenticated
  using (true);

create policy "owner inserts salon settings"
  on public.salon_settings for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates salon settings"
  on public.salon_settings for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes salon settings"
  on public.salon_settings for delete
  to authenticated
  using ((select private.is_salon_owner()));

-- public.salon_owner: who is allowed to be the owner. Never public.

alter table public.salon_owner enable row level security;

revoke all on table public.salon_owner from anon, authenticated;
grant select, insert, update, delete on table public.salon_owner to authenticated;

create policy "owner reads the owner email"
  on public.salon_owner for select
  to authenticated
  using ((select private.is_salon_owner()));

-- Compared with the JWT directly, not through private.is_salon_owner(). The
-- function would read salon_owner, and the row being inserted is not visible
-- to the same command that inserts it.
create policy "owner claims the owner email"
  on public.salon_owner for insert
  to authenticated
  with check (lower(email) = lower((select auth.jwt() ->> 'email')));

create policy "owner updates the owner email"
  on public.salon_owner for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes the owner email"
  on public.salon_owner for delete
  to authenticated
  using ((select private.is_salon_owner()));

-- public.services: the booking page lists active services. Only the owner sees
-- a deactivated one, and only the owner writes.

alter table public.services enable row level security;

revoke all on table public.services from anon, authenticated;
grant select on table public.services to anon, authenticated;
grant insert, update, delete on table public.services to authenticated;

create policy "active services are public"
  on public.services for select
  to anon, authenticated
  using (is_active);

create policy "owner reads every service"
  on public.services for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner creates a service"
  on public.services for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates a service"
  on public.services for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes a service"
  on public.services for delete
  to authenticated
  using ((select private.is_salon_owner()));

-- public.staff: the booking page lists active staff, the About page the team.

alter table public.staff enable row level security;

revoke all on table public.staff from anon, authenticated;
grant select on table public.staff to anon, authenticated;
grant insert, update, delete on table public.staff to authenticated;

create policy "active staff are public"
  on public.staff for select
  to anon, authenticated
  using (is_active);

create policy "owner reads every staff member"
  on public.staff for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner creates a staff member"
  on public.staff for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates a staff member"
  on public.staff for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes a staff member"
  on public.staff for delete
  to authenticated
  using ((select private.is_salon_owner()));

-- public.staff_services: which staff member does which service. Public only
-- while both sides are active, so an inactive row cannot be used to map a
-- hidden service to a visible staff member.

alter table public.staff_services enable row level security;

revoke all on table public.staff_services from anon, authenticated;
grant select on table public.staff_services to anon, authenticated;
grant insert, update, delete on table public.staff_services to authenticated;

create policy "active staff services are public"
  on public.staff_services for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = staff_services.staff_id and staff.is_active
    )
    and exists (
      select 1 from public.services
      where services.id = staff_services.service_id and services.is_active
    )
  );

create policy "owner reads every staff service"
  on public.staff_services for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner assigns a service to a staff member"
  on public.staff_services for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates a staff service"
  on public.staff_services for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner removes a staff service"
  on public.staff_services for delete
  to authenticated
  using ((select private.is_salon_owner()));

-- public.staff_hours: opening hours, public while the staff member is active.

alter table public.staff_hours enable row level security;

revoke all on table public.staff_hours from anon, authenticated;
grant select on table public.staff_hours to anon, authenticated;
grant insert, update, delete on table public.staff_hours to authenticated;

create policy "active staff hours are public"
  on public.staff_hours for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = staff_hours.staff_id and staff.is_active
    )
  );

create policy "owner reads every staff hour"
  on public.staff_hours for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner creates a staff hour"
  on public.staff_hours for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates a staff hour"
  on public.staff_hours for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes a staff hour"
  on public.staff_hours for delete
  to authenticated
  using ((select private.is_salon_owner()));

-- The four tables below are never public. The anon and authenticated roles get
-- no grant at all, so a request from a signed-out visitor stops with 42501
-- before any policy runs. A signed-in stranger holds the grant, so the owner
-- check in the policy is what stops them.

alter table public.bookings enable row level security;

revoke all on table public.bookings from anon, authenticated;
grant select, insert, update, delete on table public.bookings to authenticated;

create policy "owner reads bookings"
  on public.bookings for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner creates a booking"
  on public.bookings for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates a booking"
  on public.bookings for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes a booking"
  on public.bookings for delete
  to authenticated
  using ((select private.is_salon_owner()));

alter table public.payments enable row level security;

revoke all on table public.payments from anon, authenticated;
grant select, insert, update, delete on table public.payments to authenticated;

create policy "owner reads payments"
  on public.payments for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner creates a payment"
  on public.payments for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates a payment"
  on public.payments for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes a payment"
  on public.payments for delete
  to authenticated
  using ((select private.is_salon_owner()));

alter table public.reminders enable row level security;

revoke all on table public.reminders from anon, authenticated;
grant select, insert, update, delete on table public.reminders to authenticated;

create policy "owner reads reminders"
  on public.reminders for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner creates a reminder"
  on public.reminders for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates a reminder"
  on public.reminders for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes a reminder"
  on public.reminders for delete
  to authenticated
  using ((select private.is_salon_owner()));

alter table public.reminder_settings enable row level security;

revoke all on table public.reminder_settings from anon, authenticated;
grant select, insert, update, delete on public.reminder_settings to authenticated;

create policy "owner reads reminder settings"
  on public.reminder_settings for select
  to authenticated
  using ((select private.is_salon_owner()));

create policy "owner creates reminder settings"
  on public.reminder_settings for insert
  to authenticated
  with check ((select private.is_salon_owner()));

create policy "owner updates reminder settings"
  on public.reminder_settings for update
  to authenticated
  using ((select private.is_salon_owner()))
  with check ((select private.is_salon_owner()));

create policy "owner deletes reminder settings"
  on public.reminder_settings for delete
  to authenticated
  using ((select private.is_salon_owner()));