// Copy for /login, from context/design/LoginPage/spec.md.
//
// PLACEHOLDER FIGURES: "no-shows down 42%" and "Trusted by 120+ salons" are
// invented for the demo. GlamSlot has no salons and no measured results yet.
// Change or remove them before any salon prospect sees this page.
export const loginCopy = {
  heading: {
    mobile: "Welcome back",
    tablet: "Owner login",
    desktop: "Owner login",
  },
  sub: {
    mobile: "Sign in to your salon studio",
    tablet: "Calendar, deposits & reminders",
    desktop: "Use your salon email",
  },
  button: {
    small: "Sign in",
    desktop: "Sign in to dashboard",
  },
  footnote: "Protected • GlamSlot for Business",
  panel: {
    heading: "Your chairs, fully booked.",
    sub: "Deposits collected, no-shows down 42%, reminders on autopilot.",
    trust: "Trusted by 120+ salons",
  },
  placeholderFigures: true,
} as const;

export const loginPhotos = {
  logo: "/images/logo.jpg",
  hero: "/images/saloon.jpg",
} as const;