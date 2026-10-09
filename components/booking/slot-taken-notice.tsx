"use client";

import { cn } from "@/lib/utils";

interface SlotTakenNoticeProps {
  takenTime: string;
  heldTime: string;
  onDismiss: () => void;
}

export function SlotTakenNotice({ takenTime, heldTime, onDismiss }: SlotTakenNoticeProps) {
  return (
    <div className="flex h-16 items-center gap-3 rounded-[18px] border border-warning bg-warning-bg p-4">
      <svg className="flex h-5 w-5 shrink-0 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
      <p className="text-sm text-foreground">
        That {takenTime} slot just got taken — we held {heldTime} for you instead.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-foreground hover:bg-warning/20 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
      </button>
    </div>
  );
}