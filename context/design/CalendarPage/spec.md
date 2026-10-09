# Calendar page spec (owner side)

Written from `Calendar-Mobile.jpeg`, `Calendar-Tablet.jpeg`, `Calendar-Desktop.jpeg`.
This is the salon OWNER's daily calendar. It is the page the owner lands on after sign-in (`/dashboard`, see Unclear 2). It is not part of the public site: no public header, footer or sticky "Book Now" bar.
Mobile is a 375px frame, tablet a 768px frame, desktop a 1440px frame. Sizes marked "~" are estimates measured from the images, not exact design values.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings, the page title and big numbers use PT Serif. Everything else uses DM Sans. Token names used below: `background`, `foreground`, `border`, `input`, `card`, `muted` (background, and the muted text colour paired with it), `primary` (white text on it), `blush`, `plum`, `success`, `warning`, `danger`. Confirm each name exists in `ui.md` before using it.
Breakpoints: same as the rest of the site (mobile below 768px, tablet 768 to 1023px, desktop 1024px and up). The desktop design is a 1440px frame, so it also needs a plan for 1024 to ~1300px (see Unclear 6).

## Reuse from Settings (do not rebuild)

The owner shell already exists from the Settings page (`components/settings/owner-shell.tsx`): the desktop sidebar, the mobile and tablet bottom tab bar, and the sign-out control. Reuse it. Do not build a second one. Only the active item changes: on this page "Calendar" is active and "Settings" is not.
For reference, the shell as it appears in these designs:
- **Desktop sidebar.** ~240px wide, full viewport height, fixed, `plum` background, ~20px padding. Brand block at the top: `public/images/logo.jpg` as a ~36px circle, then "GlamSlot" (PT Serif, ~18px, `background` colour) over "Owner studio" (DM Sans, ~13px, light muted text). Four nav items (Calendar, Bookings, Clients, Settings), each ~44px tall, ~16px corners, icon ~20px plus label ~16px. Inactive: light muted text and icon. Active ("Calendar"): `primary` background, white text and icon. At the bottom, the deposits card: "Today's deposits", "$240", "6 bookings • 1 pending" (see Sample content).
- **Mobile and tablet bottom bar.** Fixed to the bottom, full width, ~73px tall, `plum` background, four equal items: Calendar, Clients, Settings, More. Icon ~24px above a ~13px label. Inactive: light muted text and icon. Active ("Calendar"): a rounded block ~84px wide by ~56px tall (it hugs the label), ~16px corners, slightly lighter than `plum`, with a `background` colour (cream) icon and label. "Lighter than `plum`" means `plum` with a white overlay at ~10% opacity, not a new colour (same decision as Settings).
- Page content gets bottom padding equal to the bar height plus ~20px so the bar never hides content.

## Photos

| Place | File |
|---|---|
| Desktop sidebar brand mark | `public/images/logo.jpg`, circular crop, ~36px |

That is the only photo on this page. Do not use any other photo here: `lena.jpg`, `sofia.jpg`, `amara.jpg`, `dark-saloon.jpg`, `saloon.jpg`, `nails.jpg`, `girl.jpg`, `feet.jpg`. The stylist column headers are text only, with no avatars. Do not add any.
The logo has the text "GlamSlot" next to it, so give the image `alt=""` (decorative). Mobile and tablet show no logo.

## Sample content (design values, for checking only)

Everything on this page comes from the database in the real build. The values below are what the designs show, so the agent can check its output against them. Real values: money in ₦ (stored as integer kobo), times in Africa/Lagos, phone numbers +234 (see Unclear 12).

| Item | Design value |
|---|---|
| Page title, desktop and mobile | "Saturday, Oct 11" |
| Page title, tablet | "Sat, Oct 11" |
| Desktop subtitle | "Week 41 • 3 stylists on shift" |
| Mobile subtitle | "6 bookings • $240 deposits" |
| Sidebar deposits card | "Today's deposits" / "$240" / "6 bookings • 1 pending" |
| Stylists (left to right) | Amara, Sofia, Lena |

Bookings and slots in the designs:

| Time | Stylist | Client | Service | Status | Money |
|---|---|---|---|---|---|
| 10:30 | Amara | Maria Lopez | Gel + Pedicure | Paid | $25 deposit paid |
| 11:15 | Sofia | Jess R. | Silk Blowout | Pending | $20 pending |
| 1:00 | Amara | none | none | Empty, available | none |
| 2:30 | Sofia | Priya S. | Brow + Tint | Paid | $10 paid |
| 12:00 | Lena | none | none | Blocked | none |
| 3:00 | Lena | Nina | not shown | looks Paid | not shown |

