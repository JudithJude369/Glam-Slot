"use server";

import { z } from "zod";
import crypto from "crypto";
import { getOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { normalizeNigerianPhone } from "@/lib/validation/booking";
import {
  salonTimeToUtc,
  timeToMinutes,
  weekdayOfDateKey,
} from "@/lib/dates";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Pick a time");
const nameSchema = z.string().trim().min(1, "Name is required").max(100);
const phoneSchema = z
  .string()
  .trim()
  .min(1, "WhatsApp number is required")
  .max(20);

const createOwnerBookingSchema = z.object({
  serviceId: z.string().uuid("Pick a service"),
  staffId: z.string().uuid("Pick a stylist"),
  date: dateSchema,
  startTime: timeSchema,
  customerName: nameSchema,
  customerPhone: phoneSchema,
});

const bookingIdSchema = z.object({
  bookingId: z.string().uuid("Unknown booking"),
});

const rescheduleOwnerBookingSchema = z.object({
  bookingId: z.string().uuid("Unknown booking"),
  date: dateSchema,
  startTime: timeSchema,
});

export type OwnerActionResult =
  | { ok: true; bookingId?: string; message?: string }
  | { ok: false; error: string };

function isNigerianPhone(normalized: string): boolean {
  return /^\+234[0-9]{7,14}$/.test(normalized);
}

/**
 * The slot must sit inside one of the stylist's open rows for that weekday.
 * staff_hours allows more than one row per weekday (a lunch break is a second
 * row), so a slot is valid if any open row contains it.
 */
async function slotFitsStaffHours(
  supabase: Awaited<ReturnType<typeof createClient>>,
  staffId: string,
  dateKey: string,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  const weekday = weekdayOfDateKey(dateKey);
  const { data: hoursRows, error } = await supabase
    .from("staff_hours")
    .select("opens_at, closes_at, is_closed")
    .eq("staff_id", staffId)
    .eq("weekday", weekday);

  if (error || !hoursRows) return false;

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;

  return hoursRows.some(
    (row) =>
      !row.is_closed &&
      startMinutes >= timeToMinutes(row.opens_at) &&
      endMinutes <= timeToMinutes(row.closes_at)
  );
}

async function queueReminders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookingId: string,
  startsAt: Date
): Promise<void> {
  const { data: reminderSettings, error: settingsError } = await supabase
    .from("reminder_settings")
    .select("*")
    .maybeSingle();

  if (settingsError || !reminderSettings) {
    console.error("Reminder settings not found when queueing reminders");
    return;
  }

  const confirmationOffset = reminderSettings.confirmation_enabled
    ? reminderSettings.confirmation_offset_minutes
    : 0;

  const { error: reminderError } = await supabase.from("reminders").insert([
    {
      booking_id: bookingId,
      kind: "confirmation",
      scheduled_for: new Date(Date.now() + confirmationOffset * 60000).toISOString(),
      status: "pending",
    },
    {
      booking_id: bookingId,
      kind: "24h",
      scheduled_for: new Date(startsAt.getTime() - 24 * 60 * 60000).toISOString(),
      status: "pending",
    },
    {
      booking_id: bookingId,
      kind: "2h",
      scheduled_for: new Date(startsAt.getTime() - 2 * 60 * 60000).toISOString(),
      status: "pending",
    },
  ]);

  if (reminderError) {
    console.error("Failed to create reminders for owner booking:", reminderError);
  }
}

/** Owner walk-in: no deposit, no hold, confirmed immediately. */
export async function createOwnerBooking(
  input: unknown
): Promise<OwnerActionResult> {
  const owner = await getOwner();
  if (!owner.ok) {
    return { ok: false, error: "Not authorised" };
  }

  const validated = createOwnerBookingSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.issues[0]?.message ?? "Invalid input" };
  }

  const { serviceId, staffId, date, startTime, customerName, customerPhone } =
    validated.data;

  const normalizedPhone = normalizeNigerianPhone(customerPhone);
  if (!isNigerianPhone(normalizedPhone)) {
    return {
      ok: false,
      error: "Enter a Nigerian WhatsApp number (0803... or +234803...).",
    };
  }

  const supabase = await createClient();

  const [{ data: service, error: serviceError }, { data: staff, error: staffError }] =
    await Promise.all([
      supabase.from("services").select("duration_minutes, is_active").eq("id", serviceId).maybeSingle(),
      supabase.from("staff").select("is_active").eq("id", staffId).maybeSingle(),
    ]);

  if (serviceError) throw new Error(serviceError.message);
  if (staffError) throw new Error(staffError.message);
  if (!service || !staff) {
    return { ok: false, error: "Service or stylist not found" };
  }
  if (!service.is_active) {
    return { ok: false, error: "This service is not available" };
  }
  if (!staff.is_active) {
    return { ok: false, error: "This stylist is not active" };
  }

  const fitsHours = await slotFitsStaffHours(
    supabase,
    staffId,
    date,
    startTime,
    service.duration_minutes
  );
  if (!fitsHours) {
    return {
      ok: false,
      error: "That time is outside this stylist's hours on the chosen day.",
    };
  }

  const startsAt = salonTimeToUtc(date, startTime);
  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60000);
  const tokenHash = crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      service_id: serviceId,
      staff_id: staffId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "confirmed",
      customer_name: customerName,
      customer_phone: normalizedPhone,
      deposit_kobo: 0,
      token_hash: tokenHash,
      source: "owner",
    })
    .select("id")
    .single();

  if (bookingError) {
    if (bookingError.code === "23P01") {
      return { ok: false, error: "That slot is already taken. Pick another time." };
    }
    throw new Error(bookingError.message);
  }

  await queueReminders(supabase, booking.id, startsAt);

  revalidatePath("/dashboard", "page");
  return { ok: true, bookingId: booking.id };
}

