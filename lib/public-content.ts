import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

// Photos are a design asset, not a column the owner edits in Settings, so the
// mapping lives here next to the reads instead of forcing a new services column.
// Source: the Photos tables in context/design/LandingPage/spec.md and
// context/design/AboutPage/spec.md.
const SERVICE_PHOTOS: Record<string, string> = {
  "Signature Gel Manicure": "/images/nails.jpg",
  "Silk Blowout + Gloss": "/images/girl.jpg",
  "Spa Pedicure Deluxe": "/images/feet.jpg",
};
const DEFAULT_CARD_PHOTO = "/images/girl.jpg";

export type PublicService = {
  id: string;
  name: string;
  duration: string;
  price: string;
  priceKobo: number;
  deposit: string;
  photo: string;
};

export type PublicStaff = {
  id: string;
  name: string;
  photo: string;
  roleDesktop: string;
  roleMobile: string;
  roleShort: string;
};

type SalonSettings = Database["public"]["Tables"]["salon_settings"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Staff = Database["public"]["Tables"]["staff"]["Row"];

const KILOBO = 100;

function formatKobo(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / KILOBO);
}

function formatMinutes(minutes: number): string {
  if (minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }
  return `${minutes} min`;
}

function toService(service: Service): PublicService {
  return {
    id: service.id,
    name: service.name,
    duration: formatMinutes(service.duration_minutes),
    price: formatKobo(service.price_kobo),
    priceKobo: service.price_kobo,
    deposit: formatKobo(service.deposit_kobo),
    photo: SERVICE_PHOTOS[service.name] ?? DEFAULT_CARD_PHOTO,
  };
}

function toStaff(staff: Staff): PublicStaff {
  const role = staff.role ?? "";
  return {
    id: staff.id,
    name: staff.name,
    photo: staff.photo_url ?? DEFAULT_CARD_PHOTO,
    roleDesktop: role,
    roleMobile: role,
    roleShort: role.split("•")[0]?.trim() || role,
  };
}

export async function getPublicSalon() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("salon_settings")
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SalonSettings | null;
}

export async function getPublicServices(): Promise<PublicService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toService);
}

export async function getPublicTeam(): Promise<PublicStaff[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toStaff);
}