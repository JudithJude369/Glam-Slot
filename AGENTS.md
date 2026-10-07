<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Read this file first, every task. It is short on purpose. Do not memorize the project:
discover what you need using sections 2, 3 and 5.

## 1. What we are building

GlamSlot is a booking system for salons and barbershops with deposits and WhatsApp reminders.
It fixes two problems: no-shows, and owners answering "are you free Friday?" in DMs.

- **Users:** customers (no accounts, book from phones) and the salon owner (logged-in dashboard).
- **Core flow:** pick service, staff, date and time, enter name and WhatsApp number, pay deposit, get reminders.
- **Owner tools:** daily calendar, view/cancel/add bookings, settings (Services, Staff and hours, Reminders).
- **Pages:** Landing, About, Booking, Pay deposit, Confirmation (client). Login, Calendar, Settings (owner).

Rules that are never broken (details in `context/project-overview.md`):

- A staff member never has two overlapping bookings. Enforce this in the database, not only in the UI.
- A booking becomes confirmed only after a verified Paystack webhook, never from the redirect.
- Money is stored as integer kobo. Times are stored in UTC and shown in Africa/Lagos.
- Customers have no accounts. The confirmation page is opened by an unguessable token link.

## 2. Where things live

Stack: Next.js (App Router), TypeScript, Supabase, Paystack, WhatsApp Business API, Zod, shadcn/ui, Tailwind, Playwright.
Do not assume the paths below. Look at the file tree first, and `context/architecture.md` has the route map.

- Client pages: `app/(client)/`
- Owner pages: `app/(owner)/`
- API routes and webhooks: `app/api/`
- Components: `components/` (shadcn primitives in `components/ui/`)
- Shared logic and Zod schemas: `lib/`
- Database: `supabase/migrations/`
- Page designs: `context/design/<PageName>/` (a `spec.md` plus Mobile, Tablet and Desktop images)
- Site images: `public/images/`
- Tests: `tests/` (Playwright)

## 3. Authoritative sources

When a context file and the code disagree, trust the code, then fix the context file.

| Topic                             | Source of truth                                                             |
| --------------------------------- | --------------------------------------------------------------------------- |
| Database schema, RLS, constraints | `supabase/migrations/`                                                      |
| Environment variables             | `.env.example`                                                              |
| UI patterns                       | existing components in `components/`                                        |
| API behavior                      | existing routes in `app/api/`                                               |
| Owner authentication              | the existing auth implementation and middleware                             |
| Validation                        | Zod schemas in `lib/`                                                       |
| Colours, fonts, type scale        | `context/ui.md`                                                             |
| Page layouts                      | `context/design/<PageName>/spec.md` (the images beside it are the original) |
| Paystack and WhatsApp behavior    | current official provider docs, not memory                                  |

## 4. How to work

1. Identify which area the task touches (UI, API, database, payments, messaging).
2. Inspect the existing implementation in that area before changing anything.
3. Read only the context files listed for that area in section 5.
4. Write a short plan: files to change and risks. For a new page or feature, wait for my approval before implementing.
5. Reuse existing components, patterns and schemas. Do not add a new library without asking.
6. Build one task or page at a time, in the phase order of `context/progress-tracker.md`. Before starting a page, open `context/design/<PageName>/spec.md` and build from it. No unrelated refactors.
7. `spec.md` is the source for a page's layout. Mobile (375px) is the reference; Tablet and Desktop show how the layout changes at larger widths. If `spec.md` is missing, stop and tell me: "No spec.md for <PageName>. Please get one written from the design images." Do not invent a layout, and do not start a different page without asking me. Before coding, list which items from the spec's "Unclear" section you plan to assume.
8. If a business rule is unclear or missing, ask. Do not guess.
9. When done, update `context/progress-tracker.md`.
10. Tick an item yourself as soon as your own checks prove it. If the last proof needs something only I can do (a real sign-in, a dashboard setting, a key), do not leave a plain empty box. Write 'built, waiting for owner check' next to the item in the tracker and tell me the exact steps to do, then wait. Never tick an item you could not verify.

## 5. Context index: read only what the task needs

| File                                      | Read when                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `context/project-overview.md`             | Any feature work, or anything involving booking, deposit, cancel, reschedule or reminder rules |
| `context/architecture.md`                 | Adding routes, touching the database, auth, Paystack or WhatsApp                               |
| `context/ui.md`                           | Building or changing any screen or component                                                   |
| `context/engineering-and-verification.md` | Before writing code (standards) and before reporting done (checks)                             |
| `context/progress-tracker.md`             | Starting a session, and finishing a task                                                       |

## 6. How to verify yourself

A task is never done just because the code was written. Before reporting completion:

1. Run type check, lint and build. Read the output.
2. Playwright is paused. Do not write or run Playwright tests until the owner says a separate test database exists. After each change, run npx tsc --noEmit and tests/db/verify-db.ts, then list the manual checks for the owner to do by hand.
3. Database changes: use a new migration, check RLS, and confirm the double-booking constraint still holds.
4. API changes: call the route with valid and invalid input. Zod must reject the invalid input.
5. Payments and webhooks: test in Paystack test mode. Send the same webhook twice and confirm it is handled once.
6. UI changes: check at 375px, 768px and desktop, including loading, empty and error states.
7. If anything fails, find the cause and fix it before reporting.

Final report: what changed, what you verified and how, and anything you could not verify.

## 7. Checks after every change

1. Run `npx tsc --noEmit` and fix any errors.
2. If the change touched the database, migrations or Server Actions,
   run `npm run db:verify:test`.
3. Report the results. Do not say "done" without them.
4. End with a list of manual checks for the owner.

## 8. Hard rules

- Never edit a migration that has already been applied. Add a new one.
- Never expose the Supabase service-role key or any secret to the client. Never commit `.env`.
- Verify the Paystack webhook signature. Make webhook handling idempotent.
- Secrets: never invent or fill in real keys. Keep `.env.example` up to date (names only, empty values). Real values go in `.env.local`, which must be git-ignored.
- When a task needs a key you do not have, stop and tell me: the variable name, where to get it, and where to paste it. Then wait.
- Check the current Paystack and WhatsApp docs before writing integration code. If a GitMCP server is connected, use it first for the official docs.
- When you use docs, say which server and page you used. Check that it matches the version installed in `package.json`.
- WhatsApp reminders use pre-approved templates only. Do not change template wording in code.
- Validate every input boundary with Zod: forms, API routes, webhooks.
- Do not build features outside `context/project-overview.md`.
- Tests and verification scripts run only against glamslot-test using .env.test. Never use .env.local in a test.
