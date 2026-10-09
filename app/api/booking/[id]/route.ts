import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(
  request: NextRequest,
  // The segment is named `id` because it shares `app/api/booking/[id]`
  // with the cancel and reschedule routes; for this GET it holds the
  // 64-character booking token from the confirmation link.
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: token } = await params;

  if (!token || token.length !== 64) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

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

  if (error) {
    console.error("Booking fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const now = new Date();
  const appointmentTime = new Date(booking.starts_at);
  const isPast = appointmentTime < now;

  return NextResponse.json({
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
  });
}