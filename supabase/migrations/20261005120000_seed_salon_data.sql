-- GlamSlot: the first real rows, so Phase 4 has something to read and edit.
--
-- The owner's decision, 2026-10-05: the initial content ships as a migration and
-- the Settings tabs edit it afterwards. So these rows are the starting point,
-- not the source of truth: every one of them is changed in Settings, and none of
-- them should be edited in this file again.
--
-- The numbers are placeholders the owner replaces. Prices are integer kobo,
-- which the schema check enforces, and the deposits are the 30% default from
-- context/project-overview.md.
--
-- Every insert carries a fixed id and ends in on conflict do nothing, so this
-- file is safe to run against a database that already holds the rows, including
-- one that was filled in through the Data API before the file was ever pushed.
-- Without it a second run would leave a second copy of every service.

-- context/project-overview.md: money is kobo, the currency is NGN and times
-- are shown in Africa/Lagos, so the seeded address and number are Nigerian too.
-- Both are placeholders. The number is the same obviously fake one the database
-- checks in tests/db/verify-db.ts use.
insert into public.salon_settings (
  id,
  name,
  address,
  whatsapp_phone,
  timezone,
  slot_interval_minutes,
  min_notice_hours,
  booking_window_days,
  cancel_cutoff_hours,
  hold_minutes
)
values (
  1,
  'GlamSlot',
  '14 Allen Avenue, Ikeja, Lagos',
  '+2348031234567',
  'Africa/Lagos',
  30,
  2,
  60,
  24,
  15
)
on conflict (id) do nothing;

-- The three reminders from context/project-overview.md, written out rather than
-- left to the column defaults so a change to a default cannot silently change
-- what a fresh salon gets.
insert into public.reminder_settings (
  id,
  confirmation_enabled,
  confirmation_offset_minutes,
  reminder_24h_enabled,
  reminder_24h_hours_before,
  reminder_2h_enabled,
  reminder_2h_hours_before
)
values (1, true, 0, true, 24, true, 2)
on conflict (id) do nothing;

-- description is left empty on purpose. The service descriptions in
-- lib/sample-content.ts are demo copy for the design, and wording is the
-- owner's to write in Settings.
insert into public.services (
  id,
  name,
  duration_minutes,
  price_kobo,
  deposit_kobo,
  is_active,
  sort_order
)
values
  ('00000000-0000-0000-4000-00000000c001', 'Signature Gel Manicure', 60, 2500000, 750000, true, 1),
  ('00000000-0000-0000-4000-00000000c002', 'Silk Blowout + Gloss', 75, 3500000, 1050000, true, 2),
  ('00000000-0000-0000-4000-00000000c003', 'Spa Pedicure Deluxe', 70, 3000000, 900000, true, 3)
on conflict (id) do nothing;

-- Names, roles and photos are the ones context/design/AboutPage/spec.md and the
-- Photo mapping in context/progress-tracker.md already use, so the About page
-- does not change when it starts reading the team from here.
insert into public.staff (id, name, role, photo_url, is_active, sort_order)
values
  ('00000000-0000-0000-4000-00000000d001', 'Amara', 'Master colorist • 9 yrs', '/images/amara.jpg', true, 1),
  ('00000000-0000-0000-4000-00000000d002', 'Sofia', 'Nail artist • 6 yrs', '/images/sofia.jpg', true, 2),
  ('00000000-0000-0000-4000-00000000d003', 'Lena', 'Skin & brows • 5 yrs', '/images/lena.jpg', true, 3)
on conflict (id) do nothing;

-- Which staff member does which service, by the role each one has. Lena is
-- left out on purpose: skin and brows is not one of the three services above,
-- so she has nothing to be booked for yet. The owner either adds a service for
-- her in Settings or links her to one; until then the booking page never offers
-- her, which is better than offering a service she does not do.
insert into public.staff_services (staff_id, service_id)
values
  ('00000000-0000-0000-4000-00000000d001', '00000000-0000-0000-4000-00000000c002'),
  ('00000000-0000-0000-4000-00000000d002', '00000000-0000-0000-4000-00000000c001'),
  ('00000000-0000-0000-4000-00000000d002', '00000000-0000-0000-4000-00000000c003')
on conflict (staff_id, service_id) do nothing;

-- Tue to Sun 9:00 to 19:00 and closed Mondays, which is the opening hours line
-- on the Landing and About pages. 0 is Sunday and 6 is Saturday, matching
-- extract(dow from ...).
--
-- Every weekday gets a row, including the closed one, because opens_at and
-- closes_at are not null and a closed day still has to say it is closed. The
-- times on a closed row are ignored: is_closed is what the availability engine
-- checks first. The id is built from the staff seed and the weekday so a second
-- run matches the row it wrote the first time. The prefix is nine zeros and an
-- a, so staff 1 weekday 0 lands on ...-000000000a10: the last group of a uuid
-- has to be exactly twelve characters.
with seeded_staff (id, seed) as (
  values
    ('00000000-0000-0000-4000-00000000d001'::uuid, '1'),
    ('00000000-0000-0000-4000-00000000d002'::uuid, '2'),
    ('00000000-0000-0000-4000-00000000d003'::uuid, '3')
),
seeded_weekdays (weekday) as (
  select generate_series(0, 6) as weekday
)
insert into public.staff_hours (id, staff_id, weekday, opens_at, closes_at, is_closed)
select
  ('00000000-0000-0000-4000-000000000a' || s.seed || w.weekday::text)::uuid,
  s.id,
  w.weekday,
  '09:00:00'::time,
  '19:00:00'::time,
  w.weekday = 1
from seeded_staff s
cross join seeded_weekdays w
on conflict (id) do nothing;
