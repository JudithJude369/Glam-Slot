"use client";

import { cn } from "cn";
import type { Database } from "@/lib/database.types";
import { formatStaffRowText, formatStaffHoursText } from "@/lib/format";

type Staff = Database["public"]["Tables"]["staff"]["Row"];
type StaffHours = {
  weekday: number;
  is_closed: boolean;
  opens_at: string;
  closes_at: string;
};

function StaffPanel({
  staff,
  staffHours,
}: {
  staff: Staff[];
  staffHours: StaffHours[][];
}) {
  const summary =
    staffHours.length > 0 ? formatStaffHoursText(staffHours[0] ?? []) : "";

  return (
    <div className="rounded-[24px] border border-border bg-card p-5">
      <h3 className="text-[16px] font-medium text-foreground">
        Staff & hours {summary ? `• ${summary}` : ""}
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        {staff.map((s, idx) => {
          const hours = staffHours[idx] ?? [];
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center justify-between rounded-[16px] border border-border px-3 py-2",
                idx < staff.length - 1 && "mb-2",
              )}
            >
              <span className="text-[16px] text-foreground">
                {formatStaffRowText({ name: s.name, role: s.role, hours })}
              </span>
              <span className="text-[14px] text-muted-foreground">
                {s.is_active ? (
                  <span className="text-success">Active</span>
                ) : (
                  "Inactive"
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { StaffPanel };