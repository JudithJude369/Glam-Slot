"use client";

import { cn } from "@/lib/utils";

interface StaffChipProps {
  staff: { id: string; name: string } | { id: "any"; name: "Any" };
  isSelected: boolean;
  onSelect: () => void;
}

export function StaffChip({ staff, isSelected, onSelect }: StaffChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex h-11 w-full items-center justify-center rounded-[16px] text-base font-medium transition-all",
        isSelected
          ? "bg-blush border-1.5 border-primary"
          : "bg-card border border-border hover:bg-muted"
      )}
    >
      {staff.name}
    </button>
  );
}

interface StaffSelectorProps {
  staffList: { id: string; name: string }[];
  selectedStaffId: string | "any";
  onStaffChange: (staffId: string | "any") => void;
}

export function StaffSelector({ staffList, selectedStaffId, onStaffChange }: StaffSelectorProps) {
  return (
    <div>
      <label className="mb-3 block text-base font-medium text-foreground">
        Stylist (optional)
      </label>
      <div className="grid grid-cols-3 gap-2">
        <StaffChip
          staff={{ id: "any", name: "Any" }}
          isSelected={selectedStaffId === "any"}
          onSelect={() => onStaffChange("any")}
        />
        {staffList.map((staff) => (
          <StaffChip
            key={staff.id}
            staff={staff}
            isSelected={selectedStaffId === staff.id}
            onSelect={() => onStaffChange(staff.id)}
          />
        ))}
      </div>
    </div>
  );
}