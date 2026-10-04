# Progress Tracker — GlamSlot

Read this at the start of every session. Update it at the end of every task.
Work top to bottom. Do not start a phase until the one above it is verified.
Mark `[x]` only after the checks in `engineering-and-verification.md` have passed.

## Build order

### Phase 1: Foundation

- [x] Next.js, TypeScript strict, Tailwind and shadcn set up
- [x] Colour tokens and fonts from `ui.md` in `globals.css` and the Tailwind config
- [x] Supabase project connected, `.env.example` created
- [x] Playwright installed with one passing smoke test

### Phase 2: Public pages (static)

Use static sample content kept in one file (for example `lib/sample-content.ts`).
No database yet. The "Book Now" button links to `/book`, which does not exist until Phase 5.

- [x] Landing page (build from `context/design/LandingPage/`)
- [x] About page (build from `context/design/AboutPage/`)
- [x] Both pages checked at 375px, 768px and desktop"

### Phase 3: Database and owner access

- [x] Migrations for all tables in `architecture.md`
- [x] Double-booking exclusion constraint, with a test that proves it
- [x] RLS on every table
- [x] Owner login and route protection for `/dashboard`

Migrations applied to `ugffhcwxcnyxlsgsjcco` on 2026-10-03 by the owner
(`supabase login`, `supabase link`, `supabase db push`). `npm run db:verify` is the
database test suite and now passes 99 of 99 checks with the owner row present.

| Item | Status | What the evidence is |
| --- | --- | --- |
| 1. Migrations for all tables | done | All ten tables answer `200` over the Data API. Every table now has a real row written and read by `db:verify`, so columns, defaults, foreign keys and check constraints are exercised: a deposit larger than the price, hours that close before they open, hours for a staff member that does not exist, a payment of zero kobo and a payment for a booking that does not exist are all refused with `23514` or `23503`. |
| 2. Double-booking exclusion constraint | done | `23P01` `exclusion_violation` on an overlapping booking for the same staff member. A booking starting exactly when the previous one ends is accepted, the range is half open `[)`. The same time for a different staff member is accepted. Setting a booking to `cancelled` frees the slot again. Two simultaneous inserts for one slot returned `none` and `23P01`, so exactly one won. |
| 3. RLS on every table | done | All ten tables, three roles. `anon` reads `services`, `staff`, `staff_services`, `staff_hours` and `salon_settings`, cannot read a deactivated service, a link to a deactivated service, `salon_owner`, `bookings`, `payments`, `reminders` or `reminder_settings`, and gets `42501` on every insert, update and delete against all ten. A signed-in stranger reads no owner data and matches no row on update or delete, while still reading the public tables. The owner inserts, updates and deletes in all ten tables. |
| 4. Owner login and route protection for `/dashboard` | done | `/login` is built from `context/design/LoginPage/spec.md` at 375, 768 and 1280px, plus route protection in `proxy.ts`. 11 Playwright checks cover the email field, password field and sign-in button at all three widths, no horizontal scrollbar, no header or footer or sticky bar, the signed-out `/dashboard` redirect, the generic error on a wrong password with no provider text, and the password cleared with the email kept. `tests/dashboard-auth.spec.ts` adds 8 more and covers the signed-in path without needing the owner's own account: a throwaway auth user is created, the single `salon_owner` row is pointed at it, the sign-in is done through the real form, and the session is accepted. Proved by mutation, not by reading: stubbing `isSalonOwner()` in `lib/supabase/proxy.ts` to always return true fails the "bounced to the login page once the row belongs to someone else" test, and stubbing `getOwner()` in `lib/auth.ts` to always succeed fails the stranger test, so both call the real functions. The stranger is refused at sign-in with "That account is not the salon owner." and a valid session loses `/dashboard` the moment the row names someone else. **The owner's own account signed in for real on 2026-10-04** and all three paths held: sign-in lands on `/dashboard`, and `/login` while signed in goes to `/dashboard`. The signed-out redirect was proved separately with `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/dashboard`, which printed `307 http://localhost:3000/login`. A private browser window is **not** evidence for that path: it showed a 404 because it still held the owner's session, and a signed-in owner passes the proxy and then hits the missing `/dashboard` page. `/dashboard` answering 404 is expected and is Phase 9, not a gap in this item. |

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
- [ ] Sign-out button. The dashboard must include one. Until it exists there is no way to sign out except clearing the browser's site data.

### Phase 10: Release

- [ ] All Playwright flows passing
- [ ] Mobile pass at 375px on every page
- [ ] Production keys and deploy

## Current status

- Phase: Phase 3 in full, all four items verified. Item 4 was closed by the owner's real sign-in on 2026-10-04.
- Last completed task: Phase 3 item 4 — route protection, the signed-in owner and stranger tests, and the owner's own sign-in passing all three paths
- Next task: Phase 4, which replaces the sample content with real reads.

## Decisions log

Add one line per decision: date, decision, reason.

