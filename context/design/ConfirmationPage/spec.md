# Confirmation page spec

Written from `Confirmation-Mobile.jpeg`, `Confirmation-Tablet.jpeg`, `Confirmation-Desktop.jpeg`.

This page is part of the public booking flow: Booking, then Pay deposit, then Confirmation. The other two pages have their own spec.md.

Mobile is a 375px frame, tablet a 768px frame, desktop a 1440px frame. Sizes marked "~" are estimates measured from the images, not exact design values.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings, card titles and big numbers use PT Serif. Everything else uses DM Sans. Token names used below: `background`, `foreground`, `border`, `input`, `card`, `muted` (background, and the muted text colour paired with it), `primary` (white text on it), `blush`, `plum`, `success`, `warning`, `danger`. Confirm each name exists in `ui.md` before using it.
Breakpoints: same as Landing (mobile below 768px, tablet 768 to 1023px, desktop 1024px and up). Use the same container max width and side padding as Landing. Measured: on desktop the header logo starts at the container's left edge and the container is ~1104px wide at a 1440px screen. Mobile side padding is 20px. Tablet side padding is ~24px.

## Reuse from Landing (do not rebuild)

Header, footer, buttons, the hamburger panel and the green WhatsApp button style already exist from Landing. Reuse them.
- **Header, desktop.** Logo (`public/images/logo.jpg`, ~36px circle) with "GlamSlot" and the tagline "Nails • Hair • Glow", nav Home / About / Services / Find us (pin icon), "Book Now" button. Height ~76px, 1px `border` line under it. In all three desktop designs "Home" is shown as the active link (see Unclear 2).
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

Copy differs by breakpoint (see Unclear 5). Store every variant in `lib/sample-content.ts` and switch with responsive classes using `display: none` (not just visually hidden), so screen readers read only one version. Each page section below lists its variants.

## Shared pieces

**Card.** `card` background, 1px `border`, large rounded corners: ~24px on Booking cards, ~28px on Pay deposit and Confirmation cards.

**Primary button.** `primary` background, white text, ~52px tall, ~18px corners, DM Sans medium ~18px, text centred.

**Outline button.** `card` background, 1px `border`, `foreground` text, ~47px tall, ~16px corners, ~16px text. **Danger outline button** is the same with a 1px `danger` border and `danger` text.

**Mobile sticky action bar.** Fixed to the bottom of the screen, full width, `background` colour, 1px `border` line on top, side padding 20px, top padding ~13px, bottom padding 16px plus the device safe-area inset. The designs leave ~28 to 52px under the buttons; treat it as safe-area space. Page content gets bottom padding equal to the bar height plus ~20px so the bar never hides content.

---

# Page 3: Confirmation

## Mobile (375px)

Side padding 20px.
1. **Header.** As above.
2. **Success mark.** ~24px below the header line, centred: circle ~64px, `success` tint background (light mint, the same as the `success` background token), with a thin check icon (~30px) in `success` colour.
3. **Heading.** ~24px below. "You're booked, Maria!" PT Serif, ~32px, centred, `foreground`. (The apostrophe in the design is a straight one.)
4. **Subtitle.** ~12px below. "Deposit paid • WhatsApp confirmation sent to +1 (305) 555-0199". Muted text, ~15px, centred, line height ~20px, wraps to two lines. Keep the phone number together on one line with non-breaking spaces.
5. **Details card.** ~24px below. `card`, 1px `border`, ~24px corners, ~20px padding, ~145px tall. Four rows ~28px apart, muted label on the left, `foreground` value right-aligned, ~15px: Service / Gel + Pedicure; When / Sat, Oct 11 • 10:30 AM; Code / GLAM-4821; Balance / $58 at salon.
6. **Action buttons.** ~16px below the card. A 2 by 2 grid, ~8px column gap, ~16px row gap, each button ~164px wide and ~47px tall, ~18px corners, ~18px text, centred. All four are outline buttons:
   - Row 1: "Add to calendar" (calendar-with-plus icon ~22px on the left of the text), "WhatsApp us" (chat-bubble icon ~22px on the left).
   - Row 2: "Reschedule", "Cancel" (danger outline button).
7. **Caption.** ~16px below. "Free reschedule up to 12h before • Deposit becomes salon credit if cancelled in time." Muted text, ~14px, centred, two lines.
8. **Sticky action bar.** Primary button "Manage booking", full width, ~52px tall.

No footer on mobile.

## Tablet (~768px)

Side padding ~24px. No sticky bar, no footer.
1. **Header.** As above.
2. **Success mark.** ~32px below the header line. Same as mobile (~64px, centred).
3. **Heading.** "You're booked!" PT Serif, ~40px, centred. (No name on tablet.)
4. **Subtitle.** "Sat, Oct 11 • 10:30 AM with Amara • Code GLAM-4821". Muted text, ~16px, centred, one line.
5. **Two cards**, ~28px below the subtitle, ~12px gap, each ~352px wide, ~201px tall, `card`, 1px `border`, ~24px corners, ~20px padding.
   - **Left card.** Title "Details" (PT Serif, ~20px). Under it "Gel + Pedicure • $25 paid • $58 at salon" (`foreground`, ~16px). Under that "Reminders: 24h + 2h on WhatsApp" (muted text, ~16px).
   - **Right card.** Three full-width buttons stacked, ~8px apart, each ~47px tall, ~16px corners: "Add to calendar" (primary button), "Reschedule" (outline), "Cancel booking" (danger outline).
