import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots, pickAnyAvailableStaff } from "@/lib/availability";
import { normalizeNigerianPhone } from "@/lib/validation/booking";

const createBookingSchema = z.object({
  serviceId: z.string().uuid("Invalid service"),
  staffId: z.string().uuid("Invalid staff").nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  customerName: z.string().trim().min(1, "Name is required").max(100),
  customerPhone: z.string().trim().min(1, "WhatsApp number is required").max(20),
  wantsReminders: z.boolean().default(true),
});

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createBookingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { serviceId, staffId, date, startTime, customerName, customerPhone, wantsReminders } = validated.data;

    const normalizedPhone = normalizeNigerianPhone(customerPhone);

    const admin = createAdminClient();

    const { data: service, error: serviceError } = await admin
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();

    if (serviceError) throw new Error(serviceError.message);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const [{ data: salonSettings, error: settingsError }, { data: reminderSettings, error: reminderSettingsError }] = await Promise.all([
      admin.from("salon_settings").select("*").maybeSingle(),
      admin.from("reminder_settings").select("*").maybeSingle(),
    ]);

    if (settingsError) throw new Error(settingsError.message);
    if (reminderSettingsError) throw new Error(reminderSettingsError.message);
    if (!salonSettings || !reminderSettings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 500 });
    }

    let finalStaffId = staffId;

    if (!finalStaffId) {
      const picked = await pickAnyAvailableStaff(serviceId, date, startTime);
      if (!picked) {
        return NextResponse.json({ error: "No staff available for this slot" }, { status: 409 });
      }
      finalStaffId = picked.staffId;
    }

    const startsAt = new Date(`${date}T${startTime}:00.000Z`);
    const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60000);

    const holdMinutes = salonSettings.hold_minutes || 15;
    const holdExpiresAt = new Date(Date.now() + holdMinutes * 60000);

    const token = generateToken();
    const tokenHash = hashToken(token);

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        service_id: serviceId,
        staff_id: finalStaffId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "pending_payment",
        customer_name: customerName,
        customer_phone: normalizedPhone,
        deposit_kobo: service.deposit_kobo,
        token_hash: tokenHash,
        hold_expires_at: holdExpiresAt.toISOString(),
        source: "customer",
      })
      .select()
      .single();

    if (bookingError) {
      if (bookingError.code === "23P01") {
        const result = await getAvailableSlots(serviceId, date, finalStaffId);
        const takenSlot = result.slots.find((s) => s.start === startsAt.toISOString() && !s.isAvailable);
        const heldSlot = result.slots.find((s) => s.isAvailable && s.start > startsAt.toISOString());

        return NextResponse.json(
          {
            error: "That slot was just taken",
            slotTaken: true,
            takenSlotTime: takenSlot ? formatTime12(takenSlot.start) : "the selected time",
            heldSlotTime: heldSlot ? formatTime12(heldSlot.start) : "the next available slot",
            heldSlotStart: heldSlot?.start,
          },
          { status: 409 }
        );
      }
      throw new Error(bookingError.message);
    }

    const confirmationOffset = reminderSettings.confirmation_enabled ? reminderSettings.confirmation_offset_minutes : 0;

    const { error: reminderError } = await admin.from("reminders").insert([
      {
        booking_id: booking.id,
        kind: "confirmation",
        scheduled_for: new Date(Date.now() + confirmationOffset * 60000).toISOString(),
        status: "pending",
      },
      {
        booking_id: booking.id,
        kind: "24h",
        scheduled_for: new Date(startsAt.getTime() - 24 * 60 * 60000).toISOString(),
        status: "pending",
      },
      {
        booking_id: booking.id,
        kind: "2h",
        scheduled_for: new Date(startsAt.getTime() - 2 * 60 * 60000).toISOString(),
        status: "pending",
      },
    ]);

    if (reminderError) {
      console.error("Failed to create reminders:", reminderError);
    }

    return NextResponse.json({ bookingId: booking.id, token });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

function formatTime12(isoString: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  }).format(new Date(isoString));
}