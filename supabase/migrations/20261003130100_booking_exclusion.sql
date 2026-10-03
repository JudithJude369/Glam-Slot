-- GlamSlot: the double-booking rule from context/architecture.md.
--
-- A staff member never has two overlapping bookings. The check lives here, in
-- the database, so two concurrent booking requests cannot both win. Never rely
-- on checking availability first and inserting after.
--
-- 'Any available' staff is resolved to one staff_id inside the transaction that
-- inserts the booking, which is why bookings.staff_id is NOT NULL.
--
-- Only pending_payment and confirmed bookings hold a slot. completed,
-- expired, cancelled and no_show release it.

-- Needed so staff_id (uuid) can share a GiST index with the time range.
create extension if not exists btree_gist with schema extensions;

alter table public.bookings
  add constraint bookings_staff_no_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending_payment', 'confirmed'));

-- The half-open range '[)' lets a booking start exactly when the previous one
-- ends. 10:00 to 11:00 and 11:00 to 12:00 do not overlap.