6. **Caption.** ~16px below the cards, centred: "Deposit refunded as credit if cancelled 12h+ before." Muted text, ~14px.
7. Page bottom padding ~48px.

## Desktop (1024px and up)

1. **Header.** As above.
2. **Success mark.** ~48px below the header line, centred: circle ~80px, `success` tint background, thin check icon (~36px) in `success` colour.
3. **Heading.** ~24px below. "You're booked, Maria!" PT Serif, ~52px (same as the Landing hero heading), centred. (Straight apostrophe in the design.)
4. **Subtitle.** ~16px below. "A WhatsApp confirmation is on its way. We saved your slot and your stylist can’t wait." Muted text, ~18px, centred, one line. (Curly apostrophe in "can’t" in the design.)
5. **Two cards.** ~40px below the subtitle. Centred, ~802px wide in total, two equal cards ~393px wide, ~16px gap, same height (~180px). `card`, 1px `border`, ~28px corners, ~24px padding.
   - **Left card.** Title "Gel Manicure + Spa Pedicure" (PT Serif, ~24px). ~16px below: "Sat, Oct 11 • 10:30 AM • with Amara" (`foreground`, ~17px). ~16px below: "Code GLAM-4821 • $25 paid • $58 due at salon" (muted text, ~16px). The rest of the card is empty.
   - **Right card.** "Add to calendar" primary button, full width, ~51px tall. ~8px below, two buttons side by side, ~8px gap, each ~47px tall: "Reschedule" (outline) and "Cancel" (danger outline). ~16px below, left-aligned: "Free until 12h before • deposit becomes credit" (muted text, ~14px).
6. **Footer.** ~48px below the cards. As on Landing.

## What changes between sizes (Confirmation)

| Thing | Mobile | Tablet | Desktop |
|---|---|---|---|
| Heading | "You're booked, Maria!" ~32px | "You're booked!" ~40px | "You're booked, Maria!" ~52px |
| Subtitle | deposit paid and the WhatsApp number | date, time, stylist and code | WhatsApp confirmation sentence |
| Booking details | one card with four rows | left card "Details", two text lines | left card with service title and two text lines |
| Buttons | 2 by 2 outline grid, plus sticky "Manage booking" | three stacked, "Add to calendar" is primary | "Add to calendar" primary, then Reschedule and Cancel in a row |
| "WhatsApp us" button | yes (in the grid) | no | no (only in the footer) |
| Cancel label | "Cancel" | "Cancel booking" | "Cancel" |
| Footer | no | no | yes |

---

## Links and behaviour (best reading of the designs)

- Every "Book Now" goes to `/book`. "WhatsApp us" opens the salon WhatsApp chat (same link as Landing).
- Confirmation: "Add to calendar" downloads or opens a calendar event for the booking. "Reschedule" and "Cancel" start those actions for this booking. "Manage booking" (mobile) goes to the booking management view.
- Hover and focus states are not designed. Use the same ones as Landing.

## Unclear (ask before guessing)

1. **Cancellation window and money.** The designs say "Free cancellation up to 12h before" and "deposit refunded as salon credit". Our agreed rule is free reschedule or cancel more than 24h before, no automatic refunds in v1. The designs also show US dollars, a Miami address and a +1 phone number, while the real setup uses Paystack, kobo and +234 numbers. Treated all of this as sample copy. Tell me which words to use.
2. **Active nav link.** Desktop shows "Home" active on all three pages. These pages are not the Home page. Built as designed. Tell me if no link should be active.
3. **Footer.** Desktop Booking shows no footer, Pay deposit and Confirmation desktop do, and no mobile or tablet design shows one. Built as designed.
4. **Confirmation actions.** Not designed: where "Manage booking" goes, what "Add to calendar" produces (assumed a calendar file download), what the two cancel and reschedule screens look like, and whether "WhatsApp us" on mobile should be outline (as designed) or green like the footer button. The desktop and tablet Confirmation pages have no "WhatsApp us" button outside the desktop footer.
5. **Copy differs by breakpoint.** Headings, subtitles, button labels, service names ("Gel Manicure + Spa Pedicure" or "Gel + Pedicure"), "Cancel" or "Cancel booking", and captions all differ between sizes. Default: build exactly what each design shows and store the variants in `lib/sample-content.ts`. If one version is wanted everywhere, say which.
6. **Tablet and mobile header.** Same issue as About: the tablet header items look grouped near the centre. Use the mobile header layout stretched edge to edge.
7. **Route paths.** `/book` is known. The paths for Pay deposit and Confirmation are not in the designs. The Confirmation page opens from a WhatsApp link with an unguessable token. Tell me the paths you want.
8. **Name in the heading.** Mobile and desktop say "Maria" (from the details form). Tablet omits it. Built as designed.
9. **Exact sizes.** All sizes above are estimates from the images.