- 2026-10-03: shadcn set up with the shadcn CLI, `radix` base and `nova` preset, CSS variables on. Reason: components must come from the CLI, not by hand (`ui.md`). Colours are overwritten in Phase 1 item 2.
- 2026-10-03: `clsx` and `tailwind-merge` not installed; `lib/utils.ts` re-exports `cn` from the `cn` package that shadcn 4.21 generates. Reason: that is the current shadcn output and it already covers both.
- 2026-10-03: the `shadcn` package stays in `dependencies`, not `devDependencies`. Reason: `app/globals.css` imports `shadcn/tailwind.css`, so the build needs it.
- 2026-10-03: no `.dark` token block in `globals.css`. Reason: `ui.md` defines one light salon theme and no dark theme.
- 2026-10-03: added `npm run typecheck` (`tsc --noEmit`). Reason: `engineering-and-verification.md` requires a type check on every change and no script existed.
- 2026-10-03: `--destructive` points at `danger`, `--ring` points at `primary`, `--popover` at `card`, and no `--chart-*` or `--sidebar-*` tokens were written. Reason: `ui.md` has no values for them, and `sidebar` is not built until Phase 9.
- 2026-10-03: DM Sans loads as a variable font (`font-weight: 100 1000`) instead of three static weights. Reason: `next/font/google` with three static weights fails the Turbopack build in Next 16.3.7 with `next/font/google queries have exactly one entry`. The variable font still provides the 400, 500 and 700 weights from `ui.md`. PT Serif keeps static 400 and 700.
- 2026-10-03: radius tokens in `@theme inline` are literal lengths (`--radius-md` and `--radius-control` 0.5rem, `--radius-lg` and `--radius-xl` 0.75rem). Reason: Tailwind v4 silently drops `--radius-*` theme values that are `var()` references, so they cannot point at `:root`. `--radius-sm` and `--radius-2xl` and above keep Tailwind defaults.
- 2026-10-03: headings `h1` to `h4` get `font-serif` from `@layer base`. Reason: `ui.md` says headings are PT Serif; this stops every component repeating the class.
- Landing and About moved to Phase 2 so there is something to show early. They use sample content until Phase 4.
- 2026-10-03: the project uses the new Supabase key system, so the values are `sb_publishable_…` and `sb_secret_…` even though the variable names are the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. The names stay exactly as they are, in the code, in `.env.example` and in every doc. Reason: the owner's decision, 2026-10-03. Legacy names still work and the rename is not being done.
- 2026-10-03: the health check validates the publishable key against `/auth/v1/health`, not `/rest/v1/`. Reason: with the new key system the REST schema root answers `401 Secret API key required` even for a valid publishable key, so the old check reported a false failure. Publishable and secret keys go on the `apikey` header and never on `Authorization: Bearer` (supabase.com/docs/guides/getting-started/api-keys).
- 2026-10-03: added a `key-format` check to the Supabase health check. Reason: a valid key in the wrong variable is silent otherwise, which is exactly the state this task started in.
- 2026-10-03: `.env.example` points at `Settings -> API Keys` for Supabase. Reason: there is no longer a `Settings -> API` page (supabase.com/docs/guides/getting-started/api-keys).
- 2026-10-03: `@playwright/test` 1.63.0 in `devDependencies`, Chromium only, config at `playwright.config.ts` with `testDir: "./tests"`. Reason: matches the version the current Playwright docs install, and `tests/` is the path in `AGENTS.md`.
- 2026-10-03: the Playwright `webServer` command is `npm run build && npm run start`, not `npm run dev`. Reason: the Next.js guide in `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` recommends testing against production code, and building first means a stale `.next` can never give a false pass. `reuseExistingServer` is on, so a server already running in development is reused instead.
- 2026-10-03: the smoke test asserts the `h1` is visible, not its text. Reason: Phase 2 replaces that copy, and the test should keep testing that the page loads. Strengthen it when the real Landing page exists.
- 2026-10-03: Playwright needs `sudo npx playwright install-deps` on this machine before any test can run. Reason: Chromium cannot start without `libasound2t64`, `libnspr4` and `libnss3`, and installing them needs root. Run it with no browser argument to cover Firefox and WebKit too, which the Phase 10 flows will need.
- 2026-10-03: the Landing page layout is built from `context/design/LandingPage/spec.md`, a word description of the design images that sit beside it, because the images cannot be read directly. Reason: the owner's instruction, 2026-10-03. The spec was moved there from `context/landingPage-spec.md`, and where its numbers are marked `~` they are estimates from the images, not design values.
- 2026-10-03: the photo mapping for the Landing page is written down from the spec's Photos table and the old open question about `public/images/` is closed. Reason: the owner, 2026-10-03. See the Photo mapping section.
- 2026-10-03: Landing card radius is `20px` and the hero card is `24px`, which does not match the 12px in `ui.md`. Reason: the owner's instruction, 2026-10-03. `ui.md` is not edited. Later pages should reuse the same `rounded-[20px]` cards and `rounded-3xl` hero so the site stays consistent with the Landing page; buttons and inputs stay on the 8 to 12px from `ui.md`.
- 2026-10-03: all ten "Unclear" items in the Landing spec were resolved by the owner on 2026-10-03: `saloon.jpg` on mobile too, cancellation copy reads 24h not 12h to match the business rule, a lucide `Star` in the desktop badge, the tablet header stretched edge to edge, `accent` for every WhatsApp green, the hamburger panel lists Home, About, Services, Find us, Book Now, Select only toggles, the mobile footer is the same dark footer in one column, and the sticky bar is a solid `primary` button with no blur.
- 2026-10-03: the Landing hero renders at about 594px tall on desktop, not the ~500px estimate in the spec, because the content at a 52px heading is taller than the design frame. Reason: left as is, the owner's call is still open; nothing is clipped.
- 2026-10-03: the header is sticky (`sticky top-0 z-50`). Reason: the owner's request, 2026-10-03, because a customer had to scroll up to reach the nav. This is not in either design image, so it is an owner decision over the spec, not a spec value. It applies to every page that reuses `SiteHeader`. `bg-background` is opaque, so no blur or translucency was added.
- 2026-10-03: a truncated `.next/dev/types/validator.ts` from an interrupted `next dev` run broke `typecheck` and `build` with two TS1109 errors. Reason: deleting the file fixed it; `.next/dev/types` is generated and gitignored. If it happens again, remove `.next/dev` and rerun.
- 2026-10-03: the About page layout is built from `context/design/AboutPage/spec.md`, moved there from `about-spec.md` so it matches the Landing naming. Reason: the owner's convention from the Landing task, 2026-10-03.
- 2026-10-03: the header nav active link now comes from `usePathname()` in `components/landing/site-header.tsx` instead of a hardcoded flag, so About lights up without a second header. Reason: the About spec, 2026-10-03. The mobile nav panel has no active state.
- 2026-10-03: all nine "Unclear" items in the About spec were resolved by the owner on 2026-10-03: `dark-saloon.jpg` on mobile too, all three copy variants built and switched with `display: none`, the tablet header stretched edge to edge, a green WhatsApp button added under the address in the mobile Contact card, the "Book" pill links to `/book` with no staff preselected, staff names stay DM Sans on mobile and tablet and PT Serif on desktop, the mobile footer is the same stacked footer, and "Founded by Amara" is kept as sample copy.
- 2026-10-03: the About page lives at `app/about/page.tsx`, not `app/(client)/about/page.tsx`. Reason: no route groups exist yet and adding one would move the committed Landing page. Phase 4 or a later page can move both under `app/(client)/` in one commit.
- 2026-10-03: `tests/about.spec.ts` checks the About page at 375, 768 and 1280px: heading text, the three team names, a Book Now link, no horizontal scrollbar, and the sticky bar visible on mobile only. Reason: same as the Landing checks, the images cannot be read by the model.
- 2026-10-03: `tests/landing.spec.ts` checks the Landing page at 375, 768 and 1280px: heading text, the three service names, a Book Now link, no horizontal scrollbar, and the sticky bar visible on mobile only through `data-testid="sticky-book-bar"`. Reason: the images cannot be read by the model, so the checks stand in for looking at the page.
- 2026-10-03: `/api/health/supabase` returns 404 with an empty body in production and `{"ok":true}` or `{"ok":false}` in development. Reason: the owner's decision, 2026-10-03. No check names, error details, key formats or project information leave the server. The per-check detail still exists in `lib/supabase/health.ts` because that is where `ok` is computed; the route drops it on purpose.
- 2026-10-03: the nine tables in `architecture.md` were approved by the owner on 2026-10-03. `bookings.status`, `payments.status`, `reminders.kind` and `bookings.source` are `text` with a `check`, not native enums. Reason: a value change later is an `alter table ... drop constraint, add constraint` instead of `alter type`, and no enum type is created that a later migration has to drop.
- 2026-10-03: the owner's email lived in its own single-row table `public.salon_owner`, not in `salon_settings`. Reason: `salon_settings` is public to the anon key because the Landing and About pages read it, and a column-level grant would break PostgREST's `select *`. A separate table with no anon grant keeps the address readable and the owner email private. **Superseded:** the table still exists but no longer has an `email` column; see the `auth.uid()` decision below.
- 2026-10-03: RLS identified the owner by `lower(email) = lower(auth.jwt() ->> 'email')` against `salon_owner`, wrapped in a `security definer` function `private.is_salon_owner()` with `set search_path = ''`. Reason: the owner's decision, 2026-10-03, and supabase.com/docs/guides/database/postgres/row-level-security: a definer function reads `salon_owner` without re-entering RLS, the result is cached once per statement, and an unmatched email denies. The `email` claim is set by the auth server, so unlike `user_metadata` it cannot be edited by the signed-in user. **Superseded:** the function, the definer wrapper and `set search_path = ''` all still stand, but it now compares `auth.uid()` against `salon_owner.user_id`; see the `auth.uid()` decision below.
- 2026-10-03: the `salon_owner` insert policy compares the verified claim directly instead of calling `private.is_salon_owner()`. Reason: the function reads `salon_owner`, and a row being inserted is not visible to the same command that inserts it, so the claim would always fail. It compared `user_id` to `auth.uid()` after the change, and still does.
- 2026-10-03: every migration starts by revoking the automatic grants, and `alter default privileges in schema public revoke all on tables from anon, authenticated` was added. Reason: supabase.com/docs/guides/database/postgres/row-level-security says a table in an exposed schema arrives with `select, insert, update, delete` granted to `anon` and `authenticated`, and adding policies does not take those grants back.
- 2026-10-03: Phase 3 is three migrations, not one: `20261003130000_schema.sql`, `20261003130100_booking_exclusion.sql`, `20261003130200_rls.sql`. Reason: the exclusion constraint needs `btree_gist` to exist first, and keeping it alone means one file to drop and retry if the extension cannot be created by the migration role.
- 2026-10-03: the double-booking rule is `exclude using gist (staff_id with =, tstzrange(starts_at, ends_at, '[)') with &&) where (status in ('pending_payment','confirmed'))`, and `bookings.staff_id` is `not null`. Reason: "any available" is resolved to one staff member inside the transaction that inserts the booking, and the `[)` range lets a booking start exactly when the previous one ends.
- 2026-10-03: the proof for the exclusion constraint and RLS is `npm run db:verify`, a Node script over the Data API, not pgTAP. Reason: `supabase test db` runs `pg_prove` in a container and this machine has no Docker, so the pgTAP files the RLS guide asks for under `supabase/tests/` cannot be run here. The script asserts `23P01` on an overlap, one winner out of two simultaneous inserts, `42501` for anon and for a signed-in stranger, and the public reads that must keep working. Writing the pgTAP files is still owed.
- 2026-10-03: added `npm run db:verify`, and `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` to `.env.example`. Reason: `supabase db push` and `supabase link` need both, neither has the `NEXT_PUBLIC_` prefix so neither can reach the browser, and no application code reads them.
- 2026-10-03: the cleanup in `tests/db/verify-db.ts` restores `salon_settings` and `salon_owner` instead of deleting them. Reason: the first version deleted the `salon_settings` row whenever one already existed, which was harmless while the table was empty but would have destroyed the single settings row the moment Phase 4 writes it.
- 2026-10-03: the "the owner updates salon_settings" check runs through the signed-in owner client, not the admin client. Reason: the admin client bypasses RLS, so a write through it proved nothing about the policy it was named after.
- 2026-10-03: `supabase/.temp/` ended up committed and pushed with the migrations. Reason: unknown, but it is machine-local CLI state; it holds the project ref and the pooler URL with no password, and should be added to `.gitignore` and untracked.
- 2026-10-03: `npm run db:verify` is the database test suite. pgTAP is not used and will not be. Reason: the owner's decision, 2026-10-03. `supabase test db` runs `pg_prove` inside a container, which needs Docker, and the owner does not want Docker on this machine. The script drives the same ground through the Data API with three real roles: the `anon` key, a signed-in owner whose `user_id` is in `salon_owner`, and a signed-in stranger. Anything that needs `set local role`, as the pgTAP RLS examples do, is covered by signing in as a real user instead.
- 2026-10-03: PostgREST refuses an `update` or a `delete` with no `WHERE` clause and returns `21000`, so every write in `db:verify` is filtered. Reason: found while extending the suite; five single-row checks failed on it. It also means no code can ever mass-update or mass-delete through the Data API, which suits a one-salon deployment.
- 2026-10-03: middleware is `proxy.ts`, not `middleware.ts`. Reason: Next.js 16 renamed it, verified in node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md and confirmed by the build output printing "Proxy (Middleware)". The comment already in `lib/supabase/server.ts` was written with that in mind.
- 2026-10-03: the owner check uses `supabase.auth.getClaims()`, never `getSession()`. Reason: supabase.com/docs/guides/auth/server-side/nextjs warns that the session cookie can be forged and `getSession()` does not revalidate it, so a forged cookie would pass. `getClaims()` verifies the signature on every call.
- 2026-10-03: the proxy matcher is `["/dashboard/:path*", "/login"]`, not the all-except-static pattern from the Supabase guide. Reason: only the owner area needs a session; the customer pages never touch Supabase and should not pay for a token verification on every request.
- 2026-10-03: copying cookies onto the proxy's redirect is a loop, not `cookies.setAll(...)`. Reason: the Supabase snippet uses `setAll`, but `NextResponse.cookies` is a `ResponseCookies` in Next 16.3.7 and has no `setAll`, only `set` and `getAll`.
- 2026-10-03: `zod` moved from an undeclared transitive dependency to a declared one at `^4.6.5`. Reason: AGENTS.md names Zod as the project's validation stack and the sign-in action needs it, but it was only present in `node_modules` by hoisting, so a clean install could have dropped it.
- 2026-10-03: the owner allowlist is keyed on `auth.uid()`, not the email claim, in `20261003130300_owner_user_id.sql`. Reason: the owner's decision, 2026-10-03. The subject claim is immutable for an account, while an email claim changes when the owner changes their address and would silently lock them out. The `email` column was dropped rather than kept alongside, because the dashboard can show the signed-in address from the session claims and a second copy would drift.
- 2026-10-03: in `20261003130300_owner_user_id.sql` the four `salon_owner` policies are dropped before the column change and recreated after it. Reason: Postgres refuses to drop a column a policy depends on, so the first attempt failed with `2BP01` on `policy owner claims the owner email depends on column email of table salon_owner`. The failed push rolled back cleanly and was not recorded in the migration history.
- 2026-10-03: the LoginPage was blocked on a missing `context/design/LoginPage/spec.md`, so only the non-visual half of Phase 3 item 4 was built. Reason: the owner's decision, 2026-10-03, and AGENTS.md rule 7, which forbids inventing a layout. The three design images are there, so the spec can be written from them the way the Landing and About specs were. **Resolved the same day:** the spec was written and the page built from it, all 8 of its Unclear items approved by the owner.
- 2026-10-03: the owner Supabase Auth account and its `salon_owner` row are created by the owner, not by an agent. Reason: the owner's decision, 2026-10-03, so no password is ever handled or logged here.
- 2026-10-03: `db:verify` asserts a row count from `.select()` rather than only checking that a write did not error, and scopes every assertion with a filter on the seeded ids. Reason: supabase.com/docs/guides/database/postgres/row-level-security warns that `lives_ok` passes when a write matched zero rows, and scoping keeps the checks valid once Phase 4 seeds real services and staff.
- 2026-10-03: `db:verify` asserts that the owner **cannot** insert a `salon_owner` row carrying another user id, and restores a pre-existing row with the admin client instead of the owner client. Reason: found on 2026-10-04. The old check did the opposite, expecting the owner client to re-insert the row it had just deleted. That insert carries the *real* owner's id, so `with check (user_id = auth.uid())` correctly refused it with `42501`, and the cleanup's `update ... eq("id", 1)` then matched zero rows because the row was already gone. The suite destroyed the owner's row while reporting 96/96 on the next run, because the failing check is skipped when no row exists. Only the admin client may write a row for another user, so the restore goes through it and the refusal is now asserted as a security check.
- 2026-10-04: `db:verify` runs against the live project and swaps the real `salon_owner` row, so it snapshots that whole row before the first write and a guard compares it again at the very end, whatever else happened, failing the run with the recovery SQL if the row is missing, extra or changed. Reason: an earlier run deleted the owner's row and the next run reported 96/96, because a restore that matches zero rows is silent and the check that failed is skipped when no row is there. The restore writes every column back, not just `user_id`, since restoring the id alone silently reset `created_at` and `updated_at` to `now()`.
- 2026-10-04: the signed-in owner and stranger tests were proved to call the real server functions by mutation rather than by reading the code. Reason: a test that passes without exercising the thing it names proves nothing. Stubbing `isSalonOwner()` in `lib/supabase/proxy.ts` to always return true fails the "bounced to the login page once the row belongs to someone else" test; stubbing `getOwner()` in `lib/auth.ts` to always succeed fails the stranger test. Both stubs were reverted and the suite is green again.
- 2026-10-04: the signed-in tests create a throwaway auth user and point the single `salon_owner` row at it, restoring the previous row in a `finally`. Reason: the 2026-10-03 decision is that the owner's own account and row are the owner's to create, so the tests cannot depend on them existing. The cost is that they need `SUPABASE_SERVICE_ROLE_KEY`, which they read from `.env.local` at run time and never log or commit.
- 2026-10-04: `lib/database.types.ts` is hand-maintained from the migrations, and all three Supabase clients are `createClient<Database>` / `createServerClient<Database>` / `createBrowserClient<Database>`. Reason: a query that names a column which does not exist now fails `npm run typecheck` with `SelectQueryError<"column 'owner_email' does not exist on 'salon_owner'.">` instead of failing at runtime in production. Proved by adding `owner_email` to the `salon_owner` select in `lib/auth.ts`, which failed the type check with exit code 2, then reverting. The file has to be regenerated by hand when a migration changes a table; there is no generation step in the repo.


