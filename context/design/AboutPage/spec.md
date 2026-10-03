# About page spec (`/about`)

Written from `About-Mobile.jpeg`, `About-Tablet.jpeg`, `About-Desktop.jpeg`.
Mobile (375px) is the reference. Sizes marked "~" are estimates measured from the images, not exact design values.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings use PT Serif, body text DM Sans.
Breakpoints: same as the Landing page (mobile below 768px, tablet 768 to 1023px, desktop 1024px and up). Use the same container max width and side padding as Landing.

## Reuse from Landing (do not rebuild)

Header, footer, primary and secondary buttons, the WhatsApp green button style, the hamburger panel and the sticky mobile "Book Now" bar already exist from the Landing page. Reuse those components. The only change in the header is the active nav link: on About, "About" is the active link (`primary` text with a 2px `primary` underline) and "Home" is normal.

Landing's mobile page bottom padding (~100px, so the sticky bar never hides content) also applies here.

## Photos

| Place | File |
|---|---|
| Header logo | `public/images/logo.jpg`, circular crop |
| Hero image (tablet and desktop) | `public/images/dark-saloon.jpg` |
| Team: Amara avatar | `public/images/amara.jpg` |
| Team: Sofia avatar | `public/images/sofia.jpg` |
| Team: Lena avatar | `public/images/lena.jpg` |

Avatars are circles, object-fit cover, face centred. The three portraits are square, so no cropping problems. Hero image: object-fit cover. Give every image meaningful alt text, for example "Amara, master colorist" and "GlamSlot salon interior". Not used on this page: `saloon.jpg`, `nails.jpg`, `girl.jpg`, `feet.jpg`.

## Sample content (for `lib/sample-content.ts`)

Reuse the salon object from Landing (address "24 Rose Lane, Miami, FL 33101", phone "+1 (305) 555-0142", hours "Tue–Sun 9am–7pm", WhatsApp). Add:

| Name | Photo | Role, mobile and desktop | Role, tablet |
|---|---|---|---|
| Amara | amara.jpg | desktop "Master colorist • 9 yrs"; mobile "Master colorist • 9 yrs" | "Colorist" |
| Sofia | sofia.jpg | desktop "Nail artist • 6 yrs"; mobile "Nails & art • 6 yrs" | "Nails" |
| Lena | lena.jpg | desktop "Skin & brows • 5 yrs"; mobile "Skin & brows • 5 yrs" | "Brows" |

Team order is always Amara, Sofia, Lena.

Hero text, which differs by breakpoint (see Unclear 2 for how to build it):

- Heading, all sizes: "A little salon with a big heart."
- Desktop eyebrow above the heading: "Our story"
- Desktop paragraph: "Founded by Amara in 2019, GlamSlot keeps beauty stress-free: transparent deposits, honest timing, and reminders that actually help."
- Tablet paragraph: "Two chairs in 2019, a neighborhood ritual today. Deposits keep slots fair for everyone."
- Mobile paragraph: "GlamSlot started in 2019 with two chairs and one promise: never rush a client. Today our all-women team serves 800+ regulars with deposits that protect both sides."

## Team card (shared look)

White (`card`) background, 1px `border`, large rounded corners (~22 to 24px). The layout inside changes per breakpoint (below). Name in the card is the staff first name; role line is muted text (`muted` colour) and smaller.

## Mobile (375px)

Page side padding ~20px. ~28px of vertical space between sections.

1. **Header.** Same as Landing mobile (logo + "GlamSlot", compact "Book Now", hamburger).
2. **Hero image.** Full width inside the page padding, ~335px wide by ~192px tall (about 1.75:1), corners ~24px. This is a wide photo of a salon interior (see Unclear 1 for the photo).
3. **Heading.** "A little salon with a big heart." PT Serif, ~32px, line height ~35px, wraps to two lines ("A little salon with a big" / "heart.").
4. **Paragraph.** The mobile paragraph above, muted colour, ~15 to 16px, ~20px line height.
5. **"Meet the team".** PT Serif heading, ~22px. Below it, three team cards stacked, ~13px apart. Each card is a horizontal row, ~73px tall, ~16px padding: round avatar (~48px) on the left, then name (DM Sans, medium, ~16px) over the role line (muted, ~14px), and at the far right a small "Book" pill (`secondary` background with its paired text colour, fully rounded, visually ~44px wide by ~24px tall; make the tap area at least 44px tall).
6. **Contact card.** White bordered rounded card below the team. Title "Contact" in PT Serif. Row: phone icon + "+1 (305) 555-0142". Row: pin icon + "24 Rose Lane, Miami". The rest of this card is hidden behind the sticky bar in the design (see Unclear 4).
7. **Sticky bottom bar.** Same full-width primary "Book Now" button as Landing.

No eyebrow and no hero buttons on mobile.

## Tablet (~768px)

Page side padding ~24px.