Selected booking in the desktop panel and the mobile card: Maria Lopez, +1 (305) 555-0199, Gel + Pedicure, with Amara, "$25 deposit paid". Selected booking in the tablet card: Jess R., Silk Blowout, pending, $20.
Copy differs by breakpoint (see Unclear 15). Store every variant and switch with responsive classes using `display: none` (not just visually hidden), so screen readers read only one version.

## Shared pieces

**Status pill** (mobile list, desktop panel badge). Fully rounded, ~14 to 15px text.
- "Paid": `success` background (the light mint), `success` text. ~41px wide by ~23px tall on the mobile list.
- "Pending": `warning` background (light amber), `warning` text.
- Desktop panel badge: "$25 deposit paid", `success` background and text, ~24px tall, ~121px wide, ~14px text.

**Action buttons** (all sizes). ~44px tall (~40px for the small tablet pair), ~16 to 18px corners, DM Sans ~16px, text centred.
- Outline: `card` background, 1px `border`, `foreground` text.
- Danger solid: `danger` background, white text (the "Cancel" button on desktop and mobile).
- Danger outline: `card` background, 1px `danger` border, `danger` text (the "Cancel" button on tablet).
- Primary: `primary` background, white text.

**Details of a booking** appear in three different shapes (inline card on mobile, small card on tablet, side panel on desktop). All three show the same booking.

---

# Mobile (375px)

Page background `background`. No sidebar.
1. **Title band.** Full width, ~76px tall, `plum` background, left padding 20px, right padding 20px.
   - Left: "Saturday, Oct 11" (PT Serif, ~24px, `background` colour). Under it "6 bookings • $240 deposits" (light muted text, ~14px).
   - Right: button "+ Add", ~71px wide, ~44px tall, `primary` background, white text ~17px, ~18px corners, vertically centred in the band.
2. **Tabs.** ~16px below the band, side padding 16px. Three tabs in one row, widths ~110, ~112 and ~111px, gap ~5px, each ~40px tall, ~16px corners, text ~18px centred: "Day", "Week", "Staff".
   - Active ("Day"): `plum` background, `background` colour text, no visible border.
   - Inactive ("Week", "Staff"): `card` background, 1px `border`, muted text.
   - A 1px full-width `border` line sits ~13px below the tabs.
3. **Booking list.** ~13px below the line, side padding 16px, cards stacked ~9px apart. All cards are ~343px wide and ~61px tall (the whole list is in time order, all stylists together, with no stylist names). Each card has the time on the left (DM Sans, ~17px, `foreground`, ~13px from the card edge, about 60px wide), then the service and a detail line, then the status on the right.
   - **Paid card** (10:30, then 2:30): `card` background, 1px `border`, ~24px corners. Service "Gel + Pedicure" (DM Sans medium, ~18px, `foreground`) over "Maria L. • $25 paid" (muted text, ~15px). Right: "Paid" pill, ~13px from the card edge.
   - **Pending card** (11:15): `card` background, 2px `warning` border, ~24px corners. "Silk Blowout" over "Jess R. • pending". Right: "Pending" pill (~62px wide).
   - **Empty card** (1:00): transparent or `card` background, 1.5px DASHED border in `foreground`, ~28px corners. "Empty — Available" (DM Sans medium, ~18px) over "Tap + to book" (muted text, ~15px). Right: a "+" icon (~24px, `foreground`). Tapping starts adding a booking for that time.
   - Fourth card (2:30): "Brow + Tint" over "Priya S. • $10 paid", "Paid" pill.
4. **Selected booking card.** ~13px below the list. `card`, 1px `border`, ~28px corners, ~17px padding, ~189px tall. Title "Maria Lopez — 10:30" (PT Serif, ~22px, `foreground`). Under it "+1 (305) 555-0199 • with Amara" (muted text, ~15px). ~16px below, a 2 by 2 grid of buttons, ~9px gaps, each ~150px wide and ~43px tall, ~18px corners, text ~18px: row 1 "Reschedule" (outline), "Message" (outline); row 2 "No-show" (outline), "Cancel" (danger solid). This card appears under the list on mobile (see Unclear 6).
5. **Bottom tab bar.** The shell's bottom bar (above). "Calendar" active.