## Photo mapping

Source: the Photos tables in `context/design/LandingPage/spec.md` and `context/design/AboutPage/spec.md`. Every photo is `object-fit: cover`.

| Place                                       | File                            |
| ------------------------------------------- | ------------------------------- |
| Header logo, all sizes, cropped to a circle | `public/images/logo.jpg`        |
| Landing hero, all sizes                     | `public/images/saloon.jpg`      |
| Landing card: Signature Gel Manicure        | `public/images/nails.jpg`       |
| Landing card: Silk Blowout + Gloss          | `public/images/girl.jpg`        |
| Landing card: Spa Pedicure Deluxe           | `public/images/feet.jpg`        |
| About hero, all sizes                       | `public/images/dark-saloon.jpg` |
| About team: Amara                           | `public/images/amara.jpg`       |
| About team: Sofia                           | `public/images/sofia.jpg`       |
| About team: Lena                            | `public/images/lena.jpg`        |

The About header logo is `public/images/logo.jpg` again, the same circular crop. Not used on the About page: `saloon.jpg`, `nails.jpg`, `girl.jpg`, `feet.jpg`. `dark-saloon.jpg`, `lena.jpg`, `sofia.jpg` and `amara.jpg` are now mapped, so all nine photos have a place.

## Where the project stands

