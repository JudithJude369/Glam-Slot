"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate: string;
  maxDate: string;
  staffName?: string;
  className?: string;
  showWeekdays?: boolean;
  showArrows?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function DatePicker({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  staffName,
  className,
  showWeekdays = true,
  showArrows = true,
}: DatePickerProps) {
  const [viewDate, setViewDate] = useState(() => new Date(`${selectedDate}T00:00:00`));
  const weekDates = getWeekDates(viewDate);

  const isDateDisabled = (date: Date) => {
    const key = formatDateKey(date);
    return key < minDate || key > maxDate;
  };

  const goToWeek = (direction: -1 | 1) => {
    const newView = new Date(viewDate);
    newView.setDate(viewDate.getDate() + direction * 7);
    setViewDate(newView);
  };

  return (
    <div className={cn("rounded-[24px] border bg-card p-5", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {showArrows ? formatMonthYear(viewDate) : `${formatMonthYear(viewDate)} ${staffName ? `• with ${staffName}` : ""}`}
        </h3>
        {showArrows && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToWeek(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-border bg-card text-foreground hover:bg-muted transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goToWeek(1)}
              className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-border bg-card text-foreground hover:bg-muted transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {showWeekdays && (
        <div className="mt-4 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-7 gap-[5px]">
        {weekDates.map((date) => {
          const key = formatDateKey(date);
          const isSelected = key === selectedDate;
          const isDisabled = isDateDisabled(date);
          const dayNumber = date.getDate();

          return (
            <button
              key={key}
              type="button"
              onClick={() => !isDisabled && onDateChange(key)}
              disabled={isDisabled}
              className={cn(
                "flex h-11 w-full items-center justify-center rounded-[14px] text-base font-medium transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isDisabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "bg-card text-foreground border border-border hover:bg-muted"
              )}
              aria-selected={isSelected}
              aria-disabled={isDisabled}
            >
              {dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}