No separate staff names, no hour labels, no sidebar and no deposits card on mobile (the deposits total is in the band).

---

# Tablet (~768px)

Side padding ~24px. No sidebar, no title band.
1. **Title row.** ~16px from the top. Left: "Sat, Oct 11" (PT Serif, ~28px, `foreground`). Right: button "+ Add booking", ~127px wide by ~44px tall, `primary` background, white text ~16px, ~16px corners. A 1px full-width `border` line ~16px below the row.
2. **Two areas side by side**, ~24px below the line, ~12px gap:
   - **Stylist columns (left, ~480px wide).** Two columns of equal width (~235px) with a ~12px gap: Amara and Sofia. Each column has a name at the top (DM Sans medium, ~16px, `foreground`), then ~10px below it the cards stacked ~8px apart. Each card is ~235px wide and ~45px tall, ~16px corners, ~12px left padding, one line of text centred vertically, ~16px, format `time • name • status`:
     - Amara: "10:30 • Maria • Paid" (paid card), "1:00 • — empty" (empty card).
     - Sofia: "11:15 • Jess • Pending" (pending card), "2:30 • Priya • Paid" (paid card).
     - **Paid card:** `blush` background and a 1px border in a pink tone (see Unclear 13). `foreground` text.
     - **Pending card:** `warning` background (light amber) with a 1px `warning` border. `foreground` text.
     - **Empty card:** `card` background, 1px DASHED `border`, muted text.
   - **Details card (right, ~234px wide).** `card`, 1px `border`, ~24px corners, ~17px padding, ~208px tall, top edge level with the column names. It shows the PENDING booking:
     - Title "Booking details" (PT Serif, ~20px).
     - "Jess R. • Silk Blowout • pending $20" (muted text, ~15px, wraps to two lines).
     - ~16px below: primary button "Confirm payment", full width, ~44px tall (see Unclear 7: do not build this action yet).
     - ~14px below: two buttons side by side, ~8px gap, each ~97px wide and ~40px tall, ~16px corners, ~15px text: "Reschedule" (outline) and "Cancel" (danger outline).
3. **Bottom tab bar.** As above, "Calendar" active, ~21px below the details card in the design (it is fixed to the bottom of the viewport in the build).

Lena's column is not shown on tablet (see Unclear 5). No hour labels, no "Day • Week" control and no "Lena" column.

---

# Desktop (1024px and up)

Three regions side by side at 1440px: sidebar (~240px, the shell), main area (~880px), details panel (~320px).

## Main area

Left and right padding ~32px (content ~816px wide). ~36px top padding to the top of the buttons.
1. **Title row.**
   - Left: "Saturday, Oct 11" (PT Serif, ~36px, `foreground`). Under it "Week 41 • 3 stylists on shift" (muted text, ~16px).
   - Right: two controls ~8px apart, both ~44px tall, ~16px corners, ~16px text, vertically aligned with the title:
     - "Day • Week" button: ~131px wide, `card` background, 1px `border`, `foreground` text, a calendar icon (~20px) on the left of the text. Its behaviour is not designed (see Unclear 3).
     - "+ Add booking / Block time" button: ~219px wide, `primary` background, white text.
2. **Calendar grid**, ~22px below the subtitle. Four equal columns with ~12px gaps (~195px each): the first column holds the hour labels, then Amara, Sofia, Lena. The first column is as wide as a stylist column. The design leaves it mostly empty (see Unclear 4).
   - **Stylist names** in the top row of columns 2 to 4: "Amara", "Sofia", "Lena" (DM Sans medium, ~17px, `foreground`), left-aligned with the cards, ~10px above the first card.
   - **Hour labels** in column 1: "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM" (DM Sans, ~15px, muted text), ~76px apart, left-aligned, each ~12px below the top of its 76px row. The first row starts level with the top of the first card row. The labels do not line up with the card rows, which are ~72px apart (see Unclear 4).
   - **Card rows** (columns 2 to 4), three rows, ~8px apart, each card ~195px wide and ~64px tall, ~20px corners, ~12px left padding, text one line near the top of the card (~23px from its top edge), ~16px:
     - Row 1: Amara "10:30 Maria" (paid card), Sofia "11:15 Jess" (pending card), Lena "12:00 Blocked" (blocked card).
     - Row 2: Amara "1:00 —" (empty card), Sofia "2:30 Priya" (paid card), Lena "3:00 Nina" (paid card).
     - Row 3: one dashed "add" card per column, each with a centred "+" (~24px, muted text).
     - **Paid card:** `blush` background, 1px border in a pink tone (see Unclear 13), `foreground` text.
     - **Pending card:** `warning` background (light amber) with a 1px `warning` border, `foreground` text.
     - **Blocked card:** `muted` background, 1px DASHED border in muted text colour, muted text.
     - **Empty card ("1:00 —"):** drawn the same as the blocked card.
     - **Add card (row 3):** transparent background, 1px DASHED `border`, centred "+" in muted text. Tapping starts adding a booking for that stylist.
