# Pay deposit page spec

Written from `PayDeposit-Mobile.jpeg`, `PayDeposit-Tablet.jpeg`, `PayDeposit-Desktop.jpeg`.

This page is part of the public booking flow: Booking, then Pay deposit, then Confirmation. The other two pages have their own spec.md.

Mobile is a 375px frame, tablet a 768px frame, desktop a 1440px frame. Sizes marked "~" are estimates measured from the images, not exact design values.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings, card titles and big numbers use PT Serif. Everything else uses DM Sans. Token names used below: `background`, `foreground`, `border`, `input`, `card`, `muted` (background, and the muted text colour paired with it), `primary` (white text on it), `blush`, `plum`, `success`, `warning`, `danger`. Confirm each name exists in `ui.md` before using it.
Breakpoints: same as Landing (mobile below 768px, tablet 768 to 1023px, desktop 1024px and up). Use the same container max width and side padding as Landing. Measured: on desktop the header logo starts at the container's left edge and the container is ~1104px wide at a 1440px screen. Mobile side padding is 20px. Tablet side padding is ~24px.

## Reuse from Landing (do not rebuild)

Header, footer, buttons, the hamburger panel and the green WhatsApp button style already exist from Landing. Reuse them.
- **Header, desktop.** Logo (`public/images/logo.jpg`, ~36px circle) with "GlamSlot" and the tagline "Nails • Hair • Glow", nav Home / About / Services / Find us (pin icon), "Book Now" button. Height ~76px, 1px `border` line under it. In all three desktop designs "Home" is shown as the active link (see Unclear 4).
- **Header, mobile and tablet.** Logo circle (~36px) and "GlamSlot", then a compact "Book Now" button (~97px wide, ~43px tall) and a hamburger button (~43px square, 1px `border`, ~14px corners). Height ~69px, 1px `border` line under it. The tablet design shows these items grouped near the centre. Use the mobile header layout stretched edge to edge (same decision as About).
- **Footer.** Shown on desktop only. Same as Landing desktop (`plum` band ~200px tall, "GlamSlot", "24 Rose Lane, Miami, FL • Tue–Sun 9am–7pm", green "WhatsApp us" button with chat icon, Visit column: Services, About, Book Now; Help column: Cancellation policy, Contact). No mobile or tablet design shows a footer.
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

| Name | Price | Duration | Deposit |
|---|---|---|---|
| Gel Manicure | $48 | 60m | $15 |
| Silk Blowout | $65 | 75m | $20 |
| Spa Pedicure | $58 | 70m | $15 |
| Brow Shape + Tint | $32 | 30m | $10 |

Copy differs by breakpoint (see Unclear 8). Store every variant in `lib/sample-content.ts` and switch with responsive classes using `display: none` (not just visually hidden), so screen readers read only one version. Each page section below lists its variants.

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

**Hold timer banner** (Pay deposit). `plum` background, large corners (~28 to 33px). Text colours: time in `background` colour (cream) in PT Serif, other text in light muted text.

**Mobile sticky action bar.** Fixed to the bottom of the screen, full width, `background` colour, 1px `border` line on top, side padding 20px, top padding ~13px, bottom padding 16px plus the device safe-area inset. The designs leave ~28 to 52px under the buttons; treat it as safe-area space. Page content gets bottom padding equal to the bar height plus ~20px so the bar never hides content.

---

# Page 2: Pay deposit

## Mobile (375px)

Side padding 20px. Page background `background`.
1. **Header.** As above.
2. **Hold timer banner.** ~24px below the header line. Full width, ~76px tall, `plum`, ~28px corners, ~16px padding.
   - Left: a circle ~44px (white at ~10 to 15% opacity over `plum`, no new colour) with "09" in it (PT Serif, ~24px, `background` colour). This is the minutes part of the timer; mark it `aria-hidden`.
   - Next to it, ~12px gap: "Slot held for" (light muted text, ~16px) over "09:42" (PT Serif, ~32px, `background` colour).
   - Right: a pill "Gel + Pedicure" (~106px wide, ~28px tall, fully rounded, white at ~10 to 15% opacity over `plum`, light text ~15px).
