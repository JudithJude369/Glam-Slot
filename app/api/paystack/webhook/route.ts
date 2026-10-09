import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac, timingSafeEqual } from "crypto";
import type { Json } from "@/lib/database.types";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
    customer: {
      email: string;
    };
    metadata: {
      booking_id: string;
      service_name: string;
      customer_name: string;
      customer_phone: string;
    };
  };
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value));
}

function verifySignature(rawBody: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) return false;
  const expectedSignature = createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event: PaystackWebhookEvent = JSON.parse(rawBody);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const { reference, amount, currency, status, metadata } = event.data;
    const bookingId = metadata?.booking_id;

    if (!bookingId || !reference || !amount || !currency) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    if (status !== "success") {
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("id, booking_id, amount_kobo, currency, status")
      .eq("paystack_reference", reference)
      .maybeSingle();

    if (paymentError) {
      console.error("Payment lookup error:", paymentError.message);
      return NextResponse.json({ error: "Payment lookup failed" }, { status: 500 });
    }

    if (!payment) {
      console.warn("Payment record not found for reference:", reference);
      return NextResponse.json({ received: true });
    }

    if (payment.status === "succeeded") {
      return NextResponse.json({ received: true });
    }

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(
        `
        id,
        staff_id,
        service_id,
        starts_at,
        ends_at,
        status,
        deposit_kobo,
        hold_expires_at,
        source
      `
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) {
      console.error("Booking lookup error:", bookingError.message);
      return NextResponse.json({ error: "Booking lookup failed" }, { status: 500 });
    }

    if (!booking) {
      console.warn("Booking not found for payment:", bookingId);
      return NextResponse.json({ received: true });
    }

    if (amount !== booking.deposit_kobo || currency !== "NGN") {
      await admin
        .from("payments")
        .update({
          status: "failed",
          raw_event: toJson(event),
          verified_at: new Date().toISOString(),
        })
        .eq("paystack_reference", reference);

      await admin
        .from("bookings")
        .update({
          flagged: true,
          flag_reason: `Amount mismatch: expected ${booking.deposit_kobo} NGN, got ${amount} ${currency}`,
        })
        .eq("id", bookingId);

      return NextResponse.json({ received: true });
    }

    const now = new Date();
    const holdExpired = booking.hold_expires_at && new Date(booking.hold_expires_at) < now;

    let newBookingStatus: "confirmed" | "flagged" = "confirmed";
    let flagReason: string | null = null;

    if (holdExpired) {
      const { data: conflictingBooking } = await admin
        .from("bookings")
        .select("id")
        .eq("staff_id", booking.staff_id)
        .in("status", ["pending_payment", "confirmed"])
        .lt("starts_at", booking.ends_at)
        .gt("ends_at", booking.starts_at)
        .neq("id", booking.id)
        .maybeSingle();

      if (conflictingBooking) {
        newBookingStatus = "flagged";
        flagReason = "Slot was taken by another booking";
      }
    }

    const { error: updatePaymentError } = await admin
      .from("payments")
      .update({
        status: "succeeded",
        raw_event: toJson(event),
        verified_at: new Date().toISOString(),
      })
      .eq("paystack_reference", reference);

    if (updatePaymentError) {
      console.error("Payment update error:", updatePaymentError.message);
      return NextResponse.json({ error: "Payment update failed" }, { status: 500 });
    }

    const { error: updateBookingError } = await admin
      .from("bookings")
      .update({
        status: newBookingStatus,
        flagged: newBookingStatus === "flagged",
        flag_reason: flagReason,
        hold_expires_at: null,
      })
      .eq("id", bookingId);

    if (updateBookingError) {
      console.error("Booking update error:", updateBookingError.message);
      return NextResponse.json({ error: "Booking update failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}