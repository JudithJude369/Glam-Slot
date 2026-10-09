import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const jobsSecret = process.env.JOBS_SECRET;

  if (!jobsSecret || authHeader !== `Bearer ${jobsSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const now = new Date().toISOString();

    const { data: expiredBookings, error: selectError } = await admin
      .from("bookings")
      .select("id, token_hash")
      .eq("status", "pending_payment")
      .lt("hold_expires_at", now);

    if (selectError) throw new Error(selectError.message);

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({ expired: 0 });
    }

    const { error: updateError } = await admin
      .from("bookings")
      .update({ status: "expired" })
      .eq("status", "pending_payment")
      .lt("hold_expires_at", now);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ expired: expiredBookings.length });
  } catch (error) {
    console.error("Hold expiry error:", error);
    return NextResponse.json({ error: "Failed to expire holds" }, { status: 500 });
  }
}