3. **Booking summary** card (shared piece). ~16px below. ~352px tall. Service value on one line: "Gel Manicure + Spa Pedicure". The info box has three lines: "Free cancellation up to 12h before." / "Deposit refunded as salon credit." / "No-shows forfeit deposit."
4. **Deposit payment card.** ~16px below. `card`, 1px `border`, ~28px corners, ~17px padding, ~211px tall.
   - Title "Deposit payment" (PT Serif, ~24px).
   - ~16px below, a card row (input style, ~47px tall, ~18px corners): "•••• 4242 • Visa" on the left and a credit-card icon (~24px, `foreground`) on the right.
   - ~13px below, the error message box: `danger` colour for the border, icon and tint (light pink background), ~18px corners, ~86px tall, ~13px padding. A circle-with-X icon (~22px) on the left, then "Payment failed — card declined. Try another card, your slot is still held for 9:42." (~17px, `foreground`, three lines; the "9:42" is the live timer). This box shows only after a failed payment.
5. **Sticky action bar.** Primary button "Pay $25 Deposit", full width, ~52px tall. Under it, centred, ~13px below: "Secure checkout • Balance $58 due at salon" (muted text, ~15px).

## Tablet (~768px)

Side padding ~24px. No sticky bar, no footer.
1. **Header.** As above.
2. **Two equal columns**, ~24px below the header line, ~351px each, ~16px gap, both starting at the same top edge.
   - **Left column.**
     - Hold timer banner: ~120px tall, `plum`, ~28px corners, ~20px padding. "Slot held for" (light muted text, ~15px), "09:42" (PT Serif, ~36px, `background` colour), "Complete payment to confirm" (light muted text, ~14px). No circle and no pill.
     - ~16px below: Booking summary card, ~351px tall. Service on one line. Three-line info box.
   - **Right column.** "Pay deposit" card: `card`, 1px `border`, ~24px corners, ~20px padding, ~281px tall. Title "Pay deposit" (PT Serif, ~24px). ~16px below: input "Card •••• 4242" with a card icon on the right (~47px tall). ~12px below: two inputs side by side, ~9px gap, each ~150px wide and ~47px tall, placeholders "MM / YY" and "CVC" (muted text). ~12px below: primary button "Pay $25", full width, ~52px tall. ~16px below, centred: "256-bit encrypted • Balance $58 at salon" (muted text, ~14px).

## Desktop (1024px and up)

1. **Header.** As above.
2. **Content block.** ~40px below the header line. Centred in the container, ~903px wide at most (about 100px narrower than the container on each side). Two equal columns, each ~435px wide, ~32px gap, both starting at the same top edge.
   - **Left column.**
     - Hold timer banner: ~104px tall, `plum`, ~33px corners, ~24px left padding. A circle ~56px (white at ~10 to 15% opacity over `plum`) with "09" (PT Serif, ~28px, `background` colour, `aria-hidden`). ~16px to its right: "09:42 left" (PT Serif, ~32px, `background` colour) over "We hold your slot while you pay securely." (light muted text, ~16px).
     - ~16px below: Booking summary card, ~332px tall, ~28px corners. Service on one line. Info box in two lines.
   - **Right column.** "Pay deposit" card: `card`, 1px `border`, ~28px corners, ~32px padding, ~417px tall.
     - Title "Pay deposit" (PT Serif, ~28px).
     - Under it, "$25 now • $58 due at the salon" (muted text, ~16px).
     - ~16px below: input "Card number •••• 4242" with a card icon at the right (~51px tall, ~18px corners).
     - ~13px below: two inputs side by side, ~13px gap, each ~178px wide, ~51px tall: "Expiry" and "CVC" (muted text).
     - ~21px below: primary button "Pay $25 Deposit", full width, ~51px tall.
     - ~12px below: outline button "Use Apple Pay", full width, ~47px tall.
     - ~16px below, centred: "Pending payments auto-release after 10 min" (muted text, ~14px).
3. **Footer.** ~40px below the content block. As on Landing.

## What changes between sizes (Pay deposit)

