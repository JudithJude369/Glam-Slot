import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMessagingProvider, type SendMessageResult } from "@/lib/messaging";
import { buildTemplateVariables } from "@/lib/messaging/templates";
import type { TemplateName } from "@/lib/messaging/templates";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const jobsSecret = process.env.JOBS_SECRET;

  if (!jobsSecret || authHeader !== `Bearer ${jobsSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: salonSettings } = await admin
      .from("salon_settings")
      .select("name")
      .maybeSingle();

    const salonName = salonSettings?.name || "GlamSlot";

    const { data: dueReminders, error: selectError } = await admin
      .from("reminders")
      .select(
        `
        id,
        booking_id,
        kind,
        scheduled_for,
        attempts,
        bookings!inner(
          id,
          customer_name,
          customer_phone,
          starts_at,
          status,
          token_hash,
          services!inner(name),
          staff!inner(name)
        )
      `
      )
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50);

    if (selectError) throw new Error(selectError.message);

    if (!dueReminders || dueReminders.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const provider = getMessagingProvider();
    let sent = 0;
    let failed = 0;

    for (const reminder of dueReminders) {
      const booking = reminder.bookings as {
        id: string;
        customer_name: string;
        customer_phone: string;
        starts_at: string;
        status: string;
        services?: { name: string } | null;
        staff?: { name: string } | null;
      } | null;
      if (!booking) continue;

      if (!["confirmed", "pending_payment"].includes(booking.status)) {
        await admin
          .from("reminders")
          .update({ status: "skipped" })
          .eq("id", reminder.id);
        continue;
      }

      const variables = buildTemplateVariables(
        reminder.kind as "confirmation" | "24h" | "2h",
        {
          customer_name: booking.customer_name,
          service_name: booking.services?.name ?? "",
          starts_at: booking.starts_at,
          staff_name: booking.staff?.name ?? "",
          id: booking.id,
        },
        salonName
      );

      const result: SendMessageResult = await provider.sendTemplate(
        booking.customer_phone,
        reminder.kind as TemplateName,
        variables
      );

      if (result.success) {
        await admin
          .from("reminders")
          .update({
            status: "sent",
            provider_message_id: result.providerMessageId,
            sent_at: new Date().toISOString(),
            attempts: reminder.attempts + 1,
          })
          .eq("id", reminder.id);
        sent++;
      } else {
        const newAttempts = reminder.attempts + 1;
        const maxAttempts = 3;

        if (newAttempts >= maxAttempts) {
          await admin
            .from("reminders")
            .update({
              status: "failed",
              attempts: newAttempts,
              last_error: result.error,
            })
            .eq("id", reminder.id);
        } else {
          await admin
            .from("reminders")
            .update({
              attempts: newAttempts,
              last_error: result.error,
            })
            .eq("id", reminder.id);
        }
        failed++;
      }
    }

    return NextResponse.json({ sent, failed, total: dueReminders.length });
  } catch (error) {
    console.error("Send reminders error:", error);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}