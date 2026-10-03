-- GlamSlot: the tables listed in context/architecture.md.
-- One salon per deployment in v1, so there is no tenant_id.
-- Money is integer kobo. Times are timestamptz in UTC; staff_hours is local
-- wall-clock time in the salon timezone.

create schema if not exists private;

-- Keeps updated_at honest without every write having to remember it.
create function private.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.touch_updated_at() from public;

-- The email that identifies the owner. Kept out of salon_settings so the
-- anon key cannot read it: salon_settings is public, this table is not.
create table public.salon_owner (
  id smallint primary key default 1 check (id = 1),
  email text not null unique check (position('@' in email) > 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger salon_owner_touch_updated_at
  before update on public.salon_owner
  for each row execute function private.touch_updated_at();

-- id = 1 keeps this to a single row.
create table public.salon_settings (
  id smallint primary key default 1 check (id = 1),
  name text not null,
  address text not null,
  whatsapp_phone text not null check (whatsapp_phone ~ '^\+[1-9][0-9]{7,14}$'),
  timezone text not null default 'Africa/Lagos',
  slot_interval_minutes integer not null default 30
    check (slot_interval_minutes between 5 and 240),
  min_notice_hours integer not null default 2 check (min_notice_hours >= 0),
  booking_window_days integer not null default 60 check (booking_window_days > 0),
  cancel_cutoff_hours integer not null default 24 check (cancel_cutoff_hours >= 0),
  hold_minutes integer not null default 15 check (hold_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger salon_settings_touch_updated_at
  before update on public.salon_settings
  for each row execute function private.touch_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  description text not null default '',
  duration_minutes integer not null check (duration_minutes between 5 and 600),
  price_kobo integer not null check (price_kobo >= 0),
  -- The deposit counts toward the final bill, so it cannot exceed the price.
  deposit_kobo integer not null check (deposit_kobo >= 0 and deposit_kobo <= price_kobo),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_active_sort_order_idx
  on public.services (is_active, sort_order);

create trigger services_touch_updated_at
  before update on public.services
  for each row execute function private.touch_updated_at();

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  role text not null default '',
  bio text not null default '',
  photo_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_active_sort_order_idx on public.staff (is_active, sort_order);

create trigger staff_touch_updated_at
  before update on public.staff
  for each row execute function private.touch_updated_at();

create table public.staff_services (
  staff_id uuid not null references public.staff (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (staff_id, service_id)
);

-- The primary key covers staff_id only, so service_id needs its own index.
create index staff_services_service_id_idx on public.staff_services (service_id);

create table public.staff_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  -- 0 is Sunday and 6 is Saturday, matching extract(dow from ...).
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  is_closed boolean not null default false,
  -- More than one row per weekday is allowed, so a lunch break is a second row.
  check (is_closed or closes_at > opens_at),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_hours_staff_id_weekday_idx
  on public.staff_hours (staff_id, weekday);

create trigger staff_hours_touch_updated_at
  before update on public.staff_hours
  for each row execute function private.touch_updated_at();

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  -- NOT NULL because "any available" is resolved to one staff member inside
  -- the booking transaction. The exclusion constraint needs the staff id.
  staff_id uuid not null references public.staff (id),
  service_id uuid not null references public.services (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'completed', 'expired', 'cancelled', 'no_show')),
  customer_name text not null check (length(btrim(customer_name)) > 0),
  -- Stored as E.164, for example +2348031234567.
  customer_phone text not null check (customer_phone ~ '^\+[1-9][0-9]{7,14}$'),
  -- The 32 random bytes of the link token are hashed before they get here.
  -- The plain token is shown to the customer once and never stored.
  token_hash text not null unique check (length(token_hash) = 64),
  source text not null default 'client' check (source in ('client', 'owner')),
  hold_expires_at timestamptz,
  -- Snapshot of the service deposit, so a later price change cannot move it.
  deposit_kobo integer not null check (deposit_kobo >= 0),
  rescheduled_from uuid references public.bookings (id) on delete set null,
  -- Set when a payment arrives for a slot that is already taken.
  flagged boolean not null default false,
  flag_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- A client booking waiting for payment always has a hold. Owner bookings skip it.
  check (
    source = 'owner'
    or status <> 'pending_payment'
    or hold_expires_at is not null
  )
);

create index bookings_staff_id_starts_at_idx
  on public.bookings (staff_id, starts_at);
create index bookings_starts_at_idx on public.bookings (starts_at);
create index bookings_status_hold_expires_at_idx
  on public.bookings (status, hold_expires_at);
create index bookings_customer_phone_idx on public.bookings (customer_phone);

create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function private.touch_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  -- Unique per booking is what makes a repeated webhook a no-op.
  paystack_reference text not null unique check (length(btrim(paystack_reference)) > 0),
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  raw_event jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_booking_id_idx on public.payments (booking_id);

create trigger payments_touch_updated_at
  before update on public.payments
  for each row execute function private.touch_updated_at();

-- id = 1 keeps this to a single row.
create table public.reminder_settings (
  id smallint primary key default 1 check (id = 1),
  confirmation_enabled boolean not null default true,
  -- 0 means straight after the payment is verified.
  confirmation_offset_minutes integer not null default 0
    check (confirmation_offset_minutes >= 0),
  reminder_24h_enabled boolean not null default true,
  reminder_24h_hours_before integer not null default 24 check (reminder_24h_hours_before > 0),
  reminder_2h_enabled boolean not null default true,
  reminder_2h_hours_before integer not null default 2 check (reminder_2h_hours_before > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger reminder_settings_touch_updated_at
  before update on public.reminder_settings
  for each row execute function private.touch_updated_at();

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  kind text not null check (kind in ('confirmation', '24h', '2h')),
  scheduled_for timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id text,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One row per kind per booking: a reschedule moves the time instead of
  -- stacking a second reminder for the same kind.
  unique (booking_id, kind)
);

create index reminders_status_scheduled_for_idx
  on public.reminders (status, scheduled_for);

create trigger reminders_touch_updated_at
  before update on public.reminders
  for each row execute function private.touch_updated_at();