/** Owner cancellation: any time, deposit stays with the customer as salon credit. */
export async function cancelOwnerBooking(
  input: unknown
): Promise<OwnerActionResult> {
  const owner = await getOwner();
  if (!owner.ok) {
    return { ok: false, error: "Not authorised" };
  }

  const validated = bookingIdSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", validated.data.bookingId)
    .maybeSingle();

  if (bookingError) throw new Error(bookingError.message);
  if (!booking) {
    return { ok: false, error: "Booking not found" };
  }
  if (booking.status === "cancelled") {
    return { ok: false, error: "This booking is already cancelled" };
  }
  if (!["pending_payment", "confirmed"].includes(booking.status)) {
    return { ok: false, error: "Only a pending or confirmed booking can be cancelled" };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", validated.data.bookingId);

  if (updateError) throw new Error(updateError.message);

  await supabase
    .from("reminders")
    .update({ status: "skipped" })
    .eq("booking_id", validated.data.bookingId)
    .eq("status", "pending");

  revalidatePath("/dashboard", "page");
  return {
    ok: true,
    message: "Booking cancelled. The deposit stays with the customer as salon credit.",
  };
}

/** Owner no-show: only once the appointment has started. Deposit is forfeited. */
export async function markNoShow(
  input: unknown
): Promise<OwnerActionResult> {
  const owner = await getOwner();
  if (!owner.ok) {
    return { ok: false, error: "Not authorised" };
  }

  const validated = bookingIdSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("starts_at, status")
    .eq("id", validated.data.bookingId)
    .maybeSingle();

  if (bookingError) throw new Error(bookingError.message);
  if (!booking) {
    return { ok: false, error: "Booking not found" };
  }
  if (booking.status !== "confirmed") {
    return { ok: false, error: "Only a confirmed booking can be marked as a no-show" };
  }
  if (new Date(booking.starts_at).getTime() > Date.now()) {
    return {
      ok: false,
      error: "A no-show can only be marked after the appointment starts.",
    };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "no_show" })
    .eq("id", validated.data.bookingId);

  if (updateError) throw new Error(updateError.message);

  await supabase
    .from("reminders")
    .update({ status: "skipped" })
    .eq("booking_id", validated.data.bookingId)
    .eq("status", "pending");

  revalidatePath("/dashboard", "page");
  return { ok: true, message: "Marked as a no-show. The deposit is forfeited." };
}

/** Owner reschedule: any time, to any slot inside the stylist's hours. */
export async function rescheduleOwnerBooking(
  input: unknown
): Promise<OwnerActionResult> {
  const owner = await getOwner();
  if (!owner.ok) {
    return { ok: false, error: "Not authorised" };
  }

  const validated = rescheduleOwnerBookingSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.issues[0]?.message ?? "Invalid input" };
  }

  const { bookingId, date, startTime } = validated.data;

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("status, staff_id, services!inner(duration_minutes)")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) throw new Error(bookingError.message);
  if (!booking) {
    return { ok: false, error: "Booking not found" };
  }
  if (!["pending_payment", "confirmed"].includes(booking.status)) {
    return { ok: false, error: "Only a pending or confirmed booking can be rescheduled" };
  }

  const duration = booking.services?.duration_minutes;
  if (!duration) {
    return { ok: false, error: "Service not found" };
  }

  const fitsHours = await slotFitsStaffHours(
    supabase,
    booking.staff_id,
    date,
    startTime,
    duration
  );
  if (!fitsHours) {
    return {
      ok: false,
      error: "That time is outside this stylist's hours on the chosen day.",
    };
  }

  const startsAt = salonTimeToUtc(date, startTime);
  const endsAt = new Date(startsAt.getTime() + duration * 60000);

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() })
    .eq("id", bookingId);

  if (updateError) {
    if (updateError.code === "23P01") {
      return { ok: false, error: "That slot is already taken. Pick another time." };
    }
    throw new Error(updateError.message);
  }

  // Rescheduling recalculates the reminder times for the pending reminders.
  await supabase
    .from("reminders")
    .update({ scheduled_for: new Date(startsAt.getTime() - 24 * 60 * 60000).toISOString() })
    .eq("booking_id", bookingId)
    .eq("kind", "24h")
    .eq("status", "pending");

  await supabase
    .from("reminders")
    .update({ scheduled_for: new Date(startsAt.getTime() - 2 * 60 * 60000).toISOString() })
    .eq("booking_id", bookingId)
    .eq("kind", "2h")
    .eq("status", "pending");

  revalidatePath("/dashboard", "page");
  return { ok: true, message: "Booking moved to the new time." };
}
