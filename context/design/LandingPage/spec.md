# Landing page spec (`/`)

Written from `Landing-Mobile.jpeg`, `Landing-Tablet.jpeg`, `Landing-Desktop.jpeg`.
Mobile (375px) is the reference. Sizes marked "~" are estimates measured from the images, not exact design values.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings use PT Serif, everything else DM Sans.

Suggested breakpoints (not from the design): mobile below 768px, tablet 768 to 1023px, desktop 1024px and up.

## Photos

| Place | File |
|---|---|
| Header logo (all sizes) | `public/images/logo.jpg`, cropped to a circle |
| Hero image | `public/images/saloon.jpg` |
| Card: Signature Gel Manicure | `public/images/nails.jpg` |
| Card: Silk Blowout + Gloss | `public/images/girl.jpg` |
| Card: Spa Pedicure Deluxe | `public/images/feet.jpg` |

Use object-fit cover on every photo. Not used on this page: `dark-saloon.jpg`, `lena.jpg`, `sofia.jpg`, `amara.jpg`.

## Sample content (for `lib/sample-content.ts`)

Salon: GlamSlot, tagline "Nails • Hair • Glow", city Miami, rating 4.9, 800+ reviews, address "24 Rose Lane, Miami, FL 33101", hours "Tue–Sun • 9:00 AM – 7:00 PM", closed Mondays, nearby note "2 min from Brickell station", WhatsApp "+1 (305) 555-0142".

| Service | Duration | Price | Deposit | Photo |
|---|---|---|---|---|
| Signature Gel Manicure | 60 min | $48 | $15 | nails.jpg |
| Silk Blowout + Gloss | 75 min | $65 | $20 | girl.jpg |
| Spa Pedicure Deluxe | 70 min | $58 | $15 | feet.jpg |

Show "Signature Gel Manicure" as the selected card by default.

## Shared pieces

**Header.** Background token `background`, thin bottom border (`border`). Left: circular logo (~36px on mobile, ~48px on desktop) next to the word "GlamSlot" in PT Serif. Header height ~68px on mobile.

**Service card.** White (`card`) background, 1px `border`, large rounded corners (~20px). Contents:
- Service name in PT Serif.
- Row: clock icon, duration in muted text, then the price in darker text.
- Row: deposit chip on the left (text like "$15 deposit", `secondary` background with its paired text colour, fully rounded), action button on the right.
- Unselected card: button reads "Select", filled `primary`, white text, ~12px radius.
- Selected card: crimson `primary` 2px border with a soft glow ring, a small filled `primary` circle with a white check mark beside the name, and the button reads "Selected" with `plum` background and white text.

**Primary button.** `primary` background, white text, ~12 to 14px radius, DM Sans medium.

**Secondary button.** White background, 1px `border`, dark text, same radius as primary.

**Footer (tablet and desktop).** Full-width band, `plum` background. Left: "GlamSlot" in PT Serif, white; below it "24 Rose Lane, Miami, FL • Tue–Sun 9am–7pm" in a muted light colour; below that a green button with a chat-bubble icon and the text "WhatsApp us" (use `accent`). Right: two link columns. Column "Visit": Services, About, Book Now. Column "Help": Cancellation policy, Contact. Column titles white, links muted light.

## Mobile (375px)

Page side padding ~20px. ~40px of vertical space between sections. Leave ~100px of bottom padding so the sticky bar never hides content.

1. **Header.** Logo and "GlamSlot" on the left. On the right: a "Book Now" primary button (compact), then a square hamburger button (outlined, 1px `border`, rounded, ~44px) holding a three-line icon.
2. **Hero card.** One rounded card (~24px radius, 1px `border`), photo on top, text underneath.
   - Photo: `saloon.jpg`, full width of the card, ~208px tall, top corners rounded.
   - Text area: `blush` background, ~21px inner padding.
   - Badge: white pill with border, text "Miami • Rated 4.9 by 800+ clients", small.
   - Heading: "Good hair days, booked in seconds." PT Serif, ~34px, tight line height (~38px), breaks after "days,".
   - Paragraph: "Pick your ritual, hold your slot with a small deposit, get gentle WhatsApp reminders. No account needed." Muted text colour, ~16px.
   - Button: full-width primary, ~52px tall, text "Book Now — from $28".
   - Trust line: small shield-check icon + "Free cancellation up to 12h • Pay deposit only", muted, small.
3. **Featured rituals.** Heading "Featured rituals" in PT Serif, ~24px. Below it, three service cards stacked, ~12px apart. On mobile each card is horizontal: photo on the left (~96px wide, full card height ~126px, left corners rounded), content on the right with ~16px padding.
4. **Visit us card.** White bordered rounded card. Title "Visit us" in PT Serif. Row: pin icon + "24 Rose Lane, Miami, FL 33101". Row: clock icon + "Tue–Sun • 9:00 AM – 7:00 PM". Two buttons side by side, equal width: a green "WhatsApp" button (filled, white text) and a "Call salon" secondary button.
5. **Sticky bottom bar (mobile only).** A full-width primary "Book Now" button fixed to the bottom of the screen, ~20px from the sides and bottom, rounded. It floats over the page content.

