# Settings page spec (owner side)

Written from `Settings-Mobile.jpeg`, `Settings-Tablet.jpeg`, `Settings-Desktop.jpeg`.
Mobile (375px) is the reference. Sizes marked "~" are estimates measured from the images, not exact design values.
How sizes were measured: the mobile image is 3x (375px wide). The tablet and desktop images are about 1.79x, so the tablet frame is ~768px and the desktop frame is ~1440px.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings and big numbers use PT Serif. Everything else uses DM Sans.
Breakpoints: same as Landing and About (mobile below 768px, tablet 768 to 1023px, desktop 1024px and up).
This is the salon OWNER area. It is not the public site. There is no public header, footer or sticky "Book Now" bar here. The owner shell (sidebar on desktop, bottom tab bar on mobile and tablet) is the navigation. Build the shell as one shared owner layout component, because the Calendar page will need it too.

## Photos

| Place | File |
|---|---|
| Desktop sidebar brand mark | `public/images/logo.jpg`, circular crop |

That is the only photo on this page. Do not use any other photo here: `lena.jpg`, `sofia.jpg`, `amara.jpg`, `dark-saloon.jpg`, `saloon.jpg`, `nails.jpg`, `girl.jpg`, `feet.jpg`. The staff rows in the designs have no avatars. Do not add any.
`logo.jpg` is a crimson circle with a cream serif "G" on a pale pink square. Show it as a ~36px circle, object-fit cover, centred. The text "GlamSlot" sits right next to it, so give the image `alt=""` (decorative).
Mobile and tablet show no logo.

## Sample content (for `lib/sample-content.ts`)

Services (name, price, duration, deposit):

| Name | Price | Duration | Deposit |
|---|---|---|---|
| Gel Manicure | $48 | 60 | $15 |
| Silk Blowout | $65 | 75 | $20 |
| Spa Pedicure | $58 | 70 | $15 |
| Brow Shape | $32 | 30 | $10 |

Two display formats, from the same data:
- Short (mobile and desktop): `$48 • 60m • $15 dep`
- Long (tablet): `$48 • 60 min • $15 deposit`

Staff:

| Name | Role | Status text | Row text |
|---|---|---|---|
| Amara | Colorist | "Active" | "Amara • Colorist" |
| Sofia | Nails | "Day off Mon" | "Sofia • Nails (Mon off)" |

Salon hours line: "Tue–Sun 9–7" (en dash).
Today's deposits card: "Today's deposits", "$240", "6 bookings • 1 pending".

Reminder preview text (three different strings, one per breakpoint, see Unclear 6):
- Desktop: “Hi Maria! Reminder: Gel + Pedicure tomorrow 10:30 AM with Amara. Reply YES to confirm.”
- Tablet (template with placeholders, shown literally): “Hi {name}! Your {service} is {when} Reply YES to confirm.”
- Mobile: Reminder preview: “Hi Maria! Your GlamSlot is tomorrow 10:30 AM Reply YES to confirm.”

Store all three. Switch them with responsive classes using `display: none` (not just visually hidden), so screen readers read only one.

## Tabs (all sizes)

Three tabs: Services, Staff, Reminders. Labels:
- Mobile: "Services", "Staff", "Reminders"
- Tablet and desktop: "Services", "Staff & hours", "Reminders"

Look: pill-shaped, ~16px corners, 1px `border`, `card` background, `foreground` text, ~15 to 16px DM Sans. Active tab: `plum` background, `background` colour text, no visible border. "Services" is the active tab in all three designs. Gap between tabs ~8px.

## Mobile (375px)

Page background is `background`. Side padding 16px. No sidebar.

1. **Header band.** Full width, `plum` background, ~76px tall, left padding ~20px, no logo, no buttons.
   - Heading "Settings": PT Serif, ~24px, `background` colour (cream).
   - Under it: "Services • Staff • Reminders", DM Sans, ~14px, light muted text on the dark band (use `muted` text colour).
