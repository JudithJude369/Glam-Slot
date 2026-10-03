# Engineering and Verification — GlamSlot

## Code standards
- TypeScript strict mode. No `any`. No `!` non-null assertion without a comment explaining why.
- Every input boundary has a Zod schema: forms, route handlers, server actions, webhooks.
  Share one schema between the client form and the server. Infer types from the schema.
- Prefer server components. Add `"use client"` only for interactivity.
- Keep route handlers thin. Put logic in `lib/` so it can be tested.
- Supabase:
  - Browser and server-user code uses the anon key and RLS.
  - Only server code that needs it imports the admin client from `lib/supabase/admin.ts`.
- Money uses helpers in `lib/money.ts` (kobo in, `₦` string out). Never use floats for money.
- Dates use one library (`date-fns` and `date-fns-tz`) through helpers in `lib/dates.ts`.
- Return `{ ok: true, data }` or `{ ok: false, error }` from server logic. Do not throw for expected failures.
- Never show raw database or provider errors in the UI. Log them on the server with the booking id.
- Do not log phone numbers, tokens or secrets.
- Naming: files in kebab-case, components in PascalCase, database columns in snake_case.
- No `console.log` in committed code. No TODO without an entry in `progress-tracker.md`.
- One task per change. Small, reviewable diffs.

## Before you code
1. Read the files in the area you will change.
2. Find an existing example of the same thing and follow it.
3. State your plan and the risks.

## Verification by change type
| Change | Must verify |
|---|---|
| Any code | Type check, lint and build pass. Read the output. |
| Database | New migration, not an edit. RLS still correct. Double-booking constraint still holds. |
| API or server action | Valid input works. Invalid input is rejected by Zod. Unauthorised access is refused. |
| Payments and webhooks | Paystack test mode. Bad signature rejected. Same event twice handled once. Wrong amount not confirmed. |
| Messaging | Uses the fake provider in tests. Cancelled bookings send nothing. Reschedule updates reminder times. |
| UI | Checked at 375px and desktop. Loading, empty and error states exist. |
| Booking, cancel, reschedule | Matching Playwright test added or updated. |

## Playwright flows that must always pass
1. Book a slot, pay the deposit in test mode, land on a confirmed booking.
2. Two simultaneous bookings for the same staff and slot: exactly one succeeds.
3. Paystack webhook with an invalid signature is rejected.
4. Paystack webhook sent twice produces one confirmed booking and one payment record.
5. An unpaid booking expires after 15 minutes and the slot becomes free.
6. Reschedule more than 24 hours ahead works. Reschedule or cancel less than 24 hours ahead is blocked.
7. A cancelled booking has no pending reminders.
8. Visiting `/dashboard` while logged out redirects to `/login`. Anonymous requests cannot read bookings.

Test setup:
- Use Paystack test keys and a separate Supabase project or local Supabase for tests.
- Never send real WhatsApp messages from tests.
- Create test data in the test itself. Do not depend on data left by earlier runs.

## Definition of done
A task is not done when the code is written. It is done when:
1. The checks for that change type all passed.
2. You read the real output and not only the exit code.
3. `context/progress-tracker.md` is updated.
4. New environment variables are in `.env.example`.

If something fails, find the cause and fix it before reporting. Do not weaken or skip a test to make it pass.

## Final report format
- **Changed:** files and what changed.
- **Verified:** which checks you ran and the result.
- **Not verified:** anything you could not check, and why.
- **Next:** the next task from the tracker.
