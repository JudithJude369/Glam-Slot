import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const APP_URL = process.env.APP_URL;

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY || !APP_URL) {
      return NextResponse.json({ error: "Payment configuration missing" }, { status: 500 });
    }

    const admin = createAdminClient();

    const { data: booking, error } = await admin
      .from("bookings")
      .select(
        `
        id,
        customer_name,
        customer_phone,
        deposit_kobo,
        service_id,
        services!inner(name, price_kobo)
      `
      )
      .eq("id", bookingId)
      .eq("status", "pending_payment")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not pending payment" }, { status: 404 });
    }

    const reference = `glamslot_${bookingId}_${Date.now()}`;

    const { error: paymentError } = await admin.from("payments").insert({
      booking_id: bookingId,
      paystack_reference: reference,
      amount_kobo: booking.deposit_kobo,
      currency: "NGN",
      status: "pending",
    });

    if (paymentError) throw new Error(paymentError.message);

    const callbackUrl = `${APP_URL}/booking/callback/${reference}`;

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `${booking.customer_phone.replace(/\D/g, "")}@glamslot.local`,
        amount: booking.deposit_kobo,
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: {
          booking_id: bookingId,
          service_name: booking.services.name,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      await admin.from("payments").update({ status: "failed" }).eq("paystack_reference", reference);
      return NextResponse.json({ error: paystackData.message || "Failed to initialize payment" }, { status: 400 });
    }

    return NextResponse.json({ authorizationUrl: paystackData.data.authorization_url });
  } catch (error) {
    console.error("Paystack init error:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}