2. **Tabs row.** Starts right under the band, ~16px below. Three equal-width tabs filling the width (each ~108px wide), ~44px tall, ~8px gap, label ~16px. Under the row a 1px full-width `border` line, ~13px below the tabs.
3. **Service cards** (Services tab), ~17px below the line. Three stacked cards (Gel Manicure, Silk Blowout, Spa Pedicure), ~9px apart. Each card: `card` background, 1px `border`, ~22px corners, ~69px tall, ~17px padding. Left: name (DM Sans, medium, ~17px, `foreground`) over the short detail line (muted text, ~15px). Right: a chevron-right icon (~20px, `foreground`). The whole card is tappable and opens that service for editing.
4. **Add-service card.** ~9px below the last card. 1px DASHED `border`, ~22px corners, ~17px padding, ~165px tall, transparent or `background` fill.
   - Label: "Add service: name, price, duration, deposit" (muted text, ~15px).
   - Input: ~47px tall, full width of the card inside the padding, `input` background, 1px `border`, ~16px corners, ~13px left padding. Placeholder: "e.g. Bridal Updo • $85 • 90 min" (muted text, ~16px).
   - Button: ~9px below the input, full width, ~47px tall, `primary` background, white text, label "+ Add service", ~16px medium, ~16px corners.
5. **Reminder preview.** ~9px below the add card. `success` background (the light mint) with a 1px border in the `success` colour, ~22px corners, ~65px tall, ~12px padding. Left: a chat-bubble outline icon (~22px, `foreground`). Right of it, ~12px gap: the mobile preview text, `foreground`, ~16px, wraps to two lines.
6. **Bottom tab bar.** Fixed to the bottom of the screen. `plum` background, ~74px tall, full width. Four items spread evenly: Calendar (calendar icon), Clients (two-people icon), Settings (gear icon), More (three-line menu icon). Icon ~24px above a ~13px label. Inactive: light muted text and icon. Active ("Settings"): a rounded block ~79px wide by ~55px tall, ~14px corners, slightly lighter than `plum` (see Unclear 8), with `background` colour (cream) icon and label.
7. Page bottom padding: at least the bar height plus ~20px (and the device safe-area inset) so the bar never hides content.

## Tablet (~768px)

Page background `background`. Side padding ~24px. No sidebar, no header band, no subtitle.

1. **Title row.** ~20px from the top. Left: "Settings", PT Serif, ~28px, `foreground`. Right: button "+ Add service", ~120px wide by ~44px tall, `primary` background, white text, ~15px, ~16px corners.
2. **Tabs row.** ~22px below. Tabs ~40px tall (make the tap area at least 44px). Widths hug the label with ~20px side padding (about 94px, 126px, 110px).
3. **Service cards.** ~24px below the tabs. Two cards side by side, equal width (~352px each), ~12px gap. Only two cards are shown in the design: Gel Manicure and Silk Blowout (see Unclear 3). Each card: `card` background, 1px `border`, ~24px corners, ~121px tall, ~16px padding.
   - Name: DM Sans, medium, ~16px, `foreground`.
   - Under it: the long detail line (muted text, ~14px).
   - ~13px below: two equal buttons side by side, ~8px gap, each ~40px tall, `card` background, 1px `border`, ~14px corners, centred label ~14px `foreground`. Labels: "Edit" and "Off".
4. **WhatsApp reminders card.** ~12px below the cards. Full width, `card` background, 1px `border`, ~24px corners, ~115px tall, ~17px padding.
   - Title "WhatsApp reminders": DM Sans, medium, ~16px.
   - Chips row ~12px below, ~8px gap. Each chip ~30px tall, fully rounded, ~14px text. "24h before • ON" is SELECTED: `primary` background, white text. "2h before • ON" is not selected: `card` background, 1px `border`, `foreground` text.
   - Template text ~12px below: the tablet string, muted text, ~14px, one line.
5. **Bottom tab bar.** Same as mobile: `plum`, ~73px tall, full width, four equal columns: Calendar, Clients, Settings (active), More. The active block is ~79px by ~56px.
6. Page bottom padding: bar height plus ~20px.