Written at the end of the 2026-10-03 session. Read this before starting Phase 4.

### Done and verified

- Phase 1 in full: Next.js 16 with TypeScript strict, Tailwind v4 and shadcn/ui; every colour and font from `ui.md`; Supabase browser, server and admin clients plus `.env.example`; Playwright installed with a passing smoke test.
- Phase 2 in full: the Landing page at `/` and the About page at `/about`, both built from their `spec.md`, sharing one sticky header, one footer, the shadcn button and the mobile sticky Book Now bar.
- Phase 3 items 1 and 2: the three migrations are applied to the live project, and `npm run db:verify` passes 20 of 20 checks. `btree_gist` was created without complaint, so the exclusion constraint is live.
- `lib/sample-content.ts` holds all placeholder content: salon details, three services, three team members and the link lists.
- `/api/health/supabase` proves the Supabase keys work. JSON in development, 404 in production.
- 27 Playwright tests pass, covering both pages at 375, 768 and 1280 pixels.
- `typecheck`, `lint` and `build` pass, and the site is deployed at https://glam-slot.vercel.app/ with both pages returning 200.
- `README.md` describes the project, the setup and what does not exist yet.

### Half-done

- **Nobody has looked at either page.** Every check is a Playwright assertion or a DOM measurement. Screenshots from the last run are in `/tmp/kilo/landing-shots/` and `/tmp/kilo/about-shots/`, but those are gone on reboot. A human pass against the design images is still owed.
- **Every "Book Now" link 404s** because `/book` arrives in Phase 5. So does `/cancellation-policy`, and "Services", "All services" and "View services" all point at `/book`.
- **The desktop "Find us" link does nothing.** It jumps to `#visit`, and that anchor only exists below 1024 pixels on both pages.
- **Page metadata is still the create-next-app default.** The browser title reads "Glam-Slot" on both pages, visible on the live site.
- **RLS is proved on every table**, by 99 checks in `npm run db:verify`: all ten tables, three roles, every operation. What is still unproved is that the policies are *useful* against real data, which Phase 4 depends on.
- **There is no owner identity in the tables yet.** The owner has one Supabase Auth account and its `salon_owner` row, so `private.is_salon_owner()` now returns true for a real request and the owner can sign in. But no other table holds anything: not even the single `salon_settings` and `reminder_settings` rows. Phase 4 has nothing to read.
- **`/dashboard` itself does not exist.** The owner is redirected there on sign-in and lands on a 404 until Phase 9 builds the calendar. The `CalendarPage` spec is still missing too.
- **There is no way to sign out.** `signOut()` is written and unused; until Phase 9 puts a button on the dashboard, the only way out is clearing the browser's site data.
- **Content is hard-coded.** Services, hours, team and photos come from `lib/sample-content.ts` until Phase 4 replaces that with database reads.
- **The desktop Landing hero is about 594px tall** against the ~500px estimate in the spec. Nothing is clipped.
- **The pages are not in `app/(client)/`.** They sit at `app/page.tsx` and `app/about/page.tsx` because no route groups exist yet.

