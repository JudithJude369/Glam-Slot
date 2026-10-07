const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type StaffHours = {
  weekday: number;
  is_closed: boolean;
  opens_at: string;
  closes_at: string;
};

export function formatStaffRowText(staff: {
  name: string;
  role: string;
  hours?: StaffHours[] | null;
}) {
  const closedDays = (staff.hours ?? []).filter((h) => h.is_closed);
  const suffix =
    closedDays.length > 0
      ? ` (${closedDays.map((h) => WEEKDAYS[h.weekday]).join(", ")})`
      : "";
  return `${staff.name} • ${staff.role}${suffix}`;
}

export function formatStaffStatusText(hours: StaffHours[] | null): string {
  const closedDays = (hours ?? []).filter((h) => h.is_closed);
  if (closedDays.length === 0) return "Active";
  if (closedDays.length === 1) return `Day off ${WEEKDAYS[closedDays[0].weekday]}`;
  return `Day off ${closedDays.map((h) => WEEKDAYS[h.weekday]).join(", ")}`;
}

export function formatStaffHoursText(hours: StaffHours[]) {
  const openDays = hours.filter((h) => !h.is_closed);
  if (openDays.length === 0) return "Closed all week";
  const first = openDays[0];
  const last = openDays[openDays.length - 1];
  const sameDay = first.weekday === last.weekday;
  if (sameDay) {
    return `${WEEKDAYS[first.weekday]} ${first.opens_at.slice(0, 5)}–${last.closes_at.slice(0, 5)}`;
  }
  return `${WEEKDAYS[first.weekday]}–${WEEKDAYS[last.weekday]} ${first.opens_at.slice(0, 5)}–${last.closes_at.slice(0, 5)}`;
}

