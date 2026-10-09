import { format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const SALON_TIMEZONE = "Africa/Lagos";

/** The calendar date (YYYY-MM-DD) that it is right now in the salon. */
export function lagosTodayKey(): string {
  return format(toZonedTime(new Date(), SALON_TIMEZONE), "yyyy-MM-dd");
}

/** The weekday (0 = Sunday) of a calendar date, in the salon. */
export function weekdayOfDateKey(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00Z`).getUTCDay();
}

/** The UTC instant the Lagos day starts on. */
export function startOfLagosDay(dateKey: string): Date {
  return fromZonedTime(`${dateKey}T00:00:00`, SALON_TIMEZONE);
}

/** The UTC instant the Lagos day ends on. */
export function endOfLagosDay(dateKey: string): Date {
  return fromZonedTime(`${dateKey}T23:59:59.999`, SALON_TIMEZONE);
}

/** The UTC instant a wall-clock time in the salon refers to. */
export function salonTimeToUtc(dateKey: string, time: string): Date {
  return fromZonedTime(`${dateKey}T${time}:00`, SALON_TIMEZONE);
}

/** "Saturday, Oct 11" for a calendar date. */
export function formatDayTitle(dateKey: string): string {
  const zoned = toZonedTime(startOfLagosDay(dateKey), SALON_TIMEZONE);
  return format(zoned, "EEEE, MMM d");
}

/** "Sat, Oct 11" for a calendar date. */
export function formatDayTitleShort(dateKey: string): string {
  const zoned = toZonedTime(startOfLagosDay(dateKey), SALON_TIMEZONE);
  return format(zoned, "EEE, MMM d");
}

/** ISO week number, so "Week 41" stays stable across locales. */
export function isoWeekOfDateKey(dateKey: string): number {
  const zoned = toZonedTime(startOfLagosDay(dateKey), SALON_TIMEZONE);
  return Number(format(zoned, "II"));
}

/** Card times: "10:30" with no AM/PM, in the salon timezone. */
export function formatCardTime(iso: string): string {
  return format(toZonedTime(new Date(iso), SALON_TIMEZONE), "h:mm");
}

/** Hour column labels: "9 AM", "10 AM", ... */
export function formatHourLabel(hour: number): string {
  const ampm = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${ampm}`;
}

/** Minutes since midnight for a "HH:MM" wall-clock time. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