## Tablet (~768px)

Page side padding ~24px, content centred.

1. **Header.** Same elements as mobile (logo + name, "Book Now", hamburger).
2. **Hero card.** Two columns inside one rounded card, ~440px tall. Left ~52%: text on `blush` background with ~32px padding, vertically centred. Right ~48%: `saloon.jpg` filling the full height, no padding, right corners rounded, cropped to show the mirrors and chairs.
   - Badge: "Miami • 4.9 rated salon".
   - Heading: "Good hair days, booked in seconds." ~40px, wraps to three lines ("Good hair days," / "booked in" / "seconds.").
   - Paragraph: "Choose your ritual, hold your slot with a deposit, get WhatsApp reminders."
   - Two buttons side by side: primary "Book Now" and secondary "View services".
3. **Featured rituals.** Heading, then a two-column grid of vertical cards (~16px gap). Each card: photo on top (full width, ~144px tall, top corners rounded, about 2.4:1), then content with ~16px padding, same rows as the shared service card. Row 1: Signature Gel Manicure (selected), Silk Blowout + Gloss. Row 2: Spa Pedicure Deluxe, then the Visit us card.
4. **Visit us card (tablet version).** Same height as the neighbouring card, content vertically centred. Title "Visit us", one row with pin icon + "24 Rose Lane, Miami • Tue–Sun 9–7", then a full-width `plum` button "Book Now".
5. **Footer.** As described under Shared pieces.

No sticky bottom bar on tablet.

## Desktop (1024px and up)

Centred container, max width ~1120px (estimate), side margins around it.

1. **Header.** Left: logo (~48px) with "GlamSlot" and, under it, the tagline "Nails • Hair • Glow" in small muted text. Right: nav links "Home", "About", "Services", pin icon + "Find us", then a primary "Book Now" button. "Home" is the active link: `primary` text colour with a 2px `primary` underline. Hamburger is hidden.
2. **Hero card.** Two columns, ~500px tall, same structure as tablet. Left ~52% text (generous ~48px padding), right `saloon.jpg` full height with right corners rounded.
   - Badge: "Miami • 4.9 ★ from 800+ reviews" (see Unclear, the star).
   - Heading: "Good hair days, booked in seconds." ~52px, two lines ("Good hair days," / "booked in seconds.").
   - Paragraph: "Choose your ritual, hold your slot with a small deposit, and let gentle WhatsApp reminders do the rest. No account needed." Muted, ~18px.
   - Buttons: primary "Book Now — from $28", secondary "Our story".
   - Trust row under the buttons, three items in a line, small muted text, each with a small icon: shield-check "Free cancel 12h", chat bubble "WhatsApp reminders", pin "24 Rose Lane".
3. **Featured rituals.** Heading on the left, link "All services" on the right (`primary` colour, underlined). Below: three vertical cards in one row, equal width, ~24px gap. Same card layout as tablet.
4. **Info row.** Three equal white bordered cards under the services, ~24px gap. Each has an icon on the left, a main line, and a smaller muted line below it:
   - Pin icon, "24 Rose Lane, Miami", "2 min from Brickell station"
   - Clock icon, "Tue–Sun • 9 AM – 7 PM", "Closed Mondays"
   - Chat icon, "WhatsApp concierge", "+1 (305) 555-0142"
   There is no separate Visit us card on desktop.
5. **Footer.** As described under Shared pieces, content aligned to the same container width.

## Links and behaviour (best reading of the design)

- Every "Book Now" button goes to `/book`.
- "Our story" goes to `/about`. Header links "Home" `/`, "About" `/about`.
- "Select" on a card marks it selected (visual state only for now).
- Hover and focus states are not shown in the designs. Use a slightly darker `primary` on hover and a visible focus ring.

## Unclear (ask before guessing)

1. **Mobile hero photo.** The mobile design shows a different salon image (rust-coloured chairs, big window, plants, round counter) that is not among the 9 photos. Tablet and desktop match `saloon.jpg`. Use `saloon.jpg` on mobile unless another photo is supplied.
2. **Cancellation window.** The design says "Free cancellation up to 12h" and "Free cancel 12h". The agreed business rule is free cancel or reschedule more than 24h before. Confirm which text to show.
3. **Star glyph.** On desktop the badge shows an empty box where a star should be. Use ★ or a star icon.
4. **Tablet header.** Logo, "Book Now" and hamburger sit grouped near the centre instead of at the edges. Likely a design mistake. Use the mobile header layout stretched across the width.
5. **WhatsApp green.** The WhatsApp buttons look brighter than the `accent` token. Using `accent` unless told otherwise.
6. **Hamburger menu.** The open state is not designed. Assumed content: Home, About, Services, Find us, Book Now.
7. **"Select" action.** Not clear whether it should start a booking with that service preselected, or only toggle. Only toggles for now.
8. **Mobile footer.** Not visible in the mobile design (hidden behind the sticky bar). Assumed to be the same dark footer, stacked in one column.
9. **Sticky bar.** Unclear whether it has a background or blur behind it, and whether it stays on every scroll position.
10. **Exact sizes.** Container width, font sizes and padding above are estimates from the images.
