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

- Phase: Phase 1 complete, Phase 2 in progress (Landing done, About next)
- Last completed task: Phase 2 — Landing page from `context/design/LandingPage/spec.md`
- Next task: Phase 2 — About page from `context/design/AboutPage/`, reusing `lib/sample-content.ts`

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
- 2026-10-03: the About page layout is built from `context/design/AboutPage/spec.md`, moved there from `about-spec.md` so it matches the Landing naming. Reason: the owner's convention from the Landing task, 2026-10-03.
- 2026-10-03: the header nav active link now comes from `usePathname()` in `components/landing/site-header.tsx` instead of a hardcoded flag, so About lights up without a second header. Reason: the About spec, 2026-10-03. The mobile nav panel has no active state.
- 2026-10-03: all nine "Unclear" items in the About spec were resolved by the owner on 2026-10-03: `dark-saloon.jpg` on mobile too, all three copy variants built and switched with `display: none`, the tablet header stretched edge to edge, a green WhatsApp button added under the address in the mobile Contact card, the "Book" pill links to `/book` with no staff preselected, staff names stay DM Sans on mobile and tablet and PT Serif on desktop, the mobile footer is the same stacked footer, and "Founded by Amara" is kept as sample copy.
- 2026-10-03: the About page lives at `app/about/page.tsx`, not `app/(client)/about/page.tsx`. Reason: no route groups exist yet and adding one would move the committed Landing page. Phase 4 or a later page can move both under `app/(client)/` in one commit.
- 2026-10-03: `tests/about.spec.ts` checks the About page at 375, 768 and 1280px: heading text, the three team names, a Book Now link, no horizontal scrollbar, and the sticky bar visible on mobile only. Reason: same as the Landing checks, the images cannot be read by the model.
- 2026-10-03: `tests/landing.spec.ts` checks the Landing page at 375, 768 and 1280px: heading text, the three service names, a Book Now link, no horizontal scrollbar, and the sticky bar visible on mobile only through `data-testid="sticky-book-bar"`. Reason: the images cannot be read by the model, so the checks stand in for looking at the page.
- 2026-10-03: `/api/health/supabase` returns 404 with an empty body in production and `{"ok":true}` or `{"ok":false}` in development. Reason: the owner's decision, 2026-10-03. No check names, error details, key formats or project information leave the server. The per-check detail still exists in `lib/supabase/health.ts` because that is where `ok` is computed; the route drops it on purpose.

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

## Blockers and open questions

Add anything waiting on the owner or on a provider (for example WhatsApp template approval).

- No tables exist in the project yet, so a real data read through the publishable key (the RLS path Phase 4 needs) is not yet proven. Only the auth and key checks are proven today.
- The desktop About paragraph says "Founded by Amara" while the team table lists her as one of three staff. It is sample copy for now; reword before a real salon uses it. The owner has been told.
- Four Landing link targets are not in the design and are guesses: "Services" and "All services" go to `/book`, "View services" goes to `/book`, and "Cancellation policy" goes to `/cancellation-policy`, a route that does not exist and is not in `project-overview.md`. "Contact" goes to the WhatsApp link. Say the word and they change.
- The desktop hero is about 594px tall against the ~500px estimate in the spec. Nothing is clipped; it is only taller.

## Session notes

Add the newest note at the top. Keep each to 3 lines: what changed, what was verified, what is next.

- 2026-10-03, Phase 2 Landing: `lib/sample-content.ts`, `components/landing/` (header, hero, service card, rituals grid, visit card, info row, footer, sticky bar) and the shadcn `button`, built from `context/design/LandingPage/spec.md`. Verified `typecheck`, `lint` and `build` pass and 11 Playwright tests pass, covering 375, 768 and 1280px for the heading text, three service names, a Book Now link, no horizontal scrollbar and the sticky bar on mobile only; screenshots are in `/tmp/kilo/landing-shots/`. Next: the About page.
- 2026-10-03, owner decisions applied: Supabase variable names stay `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (audit found no other name in the code), and `/api/health/supabase` is now 404 in production and `{"ok":…}` only in development. Verified `typecheck`, `lint`, `build` pass, production returns 404 with 0 bytes, dev returns 200 `{"ok":true}`, and dev with an invalid service-role key returns 503 `{"ok":false}` with nothing leaked. Next: Phase 2, Landing page.
- 2026-10-03, Phase 1 item 4: added `playwright.config.ts` and `tests/smoke.spec.ts`; Chromium 153 installed. First run failed on missing `libnspr4`, `libnss3` and `libasound2t64`; the owner ran `sudo npx playwright install-deps chromium` and `npx playwright test` then passed 1/1 in 29.4s. Verified `typecheck` and `lint` pass and the webServer logs show the build, `next start`, HTTP 200 and `WebServer available`. Next: Phase 2, Landing page.
- 2026-10-03, Phase 1 item 3: project `ugffhcwxcnyxlsgsjcco` reachable; added `lib/supabase/` (browser, server, admin clients plus `env.ts`), `app/api/health/supabase/route.ts`, and `.env.example`. Found the anon key "failing" because the check used the secret-key-only REST root; switched it to `/auth/v1/health` and added a `key-format` check. Verified `typecheck`, `lint`, `build` pass, health returned 200 (its response shape has since changed, see the dev-only decision above), and a bogus key still returned 401. Next: item 4, Playwright smoke test.
- 2026-10-03, Phase 1 item 2: wrote every `ui.md` colour into `:root` and mapped it in `@theme inline`; loaded DM Sans and PT Serif in `app/layout.tsx`. Verified `typecheck`, `lint`, `build` pass and that all 27 token utilities resolve in the served CSS. Next: item 3, Supabase and `.env.example`.
- 2026-10-03, Phase 1 item 1: ran `shadcn init` (radix/nova), added `components.json`, `lib/utils.ts`, `typecheck` script. `globals.css` has the theme mapping only; `:root` is empty until item 2. Verified `typecheck`, `lint`, `build` all pass. Next: item 2, colour tokens and fonts.