| Thing | Mobile | Tablet | Desktop |
|---|---|---|---|
| Layout | one column | two equal columns | two equal columns, centred ~903px |
| Timer banner | circle, "Slot held for 09:42", service pill | "Slot held for 09:42" and "Complete payment to confirm" | circle, "09:42 left", "We hold your slot while you pay securely." |
| Card title | "Deposit payment" | "Pay deposit" | "Pay deposit" plus "$25 now • $58 due at the salon" |
| Card fields | one saved-card row "•••• 4242 • Visa" | card row, "MM / YY", "CVC" | card row, "Expiry", "CVC" |
| Pay button | sticky bar, "Pay $25 Deposit" | "Pay $25" in the card | "Pay $25 Deposit" in the card |
| Apple Pay | no | no | "Use Apple Pay" |
| Caption | "Secure checkout • Balance $58 due at salon" | "256-bit encrypted • Balance $58 at salon" | "Pending payments auto-release after 10 min" |
| Error state | shown in design | not designed | not designed |
| Footer | no | no | yes |

---

## Links and behaviour (best reading of the designs)

- Every "Book Now" goes to `/book`. "WhatsApp us" opens the salon WhatsApp chat (same link as Landing).
- Pay deposit: the timer counts down from the hold time and the "09" circle shows its minutes. "Pay" starts the payment. "Use Apple Pay" starts an Apple Pay payment. After a failed payment, show the error box and keep the timer running.
- Hover and focus states are not designed. Use the same ones as Landing.

## Unclear (ask before guessing)

1. **Services and totals.** The summary lists two services ("Gel Manicure + Spa Pedicure"), but desktop shows only Gel Manicure as selected. The numbers also do not add up: the two services cost $48 and $58 and have $15 and $15 deposits, but the summary says deposit $25.00 and balance $58.00. Treated as sample numbers. Calculate real totals from the selected services. Also, the fourth service is "Brow Shape + Tint" here and "Brow Shape" in the owner Settings designs. Tell me which name is right, and whether several services can be chosen.
2. **Hold time.** The Pay deposit screens show a 10-minute hold ("09:42", "auto-release after 10 min"). Our agreed rule is 15 minutes. Also the notice on Booking says a slot is "held" before payment. Tell me which hold time to use and when the hold starts. What happens at 00:00 is not designed. Assumed: show a "slot released" message with a button back to `/book`.
3. **Cancellation window and money.** The designs say "Free cancellation up to 12h before" and "deposit refunded as salon credit". Our agreed rule is free reschedule or cancel more than 24h before, no automatic refunds in v1. The designs also show US dollars, a Miami address and a +1 phone number, while the real setup uses Paystack, kobo and +234 numbers. Treated all of this as sample copy. Tell me which words to use.
4. **Active nav link.** Desktop shows "Home" active on all three pages. These pages are not the Home page. Built as designed. Tell me if no link should be active.
5. **Footer.** Desktop Booking shows no footer, Pay deposit and Confirmation desktop do, and no mobile or tablet design shows one. Built as designed.
6. **Payment fields.** Mobile shows a saved card row ("•••• 4242 • Visa") with no expiry or CVC. Desktop and tablet show a card row plus Expiry or "MM / YY" and CVC. "Use Apple Pay" appears on desktop only. I have not checked whether Paystack, our chosen provider, allows in-page card fields or Apple Pay. Please check before building these. Also check that "256-bit encrypted" is true before it is shown.
7. **Stray text on mobile Pay deposit.** A faint "charge." overlaps the line "Secure checkout • Balance $58 due at salon". It looks like a rendering glitch. Ignored.
8. **Copy differs by breakpoint.** Headings, subtitles, button labels, service names ("Gel Manicure + Spa Pedicure" or "Gel + Pedicure"), "Cancel" or "Cancel booking", and captions all differ between sizes. Default: build exactly what each design shows and store the variants in `lib/sample-content.ts`. If one version is wanted everywhere, say which.
9. **Tablet and mobile header.** Same issue as About: the tablet header items look grouped near the centre. Use the mobile header layout stretched edge to edge.
10. **Route paths.** `/book` is known. The paths for Pay deposit and Confirmation are not in the designs. The Confirmation page opens from a WhatsApp link with an unguessable token. Tell me the paths you want.
11. **Colour for the error box.** The payment-failed box looks light pink. Used the `danger` token. If `ui.md` has no light background for `danger`, use `danger` at low opacity, not a new colour.
12. **Exact sizes.** All sizes above are estimates from the images.
