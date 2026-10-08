# Booking page (`/book`) spec

Written from `Booking-Mobile.jpeg`, `Booking-Tablet.jpeg`, `Booking-Desktop.jpeg`.

This page is part of the public booking flow: Booking, then Pay deposit, then Confirmation. The other two pages have their own spec.md.

Mobile is a 375px frame, tablet a 768px frame, desktop a 1440px frame. Sizes marked "~" are estimates measured from the images, not exact design values.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings, card titles and big numbers use PT Serif. Everything else uses DM Sans. Token names used below: `background`, `foreground`, `border`, `input`, `card`, `muted` (background, and the muted text colour paired with it), `primary` (white text on it), `blush`, `plum`, `success`, `warning`, `danger`. Confirm each name exists in `ui.md` before using it.
Breakpoints: same as Landing (mobile below 768px, tablet 768 to 1023px, desktop 1024px and up). Use the same container max width and side padding as Landing. Measured: on desktop the header logo starts at the container's left edge and the container is ~1104px wide at a 1440px screen. Mobile side padding is 20px. Tablet side padding is ~24px.

## Reuse from Landing (do not rebuild)

Header, footer, buttons, the hamburger panel and the green WhatsApp button style already exist from Landing. Reuse them.
- **Header, desktop.** Logo (`public/images/logo.jpg`, ~36px circle) with "GlamSlot" and the tagline "Nails • Hair • Glow", nav Home / About / Services / Find us (pin icon), "Book Now" button. Height ~76px, 1px `border` line under it. In all three desktop designs "Home" is shown as the active link (see Unclear 10).
- **Header, mobile and tablet.** Logo circle (~36px) and "GlamSlot", then a compact "Book Now" button (~97px wide, ~43px tall) and a hamburger button (~43px square, 1px `border`, ~14px corners). Height ~69px, 1px `border` line under it. The tablet design shows these items grouped near the centre. Use the mobile header layout stretched edge to edge (same decision as About).
- **Footer.** None of the Booking designs shows a footer at any size (see the Unclear list).
- **Not used here:** the Landing sticky "Book Now" bar. On mobile these pages have their own sticky bars (described per page).

## Photos

| Place | File |
|---|---|
| Header logo, on all three pages at every size | `public/images/logo.jpg`, circular crop |

That is the only photo on these pages. Do not use any other photo here: `lena.jpg`, `sofia.jpg`, `amara.jpg`, `dark-saloon.jpg`, `saloon.jpg`, `nails.jpg`, `girl.jpg`, `feet.jpg`. The stylist choices are text only, with no avatars. Do not add any.
Logo: ~36px circle, object-fit cover, centred. The text "GlamSlot" is next to it, so give the image `alt=""` (decorative).

## Sample content (for `lib/sample-content.ts`)

Reuse the salon object from Landing. Add this booking sample (one object, used by all three pages):

| Field | Value |
|---|---|
| Services chosen | "Gel Manicure" and "Spa Pedicure" |
| Service, long | "Gel Manicure + Spa Pedicure" |
| Service, short | "Gel + Pedicure" |
| Date and time | "Sat, Oct 11" and "10:30 AM" |
| Stylist | "Amara" (shown as "Amara (any available)" in the summary) |
| Deposit due now | $25.00 |
| Balance at salon | $58.00 |
| Customer name | Maria Lopez |
| Customer WhatsApp | +1 (305) 555-0199 |
| Booking code | GLAM-4821 |
| Card | last four 4242, brand Visa |
| Hold timer | 09:42 left |

Service list (Booking page):

| Name | Price | Duration | Deposit |
|---|---|---|---|
| Gel Manicure | $48 | 60m | $15 |
| Silk Blowout | $65 | 75m | $20 |
| Spa Pedicure | $58 | 70m | $15 |
| Brow Shape + Tint | $32 | 30m | $10 |

Detail line format on the Booking cards: `$48 • 60m • $15 deposit`.

