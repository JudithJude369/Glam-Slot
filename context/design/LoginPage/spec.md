# Login page spec (`/login`)

Written from `Login-Mobile.jpeg`, `Login-Tablet.jpeg`, `Login-Desktop.jpeg`.
Mobile (375px) is the reference. Sizes marked "~" are estimates measured from the images, not exact design values.
Colours and fonts: use the tokens in `context/ui.md` only. Never type a hex value. Headings use PT Serif, everything else DM Sans.
Breakpoints: same as Landing (mobile below 768px, tablet 768 to 1023px, desktop 1024px and up).

This is the owner login. There is one owner per salon, no sign-up, and no link to create an account.

## What this page is not

It has no site header, no site footer, no hamburger and no sticky "Book Now" bar. It is a standalone full-screen page. Do not reuse the Landing header or footer here.

## Photos

| Place | File |
|---|---|
| Logo circle (all sizes) | `public/images/logo.jpg`, cropped to a circle |
| Left photo panel (tablet only) | `public/images/saloon.jpg` |

Not used on this page: `dark-saloon.jpg`, `amara.jpg`, `sofia.jpg`, `lena.jpg`, `nails.jpg`, `girl.jpg`, `feet.jpg`.

Tablet photo: object-fit cover, full panel height, positioned toward the right and centre of the picture so the tall gold arched mirrors, the pink chairs and the roses show (not the blurred blossoms at the far left of the original). No rounded corners, the photo runs edge to edge.

## Shared pieces

**Form card.** White (`card`) background, 1px `border`, very rounded corners (~32px), generous padding (~24 to 40px, see each size).

**Input field.** White background, 1px `border`, fully rounded ends (pill shape, radius about half the height), height ~52 to 56px, a small icon on the left inside the field, then the text. Email field: envelope icon. Password field: lock icon. Text in DM Sans, ~16px. Placeholder text in the muted colour. Gap between the two fields ~12 to 16px.

**Error state for a field.** Border changes to the `danger` colour. Message below the field in `danger` text, small (~14px), left aligned.

**Primary action button.** Full width of the card, same height as the inputs (~52 to 56px), pill shape, white text, DM Sans medium. Its colour changes by breakpoint (see below).

**"Forgot password?" link.** Centred under the button, dark text (`foreground`), underlined, ~15px. See Unclear 3 before building it.

## Mobile (375px)

Full-screen page, background `blush`, no scrolling needed. Side padding ~24px.

1. **Card.** Centred horizontally, ~326px wide, sitting slightly above the vertical centre of the screen (top of the card ~126px from the top, card ~437px tall). ~24px inner padding, corners ~32px.
2. **Logo.** Circle ~48px, `logo.jpg`, centred at the top of the card.
3. **Heading.** "Welcome back" PT Serif, ~28px, centred, ~12px below the logo.
4. **Sub line.** "Sign in to your salon studio" muted colour, ~16px, centred.
5. **Email field.** Placeholder "Email" (see Unclear 4).
6. **Password field.** Placeholder "Password". An eye icon sits on the right inside the field, and tapping it shows or hides the password. In the design this field is shown in the error state: `danger` border, eight dots typed.
7. **Error message** (only after a failed sign-in). Under the password field, `danger` text. The design reads "Incorrect password — 2 attempts left." (see Unclear 2 for the text to use).
8. **Button.** "Sign in", `plum` background (dark), white text, full width, ~52px tall.
9. **Link.** "Forgot password?" (see Unclear 3).
10. **Footnote outside the card.** Small muted centred text under the card: "Protected • GlamSlot for Business".

## Tablet (~768px)

Full-screen split page, two equal halves side by side, each the full height of the screen.

1. **Left half.** `saloon.jpg` filling the whole half (no padding, no rounded corners, no text on top of it).
2. **Right half.** `blush` background. A form card centred both vertically and horizontally, ~318px wide, ~364px tall, ~24px inner padding, corners ~32px. Contents, left aligned:
   - Logo circle ~44px at the top left of the card.
   - Heading "Owner login" PT Serif, ~28px, ~16px below the logo.
   - Sub line "Calendar, deposits & reminders" muted, ~16px.
   - Email field, placeholder "Email".
   - Password field, placeholder "Password".
   - Button "Sign in", `plum` background, white text, full width.
   - No "Forgot password?" link and no footnote in this design.