### Next, in order

1. Phase 4, which replaces the sample content with real reads. Every table is empty, so the first decision is whether seeding belongs in a migration, in Settings, or in an admin script.
2. Then Phase 9, for `/dashboard` itself, which needs `context/design/CalendarPage/spec.md` first.

Before starting Phase 4, read `context/architecture.md` for the auth rules and the existing `lib/supabase/server.ts` client.

## Blockers and open questions

Add anything waiting on the owner or on a provider (for example WhatsApp template approval).

- **The rest of the seeding is undecided and Phase 4 depends on it.** The owner identity is settled: one Supabase Auth account and its `salon_owner` row, and the owner signed in for real on 2026-10-04. Every other table is still empty, so Phase 4 has nothing to read until the single `salon_settings` row, the `reminder_settings` row, the services and the staff exist. Whether that seeding belongs in a migration, in the Settings UI, or in an admin script is still open.
- **`context/design/CalendarPage/spec.md` is missing.** Blocking Phase 9, not Phase 4: the owner is redirected to `/dashboard` on sign-in and lands on a 404, and the page itself arrives in Phase 9. Write the spec from `context/design/CalendarPage/` before Phase 9, the way the LoginPage spec was written.
- **`/dashboard` has no sign-out button.** Not blocking, but the owner currently has no way to sign out except clearing the browser's site data. Added to Phase 9.
- `npm audit` reports high-severity `braces` advisories through `micatch`, `fast-glob` and `shadcn`, all dev-time CLI tooling. `npm audit fix --force` wants to install `shadcn@1.0.0`, a breaking change, so it was left alone. Worth a decision.
- pgTAP is not coming. The owner's decision, 2026-10-03: no Docker on this machine. `npm run db:verify` is the database test suite instead, and any future check that needs `set local role` has to sign in as a real user.
- `npm run db:verify` prints a Node `MODULE_TYPELESS_PACKAGE_JSON` warning because `tests/db/verify-db.ts` has no module type. Harmless, and fixing it means renaming it to `.mts`; adding `"type": "module"` to `package.json` is not an option because the Next config files rely on the current setup.
- The desktop About paragraph says "Founded by Amara" while the team table lists her as one of three staff. It is sample copy for now; reword before a real salon uses it. The owner has been told.
- Four Landing link targets are not in the design and are guesses: "Services" and "All services" go to `/book`, "View services" goes to `/book`, and "Cancellation policy" goes to `/cancellation-policy`, a route that does not exist and is not in `project-overview.md`. "Contact" goes to the WhatsApp link. Say the word and they change.
- The desktop hero is about 594px tall against the ~500px estimate in the spec. Nothing is clipped; it is only taller.

