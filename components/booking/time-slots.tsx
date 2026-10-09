"use client";

import { cn } from "@/lib/utils";

interface TimeSlot {
  start: string;
  end: string;
  startDisplay: string;
  staffId: string;
  staffName: string;
  isAvailable: boolean;
}

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slotStart: string) => void;
  columns?: 3 | 4;
  showTakenNotice?: boolean;
  takenSlotTime?: string;
  heldSlotTime?: string;
}

export function TimeSlots({
  slots,
  selectedSlot,
  onSlotSelect,
  columns = 3,
  showTakenNotice = false,
  takenSlotTime,
  heldSlotTime,
}: TimeSlotsProps) {
  const availableSlots = slots.filter((s) => s.isAvailable);
  const takenSlots = slots.filter((s) => !s.isAvailable);

  return (
    <div className="space-y-3">
      <label className="block text-base font-medium text-foreground">
        Available slots{slots.length > 0 ? ` — {slots[0]?.startDisplay.split(" ").slice(0, 3).join(" ")}` : ""}
      </label>
      <div className={cn("grid gap-2", columns === 4 ? "grid-cols-4" : "grid-cols-3")}>
        {availableSlots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            onClick={() => onSlotSelect(slot.start)}
            className={cn(
              "flex h-11 w-full items-center justify-center rounded-[16px] text-base font-medium transition-all",
              slot.start === selectedSlot
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted"
            )}
            aria-selected={slot.start === selectedSlot}
          >
            {slot.startDisplay}
          </button>
        ))}
        {takenSlots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            disabled
            className="flex h-11 w-full items-center justify-center rounded-[16px] bg-muted text-muted-foreground line-through cursor-not-allowed"
            aria-disabled={true}
          >
            {slot.startDisplay}
          </button>
        ))}
      </div>

      {showTakenNotice && takenSlotTime && heldSlotTime && (
        <div className="flex h-16 items-center gap-3 rounded-[18px] border border-warning bg-warning-bg p-4">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center text-foreground">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
          <p className="text-sm text-foreground">
            That {takenSlotTime} slot just got taken — we held {heldSlotTime} for you instead.
          </p>
        </div>
      )}
    </div>
  );
}