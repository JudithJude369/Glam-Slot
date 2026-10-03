# Progress Tracker — GlamSlot

Read this at the start of every session. Update it at the end of every task.
Work top to bottom. Do not start a phase until the one above it is verified.
Mark `[x]` only after the checks in `engineering-and-verification.md` have passed.

## Build order

### Phase 1: Foundation

- [x] Next.js, TypeScript strict, Tailwind and shadcn set up
- [ ] Colour tokens and fonts from `ui.md` in `globals.css` and the Tailwind config
- [ ] Supabase project connected, `.env.example` created
- [ ] Playwright installed with one passing smoke test

### Phase 2: Public pages (static)

Use static sample content kept in one file (for example `lib/sample-content.ts`).
No database yet. The "Book Now" button links to `/book`, which does not exist until Phase 5.

- [ ] Landing page (build from `context/design/LandingPage/`)
- [ ] About page (build from `context/design/AboutPage/`)
- [ ] Both pages checked at 375px and on desktop

### Phase 3: Database and owner access

- [ ] Migrations for all tables in `architecture.md`
- [ ] Double-booking exclusion constraint, with a test that proves it
- [ ] RLS on every table
- [ ] Owner login and route protection for `/dashboard`

### Phase 4: Owner settings

- [ ] Services tab (name, duration, price, deposit)
- [ ] Staff and hours tab
- [ ] Reminders tab (on/off and timing)
- [ ] Landing and About read services, hours and team from the database. Remove the sample content.

### Phase 5: Booking

- [ ] Availability engine in `lib/availability`
- [ ] Booking page (service, staff, date and time, name, WhatsApp number)
- [ ] Slot hold and hold-expiry job

### Phase 6: Payments

- [ ] Paystack transaction start and Pay deposit page
- [ ] Webhook: signature check, amount check, idempotency
- [ ] Late-payment and slot-taken handling

### Phase 7: Confirmation page

- [ ] Token link and Confirmation page
- [ ] Reschedule and cancel with the 24-hour rule enforced on the server

### Phase 8: WhatsApp reminders

- [ ] Messaging interface and fake provider
- [ ] Reminder scheduling and sending job
- [ ] Real provider connected after template approval

### Phase 9: Owner calendar

- [ ] Calendar by day
- [ ] Drawer to view, cancel and add a booking

### Phase 10: Release

- [ ] All Playwright flows passing
- [ ] Mobile pass at 375px on every page
- [ ] Production keys and deploy

## Current status

- Phase: Phase 1, item 2 next
- Last completed task: Phase 1 item 1 — Next.js, TypeScript strict, Tailwind and shadcn set up
- Next task: Phase 1 item 2 — colour tokens and fonts from `ui.md` in `globals.css` and the Tailwind config

## Decisions log

Add one line per decision: date, decision, reason.

- 2026-10-03: shadcn set up with the shadcn CLI, `radix` base and `nova` preset, CSS variables on. Reason: components must come from the CLI, not by hand (`ui.md`). Colours are overwritten in Phase 1 item 2.
- 2026-10-03: `clsx` and `tailwind-merge` not installed; `lib/utils.ts` re-exports `cn` from the `cn` package that shadcn 4.21 generates. Reason: that is the current shadcn output and it already covers both.
- 2026-10-03: the `shadcn` package stays in `dependencies`, not `devDependencies`. Reason: `app/globals.css` imports `shadcn/tailwind.css`, so the build needs it.
- 2026-10-03: no `.dark` token block in `globals.css`. Reason: `ui.md` defines one light salon theme and no dark theme.
- 2026-10-03: added `npm run typecheck` (`tsc --noEmit`). Reason: `engineering-and-verification.md` requires a type check on every change and no script existed.
- Landing and About moved to Phase 2 so there is something to show early. They use sample content until Phase 4.

## Blockers and open questions

Add anything waiting on the owner or on a provider (for example WhatsApp template approval).

- `public/images/` has no documented page mapping. The owner must say which photo goes on which page if a design depends on one.

## Session notes

Add the newest note at the top. Keep each to 3 lines: what changed, what was verified, what is next.

- 2026-10-03, Phase 1 item 1: ran `shadcn init` (radix/nova), added `components.json`, `lib/utils.ts`, `typecheck` script. `globals.css` has the theme mapping only; `:root` is empty until item 2. Verified `typecheck`, `lint`, `build` all pass. Next: item 2, colour tokens and fonts.