## Session notes

Add the newest note at the top. Keep each to 3 lines: what changed, what was verified, what is next.

- 2026-10-04, Phase 3 closed: the owner signed in for real, so item 4 is ticked and Phase 3 is done. Verified against the owner's report, not a rerun: sign-in lands on `/dashboard` and `/login` while signed in goes to `/dashboard`; the signed-out redirect came from `curl`, which printed `307 http://localhost:3000/login`, because a private window still held the session and so showed the `/dashboard` 404 instead of the redirect. Also found the owner has no way to sign out, since `signOut()` has no button, so that is now a Phase 9 item. Next: Phase 4, which has nothing to read until the seeding decision is made.

- 2026-10-04, owner login committed and the signed-in path proved: found and fixed a real bug in `db:verify` that deleted the owner's `salon_owner` row, proved the signed-in tests call the real `getOwner()` and `isSalonOwner()` by mutating each one and watching the matching test fail, and proved the generated database types reject a column that does not exist. Verified `typecheck`, `lint`, `build` and 48 Playwright tests pass, `db:verify` is 98 of 98 with a row present and 96 of 96 without one, and every table is empty afterwards with no test users left. Next: the owner re-inserts their `salon_owner` row, then Phase 4.

- 2026-10-03, owner allowlist switched to the auth user id: new migration `20261003130300_owner_user_id.sql` adds `salon_owner.user_id uuid not null unique`, drops `email`, rewrites `private.is_salon_owner()` to compare `(select auth.uid())`, and renames the four `salon_owner` policies. Applied it with `supabase db push --linked` after fixing an ordering bug of mine: the policies must be dropped before the column, or Postgres fails with `2BP01`. Verified `typecheck`, `lint` and `db:verify` pass at 96 of 96 against the new key, all ten tables are empty and the owner's Auth account survived. Next: the owner inserts their row with the SQL provided, then the `/login` page once its spec exists. Uncommitted.