3. Page content ends where the cards end. The area below is empty `background`.

## Details panel (right)

Full height, ~320px wide, `background` colour, 1px `border` line on its left edge, ~24px padding. In the design it is open and shows Maria Lopez's booking.
1. **Header row.** "Booking details" (PT Serif, ~24px, `foreground`) on the left; a close "X" icon (~24px, `foreground`) on the right. Both are ~36px from the panel top (title baseline level with the page title).
2. **Client.** ~24px below. "Maria Lopez" (DM Sans medium, ~18px, `foreground`). Under it "+1 (305) 555-0199 • Gel + Pedicure" (muted text, ~15px).
3. **Badge.** ~14px below: "$25 deposit paid" (status pill, `success`).
4. **Buttons.** ~18px below. A 2 by 2 grid, ~8px gaps, each ~132px wide and ~44px tall, ~16px corners: row 1 "Reschedule" (outline), "Message" (outline); row 2 "No-show" (outline), "Cancel" (danger solid).
5. **Caption.** ~21px below. "Empty day? Invite waitlist with one WhatsApp broadcast." (muted text, ~14px, left-aligned, two lines). See Unclear 11: do not build this yet.

## What changes between sizes

| Thing | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navigation | bottom bar | bottom bar | left sidebar |
| Page title | "Saturday, Oct 11" in a `plum` band, with "6 bookings • $240 deposits" | "Sat, Oct 11", plain, with a divider line | "Saturday, Oct 11" with "Week 41 • 3 stylists on shift" |
| Add button | "+ Add" in the band | "+ Add booking" | "+ Add booking / Block time", beside "Day • Week" |
| View controls | tabs: Day, Week, Staff | none | "Day • Week" button |
| Layout of bookings | one list, time order, all stylists, no names | two stylist columns (Amara, Sofia) | three stylist columns plus hour labels and "+" row |
| Booking card text | time, service, "name • money", status pill | "time • name • status" | "time name" |
| Details of a booking | card under the list | card to the right of the columns | side panel with close "X" |
| Booking shown in details | Maria (paid) | Jess (pending) | Maria (paid) |
| Buttons in details | Reschedule, Message, No-show, Cancel | Confirm payment, Reschedule, Cancel | Reschedule, Message, No-show, Cancel |
| Deposits total | in the band | not shown | sidebar card |

---

## Links and behaviour (best reading of the designs)

- Nav items: Calendar is the current page. Other items go to their owner pages, the same as in the Settings shell. "More" opens the existing menu with sign-out (see Unclear 1).
- Tapping a booking card shows that booking's details (mobile card, tablet card, desktop panel). The desktop "X" closes the panel.
- Tapping an empty or "+" card starts adding a booking for that time and stylist. "+ Add", "+ Add booking" and "+ Add booking / Block time" start adding a booking for the viewed day. The add form is not designed (see Unclear 10).
- "Message" opens a WhatsApp chat with the client (assumed a `wa.me` link, see Unclear 8). "Reschedule", "No-show" and "Cancel" act on the selected booking after a confirmation step (see Unclear 8).
- Hover and focus states are not designed. Use the same ones as Settings.

## Unclear (ask before guessing)

