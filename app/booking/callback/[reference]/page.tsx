import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Processing Payment | GlamSlot",
};

export default async function BookingCallbackPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  if (!reference) {
    redirect("/book");
  }

  const admin = createAdminClient();

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("booking_id, status")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (paymentError || !payment) {
    redirect("/book");
  }

  if (payment.status !== "succeeded") {
    redirect("/book");
  }

  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .select("token_hash")
    .eq("id", payment.booking_id)
    .maybeSingle();

  if (bookingError || !booking || !booking.token_hash) {
    redirect("/book");
  }

  redirect(`/booking/${booking.token_hash}`);
}