- 2026-10-03, `/login` built: `app/login/page.tsx` and `login-form.tsx` from `context/design/LoginPage/spec.md`, with all 8 of the spec's Unclear defaults approved by the owner, plus 11 Playwright checks; 45 tests pass. Found and fixed a real bug: `app/login/actions.ts` exported a plain object from a `"use server"` file, which Next rejects at runtime and which 500'd the page the moment the form was submitted. The password and email are both controlled because React 19 resets uncontrolled fields after an action and the spec keeps the typed email. Tablet photo uses `object-position: 70% 50%`, an estimate nobody has looked at yet; screenshots are in `/tmp/kilo/login-shots/`. Not verified by eye. Next: the owner inserts their `salon_owner` row and signs in.
- 2026-10-03, Phase 3 item 4 half done: added `proxy.ts` (Next 16 renamed middleware), `lib/supabase/proxy.ts`, `lib/auth.ts` and `app/login/actions.ts`, plus 5 Playwright checks, and promoted the hoisted `zod` to a declared dependency. Verified `typecheck`, `lint`, `build` (prints "Proxy (Middleware)") and all 32 Playwright tests pass, and a signed-out request to `/dashboard` gets a 307 to `/login` with the query string dropped. Next: the `/login` page, which needs `context/design/LoginPage/spec.md`, and an owner account. Two doc-driven notes: the check uses `getClaims()` and never `getSession()`, and `NextResponse.cookies` has no `setAll` in this version so the redirect copies cookies in a loop. Uncommitted.
- 2026-10-03, Phase 3 item 3 done: extended `tests/db/verify-db.ts` from 20 to 96 checks covering all ten tables, three roles and every operation, and every table now gets a real row so columns, defaults, foreign keys and checks are exercised; the run proved `23514` on a deposit above the price, hours closing before they open, zero kobo and an unknown reminder kind, and `23503` and `23505` on bad foreign keys, a repeated Paystack reference and a second reminder of the same kind. Two harness bugs, no schema problem: inserts were not `.select()`ing so they reported zero rows, and five single-row writes had no `WHERE`, which PostgREST refuses with `21000`. Verified `typecheck` and `lint` pass, `db:verify` is 96 of 96, and afterwards all ten tables are empty with no test users left. Next: Phase 3 item 4. Uncommitted: the script and this file.

- 2026-10-03, Phase 3 item 3 done: extended `tests/db/verify-db.ts` from 20 to 96 checks covering all ten tables, three roles and every operation, and every table now gets a real row so columns, defaults, foreign keys and checks are exercised; the run proved `23514` on a deposit above the price, hours closing before they open, zero kobo and an unknown reminder kind, and `23503` and `23505` on bad foreign keys, a repeated Paystack reference and a second reminder of the same kind. Two harness bugs, no schema problem: inserts were not `.select()`ing so they reported zero rows, and five single-row writes had no `WHERE`, which PostgREST refuses with `21000`. Verified `typecheck` and `lint` pass, `db:verify` is 96 of 96, and afterwards all ten tables are empty with no test users left. Next: Phase 3 item 4. Uncommitted: the script and this file.

