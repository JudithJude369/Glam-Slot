import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";
import { formatTime12, todayInLagos } from "@/lib/money";

type SalonSettings = Database["public"]["Tables"]["salon_settings"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Staff = Database["public"]["Tables"]["staff"]["Row"];
type StaffHours = Database["public"]["Tables"]["staff_hours"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export type TimeSlot = {
  start: string;
  end: string;
  startDisplay: string;
  staffId: string;
  staffName: string;
  isAvailable: boolean;
};

export type AvailabilityResult = {
  slots: TimeSlot[];
  date: string;
  serviceDuration: number;
  staffId?: string;
};

async function getSalonSettings(): Promise<SalonSettings | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("salon_settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function getService(serviceId: string): Promise<Service | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("services").select("*").eq("id", serviceId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function getActiveStaff(): Promise<Staff[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("staff")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function getStaffHours(staffId: string): Promise<StaffHours[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("staff_hours")
    .select("*")
    .eq("staff_id", staffId)
    .order("weekday", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function getBookingsForDateRange(
  startDate: string,
  endDate: string,
  staffId?: string
): Promise<Booking[]> {
  const admin = createAdminClient();
  let query = admin
    .from("bookings")
    .select("*")
    .in("status", ["pending_payment", "confirmed"])
    .gte("starts_at", startDate)
    .lt("starts_at", endDate);

  if (staffId) {
    query = query.eq("staff_id", staffId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

function getWeekday(date: Date): number {
  return date.getDay();
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function isSlotInPast(start: Date, minNoticeMinutes: number): boolean {
  const now = new Date();
  const earliestAllowed = addMinutes(now, minNoticeMinutes);
  return start < earliestAllowed;
}

function generateSlotsForStaff(
  date: Date,
  staff: Staff,
  staffHours: StaffHours[],
  serviceDuration: number,
  slotInterval: number,
  bookings: Booking[],
  minNoticeMinutes: number,
  timezone: string
): TimeSlot[] {
  const weekday = getWeekday(date);
  const dayHours = staffHours.find((h) => h.weekday === weekday);

  if (!dayHours || dayHours.is_closed) {
    return [];
  }

  const opensAt = timeToMinutes(dayHours.opens_at);
  const closesAt = timeToMinutes(dayHours.closes_at);

  if (opensAt >= closesAt) {
    return [];
  }

  const slots: TimeSlot[] = [];
  let currentMinutes = opensAt;

  while (currentMinutes + serviceDuration <= closesAt) {
    const slotStart = new Date(date);
    slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

    const slotEnd = addMinutes(slotStart, serviceDuration);

    const isPast = isSlotInPast(slotStart, minNoticeMinutes);

    const hasConflict = bookings.some((booking) => {
      const bookingStart = new Date(booking.starts_at);
      const bookingEnd = new Date(booking.ends_at);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });

    const isAvailable = !isPast && !hasConflict;

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      startDisplay: formatTime12(slotStart.toISOString()),
      staffId: staff.id,
      staffName: staff.name,
      isAvailable,
    });

    currentMinutes += slotInterval;
  }

  return slots;
}

export async function getAvailableSlots(
  serviceId: string,
  date: string,
  staffId?: string
): Promise<AvailabilityResult> {
  const [salonSettings, service] = await Promise.all([
    getSalonSettings(),
    getService(serviceId),
  ]);

  if (!salonSettings || !service) {
    throw new Error("Salon settings or service not found");
  }

  const slotInterval = salonSettings.slot_interval_minutes;
  const bookingWindowDays = salonSettings.booking_window_days;
  const minNoticeHours = salonSettings.min_notice_hours;
  const minNoticeMinutes = minNoticeHours * 60;
  const timezone = salonSettings.timezone;

  const serviceDuration = service.duration_minutes;

  const targetDate = new Date(`${date}T00:00:00`);
  const today = new Date(todayInLagos());
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + bookingWindowDays);

  if (targetDate < today || targetDate > maxDate) {
    return { slots: [], date, serviceDuration, staffId };
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const startDateISO = startOfDay.toISOString();
  const endDateISO = endOfDay.toISOString();

  let staffList: Staff[];
  if (staffId) {
    const admin = createAdminClient();
    const { data: staff } = await admin.from("staff").select("*").eq("id", staffId).maybeSingle();
    staffList = staff ? [staff] : [];
  } else {
    staffList = await getActiveStaff();
  }

  const bookings = await getBookingsForDateRange(startDateISO, endDateISO, staffId);

  const allSlots: TimeSlot[] = [];

  for (const staff of staffList) {
    const hours = await getStaffHours(staff.id);
    const slots = generateSlotsForStaff(
      targetDate,
      staff,
      hours,
      serviceDuration,
      slotInterval,
      bookings,
      minNoticeMinutes,
      timezone
    );
    allSlots.push(...slots);
  }

  allSlots.sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
    return a.start.localeCompare(b.start);
  });

  return { slots: allSlots, date, serviceDuration, staffId };
}

export async function getAvailableStaffForSlot(
  serviceId: string,
  date: string,
  startTime: string
): Promise<{ staffId: string; staffName: string }[]> {
  const result = await getAvailableSlots(serviceId, date);
  const targetStart = `${date}T${startTime}:00.000Z`;

  return result.slots
    .filter((slot) => slot.start === targetStart && slot.isAvailable)
    .map((slot) => ({ staffId: slot.staffId, staffName: slot.staffName }));
}

export async function pickAnyAvailableStaff(
  serviceId: string,
  date: string,
  startTime: string
): Promise<{ staffId: string; staffName: string } | null> {
  const available = await getAvailableStaffForSlot(serviceId, date, startTime);
  return available[0] ?? null;
}