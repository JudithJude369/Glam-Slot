import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { CalendarClient } from "./calendar-client";
import {
  endOfLagosDay,
  formatDayTitle,
  formatDayTitleShort,
  formatHourLabel,
  isoWeekOfDateKey,
  lagosTodayKey,
  startOfLagosDay,
  timeToMinutes,
  weekdayOfDateKey,
} from "@/lib/dates";

const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

export interface CalendarStaff {
  id: string;
  name: string;
}

export interface CalendarBooking {
  id: string;
  customer_name: string;
  customer_phone: string;
  starts_at: string;
  ends_at: string;
  status: "pending_payment" | "confirmed";
  staff_id: string;
  deposit_kobo: number;
  paid_kobo: number;
  staff_name: string;
  service_name: string;
}

export interface CalendarDayStats {
  bookingCount: number;
  depositsKobo: number;
  pendingCount: number;
}

interface StaffHoursRow {
  staff_id: string;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

async function getDayData(dateKey: string) {
  const admin = createAdminClient();
  const weekday = weekdayOfDateKey(dateKey);
  const dayStart = startOfLagosDay(dateKey).toISOString();
  const dayEnd = endOfLagosDay(dateKey).toISOString();

  const [
    { data: staffRows, error: staffError },
    { data: hoursRows, error: hoursError },
    { data: serviceRows, error: serviceError },
    { data: linkRows, error: linkError },
    { data: bookingRows, error: bookingError },
  ] = await Promise.all([
    admin
      .from("staff")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    admin
      .from("staff_hours")
      .select("staff_id, opens_at, closes_at, is_closed")
      .eq("weekday", weekday),
    admin
      .from("services")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    admin.from("staff_services").select("staff_id, service_id"),
    admin
      .from("bookings")
      .select(
        `
        id, customer_name, customer_phone, starts_at, ends_at, status,
        staff_id, deposit_kobo,
        staff!inner(name),
        services!inner(name, deposit_kobo)
        `
      )
      .gte("starts_at", dayStart)
      .lt("starts_at", dayEnd)
      .in("status", ["pending_payment", "confirmed"])
      .order("starts_at", { ascending: true }),
  ]);

  if (staffError) throw new Error(staffError.message);
  if (hoursError) throw new Error(hoursError.message);
  if (serviceError) throw new Error(serviceError.message);
  if (linkError) throw new Error(linkError.message);
  if (bookingError) throw new Error(bookingError.message);

  const staff: CalendarStaff[] = (staffRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));

  // Stylists actually working the viewed day.
  const workingHours = (hoursRows ?? []).filter(
    (row: StaffHoursRow) => !row.is_closed
  );
  const onShiftIds = new Set(workingHours.map((row) => row.staff_id));
  const onShiftCount = staff.filter((member) => onShiftIds.has(member.id)).length;

  // Hour labels span the day's opening hours, one per hour.
  const openMinutes = workingHours.map((row: StaffHoursRow) =>
    timeToMinutes(row.opens_at)
  );
  const closeMinutes = workingHours.map((row: StaffHoursRow) =>
    timeToMinutes(row.closes_at)
  );
  const hourLabels: string[] = [];
  if (openMinutes.length > 0) {
    const firstHour = Math.floor(Math.min(...openMinutes) / 60);
    const lastHour = Math.floor((Math.max(...closeMinutes) - 1) / 60);
    for (let hour = firstHour; hour <= lastHour; hour++) {
      hourLabels.push(formatHourLabel(hour));
    }
  }

  const bookingIds = (bookingRows ?? []).map((row) => row.id);
  const { data: paymentRows } =
    bookingIds.length > 0
      ? await admin
          .from("payments")
          .select("booking_id, amount_kobo")
          .in("booking_id", bookingIds)
          .eq("status", "succeeded")
      : { data: [] };

  const paidByBooking = new Map<string, number>();
  for (const payment of paymentRows ?? []) {
    paidByBooking.set(
      payment.booking_id,
      (paidByBooking.get(payment.booking_id) ?? 0) + payment.amount_kobo
    );
  }

  const bookings: CalendarBooking[] = (bookingRows ?? []).map((row) => ({
    id: row.id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    // The query above only asks for these two statuses.
    status: row.status === "confirmed" ? ("confirmed" as const) : ("pending_payment" as const),
    staff_id: row.staff_id,
    deposit_kobo: row.deposit_kobo,
    paid_kobo: paidByBooking.get(row.id) ?? 0,
    staff_name: (row.staff as { name: string } | null)?.name ?? "",
    service_name: (row.services as { name: string } | null)?.name ?? "",
  }));

  const depositsKobo = [...paidByBooking.values()].reduce((sum, kobo) => sum + kobo, 0);
  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending_payment"
  ).length;

  const serviceStaffMap: Record<string, string[]> = {};
  const staffServiceMap: Record<string, string[]> = {};
  for (const link of linkRows ?? []) {
    serviceStaffMap[link.service_id] = [
      ...(serviceStaffMap[link.service_id] ?? []),
      link.staff_id,
    ];
    staffServiceMap[link.staff_id] = [
      ...(staffServiceMap[link.staff_id] ?? []),
      link.service_id,
    ];
  }

  const todayKey = lagosTodayKey();

  return {
    dateKey,
    todayKey,
    isToday: dateKey === todayKey,
    title: formatDayTitle(dateKey),
    titleShort: formatDayTitleShort(dateKey),
    weekLabel: `Week ${isoWeekOfDateKey(dateKey)} • ${onShiftCount} stylists on shift`,
    bookings,
    staff,
    onShiftCount,
    hourLabels,
    closedDay: onShiftCount === 0,
    dayStats: {
      bookingCount: bookings.length,
      depositsKobo,
      pendingCount,
    },
    serviceStaffMap,
    staffServiceMap,
    services: (serviceRows ?? []).map((row) => ({ id: row.id, name: row.name })),
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const parsed = dateParamSchema.safeParse(params.date);
  const dateKey = parsed.success ? parsed.data : lagosTodayKey();

  const data = await getDayData(dateKey);

  // The client resets its selection and dialogs whenever the day changes.
  return <CalendarClient key={data.dateKey} {...data} />;
}
