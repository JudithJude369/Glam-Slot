import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || token.length !== 64) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: booking, error: bookingError } = await admin
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
        cancelled_at
      `
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) throw new Error(bookingError.message);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { createHash } = await import("crypto");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    if (tokenHash !== booking.token_hash) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    if (booking.cancelled_at) {
      return NextResponse.json({ error: "Booking already cancelled" }, { status: 400 });
    }

    const now = new Date();
    const appointmentTime = new Date(booking.starts_at);
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isWithin24Hours = hoursUntilAppointment < 24;

    const { error: updateError } = await admin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) throw new Error(updateError.message);

    await admin
      .from("reminders")
      .update({ status: "skipped" })
      .eq("booking_id", bookingId)
      .eq("status", "pending");

    return NextResponse.json({
      success: true,
      depositForfeited: isWithin24Hours,
      message: isWithin24Hours
        ? "Booking cancelled. Deposit forfeited as it was less than 24 hours before the appointment."
        : "Booking cancelled. Deposit will be refunded as salon credit.",
    });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}