1. **Nav items with no page.** The sidebar and bottom bar show Bookings (desktop only), Clients and More. AGENTS.md lists only Login, Calendar and Settings as owner pages. Assumed the same as the Settings shell: reuse it exactly and do not build new pages. Tell me what Bookings and Clients should do.
2. **Route.** The owner is sent to `/dashboard` after sign-in, so this page is assumed to live at `/dashboard`. Confirm.
3. **Changing the day and the view.** There are no previous or next day controls, and no date picker. The desktop "Day • Week" button and the mobile "Day / Week / Staff" tabs are not explained, and no Week or Staff view is designed. The project overview says the calendar is a day view. Assumed: build the Day view only, show the Week and Staff tabs as disabled (or hide them), and the "Day • Week" button opens a date picker. Tell me how the owner moves to another day.
4. **Is it a real time grid?** Desktop shows hour labels (9 AM to 2 PM) in a first column as wide as a stylist column, but the cards do not line up with them: card rows are ~72px apart and labels ~76px. The first card (10:30) sits beside "9 AM". It looks like a list of cards per stylist with a decorative label column. Assumed: build as drawn (each stylist column is that stylist's bookings, blocked times and empty slots in time order, then one row of "+" cards) and keep the label column as drawn. A real timeline is a different build. Tell me which you want. Also unclear: which empty slots to list (every free slot or only some) and what the "+" row creates.
5. **Tablet shows two stylists, not three.** Lena's column is missing, and mobile hides stylist names. Assumed: tablet shows all three stylists, scrolling sideways if needed. Mobile stays one list. Tell me the real intent.
6. **Details panel.** Open or closed by default, and how a booking looks selected, is not designed (the selected cards look like the others). Desktop at 1440px has room for the 320px panel, but at 1024 to ~1300px the grid would be too narrow. Assumed: below ~1280px the panel opens as a drawer on top of the grid (AGENTS.md calls it a "drawer"). It opens when a booking is tapped, and nothing is highlighted on the card. Tell me if mobile and tablet should also use a drawer instead of an inline card.
7. **"Confirm payment" breaks a project rule.** The tablet card shows "Confirm payment" on a pending booking. Our rule is that a booking becomes confirmed only after a verified Paystack webhook, never from a button. Assumed: do NOT build this button until you decide (for example, cash or transfer deposits). Show Reschedule and Cancel only.
8. **What the actions do.** Not designed: "Reschedule" (assumed it follows the same server-side 24-hour rule as clients, and what the owner can override), "Message" (assumed a `wa.me` link, not an automated template, since reminders must use approved templates), "No-show" (does a `no_show` status exist? and does the deposit stay with the salon), "Cancel" (assumed a confirmation dialog, and what happens to the deposit). Tell me the rules.
9. **Block time.** The "Blocked" card and the "Block time" button need somewhere to store blocked times. As far as the tracker shows, the ten tables have no such table, and block time is not in the project overview. Assumed: do not build it. Show the button as "+ Add booking" until you approve a new table.
10. **Add booking.** The drawer or form is not designed. Tell me the fields (service, stylist, date, time, name, WhatsApp number, paid or unpaid).
11. **Waitlist caption.** "Empty day? Invite waitlist with one WhatsApp broadcast." describes a feature that is not in the project overview. Assumed: leave it out.
12. **Sample data is not our data.** The design shows dollars, a +1 phone number and "Saturday, Oct 11". In 2026, 11 October is a Sunday (the "Week 41" part is correct). Real values: ₦ amounts from kobo, +234 numbers, times in Africa/Lagos, the real weekday. The salon is closed on Mondays, so show a closed-day state for them (not designed). The "3 stylists on shift" number should count the stylists working that day. "$240 deposits" and the sidebar "Today's deposits" should be the deposits paid for bookings on the day shown. Tell me if the sidebar must always mean today.
13. **Colours with no token.** The paid and pending cards have a pink or amber border that is slightly stronger than `border`. Assumed: use `primary` at ~25% opacity for the paid border and `warning` at low opacity for the pending tint and border (no new colours). Mobile's pending card has a full 2px `warning` border and no tint. Tell me if `ui.md` has better tokens.
14. **Dashed styles differ.** The empty or blocked cards use three different dashed styles (desktop muted text colour on `muted` background, tablet light `border` on `card`, mobile dark `foreground`). Built as designed per size.
15. **Copy differs by breakpoint.** Titles, subtitles, card text format ("10:30 Maria" or "10:30 • Maria • Paid"), the add button label and the details content all differ. Default: build exactly what each design shows and store the variants. If one version is wanted everywhere, say which.
16. **Times.** Cards show 12-hour times with no AM or PM ("1:00", "2:30"). Hour labels have AM and PM. Built as designed. Hours shown come from the staff hours (the design shows 9 AM to 2 PM only).
17. **Not designed states.** Loading, an empty day with no bookings, a closed day, an error, and a failed action. Assumed: simple text states using the same card style as Settings. Tell me if you want something specific.
18. **Tablet and mobile bottom bar.** There is no Bookings item on mobile or tablet. Same as Settings. Built as designed.
19. **Exact sizes.** All sizes above are estimates from the images.
