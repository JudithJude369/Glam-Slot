# UI — GlamSlot

Use shadcn/ui and Tailwind. Define the tokens below once as CSS variables in `globals.css`
and map them in the Tailwind config. Never hard-code hex values in components.

## Colour tokens
| Token | Hex | Use |
|---|---|---|
| background | #fffbf6 | page background |
| foreground | #241318 | main text |
| card | #ffffff | cards, popovers |
| card-foreground | #241318 | text on cards (white-on-white would be invisible) |
| input | #ffffff | input background |
| border | #f1e2d9 | borders, dividers |
| primary | #b81e4f | main buttons, links, key actions |
| primary-foreground | #ffffff | text on primary |
| secondary | #f9e8e0 | secondary buttons, soft panels |
| secondary-foreground | #7a1f3a | text on secondary |
| muted | #f5ede6 | quiet backgrounds |
| muted-foreground | #8a756e | secondary text |
| accent | #1e7a5a | positive highlight |
| accent-foreground | #ffffff | text on accent |
| gold | #c99a5b | decoration only |
| success / success-bg | #1e7a5a / #e2f3eb | confirmed states |
| warning / warning-bg | #b7791f / #fdf0d5 | pending states |
| danger | #c0392b | errors, cancel, destructive |
| plum | #2e1a22 | dark surfaces, owner sidebar |
| blush | #fbefeb | soft section backgrounds |

Contrast notes (check with a contrast tool):
- `muted-foreground` on the background is a little under 4.5:1. Use it only for secondary text at 14px or larger. Never for prices, dates or times.
- `gold` is decoration only (dividers, icons, small accents). Never for text.
- Warning text on warning-bg is low contrast. Use `foreground` for the message and the warning colour for the icon and border.

## Fonts
- Body and UI: **DM Sans** (400, 500, 700). Headings: **PT Serif** (400, 700 only).
- Load both with `next/font/google`, `display: swap`. Expose as `--font-sans` and `--font-serif`.

## Type scale
| Style | Mobile | Desktop | Weight | Font |
|---|---|---|---|---|
| h1 | 32/40 | 40/48 | 700 | PT Serif |
| h2 | 26/34 | 32/40 | 700 | PT Serif |
| h3 | 22/30 | 24/32 | 700 | PT Serif |
| h4 | 18/26 | 20/28 | 700 | PT Serif |
| body | 16/24 | 16/24 | 400 | DM Sans |
| body-large | 18/28 | 18/28 | 400 | DM Sans |
| small / label | 14/20 | 14/20 | 500 | DM Sans |
| caption | 12/16 | 12/16 | 400 | DM Sans |
| button | 16/24 | 16/24 | 500 | DM Sans |

- Never go below 16px for form input text. This also stops iOS from zooming in on focus.
- Line length for paragraphs: at most about 65 characters.

## Shape and spacing
- Radius: 8px for inputs and buttons, 12px for cards and drawers.
- Spacing uses Tailwind's 4px scale. Page padding: 16px mobile, 24px or more on desktop.
- Soft shadows only. Prefer borders in `border` colour over heavy shadows.

## Layout rules
- Mobile first. Design for 375px, then scale up. The booking flow is one column everywhere.
- Touch targets at least 44px high.
- Owner calendar: sidebar in `plum` on desktop, bottom or top navigation on mobile. Booking details open in a drawer, not a new page.
- Landing and About use `blush` for alternating sections. Use `gold` sparingly.

## Booking flow patterns
- Show a simple step indicator: Service, Time, Details, Pay.
- Show the deposit and the balance due at the salon before the pay button.
- Time slots are large tappable buttons. Disabled slots are visible but muted, not hidden.
- Display money as `₦12,500` and times as `2:30 PM`, always in Africa/Lagos.
- WhatsApp field: show the +234 hint and validate on blur.

## Status badges
| Status | Style |
|---|---|
| pending_payment | warning |
| confirmed | success |
| cancelled, no_show | danger |
| expired, completed | muted |

## Required states on every screen with data
- **Loading:** skeletons, not blank space.
- **Empty:** a short message and one clear next action.
- **Error:** a plain-language message and a retry. No raw error text.
- Buttons that trigger payments or bookings disable themselves while submitting.

## Accessibility
- Visible focus ring on every interactive element. Labels on every input.
- Do not use colour alone for status. Pair it with text or an icon.
- Respect `prefers-reduced-motion`.

## Components
Before creating a component, search `components/` and `components/ui/`. Reuse or extend what exists.
Add new shadcn components with the shadcn CLI, not by hand.