Time slots shown on the Booking page, in order: 9:00 AM (taken), 10:30 AM (selected), 11:15 AM, 1:00 PM, 2:30 PM (taken), 4:00 PM, 5:15 PM, 6:00 PM. Mobile and tablet show only the first six.
Dates shown: 8, 9, 10, 11 (selected), 12, 13, 14 of "October 2026". See Unclear 5: do not hard-code these.
Info box text (same everywhere): "Free cancellation up to 12h before. Deposit refunded as salon credit. No-shows forfeit deposit."

Copy differs by breakpoint (see Unclear 13). Store every variant in `lib/sample-content.ts` and switch with responsive classes using `display: none` (not just visually hidden), so screen readers read only one version. Each page section below lists its variants.

## Shared pieces

**Card.** `card` background, 1px `border`, large rounded corners: ~24px on Booking cards, ~28px on Pay deposit and Confirmation cards.

**Primary button.** `primary` background, white text, ~52px tall, ~18px corners, DM Sans medium ~18px, text centred.

**Outline button.** `card` background, 1px `border`, `foreground` text, ~47px tall, ~16px corners, ~16px text. **Danger outline button** is the same with a 1px `danger` border and `danger` text.

**Inputs.** `input` background, 1px `border`, ~47px tall (desktop Pay card fields ~51px), ~16px corners, ~13px left padding, ~16px text. Placeholder and typed text are shown in `foreground` in the designs. Give every input an accessible name equal to its placeholder, for example `aria-label="Full name"`, because the designs show no visible labels.
Error state: 1px `danger` border, a circle-with-exclamation icon (~20px, `foreground`) inside the field at the right, and below it the message in `danger` colour, ~14px.

**Booking summary** (used on Booking and Pay deposit). Card with padding ~20px.
1. Title "Booking summary", PT Serif, ~20px (24px on mobile Pay deposit).
2. Three rows, ~32px apart, label on the left in muted text (~15px), value on the right-aligned in `foreground` (~15 to 16px): Service / Gel Manicure + Spa Pedicure; When / Sat, Oct 11 • 10:30 AM; Stylist / Amara (any available).
3. A 1px `border` divider.
4. "Deposit due now" (muted text) on the left, "$25.00" on the right in `primary` colour, ~20px. ~36px row pitch.
5. "Balance at salon" (muted text) left, "$58.00" right in `foreground`, ~17px.
6. Info box ~16px below: `blush` background, 1px `border`, ~16px corners, ~16px padding, an info icon (circle with "i", ~20px) at top left, ~12px gap, then the info box text (~15px, `foreground`). Three lines on desktop and mobile Pay, four lines in the narrow tablet Booking column.

**Mobile sticky action bar.** Fixed to the bottom of the screen, full width, `background` colour, 1px `border` line on top, side padding 20px, top padding ~13px, bottom padding 16px plus the device safe-area inset. The designs leave ~28 to 52px under the buttons; treat it as safe-area space. Page content gets bottom padding equal to the bar height plus ~20px so the bar never hides content.

---

# Page 1: Booking (`/book`)

## Stepper (all sizes)

Three steps: 1 "Service", 2 "Date & Time", 3 "Details". Each step is a column: circle (~36px) with the label ~12px below it (DM Sans ~14px, centred). Between steps, a connector line (2px) that fills the free space, with ~26px gap to the circle on each side.
States:
- **Done:** circle `success` background with a white check icon; label `success`; the connector after it `success`.
- **Active:** circle `primary` background with the white number; label `primary`.
- **Upcoming:** circle `muted` background with the number in muted text; label muted text; the connector after it `border`.

Mobile and tablet: the stepper fills the width with ~16px inset on each side; steps are spread out. The designs show step 1 done, step 2 active, step 3 upcoming.
Desktop: left-aligned, ~550px wide at most (not full width), starts ~16px in from the container's left edge. The design shows step 1 active, steps 2 and 3 upcoming, and both connectors in `border` colour.

## Mobile (375px), as designed (step 2 screen)

