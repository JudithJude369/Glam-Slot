const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MON_TO_SUN = [1, 2, 3, 4, 5, 6, 0];

type StaffHours = {
  weekday: number;
  is_closed: boolean;
  opens_at: string;
  closes_at: string;
};

function hoursKey(h: StaffHours): string {
  return `${h.opens_at.slice(0, 5)}–${h.closes_at.slice(0, 5)}`;
}

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

export function formatStaffHoursText(hours: StaffHours[]): string {
  const openDays = hours.filter((h) => !h.is_closed);
  if (openDays.length === 0) return "Closed all week";

  const byDay = new Map<number, StaffHours>();
  for (const h of openDays) byDay.set(h.weekday, h);

  const sorted = MON_TO_SUN.filter((d) => byDay.has(d)).map((d) => byDay.get(d)!);

  const groups: { start: number; end: number; key: string }[] = [];
  let current: typeof groups[0] | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const h = sorted[i];
    const key = hoursKey(h);
    const prev = sorted[i - 1];
    const consecutive = prev && (h.weekday === (prev.weekday + 1) % 7 || (prev.weekday === 6 && h.weekday === 0));
    if (current && consecutive && current.key === key) {
      current.end = h.weekday;
    } else {
      current = { start: h.weekday, end: h.weekday, key };
      groups.push(current);
    }
  }

  return groups
    .map((g) => {
      if (g.start === g.end) {
        return `${WEEKDAYS[g.start]} ${g.key}`;
      }
      return `${WEEKDAYS[g.start]}–${WEEKDAYS[g.end]} ${g.key}`;
    })
    .join(", ");
}