## Desktop (1024px and up)

Full-screen split page, two equal halves side by side, each the full height of the screen. No photo.

1. **Left half.** `plum` background, padding ~64px on all sides. Three items, spread top, middle and bottom:
   - Top left: logo circle (~48px) next to the word "GlamSlot" in PT Serif, white.
   - Vertically near the centre: heading "Your chairs, fully booked." PT Serif, white, ~56px, one line (let it wrap on narrower desktops). Under it, ~16px below, the line "Deposits collected, no-shows down 42%, reminders on autopilot." in light text at reduced strength (use white at reduced opacity, not a new colour), ~18px.
   - Bottom left: small light text "Trusted by 120+ salons", reduced strength, ~15px.
2. **Right half.** `blush` background. Form card centred both ways, ~500px wide, ~430px tall, ~40px inner padding, corners ~32px, contents left aligned:
   - Heading "Owner login" PT Serif, ~36px.
   - Sub line "Use your salon email" muted, ~15px.
   - Email field (envelope icon, placeholder "Email").
   - Password field (lock icon, placeholder "Password").
   - Button "Sign in to dashboard", `primary` background (crimson), white text, full width, ~56px tall.
   - "Forgot password?" centred under the button.
   - No logo inside the card (the logo is on the left half).

## Behaviour

- Fields: email (type email, autocomplete email, required) and password (autocomplete current-password, required). Validate with Zod, using the existing sign-in server action.
- On submit, disable the button and show a loading state (not in the design, see Unclear 6).
- On success, go to `/dashboard`. If the person is already signed in, `/login` goes straight to `/dashboard`.
- On failure, show the error under the password field in the error style above. Keep the typed email, clear the password.
- Keyboard: Enter submits the form. Show a visible focus ring on every field and button.
- The password show/hide toggle needs an accessible label ("Show password" / "Hide password").

## Unclear (ask before guessing)

1. **Heading and button copy differ by size.** Heading is "Owner login" on tablet and desktop but "Welcome back" on mobile. Sub line and button text also differ (see above). Button colour is `primary` on desktop but `plum` on tablet and mobile. Default: build exactly as designed per breakpoint, using responsive classes with `display: none` for the hidden versions so a screen reader reads only one heading.
2. **Error wording and the attempts counter.** The mobile design shows "Incorrect password — 2 attempts left." That text tells an attacker the email exists and the password is the wrong part, and "attempts left" needs a lockout counter that is not built. Default: show one generic message, "Incorrect email or password.", with no counter, matching the rule for the sign-in action. Confirm.
3. **"Forgot password?"** It appears on desktop and mobile, not tablet. A password reset flow (reset email and a reset page) is not in `project-overview.md` and no reset page is designed. Default: do not render the link until a reset flow exists. Tell me if reset is in scope and I will treat it as a new page needing its own spec.
4. **Email field text.** Desktop shows "owner@glamslot.com" as normal dark text, mobile shows it in placeholder style, tablet shows the placeholder "Email". Default: placeholder "Email" on all sizes. Do not pre-fill any address.
5. **Made-up figures in the desktop panel.** "no-shows down 42%" and "Trusted by 120+ salons" are marketing placeholders. GlamSlot does not have 120 salons yet. Default: build them as designed for the demo, but flag them as placeholder copy in `lib/sample-content.ts` so they are changed or removed before any salon prospect sees the page.
6. **Loading and success states** are not designed. Default: the button text changes to "Signing in…" and the button is disabled.
7. **Password toggle** is only visible on mobile. Default: include it at all sizes.
8. **Light text on the plum panel.** `ui.md` may not define a muted-on-dark colour. Default: white at reduced opacity. Do not add a new colour value.
9. **Tablet photo position.** The exact crop is estimated. Check the result against the design and adjust the object position.
10. **Exact sizes.** All sizes above are estimates from the images.