Page side padding 20px.
1. **Header.** As above.
2. **Stepper.** ~28px below the header line.
3. **Calendar card.** ~32px below the stepper labels. `card`, 1px `border`, ~24px corners, ~17px padding, ~145px tall.
   - Row: "October 2026" (PT Serif, ~22px) on the left; on the right two square buttons (~35px, ~5px apart, 1px `border`, ~12px corners) with a "<" chevron and a ">" chevron icon (~16px, `foreground`).
   - Weekday letters under it: M T W T F S S (muted text, ~14px, centred over each date).
   - One row of seven date buttons, equal width (~39px), ~43px tall, ~5px gap, ~14px corners, number ~18px. Selected date (11): `primary` background, white text. Others: `card` background, 1px `border`, `foreground` text.
4. **Stylist.** ~24px below the card. Label "Stylist (optional)" (DM Sans medium, ~16px). ~12px below it, three equal chips in one row, ~8px gap, ~43px tall, ~16px corners, centred text ~16px: "Any" (selected: `blush` background, 1.5px `primary` border), "Amara", "Sofia" (`card` background, 1px `border`).
5. **Slots.** ~24px below the chips. Label "Available slots — Sat, Oct 11" (DM Sans medium, ~16px). ~13px below it, a 3-column grid, ~8px gaps, each slot ~43px tall, ~16px corners, text ~17px, centred. Six slots in this order: 9:00 AM, 10:30 AM, 11:15 AM, 1:00 PM, 2:30 PM, 4:00 PM.
   - Available: `card` background, 1px `border`.
   - Selected (10:30 AM): `primary` background, white text.
   - Taken (9:00 AM, 2:30 PM): `muted` background, no border, strikethrough text in muted text.
6. **Slot-taken notice.** ~8px below the slots. `warning` text colour and `warning` background (light amber), 1px `warning` border, ~18px corners, ~13px padding, ~66px tall. A warning-triangle icon (~22px, `foreground`) on the left, ~12px gap, then the text "That 9:00 slot just got taken — we held 10:30 for you instead." (~16px, `foreground`, two lines). Shown only when the chosen slot was taken meanwhile (see Unclear 6).
7. **Details card.** ~20px below. `card`, 1px `border`, ~24px corners, ~17px padding. Title "Your details" (PT Serif, ~24px). ~16px below it, an input "Full name" (design shows the value "Maria Lopez"), ~13px below it an input "WhatsApp number" (design shows "+1 (305) 555-0199"). Then a checkbox row ~13px below: `blush` background, 1.5px `primary` border, ~16px corners, ~13px padding; a ~20px checkbox (checked: `primary` fill, white check, ~6px corners), ~12px gap, label "Send me WhatsApp reminders (24h + 2h before)" (~16px, wraps to two lines). The design hides the bottom of this card behind the sticky bar, so nothing below the checkbox is known.
8. **Sticky action bar.** Two buttons in one row, ~8px apart: "Back" (outline button, ~110px wide, ~52px tall, ~18px corners, ~18px text) and "Continue • $25 deposit" (primary button, fills the rest, ~19px text).

No page heading ("Book your ritual") and no booking summary on mobile.

## Tablet (~768px)

Side padding ~24px. No sticky bar, no footer, no Back button.
1. **Header.** As above.
2. **Stepper.** ~32px below the header line.
3. **Two columns**, ~30px below the stepper labels, ~16px gap. Left ~425px wide, right ~277px wide (the right column is the narrower one). Both start at the same top edge.
   - **Left column**, three cards stacked, ~16px apart. All `card`, 1px `border`, ~24px corners, ~17px padding. Titles are PT Serif ~20px.
     - **"Pick a date".** ~117px tall. Seven date buttons in a row (~52px wide, ~44px tall, ~5px gap, ~14px corners, number ~17px), no weekday letters, no arrows. Same selected style as mobile (11 selected).
     - **"Slots • Sat Oct 11".** ~169px tall. Three columns by two rows, ~8px gaps, each slot ~44px tall, ~14px corners, ~17px text. Same six slots and the same available, selected and taken styles as mobile.
     - **"Details".** ~117px tall. Two inputs side by side, ~9px gap, each ~191px wide and ~47px tall: "Maria Lopez" (Full name) and "WhatsApp number".
   - **Right column.**
     - **Booking summary** card (shared piece). ~392px tall. The Service value wraps to two lines here ("Gel Manicure + Spa" / "Pedicure"). The info box is four lines.
     - ~12px below it: a primary button "Continue • $25", full column width, ~52px tall (not inside the card).
