"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    duration: string;
    price: string;
    deposit: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex h-[90px] w-full flex-col items-start justify-between rounded-[22px] border p-5 transition-all",
        isSelected
          ? "border-2 border-primary shadow-[0_0_0_4px_rgba(184,30,79,0.15)]"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-foreground truncate">
            {service.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {service.duration} • {service.deposit} deposit
          </p>
        </div>
        {isSelected ? (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>
        ) : (
          <span className="flex h-9 shrink-0 items-center justify-center rounded-[15px] border border-border bg-card px-3 text-sm font-medium text-foreground">
            Select
          </span>
        )}
      </div>
    </button>
  );
}