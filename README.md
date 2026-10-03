# GlamSlot

Booking for salons and barbershops. Customers pick a slot and pay a small deposit, so
appointments are less likely to be missed, and the owner stops answering "are you free
Friday?" in direct messages.

It is for two kinds of user: a customer booking on a phone with no account, and the salon
owner who runs the bookings.

Live site: <https://glam-slot.vercel.app/>

## Current status

Two of ten phases are done. What works today:

- **Landing page** at `/`: hero, three featured services you can select, address and hours, WhatsApp buttons, sticky "Book Now" bar on mobile.
- **About page** at `/about`: salon story, the three-person team, contact details.
- **Shared layout**: sticky header with a mobile menu, dark footer, buttons and icons from the design tokens.
- **A health check** at `/api/health/supabase` that confirms the Supabase keys work. It returns JSON in development only and 404 in production.
- **Tests**: Playwright checks both pages at 375, 768 and 1280 pixels.

Both pages read placeholder content from `lib/sample-content.ts`, so the salon details,
prices and photos are hard-coded for now.

Not built yet: the database tables, owner login, the booking page, deposits through
Paystack, the confirmation page, WhatsApp reminders, the owner calendar and settings. Every
"Book Now" button therefore points at `/book`, which does not exist yet and returns a 404.

Next up is Phase 3: database migrations and owner access.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript in strict mode, Tailwind CSS v4, shadcn/ui,
Supabase (Postgres, auth, row level security), Paystack, WhatsApp Business API, Zod, and
Playwright for tests.

## Getting started

```bash
npm install
cp .env.example .env.local
```

Fill these in `.env.local`. Names only, never commit real values.

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard, Settings → API Keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard, Settings → API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard, Settings → API Keys. Server only, never prefix it with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | dashboard.paystack.com → Settings → API Keys & Integration Keys |
| `PAYSTACK_SECRET_KEY` | dashboard.paystack.com → Settings → API Keys & Integration Keys |
| `WHATSAPP_ACCESS_TOKEN` | developers.facebook.com → WhatsApp → API Setup |
| `WHATSAPP_PHONE_NUMBER_ID` | developers.facebook.com → WhatsApp → API Setup |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | developers.facebook.com → WhatsApp → API Setup |
| `APP_URL` | The public address of this deployment, with no trailing slash |
| `JOBS_SECRET` | Any long random string you generate yourself |

Only the three Supabase variables are used by the app right now. The rest are placeholders
for the payment and messaging phases.

```bash
npm run dev        # development server on http://localhost:3000
npm run typecheck  # TypeScript, no files written
npm run lint       # ESLint
npm run build      # production build
npm run start      # serve the production build
npx playwright test  # Playwright: builds, starts the server and runs tests
```

On Linux, run `sudo npx playwright install-deps` once before the first Playwright run.

## Project structure

- `app/` — routes: the Landing page, the About page and the Supabase health check.
- `components/landing/` — header, footer, service cards, visit card and the sticky Book Now bar, shared by both pages.
- `components/about/` — the About page hero, team section and contact card.
- `components/ui/` — shadcn/ui primitives generated with the shadcn CLI.
- `lib/` — shared helpers and the Supabase browser, server and admin clients.
- `lib/sample-content.ts` — placeholder salon details, services and team used by the static pages.
- `context/` — project documentation, page specs and the design images they describe.
- `public/images/` — the salon photos.
- `tests/` — Playwright specs for the pages that exist.