4. Page bottom padding ~24px.

## Desktop (1024px and up)

1. **Header.** As above.
2. **Stepper.** ~40px below the header line, left-aligned.
3. **Two columns**, starting ~32px below the stepper labels, ~24px gap. Left column ~727px wide (takes the rest), right column ~351px wide.
   - **Left column.**
     - Heading "Book your ritual", PT Serif, ~32px, `foreground`. ~24px below it:
     - **Service cards**, a 2 by 2 grid, ~12px gaps. Each card ~357px wide, ~90px tall, ~22px corners, ~20px padding. Left side: service name in PT Serif ~20px, then the detail line (muted text, ~15px) under it. Right side: either a "Select" pill or a check.
       - Order: Gel Manicure, Silk Blowout (first row), Spa Pedicure, Brow Shape + Tint (second row).
       - Unselected: `card` background, 1px `border`, and a "Select" button on the right (pill, ~74px wide, ~35px tall, 1px `border`, `card` background, ~15px text).
       - Selected (Gel Manicure in the design): 2px `primary` border with a soft `blush` glow around it, and on the right a `primary` filled circle (~24px) with a white check instead of the Select button.
     - **Date and time card.** ~20px below the services. `card`, 1px `border`, ~24px corners, ~25px padding, ~257px tall. Title "October 2026 • with Amara" (PT Serif, ~22px). ~24px below it, seven date buttons in a row (each ~88px wide, ~51px tall, ~9px gap, ~16px corners, number ~17px; no weekday letters; selected 11 in `primary` with white text). ~16px below that, a 4-column grid of slots (each ~162px wide, ~43px tall, ~9px gaps, ~16px corners, ~17px text), 8 slots in two rows in the order listed in Sample content. Same available, selected and taken styles as mobile.
   - **Right column**, two cards ~16px apart.
     - **Booking summary** (shared piece), ~352px tall.
     - **Details** card: `card`, 1px `border`, ~24px corners, ~20px padding, ~269px tall. Title "Details" (PT Serif, ~20px). ~16px below it: input "Full name", ~9px below: input "WhatsApp number" (the design shows this one in its error state, with the message "Please enter a valid WhatsApp number." under it). ~16px below: primary button "Continue • $25 deposit", full width, ~52px tall.
4. No footer in this design (see Unclear 11). Page bottom padding ~48px.

## What changes between sizes (Booking)

| Thing | Mobile | Tablet | Desktop |
|---|---|---|---|
| Page heading | none | none | "Book your ritual" |
| Service cards | not shown (step 1 not designed) | not shown | 2 by 2 grid |
| Stepper | full width, step 2 active | full width, step 2 active | ~550px, step 1 active |
| Calendar | month title, arrows, weekday letters | "Pick a date", no arrows | month title with "with Amara", no arrows |
| Stylist choice | "Any" / "Amara" / "Sofia" chips | none | none |
| Slots | 3 columns, 6 slots | 3 columns, 6 slots | 4 columns, 8 slots |
| Booking summary | none | right column | right column |
| Details | "Your details" card with reminders checkbox | "Details" card, two fields side by side | "Details" card in right column |
| Primary button | sticky bar, "Continue • $25 deposit", plus "Back" | "Continue • $25" under summary | "Continue • $25 deposit" in Details card |

---

## Links and behaviour (best reading of the designs)

- Every "Book Now" goes to `/book`. "WhatsApp us" opens the salon WhatsApp chat (same link as Landing).
- Booking: "Select" on a service card selects that service. Tapping a date, slot or stylist chip selects it. "Continue" goes to Pay deposit. "Back" (mobile) goes to the previous step.
- Hover and focus states are not designed. Use the same ones as Landing.

## Unclear (ask before guessing)