1. **Header.** Same as Landing tablet (logo + "GlamSlot", "Book Now", hamburger).
2. **Hero.** Two columns, image on the LEFT, text on the RIGHT (opposite of desktop). Gap ~32px. Image ~350px wide by ~288px tall (about 1.2:1), corners ~24px, `dark-saloon.jpg`. Text column is vertically centred against the image:
   - Heading: "A little salon with a big heart." PT Serif, ~34px, two lines.
   - Paragraph: the tablet paragraph above, muted, ~15 to 16px.
   - Button: primary "Book Now", full width of the text column, ~44px tall.
3. **"Meet the team".** Heading (~22px), then three equal cards in one row, ~12px apart. Each card is vertical and centred: avatar (~64px circle) on top, then the name (DM Sans, medium, ~18px, centred), then the role (muted, ~14px, centred). Card about 232px wide by 150px tall. Tablet roles are the short ones: "Colorist", "Nails", "Brows". No "Book" pill.
4. **Contact strip.** One full-width white bordered rounded card (~85px tall). Left: text "24 Rose Lane • +1 (305) 555-0142". Right: green button with chat icon, "WhatsApp" (`accent`, white text).
5. **Footer.** Same as Landing (dark `plum` band, GlamSlot, address and hours, "WhatsApp us" button, Visit and Help link columns).

No sticky bar on tablet.

## Desktop (1024px and up)

Container max width same as Landing.

1. **Header.** Same as Landing desktop (logo with tagline "Nails • Hair • Glow", nav Home / About / Services / Find us, "Book Now"). "About" is active.
2. **Hero.** Two columns, roughly 50/50 with ~48px gap, no card background (plain page background). Text on the LEFT, vertically centred; image on the RIGHT.
   - Eyebrow: "Our story" in `primary` colour, DM Sans, ~16px.
   - Heading: "A little salon with a big heart." PT Serif, ~52px (same as the Landing hero heading), wraps to two lines ("A little salon with a big" / "heart.").
   - Paragraph: the desktop paragraph above, muted, ~18px, ~28px line height, wraps to three lines.
   - Buttons side by side: primary "Book Now" (~52px tall), secondary "WhatsApp us" with a chat-bubble icon on the left of the text.
   - Image: `dark-saloon.jpg`, ~540px wide by ~490px tall (nearly square, a little wider than tall), corners ~32px.
3. **"Meet the team".** Heading PT Serif ~32px, ~64px below the hero. Below it, three equal cards in one row, ~22px apart. Each card is horizontal, ~115px tall, ~24px padding: avatar circle (~65px) on the left, then to its right the name in PT Serif (~22px) over the role line (muted, ~15px). Roles use the desktop strings: "Master colorist • 9 yrs", "Nail artist • 6 yrs", "Skin & brows • 5 yrs". No "Book" pill.
4. No contact card on desktop.
5. **Footer.** Same as Landing.

## Links and behaviour (best reading of the design)

- Every "Book Now" goes to `/book`. "WhatsApp us" and "WhatsApp" open the salon WhatsApp chat (same link as Landing).
- Header "About" is the current page. Other links as on Landing.
- Mobile "Book" pill on a team card goes to `/book` (see Unclear 5).
- Hover and focus states are not designed. Use the same ones as Landing.

## Unclear (ask before guessing)

1. **Mobile hero photo.** The mobile design shows a different salon image from the other two sizes (dark wood floor, oval lit mirrors, shampoo basins at the back, fluted counter on the right). It is not among the 9 photos. Same situation as Landing. Use `dark-saloon.jpg` on mobile unless another photo is supplied.
2. **Copy differs by breakpoint.** The hero paragraph, the eyebrow, the hero buttons and the role labels are different on mobile, tablet and desktop. Default: build exactly what each design shows. Store the three paragraphs and the short and long roles in `lib/sample-content.ts`, and switch them with responsive classes using `display: none` (not just visually hidden), so screen readers only read one version. If one version is wanted everywhere, say which.
3. **Tablet and mobile header.** Same issue as Landing: the tablet header items appear grouped near the centre. Use the mobile header layout stretched edge to edge.
4. **Mobile Contact card.** Its lower part is covered by the sticky bar. A green shape is faintly visible behind the bar, so a WhatsApp button probably sits under the address. Assumed: a green "WhatsApp" button (`accent`) below the address, like the Landing "Visit us" card.
5. **"Book" pill on team cards.** It may mean "book with this person". The booking flow has an optional staff step, but it is not built yet. For now it links to `/book` with no staff preselected.
6. **Name font.** On desktop the staff names are PT Serif, but on mobile and tablet they look like DM Sans. Built as designed.
7. **Mobile footer.** Not visible in the mobile design. Assumed the same dark footer, stacked in one column.
8. **Founder claim.** The desktop paragraph says "Founded by Amara", while the team table shows her as one of three staff. Sample copy only, but check it reads right before showing a real salon.
9. **Exact sizes.** All sizes above are estimates from the images.
