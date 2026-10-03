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
  phoneHref: "tel:+13055550142",
} as const;

export const photos = {
  logo: "/images/logo.jpg",
  hero: "/images/saloon.jpg",
  gelManicure: "/images/nails.jpg",
  blowout: "/images/girl.jpg",
  pedicure: "/images/feet.jpg",
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
  { label: "Home", href: "/", active: true },
  { label: "About", href: "/about", active: false },
  { label: "Services", href: "/book", active: false },
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