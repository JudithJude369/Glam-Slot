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
        services!inner(duration_minutes)
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

    const now = new Date();
    const appointmentTime = new Date(booking.starts_at);
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return NextResponse.json(
        { error: "Reschedule not allowed less than 24 hours before appointment" },
        { status: 400 }
      );
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Only confirmed bookings can be rescheduled" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      serviceId: booking.service_id,
      serviceDuration: booking.services.duration_minutes,
      currentStart: booking.starts_at,
      depositKobo: booking.deposit_kobo,
    });
  } catch (error) {
    console.error("Reschedule init error:", error);
    return NextResponse.json({ error: "Failed to process reschedule" }, { status: 500 });
  }
}