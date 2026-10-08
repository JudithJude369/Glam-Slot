import { getPublicSalon } from "@/lib/public-content";

// Narrative copy the design wrote and the database has no column for. It is
// sample prose, same as the About hero and the login panel: the owner rewrites
// it before a real salon uses the site. Everything the owner CAN change in
// Settings (name, address, WhatsApp) comes from the row below.
const PROSE = {
  tagline: "Nails • Hair • Glow",
  city: "Lagos",
  rating: "4.9",
  reviewCount: "800+",
  nearby: "2 min from Ikeja station",
  cancellation: "Free cancellation up to 24h",
  cancellationShort: "Free cancel 24h",
  closedNote: "Closed Mondays",
} as const;

const WHATSAPP_PREFIX = "https://wa.me/";

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${WHATSAPP_PREFIX}${digits}`;
}

function phoneFromWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}

function hoursLine(slotInterval: number): string {
  return `Tue–Sun 9–7 • ${slotInterval}-min slots`;
}

export async function getPublicSalonDetails() {
  const row = await getPublicSalon();
  if (!row) {
    throw new Error("salon_settings row is missing; seed it before loading the site");
  }

  const phone = row.whatsapp_phone;
  const address = row.address;
  const shortAddress = address.split(",")[0]?.trim() || address;
  const slotInterval = row.slot_interval_minutes;

  return {
    name: row.name,
    tagline: PROSE.tagline,
    city: PROSE.city,
    rating: PROSE.rating,
    reviewCount: PROSE.reviewCount,
    address,
    addressShort: shortAddress,
    hours: hoursLine(slotInterval),
    hoursFooter: `${shortAddress} • Tue–Sun 9am–7pm`,
    visitLine: `${shortAddress} • Tue–Sun 9–7`,
    closedNote: PROSE.closedNote,
    nearby: PROSE.nearby,
    cancellation: PROSE.cancellation,
    cancellationShort: PROSE.cancellationShort,
    whatsappNumber: phone,
    whatsappHref: whatsappHref(phone),
    phone: phoneFromWhatsapp(phone),
    phoneHref: `tel:${phone.replace(/\s/g, "")}`,
  };
}

export type PublicSalonDetails = Awaited<ReturnType<typeof getPublicSalonDetails>>;