- 2026-10-03, Phase 3 items 1 and 2 verified: the owner ran `supabase login`, `link` and `db push`, so all ten tables are on the live project, and I re-ran `npm run db:verify` myself and read the output: 20 of 20 checks pass, including `23P01` on an overlap and one winner out of two simultaneous inserts. Fixed a bug in the script's cleanup that would have deleted a real `salon_settings` row once Phase 4 seeds one, and made the owner-update check run as the owner instead of the admin client; after the run all six seeded tables are empty and no test users are left. Next: extend the script to cover the four untouched tables and the `update` and `delete` policies to close item 3. Also open: `supabase/.temp/` is committed and should be ignored.
- 2026-10-03, Phase 3 items 1 to 3 written, not applied: three migrations under `supabase/migrations/` (schema, `bookings_staff_no_overlap`, RLS), `tests/db/verify-db.ts` with `npm run db:verify`, `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` in `.env.example`, `owner_email` split into a private `salon_owner` table, and every grant revoked before it is re-granted. Verified `typecheck`, `lint` and `build` pass and the project still has no tables (`PGRST205` for `public.services`); the SQL itself is unrun. Next: the owner pastes a personal access token and the database password into `.env.local`, then `supabase link` and `supabase db push` and `npm run db:verify`.
- 2026-10-03, end of session: added the "Where the project stands" section with what is verified, what is half-done and the order to work in next. State verified against the repo: `git log`, the file tree and `git status`, not from memory. Nothing was built in this step, so no code checks were rerun; the last green run was 27 Playwright tests plus `typecheck`, `lint` and `build`. Still uncommitted and worth a decision: the `.gitignore` change that ignores `/context`, and the untracked About spec it leaves behind.
- 2026-10-03, header made sticky on the owner's request: `sticky top-0 z-50` in `components/landing/site-header.tsx`, so both pages keep the nav while scrolling. Verified `typecheck`, `lint` and `build` pass and 27 Playwright tests pass, including 6 new checks that scroll 1200px at 375, 768 and 1280px and assert the header is still at the top of the viewport. Hit and fixed a stale truncated `.next/dev/types/validator.ts` that was failing the type check. Next: Phase 3, migrations.
- 2026-10-03, Phase 2 About: `app/about/page.tsx` and `components/about/` (hero, team section, team card, contact card), built from `context/design/AboutPage/spec.md`, reusing the Landing header, footer, buttons and sticky bar. Verified `typecheck`, `lint` and `build` pass and 21 Playwright tests pass, including 10 new About checks at 375, 768 and 1280px; measured box sizes against the spec (hero image 335x192, 344x283 and 512x465, team cards 82, 150 and 115px tall, radii 24px and 32px). Next: Phase 3, migrations. Not verified by eye: nobody has looked at the page, screenshots are in `/tmp/kilo/about-shots/`.
- 2026-10-03, Phase 2 Landing: `lib/sample-content.ts`, `components/landing/` (header, hero, service card, rituals grid, visit card, info row, footer, sticky bar) and the shadcn `button`, built from `context/design/LandingPage/spec.md`. Verified `typecheck`, `lint` and `build` pass and 11 Playwright tests pass, covering 375, 768 and 1280px for the heading text, three service names, a Book Now link, no horizontal scrollbar and the sticky bar on mobile only; screenshots are in `/tmp/kilo/landing-shots/`. Next: the About page.
- 2026-10-03, owner decisions applied: Supabase variable names stay `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (audit found no other name in the code), and `/api/health/supabase` is now 404 in production and `{"ok":…}` only in development. Verified `typecheck`, `lint`, `build` pass, production returns 404 with 0 bytes, dev returns 200 `{"ok":true}`, and dev with an invalid service-role key returns 503 `{"ok":false}` with nothing leaked. Next: Phase 2, Landing page.
- 2026-10-03, Phase 1 item 4: added `playwright.config.ts` and `tests/smoke.spec.ts`; Chromium 153 installed. First run failed on missing `libnspr4`, `libnss3` and `libasound2t64`; the owner ran `sudo npx playwright install-deps chromium` and `npx playwright test` then passed 1/1 in 29.4s. Verified `typecheck` and `lint` pass and the webServer logs show the build, `next start`, HTTP 200 and `WebServer available`. Next: Phase 2, Landing page.
- 2026-10-03, Phase 1 item 3: project `ugffhcwxcnyxlsgsjcco` reachable; added `lib/supabase/` (browser, server, admin clients plus `env.ts`), `app/api/health/supabase/route.ts`, and `.env.example`. Found the anon key "failing" because the check used the secret-key-only REST root; switched it to `/auth/v1/health` and added a `key-format` check. Verified `typecheck`, `lint`, `build` pass, health returned 200 (its response shape has since changed, see the dev-only decision above), and a bogus key still returned 401. Next: item 4, Playwright smoke test.
- 2026-10-03, Phase 1 item 2: wrote every `ui.md` colour into `:root` and mapped it in `@theme inline`; loaded DM Sans and PT Serif in `app/layout.tsx`. Verified `typecheck`, `lint`, `build` pass and that all 27 token utilities resolve in the served CSS. Next: item 3, Supabase and `.env.example`.
- 2026-10-03, Phase 1 item 1: ran `shadcn init` (radix/nova), added `components.json`, `lib/utils.ts`, `typecheck` script. `globals.css` has the theme mapping only; `:root` is empty until item 2. Verified `typecheck`, `lint`, `build` all pass. Next: item 2, colour tokens and fonts.
