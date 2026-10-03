export type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
  deposit: string;
  photo: string;
};

export const salon = {
  name: "GlamSlot",
  tagline: "Nails • Hair • Glow",
  city: "Miami",
  rating: "4.9",
  reviewCount: "800+",
  address: "24 Rose Lane, Miami, FL 33101",
  addressShort: "24 Rose Lane, Miami",
  hours: "Tue–Sun • 9:00 AM – 7:00 PM",
  hoursFooter: "24 Rose Lane, Miami, FL • Tue–Sun 9am–7pm",
  visitLine: "24 Rose Lane, Miami • Tue–Sun 9–7",
  closedNote: "Closed Mondays",
  nearby: "2 min from Brickell station",
  heroFromPrice: "$28",
  cancellation: "Free cancellation up to 24h",
  cancellationShort: "Free cancel 24h",
  whatsappNumber: "+1 (305) 555-0142",
  whatsappHref: "https://wa.me/13055550142",
  phone: "+1 (305) 555-0142",
  phoneHref: "tel:+13055550142",
} as const;

export const photos = {
  logo: "/images/logo.jpg",
  hero: "/images/saloon.jpg",
  gelManicure: "/images/nails.jpg",
  blowout: "/images/girl.jpg",
  pedicure: "/images/feet.jpg",
  aboutHero: "/images/dark-saloon.jpg",
  amara: "/images/amara.jpg",
  sofia: "/images/sofia.jpg",
  lena: "/images/lena.jpg",
} as const;

export const services: Service[] = [
  {
    id: "signature-gel-manicure",
    name: "Signature Gel Manicure",
    duration: "60 min",
    price: "$48",
    deposit: "$15",
    photo: photos.gelManicure,
  },
  {
    id: "silk-blowout-gloss",
    name: "Silk Blowout + Gloss",
    duration: "75 min",
    price: "$65",
    deposit: "$20",
    photo: photos.blowout,
  },
  {
    id: "spa-pedicure-deluxe",
    name: "Spa Pedicure Deluxe",
    duration: "70 min",
    price: "$58",
    deposit: "$15",
    photo: photos.pedicure,
  },
];

export const defaultSelectedServiceId = services[0].id;

export const badges = {
  mobile: `Miami • Rated ${salon.rating} by ${salon.reviewCount} clients`,
  tablet: `Miami • ${salon.rating} rated salon`,
  desktop: `Miami • ${salon.rating} from ${salon.reviewCount} reviews`,
} as const;

export const heroParagraphs = {
  mobile:
    "Pick your ritual, hold your slot with a small deposit, get gentle WhatsApp reminders. No account needed.",
  tablet:
    "Choose your ritual, hold your slot with a deposit, get WhatsApp reminders.",
  desktop:
    "Choose your ritual, hold your slot with a small deposit, and let gentle WhatsApp reminders do the rest. No account needed.",
} as const;

export const desktopTrustItems = [
  { icon: "shield", text: salon.cancellationShort },
  { icon: "chat", text: "WhatsApp reminders" },
  { icon: "pin", text: salon.addressShort },
] as const;

export const infoCards = [
  { icon: "pin", title: salon.addressShort, detail: salon.nearby },
  { icon: "clock", title: salon.hours, detail: salon.closedNote },
  { icon: "chat", title: "WhatsApp concierge", detail: salon.whatsappNumber },
] as const;

export const mobileNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/book" },
  { label: "Find us", href: "#visit" },
  { label: "Book Now", href: "/book" },
] as const;

export const desktopNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/book" },
] as const;

export const footerColumns = [
  {
    title: "Visit",
    links: [
      { label: "Services", href: "/book" },
      { label: "About", href: "/about" },
      { label: "Book Now", href: "/book" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Cancellation policy", href: "/cancellation-policy" },
      { label: "Contact", href: salon.whatsappHref },
    ],
  },
] as const;

export type TeamMember = {
  id: string;
  name: string;
  photo: string;
  roleDesktop: string;
  roleMobile: string;
  roleShort: string;
};

export const team: TeamMember[] = [
  {
    id: "amara",
    name: "Amara",
    photo: photos.amara,
    roleDesktop: "Master colorist • 9 yrs",
    roleMobile: "Master colorist • 9 yrs",
    roleShort: "Colorist",
  },
  {
    id: "sofia",
    name: "Sofia",
    photo: photos.sofia,
    roleDesktop: "Nail artist • 6 yrs",
    roleMobile: "Nails & art • 6 yrs",
    roleShort: "Nails",
  },
  {
    id: "lena",
    name: "Lena",
    photo: photos.lena,
    roleDesktop: "Skin & brows • 5 yrs",
    roleMobile: "Skin & brows • 5 yrs",
    roleShort: "Brows",
  },
];

export const aboutHero = {
  eyebrow: "Our story",
  heading: "A little salon with a big heart.",
  paragraphs: {
    mobile:
      "GlamSlot started in 2019 with two chairs and one promise: never rush a client. Today our all-women team serves 800+ regulars with deposits that protect both sides.",
    tablet:
      "Two chairs in 2019, a neighborhood ritual today. Deposits keep slots fair for everyone.",
    desktop:
      "Founded by Amara in 2019, GlamSlot keeps beauty stress-free: transparent deposits, honest timing, and reminders that actually help.",
  },
  imageAlt: "GlamSlot salon interior",
} as const;

export const contact = {
  strip: `${salon.addressShort} • ${salon.phone}`,
} as const;

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