1. **How the steps map to screens.** Mobile and tablet show step 1 done and step 2 active, with date, slots and details on that one screen. Desktop shows step 1 active but displays services, date, slots, summary and details all together. Step 1 on mobile and tablet, and step 3 everywhere, are not designed. Assumed: build exactly what each design shows. For the missing mobile and tablet step 1 screen, reuse the desktop service cards in one column. Tell me if desktop should also be a wizard.
2. **What step 3 "Details" is.** Mobile and tablet already show the details fields on the step 2 screen. Assumed the stepper is only a progress indicator and "Continue" always goes to Pay deposit.
3. **Services and totals.** The summary lists two services ("Gel Manicure + Spa Pedicure"), but desktop shows only Gel Manicure as selected. The numbers also do not add up: the two services cost $48 and $58 and have $15 and $15 deposits, but the summary says deposit $25.00 and balance $58.00. Treated as sample numbers. Calculate real totals from the selected services. Also, the fourth service is "Brow Shape + Tint" here and "Brow Shape" in the owner Settings designs. Tell me which name is right, and whether several services can be chosen.
4. **Stylist choice.** Only mobile shows a "Stylist (optional)" selector (Any, Amara, Sofia). Desktop and tablet show none, though the summary says "Amara (any available)" and the card title says "with Amara". Assumed the selector exists at all sizes with "Any" as default, and desktop and tablet use the same chips under the date row.
5. **Dates.** The design shows October 2026 with 8 to 14 and "Sat, Oct 11", and weekday letters M T W T F S S starting at 8. In 2026, 8 October is a Thursday and 11 October is a Sunday, so the design weekdays are wrong. The salon is closed on Mondays in the owner designs. Build dates from real availability, not from the sample. Mobile shows one week with "<" and ">" arrows. Assumed the arrows move by one week and the title shows that week's month.
6. **Slots.** Desktop shows 8 slots, mobile and tablet 6. Assumed these are crops of the same list and build all available slots at every size. The warning notice ("That 9:00 slot just got taken...") appears only on mobile. Assumed it shows when the chosen slot is taken by someone else and the next free slot is selected for the person.
7. **Hold time.** The Pay deposit screens show a 10-minute hold ("09:42", "auto-release after 10 min"). Our agreed rule is 15 minutes. Also the notice on Booking says a slot is "held" before payment. Tell me which hold time to use and when the hold starts. What happens at 00:00 is not designed. Assumed: show a "slot released" message with a button back to `/book`.
8. **Cancellation window and money.** The designs say "Free cancellation up to 12h before" and "deposit refunded as salon credit". Our agreed rule is free reschedule or cancel more than 24h before, no automatic refunds in v1. The designs also show US dollars, a Miami address and a +1 phone number, while the real setup uses Paystack, kobo and +234 numbers. Treated all of this as sample copy. Tell me which words to use.
9. **Form errors.** Only one error is designed (the WhatsApp number on desktop, "Please enter a valid WhatsApp number."). Assumed the name field gets the same style with a message such as "Please enter your name." Tell me the exact words.
10. **Active nav link.** Desktop shows "Home" active on all three pages. These pages are not the Home page. Built as designed. Tell me if no link should be active.
11. **Footer.** Desktop Booking shows no footer, Pay deposit and Confirmation desktop do, and no mobile or tablet design shows one. Built as designed.
12. **Stepper width on desktop.** It is narrow (~550px) and left-aligned, not full width. Built as designed.
13. **Copy differs by breakpoint.** Headings, subtitles, button labels, service names ("Gel Manicure + Spa Pedicure" or "Gel + Pedicure"), "Cancel" or "Cancel booking", and captions all differ between sizes. Default: build exactly what each design shows and store the variants in `lib/sample-content.ts`. If one version is wanted everywhere, say which.
14. **Tablet and mobile header.** Same issue as About: the tablet header items look grouped near the centre. Use the mobile header layout stretched edge to edge.
15. **Route paths.** `/book` is known. The paths for Pay deposit and Confirmation are not in the designs. The Confirmation page opens from a WhatsApp link with an unguessable token. Tell me the paths you want.
16. **Colours for notices.** The slot-taken notice looks amber and the payment-failed box looks light pink. Used `warning` and `danger` tokens. If `ui.md` has no light background for `danger`, use `danger` at low opacity, not a new colour.
17. **Exact sizes.** All sizes above are estimates from the images.
