# Architecture — GlamSlot

If the code or migrations disagree with this file, trust them, then fix this file.
Before writing Paystack or WhatsApp code, read the current official docs. Do not code from memory.

## Route map
| Route | Who | Page |
|---|---|---|
| `/` | public | Landing |
| `/about` | public | About |
| `/book` | public | Booking |
| `/book/pay/[bookingId]` | public | Pay deposit |
| `/booking/[token]` | token holder | Confirmation, reschedule, cancel |
| `/login` | public | Owner login |
| `/dashboard` | owner | Calendar |
| `/dashboard/settings` | owner | Settings (Services, Staff and hours, Reminders) |
| `/api/paystack/webhook` | Paystack | Payment events |
| `/api/whatsapp/webhook` | WhatsApp | Delivery status and incoming events |
| `/api/jobs/*` | scheduler | Hold expiry and reminder sending |

## Data (tables, overview only — the migrations are the source of truth)
`services`, `staff`, `staff_services`, `staff_hours`, `bookings`, `payments`,
`reminder_settings`, `reminders`, `salon_settings`.
- `bookings`: staff, service, start and end (UTC), status, customer name and phone, token hash, source, hold expiry.
- `payments`: booking, Paystack reference (unique), amount in kobo, status, raw event.
- `reminders`: booking, kind (confirmation, 24h, 2h), send time, status, provider message id.

## Double booking (most important rule)
- Enforce in Postgres with an exclusion constraint on (`staff_id`, time range of `start`/`end`) for statuses `pending_payment` and `confirmed`. Needs `btree_gist`.
- "Any available" staff: the server picks a free staff member inside the same transaction that creates the booking.
- On a constraint error, return a friendly "that slot was just taken" and show fresh slots.
- Never rely only on checking availability first and inserting after.

## Payments (Paystack)
1. Server creates the booking as `pending_payment` with a 15-minute hold, then starts the Paystack transaction. The reference is unique per booking.
2. Customer pays on Paystack and returns to our page. That page only reads the booking status. It never marks anything paid.
3. The webhook confirms the booking. Verify the `x-paystack-signature` header (HMAC SHA512 with the secret key) on the raw body before parsing.
4. Check that amount and currency equal the booking deposit. Mismatch: do not confirm, flag it.
5. Idempotent: the unique Paystack reference means a repeated event changes nothing. Always return 200 for a valid, already-handled event.
6. Hold expiry: a scheduled job runs every minute and expires old `pending_payment` bookings.
7. Use test keys outside production. Never log full card or bank details.

## Messaging (WhatsApp Business API)
- Send through one interface in `lib/messaging/`. Tests replace it with a fake that never sends.
- Only approved templates. Each template name and variables are listed in `lib/messaging/templates.ts`.
- A scheduled job sends due reminders from the `reminders` table. Failed sends are retried a limited number of times, then marked failed.
- Save the provider message id and delivery status from the webhook.
- Template approval takes time. Do not block the build on it: keep the interface working with the fake until approval.

## Auth and access
- Owner login with Supabase Auth (email and password). Middleware protects `/dashboard/*`.
- RLS on every table. The owner can read and write the salon's data. The anon role can read only public data (services, staff names, opening hours).
- Customers never query tables directly. Their actions go through server routes using the admin client after the token is validated.
- Token: 32 random bytes, shown to the customer once in the link, stored only as a hash.
- The admin (service-role) client lives in `lib/supabase/admin.ts` with `import "server-only"`.

## Environment variables
The names live in `.env.example`, which is the source of truth. Expected groups:
Supabase (URL, anon key, service-role key), Paystack (public key, secret key),
WhatsApp (access token, phone number id, webhook verify token), `APP_URL`, `JOBS_SECRET`.
- Server secrets never get the `NEXT_PUBLIC_` prefix.
- Add every new variable to `.env.example` in the same change.

## Folder conventions
- `app/(client)/`, `app/(owner)/`, `app/api/`
- `components/ui/` (shadcn), `components/` (app components)
- `lib/` (supabase, validation, money, dates, messaging, availability)
- `supabase/migrations/`, `tests/`
