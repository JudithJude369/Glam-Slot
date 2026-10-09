import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
        hold_expires_at,
        token_hash,
        services!inner(name, duration_minutes, price_kobo, deposit_kobo),
        staff!inner(name)
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: booking.id,
      service_name: booking.services.name,
      service_duration: `${booking.services.duration_minutes} min`,
      service_price_kobo: booking.services.price_kobo,
      service_deposit_kobo: booking.services.deposit_kobo,
      starts_at: booking.starts_at,
      staff_name: booking.staff.name,
      deposit_kobo: booking.deposit_kobo,
      status: booking.status,
      hold_expires_at: booking.hold_expires_at,
    });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}