## Desktop (1024px and up)

Frame ~1440px wide. Two regions: a fixed sidebar on the left and the content area.

### Sidebar
- Width ~240px, full viewport height, fixed, `plum` background. Padding ~20px.
- **Brand block** at the top: `logo.jpg` as a ~36px circle, then ~12px gap, then two lines: "GlamSlot" (PT Serif, ~18px, `background` colour) over "Owner studio" (DM Sans, ~13px, light muted text).
- **Nav list**, starting ~48px below the brand block. Four items, each ~44px tall, ~48px pitch (about 4px gap), ~200px wide, ~16px corners, ~12px gap between icon (~20px) and label (DM Sans ~16px). Order: Calendar (calendar icon), Bookings (ticket icon), Clients (two-people icon), Settings (gear icon). Inactive: light muted text and icon, no background. Active ("Settings"): `primary` background, white text and icon.
- **Deposits card**, pinned to the bottom of the sidebar with ~20px bottom padding. ~200px wide by ~116px tall, ~20px corners, ~16px padding, slightly lighter than `plum` (see Unclear 8). Lines: "Today's deposits" (DM Sans, medium, ~15px, `background` colour), "$240" (PT Serif, ~26px, `background` colour), "6 bookings • 1 pending" (DM Sans, ~13px, light muted text).

### Content area
Starts right of the sidebar. Left padding ~32px. The content block is left-aligned and ~936px wide at most (see Unclear 9), so empty page background is left on the right on wide screens.

1. **Heading.** "Settings", PT Serif, ~36px, `foreground`. Under it: "Services, team, hours and WhatsApp reminders", DM Sans, ~15px, muted text. ~20px top padding.
2. **Tabs row.** ~24px below the subtitle. Tabs ~43px tall, ~8px gap. "Services" active.
3. **Two-column grid.** ~20px below the tabs. Two equal columns (~457px each), ~20px gap. Both columns end at the same bottom edge.
   - **Left column: Services card.** `card` background, 1px `border`, ~24px corners. Stretches to the full height of the right column, so there is empty space under the last row.
     - Header row ~45px tall, ~20px side padding, 1px `border` line under it. Left: "4 services" (DM Sans, medium, ~16px, `foreground`). Right: "+ Add" in `primary` colour, ~16px, medium.
     - Then four rows, each ~45px tall, ~20px side padding, a 1px `border` line between rows: Gel Manicure, Silk Blowout, Spa Pedicure, Brow Shape. Left: name (~16px, `foreground`). Right-aligned: the short detail line (muted text, ~16px).
   - **Right column, card 1: Staff & hours.** `card` background, 1px `border`, ~24px corners, ~168px tall, ~20px padding.
     - Title: "Staff & hours • Tue–Sun 9–7" (DM Sans, medium, ~16px).
     - Two rows ~14px below, ~8px apart. Each row is ~44px tall, full width, 1px `border`, ~16px corners, ~13px side padding. Left: the row text ("Amara • Colorist", "Sofia • Nails (Mon off)"), ~16px, `foreground`. Right: status text ~14px. "Active" is in the `success` colour. "Day off Mon" is muted text.
   - **Right column, card 2: WhatsApp reminders.** ~22px below card 1. `card` background, 1px `border`, ~24px corners, ~239px tall, ~20px padding.
     - Title: "WhatsApp reminders" (DM Sans, medium, ~16px).
     - Chips ~16px below, ~8px gap: "24h • ON" and "2h • ON". Both are the same style: fully rounded, ~27px tall, ~14px text, `success` text on `success` background (light mint). Both look switched on.
     - Preview box ~16px below: `blush` background, 1px `border`, ~14px corners, ~13px padding, ~65px tall. Desktop preview text (~15px, `foreground`), wraps to two lines.
     - Button ~16px below: "Save settings", full width of the card, ~48px tall, `plum` background, `background` colour text, ~16px medium, centred, ~16px corners.
