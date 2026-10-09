"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface BookingSummaryProps {
  serviceName: string;
  dateDisplay: string;
  timeDisplay: string;
  staffName: string;
  depositAmount: string;
  balanceAmount: string;
  className?: string;
}

const INFO_TEXT = "Free cancellation up to 24h before. Deposit refunded as salon credit. No-shows forfeit deposit.";

export function BookingSummary({
  serviceName,
  dateDisplay,
  timeDisplay,
  staffName,
  depositAmount,
  balanceAmount,
  className,
}: BookingSummaryProps) {
  return (
    <div className={cn("rounded-[24px] border bg-card p-5", className)}>
      <h3 className="font-serif text-lg font-semibold text-foreground">Booking summary</h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Service</span>
          <span className="text-sm font-medium text-foreground text-right">{serviceName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">When</span>
          <span className="text-sm font-medium text-foreground text-right">
            {dateDisplay} • {timeDisplay}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Stylist</span>
          <span className="text-sm font-medium text-foreground text-right">{staffName}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Deposit due now</span>
          <span className="text-lg font-semibold text-primary">{depositAmount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance at salon</span>
          <span className="text-sm font-medium text-foreground">{balanceAmount}</span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-border bg-blush p-4">
        <Info className="flex h-5 w-5 shrink-0 mt-0.5 text-foreground" />
        <p className="text-sm text-foreground">{INFO_TEXT}</p>
      </div>
    </div>
  );
}