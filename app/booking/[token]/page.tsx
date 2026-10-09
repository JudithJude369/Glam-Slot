import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";
import { ConfirmationPageClient } from "./confirmation-page-client";
import { getPublicSalonDetails } from "@/lib/public-salon";
import { koboToNaira, formatTime12 } from "@/lib/money";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

interface BookingData {
  id: string;
  service_name: string;
  service_duration: number;
  service_price_kobo: number;
  service_deposit_kobo: number;
  starts_at: string;
  ends_at: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  deposit_kobo: number;
  staff_name: string;
  is_past: boolean;
  can_reschedule: boolean;
  can_cancel: boolean;
}

export const metadata: Metadata = {
  title: "Booking Confirmed | GlamSlot",
  description: "Your booking is confirmed. Manage your appointment here.",
};

async function getBookingData(token: string): Promise<BookingData | null> {
  const tokenHash = hashToken(token);
  const admin = createAdminClient();

  const { data: booking, error } = await admin
    .from("bookings")
    .select(
      `
      id,
      service_id,
      staff_id,
      starts_at,
      ends_at,
      status,
      customer_name,
      customer_phone,
      deposit_kobo,
      token_hash,
      cancelled_at,
      services!inner(name, duration_minutes, price_kobo, deposit_kobo),
      staff!inner(name)
    `
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !booking) {
    return null;
  }

  const now = new Date();
  const appointmentTime = new Date(booking.starts_at);
  const isPast = appointmentTime < now;

  return {
    id: booking.id,
    service_name: booking.services.name,
    service_duration: booking.services.duration_minutes,
    service_price_kobo: booking.services.price_kobo,
    service_deposit_kobo: booking.services.deposit_kobo,
    starts_at: booking.starts_at,
    ends_at: booking.ends_at,
    status: booking.status,
    customer_name: booking.customer_name,
    customer_phone: booking.customer_phone,
    deposit_kobo: booking.deposit_kobo,
    staff_name: booking.staff.name,
    is_past: isPast,
    can_reschedule: !isPast && ["confirmed"].includes(booking.status),
    can_cancel: !isPast && ["confirmed", "pending_payment"].includes(booking.status),
  };
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length !== 64) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center px-5">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Invalid link</h1>
        <p className="text-muted-foreground">This booking link is not valid.</p>
        <a href="/book" className="text-primary underline">
          Start a new booking
        </a>
      </div>
    );
  }

  const booking = await getBookingData(token);
  const salon = await getPublicSalonDetails();

  if (!booking) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center px-5">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Booking not found</h1>
        <p className="text-muted-foreground">This booking link has expired or the booking was cancelled.</p>
        <a href="/book" className="text-primary underline">
          Start a new booking
        </a>
      </div>
    );
  }

  const depositAmount = koboToNaira(booking.deposit_kobo);
  const balanceAmount = koboToNaira(booking.service_price_kobo - booking.deposit_kobo);
  const dateDisplay = new Date(booking.starts_at).toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeDisplay = formatTime12(booking.starts_at);
  const fullDateDisplay = new Date(booking.starts_at).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const bookingCode = booking.id.slice(0, 8).toUpperCase();

  const shortServiceName = booking.service_name.length > 20
    ? booking.service_name.split(" ").map(w => w[0]).join("") + "."
    : booking.service_name;

  return (
    <ConfirmationPageClient
      token={token}
      booking={booking}
      salon={salon}
      depositAmount={depositAmount}
      balanceAmount={balanceAmount}
      dateDisplay={dateDisplay}
      fullDateDisplay={fullDateDisplay}
      timeDisplay={timeDisplay}
      bookingCode={bookingCode}
      shortServiceName={shortServiceName}
    />
  );
}