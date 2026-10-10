import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DemoConversationsClient } from "./demo-conversations-client";

export const metadata: Metadata = {
  title: "Demo Conversations | GlamSlot Dashboard",
};

async function getDemoConversations() {
  const admin = createAdminClient();

  const { data: bookings } = await admin
    .from("bookings")
    .select(
      `
      id,
      customer_name,
      customer_phone,
      status,
      created_at,
      starts_at,
      service_id,
      staff_id,
      services!inner(name),
      staff!inner(name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: reminders } = await admin
    .from("reminders")
    .select(
      `
      id,
      booking_id,
      kind,
      scheduled_for,
      status,
      sent_at,
      provider_message_id,
      attempts,
      last_error
    `
    )
    .order("scheduled_for", { ascending: false })
    .limit(200);

  return { bookings: bookings ?? [], reminders: reminders ?? [] };
}

export default async function DemoConversationsPage() {
  const owner = await getOwner();
  if (!owner.ok) redirect("/login");

  const { bookings, reminders } = await getDemoConversations();

  const remindersByBooking = new Map<string, typeof reminders>();
  for (const reminder of reminders) {
    const list = remindersByBooking.get(reminder.booking_id) || [];
    list.push(reminder);
    remindersByBooking.set(reminder.booking_id, list);
  }

  return <DemoConversationsClient bookings={bookings} remindersByBooking={remindersByBooking} />;
}