4. Page bottom padding ~32px. There is no bottom tab bar and no footer.

## What changes between sizes (summary)

| Thing | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navigation | bottom bar (4 items) | bottom bar (4 items) | left sidebar (4 items, includes Bookings) |
| Page title area | dark `plum` band with subtitle | plain heading, "+ Add service" button at right | plain heading with subtitle |
| Tab 2 label | "Staff" | "Staff & hours" | "Staff & hours" |
| Services list | stacked tappable cards with chevron | 2-column cards with Edit / Off | one list card with a "+ Add" link |
| Adding a service | inline dashed form | "+ Add service" button in title row | "+ Add" link in list header |
| Staff and reminders panels | not shown in Services tab design | not shown in Services tab design | shown beside the list |
| Reminder preview | mint box under the form | inside the reminders card | blush box inside the reminders card |
| "Save settings" button | not shown | not shown | shown |
| Deposits card | no | no | yes, in sidebar |

## Links and behaviour (best reading of the design)

- Nav items go to their owner pages: Calendar, Bookings, Clients, Settings. "More" opens a menu (see Unclear 4). "Settings" is the current page.
- Tabs switch the visible panel (see Unclear 1).
- Hover and focus states are not designed. Use the same ones as Landing.

## Unclear (ask before guessing)

1. **What do the tabs do on desktop?** Desktop shows "Services" as active, but Staff and Reminders panels are also visible beside it. Assumed: on desktop all three panels are always visible and the tabs scroll to or highlight a panel. On mobile and tablet, assumed the tabs switch panels, showing one at a time. Tell me if desktop should hide panels too.
2. **Mobile and tablet Staff and Reminders tabs.** Not designed. Assumed: Staff shows the same staff rows as the desktop Staff & hours card, and Reminders shows the same chips, preview and "Save settings" button as the desktop card.
3. **Which services are shown.** Desktop says "4 services" and lists four. Mobile shows three (no Brow Shape). Tablet shows two (no Spa Pedicure or Brow Shape). Assumed the screens just crop the list. Build all four from data at every size, and tell me if the design really intends fewer.
4. **"More" tab and Bookings.** The desktop sidebar has Bookings. The mobile and tablet bars have no Bookings and add "More". Assumed "More" opens a menu with Bookings and other items. Its contents are not designed.
5. **"Off" button on tablet.** Unclear if "Off" is the action ("turn this service off") or the current state. Assumed it is an action that toggles the service active or inactive. Unknown what an inactive service looks like.
6. **Gap in the reminder text.** In all three images there is a wide blank gap in the preview text ("Hi Maria!   Reminder", "{when}   Reply", "10:30 AM   Reply"). It is probably an emoji that did not render. Built without it, with a single space. Tell me which emoji, if any.
7. **Reminder chips.** On desktop both chips look the same (mint, "ON"). On tablet the first is filled `primary` and the second is outlined, though both say "ON". Built as designed per size. Unknown which style means on and which means off.
8. **Lighter plum.** The active mobile and tablet tab block and the desktop deposits card are a slightly lighter plum than the bar behind them. No token for it was found. Assumed `plum` with a white overlay at ~10% opacity. Tell me if `ui.md` has a better token.
9. **Content width on desktop.** The grid stops at ~936px and leaves empty space on the right. It may be a design max width or only the frame. Assumed a max width of ~936px, left-aligned.
10. **Tablet height and bar.** The tablet frame is short and the bar sits at the frame's bottom. Assumed the bar is fixed to the bottom of the viewport, like mobile.
11. **Tablet range.** Only 768px is shown. Between 768 and 1023px, stretch the tablet layout.
12. **Save and add behaviour.** Not designed: what "Save settings" saves, what "+ Add service" opens on tablet and desktop, and what the chevron opens on mobile. Assumed each opens an add or edit form, built later.
13. **Staff avatars.** None in the design. If you want them, `amara.jpg` and `sofia.jpg` would fit, but I have not added them.
14. **Exact sizes.** All sizes above are estimates from the images.
