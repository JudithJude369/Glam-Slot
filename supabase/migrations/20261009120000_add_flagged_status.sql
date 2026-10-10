-- Add "flagged" as a valid booking status
-- Used when a payment succeeds but the slot was already taken by another booking.
-- The payment is recorded as succeeded, but the booking cannot be confirmed.
-- The owner must review and resolve manually.

alter table public.bookings
  drop constraint bookings_status_check,
  add constraint bookings_status_check
    check (status in ('pending_payment', 'confirmed', 'completed', 'expired', 'cancelled', 'no_show', 'flagged'));